/**
 * Unified Drizzle schema for Apex Pitch Coach.
 *
 * This file is the single source of truth for ALL database tables.
 * It replaces the previous split between:
 *   - drizzle/schema.ts  (MySQL auth template)
 *   - server/db/schema.ts (PostgreSQL product domain)
 *
 * Database dialect: PostgreSQL
 *
 * Run `pnpm db:push` to apply changes to the database.
 */
import {
  boolean,
  decimal,
  integer,
  json,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
/**
 * Core user table backing both the auth flow and the product domain.
 *
 * The primary key is a CUID string so it is compatible with the product-domain
 * tables (pitches, tokenTransactions, etc.) that reference users.id.
 *
 * The `openId` column stores the Manus OAuth identifier returned from the
 * OAuth callback and is used for upsert operations.
 *
 * The `role` column supports both the template auth ("user" / "admin")
 * and the APEX product role ("founder") in a single field.
 */
export const users = pgTable("users", {
  /** CUID primary key — consistent with all product-domain foreign keys. */
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  /** Manus OAuth identifier (openId). Unique per user. */
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  /**
   * User role:
   *   "user"    – regular pitcher
   *   "admin"   – platform administrator
   *   "founder" – app owner with access to the Founder Terminal
   */
  role: varchar("role", { length: 20 }).notNull().default("user"),
  /** Current token balance. */
  tokens: integer("tokens").notNull().default(0),
  /** XP earned across all pitch sessions. */
  xp: integer("xp").notNull().default(0),
  /** Current coaching level (1–5). */
  level: integer("level").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ---------------------------------------------------------------------------
// Pitches
// ---------------------------------------------------------------------------
export const pitches = pgTable("pitches", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id").references(() => users.id),
  pitchText: text("pitch_text"),
  level: integer("level"),
  overallScore: decimal("overall_score", { precision: 3, scale: 1 }),
  /** JSON object: { hook, clarity, pain, solutionFit, credibility, callToAction } */
  scores: json("scores"),
  verdict: text("verdict"),
  landed: text("landed"),
  killed: text("killed"),
  drill: text("drill"),
  rewrite: text("rewrite"),
  nextLevel: text("next_level"),
  voiceInput: boolean("voice_input").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Pitch = typeof pitches.$inferSelect;

// ---------------------------------------------------------------------------
// Chat messages
// ---------------------------------------------------------------------------
export const chatMessages = pgTable("chat_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id").references(() => users.id),
  /** "user" or "coach" */
  role: varchar("role", { length: 20 }),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;

// ---------------------------------------------------------------------------
// Token transactions
// ---------------------------------------------------------------------------
export const tokenTransactions = pgTable("token_transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id").references(() => users.id),
  /** "purchase" | "deduct" | "refund" | "manual" */
  type: varchar("type", { length: 50 }),
  amount: integer("amount"),
  /** "pitch_analysis" | "chat_message" | "voice_session" | "token_purchase" */
  reason: varchar("reason", { length: 100 }),
  mpesaTransactionId: varchar("mpesa_transaction_id", { length: 100 }),
  /** "pending" | "success" | "failed" */
  mpesaStatus: varchar("mpesa_status", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export type TokenTransaction = typeof tokenTransactions.$inferSelect;

// ---------------------------------------------------------------------------
// Token packages (pricing catalogue)
// ---------------------------------------------------------------------------
export const tokenPackages = pgTable("token_packages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  /** e.g. "Starter", "Builder", "Pro" */
  name: varchar("name", { length: 100 }),
  tokens: integer("tokens"),
  priceKES: decimal("price_kes", { precision: 10, scale: 2 }),
  description: text("description"),
  isActive: boolean("is_active").default(true),
});

export type TokenPackage = typeof tokenPackages.$inferSelect;

// ---------------------------------------------------------------------------
// Analytics snapshots
// ---------------------------------------------------------------------------
export const analytics = pgTable("analytics", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  founderId: text("founder_id").references(() => users.id),
  totalUsers: integer("total_users").default(0),
  totalRevenue: decimal("total_revenue", { precision: 15, scale: 2 }).default("0"),
  totalPitches: integer("total_pitches").default(0),
  averageScore: decimal("average_score", { precision: 3, scale: 1 }).default("0"),
  topPitcher: text("top_pitcher"),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

export type Analytics = typeof analytics.$inferSelect;
