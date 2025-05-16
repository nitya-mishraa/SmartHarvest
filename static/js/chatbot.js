/**
 * JavaScript for Chatbot page
 * Handles chat interactions, API calls, and language selection
 */

// Chat history
let chatHistory = [];

// Selected language
let currentLanguage = 'en';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize chat interface
    initChat();
    
    // Setup language selector
    setupLanguageSelector();
    
    // Load chat history from localStorage if available
    loadChatHistory();
    
    // Send welcome message
    sendWelcomeMessage();
});

/**
 * Initialize chat interface elements and event listeners
 */
function initChat() {
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');
    
    if (chatForm && userInput) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const message = userInput.value.trim();
            
            if (message) {
                sendMessage(message);
                userInput.value = '';
            }
        });
        
        // Enable sending message with Enter key
        userInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                chatForm.dispatchEvent(new Event('submit'));
            }
        });
    }
    
    // Clear chat button
    const clearChatBtn = document.getElementById('clearChat');
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', clearChat);
    }
}

/**
 * Setup language selector functionality
 */
function setupLanguageSelector() {
    const languageSelect = document.getElementById('chatLanguage');
    
    if (languageSelect) {
        // Set initial value from localStorage or default to English
        currentLanguage = localStorage.getItem('chatLanguage') || 'en';
        languageSelect.value = currentLanguage;
        
        // Update when language is changed
        languageSelect.addEventListener('change', function() {
            currentLanguage = this.value;
            localStorage.setItem('chatLanguage', currentLanguage);
            
            // Translate UI elements
            translateChatInterface();
            
            // Send a language changed message
            const languageName = languageSelect.options[languageSelect.selectedIndex].text;
            
            addSystemMessage(`Language changed to ${languageName}`);
        });
    }
}

/**
 * Translate chat interface elements based on selected language
 */
function translateChatInterface() {
    // In a real implementation, this would translate all UI elements
    // For demonstration, we'll translate just a few key elements
    
    const elements = {
        'chatHeader': {
            'en': 'AI Farming Assistant',
            'hi': 'कृषि AI सहायक',
            'ta': 'விவசாய AI உதவியாளர்',
            'te': 'వ్యవసాయ AI సహాయకుడు',
            'bn': 'কৃষি AI সহকারী',
            'mr': 'शेती AI सहाय्यक'
        },
        'chatPlaceholder': {
            'en': 'Type your farming question here...',
            'hi': 'अपना कृषि प्रश्न यहां टाइप करें...',
            'ta': 'உங்கள் விவசாய கேள்வியை இங்கே தட்டச்சு செய்யவும்...',
            'te': 'మీ వ్యవసాయ ప్రశ్నను ఇక్కడ టైప్ చేయండి...',
            'bn': 'আপনার কৃষি প্রশ্ন এখানে টাইপ করুন...',
            'mr': 'आपला शेती प्रश्न येथे टाइप करा...'
        },
        'sendButton': {
            'en': 'Send',
            'hi': 'भेजें',
            'ta': 'அனுப்பு',
            'te': 'పంపు',
            'bn': 'পাঠান',
            'mr': 'पाठवा'
        },
        'clearButton': {
            'en': 'Clear Chat',
            'hi': 'चैट साफ़ करें',
            'ta': 'அரட்டையை அழி',
            'te': 'చాట్ క్లియర్ చేయండి',
            'bn': 'চ্যাট পরিষ্কার করুন',
            'mr': 'चॅट साफ करा'
        }
    };
    
    // Update each element if it exists
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            // Choose language or fall back to English
            const translations = elements[id];
            element.textContent = translations[currentLanguage] || translations['en'];
            
            // For input placeholders
            if (element.tagName === 'INPUT') {
                element.placeholder = translations[currentLanguage] || translations['en'];
            }
        }
    });
}

/**
 * Send user message to chatbot API and handle response
 * @param {string} message - User's message
 */
function sendMessage(message) {
    // Add user message to chat
    addUserMessage(message);
    
    // Show typing indicator
    showTypingIndicator();
    
    // Add message to history
    chatHistory.push({ role: 'user', content: message });
    
    // Save chat history
    saveChatHistory();
    
    // Make API request to the backend
    fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: message,
            language: currentLanguage
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Hide typing indicator
        hideTypingIndicator();
        
        // Add bot response to chat
        if (data.response) {
            addBotMessage(data.response);
            
            // Add to chat history
            chatHistory.push({ role: 'assistant', content: data.response });
            
            // Save chat history
            saveChatHistory();
            
            // Scroll to bottom
            scrollToBottom();
        } else if (data.error) {
            addErrorMessage(data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        hideTypingIndicator();
        addErrorMessage('Sorry, I could not process your request at this time. Please try again later.');
    });
}

/**
 * Add user message to chat display
 * @param {string} message - User's message
 */
function addUserMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    
    if (chatMessages) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message user-message';
        
        messageDiv.innerHTML = `
            <div class="message-bubble">
                <p>${escapeHtml(message)}</p>
                <small class="message-time">${getCurrentTime()}</small>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }
}

/**
 * Add bot message to chat display
 * @param {string} message - Bot's message
 */
function addBotMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    
    if (chatMessages) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message bot-message';
        
        // Convert links, format text with markdown-like syntax
        const formattedMessage = formatMessage(message);
        
        messageDiv.innerHTML = `
            <div class="avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-bubble">
                <div class="message-content">${formattedMessage}</div>
                <small class="message-time">${getCurrentTime()}</small>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }
}

/**
 * Add system message to chat display
 * @param {string} message - System message
 */
function addSystemMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    
    if (chatMessages) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message system-message';
        
        messageDiv.innerHTML = `
            <div class="message-bubble">
                <p><i class="fas fa-info-circle me-2"></i>${escapeHtml(message)}</p>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }
}

/**
 * Add error message to chat display
 * @param {string} message - Error message
 */
function addErrorMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    
    if (chatMessages) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message error-message';
        
        messageDiv.innerHTML = `
            <div class="message-bubble">
                <p><i class="fas fa-exclamation-triangle me-2"></i>${escapeHtml(message)}</p>
                <small class="message-time">${getCurrentTime()}</small>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    
    // Remove any existing typing indicator
    hideTypingIndicator();
    
    if (chatMessages) {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        
        typingDiv.innerHTML = `
            <div class="avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-bubble">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        scrollToBottom();
    }
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

/**
 * Send welcome message when chat is initialized
 */
function sendWelcomeMessage() {
    // Only send welcome message if chat history is empty
    if (chatHistory.length === 0) {
        const welcomeMessages = {
            'en': "👋 Hello! I'm your AI farming assistant. How can I help with your agriculture questions today?",
            'hi': "👋 नमस्ते! मैं आपका AI कृषि सहायक हूँ। आज मैं आपके कृषि संबंधित प्रश्नों में कैसे मदद कर सकता हूँ?",
            'ta': "👋 வணக்கம்! நான் உங்கள் AI விவசாய உதவியாளர். இன்று உங்கள் விவசாய கேள்விகளுக்கு நான் எவ்வாறு உதவ முடியும்?",
            'te': "👋 హలో! నేను మీ AI వ్యవసాయ సహాయకుడిని. నేడు మీ వ్యవసాయ ప్రశ్నలకు నేను ఎలా సహాయం చేయగలను?",
            'bn': "👋 হ্যালো! আমি আপনার AI কৃষি সহকারী। আজ আমি আপনার কৃষি সম্পর্কিত প্রশ্নগুলিতে কীভাবে সাহায্য করতে পারি?",
            'mr': "👋 नमस्कार! मी तुमचा AI शेती सहाय्यक आहे. आज मी तुमच्या शेती प्रश्नांमध्ये कशी मदत करू शकतो?"
        };
        
        // Add initial message from bot
        const welcomeMessage = welcomeMessages[currentLanguage] || welcomeMessages['en'];
        
        setTimeout(() => {
            addBotMessage(welcomeMessage);
            
            // Add to chat history
            chatHistory.push({ role: 'assistant', content: welcomeMessage });
            
            // Save chat history
            saveChatHistory();
        }, 500);
    }
}

/**
 * Get current time in HH:MM format
 * @returns {string} Formatted time
 */
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Format message to add links and basic formatting
 * @param {string} message - Message to format
 * @returns {string} Formatted message with HTML
 */
function formatMessage(message) {
    let formatted = escapeHtml(message);
    
    // Convert URLs to links
    formatted = formatted.replace(
        /(https?:\/\/[^\s]+)/g, 
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    // Convert bold text (e.g., **bold**)
    formatted = formatted.replace(
        /\*\*(.*?)\*\*/g,
        '<strong>$1</strong>'
    );
    
    // Convert italic text (e.g., *italic*)
    formatted = formatted.replace(
        /\*(.*?)\*/g,
        '<em>$1</em>'
    );
    
    // Convert newlines to <br>
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} unsafe - Unsafe string that might contain HTML
 * @returns {string} Escaped safe string
 */
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Scroll chat to bottom
 */
function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

/**
 * Clear chat history and display
 */
function clearChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        // Clear chat display
        const chatMessages = document.getElementById('chatMessages');
        
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
        
        // Clear chat history
        chatHistory = [];
        localStorage.removeItem('chatHistory');
        
        // Send welcome message again
        sendWelcomeMessage();
    }
}

/**
 * Save chat history to localStorage
 */
function saveChatHistory() {
    try {
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    } catch (e) {
        console.error('Error saving chat history:', e);
    }
}

/**
 * Load chat history from localStorage and display
 */
function loadChatHistory() {
    try {
        const savedHistory = localStorage.getItem('chatHistory');
        
        if (savedHistory) {
            chatHistory = JSON.parse(savedHistory);
            
            // Display messages
            chatHistory.forEach(msg => {
                if (msg.role === 'user') {
                    addUserMessage(msg.content);
                } else if (msg.role === 'assistant') {
                    addBotMessage(msg.content);
                }
            });
        }
    } catch (e) {
        console.error('Error loading chat history:', e);
        // Reset if there's an error
        chatHistory = [];
    }
}
