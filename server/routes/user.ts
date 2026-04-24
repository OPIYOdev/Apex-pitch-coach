/**
 * User router — tRPC procedures for token balance, XP, and level progression.
 *
 * Replaces the hard-coded useState(50) in tokens.tsx and the static LEVELS
 * array in levels.tsx with live data from the database.
 */
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { users, tokenTransactions, tokenPackages } from "../../drizzle/schema";

/** XP thresholds for each coaching level (index = level - 1) */
const LEVEL_XP_THRESHOLDS = [0, 100, 300, 600, 900];

/** Human-readable level names */
const LEVEL_NAMES = ["Rookie", "Contender", "Closer", "Dealmaker", "Elite"];

/** Level descriptions */
const LEVEL_DESCRIPTIONS = [
  "You're just starting. Goal: nail your one-liner.",
  "You can explain what you do. Goal: make them feel the pain.",
  "You can close a room. Goal: handle objections cold.",
  "You move money. Goal: command the room and the terms.",
  "You command the room. Goal: they repeat your pitch.",
];

export const userRouter = router({
  /**
   * Return the authenticated user's current token balance, XP, and level.
   */
  profile: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select({
        tokens: users.tokens,
        xp: users.xp,
        level: users.level,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (!rows.length) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    const { tokens, xp, level, name, email, role } = rows[0];
    const currentLevel = Math.min(Math.max(level ?? 1, 1), 5);
    const xpNeeded = LEVEL_XP_THRESHOLDS[currentLevel] ?? 900;
    const xpCurrent = xp ?? 0;

    return {
      name,
      email,
      role,
      tokens: tokens ?? 0,
      xp: xpCurrent,
      level: currentLevel,
      levelName: LEVEL_NAMES[currentLevel - 1],
      xpNeeded,
      xpProgress: Math.min(xpCurrent / xpNeeded, 1),
    };
  }),

  /**
   * Return the full level progression ladder with the user's current progress.
   */
  levels: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select({ xp: users.xp, level: users.level })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (!rows.length) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    const userXp = rows[0].xp ?? 0;
    const userLevel = Math.min(Math.max(rows[0].level ?? 1, 1), 5);

    return LEVEL_XP_THRESHOLDS.map((xpNeeded, idx) => {
      const levelNum = idx + 1;
      const locked = levelNum > userLevel;
      const xpCurrent = locked ? 0 : levelNum === userLevel ? userXp : xpNeeded;

      return {
        n: levelNum,
        name: LEVEL_NAMES[idx],
        desc: LEVEL_DESCRIPTIONS[idx],
        xpNeeded,
        xpCurrent,
        locked,
      };
    });
  }),

  /**
   * Return the authenticated user's recent token transactions.
   */
  transactions: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).optional().default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await db
        .select()
        .from(tokenTransactions)
        .where(eq(tokenTransactions.userId, ctx.user.id))
        .orderBy(desc(tokenTransactions.createdAt))
        .limit(input.limit);

      return rows;
    }),

  /**
   * Return all active token packages available for purchase.
   */
  tokenPackages: protectedProcedure.query(async () => {
    const packages = await db
      .select()
      .from(tokenPackages)
      .where(eq(tokenPackages.isActive, true));

    return packages;
  }),
});
