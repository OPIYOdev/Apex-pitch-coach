import { pgTable, text, integer, timestamp, boolean, decimal, json, varchar } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  email: varchar("email", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  userType: varchar("user_type", { length: 20 }).default("regular"), // "founder" or "regular"
  tokens: integer("tokens").default(50), // Starting tokens for regular users
  level: integer("level").default(1), // 1-5 (Rookie to Elite)
  xp: integer("xp").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pitches table
export const pitches = pgTable("pitches", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").references(() => users.id),
  pitchText: text("pitch_text"),
  level: integer("level"),
  overallScore: decimal("overall_score", { precision: 3, scale: 1 }),
  scores: json("scores"), // { hook, clarity, pain, solutionFit, credibility, callToAction }
  verdict: text("verdict"),
  landed: text("landed"),
  killed: text("killed"),
  drill: text("drill"),
  rewrite: text("rewrite"),
  nextLevel: text("next_level"),
  voiceInput: boolean("voice_input").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").references(() => users.id),
  role: varchar("role", { length: 20 }), // "user" or "coach"
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Token transactions table
export const tokenTransactions = pgTable("token_transactions", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").references(() => users.id),
  type: varchar("type", { length: 50 }), // "purchase", "deduct", "refund", "manual"
  amount: integer("amount"),
  reason: varchar("reason", { length: 100 }), // "pitch_analysis", "chat_message", "voice_session", "token_purchase"
  mpesaTransactionId: varchar("mpesa_transaction_id", { length: 100 }),
  mpesaStatus: varchar("mpesa_status", { length: 50 }), // "pending", "success", "failed"
  createdAt: timestamp("created_at").defaultNow(),
});

// M-Pesa configuration table (founder credentials)
export const mpesaConfig = pgTable("mpesa_config", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  founderId: text("founder_id").references(() => users.id),
  consumerKey: text("consumer_key"), // Encrypted
  consumerSecret: text("consumer_secret"), // Encrypted
  shortcode: varchar("shortcode", { length: 20 }),
  passkey: text("passkey"), // Encrypted
  environment: varchar("environment", { length: 20 }).default("sandbox"), // "sandbox" or "production"
  isConfigured: boolean("is_configured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Token packages (pricing)
export const tokenPackages = pgTable("token_packages", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: varchar("name", { length: 100 }), // "Starter", "Builder", "Pro"
  tokens: integer("tokens"),
  priceKES: decimal("price_kes", { precision: 10, scale: 2 }),
  description: text("description"),
  isActive: boolean("is_active").default(true),
});

// Analytics table
export const analytics = pgTable("analytics", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  founderId: text("founder_id").references(() => users.id),
  totalUsers: integer("total_users").default(0),
  totalRevenue: decimal("total_revenue", { precision: 15, scale: 2 }).default("0"),
  totalPitches: integer("total_pitches").default(0),
  averageScore: decimal("average_score", { precision: 3, scale: 1 }).default("0"),
  topPitcher: text("top_pitcher"),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Pitch = typeof pitches.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type MpesaConfig = typeof mpesaConfig.$inferSelect;
export type TokenPackage = typeof tokenPackages.$inferSelect;
export type Analytics = typeof analytics.$inferSelect;
