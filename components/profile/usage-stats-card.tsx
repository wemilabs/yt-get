import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Download, Video, Music } from "lucide-react";

type UsageStatsCardProps = {
  stats: {
    totalDownloads: number;
    currentPeriodDownloads: number;
    remainingDownloads: number;
    videoDownloads: number;
    audioDownloads: number;
  };
};

export function UsageStatsCard({ stats }: UsageStatsCardProps) {
  const usagePercentage = (stats.currentPeriodDownloads / 5) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Statistics</CardTitle>
        <CardDescription>Your download activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Period Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current period</span>
            <span className="font-medium">
              {stats.currentPeriodDownloads} / 5 downloads
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {stats.remainingDownloads} download{stats.remainingDownloads !== 1 ? 's' : ''} remaining
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Download className="size-4" />
              <span className="text-xs">Total</span>
            </div>
            <p className="text-2xl font-semibold">{stats.totalDownloads}</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Video className="size-4" />
              <span className="text-xs">Videos</span>
            </div>
            <p className="text-2xl font-semibold">{stats.videoDownloads}</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Music className="size-4" />
              <span className="text-xs">Audio</span>
            </div>
            <p className="text-2xl font-semibold">{stats.audioDownloads}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
