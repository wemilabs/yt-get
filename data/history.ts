import { desc, eq } from "drizzle-orm";
import "server-only";
import { db } from "@/db/drizzle";
import { videoHistory } from "@/db/schema";
import { getSession } from "./session";

export async function getUserHistory(limit = 50) {
  const session = await getSession();

  if (!session?.user) {
    return [];
  }

  const history = await db
    .select()
    .from(videoHistory)
    .where(eq(videoHistory.userId, session.user.id))
    .orderBy(desc(videoHistory.createdAt))
    .limit(limit);

  return history;
}

export async function getHistoryStats() {
  const session = await getSession();

  if (!session?.user) {
    return {
      total: 0,
      videoCount: 0,
      audioCount: 0,
    };
  }

  const history = await db
    .select()
    .from(videoHistory)
    .where(eq(videoHistory.userId, session.user.id));

  return {
    total: history.length,
    videoCount: history.filter((h) => h.downloadType === "video").length,
    audioCount: history.filter((h) => h.downloadType === "audio").length,
  };
}
