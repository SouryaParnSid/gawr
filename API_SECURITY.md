# API Key Security Guidelines

## Overview

This document outlines best practices for handling the Google API key in your Gemini AI Chatbot project. All sensitive API keys have been removed from the codebase for security.

## ⚠️ Important Security Warnings

1. **NEVER commit API keys to version control**
2. **NEVER share API keys in public repositories**
3. **NEVER hardcode API keys directly in application code**
4. **NEVER send API keys through insecure channels**

## Current Security Measures

The following security measures have been implemented to protect your API key:

1. **Environment Variables**: API key is stored in a `.env` file that is loaded at runtime
2. **Gitignore Rules**: The `.env` file is included in `.gitignore` to prevent accidental commits
3. **Secure Input**: The `create_env.py` script uses `getpass` to hide key input when typed
4. **No Hardcoded Keys**: All hardcoded API keys have been removed from the code
5. **Proper Error Handling**: The application displays clear error messages when no API key is found
6. **Strict API Key Requirement**: The setup script requires a valid API key to be entered

## Setting Up Your API Key

### Option 1: Use the Setup Script (Recommended)

Run the following command in your terminal:

```bash
python create_env.py
```

When prompted, enter your API key. The script will securely create the `.env` file.

### Option 2: Manual Setup

1. Create a file named `.env` in the project root
2. Add your API key in the following format:
   ```
   GOOGLE_API_KEY=your_api_key_here
   ```
3. Save the file

## Obtaining a Google API Key

If you don't already have a Google API key for Gemini:

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an account or sign in
3. Follow the prompts to create a new API key
4. Copy the API key and use it in the setup process above

## Best Practices for Your API Key

1. **Regularly Rotate Keys**: Change your API key regularly
2. **Use Restricted Keys**: Limit the permissions and scopes of your API key
3. **Monitor Usage**: Check for unusual activity in your Google Cloud Console
4. **Use Environment-Specific Keys**: Use different keys for development and production

## What to Do If Your Key Is Compromised

1. Immediately revoke the compromised key in Google Cloud Console
2. Generate a new key with appropriate restrictions
3. Update your `.env` file with the new key
4. Check your billing for unauthorized usage
5. Review your code and git history to ensure the key is not exposed elsewhere

Remember: API key security is your responsibility. Always handle keys with extreme caution. 