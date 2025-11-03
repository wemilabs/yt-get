import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/data/session";
import { db } from "@/db/drizzle";
import { rateLimits } from "@/db/schema";

export async function GET(request: NextRequest) {
  try {
    // Bail out of prerendering if headers are not available
    let headers: Headers;
    try {
      headers = request.headers;
    } catch {
      // During prerendering, headers will throw. Return default response.
      return NextResponse.json({
        canDownload: true,
        remaining: 1,
        requiresAuth: false,
      });
    }

    const session = await getSession();

    // If user is authenticated, they can download
    if (session?.user) {
      return NextResponse.json({
        canDownload: true,
        remaining: Infinity, // Will be determined by subscription tier
        requiresAuth: false,
      });
    }

    // For anonymous users, check their IP-based download count
    const forwarded = headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0]
      : headers.get("x-real-ip") || "127.0.0.1";

    const [existingLimit] = await db
      .select()
      .from(rateLimits)
      .where(eq(rateLimits.identifier, ip))
      .limit(1);

    // If no record exists, user hasn't downloaded yet
    if (!existingLimit) {
      return NextResponse.json({
        canDownload: true,
        remaining: 1,
        requiresAuth: false,
      });
    }

    // Check if the limit window has expired
    const now = Date.now();
    if (now >= existingLimit.resetAt.getTime()) {
      return NextResponse.json({
        canDownload: true,
        remaining: 1,
        requiresAuth: false,
      });
    }

    // User has already downloaded
    if (existingLimit.count >= 1) {
      return NextResponse.json(
        {
          canDownload: false,
          remaining: 0,
          requiresAuth: true,
          error:
            "Download limit reached. Please sign in to download more videos.",
          redirectTo: "/sign-in",
        },
        { status: 429 }
      );
    }

    return NextResponse.json({
      canDownload: true,
      remaining: 1 - existingLimit.count,
      requiresAuth: false,
    });
  } catch (error) {
    console.error("Error checking download limit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
