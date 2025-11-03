import "server-only";
import { and, eq, gte } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { rateLimits, user, userSubscriptions, videoHistory } from "@/db/schema";
import { getSession } from "./session";

export const getUserProfile = async () => {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  const [userInfo] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  return userInfo;
};

export const getUserSubscription = async () => {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  let [subscription] = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, session.user.id))
    .limit(1);

  // Create default free subscription if none exists
  if (!subscription) {
    [subscription] = await db
      .insert(userSubscriptions)
      .values({
        userId: session.user.id,
        plan: "free",
        status: "active",
      })
      .returning();
  }

  return subscription;
};

export const getUserUsageStats = async () => {
  const session = await getSession();

  if (!session?.user) {
    return {
      totalDownloads: 0,
      currentPeriodDownloads: 0,
      remainingDownloads: 5,
      videoDownloads: 0,
      audioDownloads: 0,
    };
  }

  // Get current rate limit
  const [rateLimit] = await db
    .select()
    .from(rateLimits)
    .where(eq(rateLimits.identifier, session.user.id))
    .limit(1);

  // Get total downloads
  const allHistory = await db
    .select()
    .from(videoHistory)
    .where(eq(videoHistory.userId, session.user.id));

  // Get current period downloads (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentHistory = await db
    .select()
    .from(videoHistory)
    .where(
      and(
        eq(videoHistory.userId, session.user.id),
        gte(videoHistory.createdAt, thirtyDaysAgo)
      )
    );

  return {
    totalDownloads: allHistory.length,
    currentPeriodDownloads: rateLimit?.count || 0,
    remainingDownloads: Math.max(0, 5 - (rateLimit?.count || 0)),
    videoDownloads: allHistory.filter((h) => h.downloadType === "video").length,
    audioDownloads: allHistory.filter((h) => h.downloadType === "audio").length,
  };
};
