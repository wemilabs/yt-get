import { NextRequest, NextResponse } from "next/server";
import { execa } from "execa";
import { checkRateLimit } from "@/lib/rate-limit";
import { getYtDlpPath } from "@/lib/binaries";
import { getYtDlpCookieArgs, cleanupCookiesFile } from "@/lib/cookies";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Rate limiting - use user ID for authenticated users, IP for anonymous
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    const identifier = session?.user?.id || 
      request.headers.get("x-forwarded-for") || 
      request.headers.get("x-real-ip") || 
      "anonymous";
    
    const rateLimit = await checkRateLimit(identifier);
    
    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetTime);
      const hoursRemaining = Math.ceil((rateLimit.resetTime - Date.now()) / (1000 * 60 * 60));
      
      return NextResponse.json(
        { 
          error: "Rate limit exceeded",
          message: `You've reached the limit of 5 videos per 5 hours. Please try again in ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''} or upgrade to Pro for unlimited access.`,
          resetTime: rateLimit.resetTime,
          remaining: rateLimit.remaining,
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": rateLimit.resetTime.toString(),
          }
        }
      );
    }

    // Extract video ID for metadata
    const videoId = extractVideoId(url);
    
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    // Use yt-dlp to fetch video info and formats (fast & reliable)
    const binaryPath = getYtDlpPath();
    const cookieArgs = await getYtDlpCookieArgs();

    try {
      const { stdout } = await execa(binaryPath, [
        url,
        "--dump-single-json",
        "--no-check-certificates",
        "--no-warnings",
        "--prefer-free-formats",
        "--add-header", "referer:youtube.com",
        "--add-header", "user-agent:Mozilla/5.0",
        ...cookieArgs,
      ]);

      const info = JSON.parse(stdout);
      const result = processYtdlpResponse(info);

      return NextResponse.json(result, {
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": rateLimit.resetTime.toString(),
        },
      });
    } finally {
      // Clean up temporary cookies file
      cleanupCookiesFile();
    }
  } catch (error) {
    console.error("Error analyzing video:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze video" },
      { status: 500 }
    );
  }
}

function processYtdlpResponse(info: any) {
  const videoId = info.id;
  const title = info.title || "YouTube Video";
  const thumbnail = info.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  
  const videoFormats: Array<{ quality: string; format: string; url: string; filesize?: string }> = [];
  const audioFormats: Array<{ quality: string; format: string; url: string; filesize?: string }> = [];

  // Process video formats (with video and audio)
  const videoWithAudio = info.formats?.filter(
    (f: any) => f.vcodec !== "none" && f.acodec !== "none" && f.url
  ) || [];

  // Sort by quality (height) and take best options
  const uniqueVideoQualities = new Map();
  for (const format of videoWithAudio.sort((a: any, b: any) => (b.height || 0) - (a.height || 0))) {
    const quality = `${format.height}p`;
    if (!uniqueVideoQualities.has(quality) && uniqueVideoQualities.size < 5) {
      uniqueVideoQualities.set(quality, format);
      videoFormats.push({
        quality,
        format: format.ext?.toUpperCase() || "MP4",
        url: format.url,
        filesize: format.filesize ? formatFileSize(format.filesize) : undefined,
      });
    }
  }

  // Process audio-only formats
  const audioOnly = info.formats?.filter(
    (f: any) => f.acodec !== "none" && f.vcodec === "none" && f.url
  ) || [];

  // Sort by quality (abr - audio bitrate) and take best options
  const uniqueAudioQualities = new Map();
  for (const format of audioOnly.sort((a: any, b: any) => (b.abr || 0) - (a.abr || 0))) {
    const bitrate = format.abr ? `${Math.round(format.abr)}kbps` : "Audio";
    if (!uniqueAudioQualities.has(bitrate) && uniqueAudioQualities.size < 3) {
      uniqueAudioQualities.set(bitrate, format);
      audioFormats.push({
        quality: bitrate,
        format: format.ext?.toUpperCase() || "M4A",
        url: format.url,
        filesize: format.filesize ? formatFileSize(format.filesize) : undefined,
      });
    }
  }

  return {
    videoId,
    title,
    thumbnail,
    duration: info.duration,
    uploader: info.uploader,
    formats: {
      video: videoFormats.length > 0 ? videoFormats : [
        { quality: "No formats available", format: "-", url: "#" }
      ],
      audio: audioFormats.length > 0 ? audioFormats : [
        { quality: "No formats available", format: "-", url: "#" }
      ],
    },
  };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}
