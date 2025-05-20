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
                    // Create text to be read (title + comprehensive content)
                    const titleText = title.textContent.trim();
                    
                    // Get paragraphs and headings for a more complete narration
                    let contentToRead = '';
                    
                    // Add all paragraphs
                    modalBody.querySelectorAll('p').forEach(para => {
                        contentToRead += ' ' + para.textContent.trim();
                    });
                    
                    // Add subheadings and all their content
                    const subheadings = modalBody.querySelectorAll('h4, h5');
                    subheadings.forEach(heading => {
                        contentToRead += ' ' + heading.textContent.trim() + '. ';
                        
                        // Find all elements after this heading until the next heading or until the end
                        let nextElem = heading.nextElementSibling;
                        while (nextElem && !['H4', 'H5'].includes(nextElem.tagName)) {
                            if (nextElem.textContent && nextElem.textContent.trim() !== '') {
                                contentToRead += ' ' + nextElem.textContent.trim();
                            }
                            nextElem = nextElem.nextElementSibling;
                        }
                    });
                    
                    // Add list items
                    modalBody.querySelectorAll('ul, ol').forEach(list => {
                        list.querySelectorAll('li').forEach(item => {
                            contentToRead += ' ' + item.textContent.trim() + '.';
                        });
                    });
                    
                    // Combine title with content
                    const textToRead = titleText + '. ' + contentToRead;
                    
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
                    // Create text to be read (title + all content)
                    const titleText = title.textContent.trim();
                    
                    // Build full content string with all text elements
                    let fullContent = '';
                    
                    // Add all paragraphs
                    contentArea.querySelectorAll('p').forEach(para => {
                        fullContent += ' ' + para.textContent.trim();
                    });
                    
                    // Add all list items
                    contentArea.querySelectorAll('li').forEach(item => {
                        fullContent += ' ' + item.textContent.trim() + '.';
                    });
                    
                    // Add all other headings and content
                    contentArea.querySelectorAll('h3, h4, h5, h6').forEach(heading => {
                        fullContent += ' ' + heading.textContent.trim() + '. ';
                        
                        // Find content after this heading until next heading
                        let nextElem = heading.nextElementSibling;
                        while (nextElem && !['H3', 'H4', 'H5', 'H6'].includes(nextElem.tagName)) {
                            if (nextElem.textContent && nextElem.textContent.trim() !== '' &&
                                !nextElem.querySelector('li')) { // Skip list containers as we get items directly
                                fullContent += ' ' + nextElem.textContent.trim();
                            }
                            nextElem = nextElem.nextElementSibling;
                        }
                    });
                    
                    const textToRead = titleText + '. ' + fullContent;
                    
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
        // First check if this is a playing button that needs to be stopped
        if (event.target.closest('.play-audio[data-playing="true"]')) {
            synth.cancel(); // Stop any ongoing speech
            
            // Reset the button appearance
            const playingButton = event.target.closest('.play-audio[data-playing="true"]');
            const iconElement = playingButton.querySelector('i');
            if (iconElement) {
                iconElement.classList.remove('fa-stop');
                iconElement.classList.add('fa-volume-up');
                playingButton.classList.remove('btn-danger');
                playingButton.classList.add('btn-light');
                playingButton.removeAttribute('data-playing');
            }
            
            // Hide the global stop button
            const stopButton = document.getElementById('stop-narration');
            if (stopButton) {
                stopButton.style.display = 'none';
            }
            
            // Prevent the click from triggering another narration
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        
        // Otherwise check if this is a play button that needs to start narration
        const target = event.target.closest('.play-audio');
        if (target && !target.hasAttribute('data-playing')) {
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
                }
                
                // Convert play button to a stop button temporarily
                const iconElement = target.querySelector('i');
                if (iconElement) {
                    iconElement.classList.remove('fa-volume-up');
                    iconElement.classList.add('fa-stop');
                    target.classList.add('btn-danger');
                    target.classList.remove('btn-light');
                    
                    // Add a data attribute to mark it as currently playing
                    target.setAttribute('data-playing', 'true');
                }
                
                // When speech ends, convert back to play button
                utterance.onend = function() {
                    if (iconElement) {
                        iconElement.classList.remove('fa-stop');
                        iconElement.classList.add('fa-volume-up');
                        target.classList.remove('btn-danger');
                        target.classList.add('btn-light');
                        target.removeAttribute('data-playing');
                    }
                    
                    if (stopButton) {
                        stopButton.style.display = 'none';
                    }
                };
                
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
            
            // Reset all playing buttons
            document.querySelectorAll('.play-audio[data-playing="true"]').forEach(button => {
                const iconElement = button.querySelector('i');
                if (iconElement) {
                    iconElement.classList.remove('fa-stop');
                    iconElement.classList.add('fa-volume-up');
                    button.classList.remove('btn-danger');
                    button.classList.add('btn-light');
                    button.removeAttribute('data-playing');
                }
            });
        });
    }
    
    // Add ESC key handler to stop narration
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            synth.cancel(); // Stop any ongoing speech
            
            // Reset all playing buttons
            document.querySelectorAll('.play-audio[data-playing="true"]').forEach(button => {
                const iconElement = button.querySelector('i');
                if (iconElement) {
                    iconElement.classList.remove('fa-stop');
                    iconElement.classList.add('fa-volume-up');
                    button.classList.remove('btn-danger');
                    button.classList.add('btn-light');
                    button.removeAttribute('data-playing');
                }
            });
            
            // Hide the global stop button
            const stopButton = document.getElementById('stop-narration');
            if (stopButton) {
                stopButton.style.display = 'none';
            }
        }
    });
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