import { writeFileSync, unlinkSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Get the path to the temporary cookies file for yt-dlp
 */
export function getCookiesFilePath(): string {
  return join(process.cwd(), ".next", "youtube-cookies.txt");
}

/**
 * Create a temporary cookies file from the base64 environment variable
 * Returns the path to the cookies file, or null if no cookies are configured
 */
export function prepareCookiesFile(): string | null {
  const base64Cookies = process.env.YOUTUBE_COOKIES;
  
  if (!base64Cookies) {
    console.warn("⚠️  YOUTUBE_COOKIES environment variable not set. YouTube may block requests.");
    return null;
  }

  try {
    const cookiesContent = Buffer.from(base64Cookies, "base64").toString("utf-8");
    const cookiesPath = getCookiesFilePath();
    
    // Write cookies to temporary file
    writeFileSync(cookiesPath, cookiesContent, "utf-8");
    
    return cookiesPath;
  } catch (error) {
    console.error("Failed to prepare cookies file:", error);
    return null;
  }
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
export function getYtDlpCookieArgs(): string[] {
  const cookiesPath = prepareCookiesFile();
  
  if (!cookiesPath) {
    return [];
  }
  
  return ["--cookies", cookiesPath];
}
