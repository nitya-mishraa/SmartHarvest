/**
 * Main JavaScript for AgriSaarthi
 * Includes theme toggle, translations, notifications and common utilities
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initializeTheme();
    
    // Setup theme toggle
    setupThemeToggle();
    
    // Setup alert dismissal
    setupAlertDismissal();
    
    // Setup notifications for tasks (if applicable)
    setupTaskNotifications();
});

/**
 * Initialize theme based on user's saved preference or system preference
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    } else if (savedTheme === 'light') {
        document.body.classList.remove('dark-mode');
        updateThemeIcon(false);
    } else {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
            updateThemeIcon(true);
        }
    }
}

/**
 * Setup theme toggle button functionality
 */
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const isDarkMode = document.body.classList.toggle('dark-mode');
            updateThemeIcon(isDarkMode);
            
            // Save preference
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        });
    }
}

/**
 * Update theme icon based on current theme
 * @param {boolean} isDarkMode - Whether dark mode is active
 */
function updateThemeIcon(isDarkMode) {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        
        if (isDarkMode) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
}

/**
 * Setup automatic dismissal of alerts after a delay
 */
function setupAlertDismissal() {
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    
    alerts.forEach(alert => {
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            const closeButton = alert.querySelector('.btn-close');
            if (closeButton) {
                closeButton.click();
            } else {
                alert.classList.add('fade');
                setTimeout(() => {
                    alert.remove();
                }, 150);
            }
        }, 5000);
    });
}

/**
 * Check for upcoming tasks and show browser notifications if allowed
 */
function setupTaskNotifications() {
    // Check if the user is on the task planner page
    if (window.location.pathname.includes('task-planner')) {
        // Skip notifications on the task page itself
        return;
    }
    
    // Check if notifications are supported
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return;
    }
    
    // Check if permission is already granted
    if (Notification.permission === 'granted') {
        checkUpcomingTasks();
    } else if (Notification.permission !== 'denied') {
        // We need to ask for permission
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                checkUpcomingTasks();
            }
        });
    }
}

/**
 * Check for upcoming tasks and show notifications
 */
function checkUpcomingTasks() {
    // Only run this for logged-in users
    const isLoggedIn = document.body.classList.contains('logged-in') || 
                      document.querySelector('a[href="/logout"]') !== null;
    
    if (!isLoggedIn) {
        return;
    }
    
    // Make an AJAX request to check for upcoming tasks
    // In a real implementation, this would call an endpoint to get upcoming tasks
    // For now, we'll use a simulated approach with stored tasks in localStorage
    
    const today = new Date();
    const storedTasks = localStorage.getItem('upcomingTasks');
    
    if (storedTasks) {
        try {
            const tasks = JSON.parse(storedTasks);
            
            tasks.forEach(task => {
                const taskDate = new Date(task.date);
                
                // Only notify for tasks due today or tomorrow
                const timeDiff = taskDate.getTime() - today.getTime();
                const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                
                if (dayDiff >= 0 && dayDiff <= 1 && !task.notified) {
                    // Show notification
                    const notification = new Notification('AgriSaarthi Task Reminder', {
                        body: `${task.name} is scheduled for ${taskDate.toLocaleDateString()}`,
                        icon: '/static/images/logo.png'
                    });
                    
                    // Mark task as notified
                    task.notified = true;
                }
            });
            
            // Save updated tasks
            localStorage.setItem('upcomingTasks', JSON.stringify(tasks));
        } catch (error) {
            console.error('Error parsing tasks:', error);
        }
    }
}

/**
 * Utility function to format date as "DD Month, YYYY"
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

/**
 * Format currency as Indian Rupees
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Helper function to show a custom toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, warning, info)
 */
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type}`;
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Toast content
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 5000
    });
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}
