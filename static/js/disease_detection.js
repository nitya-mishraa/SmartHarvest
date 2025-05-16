/**
 * JavaScript for Plant Disease Detection page
 * Handles image upload, preview, and detection process
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('plant_image');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const removeButton = document.getElementById('removeImage');
    const detectButton = document.getElementById('detectButton');
    
    // Set up drag and drop functionality
    if (uploadArea && fileInput) {
        setupDragAndDrop(uploadArea, fileInput);
    }
    
    // Set up image preview
    if (fileInput && imagePreview) {
        setupImagePreview(fileInput, imagePreview, imagePreviewContainer, detectButton);
    }
    
    // Set up remove button
    if (removeButton && fileInput) {
        setupRemoveButton(removeButton, fileInput, imagePreviewContainer, imagePreview, detectButton);
    }
    
    // Add click event to upload area
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', function() {
            fileInput.click();
        });
    }
});

/**
 * Set up drag and drop functionality for image upload
 * @param {HTMLElement} dropArea - The drop area element
 * @param {HTMLInputElement} fileInput - The file input element
 */
function setupDragAndDrop(dropArea, fileInput) {
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop area when dragging over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    // Remove highlight when dragging leaves drop area
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    dropArea.addEventListener('drop', function(e) {
        const dt = e.dataTransfer;
        fileInput.files = dt.files;
        
        // Trigger change event on file input
        const event = new Event('change');
        fileInput.dispatchEvent(event);
    }, false);
    
    // Helper functions
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        dropArea.classList.add('border-success');
    }
    
    function unhighlight() {
        dropArea.classList.remove('border-success');
    }
}

/**
 * Set up image preview when file is selected
 * @param {HTMLInputElement} fileInput - The file input element
 * @param {HTMLImageElement} imagePreview - The image preview element
 * @param {HTMLElement} container - The container for the preview
 * @param {HTMLButtonElement} detectButton - The detect button
 */
function setupImagePreview(fileInput, imagePreview, container, detectButton) {
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            
            // Validate file type
            if (!validateImageFile(file)) {
                showValidationError(fileInput, 'Please select a valid image file (JPG, JPEG, PNG)');
                return;
            }
            
            // Create file reader to read the file as data URL
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Set the source of the image preview
                imagePreview.src = e.target.result;
                
                // Show the preview container and enable submit button
                container.classList.remove('d-none');
                detectButton.disabled = false;
            }
            
            reader.readAsDataURL(file);
        }
    });
}

/**
 * Set up remove button to clear the selected image
 * @param {HTMLButtonElement} removeButton - The remove button
 * @param {HTMLInputElement} fileInput - The file input element
 * @param {HTMLElement} container - The preview container
 * @param {HTMLImageElement} imagePreview - The image preview element
 * @param {HTMLButtonElement} detectButton - The detect button
 */
function setupRemoveButton(removeButton, fileInput, container, imagePreview, detectButton) {
    removeButton.addEventListener('click', function() {
        // Clear the file input
        fileInput.value = '';
        
        // Clear the image preview
        imagePreview.src = '';
        
        // Hide the preview container and disable submit button
        container.classList.add('d-none');
        detectButton.disabled = true;
    });
}

/**
 * Validate that the file is an acceptable image type
 * @param {File} file - The file to validate
 * @returns {boolean} Whether the file is valid
 */
function validateImageFile(file) {
    // Get file extension
    const fileName = file.name;
    const fileExt = fileName.split('.').pop().toLowerCase();
    
    // List of acceptable image types
    const acceptableTypes = ['jpg', 'jpeg', 'png'];
    
    return acceptableTypes.includes(fileExt);
}

/**
 * Show validation error for a form field
 * @param {HTMLElement} field - The field with the error
 * @param {string} message - Error message to display
 */
function showValidationError(field, message) {
    // Clear previous errors
    clearValidationErrors();
    
    // Create alert element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle me-2"></i>${message}`;
    
    // Add after the field's parent
    field.parentNode.parentNode.appendChild(errorDiv);
}

/**
 * Clear all validation errors
 */
function clearValidationErrors() {
    document.querySelectorAll('.alert-danger').forEach(alert => {
        alert.remove();
    });
}
