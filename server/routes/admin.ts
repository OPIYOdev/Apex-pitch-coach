/**
 * Admin router — tRPC procedures for founder-level configuration.
 *
 * Allows the founder to configure M-Pesa credentials and manage token packages.
 */
import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { founderProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { mpesaConfig, tokenPackages } from "../../drizzle/schema";

export const adminRouter = router({
  /**
   * Get the current M-Pesa configuration.
   */
  getMpesaConfig: founderProcedure.query(async ({ ctx }) => {
    const config = await db
      .select()
      .from(mpesaConfig)
      .where(eq(mpesaConfig.founderId, ctx.user.id))
      .limit(1);

    return config[0] || null;
  }),

  /**
   * Update or create the M-Pesa configuration.
   */
  updateMpesaConfig: founderProcedure
    .input(
      z.object({
        consumerKey: z.string().min(1),
        consumerSecret: z.string().min(1),
        shortcode: z.string().min(1),
        passkey: z.string().min(1),
        environment: z.enum(["sandbox", "production"]).default("sandbox"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await db
        .select()
        .from(mpesaConfig)
        .where(eq(mpesaConfig.founderId, ctx.user.id))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(mpesaConfig)
          .set({
            ...input,
            isConfigured: true,
            updatedAt: new Date(),
          })
          .where(eq(mpesaConfig.founderId, ctx.user.id));
      } else {
        await db.insert(mpesaConfig).values({
          founderId: ctx.user.id,
          ...input,
          isConfigured: true,
        });
      }

      return { success: true };
    }),

  /**
   * Manage token packages.
   */
  upsertTokenPackage: founderProcedure
    .input(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1),
        tokens: z.number().int().positive(),
        priceKES: z.string().regex(/^\d+(\.\d{1,2})?$/),
        description: z.string().optional(),
        isActive: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input }) => {
      if (input.id) {
        await db
          .update(tokenPackages)
          .set({
            ...input,
          })
          .where(eq(tokenPackages.id, input.id));
      } else {
        await db.insert(tokenPackages).values({
          name: input.name,
          tokens: input.tokens,
          priceKES: input.priceKES,
          description: input.description,
          isActive: input.isActive,
        });
      }

      return { success: true };
    }),
});
