import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getSession() {
  try {
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch (_error) {
    // During prerendering, headers() will reject. Return null in this case.
    return null;
  }
}
