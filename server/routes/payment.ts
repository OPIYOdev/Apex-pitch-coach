import { Router, Request, Response } from "express";
import { db } from "../db";
import { users, tokenTransactions, mpesaConfig, tokenPackages } from "../db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

/**
 * Initiate M-Pesa STK Push for token purchase
 * This endpoint is called by the mobile app to start the payment flow
 */
router.post("/initiate-mpesa", async (req: Request, res: Response) => {
  try {
    const { userId, packageId, phoneNumber } = req.body;

    if (!userId || !packageId || !phoneNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get user
    const userList = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!userList.length) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get founder's M-Pesa configuration
    const config = await db
      .select()
      .from(mpesaConfig)
      .where(eq(mpesaConfig.isConfigured, true))
      .limit(1);

    if (!config.length) {
      return res.status(500).json({ error: "M-Pesa not configured by founder" });
    }

    // Get token package
    const pkg = await db.select().from(tokenPackages).where(eq(tokenPackages.id, packageId)).limit(1);
    if (!pkg.length) {
      return res.status(404).json({ error: "Package not found" });
    }

    // Decrypt M-Pesa credentials (in production, use proper encryption)
    const consumerKey = config[0].consumerKey;
    const consumerSecret = config[0].consumerSecret;
    const shortcode = config[0].shortcode;
    const passkey = config[0].passkey;

    // Get M-Pesa access token
    const accessToken = await getMpesaAccessToken(consumerKey, consumerSecret, config[0].environment);
    if (!accessToken) {
      return res.status(500).json({ error: "Failed to get M-Pesa access token" });
    }

    // Prepare STK Push payload
    const timestamp = new Date().toISOString().replace(/[:-]/g, "").slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(parseFloat(pkg[0].priceKES || "0")),
      PartyA: phoneNumber.replace(/^0/, "254"), // Convert to international format
      PartyB: shortcode,
      PhoneNumber: phoneNumber.replace(/^0/, "254"),
      CallBackURL: `${process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/payment/mpesa-callback`,
      AccountReference: userId,
      TransactionDesc: `${pkg[0].tokens} APEX Tokens`,
    };

    // Call M-Pesa STK Push API
    const stkResponse = await fetch(
      `https://api.${config[0].environment === "production" ? "safaricom" : "sandbox"}.mpesa.com/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stkPayload),
      }
    );

    const stkData = await stkResponse.json() as Record<string, unknown>;

    if (!stkResponse.ok) {
      console.error("M-Pesa STK Push error:", stkData);
      return res.status(500).json({ error: "Failed to initiate payment" });
    }

    // Store transaction record
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
    console.error("Payment initiation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * M-Pesa callback endpoint (webhook)
 * Called by M-Pesa after payment completion
 */
router.post("/mpesa-callback", async (req: Request, res: Response) => {
  try {
    const { Body } = req.body;
    const result = Body?.stkCallback;

    if (!result) {
      return res.status(400).json({ error: "Invalid callback" });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = result;
    const userId = result.AccountReference || CallbackMetadata?.Item?.[0]?.Value;

    if (ResultCode === 0) {
      // Payment successful
      const mpesaReceiptNumber = CallbackMetadata?.Item?.find(
        (item: Record<string, unknown>) => item.Name === "MpesaReceiptNumber"
      )?.Value;

      // Get the transaction
      const transactions = await db
        .select()
        .from(tokenTransactions)
        .where(eq(tokenTransactions.mpesaTransactionId, CheckoutRequestID))
        .limit(1);

      if (transactions.length) {
        const transaction = transactions[0];

        // Update transaction status
        await db
          .update(tokenTransactions)
          .set({ mpesaStatus: "success" })
          .where(eq(tokenTransactions.id, transaction.id));

        // Credit tokens to user
        const userList = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (userList.length) {
          const user = userList[0];
          await db
            .update(users)
            .set({ tokens: user.tokens + (transaction.amount || 0) })
            .where(eq(users.id, userId));
        }
      }
    } else {
      // Payment failed
      await db
        .update(tokenTransactions)
        .set({ mpesaStatus: "failed" })
        .where(eq(tokenTransactions.mpesaTransactionId, CheckoutRequestID));
    }

    // Return success to M-Pesa
    return res.json({ ResultCode: 0, ResultDesc: "Callback processed" });
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get M-Pesa access token
 */
async function getMpesaAccessToken(
  consumerKey: string,
  consumerSecret: string,
  environment: string
): Promise<string | null> {
  try {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const url = `https://api.${environment === "production" ? "safaricom" : "sandbox"}.mpesa.com/oauth/v1/generate?grant_type=client_credentials`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await response.json() as Record<string, unknown>;
    return (data.access_token as string) || null;
  } catch (error) {
    console.error("M-Pesa auth error:", error);
    return null;
  }
}

/**
 * Get available token packages
 */
router.get("/packages", async (req: Request, res: Response) => {
  try {
    const packages = await db.select().from(tokenPackages).where(eq(tokenPackages.isActive, true));
    return res.json(packages);
  } catch (error) {
    console.error("Packages fetch error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
