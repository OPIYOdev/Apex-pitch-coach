/**
 * M-Pesa router — tRPC procedures for STK Push payments.
 *
 * Handles the initiation of M-Pesa STK Push and processes the callback from Safaricom.
 */
import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import axios from "axios";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { users, tokenTransactions, mpesaConfig, tokenPackages } from "../../drizzle/schema";

/**
 * Helper to get M-Pesa access token.
 */
async function getMpesaAccessToken(consumerKey: string, consumerSecret: string, environment: string) {
  const url = environment === "production"
    ? "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    : "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const response = await axios.get(url, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  return response.data.access_token;
}

export const mpesaRouter = router({
  /**
   * Initiate M-Pesa STK Push.
   */
  initiateStkPush: protectedProcedure
    .input(
      z.object({
        packageId: z.string(),
        phoneNumber: z.string().regex(/^254\d{9}$/, "Phone number must be in format 2547XXXXXXXX"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Get the package details
      const pkg = await db
        .select()
        .from(tokenPackages)
        .where(eq(tokenPackages.id, input.packageId))
        .limit(1);

      if (!pkg.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Token package not found" });
      }

      // 2. Get M-Pesa configuration (from the founder)
      // For simplicity, we assume the first founder's config is used.
      const config = await db
        .select()
        .from(mpesaConfig)
        .where(eq(mpesaConfig.isConfigured, true))
        .limit(1);

      if (!config.length) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "M-Pesa is not configured by the administrator" });
      }

      const { consumerKey, consumerSecret, shortcode, passkey, environment } = config[0];

      if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Incomplete M-Pesa configuration" });
      }

      try {
        // 3. Get Access Token
        const accessToken = await getMpesaAccessToken(consumerKey, consumerSecret, environment ?? "sandbox");

        // 4. Prepare STK Push request
        const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
        const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
        
        const callbackUrl = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.API_URL}/api/mpesa/callback`;

        const stkUrl = environment === "production"
          ? "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
          : "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

        const response = await axios.post(
          stkUrl,
          {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: Math.round(parseFloat(pkg[0].priceKES ?? "0")),
            PartyA: input.phoneNumber,
            PartyB: shortcode,
            PhoneNumber: input.phoneNumber,
            CallBackURL: callbackUrl,
            AccountReference: "ApexPitchCoach",
            TransactionDesc: `Purchase ${pkg[0].tokens} tokens`,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        // 5. Record the pending transaction
        await db.insert(tokenTransactions).values({
          userId: ctx.user.id,
          type: "purchase",
          amount: pkg[0].tokens ?? 0,
          reason: "token_purchase",
          mpesaTransactionId: response.data.CheckoutRequestID,
          mpesaStatus: "pending",
        });

        return {
          success: true,
          checkoutRequestId: response.data.CheckoutRequestID,
          message: "STK Push initiated. Please check your phone.",
        };
      } catch (error: any) {
        console.error("[M-Pesa] STK Push failed:", error.response?.data || error.message);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to initiate M-Pesa payment. Please try again.",
        });
      }
    }),

  /**
   * M-Pesa Callback Handler (Public endpoint for Safaricom).
   * Note: In a real tRPC setup, this would usually be a standard Express route,
   * but we can define it as a publicProcedure if we route it correctly.
   */
  callback: publicProcedure
    .input(z.any())
    .mutation(async ({ input }) => {
      const { Body } = input;
      if (!Body || !Body.stkCallback) {
        return { ResultCode: 1, ResultDesc: "Invalid callback data" };
      }

      const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;

      if (ResultCode === 0) {
        // Payment successful
        const transaction = await db
          .select()
          .from(tokenTransactions)
          .where(eq(tokenTransactions.mpesaTransactionId, CheckoutRequestID))
          .limit(1);

        if (transaction.length > 0) {
          const tx = transaction[0];
          
          // 1. Update transaction status
          await db
            .update(tokenTransactions)
            .set({ mpesaStatus: "success" })
            .where(eq(tokenTransactions.id, tx.id));

          // 2. Credit tokens to user
          const user = await db
            .select()
            .from(users)
            .where(eq(users.id, tx.userId ?? ""))
            .limit(1);

          if (user.length > 0) {
            const currentTokens = user[0].tokens ?? 0;
            await db
              .update(users)
              .set({ tokens: currentTokens + (tx.amount ?? 0) })
              .where(eq(users.id, tx.userId ?? ""));
          }
        }
      } else {
        // Payment failed or cancelled
        await db
          .update(tokenTransactions)
          .set({ mpesaStatus: "failed" })
          .where(eq(tokenTransactions.mpesaTransactionId, CheckoutRequestID));
      }

      return { ResultCode: 0, ResultDesc: "Success" };
    }),
});
