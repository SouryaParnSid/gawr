/**
 * Deployment Fixes for Gawr AI
 * 
 * This script helps fix common issues that occur when deploying Gawr AI
 * to various hosting platforms. It handles API path adjustments, CORS issues,
 * and connection failures by dynamically detecting the environment.
 */

(function() {
    console.log('Deployment fix script loaded');

    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Detect if this is a deployed version
        const isDeployed = window.location.hostname !== 'localhost' && 
                          window.location.hostname !== '127.0.0.1';
        
        if (isDeployed) {
            console.log('Deployed environment detected:', window.location.hostname);
            applyDeploymentFixes();
        }
    });

    // Apply necessary fixes for deployment environments
    function applyDeploymentFixes() {
        fixApiPaths();
        addConnectionRetry();
        registerServiceWorker();
    }

    // Fix API paths for various deployment platforms
    function fixApiPaths() {
        // Override fetch to add the correct base path
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
            if (typeof url === 'string' && url.startsWith('/api/')) {
                // Handle different deployment platforms
                if (window.location.pathname.includes('/api')) {
                    // For platforms that need a different API path structure
                    url = url.replace('/api/', '/');
                    console.log('Adjusted API path to:', url);
                } else if (window.location.hostname.includes('vercel') || 
                           window.location.hostname.includes('netlify')) {
                    // For Vercel, Netlify and similar platforms
                    const basePath = window.location.pathname.endsWith('/') 
                        ? window.location.pathname 
                        : window.location.pathname + '/';
                    url = basePath + url.substring(1);
                    console.log('Adjusted API path for Vercel/Netlify to:', url);
                }
            }
            return originalFetch(url, options);
        };
    }

    // Add retry mechanism for failed connections
    function addConnectionRetry() {
        // Store the original fetch
        const originalFetch = window.fetch;
        
        // Override fetch with a retry mechanism
        window.fetch = function(url, options) {
            const MAX_RETRIES = 3;
            
            // Function to retry the fetch with exponential backoff
            async function fetchWithRetry(retryCount) {
                try {
                    return await originalFetch(url, options);
                } catch (error) {
                    if (retryCount < MAX_RETRIES && 
                        (error.message.includes('Failed to fetch') || 
                         error.name === 'AbortError')) {
                        
                        // Calculate delay with exponential backoff (1s, 2s, 4s)
                        const delay = Math.pow(2, retryCount) * 1000;
                        console.log(`Retrying fetch (${retryCount + 1}/${MAX_RETRIES}) after ${delay}ms...`);
                        
                        // Wait for the delay
                        await new Promise(resolve => setTimeout(resolve, delay));
                        
                        // Retry the fetch
                        return fetchWithRetry(retryCount + 1);
                    }
                    
                    // If we've exhausted retries or it's not a network error, throw
                    throw error;
                }
            }
            
            // Only add retry for API calls
            if (typeof url === 'string' && url.includes('/api/')) {
                return fetchWithRetry(0);
            } else {
                return originalFetch(url, options);
            }
        };
    }

    // Register a service worker for offline support and caching
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                        console.log('ServiceWorker registration successful with scope: ', 
                            registration.scope);
                    })
                    .catch(function(error) {
                        console.log('ServiceWorker registration failed: ', error);
                    });
            });
        }
    }

    // Display a helpful error banner if API connection fails repeatedly
    window.showDeploymentHelp = function() {
        // Check if banner already exists
        if (document.getElementById('deployment-help-banner')) {
            return;
        }
        
        const banner = document.createElement('div');
        banner.id = 'deployment-help-banner';
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background-color: #ff4757;
            color: white;
            padding: 15px;
            text-align: center;
            font-family: sans-serif;
            z-index: 9999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        
        banner.innerHTML = `
            <strong>Deployment Issue Detected</strong>
            <p style="margin: 5px 0;">
                Cannot connect to the API server. This may be a configuration issue with the deployment.
                Check the server URL configuration and CORS settings.
            </p>
            <button id="close-deployment-banner" style="
                background-color: white;
                color: #ff4757;
                border: none;
                padding: 5px 10px;
                margin-top: 5px;
                border-radius: 3px;
                cursor: pointer;
            ">Close</button>
        `;
        
        document.body.appendChild(banner);
        
        // Add click handler to close button
        document.getElementById('close-deployment-banner').addEventListener('click', function() {
            banner.remove();
        });
    };
})(); 