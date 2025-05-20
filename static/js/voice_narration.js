/**
 * Voice narration functionality for accessibility in AgriSaarthi
 * Provides text-to-speech capability for content on the Knowledge Hub page
 */

// Initialize the speech synthesis when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    initVoiceNarration();
});

/**
 * Initialize voice narration features
 */
function initVoiceNarration() {
    // Check if browser supports speech synthesis
    if ('speechSynthesis' in window) {
        // Add play buttons to all modal headers that don't already have them
        addPlayButtonsToModals();
        
        // Add event listeners to all play buttons
        setupEventListeners();
        
        // Add stop button to the page for controlling narration
        addNarrationControlPanel();
    } else {
        console.log('Text-to-speech not supported in this browser');
        // Hide any narration buttons if speech synthesis is not supported
        document.querySelectorAll('.play-audio').forEach(button => {
            button.style.display = 'none';
        });
    }
}

/**
 * Add play buttons to all modal headers
 */
function addPlayButtonsToModals() {
    // Add to modal headers
    document.querySelectorAll('.modal-header').forEach(header => {
        // Check if the header doesn't already have a play button
        if (!header.querySelector('.play-audio')) {
            const title = header.querySelector('.modal-title');
            if (title) {
                const modalBody = header.closest('.modal').querySelector('.modal-body');
                if (modalBody) {
                    // Create text to be read (title + first paragraph of content)
                    const titleText = title.textContent.trim();
                    const firstParagraph = modalBody.querySelector('p') ? 
                        modalBody.querySelector('p').textContent.trim() : '';
                    const textToRead = titleText + '. ' + firstParagraph;
                    
                    // Create play button
                    const playButton = document.createElement('button');
                    playButton.className = 'btn btn-sm btn-light play-audio ms-2';
                    playButton.setAttribute('data-text', textToRead);
                    playButton.setAttribute('aria-label', 'Play audio for ' + titleText);
                    playButton.innerHTML = '<i class="fas fa-volume-up"></i>';
                    
                    // Add to header
                    header.appendChild(playButton);
                }
            }
        }
    });
    
    // Add to section headers
    document.querySelectorAll('.card-header, .section-header').forEach(header => {
        // Check if the header doesn't already have a play button
        if (!header.querySelector('.play-audio')) {
            const title = header.querySelector('h5') || header.querySelector('h4') || header.querySelector('h3');
            if (title) {
                const section = header.closest('.card') || header.closest('section');
                const contentArea = section ? (section.querySelector('.card-body') || section) : null;
                
                if (contentArea) {
                    // Create text to be read (title + first paragraph of content)
                    const titleText = title.textContent.trim();
                    const firstParagraph = contentArea.querySelector('p') ? 
                        contentArea.querySelector('p').textContent.trim() : '';
                    const textToRead = titleText + '. ' + firstParagraph;
                    
                    // Create play button container
                    const btnContainer = document.createElement('div');
                    btnContainer.className = 'ms-auto';
                    
                    // Create play button
                    const playButton = document.createElement('button');
                    playButton.className = 'btn btn-sm btn-light play-audio';
                    playButton.setAttribute('data-text', textToRead);
                    playButton.setAttribute('aria-label', 'Play audio for ' + titleText);
                    playButton.innerHTML = '<i class="fas fa-volume-up"></i>';
                    
                    // Add to container
                    btnContainer.appendChild(playButton);
                    
                    // Make header a flex container if it's not already
                    if (window.getComputedStyle(header).display !== 'flex') {
                        header.style.display = 'flex';
                        header.style.justifyContent = 'space-between';
                        header.style.alignItems = 'center';
                    }
                    
                    // Add to header
                    header.appendChild(btnContainer);
                }
            }
        }
    });
}

/**
 * Add a control panel for narration to the page
 */
function addNarrationControlPanel() {
    // Check if control panel already exists
    if (document.getElementById('narration-controls')) {
        return;
    }
    
    // Create control panel
    const controlPanel = document.createElement('div');
    controlPanel.id = 'narration-controls';
    controlPanel.className = 'narration-controls';
    controlPanel.innerHTML = `
        <button id="stop-narration" class="btn btn-sm btn-danger" style="display:none;">
            <i class="fas fa-stop"></i> Stop Narration
        </button>
    `;
    
    // Append to the body
    document.body.appendChild(controlPanel);
    
    // Add styles for the control panel
    const style = document.createElement('style');
    style.textContent = `
        .narration-controls {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1050;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Set up event listeners for voice narration
 */
function setupEventListeners() {
    // Speech synthesis instances
    const synth = window.speechSynthesis;
    
    // Add click event listeners to all play buttons
    document.addEventListener('click', function(event) {
        const target = event.target.closest('.play-audio');
        if (target) {
            const textToRead = target.getAttribute('data-text');
            if (textToRead) {
                // Stop any ongoing speech
                synth.cancel();
                
                // Create a new utterance
                const utterance = new SpeechSynthesisUtterance(textToRead);
                
                // Set voice properties (can be customized based on user preferences)
                utterance.rate = 1.0; // Speed of speech (0.1 to 10)
                utterance.pitch = 1.0; // Pitch of voice (0 to 2)
                utterance.volume = 1.0; // Volume (0 to 1)
                
                // Show the stop button when speaking starts
                const stopButton = document.getElementById('stop-narration');
                if (stopButton) {
                    stopButton.style.display = 'block';
                    
                    // Event listener for when speech ends
                    utterance.onend = function() {
                        stopButton.style.display = 'none';
                    };
                }
                
                // Start speaking
                synth.speak(utterance);
            }
        }
    });
    
    // Stop button functionality
    const stopButton = document.getElementById('stop-narration');
    if (stopButton) {
        stopButton.addEventListener('click', function() {
            synth.cancel(); // Stop any ongoing speech
            stopButton.style.display = 'none';
        });
    }
}

/**
 * Read a specific text aloud
 * @param {string} text - The text to be read
 */
function readAloud(text) {
    if ('speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        synth.cancel(); // Stop any ongoing speech
        
        const utterance = new SpeechSynthesisUtterance(text);
        synth.speak(utterance);
    }
}