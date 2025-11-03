import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { rateLimits } from "@/db/schema";

export const RATE_LIMIT_CONFIG = {
  free: {
    maxRequests: 5,
    windowMs: 5 * 60 * 60 * 1000,
  },
  pro: {
    maxRequests: 100,
    windowMs: 24 * 60 * 60 * 1000,
  },
  unlimited: {
    maxRequests: Infinity,
    windowMs: 0,
  },
};

export type SubscriptionTier = keyof typeof RATE_LIMIT_CONFIG;

export async function checkRateLimit(
  identifier: string,
  tier: SubscriptionTier = "free"
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const config = RATE_LIMIT_CONFIG[tier];
  const now = new Date();
  const nowMs = now.getTime();

  // Get existing rate limit entry
  const [entry] = await db
    .select()
    .from(rateLimits)
    .where(eq(rateLimits.identifier, identifier))
    .limit(1);

  // Reset if window has passed or entry doesn't exist
  if (!entry || nowMs >= entry.resetAt.getTime()) {
    const resetAt = new Date(nowMs + config.windowMs);

    if (entry) {
      // Update existing entry
      await db
        .update(rateLimits)
        .set({
          count: 1,
          resetAt,
          updatedAt: now,
        })
        .where(eq(rateLimits.identifier, identifier));
    } else {
      // Create new entry
      await db.insert(rateLimits).values({
        identifier,
        count: 1,
        resetAt,
      });
    }

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: resetAt.getTime(),
    };
  }

  // Check if limit exceeded
  const allowed = entry.count < config.maxRequests;

  if (allowed) {
    // Increment count
    await db
      .update(rateLimits)
      .set({
        count: entry.count + 1,
        updatedAt: now,
      })
      .where(eq(rateLimits.identifier, identifier));
  }

  // Calculate remaining after increment
  const remaining = Math.max(
    0,
    config.maxRequests - (entry.count + (allowed ? 1 : 0))
  );

  return {
    allowed,
    remaining,
    resetTime: entry.resetAt.getTime(),
  };
}

export async function getRateLimitInfo(identifier: string): Promise<{
  count: number;
  remaining: number;
  resetTime: number;
} | null> {
  const [entry] = await db
    .select()
    .from(rateLimits)
    .where(eq(rateLimits.identifier, identifier))
    .limit(1);

  if (!entry) return null;

  const now = Date.now();
  if (now >= entry.resetAt.getTime()) {
    return null;
  }

  return {
    count: entry.count,
    remaining: Math.max(0, RATE_LIMIT_CONFIG.free.maxRequests - entry.count),
    resetTime: entry.resetAt.getTime(),
  };
}
