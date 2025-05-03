import os
import json
from flask import Flask, request, jsonify, send_from_directory, make_response
import google.generativeai as genai
import mimetypes

# Configure MIME types for all relevant files
mimetypes.add_type('image/png', '.png')
mimetypes.add_type('image/x-icon', '.ico')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/html', '.html')

# Try to load from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()  # loading all the environment variables
except Exception as e:
    print(f"Error loading .env file: {e}")

# Get API key from environment variable
api_key = os.getenv("GOOGLE_API_KEY")

# Configure the API
if api_key:
    genai.configure(api_key=api_key)
else:
    print("WARNING: GOOGLE_API_KEY not found in environment variables")

app = Flask(__name__, static_url_path='', static_folder='.')

# Custom error handler middleware
class ErrorHandlingMiddleware:
    def __init__(self, app):
        self.app = app
        
    def __call__(self, environ, start_response):
        try:
            return self.app(environ, start_response)
        except Exception as e:
            # Log the error but don't expose details to client
            print(f"Error handling request: {e}")
            status = '400 Bad Request'
            response_headers = [('Content-Type', 'text/html')]
            start_response(status, response_headers)
            return [b'<h1>400 Bad Request</h1><p>Invalid request format.</p>']

# Apply middleware
app.wsgi_app = ErrorHandlingMiddleware(app.wsgi_app)

# CORS headers for mobile support and cache control for development
@app.after_request
def add_headers(response):
    # CORS headers
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    
    # Cache control - prevent browser caching during development
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    
    return response

# Handle OPTIONS requests for CORS preflight
@app.route('/api/chat', methods=['OPTIONS'])
def handle_options():
    response = make_response()
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

# Serve the index.html file
@app.route('/')
def index():
    return send_from_directory('.', 'index.html', mimetype='text/html')

# Serve favicon.ico
@app.route('/favicon.ico')
def favicon():
    return send_from_directory('.', 'favicon.ico', mimetype='image/x-icon')

# CSS files with proper MIME type
@app.route('/<path:filename>.css')
def serve_css(filename):
    return send_from_directory('.', f'{filename}.css', mimetype='text/css')

# JavaScript files with proper MIME type
@app.route('/<path:filename>.js')
def serve_js(filename):
    return send_from_directory('.', f'{filename}.js', mimetype='application/javascript')

# Special route for icon files
@app.route('/icons/<path:filename>')
def serve_icon(filename):
    return send_from_directory('icons', filename, mimetype='image/png')

# Generic file server for other files
@app.route('/<path:filename>')
def serve_file(filename):
    mime_type, encoding = mimetypes.guess_type(filename)
    return send_from_directory('.', filename, mimetype=mime_type)

# API endpoint for chat
@app.route('/api/chat', methods=['POST'])
def chat():
    if not api_key:
        return jsonify({"error": "API key not configured"}), 401
    
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "Missing request body"}), 400
        
        question = data.get('message', '')
        if not question:
            return jsonify({"error": "Message cannot be empty"}), 400
        
        history = data.get('history', [])
        
        # Configure the model
        generation_config = {
            "temperature": 0.7,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 1024,
        }
        
        # Set up model and chat
        model = genai.GenerativeModel(model_name="gemini-1.5-flash", 
                                     generation_config=generation_config)
        
        # Format history for the model's expected format
        formatted_history = []
        for msg in history:
            role = "user" if msg["role"] == "user" else "model"
            formatted_history.append({"role": role, "parts": [msg["content"]]})
        
        # Start a chat session
        chat = model.start_chat(history=formatted_history)
        
        # Get response
        response = chat.send_message(question)
        
        return jsonify({"response": response.text})
    
    except Exception as e:
        error_message = str(e)
        print(f"Error processing request: {error_message}")
        
        # Provide more helpful error messages for common issues
        if "not found for API version" in error_message:
            return jsonify({
                "error": "Model not available. Please check your API key has access to Gemini 1.5 Flash, or try another model like 'gemini-1.0-pro'."
            }), 500
        elif "API key not valid" in error_message:
            return jsonify({"error": "API key is invalid. Please check your API key."}), 401
        elif "quota" in error_message.lower():
            return jsonify({"error": "API quota exceeded. Please check your Google AI Studio quota."}), 429
        else:
            return jsonify({"error": f"An error occurred: {error_message}"}), 500

if __name__ == '__main__':
    print("Starting Gawr AI server at http://localhost:8000")
    try:
        # Handle bad SSL/TLS connections better
        from werkzeug.serving import run_simple
        run_simple('0.0.0.0', 8000, app, use_debugger=True, use_reloader=True)
    except ImportError:
        # Fallback to standard Flask run
        app.run(host='0.0.0.0', port=8000, debug=True)
    
# For Vercel deployment
app = app 