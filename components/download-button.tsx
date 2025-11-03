"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { VideoFormat } from "@/types/video";
import { Spinner } from "./ui/spinner";

type DownloadButtonProps = {
  format: VideoFormat;
  isDownloading: boolean;
  progress?: number;
  canDownload: boolean;
  requiresAuth: boolean;
  onDownload: () => void;
  onSignIn: () => void;
};

export function DownloadButton({
  format,
  isDownloading,
  progress,
  canDownload,
  requiresAuth,
  onDownload,
  onSignIn,
}: DownloadButtonProps) {
  const handleClick = () => {
    if (!canDownload && requiresAuth) {
      onSignIn();
    } else {
      onDownload();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div>
          <p className="font-medium">{format.quality}</p>
          <p className="text-sm text-muted-foreground">
            {format.format}
            {format.filesize && ` • ${format.filesize}`}
          </p>
        </div>
        <Button
          onClick={handleClick}
          disabled={isDownloading || (!canDownload && !requiresAuth)}
          className="flex items-center gap-2"
        >
          {isDownloading && <Spinner />}
          {isDownloading
            ? "Downloading..."
            : !canDownload && requiresAuth
            ? "Sign In to Download"
            : "Download"}
        </Button>
      </div>
      {isDownloading && progress !== undefined && (
        <div className="px-3 space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {progress}%
          </p>
        </div>
      )}
    </div>
  );
}
