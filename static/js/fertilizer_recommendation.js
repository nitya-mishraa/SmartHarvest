/**
 * JavaScript for Fertilizer Recommendation page
 * Handles form validation and crop-specific guidance
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get form element
    const fertilizerRecommendationForm = document.getElementById('fertilizerRecommendationForm');
    
    // Add form validation
    if (fertilizerRecommendationForm) {
        setupFormValidation(fertilizerRecommendationForm);
        
        // Set up crop-specific guidance
        setupCropGuidance();
    }
});

/**
 * Set up form validation for the fertilizer recommendation form
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
            if (!field.value.trim() || (field.tagName === 'SELECT' && field.value === '')) {
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
 * Setup crop-specific guidance when crop is selected
 */
function setupCropGuidance() {
    const cropSelect = document.getElementById('crop_type');
    
    if (cropSelect) {
        cropSelect.addEventListener('change', function() {
            // Get the selected crop
            const selectedCrop = this.value;
            
            // Display crop-specific guidance
            displayCropGuidance(selectedCrop);
        });
    }
}

/**
 * Display guidance specific to the selected crop
 * @param {string} cropType - The selected crop type
 */
function displayCropGuidance(cropType) {
    // Check if guidance element exists, create if not
    let guidanceElement = document.getElementById('cropGuidance');
    
    if (!guidanceElement) {
        guidanceElement = document.createElement('div');
        guidanceElement.id = 'cropGuidance';
        guidanceElement.className = 'alert alert-info mt-3';
        
        // Add after the form or in an appropriate place
        const form = document.getElementById('fertilizerRecommendationForm');
        form.parentNode.insertBefore(guidanceElement, form.nextSibling);
    }
    
    // Crop-specific guidance
    const cropGuidance = {
        'Rice': {
            'text': 'Rice typically requires higher nitrogen during vegetative growth. Balance with adequate P and K.',
            'npk': 'Common NPK ratio: 4-2-1'
        },
        'Wheat': {
            'text': 'Wheat needs balanced nutrition with emphasis on nitrogen and phosphorus.',
            'npk': 'Common NPK ratio: 3-1-1'
        },
        'Maize': {
            'text': 'Maize is a heavy feeder requiring high nitrogen, especially during growth stages.',
            'npk': 'Common NPK ratio: 3-1-2'
        },
        'Chickpea': {
            'text': 'Being a legume, chickpea can fix nitrogen. Focus on phosphorus and potassium.',
            'npk': 'Common NPK ratio: 1-2-1'
        },
        'Lentil': {
            'text': 'Lentils need less nitrogen but benefit from phosphorus and micronutrients.',
            'npk': 'Common NPK ratio: 1-3-1'
        },
        'Cotton': {
            'text': 'Cotton requires heavy feeding during boll formation. Balance all nutrients.',
            'npk': 'Common NPK ratio: 2-1-2'
        },
        'Sugarcane': {
            'text': 'Sugarcane is a long-duration crop requiring sustained nutrition.',
            'npk': 'Common NPK ratio: 3-1-3'
        },
        'Tea': {
            'text': 'Tea prefers acidic soils and needs balanced nutrition with micronutrients.',
            'npk': 'Common NPK ratio: 3-1-2'
        }
    };
    
    // Update guidance content
    if (cropType in cropGuidance) {
        guidanceElement.innerHTML = `
            <i class="fas fa-info-circle me-2"></i>
            <strong>${cropType} Fertilizer Guide:</strong> ${cropGuidance[cropType].text}
            <br>
            <strong>${cropGuidance[cropType].npk}</strong>
        `;
    } else {
        guidanceElement.innerHTML = `
            <i class="fas fa-info-circle me-2"></i>
            Enter accurate soil nutrient values for the best fertilizer recommendations for your ${cropType}.
        `;
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
