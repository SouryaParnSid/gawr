# Gawr AI Chatbot Website

A beautiful, modern web interface for Sourya Sarkar's Gawr AI Chatbot that embeds the Streamlit application in an elegant, responsive design.

## Features

- **Sleek, Modern UI**: Built with HTML5, CSS3, and vanilla JavaScript
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark/Light Mode**: Toggle between light and dark themes
- **Embedded Chatbot**: Seamlessly integrates the Streamlit chatbot
- **Copy-to-Clipboard**: Easy code copying for installation steps
- **Animated UI Elements**: Smooth transitions and animations
- **Detailed Documentation**: Comprehensive information about the chatbot

## How to Use

1. **Ensure the Streamlit app is running**:
   ```
   streamlit run qachat.py
   ```

2. **Open the website**:
   - Simply open `index.html` in your browser
   - Or serve the files with a static file server

3. **Navigation**:
   - Use the sidebar to navigate between different sections
   - The chatbot is embedded in the Chat section

## Network Access

The Streamlit app can be accessed at:
- Local URL: http://localhost:8501
- Network URL: http://172.16.0.2:8501

The website will automatically embed whichever URL is accessible from your browser.

## Structure

- `index.html` - Main HTML structure
- `styles.css` - All styling and theme definitions
- `script.js` - Interactive functionality and animations

## Requirements

- The Streamlit app must be running at http://localhost:8501
- Modern web browser with JavaScript enabled
- Internet connection (for Font Awesome and Google Fonts)

## Customization

You can easily customize the website by:

- Changing the color scheme in the CSS variables at the top of `styles.css`
- Updating the content in the HTML sections
- Modifying the animations and interactions in the JavaScript file

## Troubleshooting

- If the chatbot doesn't load, ensure that:
  - The Streamlit app is running (`streamlit run qachat.py`)
  - You're accessing the website and Streamlit app from the same machine
  - Your browser allows iframes from localhost

- Use the "Reload Chatbot" button if the iframe fails to load properly

## Repository

This project is part of the [Gawr AI Chatbot](https://github.com/SouryaS/p1) repository.

## Credits

- Developed by Sourya Sarkar
- Font Awesome for icons
- Google Fonts for typography
- ClipboardJS for copy functionality 