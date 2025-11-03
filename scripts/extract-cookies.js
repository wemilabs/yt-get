#!/usr/bin/env node

/**
 * Script to extract YouTube cookies from your browser
 * Run this script locally to generate cookies for yt-dlp
 * 
 * Usage:
 *   node scripts/extract-cookies.js [browser]
 * 
 * Browsers: chrome (default), firefox, edge, safari, brave, chromium
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const browser = process.argv[2] || "chrome";
const cookiesFile = join(process.cwd(), "cookies.txt");

console.log(`\n🍪 Extracting YouTube cookies from ${browser}...\n`);

try {
  // Check if yt-dlp is installed globally
  let ytdlpCommand = "yt-dlp";
  
  try {
    execSync("yt-dlp --version", { stdio: "ignore" });
  } catch {
    // Try python -m yt_dlp (fallback for Windows PATH issues)
    try {
      execSync("python -m yt_dlp --version", { stdio: "ignore" });
      ytdlpCommand = "python -m yt_dlp";
      console.log("ℹ️  Using 'python -m yt_dlp' (yt-dlp not in PATH)\n");
    } catch {
      console.error("❌ yt-dlp is not installed or not accessible.");
      console.error("\nInstall it with:");
      console.error("  pip install yt-dlp");
      console.error("  OR");
      console.error("  pipx install yt-dlp");
      console.error("\nIf already installed, add Python Scripts to PATH:");
      console.error("  Windows: Add to PATH: %APPDATA%\\Python\\Python3XX\\Scripts");
      console.error("  Or use: python -m yt_dlp");
      process.exit(1);
    }
  }

  // Extract cookies using yt-dlp
  console.log("Extracting cookies...");
  execSync(
    `${ytdlpCommand} --cookies-from-browser ${browser} --cookies ${cookiesFile} https://www.youtube.com`,
    { stdio: "inherit" }
  );

  if (!existsSync(cookiesFile)) {
    throw new Error("Cookies file was not created");
  }

  // Read the cookies file
  const cookies = readFileSync(cookiesFile, "utf-8");
  
  // Encode to base64 for environment variable
  const base64Cookies = Buffer.from(cookies).toString("base64");

  console.log("\n✅ Cookies extracted successfully!");
  console.log(`\n📋 Add this to your Vercel environment variables:\n`);
  console.log("━".repeat(60));
  console.log(`YOUTUBE_COOKIES=${base64Cookies}`);
  console.log("━".repeat(60));

  // Save to a .env.local file for local development
  const envLocalPath = join(process.cwd(), ".env.local");
  let envContent = "";
  
  if (existsSync(envLocalPath)) {
    envContent = readFileSync(envLocalPath, "utf-8");
    // Remove old YOUTUBE_COOKIES if exists
    envContent = envContent.replace(/YOUTUBE_COOKIES=.*/g, "").trim();
  }
  
  envContent += `\n\n# YouTube cookies for yt-dlp (expires ~6 months)\nYOUTUBE_COOKIES=${base64Cookies}\n`;
  writeFileSync(envLocalPath, envContent);

  console.log(`\n✅ Saved to .env.local for local development`);
  console.log("\n⚠️  Important:");
  console.log("  1. Add YOUTUBE_COOKIES to your Vercel project settings");
  console.log("  2. Cookies expire in ~6 months, you'll need to re-extract them");
  console.log("  3. Keep cookies.txt secure (already in .gitignore)");
  console.log("  4. Redeploy your Vercel app after adding the env variable\n");

} catch (error) {
  console.error("\n❌ Failed to extract cookies:", error.message);
  console.error("\nTroubleshooting:");
  console.error("  - Make sure you're logged into YouTube in your browser");
  console.error("  - Try a different browser (chrome, firefox, edge, etc.)");
  console.error("  - On macOS, you may need to grant Terminal access to browser data");
  process.exit(1);
}
