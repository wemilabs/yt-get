"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDownloadLimit } from "@/hooks/use-download-limit";
import type { VideoFormat } from "@/types/video";
import { DownloadButton } from "./download-button";

type FormatListProps = {
  formats: VideoFormat[];
  type: "video" | "audio";
  videoUrl: string;
};

export function FormatList({ formats, type, videoUrl }: FormatListProps) {
  const { canDownload, requiresAuth, error } = useDownloadLimit();
  const router = useRouter();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<
    Record<string, number>
  >({});

  const handleDownload = async (downloadUrl: string, id: string) => {
    // Check if user can download
    if (!canDownload && requiresAuth) {
      router.push("/sign-in");
      return;
    }

    setDownloadingId(id);
    setDownloadProgress({ ...downloadProgress, [id]: 0 });

    try {
      // Connect to progress SSE stream
      const progressUrl = `/api/download-progress?id=${encodeURIComponent(id)}`;
      const eventSource = new EventSource(progressUrl);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setDownloadProgress((prev) => ({ ...prev, [id]: data.progress }));
      };

      eventSource.onerror = () => {
        eventSource.close();
      };

      // Start the actual download with downloadId parameter
      const downloadUrlWithId = `${downloadUrl}&downloadId=${encodeURIComponent(
        id
      )}`;
      const response = await fetch(downloadUrlWithId);

      if (!response.ok) {
        if (response.status === 429) {
          const errorData = await response.json();
          if (errorData.requiresAuth) {
            router.push(errorData.redirectTo || "/sign-in");
            return;
          }
        }
        throw new Error("Download failed");
      }

      // Get the blob
      const blob = await response.blob();

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="?(.+?)"?$/i);
      const filename = filenameMatch?.[1] || "download";

      // Create download link
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
      eventSource.close();

      // Reset state after download is complete
      setDownloadingId(null);
      setDownloadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[id];
        return newProgress;
      });
    } catch (err) {
      console.error("Download error:", err);
      setDownloadingId(null);
      setDownloadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[id];
        return newProgress;
      });
    }
  };

  return (
    <>
      {error && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">{error}</p>
          {requiresAuth && (
            <Button
              onClick={() => router.push("/sign-in")}
              className="mt-2"
              variant="outline"
            >
              Sign In to Download More
            </Button>
          )}
        </div>
      )}

      {formats.map((format, idx) => {
        const downloadId = `${type}-${format.quality}-${idx}`;
        const isDownloading = downloadingId === downloadId;
        const downloadUrl = `/api/download?url=${encodeURIComponent(
          videoUrl
        )}&type=${type}&quality=${encodeURIComponent(format.quality)}`;

        return (
          <DownloadButton
            key={`${type}-${format.quality}-${idx}`}
            format={format}
            isDownloading={isDownloading}
            progress={downloadProgress[downloadId]}
            canDownload={canDownload}
            requiresAuth={requiresAuth}
            onDownload={() => handleDownload(downloadUrl, downloadId)}
            onSignIn={() => router.push("/sign-in")}
          />
        );
      })}
    </>
  );
}
