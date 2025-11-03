import path from "path";

/**
 * Get the ffmpeg binary path for the current platform
 */
export function getFfmpegPath(): string {
  const platform = process.platform;
  const arch = process.arch;

  const packageMap: Record<string, string> = {
    "win32-x64": "@ffmpeg-installer+win32-x64@4.1.0",
    "darwin-x64": "@ffmpeg-installer+darwin-x64@4.1.0",
    "darwin-arm64": "@ffmpeg-installer+darwin-arm64@4.1.5",
    "linux-x64": "@ffmpeg-installer+linux-x64@4.1.0",
    "linux-arm64": "@ffmpeg-installer+linux-arm64@4.1.4",
  };

  const key = `${platform}-${arch}`;
  const packageName = packageMap[key];

  if (!packageName) {
    throw new Error(
      `Unsupported platform: ${platform}-${arch}. Supported platforms: ${Object.keys(packageMap).join(", ")}`
    );
  }

  const binaryName = platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
  const packageSlug = packageName.split("@")[1]; // e.g., "ffmpeg-installer+win32-x64"

  return path.join(
    process.cwd(),
    "node_modules",
    ".pnpm",
    packageName,
    "node_modules",
    "@ffmpeg-installer",
    packageSlug.split("+")[1], // e.g., "win32-x64"
    binaryName
  );
}

/**
 * Get the yt-dlp binary path for the current platform
 */
export function getYtDlpPath(): string {
  const platform = process.platform;
  const binaryName = platform === "win32" ? "yt-dlp.exe" : "yt-dlp";

  return path.join(
    process.cwd(),
    "node_modules",
    ".pnpm",
    "yt-dlp-exec@1.0.2",
    "node_modules",
    "yt-dlp-exec",
    "bin",
    binaryName
  );
}
