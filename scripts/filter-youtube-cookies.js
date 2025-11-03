#!/usr/bin/env node

/**
 * Filter cookies.txt to only include YouTube-related domains
 * This reduces file size to fit within Vercel's 64KB env var limit
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const cookiesFile = join(process.cwd(), "cookies.txt");
const outputFile = join(process.cwd(), "cookies-youtube.txt");

console.log("🔍 Filtering cookies to YouTube domains only...\n");

try {
  const content = readFileSync(cookiesFile, "utf-8");
  const lines = content.split("\n");
  
  // YouTube-related domains
  const youtubeDomains = [
    ".youtube.com",
    "youtube.com",
    ".google.com",
    "google.com",
    ".googlevideo.com",
    "googlevideo.com"
  ];
  
  const filteredLines = lines.filter(line => {
    // Keep comment lines
    if (line.startsWith("#")) return true;
    
    // Keep empty lines
    if (line.trim() === "") return true;
    
    // Check if line contains YouTube/Google domains
    return youtubeDomains.some(domain => line.includes(domain));
  });
  
  writeFileSync(outputFile, filteredLines.join("\n"), "utf-8");
  
  const originalSize = content.length;
  const filteredSize = filteredLines.join("\n").length;
  const savedPercent = Math.round((1 - filteredSize / originalSize) * 100);
  
  console.log(`✅ Filtered successfully!`);
  console.log(`   Original: ${originalSize} bytes`);
  console.log(`   Filtered: ${filteredSize} bytes`);
  console.log(`   Saved: ${savedPercent}% (${originalSize - filteredSize} bytes)\n`);
  console.log(`📝 Output saved to: cookies-youtube.txt\n`);
  
  // Now convert to base64
  const base64 = Buffer.from(filteredLines.join("\n")).toString("base64");
  const base64Size = base64.length;
  
  console.log(`Base64 size: ${base64Size} bytes`);
  
  if (base64Size > 65535) {
    console.log(`⚠️  Still too large! (${base64Size - 65535} bytes over limit)`);
    console.log(`   You may need to manually remove more cookies.\n`);
  } else {
    writeFileSync("cookies-youtube-base64.txt", base64, "utf-8");
    console.log(`✅ Base64 conversion successful!`);
    console.log(`   Saved to: cookies-youtube-base64.txt\n`);
    console.log(`Use this file for Vercel environment variable.`);
  }
  
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
