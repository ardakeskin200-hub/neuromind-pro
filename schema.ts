import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, bigint, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Premium Key Management
export const premiumKeys = mysqlTable("premiumKeys", {
  id: int("id").autoincrement().primaryKey(),
  keyCode: varchar("keyCode", { length: 64 }).notNull().unique(),
  createdBy: int("createdBy").notNull(),
  assignedTo: int("assignedTo"),
  isActive: boolean("isActive").default(true).notNull(),
  expiresAt: timestamp("expiresAt"),
  usageCount: int("usageCount").default(0).notNull(),
  maxUsage: int("maxUsage"),
  features: json("features").default({}).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PremiumKey = typeof premiumKeys.$inferSelect;
export type InsertPremiumKey = typeof premiumKeys.$inferInsert;

// Chat Sessions
export const chatSessions = mysqlTable("chatSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  modelUsed: varchar("modelUsed", { length: 64 }).default("gpt-4").notNull(),
  isPremium: boolean("isPremium").default(false).notNull(),
  messageCount: int("messageCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;

// Chat Messages
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  modelUsed: varchar("modelUsed", { length: 64 }),
  tokensUsed: int("tokensUsed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// System Memory and Learning
export const systemMemory = mysqlTable("systemMemory", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 64 }).notNull(),
  key: varchar("key", { length: 255 }).notNull(),
  value: text("value").notNull(),
  importance: int("importance").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemMemory = typeof systemMemory.$inferSelect;
export type InsertSystemMemory = typeof systemMemory.$inferInsert;

// Motor Capabilities and Evolution
export const motorCapabilities = mysqlTable("motorCapabilities", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  level: int("level").default(1).notNull(),
  usageCount: int("usageCount").default(0).notNull(),
  addedBy: int("addedBy").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MotorCapability = typeof motorCapabilities.$inferSelect;
export type InsertMotorCapability = typeof motorCapabilities.$inferInsert;

// Admin Audit Log
export const auditLog = mysqlTable("auditLog", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  targetType: varchar("targetType", { length: 64 }).notNull(),
  targetId: int("targetId"),
  details: json("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;

// LLM Configuration
export const llmConfig = mysqlTable("llmConfig", {
  id: int("id").autoincrement().primaryKey(),
  provider: varchar("provider", { length: 64 }).notNull(),
  model: varchar("model", { length: 128 }).notNull(),
  apiKey: varchar("apiKey", { length: 512 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  priority: int("priority").default(1).notNull(),
  costPerToken: varchar("costPerToken", { length: 32 }),
  maxTokens: int("maxTokens").default(4096).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LLMConfig = typeof llmConfig.$inferSelect;
export type InsertLLMConfig = typeof llmConfig.$inferInsert;

// Learning Models
export const learningModels = mysqlTable("learningModels", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  data: json("data").notNull(),
  accuracy: varchar("accuracy", { length: 32 }),
  trainedAt: timestamp("trainedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LearningModel = typeof learningModels.$inferSelect;
export type InsertLearningModel = typeof learningModels.$inferInsert;

// Evolution History
export const evolutionHistory = mysqlTable("evolutionHistory", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  capabilityId: int("capabilityId"),
  action: varchar("action", { length: 128 }).notNull(),
  oldValue: json("oldValue"),
  newValue: json("newValue"),
  result: varchar("result", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EvolutionHistory = typeof evolutionHistory.$inferSelect;
export type InsertEvolutionHistory = typeof evolutionHistory.$inferInsert;

// Analytics
export const analytics = mysqlTable("analytics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  event: varchar("event", { length: 128 }).notNull(),
  metadata: json("metadata"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = typeof analytics.$inferInsert;

// User Subscriptions
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planId: varchar("planId", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired"]).default("active").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  renewalDate: timestamp("renewalDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// API Usage Tracking
export const apiUsage = mysqlTable("apiUsage", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  method: varchar("method", { length: 16 }).notNull(),
  tokensUsed: int("tokensUsed").default(0).notNull(),
  responseTime: int("responseTime").default(0).notNull(),
  status: int("status").default(200).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type APIUsage = typeof apiUsage.$inferSelect;
export type InsertAPIUsage = typeof apiUsage.$inferInsert;

// Cached Responses
export const cachedResponses = mysqlTable("cachedResponses", {
  id: int("id").autoincrement().primaryKey(),
  hash: varchar("hash", { length: 64 }).notNull().unique(),
  query: text("query").notNull(),
  response: text("response").notNull(),
  model: varchar("model", { length: 128 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  hitCount: int("hitCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CachedResponse = typeof cachedResponses.$inferSelect;
export type InsertCachedResponse = typeof cachedResponses.$inferInsert;

// Research Sessions
export const researchSessions = mysqlTable("researchSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "completed", "failed"]).default("active").notNull(),
  findings: json("findings"),
  sources: json("sources"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type ResearchSession = typeof researchSessions.$inferSelect;
export type InsertResearchSession = typeof researchSessions.$inferInsert;
