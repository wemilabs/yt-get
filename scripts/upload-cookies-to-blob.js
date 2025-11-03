#!/usr/bin/env node

/**
 * Upload cookies.txt to Vercel Blob Storage
 * Run once to store cookies in the cloud
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { put } from "@vercel/blob";

const cookiesFile = join(process.cwd(), "cookies.txt");

async function uploadCookies() {
  console.log("📤 Uploading cookies to Vercel Blob Storage...\n");

  try {
    const cookies = readFileSync(cookiesFile, "utf-8");

    // Upload to Vercel Blob
    const blob = await put("youtube-cookies.txt", cookies, {
      access: "public",
      addRandomSuffix: false,
    });

    console.log("✅ Upload successful!\n");
    console.log("Blob URL:", blob.url);
    console.log("\n📋 Add this to your Vercel environment variables:\n");
    console.log("━".repeat(60));
    console.log(`YOUTUBE_COOKIES_BLOB_URL=${blob.url}`);
    console.log("━".repeat(60));
    console.log("\nDone! Now redeploy your app.");
  } catch (error) {
    console.error("❌ Upload failed:", error.message);
    console.error("\nMake sure you have BLOB_READ_WRITE_TOKEN set:");
    console.error("  1. Go to Vercel dashboard → Storage → Create Blob Store");
    console.error("  2. Copy the token");
    console.error("  3. Set locally: export BLOB_READ_WRITE_TOKEN=<token>");
    process.exit(1);
  }
}

uploadCookies();
