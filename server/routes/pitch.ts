/**
 * Pitch router — tRPC procedures for pitch analysis and history.
 *
 * Replaces the hard-coded mockFeedback in app/(tabs)/arena.tsx with a real
 * Grok-powered analysis backed by the unified PostgreSQL schema.
 */
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { users, pitches, tokenTransactions } from "../../drizzle/schema";
import { callGrokAPI, type PitchFeedback } from "../services/grok";

/** Tokens deducted per pitch analysis */
const PITCH_ANALYSIS_COST = 5;

/** System prompt for the Grok pitch coach */
const PITCH_COACH_SYSTEM_PROMPT = `You are APEX, an elite startup pitch coach. Analyse the pitch and return ONLY a JSON object (no markdown fences) with this exact shape:
{
  "verdict": "<one sentence overall verdict>",
  "landed": "<what worked well>",
  "killed": "<what hurt the pitch>",
  "scores": {
    "hook": <0-10>,
    "clarity": <0-10>,
    "pain": <0-10>,
    "solutionFit": <0-10>,
    "credibility": <0-10>,
    "callToAction": <0-10>
  },
  "overallScore": <0.0-10.0>,
  "drill": "<one specific practice exercise>",
  "rewrite": "<improved version of the weakest sentence>",
  "nextLevel": "<one concrete next step to level up>"
}`;

export const pitchRouter = router({
  /**
   * Analyse a pitch text using Grok.
   * Deducts PITCH_ANALYSIS_COST tokens from the authenticated user's balance.
   */
  analyze: protectedProcedure
    .input(
      z.object({
        pitchText: z.string().min(10, "Pitch must be at least 10 characters"),
        voiceInput: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // 1. Check token balance
      const userRows = await db
        .select({ tokens: users.tokens, level: users.level })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!userRows.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const currentTokens = userRows[0].tokens ?? 0;
      if (currentTokens < PITCH_ANALYSIS_COST) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Insufficient tokens. You need ${PITCH_ANALYSIS_COST} tokens to analyse a pitch.`,
        });
      }

      // 2. Call Grok API
      const feedback = (await callGrokAPI(
        PITCH_COACH_SYSTEM_PROMPT,
        input.pitchText,
        true,
      )) as PitchFeedback | null;

      if (!feedback) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "AI analysis failed. Please try again.",
        });
      }

      // 3. Deduct tokens and record the transaction atomically
      const newTokenBalance = currentTokens - PITCH_ANALYSIS_COST;

      await db
        .update(users)
        .set({ tokens: newTokenBalance, updatedAt: new Date() })
        .where(eq(users.id, userId));

      await db.insert(tokenTransactions).values({
        userId,
        type: "deduct",
        amount: PITCH_ANALYSIS_COST,
        reason: "pitch_analysis",
      });

      // 4. Persist the pitch result
      const [pitch] = await db
        .insert(pitches)
        .values({
          userId,
          pitchText: input.pitchText,
          level: userRows[0].level ?? 1,
          overallScore: String(feedback.overallScore),
          scores: feedback.scores,
          verdict: feedback.verdict,
          landed: feedback.landed,
          killed: feedback.killed,
          drill: feedback.drill,
          rewrite: feedback.rewrite,
          nextLevel: feedback.nextLevel,
          voiceInput: input.voiceInput,
        })
        .returning();

      return {
        feedback,
        remainingTokens: newTokenBalance,
        pitchId: pitch?.id ?? null,
      };
    }),

  /**
   * Return the authenticated user's pitch history (most recent first).
   */
  history: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).optional().default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await db
        .select()
        .from(pitches)
        .where(eq(pitches.userId, ctx.user.id))
        .orderBy(desc(pitches.createdAt))
        .limit(input.limit);

      return rows;
    }),
});
