import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { migrateIpDownloadsToUser } from "@/server/auth-migration";

export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await migrateIpDownloadsToUser(session.user.id);

    if (!result.success)
      return NextResponse.json(
        { error: result.error || "Migration failed" },
        { status: 500 }
      );

    return NextResponse.json({
      success: true,
      migratedCount: result.migratedCount,
    });
  } catch (error) {
    console.error("Error in migrate downloads API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
