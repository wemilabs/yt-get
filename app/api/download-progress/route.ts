import { NextRequest } from "next/server";

const progressStreams = new Map<string, ReadableStream>();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const downloadId = searchParams.get("id");

  if (!downloadId) {
    return new Response("Missing download ID", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Store controller so download route can push updates
      const interval = setInterval(() => {
        const progress = globalThis.downloadProgress?.get(downloadId) || 0;
        const data = `data: ${JSON.stringify({ progress })}\n\n`;
        controller.enqueue(encoder.encode(data));

        // Close stream when download is complete
        if (progress >= 100) {
          clearInterval(interval);
          controller.close();
          globalThis.downloadProgress?.delete(downloadId);
        }
      }, 100);

      // Cleanup on close
      return () => {
        clearInterval(interval);
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

// Initialize global progress map
if (!globalThis.downloadProgress) {
  globalThis.downloadProgress = new Map<string, number>();
}

declare global {
  var downloadProgress: Map<string, number> | undefined;
}
