import { Skeleton } from "@/components/ui/skeleton";

export function HistorySkeleton() {
  return (
    <>
      <div className="flex items-center justify-between py-6">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    </>
  );
}
