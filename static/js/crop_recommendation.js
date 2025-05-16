/**
 * JavaScript for Crop Recommendation page
 * Handles form validation and result display
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get form element
    const cropRecommendationForm = document.getElementById('cropRecommendationForm');
    
    // Add form validation
    if (cropRecommendationForm) {
        setupFormValidation(cropRecommendationForm);
        
        // Add range validation for soil parameters
        setupRangeValidation();
    }
});

/**
 * Set up form validation for the crop recommendation form
 * @param {HTMLFormElement} form - The form element to validate
 */
function setupFormValidation(form) {
    form.addEventListener('submit', function(e) {
        // Reset previous validation
        clearValidationErrors();
        
        let isValid = true;
        
        // Validate each required field
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                showValidationError(field, 'This field is required');
                isValid = false;
            }
        });
        
        // Validate numeric fields
        const numericFields = form.querySelectorAll('input[type="number"]');
        numericFields.forEach(field => {
            if (field.value.trim()) {
                const value = parseFloat(field.value);
                
                if (isNaN(value)) {
                    showValidationError(field, 'Please enter a valid number');
                    isValid = false;
                } else if (field.hasAttribute('min') && value < parseFloat(field.getAttribute('min'))) {
                    showValidationError(field, `Value must be at least ${field.getAttribute('min')}`);
                    isValid = false;
                } else if (field.hasAttribute('max') && value > parseFloat(field.getAttribute('max'))) {
                    showValidationError(field, `Value must be at most ${field.getAttribute('max')}`);
                    isValid = false;
                }
            }
        });
        
        if (!isValid) {
            e.preventDefault();
        }
    });
}

/**
 * Set up range validation with helpful guidance for soil parameters
 */
function setupRangeValidation() {
    const nitrogenInput = document.getElementById('nitrogen');
    const phosphorusInput = document.getElementById('phosphorus');
    const potassiumInput = document.getElementById('potassium');
    const phInput = document.getElementById('ph');
    
    // Add input event listeners to provide instant feedback
    if (nitrogenInput) {
        nitrogenInput.addEventListener('input', function() {
            validateNutrientLevel(this, 'Nitrogen');
        });
    }
    
    if (phosphorusInput) {
        phosphorusInput.addEventListener('input', function() {
            validateNutrientLevel(this, 'Phosphorus');
        });
    }
    
    if (potassiumInput) {
        potassiumInput.addEventListener('input', function() {
            validateNutrientLevel(this, 'Potassium');
        });
    }
    
    if (phInput) {
        phInput.addEventListener('input', function() {
            const value = parseFloat(this.value);
            
            // Remove any existing feedback
            removeFeedback(this);
            
            if (!isNaN(value)) {
                let feedback = '';
                let feedbackClass = '';
                
                if (value < 5.5) {
                    feedback = 'Acidic soil (suitable for tea, rice, potato)';
                    feedbackClass = 'text-warning';
                } else if (value >= 5.5 && value <= 7.5) {
                    feedback = 'Neutral pH (ideal for most crops)';
                    feedbackClass = 'text-success';
                } else {
                    feedback = 'Alkaline soil (suitable for legumes, cotton)';
                    feedbackClass = 'text-warning';
                }
                
                addFeedback(this, feedback, feedbackClass);
            }
        });
    }
}

/**
 * Validate nutrient level and provide feedback
 * @param {HTMLInputElement} input - The input element to validate
 * @param {string} nutrientName - Name of the nutrient for feedback message
 */
function validateNutrientLevel(input, nutrientName) {
    const value = parseFloat(input.value);
    
    // Remove any existing feedback
    removeFeedback(input);
    
    if (!isNaN(value)) {
        let feedback = '';
        let feedbackClass = '';
        
        if (value < 30) {
            feedback = `Low ${nutrientName} level`;
            feedbackClass = 'text-danger';
        } else if (value >= 30 && value < 60) {
            feedback = `Medium ${nutrientName} level`;
            feedbackClass = 'text-warning';
        } else {
            feedback = `High ${nutrientName} level`;
            feedbackClass = 'text-success';
        }
        
        addFeedback(input, feedback, feedbackClass);
    }
}

/**
 * Show validation error for a form field
 * @param {HTMLElement} field - The field with the error
 * @param {string} message - Error message to display
 */
function showValidationError(field, message) {
    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    
    // Add error class to field
    field.classList.add('is-invalid');
    
    // Add error message after the field
    field.parentNode.appendChild(errorDiv);
}

/**
 * Clear all validation errors
 */
function clearValidationErrors() {
    document.querySelectorAll('.is-invalid').forEach(field => {
        field.classList.remove('is-invalid');
    });
    
    document.querySelectorAll('.invalid-feedback').forEach(errorMsg => {
        errorMsg.remove();
    });
}

/**
 * Add feedback text below an input field
 * @param {HTMLElement} input - The input element
 * @param {string} message - Feedback message
 * @param {string} className - CSS class for styling
 */
function addFeedback(input, message, className) {
    // Create feedback element
    const feedbackDiv = document.createElement('small');
    feedbackDiv.className = `form-text ${className} feedback-text`;
    feedbackDiv.textContent = message;
    
    // Add feedback after the input
    input.parentNode.appendChild(feedbackDiv);
}

/**
 * Remove feedback from an input field
 * @param {HTMLElement} input - The input element
 */
function removeFeedback(input) {
    const feedbackElement = input.parentNode.querySelector('.feedback-text');
    if (feedbackElement) {
        feedbackElement.remove();
    }
}
