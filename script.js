document.addEventListener('DOMContentLoaded', function() {
    // Initialize elements
    const chatSection = document.getElementById('chat-section');
    const navLinks = document.querySelectorAll('.nav-links a');
    const infoContainers = document.querySelectorAll('.info-container');
    const themeToggle = document.getElementById('theme-toggle');
    const messagesContainer = document.getElementById('messages-container');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const clearChatBtn = document.getElementById('clear-chat-btn');
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    // Voice interface elements
    const voiceInputButton = document.getElementById('voice-input-button');
    const voiceStatus = document.getElementById('voice-status');
    const autoSpeakToggle = document.getElementById('auto-speak-toggle');
    
    // Permissions modal elements
    const permissionsModal = document.getElementById('permissions-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const resetPermissionsBtn = document.getElementById('reset-permissions');
    const continueWithoutBtn = document.getElementById('continue-without');
    
    // Mobile elements
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    // Chat history array
    let chatHistory = [];
    
    // Speech recognition and synthesis
    let recognition = null;
    let speechSynthesis = window.speechSynthesis;
    let isSpeaking = false;
    let currentUtterance = null;
    
    // Permissions modal handlers
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            hidePermissionsModal();
        });
    }
    
    if (resetPermissionsBtn) {
        resetPermissionsBtn.addEventListener('click', function() {
            // Reset the stored permission state
            localStorage.removeItem('microphonePermissionDenied');
            
            // Ask for permission again
            hidePermissionsModal();
            
            // If permissions API is available, try to reset permissions
            if (navigator.permissions && navigator.permissions.query) {
                navigator.permissions.query({ name: 'microphone' })
                    .then(function(permissionStatus) {
                        if (permissionStatus.state === 'denied') {
                            // Show settings instructions
                            showErrorMessage("Please reset permissions in your browser settings, then refresh the page.");
                        } else {
                            // Try to start recognition again
                            setTimeout(function() {
                                startRecognition();
                            }, 500);
                        }
                    })
                    .catch(function() {
                        // Just try again
                        setTimeout(function() {
                            startRecognition();
                        }, 500);
                    });
            } else {
                // Fallback for browsers without the Permissions API
                setTimeout(function() {
                    startRecognition();
                }, 500);
            }
        });
    }
    
    if (continueWithoutBtn) {
        continueWithoutBtn.addEventListener('click', function() {
            hidePermissionsModal();
            localStorage.setItem('microphonePermissionDenied', 'true');
            voiceInputButton.style.display = 'none';
        });
    }
    
    function showPermissionsModal() {
        if (permissionsModal) {
            permissionsModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
        }
    }
    
    function hidePermissionsModal() {
        if (permissionsModal) {
            permissionsModal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }
    
    // Check if speech recognition is supported
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        // Handle voice input results
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            messageInput.value = transcript;
            stopRecognition();
            // Auto-send the message after recognition
            sendMessage();
        };
        
        // Handle recognition end
        recognition.onend = function() {
            stopRecognition();
        };
        
        // Handle recognition errors
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            stopRecognition();
            
            if (event.error === 'not-allowed') {
                // For better user experience, show the permissions modal instead of just an error
                showPermissionsModal();
                
                // Also show a simple error message in the chat
                showErrorMessage("Microphone access was denied. Please check the permissions guide.");
                
                // Flag to track permission state
                localStorage.setItem('microphonePermissionDenied', 'true');
                
            } else if (event.error === 'no-speech') {
                showErrorMessage("I didn't hear anything. Please try again.");
            } else {
                showErrorMessage("Voice recognition error: " + event.error);
            }
        };
        
        // Check for permission before setting up the voice input button
        if (localStorage.getItem('microphonePermissionDenied') === 'true') {
            voiceInputButton.addEventListener('click', function() {
                showPermissionsModal();
            });
        } else {
            // Set up voice input button
            voiceInputButton.addEventListener('click', function() {
                // First check if user has previously interacted with the page
                // This helps with browsers that require user interaction before allowing microphone
                if (!hasUserInteracted) {
                    showErrorMessage("Please interact with the page first (type something or click a button) before using voice input.");
                    return;
                }
                
                // Check if we already have permission
                if (navigator.permissions && navigator.permissions.query) {
                    navigator.permissions.query({ name: 'microphone' })
                        .then(permissionStatus => {
                            if (permissionStatus.state === 'granted') {
                                toggleSpeechRecognition();
                            } else if (permissionStatus.state === 'prompt') {
                                // We'll get a prompt, proceed
                                toggleSpeechRecognition();
                                
                                // Add event listener for permission changes
                                permissionStatus.onchange = function() {
                                    if (this.state === 'granted') {
                                        localStorage.removeItem('microphonePermissionDenied');
                                    } else if (this.state === 'denied') {
                                        localStorage.setItem('microphonePermissionDenied', 'true');
                                        showPermissionsModal();
                                    }
                                };
                            } else if (permissionStatus.state === 'denied') {
                                showPermissionsModal();
                                localStorage.setItem('microphonePermissionDenied', 'true');
                            }
                        })
                        .catch(() => {
                            // If we can't check permissions, just try to start
                            toggleSpeechRecognition();
                        });
                } else {
                    // If permissions API is not available, just try to start
                    toggleSpeechRecognition();
                }
            });
        }
    } else {
        // Hide voice input button if speech recognition is not supported
        voiceInputButton.style.display = 'none';
        console.log('Speech recognition not supported in this browser');
    }
    
    // Track user interaction
    let hasUserInteracted = false;
    document.addEventListener('click', function() {
        hasUserInteracted = true;
    });
    document.addEventListener('keydown', function() {
        hasUserInteracted = true;
    });
    
    // Animate sidebar links on load
    animateSidebarLinks();
    
    // Initialize auto-speak from local storage
    if (localStorage.getItem('autoSpeak') === 'true') {
        autoSpeakToggle.checked = true;
    }
    
    // Save auto-speak preference
    autoSpeakToggle.addEventListener('change', function() {
        localStorage.setItem('autoSpeak', this.checked);
    });
    
    // Start/stop speech recognition
    function toggleSpeechRecognition() {
        if (voiceInputButton.classList.contains('listening')) {
            stopRecognition();
        } else {
            startRecognition();
        }
    }
    
    function startRecognition() {
        try {
            recognition.start();
            voiceInputButton.classList.add('listening');
            voiceStatus.classList.add('active');
        } catch (error) {
            console.error('Speech recognition error:', error);
            showErrorMessage("Could not start voice recognition. Please try again.");
        }
    }
    
    function stopRecognition() {
        try {
            recognition.stop();
        } catch (error) {
            console.error('Error stopping recognition:', error);
        }
        voiceInputButton.classList.remove('listening');
        voiceStatus.classList.remove('active');
    }
    
    // Text-to-speech functions
    function speakText(text) {
        // Stop any current speech
        stopSpeaking();
        
        // Clean the text (remove HTML tags, etc.)
        const cleanText = text.replace(/<(?:.|\n)*?>/gm, '')
                              .replace(/&nbsp;/g, ' ')
                              .replace(/&amp;/g, '&')
                              .replace(/&lt;/g, '<')
                              .replace(/&gt;/g, '>');
        
        // Create a new utterance
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        // Handle speaking events
        utterance.onstart = function() {
            isSpeaking = true;
        };
        
        utterance.onend = function() {
            isSpeaking = false;
            currentUtterance = null;
            
            // Remove 'speaking' class from all speak buttons
            document.querySelectorAll('.speak-btn').forEach(btn => {
                btn.classList.remove('speaking');
            });
        };
        
        utterance.onerror = function(event) {
            console.error('Speech synthesis error:', event);
            isSpeaking = false;
            currentUtterance = null;
        };
        
        // Store current utterance
        currentUtterance = utterance;
        
        // Speak the text
        speechSynthesis.speak(utterance);
    }
    
    function stopSpeaking() {
        if (isSpeaking) {
            speechSynthesis.cancel();
            isSpeaking = false;
            currentUtterance = null;
        }
    }
    
    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
            
            // Change icon based on sidebar state
            const icon = this.querySelector('i');
            if (sidebar.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                // Re-animate sidebar links when sidebar opens on mobile
                animateSidebarLinks();
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Close sidebar when clicking overlay
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            
            // Reset toggle button icon
            if (mobileMenuToggle) {
                const icon = mobileMenuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Close sidebar when clicking nav link on mobile
    const isMobile = window.matchMedia('(max-width: 480px)').matches;
    if (isMobile) {
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
                
                // Reset toggle button icon
                if (mobileMenuToggle) {
                    const icon = mobileMenuToggle.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }
    
    // Show sections when clicked in navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the target section id
            const targetId = this.getAttribute('href').substring(1);
            
            // Remove active class from all nav links
            navLinks.forEach(navLink => {
                navLink.parentElement.classList.remove('active');
            });
            
            // Add active class to current nav link
            this.parentElement.classList.add('active');
            
            // Hide all sections first
            chatSection.classList.remove('active');
            infoContainers.forEach(container => {
                container.classList.remove('active');
            });
            
            // Show the target section
            if (targetId === '') {
                // If it's the chat section (empty href)
                chatSection.classList.add('active');
            } else {
                // Find and show the target info container
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
            }
            
            // Animate the section
            animateSection(targetId === '' ? chatSection : document.getElementById(targetId));
        });
    });
    
    // Dark mode toggle
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        
        // Update the icon
        const icon = this.querySelector('i');
        if (document.body.classList.contains('dark-theme')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
        
        // Save theme preference
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });
    
    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.querySelector('i').classList.remove('fa-moon');
        themeToggle.querySelector('i').classList.add('fa-sun');
    }
    
    // Auto-expand the textarea as user types
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        
        // Reset to one row if empty
        if (this.value === '') {
            this.style.height = '';
        }
    });
    
    // Handle enter key in the textarea
    messageInput.addEventListener('keydown', function(e) {
        // Check if Enter is pressed without Shift
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent default to avoid line break
            sendMessage();
        }
    });
    
    // Send button click handler
    sendButton.addEventListener('click', sendMessage);
    
    // Clear chat button handler
    clearChatBtn.addEventListener('click', function() {
        // Stop any speaking that might be happening
        stopSpeaking();
        
        // Clear the chat UI
        messagesContainer.innerHTML = '';
        
        // Add back the welcome message
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'bot-message welcome-message';
        welcomeMessage.innerHTML = `
            <div class="bot-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>Hello! I'm Gawr AI, your friendly AI assistant. How can I help you today?</p>
            </div>
            <div class="message-actions">
                <button class="speak-btn" title="Listen to this message">
                    <i class="fas fa-volume-up"></i>
                </button>
            </div>
        `;
        messagesContainer.appendChild(welcomeMessage);
        
        // Add event listener to the speak button
        welcomeMessage.querySelector('.speak-btn').addEventListener('click', function() {
            const text = welcomeMessage.querySelector('.message-content p').textContent;
            this.classList.add('speaking');
            speakText(text);
        });
        
        // Clear the chat history
        chatHistory = [];
    });
    
    // Initialize ClipboardJS for copy buttons
    if (typeof ClipboardJS !== 'undefined') {
        const clipboard = new ClipboardJS('.copy-btn');
        
        clipboard.on('success', function(e) {
            // Visual feedback
            e.trigger.innerHTML = '<i class="fas fa-check"></i>';
            e.trigger.classList.add('copied');
            
            // Reset after 2 seconds
            setTimeout(() => {
                e.trigger.innerHTML = '<i class="far fa-copy"></i>';
                e.trigger.classList.remove('copied');
            }, 2000);
            
            e.clearSelection();
        });
    }
    
    // Function to send a message
    function sendMessage() {
        const message = messageInput.value.trim();
        
        // Don't send empty messages
        if (message === '') return;
        
        // Add user message to UI
        addMessageToUI('user', message);
        
        // Add to chat history
        chatHistory.push({
            role: 'user',
            content: message
        });
        
        // Clear input field
        messageInput.value = '';
        messageInput.style.height = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Send to API
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                history: chatHistory
            }),
            // Add timeout to prevent hanging requests
            signal: AbortSignal.timeout(15000) // 15 second timeout
        })
        .then(response => {
            if (!response.ok) {
                // Check for specific HTTP error codes
                if (response.status === 404) {
                    throw new Error('API endpoint not found. This may be a deployment path issue.');
                } else if (response.status === 401) {
                    throw new Error('API key is missing or invalid. Please check your API configuration.');
                } else if (response.status === 429) {
                    throw new Error('API quota exceeded. Please try again later.');
                } else if (response.status >= 500) {
                    throw new Error('Server error. Please try again later or contact support.');
                } else {
                    throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                }
            }
            return response.json();
        })
        .then(data => {
            // Hide typing indicator
            hideTypingIndicator();
            
            if (data.error) {
                // Show the error message received from the API
                if (data.details) {
                    showErrorMessage(`${data.error} - ${data.details}`);
                } else {
                    showErrorMessage(data.error);
                }
            } else {
                // Add bot response to UI
                const messageElement = addMessageToUI('bot', data.response);
                
                // Add to chat history
                chatHistory.push({
                    role: 'assistant',
                    content: data.response
                });
                
                // Auto-speak if enabled
                if (autoSpeakToggle.checked) {
                    const speakBtn = messageElement.querySelector('.speak-btn');
                    if (speakBtn) {
                        speakBtn.classList.add('speaking');
                        speakText(data.response);
                    }
                }
            }
            
            // Scroll to the bottom
            scrollToBottom();
        })
        .catch(error => {
            // Hide typing indicator
            hideTypingIndicator();
            
            // Check if error is from AbortSignal timeout
            if (error.name === 'TimeoutError' || error.name === 'AbortError') {
                showErrorMessage("Request timed out. Server may be unavailable or overloaded.");
                console.error('Timeout Error:', error);
            } else if (error.message.includes('Failed to fetch')) {
                // Network error, likely CORS or server unreachable
                showErrorMessage("Network error: Could not connect to the server. If this is a deployed version, check the server URL configuration.");
                // Try to detect if running on a deployed domain with a different path
                const currentDomain = window.location.hostname;
                if (currentDomain !== 'localhost' && currentDomain !== '127.0.0.1') {
                    console.error('Deployment detected, might need to adjust API endpoint paths');
                    // Add helpful troubleshooting message
                    showErrorMessage("This appears to be a deployed version. Make sure the server API endpoint matches the deployment URL structure.");
                }
                console.error('Fetch Error:', error);
            } else {
                // Generic error handler
                showErrorMessage(`Error: ${error.message || "Sorry, I couldn't connect to the server. Please try again later."}`);
                console.error('Error:', error);
            }
        });
    }
    
    // Function to add message to UI
    function addMessageToUI(role, content) {
        const messageElement = document.createElement('div');
        messageElement.className = role === 'user' ? 'user-message' : 'bot-message';
        
        // Format content - convert newlines to <br>
        const formattedContent = content.replace(/\n/g, '<br>');
        
        if (role === 'user') {
            messageElement.innerHTML = `
                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="message-content">
                    <p>${formattedContent}</p>
                </div>
            `;
        } else {
            messageElement.innerHTML = `
                <div class="bot-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>${formattedContent}</p>
                </div>
                <div class="message-actions">
                    <button class="speak-btn" title="Listen to this message">
                        <i class="fas fa-volume-up"></i>
                    </button>
                </div>
            `;
            
            // Add event listener to the speak button
            setTimeout(() => {
                const speakBtn = messageElement.querySelector('.speak-btn');
                if (speakBtn) {
                    speakBtn.addEventListener('click', function() {
                        // Toggle between speaking and not speaking
                        if (this.classList.contains('speaking')) {
                            stopSpeaking();
                            this.classList.remove('speaking');
                        } else {
                            // Remove speaking class from all other buttons
                            document.querySelectorAll('.speak-btn').forEach(btn => {
                                btn.classList.remove('speaking');
                            });
                            
                            this.classList.add('speaking');
                            const text = messageElement.querySelector('.message-content p').textContent;
                            speakText(text);
                        }
                    });
                }
            }, 0);
        }
        
        messagesContainer.appendChild(messageElement);
        
        // Scroll to the bottom
        scrollToBottom();
        
        // Add animation
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            messageElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        }, 10);
        
        return messageElement;
    }
    
    // Function to show typing indicator
    function showTypingIndicator() {
        // Create typing indicator if it doesn't exist
        if (!document.querySelector('.typing-indicator')) {
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'typing-indicator';
            typingIndicator.innerHTML = `
                <div class="bot-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="indicator-dots">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            `;
            messagesContainer.appendChild(typingIndicator);
            
            // Scroll to the bottom
            scrollToBottom();
        }
    }
    
    // Function to hide typing indicator
    function hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Function to show error message
    function showErrorMessage(errorText) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `
            <div class="error-icon">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <div class="error-content">
                <p>${errorText}</p>
            </div>
        `;
        messagesContainer.appendChild(errorElement);
        
        // Scroll to the bottom
        scrollToBottom();
    }
    
    // Function to scroll chat to bottom
    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Listen for orientation changes on mobile
    window.addEventListener('orientationchange', function() {
        // Adjust height after orientation change
        setTimeout(() => {
            const chatInterface = document.querySelector('.chat-interface');
            if (chatInterface) {
                // Force height recalculation for mobile
                if (window.matchMedia('(max-width: 480px)').matches) {
                    chatInterface.style.height = 'calc(100vh - 200px)';
                }
            }
            // Scroll to bottom to ensure messages remain visible
            scrollToBottom();
        }, 300); // Wait for the orientation change to complete
    });
    
    // Prevent zoom on double tap for touch devices
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Add speak button to welcome message on load
    document.addEventListener('DOMContentLoaded', function() {
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage && welcomeMessage.querySelector('.speak-btn')) {
            welcomeMessage.querySelector('.speak-btn').addEventListener('click', function() {
                const text = welcomeMessage.querySelector('.message-content p').textContent;
                this.classList.add('speaking');
                speakText(text);
            });
        }
    });
});

// Function to animate section transitions
function animateSection(section) {
    if (!section) return;
    
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        section.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
    }, 10);
}

// Function to animate sidebar links with a staggered effect
function animateSidebarLinks() {
    document.querySelectorAll('.nav-links li').forEach((link, index) => {
        link.style.opacity = '0';
        link.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            link.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            link.style.opacity = '1';
            link.style.transform = 'translateX(0)';
        }, 100 + (index * 100)); // Staggered delay
    });
} 