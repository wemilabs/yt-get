"use client";

import { Check, Copy, ExternalLink, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { VideoHistory } from "@/db/schema";
import { formatTimeAgo } from "@/lib/utils";
import { deleteHistoryItem } from "@/server/history";
import { Button } from "./ui/button";

export function HistoryCard({ history }: { history: VideoHistory }) {
  const [isPending, startTransition] = useTransition();
  const [isCopied, setIsCopied] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteHistoryItem(history.id);
        setIsDeleted(true);
        toast.success("Removed from history", {
          description: "The item has been removed from your history.",
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("Failed to remove item:", errorMessage);
        toast.error("Failed to remove item", { description: errorMessage });
      }
    });
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(history.videoUrl);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to copy URL:", errorMessage);
    }
  };

  if (isDeleted) return null;

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      {/** biome-ignore lint/performance/noImgElement: false */}
      <img
        src={history.thumbnail}
        alt={history.title}
        className="w-32 h-20 object-cover rounded"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{history.title}</h3>
        <p className="text-sm text-muted-foreground">
          {history.uploader && `${history.uploader} • `}
          {history.quality} • {history.format}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatTimeAgo(new Date(history.createdAt))}
        </p>
      </div>
      <div className="flex shrink-0">
        <Button variant="ghost" size="icon" title="Watch on YouTube">
          <a href={history.videoUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" />
          </a>
        </Button>
        <Button
          onClick={handleCopyUrl}
          variant="ghost"
          size="icon"
          title="Copy URL"
        >
          {isCopied ? (
            <Check className="size-4 text-green-500" />
          ) : (
            <Copy className="size-4" />
          )}
        </Button>
        <Button
          onClick={handleDelete}
          disabled={isPending}
          variant="ghost"
          size="icon"
          className="hover:bg-destructive/10 hover:text-destructive"
          title="Delete"
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
