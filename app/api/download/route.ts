import { createReadStream } from "node:fs";
import { stat, unlink } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { execa } from "execa";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { rateLimits, videoHistory } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getFfmpegPath, getYtDlpPath } from "@/lib/binaries";
import { getYtDlpCookieArgs, cleanupCookiesFile } from "@/lib/cookies";
import { checkRateLimit } from "@/lib/rate-limit";

// Initialize global progress map
if (!globalThis.downloadProgress) {
  globalThis.downloadProgress = new Map<string, number>();
}

declare global {
  var downloadProgress: Map<string, number> | undefined;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");
  const type = searchParams.get("type"); // "video" or "audio"
  const quality = searchParams.get("quality"); // e.g., "1080p", "720p", "160kbps"
  const downloadId = searchParams.get("downloadId"); // Track progress per download

  if (!url || !type) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  // Check authentication status
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If not authenticated, enforce 1 download limit per IP
  if (!session?.user) {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0]
      : request.headers.get("x-real-ip") || "127.0.0.1";

    // For anonymous users, we use a special config with max 1 download
    // We need to check if they've already downloaded by looking at the count
    const [existingLimit] = await db
      .select()
      .from(rateLimits)
      .where(eq(rateLimits.identifier, ip))
      .limit(1);

    if (existingLimit && existingLimit.count >= 1) {
      return NextResponse.json(
        {
          error:
            "Download limit reached. Please sign in to download more videos.",
          requiresAuth: true,
          redirectTo: "/sign-in",
        },
        { status: 429 }
      );
    }
  }

  try {
    const binaryPath = getYtDlpPath();
    const cookieArgs = getYtDlpCookieArgs();

    // Generate temporary filename
    const timestamp = Date.now();
    const outputTemplate = path.join(
      process.cwd(),
      ".next",
      `download-${timestamp}.%(ext)s`
    );

    // Locate ffmpeg binary
    const ffmpegBinaryPath = getFfmpegPath();

    const args = [
      url,
      "-o",
      outputTemplate,
      "--no-check-certificates",
      "--no-warnings",
      "--ffmpeg-location",
      ffmpegBinaryPath,
      ...cookieArgs,
    ];

    // Configure based on type
    if (type === "audio") {
      // Download best audio-only format (no conversion needed - faster!)
      args.push("-f", "bestaudio[ext=m4a]/bestaudio");
    } else {
      // Video - just download best combined format (no merging needed)
      if (quality) {
        const heightMatch = quality.match(/(\d+)p/);
        if (heightMatch) {
          args.push(
            "-f",
            `best[height<=${heightMatch[1]}][ext=mp4]/bestvideo[height<=${heightMatch[1]}]+bestaudio/best[height<=${heightMatch[1]}]`
          );
        }
      } else {
        args.push("-f", "best[ext=mp4]/bestvideo+bestaudio/best");
      }
    }

    // Execute download with progress tracking
    console.log("Executing yt-dlp with args:", args);

    if (downloadId) {
      globalThis.downloadProgress?.set(downloadId, 0);
    }

    const ytdlp = execa(binaryPath, args);

    // Track progress from stdout
    ytdlp.stdout?.on("data", (data) => {
      const output = data.toString();
      // Parse yt-dlp progress: [download] 45.2% of 123.45MiB
      const progressMatch = output.match(/\[download\]\s+(\d+\.\d+)%/);
      if (progressMatch && downloadId) {
        const progress = Math.round(parseFloat(progressMatch[1]));
        globalThis.downloadProgress?.set(downloadId, progress);
        console.log(`Download progress: ${progress}%`);
      }
    });

    const { stdout } = await ytdlp;
    console.log("Download stdout:", stdout);

    // Mark as complete
    if (downloadId) {
      globalThis.downloadProgress?.set(downloadId, 100);
    }

    // Find the actual downloaded file
    const fileMatch = stdout.match(
      /Merging formats into "(.+?)"|Destination:\s+(.+?)\s|\[download\]\s+(.+?)\s+has already/
    );
    let downloadedFile = fileMatch?.[1] || fileMatch?.[2] || fileMatch?.[3];

    // Fallback: try to detect the extension from output
    if (!downloadedFile) {
      const fallbackExt = type === "audio" ? "m4a" : "mp4";
      downloadedFile = outputTemplate.replace("%(ext)s", fallbackExt);
    }

    console.log("Downloaded file path:", downloadedFile);

    // Get file stats and info
    console.log("Reading file:", downloadedFile);
    const fileStats = await stat(downloadedFile);
    console.log("File size:", fileStats.size, "bytes");

    // Get file info for proper filename
    const { stdout: infoJson } = await execa(binaryPath, [
      url,
      "--dump-single-json",
      "--no-warnings",
      ...cookieArgs,
    ]);
    const info = JSON.parse(infoJson);

    // Detect actual file extension
    const fileExt =
      downloadedFile.match(/\.([^.]+)$/)?.[1] ||
      (type === "audio" ? "m4a" : "mp4");
    const filename = `${info.title || "download"}.${fileExt}`.replace(
      /[<>:"/\\|?*]/g,
      "_"
    ); // Sanitize filename

    // Save to history if user is authenticated
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (session?.user) {
        await db.insert(videoHistory).values({
          userId: session.user.id,
          videoId: info.id,
          videoUrl: url,
          title: info.title || "Unknown",
          thumbnail: info.thumbnail || "",
          duration: info.duration,
          uploader: info.uploader,
          downloadType: type,
          quality: quality || "best",
          format: fileExt.toUpperCase(),
        });
      } else {
        // For anonymous users, update their rate limit count
        const forwarded = request.headers.get("x-forwarded-for");
        const ip = forwarded
          ? forwarded.split(",")[0]
          : request.headers.get("x-real-ip") || "127.0.0.1";

        await checkRateLimit(ip, "free");
      }
    } catch (err) {
      console.error("Failed to save history or update rate limit:", err);
      // Don't fail the download if history saving fails
    }

    // Set up response headers
    const mimeTypes: Record<string, string> = {
      mp4: "video/mp4",
      m4a: "audio/mp4",
      webm: "video/webm",
      mp3: "audio/mpeg",
    };

    // Create a readable stream from the file
    const fileStream = createReadStream(downloadedFile);

    // Convert Node.js stream to Web Stream
    const webStream = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => {
          controller.enqueue(chunk);
        });

        fileStream.on("end", () => {
          controller.close();
          // Clean up file after streaming completes
          setTimeout(() => {
            unlink(downloadedFile).catch((err) => {
              console.error("Failed to delete temporary file:", err);
            });
          }, 1000);
        });

        fileStream.on("error", (err) => {
          controller.error(err);
        });
      },
      cancel() {
        fileStream.destroy();
      },
    });

    // Return streaming response
    return new Response(webStream, {
      status: 200,
      headers: {
        "Content-Type": mimeTypes[fileExt] || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": fileStats.size.toString(),
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Download failed" },
      { status: 500 }
    );
  } finally {
    // Clean up temporary cookies file
    cleanupCookiesFile();
  }
}
