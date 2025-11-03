import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoAnalyzer } from "@/components/video-analyzer";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-destructive md:text-5xl">
            Decent YouTube downloader for everyone
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Paste a YouTube link to get started
          </p>
        </div>

        <Suspense fallback={<Skeleton className="h-12" />}>
          <VideoAnalyzer />
        </Suspense>
      </div>
    </div>
  );
}
