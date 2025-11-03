import { Activity, Suspense } from "react";
import { ClearHistoryButton } from "@/components/clear-history-button";
import { HistorySkeleton } from "@/components/history/history-skeleton";
import { HistoryCard } from "@/components/history-card";
import { HistoryEmptyState } from "@/components/history-empty-state";
import { getHistoryStats, getUserHistory } from "@/data/history";

async function HistoryContent() {
  const [history, stats] = await Promise.all([
    getUserHistory(),
    getHistoryStats(),
  ]);

  return (
    <>
      <div className="flex items-center justify-between py-6">
        <Activity mode={stats.total > 0 ? "visible" : "hidden"}>
          <p className="text-muted-foreground text-sm">{`${
            stats.total
          } download${stats.total !== 1 ? "s" : ""} • ${
            stats.videoCount
          } video${stats.videoCount !== 1 ? "s" : ""} • ${
            stats.audioCount
          } audio`}</p>
        </Activity>
        <Activity mode={stats.total > 0 ? "visible" : "hidden"}>
          <ClearHistoryButton />
        </Activity>
      </div>

      {history.length === 0 ? (
        <HistoryEmptyState />
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <HistoryCard key={item.id} history={item} />
          ))}
        </div>
      )}
    </>
  );
}

export default async function HistoryPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mt-2 space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold">History</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          View and manage your downloaded videos and audio files
        </p>
      </div>

      <Suspense fallback={<HistorySkeleton />}>
        <HistoryContent />
      </Suspense>
    </div>
  );
}
