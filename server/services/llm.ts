import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { llmConfig, cachedResponses, apiUsage } from "../../drizzle/schema";
import crypto from "crypto";

const CACHE_TTL = 3600000;

function generateHash(query: string, model: string): string {
  return crypto.createHash("sha256").update(`${query}:${model}`).digest("hex");
}

export async function getCachedResponse(query: string, model: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  const hash = generateHash(query, model);
  const cached = await db
    .select()
    .from(cachedResponses)
    .where(eq(cachedResponses.hash, hash))
    .limit(1);

  if (cached.length > 0 && cached[0].expiresAt > new Date()) {
    await db
      .update(cachedResponses)
      .set({ hitCount: (cached[0].hitCount || 0) + 1 })
      .where(eq(cachedResponses.id, cached[0].id));

    return cached[0].response;
  }

  return null;
}

export async function cacheResponse(
  query: string,
  response: string,
  model: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const hash = generateHash(query, model);
  const expiresAt = new Date(Date.now() + CACHE_TTL);

  await db.insert(cachedResponses).values({
    hash,
    query,
    response,
    model,
    expiresAt,
  });
}

export async function getActiveLLMs(): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(llmConfig)
    .where(eq(llmConfig.isActive, true));
}

export async function trackAPIUsage(
  userId: number,
  endpoint: string,
  method: string,
  tokensUsed: number,
  responseTime: number,
  status: number = 200
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(apiUsage).values({
    userId,
    endpoint,
    method,
    tokensUsed,
    responseTime,
    status,
  });
}
