import { writeFileSync, unlinkSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Get the path to the temporary cookies file for yt-dlp
 */
export function getCookiesFilePath(): string {
  return join(process.cwd(), ".next", "youtube-cookies.txt");
}

/**
 * Create a temporary cookies file from base64 env var or Vercel Blob
 * Returns the path to the cookies file, or null if no cookies are configured
 */
export async function prepareCookiesFile(): Promise<string | null> {
  // Try base64 environment variable first (for smaller cookie files)
  const base64Cookies = process.env.YOUTUBE_COOKIES;
  
  if (base64Cookies) {
    try {
      const cookiesContent = Buffer.from(base64Cookies, "base64").toString("utf-8");
      const cookiesPath = getCookiesFilePath();
      writeFileSync(cookiesPath, cookiesContent, "utf-8");
      return cookiesPath;
    } catch (error) {
      console.error("Failed to decode base64 cookies:", error);
    }
  }

  // Try Vercel Blob Storage (for larger cookie files)
  const blobUrl = process.env.YOUTUBE_COOKIES_BLOB_URL;
  
  if (blobUrl) {
    try {
      console.log("📥 Downloading cookies from Vercel Blob...");
      const response = await fetch(blobUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const cookiesContent = await response.text();
      const cookiesPath = getCookiesFilePath();
      writeFileSync(cookiesPath, cookiesContent, "utf-8");
      
      console.log("✅ Cookies downloaded successfully");
      return cookiesPath;
    } catch (error) {
      console.error("Failed to download cookies from Blob:", error);
    }
  }

  console.warn("⚠️  No cookies configured. Set YOUTUBE_COOKIES or YOUTUBE_COOKIES_BLOB_URL. YouTube may block requests.");
  return null;
}

/**
 * Clean up the temporary cookies file
 */
export function cleanupCookiesFile(): void {
  const cookiesPath = getCookiesFilePath();
  
  try {
    if (existsSync(cookiesPath)) {
      unlinkSync(cookiesPath);
    }
  } catch (error) {
    // Ignore cleanup errors
    console.error("Failed to cleanup cookies file:", error);
  }
}

/**
 * Get yt-dlp arguments with cookies if available
 */
export async function getYtDlpCookieArgs(): Promise<string[]> {
  const cookiesPath = await prepareCookiesFile();
  
  if (!cookiesPath) {
    return [];
  }
  
  return ["--cookies", cookiesPath];
}
