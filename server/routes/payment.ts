import { Router, Request, Response } from "express";
import { db } from "../db";
import { users, tokenTransactions, tokenPackages } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// ---------------------------------------------------------------------------
// M-Pesa credentials are read exclusively from environment variables.
//
// Required env vars:
//   MPESA_CONSUMER_KEY      – Safaricom API consumer key
//   MPESA_CONSUMER_SECRET   – Safaricom API consumer secret
//   MPESA_SHORTCODE         – Business shortcode (PayBill / Till number)
//   MPESA_PASSKEY           – Lipa Na M-Pesa Online passkey
//   MPESA_ENVIRONMENT       – "sandbox" (default) or "production"
//
// These values MUST NOT be stored in the database.  Storing credentials in a
// database column (even an "encrypted" one managed by application code) is
// insecure because it couples the secret lifetime to the database and makes
// rotation harder.  Use a secrets manager or .env file that is never
// committed to version control.
// ---------------------------------------------------------------------------
function getMpesaConfig() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const environment = process.env.MPESA_ENVIRONMENT ?? "sandbox";

  if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
    return null;
  }

  return { consumerKey, consumerSecret, shortcode, passkey, environment };
}

/**
 * Initiate M-Pesa STK Push for token purchase.
 * Called by the mobile app to start the payment flow.
 */
router.post("/initiate-mpesa", async (req: Request, res: Response) => {
  try {
    const { userId, packageId, phoneNumber } = req.body;

    if (!userId || !packageId || !phoneNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify user exists
    const userList = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!userList.length) {
      return res.status(404).json({ error: "User not found" });
    }

    // Load M-Pesa credentials from environment
    const mpesa = getMpesaConfig();
    if (!mpesa) {
      console.error("[Payment] M-Pesa environment variables are not configured");
      return res.status(503).json({ error: "Payment service not configured" });
    }

    // Get token package
    const pkg = await db
      .select()
      .from(tokenPackages)
      .where(eq(tokenPackages.id, packageId))
      .limit(1);
    if (!pkg.length) {
      return res.status(404).json({ error: "Package not found" });
    }

    // Obtain M-Pesa access token
    const accessToken = await getMpesaAccessToken(
      mpesa.consumerKey,
      mpesa.consumerSecret,
      mpesa.environment,
    );
    if (!accessToken) {
      return res.status(502).json({ error: "Failed to authenticate with M-Pesa" });
    }

    // Prepare STK Push payload
    const timestamp = new Date().toISOString().replace(/[:-]/g, "").slice(0, 14);
    const password = Buffer.from(
      `${mpesa.shortcode}${mpesa.passkey}${timestamp}`,
    ).toString("base64");

    const callbackBase =
      process.env.MPESA_CALLBACK_BASE_URL ||
      process.env.EXPO_PUBLIC_API_BASE_URL ||
      "http://localhost:3000";

    const stkPayload = {
      BusinessShortCode: mpesa.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(parseFloat(pkg[0].priceKES || "0")),
      PartyA: phoneNumber.replace(/^0/, "254"),
      PartyB: mpesa.shortcode,
      PhoneNumber: phoneNumber.replace(/^0/, "254"),
      CallBackURL: `${callbackBase}/api/payment/mpesa-callback`,
      AccountReference: userId,
      TransactionDesc: `${pkg[0].tokens} APEX Tokens`,
    };

    const apiBase =
      mpesa.environment === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";

    const stkResponse = await fetch(
      `${apiBase}/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stkPayload),
      },
    );

    const stkData = (await stkResponse.json()) as Record<string, unknown>;

    if (!stkResponse.ok) {
      console.error("[Payment] M-Pesa STK Push error:", stkData);
      return res.status(502).json({ error: "Failed to initiate payment" });
    }

    // Record the pending transaction
    await db.insert(tokenTransactions).values({
      userId,
      type: "purchase",
      amount: pkg[0].tokens || 0,
      reason: "token_purchase",
      mpesaTransactionId: (stkData.CheckoutRequestID as string) || undefined,
      mpesaStatus: "pending",
    });

    return res.json({
      success: true,
      checkoutRequestId: stkData.CheckoutRequestID,
      message: "Payment prompt sent to your phone",
    });
  } catch (error) {
    console.error("[Payment] Initiation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * M-Pesa callback endpoint (webhook).
 * Called by Safaricom after payment completion.
 */
router.post("/mpesa-callback", async (req: Request, res: Response) => {
  try {
    const { Body } = req.body;
    const result = Body?.stkCallback;

    if (!result) {
      return res.status(400).json({ error: "Invalid callback payload" });
    }

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = result;
    const userId = result.AccountReference ?? CallbackMetadata?.Item?.[0]?.Value;

    if (ResultCode === 0) {
      // Payment successful — credit tokens to user
      const transactions = await db
        .select()
        .from(tokenTransactions)
        .where(eq(tokenTransactions.mpesaTransactionId, CheckoutRequestID))
        .limit(1);

      if (transactions.length) {
        const transaction = transactions[0];

        await db
          .update(tokenTransactions)
          .set({ mpesaStatus: "success" })
          .where(eq(tokenTransactions.id, transaction.id));

        const userList = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (userList.length) {
          const user = userList[0];
          await db
            .update(users)
            .set({ tokens: (user.tokens ?? 0) + (transaction.amount || 0) })
            .where(eq(users.id, userId));
        }
      }
    } else {
      // Payment failed — mark transaction accordingly
      await db
        .update(tokenTransactions)
        .set({ mpesaStatus: "failed" })
        .where(eq(tokenTransactions.mpesaTransactionId, CheckoutRequestID));
    }

    return res.json({ ResultCode: 0, ResultDesc: "Callback processed" });
  } catch (error) {
    console.error("[Payment] Callback error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Obtain a short-lived M-Pesa OAuth access token.
 */
async function getMpesaAccessToken(
  consumerKey: string,
  consumerSecret: string,
  environment: string,
): Promise<string | null> {
  try {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const apiBase =
      environment === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";

    const response = await fetch(
      `${apiBase}/oauth/v1/generate?grant_type=client_credentials`,
      {
        method: "GET",
        headers: { Authorization: `Basic ${auth}` },
      },
    );

    const data = (await response.json()) as Record<string, unknown>;
    return (data.access_token as string) || null;
  } catch (error) {
    console.error("[Payment] M-Pesa auth error:", error);
    return null;
  }
}

/**
 * Return all active token packages.
 */
router.get("/packages", async (_req: Request, res: Response) => {
  try {
    const packages = await db
      .select()
      .from(tokenPackages)
      .where(eq(tokenPackages.isActive, true));
    return res.json(packages);
  } catch (error) {
    console.error("[Payment] Packages fetch error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
