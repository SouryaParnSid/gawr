import os
import getpass
import sys

def create_env_file():
    print("Creating secure .env file for your Gemini AI Chatbot")
    print("---------------------------------------------------")
    
    # Ask for API key, with no default fallback
    print("Enter your Google API key:")
    api_key = getpass.getpass("API Key: ")
    
    # If no input, exit with error
    if not api_key:
        print("❌ No API key provided. Cannot continue.")
        print("Please obtain an API key from https://aistudio.google.com/app/apikey")
        sys.exit(1)
    
    # Create the .env file securely
    try:
        with open('.env', 'w', encoding='ascii') as f:
            f.write(f"GOOGLE_API_KEY={api_key}")
        print("✅ .env file created successfully!")
        print("🔒 Your API key is now securely stored")
        print("Note: This file is excluded from git by .gitignore")
    except Exception as e:
        print(f"❌ Error creating .env file: {e}")
        sys.exit(1)

if __name__ == "__main__":
    create_env_file() 