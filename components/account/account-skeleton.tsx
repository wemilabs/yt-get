import { Skeleton } from "../ui/skeleton";

export function AccountSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-24" />
      </div>

      <Skeleton className="h-40" />
    </div>
  );
}
