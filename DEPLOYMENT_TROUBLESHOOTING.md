# Deployment Troubleshooting Guide for Gawr AI

This guide addresses common issues that may occur when deploying Gawr AI to various hosting platforms, especially focusing on the "Sorry, I couldn't connect to the server. Please try again later" error.

## Connection Issues After Deployment

If you're seeing the "Sorry, I couldn't connect to the server" error after deploying your app, follow these troubleshooting steps:

### 1. Check API Key Configuration

Make sure your Google API key is properly set in your deployment environment:

- Vercel: Set `GOOGLE_API_KEY` in the Environment Variables section of your project settings
- Heroku: Run `heroku config:set GOOGLE_API_KEY=your_key_here`
- Railway/Render/etc.: Check their respective documentation for setting environment variables

### 2. Verify File Deployment

Ensure all necessary files were deployed, especially:

- `deployment-fix.js` - Critical for handling API routing in production
- `server.py` - Make sure it's the latest version with path handling
- `vercel.json` - Critical if deploying to Vercel

### 3. Check API Paths

The most common cause of connection issues is mismatched API paths in deployment. Check the browser console (F12) for:

- 404 errors on API endpoints
- CORS errors (Cross-Origin Resource Sharing)
- Network requests failing

Our `deployment-fix.js` script should automatically adjust paths for most environments, but you can verify by:

1. Opening browser dev tools (F12)
2. Going to the Network tab
3. Sending a message in the chat
4. Looking for the `/api/chat` request and checking its status

### 4. CORS Issues

If you see CORS errors in the console, check:

1. That the `vercel.json` file has the proper CORS headers
2. That the `add_headers` function in `server.py` is working correctly
3. That your hosting platform isn't blocking CORS headers

### 5. Server Logs

Check the logs from your deployment platform for any server-side errors:

- Vercel: Check the "Deployments" tab, then click on your deployment, then "View Logs"
- Heroku: Run `heroku logs --tail`
- Railway/Render: Check their respective logging interfaces

Look for any error messages related to the API, missing files, or configuration issues.

### 6. Path Structure Issues

Some platforms use different path structures in production. If you see 404 errors for API calls, try:

1. Manually editing `deployment-fix.js` to match your platform's path structure
2. Update the `fixApiPaths` function to handle your specific deployment case

### 7. SSL/TLS Issues

If your deployment platform uses HTTPS but the Flask app isn't configured for it:

1. Make sure your hosting provider handles SSL/TLS termination
2. Alternatively, update the server to use HTTPS in production

### 8. Quick Fix Approach

If you need a quick fix, try these steps:

1. Force a complete cache clear with hard refresh (Ctrl+F5 or ⌘+Shift+R)
2. Visit the `/refresh` page on your deployed site to clear caches automatically
3. Try accessing the site in an incognito/private window

## Platform-Specific Troubleshooting

### Vercel

For Vercel deployments, check:

1. That `vercel.json` is in the root directory
2. That all routes are properly configured
3. That you've set the `GOOGLE_API_KEY` environment variable

Common Vercel issue: The API endpoint may need to be at `/api` instead of `/api/chat`. Edit the `deployment-fix.js` file to adjust this path if needed.

### Heroku

For Heroku deployments:

1. Make sure the `Procfile` is correct: `web: gunicorn server:app`
2. Check that you have `gunicorn` in your `requirements.txt`
3. Verify that you've set the API key: `heroku config:set GOOGLE_API_KEY=your_key_here`

### Railway/Render/Fly.io

These platforms usually work well with the default configuration. If you encounter issues:

1. Check their documentation for any platform-specific requirements
2. Make sure environment variables are set correctly
3. Verify that the static files are being served properly

## Using the Production Starter Script

For more reliable deployments, use the `start_production.py` script:

```bash
# Install required packages
pip install -r requirements.txt

# Run the production server
python start_production.py
```

This script automatically:
- Detects the deployment environment
- Configures the appropriate settings
- Uses Gunicorn for better performance
- Provides detailed logs

## Still Having Issues?

If you've tried all these steps and still have connection issues:

1. Check if your Google API key has valid permissions for Gemini models
2. Verify that your account has sufficient quota for API usage
3. Try temporarily downgrading to a simpler model in `server.py` (e.g., gemini-1.0-pro)
4. Check browser console for any JavaScript errors that might be preventing the fixes from working 