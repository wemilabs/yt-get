"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { rateLimits } from "@/db/schema";

export async function migrateIpDownloadsToUser(userId: string) {
  try {
    // Get the client's IP address
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0]
      : headersList.get("x-real-ip") || "127.0.0.1";

    // Check if there's an existing rate limit entry for this IP
    const [existingLimit] = await db
      .select()
      .from(rateLimits)
      .where(eq(rateLimits.identifier, ip))
      .limit(1);

    if (!existingLimit) {
      // No downloads to migrate
      return { success: true, migratedCount: 0 };
    }

    // Check if user already has a rate limit entry
    const [userLimit] = await db
      .select()
      .from(rateLimits)
      .where(eq(rateLimits.identifier, userId))
      .limit(1);

    const now = new Date();

    if (userLimit) {
      // User already has a rate limit entry, update it to include the IP downloads
      const newCount = userLimit.count + existingLimit.count;

      await db
        .update(rateLimits)
        .set({
          count: newCount,
          updatedAt: now,
        })
        .where(eq(rateLimits.identifier, userId));

      // Remove the IP-based entry
      await db.delete(rateLimits).where(eq(rateLimits.identifier, ip));

      return { success: true, migratedCount: existingLimit.count };
    } else {
      // Create new rate limit entry for the user with the IP's download count
      await db.insert(rateLimits).values({
        identifier: userId,
        count: existingLimit.count,
        resetAt: existingLimit.resetAt,
      });

      // Remove the IP-based entry
      await db.delete(rateLimits).where(eq(rateLimits.identifier, ip));

      return { success: true, migratedCount: existingLimit.count };
    }
  } catch (error) {
    console.error("Failed to migrate IP downloads to user:", error);
    return { success: false, error: "Migration failed" };
  }
}
