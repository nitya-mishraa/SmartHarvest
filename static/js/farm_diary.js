/**
 * JavaScript for Farm Diary page
 * Handles form validation, filtering, and dynamic UI updates
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get form element
    const farmDiaryForm = document.getElementById('farmDiaryForm');
    
    // Add form validation
    if (farmDiaryForm) {
        setupFormValidation(farmDiaryForm);
        setupDynamicForm();
    }
    
    // Set up entry filtering
    setupEntryFiltering();
    
    // Setup expense/income summary calculation
    calculateSummary();
});

/**
 * Set up form validation for the farm diary form
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
        
        // Additional validation for amount if entry type is expense or income
        const entryType = document.getElementById('entry_type').value;
        const amountField = document.getElementById('amount');
        
        if ((entryType === 'expense' || entryType === 'income') && amountField) {
            if (!amountField.value.trim()) {
                showValidationError(amountField, 'Amount is required for expense/income entries');
                isValid = false;
            } else {
                const amount = parseFloat(amountField.value);
                if (isNaN(amount) || amount <= 0) {
                    showValidationError(amountField, 'Please enter a valid positive amount');
                    isValid = false;
                }
            }
        }
        
        if (!isValid) {
            e.preventDefault();
        }
    });
}

/**
 * Setup dynamic form elements based on entry type
 */
function setupDynamicForm() {
    const entryTypeSelect = document.getElementById('entry_type');
    const amountField = document.getElementById('amountField');
    const cropField = document.getElementById('crop');
    
    if (entryTypeSelect && amountField) {
        // Make sure amount field is visible by default
        amountField.style.display = 'block';
        
        entryTypeSelect.addEventListener('change', function() {
            const selectedType = this.value;
            
            // Show/hide amount field based on entry type
            if (selectedType === 'expense' || selectedType === 'income') {
                // Make sure amount field is visible
                amountField.style.display = 'block';
                const amountInput = amountField.querySelector('input');
                if (amountInput) {
                    amountInput.setAttribute('required', '');
                    // Clear any previous value
                    amountInput.value = '';
                    // Make sure it's not disabled
                    amountInput.disabled = false;
                }
                
                // Update label text
                const label = amountField.querySelector('label');
                if (label) {
                    label.textContent = selectedType === 'expense' ? 'Expense Amount (₹)' : 'Income Amount (₹)';
                }
            } else {
                // For non-financial entries, hide amount field
                amountField.style.display = 'none';
                const amountInput = amountField.querySelector('input');
                if (amountInput) {
                    amountInput.removeAttribute('required');
                    // Set to 0 for non-financial entries
                    amountInput.value = '0';
                }
            }
            
            // Update crop field label based on entry type
            if (cropField) {
                const cropLabel = cropField.previousElementSibling;
                
                if (cropLabel && cropLabel.tagName === 'LABEL') {
                    if (selectedType === 'harvest' || selectedType === 'sowing') {
                        cropLabel.textContent = 'Crop';
                        cropField.setAttribute('required', '');
                    } else {
                        cropLabel.textContent = 'Crop (Optional)';
                        cropField.removeAttribute('required');
                    }
                }
            }
        });
        
        // Initialize form state - make sure this is triggered
        if (entryTypeSelect.value) {
            entryTypeSelect.dispatchEvent(new Event('change'));
        } else {
            // Default state - hide amount field initially until entry type is selected
            amountField.style.display = 'none';
        }
    }
}

/**
 * Setup filtering for diary entries
 */
function setupEntryFiltering() {
    const searchInput = document.getElementById('entrySearch');
    const typeFilter = document.getElementById('entryTypeFilter');
    const entriesList = document.getElementById('entriesList');
    
    if (searchInput && entriesList) {
        searchInput.addEventListener('input', filterEntries);
    }
    
    if (typeFilter && entriesList) {
        typeFilter.addEventListener('change', filterEntries);
    }
    
    function filterEntries() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedType = typeFilter ? typeFilter.value : 'all';
        
        const entries = entriesList.querySelectorAll('.entry-card');
        
        entries.forEach(entry => {
            const entryType = entry.classList[1]; // The second class is the entry type
            const entryText = entry.textContent.toLowerCase();
            
            const typeMatch = selectedType === 'all' || entryType === selectedType;
            const textMatch = searchTerm === '' || entryText.includes(searchTerm);
            
            // Show/hide based on filter
            if (typeMatch && textMatch) {
                entry.style.display = '';
            } else {
                entry.style.display = 'none';
            }
        });
        
        // Check if any entries are visible after filtering
        const visibleEntries = Array.from(entries).filter(entry => entry.style.display !== 'none');
        
        if (visibleEntries.length === 0) {
            // Display a message if no entries match the filter
            let noResultsMsg = entriesList.querySelector('.no-results-message');
            
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'no-results-message text-center py-4';
                noResultsMsg.innerHTML = '<i class="fas fa-search fa-2x text-muted mb-3"></i><p>No entries match your filter criteria</p>';
                entriesList.appendChild(noResultsMsg);
            }
        } else {
            // Remove the message if there are visible entries
            const noResultsMsg = entriesList.querySelector('.no-results-message');
            if (noResultsMsg) {
                noResultsMsg.remove();
            }
        }
    }
}

/**
 * Calculate expense and income summary
 */
function calculateSummary() {
    const entries = document.querySelectorAll('.entry-card');
    let totalIncome = 0;
    let totalExpense = 0;
    
    entries.forEach(entry => {
        if (entry.classList.contains('income')) {
            const amountText = entry.querySelector('.card-title span');
            if (amountText) {
                const amount = parseFloat(amountText.textContent.replace('₹', '').trim());
                if (!isNaN(amount)) {
                    totalIncome += amount;
                }
            }
        } else if (entry.classList.contains('expense')) {
            const amountText = entry.querySelector('.card-title span');
            if (amountText) {
                const amount = parseFloat(amountText.textContent.replace('₹', '').trim());
                if (!isNaN(amount)) {
                    totalExpense += amount;
                }
            }
        }
    });
    
    // Update summary displays if they exist
    const incomeDisplay = document.querySelector('.summary-card.income h3');
    const expenseDisplay = document.querySelector('.summary-card.expense h3');
    
    if (incomeDisplay) {
        incomeDisplay.textContent = `₹ ${totalIncome.toFixed(2)}`;
    }
    
    if (expenseDisplay) {
        expenseDisplay.textContent = `₹ ${totalExpense.toFixed(2)}`;
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
