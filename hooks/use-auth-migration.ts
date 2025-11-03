"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";

export function useAuthMigration() {
  const { data: session, isPending } = useSession();

  useEffect(() => {
    // Only run migration when user becomes authenticated (not on initial load)
    if (session?.user && !isPending) {
      const migrateDownloads = async () => {
        try {
          const response = await fetch("/api/auth/migrate-downloads", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const result = await response.json();
            if (result.migratedCount > 0) {
              console.log(
                `Migrated ${result.migratedCount} downloads to your account`
              );
            }
          }
        } catch (error) {
          console.error("Failed to migrate downloads:", error);
        }
      };

      migrateDownloads();
    }
  }, [session?.user, isPending]);
}
