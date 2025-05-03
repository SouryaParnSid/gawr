# Troubleshooting Guide for Gawr AI Assistant

## Common Issues and Solutions

### "No changes visible in the website" or "Website not updating"

If you've made changes to the code but don't see them reflected in the browser, this is likely a caching issue. Web browsers aggressively cache static files to improve performance, which sometimes prevents new changes from being visible.

#### Solutions:

1. **Visit the refresh page first:**
   
   We've added a special page that clears browser caches and reloads the application:
   
   ```
   http://localhost:8000/refresh.html
   ```
   
   This page will automatically clear caches and redirect you to the application.

2. **Hard refresh your browser:**
   
   - **Windows/Linux**: Press `Ctrl + F5` or `Ctrl + Shift + R`
   - **Mac**: Press `Cmd + Shift + R`
   
   This forces the browser to bypass cache and reload everything.

3. **Clear browser cache manually:**
   
   - **Chrome**: Open DevTools (F12) → Right-click on the refresh button → Select "Empty Cache and Hard Reload"
   - **Firefox**: Press `Ctrl + Shift + Delete` → Select "Cache" → Click "Clear Now"
   - **Safari**: Press `Option + Cmd + E` to empty the cache, then `Cmd + R` to reload

4. **Use incognito/private browsing mode:**
   
   Private browsing windows don't use existing cache, so this can help test if caching is the issue.

5. **Disable the service worker:**
   
   If you're still having issues with cached content:
   
   - Open DevTools (F12)
   - Go to Application tab
   - Select "Service Workers" in the sidebar
   - Check "Bypass for network" option
   - Click "Unregister" next to the service worker

### Missing Icon Files

If you notice missing icons or 404 errors in the console:

1. Make sure the `icons` directory exists in the project root
2. Ensure it contains the required files:
   - `icon-192.png`
   - `icon-512.png`
   - `splash.png`

We've included placeholder icon files in the recent update, but you may want to replace them with actual icons.

### Server Not Starting

If the Flask server fails to start:

1. Ensure all dependencies are installed:
   ```
   pip install -r requirements.txt
   ```

2. Make sure no other process is using port 8000
   ```
   # Windows
   netstat -ano | findstr :8000
   
   # macOS/Linux
   lsof -i :8000
   ```

3. Check that your API key is properly set in the environment

### API Key Issues

If you see API key errors:

1. Run the setup script to properly configure your API key:
   ```
   python create_env.py
   ```

2. Make sure your Google API key has access to the Gemini models

## Technical Changes We Made

To fix the caching issues, we made the following changes:

1. Added cache-control headers to Flask responses
2. Updated the service worker to handle missing assets
3. Incremented the cache version to force a refresh
4. Created a dedicated refresh page to clear caches
5. Added placeholder icon files to prevent 404 errors

These changes should ensure that you always see the latest version of the website when developing. 