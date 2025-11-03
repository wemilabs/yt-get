"use client";

import { AlertCircle } from "lucide-react";

type RateLimitBannerProps = {
  remaining: number;
  total: number;
  resetTime?: number;
};

export function RateLimitBanner({ remaining, total, resetTime }: RateLimitBannerProps) {
  const percentage = (remaining / total) * 100;
  const isLow = remaining <= 2;
  
  const formatResetTime = (timestamp: number) => {
    const hours = Math.ceil((timestamp - Date.now()) / (1000 * 60 * 60));
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  };

  return (
    <div className={`p-4 rounded-lg border ${isLow ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800' : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`size-5 mt-0.5 ${isLow ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}`} />
        <div className="flex-1 space-y-1">
          <p className={`text-sm font-medium ${isLow ? 'text-orange-900 dark:text-orange-100' : 'text-blue-900 dark:text-blue-100'}`}>
            {remaining} of {total} free downloads remaining
          </p>
          {resetTime && (
            <p className={`text-xs ${isLow ? 'text-orange-700 dark:text-orange-300' : 'text-blue-700 dark:text-blue-300'}`}>
              Resets in {formatResetTime(resetTime)}
            </p>
          )}
          {isLow && (
            <p className="text-xs text-orange-700 dark:text-orange-300 mt-2">
              Upgrade to <span className="font-semibold">Pro</span> for unlimited downloads!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
