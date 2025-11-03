# YouTube Cookie Authentication Setup

This guide explains how to set up YouTube cookie authentication to bypass bot detection when using yt-dlp.

## Why Cookies Are Needed

YouTube has implemented bot detection that blocks automated requests from yt-dlp. To bypass this, you need to provide cookies from an authenticated browser session, making yt-dlp appear as a legitimate logged-in user.

## Prerequisites

- **yt-dlp** installed globally on your local machine
- A YouTube account (logged in to your browser)
- Access to your Vercel project settings

## Installation Steps

### 1. Install yt-dlp Locally

If you don't have yt-dlp installed globally:

```bash
# Using pip
pip install yt-dlp

# OR using pipx (recommended)
pipx install yt-dlp
```

Verify installation:
```bash
yt-dlp --version
```

### 2. Extract YouTube Cookies

Run the cookie extraction script from your project root:

```bash
node scripts/extract-cookies.js
```

**Browser options:**
```bash
node scripts/extract-cookies.js chrome   # Default
node scripts/extract-cookies.js firefox
node scripts/extract-cookies.js edge
node scripts/extract-cookies.js brave
node scripts/extract-cookies.js safari   # macOS only
```

**Troubleshooting:**

- **macOS:** You may need to grant Terminal access to browser data in System Preferences → Security & Privacy → Full Disk Access
- **Windows:** Make sure you're logged into YouTube in your browser
- **All platforms:** Close your browser before running the script if you encounter errors

### 3. Add to Vercel Environment Variables

The script will output a base64-encoded string. Copy this value and add it to your Vercel project:

**Via Vercel Dashboard:**
1. Go to your project → Settings → Environment Variables
2. Add new variable:
   - **Name:** `YOUTUBE_COOKIES`
   - **Value:** The base64 string from the script output
   - **Environment:** Production, Preview, Development (select all)
3. Click "Save"

**Via Vercel CLI:**
```bash
vercel env add YOUTUBE_COOKIES
# Paste the base64 string when prompted
# Select all environments
```

### 4. Redeploy Your Application

After adding the environment variable:

```bash
# Trigger a new deployment
git commit --allow-empty -m "Update environment variables"
git push

# OR redeploy via Vercel CLI
vercel --prod
```

### 5. Local Development Setup

The script automatically creates/updates `.env.local` with your cookies for local testing:

```env
YOUTUBE_COOKIES=your_base64_encoded_cookies_here
```

This file is already in `.gitignore` and won't be committed.

## Cookie Expiration & Maintenance

### When Do Cookies Expire?

YouTube cookies typically expire after **6 months**. When they expire, you'll see errors like:

```
ERROR: [youtube] Sign in to confirm you're not a bot
```

### Updating Expired Cookies

Simply re-run the extraction script:

```bash
node scripts/extract-cookies.js
```

Then update the `YOUTUBE_COOKIES` environment variable in Vercel and redeploy.

### Setting Up Monitoring

Add monitoring to detect when cookies expire:

1. **Vercel Logs:** Check for "Sign in to confirm you're not a bot" errors
2. **Alerting:** Set up Vercel integration alerts for 500 errors
3. **Calendar Reminder:** Set a reminder to refresh cookies every 5 months

## Security Considerations

### ⚠️ Important Security Notes

1. **Never commit cookies.txt or .env.local**
   - Both are already in `.gitignore`
   - Cookies contain authentication tokens for your YouTube account

2. **Use a dedicated YouTube account**
   - Consider creating a separate YouTube account for your app
   - Don't use your personal account with important data

3. **Keep cookies secure**
   - Treat the base64 string like a password
   - Only store it in Vercel's encrypted environment variables
   - Don't share it or commit it to version control

4. **Rotate cookies regularly**
   - Re-extract cookies every few months
   - Delete old `cookies.txt` files after extraction

## How It Works

### The Flow

1. **Extraction:** `extract-cookies.js` uses yt-dlp to extract cookies from your browser
2. **Encoding:** Cookies are base64-encoded for easy environment variable storage
3. **Runtime:** The app decodes cookies and creates a temporary file at runtime
4. **Usage:** yt-dlp uses the cookies file to authenticate requests
5. **Cleanup:** Temporary cookies file is deleted after each request

### Code Implementation

**Cookie Utility (`lib/cookies.ts`):**
```typescript
// Decodes base64 and creates temporary cookies.txt
prepareCookiesFile()

// Returns yt-dlp args: ["--cookies", "/path/to/cookies.txt"]
getYtDlpCookieArgs()

// Deletes temporary file
cleanupCookiesFile()
```

**API Routes:**
```typescript
const cookieArgs = getYtDlpCookieArgs();

await execa("yt-dlp", [
  url,
  "--dump-single-json",
  ...cookieArgs,  // Adds --cookies flag
]);

cleanupCookiesFile();  // Always cleanup
```

## Troubleshooting

### "yt-dlp: command not found"

Install yt-dlp globally:
```bash
pip install yt-dlp
# OR
pipx install yt-dlp
```

### "Failed to extract cookies"

1. Make sure you're logged into YouTube in your browser
2. Try a different browser
3. Close the browser and try again
4. On macOS, grant Terminal full disk access

### "Still getting bot detection errors"

1. Verify `YOUTUBE_COOKIES` is set in Vercel
2. Check that you've redeployed after adding the variable
3. Ensure cookies haven't expired (re-extract if needed)
4. Check Vercel logs for cookie-related errors

### "YOUTUBE_COOKIES environment variable not set" warning

This is a warning, not an error. The app will attempt to work without cookies, but may be blocked by YouTube. Add the environment variable to fix this.

## Testing

### Local Testing

```bash
# Set up local environment
node scripts/extract-cookies.js

# Start dev server
pnpm dev

# Test a video URL
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

### Production Testing

After deployment, test your API:

```bash
curl -X POST https://your-app.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

If successful, you should see video metadata without errors.

## Alternative Approaches (Not Recommended)

While cookies are the recommended approach, here are alternatives with their drawbacks:

### 1. YouTube Data API v3
- ❌ Doesn't provide download URLs (only metadata)
- ✅ Official and stable
- Use if you only need video information, not downloads

### 2. Rotating Proxies
- ❌ Complex setup
- ❌ Expensive
- ❌ Still may get blocked
- Use only if cookies consistently fail

### 3. Browser Automation (Puppeteer)
- ❌ Slow and resource-intensive
- ❌ Not suitable for serverless (Vercel)
- ❌ Expensive at scale
- Avoid for production

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify environment variables are set
3. Re-extract cookies
4. Ensure yt-dlp binary is up to date in your deployment

---

**Last Updated:** Setup for Vercel deployment with yt-dlp cookie authentication
