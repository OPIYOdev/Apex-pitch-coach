/**
 * Pitch router — tRPC procedures for pitch analysis and history.
 *
 * Replaces the hard-coded mockFeedback in app/(tabs)/arena.tsx with a real
 * Grok-powered analysis backed by the unified PostgreSQL schema.
 */
import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { users, pitches, tokenTransactions } from "../../drizzle/schema";
import { callGrokAPI, type PitchFeedback } from "../services/grok";

/** Tokens deducted per pitch analysis */
const PITCH_ANALYSIS_COST = 5;

/** System prompt for the Grok pitch coach */
const PITCH_COACH_SYSTEM_PROMPT = `You are APEX, an elite startup pitch coach built on the frameworks of Oren Klaff (Pitch Anything), Chris Voss (Never Split the Difference), and Y-Combinator. 

Your goal is to provide high-stakes, direct, and actionable feedback. You don't care about grammar; you care about frame control, status, and the business case.

Analyse the pitch and return ONLY a JSON object (no markdown fences) with this exact shape:
{
  "verdict": "<one sentence high-impact verdict in the style of a venture partner>",
  "landed": "<what worked well in terms of frame control or logic>",
  "killed": "<what hurt the pitch or weakened the founder's status>",
  "scores": {
    "frame": <0-10, status and authority>,
    "hook": <0-10, the first 30 seconds impact>,
    "logic": <0-10, the business case and traction>,
    "urgency": <0-10, the cost of inaction>
  },
  "overallScore": <0.0-10.0, the APEX Elite Index>,
  "drill": "<one specific high-intensity practice exercise>",
  "rewrite": "<an elite, high-status rewrite of the weakest part of the pitch>",
  "nextLevel": "<one concrete step to reach the next level of founder maturity>"
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
        .select({ tokens: users.tokens, level: users.level, xp: users.xp })
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

      // 3. Calculate XP gain and Level progression
      // Gain XP based on overall score (e.g., score * 10)
      const xpGain = Math.round(feedback.overallScore * 10);
      const currentXp = (userRows[0].xp ?? 0) + xpGain;
      
      // Simple level logic: Level 1 (0-100), Level 2 (101-300), Level 3 (301-600), Level 4 (601-1000), Level 5 (1001+)
      let newLevel = userRows[0].level ?? 1;
      if (currentXp > 1000) newLevel = 5;
      else if (currentXp > 600) newLevel = 4;
      else if (currentXp > 300) newLevel = 3;
      else if (currentXp > 100) newLevel = 2;

      // 4. Update user tokens, XP, and Level
      const newTokenBalance = currentTokens - PITCH_ANALYSIS_COST;

      await db
        .update(users)
        .set({ 
          tokens: newTokenBalance, 
          xp: currentXp,
          level: newLevel,
          updatedAt: new Date() 
        })
        .where(eq(users.id, userId));

      await db.insert(tokenTransactions).values({
        userId,
        type: "deduct",
        amount: PITCH_ANALYSIS_COST,
        reason: "pitch_analysis",
      });

      // 5. Persist the pitch result
      const [pitch] = await db
        .insert(pitches)
        .values({
          userId,
          pitchText: input.pitchText,
          level: newLevel,
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
        xpGained: xpGain,
        leveledUp: newLevel > (userRows[0].level ?? 1),
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
