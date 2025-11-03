import Link from "next/link";
import { Download } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";

export function HistoryEmptyState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Download />
        </EmptyMedia>
        <EmptyTitle>No download history yet</EmptyTitle>
        <EmptyDescription>
          Start downloading videos to see your history here
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link
          href="/"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Go to Homepage
        </Link>
      </EmptyContent>
    </Empty>
  );
}
