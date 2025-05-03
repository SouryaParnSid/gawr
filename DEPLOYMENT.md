# Deployment Guide for Gawr AI Chat Assistant

This guide covers how to deploy your Gawr AI Chat Assistant to various platforms so it can be accessible on the web.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
  - [Render](#render)
  - [Heroku](#heroku)
  - [Vercel with Flask](#vercel-with-flask)
  - [Railway](#railway)
  - [AWS (EC2)](#aws-ec2)
- [Environment Variables](#environment-variables)
- [Additional Notes](#additional-notes)

## Prerequisites

Before deploying, make sure you have:

1. A working Gawr AI application with all files
2. A Google API key for Generative AI models
3. A GitHub account (for most deployment methods)
4. Your project pushed to a GitHub repository

## Deployment Options

### Render

[Render](https://render.com/) offers a simple deployment process with a free tier.

1. **Create a Render account** and sign in
2. **Create a new Web Service**
   - Connect your GitHub repository
   - Select the repository with your Gawr AI code
3. **Configure the service**:
   - Name: `gawr-ai-chat` (or any name you prefer)
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn server:app`
4. **Add environment variables**:
   - Click on the "Environment" tab
   - Add `GOOGLE_API_KEY` with your API key
5. **Deploy**:
   - Click "Create Web Service"
   - Wait for the deployment to complete

### Heroku

[Heroku](https://www.heroku.com/) is a popular platform for deploying web applications.

1. **Create a Heroku account** and install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. **Create a Procfile** in your project root:
   ```
   web: gunicorn server:app
   ```
3. **Add gunicorn to requirements.txt**:
   ```
   flask==2.3.3
   google-generativeai==0.3.1
   python-dotenv==1.0.0
   requests==2.31.0
   gunicorn==21.2.0
   ```
4. **Deploy to Heroku**:
   ```bash
   # Login to Heroku
   heroku login
   
   # Create a new Heroku app
   heroku create gawr-ai-chat
   
   # Set environment variables
   heroku config:set GOOGLE_API_KEY=your_api_key_here
   
   # Push to Heroku
   git push heroku main
   
   # Open the app
   heroku open
   ```

### Vercel with Flask

[Vercel](https://vercel.com/) can host Flask applications with some configuration.

1. **Create a vercel.json file** in your project root:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server.py"
       }
     ]
   }
   ```

2. **Modify server.py** to work with Vercel:
   - Add this line at the end of server.py:
   ```python
   app = app  # for Vercel deployment
   ```

3. **Deploy to Vercel**:
   - Install Vercel CLI: `npm install -g vercel`
   - Login: `vercel login`
   - Deploy: `vercel --prod`
   - Add environment variables in the Vercel dashboard

### Railway

[Railway](https://railway.app/) is a modern platform for deployment.

1. **Create a Railway account** and login
2. **Create a new project**:
   - Select "Deploy from GitHub repo"
   - Connect to your GitHub repository
3. **Configure environment variables**:
   - Add `GOOGLE_API_KEY` with your API key
4. **Set the start command**:
   - Add a `railway.json` file:
   ```json
   {
     "build": {
       "builder": "NIXPACKS",
       "buildCommand": "pip install -r requirements.txt"
     },
     "deploy": {
       "startCommand": "gunicorn server:app",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```
5. **Deploy**:
   - Railway will automatically deploy your app
   - Get your URL from the dashboard

### AWS (EC2)

For more control, you can deploy to an AWS EC2 instance:

1. **Launch an EC2 instance**:
   - Choose Amazon Linux or Ubuntu
   - Configure security groups to allow HTTP/HTTPS traffic
2. **SSH into your instance**:
   ```bash
   ssh -i your-key.pem ec2-user@your-instance-ip
   ```
3. **Install dependencies**:
   ```bash
   # For Amazon Linux
   sudo yum update -y
   sudo yum install -y python3 python3-pip git
   
   # For Ubuntu
   sudo apt update
   sudo apt install -y python3 python3-pip git
   ```
4. **Clone your repository**:
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```
5. **Set up your application**:
   ```bash
   pip3 install -r requirements.txt
   pip3 install gunicorn
   echo "GOOGLE_API_KEY=your_api_key_here" > .env
   ```
6. **Run with Gunicorn**:
   ```bash
   gunicorn --bind 0.0.0.0:8000 server:app
   ```
7. **Set up as a service**:
   - Create a systemd service file to keep your app running

## Environment Variables

For all deployment platforms, you need to set these environment variables:

- `GOOGLE_API_KEY`: Your Google API key for Generative AI

## Additional Notes

1. **HTTPS**: Most platforms provide HTTPS by default. If you're using a custom solution, consider using [Let's Encrypt](https://letsencrypt.org/) to obtain a free SSL certificate.

2. **Custom Domains**: All the platforms mentioned support custom domains. Check your provider's documentation for details.

3. **Scale Considerations**: 
   - For high traffic, consider upgrading to paid tiers
   - For very high scale, consider containerizing with Docker

4. **Monitoring**:
   - Most platforms include basic monitoring
   - Consider adding more advanced monitoring like Sentry for error tracking

5. **Backup**:
   - Ensure your code is backed up in a Git repository
   - If you store user data, implement appropriate backup strategies 