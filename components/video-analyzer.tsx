"use client";

import { useQueryState } from "nuqs";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { AnalysisResult } from "@/types/video";
import { RateLimitBanner } from "./rate-limit-banner";
import { VideoResult } from "./video-result";

export function VideoAnalyzer() {
  const [url, setUrl] = useQueryState("url", { defaultValue: "" });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rateLimit, setRateLimit] = useState<{
    remaining: number;
    resetTime: number;
  } | null>(null);

  const analyzeUrl = async (videoUrl: string) => {
    if (!videoUrl.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: videoUrl }),
      });

      const data = await response.json();

      // Extract rate limit info from headers
      const remaining = response.headers.get("X-RateLimit-Remaining");
      const resetTime = response.headers.get("X-RateLimit-Reset");

      if (remaining && resetTime) {
        setRateLimit({
          remaining: parseInt(remaining, 10),
          resetTime: parseInt(resetTime, 10),
        });
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to analyze video");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    setUrl(pastedText);
    analyzeUrl(pastedText);
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
  };

  return (
    <>
      {rateLimit && (
        <RateLimitBanner
          remaining={rateLimit.remaining}
          total={5}
          resetTime={rateLimit.resetTime}
        />
      )}

      <Input
        type="text"
        placeholder="Paste YouTube URL here..."
        value={url}
        onChange={(e) => handleUrlChange(e.target.value)}
        onPaste={handlePaste}
        className="h-10 md:h-12 text-center placeholder:text-sm text-sm md:text-base"
      />

      {loading && (
        <div className="text-center text-muted-foreground text-sm md:text-base">
          Analyzing video...
        </div>
      )}

      {error && <div className="text-center text-red-500 text-sm">{error}</div>}

      {result && <VideoResult result={result} videoUrl={url} />}
    </>
  );
}
