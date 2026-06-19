import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, premiumKeys, chatSessions, chatMessages, systemMemory, motorCapabilities, auditLog } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // Remove fields that don't exist in database
    const { isPremium, premiumKeyId, ...safeValues } = values as any;
    const { isPremium: _, premiumKeyId: __, ...safeUpdateSet } = updateSet as any;

    await db.insert(users).values(safeValues).onDuplicateKeyUpdate({
      set: safeUpdateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Premium Key Functions
export async function createPremiumKey(createdBy: number, features: Record<string, unknown>, expiresAt?: Date, maxUsage?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const keyCode = `NK-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  
  const result = await db.insert(premiumKeys).values({
    keyCode,
    createdBy,
    features,
    expiresAt,
    maxUsage,
    isActive: true,
  });
  
  return keyCode;
}

export async function validatePremiumKey(keyCode: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const key = await db.select().from(premiumKeys).where(eq(premiumKeys.keyCode, keyCode)).limit(1);
  
  if (!key || key.length === 0) return null;
  
  const premiumKey = key[0];
  
  // Check if key is active
  if (!premiumKey.isActive) return null;
  
  // Check if key has expired
  if (premiumKey.expiresAt && premiumKey.expiresAt < new Date()) return null;
  
  // Check if key has reached max usage
  if (premiumKey.maxUsage && premiumKey.usageCount >= premiumKey.maxUsage) return null;
  
  return premiumKey;
}

export async function activatePremiumKey(keyCode: string, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const key = await validatePremiumKey(keyCode);
  if (!key) return false;
  
  // Update key
  await db.update(premiumKeys)
    .set({
      assignedTo: userId,
      usageCount: (key.usageCount || 0) + 1,
    })
    .where(eq(premiumKeys.id, key.id));
  
  // Update user premium status (tracked via premiumKeys table)
  // No need to update users table as premium status is determined by active key
  
  return true;
}

// Chat Session Functions
export async function createChatSession(userId: number, title: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(chatSessions).values({
    userId,
    title,
  });
  
  return result;
}

export async function getChatSessions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(chatSessions).where(eq(chatSessions.userId, userId));
}

export async function addChatMessage(sessionId: number, role: 'user' | 'assistant', content: string, modelUsed?: string, tokensUsed?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(chatMessages).values({
    sessionId,
    role,
    content,
    modelUsed,
    tokensUsed: tokensUsed || 0,
  });
  
  // Update message count
  const session = await db.select().from(chatSessions).where(eq(chatSessions.id, sessionId)).limit(1);
  if (session && session.length > 0) {
    await db.update(chatSessions)
      .set({ messageCount: (session[0].messageCount || 0) + 1 })
      .where(eq(chatSessions.id, sessionId));
  }
}

export async function getChatMessages(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId));
}

// System Memory Functions
export async function storeMemory(category: string, key: string, value: string, importance: number = 1) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(systemMemory).values({
    category,
    key,
    value,
    importance,
  });
}

export async function getMemory(category: string, key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(systemMemory)
    .where(and(eq(systemMemory.category, category), eq(systemMemory.key, key)))
    .limit(1);
  
  return result.length > 0 ? result[0].value : null;
}

// Motor Capabilities Functions
export async function addCapability(name: string, description: string, addedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(motorCapabilities).values({
    name,
    description,
    addedBy,
    level: 1,
  });
}

export async function getCapabilities() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(motorCapabilities).where(eq(motorCapabilities.isActive, true));
}

// Audit Log Functions
export async function logAdminAction(adminId: number, action: string, targetType: string, targetId?: number, details?: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(auditLog).values({
    adminId,
    action,
    targetType,
    targetId,
    details,
  });
}
