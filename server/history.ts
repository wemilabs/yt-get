"use server";

import { db } from "@/db/drizzle";
import { videoHistory } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function deleteHistoryItem(historyId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Delete only if the item belongs to the user
  await db
    .delete(videoHistory)
    .where(
      and(
        eq(videoHistory.id, historyId),
        eq(videoHistory.userId, session.user.id)
      )
    );

  revalidatePath("/history");
  
  return { success: true };
}

export async function clearAllHistory() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db
    .delete(videoHistory)
    .where(eq(videoHistory.userId, session.user.id));

  revalidatePath("/history");
  
  return { success: true };
}