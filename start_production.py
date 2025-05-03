"""
Production startup script for Gawr AI - handles various deployment environments
"""
import os
import sys
import logging
from gunicorn.app.base import BaseApplication
from server import app

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("gawr-production.log")
    ]
)
logger = logging.getLogger('gawr-production')

class GunicornApp(BaseApplication):
    """Gunicorn application for production deployment"""
    
    def __init__(self, app, options=None):
        self.options = options or {}
        self.application = app
        super().__init__()

    def load_config(self):
        for key, value in self.options.items():
            if key in self.cfg.settings and value is not None:
                self.cfg.set(key.lower(), value)

    def load(self):
        return self.application

def get_port():
    """Get the port from the environment or use default"""
    # Check different environment variables used by various platforms
    for var in ['PORT', 'VERCEL_PORT', 'WEB_PORT', 'HTTP_PORT']:
        if os.environ.get(var):
            return int(os.environ.get(var))
    return 8000  # Default port

def get_workers():
    """Calculate appropriate number of workers based on CPU cores"""
    import multiprocessing
    # Use the common formula: 2 * num_cores + 1
    return (2 * multiprocessing.cpu_count()) + 1

def configure_for_deployment():
    """Configure the app based on the deployment environment"""
    # Detect Vercel
    if os.environ.get('VERCEL'):
        logger.info("Detected Vercel deployment environment")
        
    # Detect Heroku
    elif os.environ.get('DYNO'):
        logger.info("Detected Heroku deployment environment")
        
    # Detect Railway
    elif os.environ.get('RAILWAY_STATIC_URL'):
        logger.info("Detected Railway deployment environment")
        
    # Detect Render
    elif os.environ.get('RENDER'):
        logger.info("Detected Render deployment environment")
        
    # Detect Fly.io
    elif os.environ.get('FLY_APP_NAME'):
        logger.info("Detected Fly.io deployment environment")
    
    # General production setup
    else:
        logger.info("Running in generic production environment")
    
    # Load environment variables from .env.production if available
    try:
        from dotenv import load_dotenv
        if os.path.exists('.env.production'):
            load_dotenv('.env.production')
            logger.info("Loaded production environment variables from .env.production")
    except ImportError:
        logger.warning("python-dotenv not installed, skipping .env.production loading")

def main():
    """Main entry point for production deployment"""
    logger.info("Starting Gawr AI in production mode")
    
    configure_for_deployment()
    
    # Check for Google API key
    if not os.environ.get('GOOGLE_API_KEY'):
        logger.error("GOOGLE_API_KEY not found in environment variables!")
        logger.error("Please set GOOGLE_API_KEY in your deployment environment")
        sys.exit(1)
    
    port = get_port()
    logger.info(f"Using port: {port}")
    
    # Determine host
    host = os.environ.get('HOST', '0.0.0.0')
    
    # Check if running in development mode
    if os.environ.get('FLASK_ENV') == 'development' or os.environ.get('DEBUG') == '1':
        logger.info("Running in development mode with werkzeug server")
        app.run(host=host, port=port, debug=True)
    else:
        # Production - use Gunicorn
        logger.info(f"Running in production mode with Gunicorn (workers: {get_workers()})")
        
        # Options for Gunicorn
        options = {
            'bind': f'{host}:{port}',
            'workers': get_workers(),
            'worker_class': 'sync',
            'timeout': 120,
            'accesslog': '-',  # Log to stdout
            'errorlog': '-',   # Log to stdout
            'capture_output': True,
        }
        
        # Start Gunicorn
        GunicornApp(app, options).run()

if __name__ == "__main__":
    main() 