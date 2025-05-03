/**
 * Microphone Fix Utility for Gawr AI
 * 
 * This script resolves common issues with browser microphone access
 * and improves compatibility across different browsers.
 */

(function() {
    // Check if speech recognition is supported
    const isSpeechRecognitionSupported = () => {
        return 'SpeechRecognition' in window || 
               'webkitSpeechRecognition' in window ||
               'mozSpeechRecognition' in window ||
               'msSpeechRecognition' in window;
    };

    // Check if the browser is iOS Safari (which has special requirements)
    const isIosSafari = () => {
        const ua = window.navigator.userAgent;
        const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
        const webkit = !!ua.match(/WebKit/i);
        return iOS && webkit && !ua.match(/CriOS/i) && !ua.match(/OPiOS/i);
    };

    // Handle iOS Safari-specific microphone issues
    const handleIosSafariMic = () => {
        if (!isIosSafari()) return;
        
        // iOS Safari requires user interaction to initialize audio
        const initAudio = () => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const dummySource = audioContext.createBufferSource();
            dummySource.buffer = audioContext.createBuffer(1, 1, 22050);
            dummySource.connect(audioContext.destination);
            
            // Start and immediately stop to trigger audio initialization
            dummySource.start(0);
            dummySource.stop(0);
            
            document.removeEventListener('click', initAudio);
        };
        
        document.addEventListener('click', initAudio);
    };

    // Fix microphone permission issues
    const fixMicrophonePermissions = () => {
        // For browsers that support Permissions API
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'microphone' })
                .then(permissionStatus => {
                    if (permissionStatus.state === 'denied') {
                        console.warn('Microphone permission is denied. Voice input features may not work.');
                        notifyMicPermissionIssue();
                    }

                    // Listen for permission changes
                    permissionStatus.onchange = function() {
                        if (this.state === 'granted') {
                            console.log('Microphone permission granted.');
                            // Remove any existing notifications
                            const notification = document.getElementById('mic-permission-notification');
                            if (notification) notification.remove();
                        } else if (this.state === 'denied') {
                            console.warn('Microphone permission denied.');
                            notifyMicPermissionIssue();
                        }
                    };
                })
                .catch(err => {
                    console.error('Error checking microphone permissions:', err);
                });
        }
    };

    // Create a notification for microphone permission issues
    const notifyMicPermissionIssue = () => {
        // Don't create duplicate notifications
        if (document.getElementById('mic-permission-notification')) return;
        
        const notification = document.createElement('div');
        notification.id = 'mic-permission-notification';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: rgba(255, 71, 87, 0.9);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: sans-serif;
            font-size: 14px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: 300px;
        `;
        
        notification.innerHTML = `
            <div>
                <strong>Microphone access blocked</strong>
                <p style="margin: 5px 0 0 0; font-size: 12px;">
                    Voice features won't work. Check browser settings to allow microphone access.
                </p>
            </div>
            <button id="close-mic-notification" style="
                background: none;
                border: none;
                color: white;
                font-size: 16px;
                cursor: pointer;
                margin-left: 10px;
            ">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Add close button functionality
        document.getElementById('close-mic-notification').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    };

    // Initialize speech recognition with fallbacks
    const initSpeechRecognition = () => {
        window.SpeechRecognition = window.SpeechRecognition || 
                                   window.webkitSpeechRecognition ||
                                   window.mozSpeechRecognition ||
                                   window.msSpeechRecognition;

        if (window.SpeechRecognition) {
            console.log('Speech recognition supported and initialized.');
        } else {
            console.warn('Speech recognition not supported in this browser.');
            // Set a global flag that the main script can check
            window.speechRecognitionSupported = false;
        }
    };

    // Fix the microphone button display issue
    const fixMicrophoneButton = () => {
        const voiceBtn = document.getElementById('voice-input-button');
        if (voiceBtn) {
            console.log('Fixing microphone button...');
            
            // Force the button to be visible
            voiceBtn.style.display = 'flex';
            voiceBtn.style.visibility = 'visible';
            voiceBtn.style.opacity = '1';
            
            // Also check the mic icon inside
            const micIcon = voiceBtn.querySelector('.fa-microphone');
            if (micIcon) {
                micIcon.style.display = 'inline-block';
                micIcon.style.visibility = 'visible';
            }
            
            // Force parent container visibility
            const container = document.querySelector('.chat-input-container');
            if (container) {
                container.style.display = 'flex';
                container.style.visibility = 'visible';
            }
            
            // Override any JS that might hide it
            localStorage.removeItem('microphonePermissionDenied');
        }
    };

    // Initialize
    const init = () => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                handleIosSafariMic();
                fixMicrophonePermissions();
                initSpeechRecognition();
                fixMicrophoneButton();
                
                // Also run after a short delay to catch any post-load scripts
                setTimeout(fixMicrophoneButton, 1000);
                setTimeout(fixMicrophoneButton, 2000);
            });
        } else {
            handleIosSafariMic();
            fixMicrophonePermissions();
            initSpeechRecognition();
            fixMicrophoneButton();
            
            // Also run after a short delay to catch any post-load scripts
            setTimeout(fixMicrophoneButton, 1000);
            setTimeout(fixMicrophoneButton, 2000);
        }
    };

    // Run initialization
    init();
})(); 