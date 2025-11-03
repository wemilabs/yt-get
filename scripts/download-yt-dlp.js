#!/usr/bin/env node

import { chmodSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const binDir = join(__dirname, "..", "bin");
const platform = process.platform;

let downloadUrl;
let binaryName;

if (platform === "win32") {
  downloadUrl =
    "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe";
  binaryName = "yt-dlp.exe";
} else if (platform === "darwin") {
  downloadUrl =
    "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos";
  binaryName = "yt-dlp";
} else {
  // Use standalone Linux binary (not Python script)
  downloadUrl =
    "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux";
  binaryName = "yt-dlp";
}

const binaryPath = join(binDir, binaryName);

// Create bin directory if it doesn't exist
if (!existsSync(binDir)) {
  mkdirSync(binDir, { recursive: true });
}

// Skip if binary already exists and is valid (> 1MB)
if (existsSync(binaryPath)) {
  const stats = await import("node:fs").then((fs) => fs.statSync(binaryPath));
  if (stats.size > 1024 * 1024) {
    console.log("yt-dlp binary already exists, skipping download");
    process.exit(0);
  } else {
    console.log("Existing binary is too small, re-downloading...");
  }
}

console.log(`Downloading yt-dlp from ${downloadUrl}...`);

try {
  const response = await fetch(downloadUrl, {
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Verify the download is valid (should be > 1MB)
  if (buffer.length < 1024 * 1024) {
    throw new Error(`Downloaded file is too small (${buffer.length} bytes). Download may have failed.`);
  }

  writeFileSync(binaryPath, buffer);

  // Make binary executable on Unix systems
  if (platform !== "win32") {
    chmodSync(binaryPath, 0o755);
  }

  console.log(`yt-dlp downloaded successfully (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
} catch (err) {
  console.error("Download failed:", err.message);
  process.exit(1);
}
