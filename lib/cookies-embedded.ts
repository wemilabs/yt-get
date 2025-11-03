/**
 * Embedded cookies for production
 * This file should contain your base64-encoded YouTube cookies
 * It will be deployed with your app to Vercel
 */

// Replace this with your actual base64 cookies from cookies-base64.txt
// For security, only commit if this is for a dedicated YouTube account
export const EMBEDDED_COOKIES = process.env.YOUTUBE_COOKIES || "";
