"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

interface DownloadLimitStatus {
  canDownload: boolean;
  requiresAuth: boolean;
  remainingDownloads: number;
  isLoading: boolean;
  error: string | null;
}

export function useDownloadLimit(): DownloadLimitStatus {
  const { data: session, isPending } = useSession();
  const [status, setStatus] = useState<DownloadLimitStatus>({
    canDownload: true,
    requiresAuth: false,
    remainingDownloads: 1,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function checkDownloadLimit() {
      if (isPending) return;

      try {
        // If user is authenticated, they can download (based on their subscription)
        if (session?.user) {
          setStatus({
            canDownload: true,
            requiresAuth: false,
            remainingDownloads: Infinity, // Will be determined by subscription tier
            isLoading: false,
            error: null,
          });
          return;
        }

        // For anonymous users, check if they've already downloaded
        const response = await fetch("/api/download/check-limit", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 429) {
            const data = await response.json();
            setStatus({
              canDownload: false,
              requiresAuth: true,
              remainingDownloads: 0,
              isLoading: false,
              error: data.error || "Download limit reached",
            });
          } else {
            throw new Error("Failed to check download limit");
          }
        } else {
          const data = await response.json();
          setStatus({
            canDownload: data.canDownload,
            requiresAuth: false,
            remainingDownloads: data.remaining,
            isLoading: false,
            error: null,
          });
        }
      } catch (err) {
        setStatus({
          canDownload: true, // Allow download on error to not block legitimate users
          requiresAuth: false,
          remainingDownloads: 1,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to check limit",
        });
      }
    }

    checkDownloadLimit();
  }, [session, isPending]);

  return status;
}
