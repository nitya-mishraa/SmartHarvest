/**
 * JavaScript for Task Planner page
 * Handles task form, calendar display, and filtering
 */

// Calendar configuration and tasks array
let calendar;
let allTasks = [];

document.addEventListener('DOMContentLoaded', function() {
    // Get the tasks data
    collectTasksData();
    
    // Initialize calendar
    initializeCalendar();
    
    // Setup form validation
    const taskPlannerForm = document.getElementById('taskPlannerForm');
    if (taskPlannerForm) {
        setupFormValidation(taskPlannerForm);
    }
    
    // Setup task filtering
    setupTaskFiltering();
});

/**
 * Collect tasks data from the DOM
 */
function collectTasksData() {
    allTasks = [];
    const taskCards = document.querySelectorAll('.task-card');
    
    taskCards.forEach(card => {
        const titleElement = card.querySelector('.card-title');
        const dateElement = card.querySelector('.card-subtitle');
        
        if (titleElement && dateElement) {
            // Extract task info
            const taskName = titleElement.textContent.trim();
            const dateText = dateElement.textContent.trim();
            const isCompleted = card.classList.contains('completed');
            const taskType = Array.from(card.classList)
                .find(cls => ['irrigation', 'fertilizing', 'harvesting', 'sowing', 'pesticide', 'other'].includes(cls));
            
            // Parse date
            const dateParts = dateText.split(' ');
            if (dateParts.length >= 3) {
                const day = parseInt(dateParts[0]);
                const month = {
                    'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
                    'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
                }[dateParts[1]];
                const year = parseInt(dateParts[2].replace(',', ''));
                
                if (!isNaN(day) && month !== undefined && !isNaN(year)) {
                    const date = new Date(year, month, day);
                    
                    // Add task to array
                    allTasks.push({
                        title: taskName,
                        date: date,
                        type: taskType || 'other',
                        completed: isCompleted
                    });
                }
            }
        }
    });
}

/**
 * Initialize the calendar with tasks
 */
function initializeCalendar() {
    const calendarEl = document.getElementById('taskCalendar');
    
    if (!calendarEl) return;
    
    // Create events array from tasks
    const events = allTasks.map(task => {
        // Define color based on task type
        const colorMap = {
            'irrigation': '#17a2b8',
            'fertilizing': '#007bff',
            'harvesting': '#dc3545',
            'sowing': '#28a745',
            'pesticide': '#6c757d',
            'other': '#ffc107'
        };
        
        return {
            title: task.title,
            start: task.date,
            backgroundColor: colorMap[task.type] || '#ffc107',
            borderColor: colorMap[task.type] || '#ffc107',
            textColor: '#fff',
            classNames: task.completed ? ['completed-task'] : []
        };
    });
    
    // Initialize simple calendar
    createBasicCalendar(calendarEl, events);
}

/**
 * Create a basic calendar for task visualization
 * @param {HTMLElement} calendarEl - Calendar container element
 * @param {Array} events - Array of task events
 */
function createBasicCalendar(calendarEl, events) {
    // Clear existing calendar
    calendarEl.innerHTML = '';
    
    // Get current date
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Create calendar header
    const header = document.createElement('div');
    header.className = 'calendar-header d-flex justify-content-between align-items-center mb-3';
    header.innerHTML = `
        <button class="btn btn-sm btn-outline-secondary" id="prevMonth">
            <i class="fas fa-chevron-left"></i>
        </button>
        <h4 id="calendarTitle">${getMonthName(currentMonth)} ${currentYear}</h4>
        <button class="btn btn-sm btn-outline-secondary" id="nextMonth">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    calendarEl.appendChild(header);
    
    // Create calendar grid
    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'calendar-grid';
    calendarEl.appendChild(calendarGrid);
    
    // Set up calendar state
    const calendarState = {
        currentMonth,
        currentYear,
        today: now.getDate(),
        events
    };
    
    // Render initial calendar
    renderCalendarMonth(calendarGrid, calendarState);
    
    // Add event listeners for navigation
    document.getElementById('prevMonth').addEventListener('click', () => {
        calendarState.currentMonth--;
        if (calendarState.currentMonth < 0) {
            calendarState.currentMonth = 11;
            calendarState.currentYear--;
        }
        updateCalendarTitle(calendarState);
        renderCalendarMonth(calendarGrid, calendarState);
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        calendarState.currentMonth++;
        if (calendarState.currentMonth > 11) {
            calendarState.currentMonth = 0;
            calendarState.currentYear++;
        }
        updateCalendarTitle(calendarState);
        renderCalendarMonth(calendarGrid, calendarState);
    });
}

/**
 * Update the calendar title with current month and year
 * @param {Object} state - Calendar state
 */
function updateCalendarTitle(state) {
    const titleEl = document.getElementById('calendarTitle');
    if (titleEl) {
        titleEl.textContent = `${getMonthName(state.currentMonth)} ${state.currentYear}`;
    }
}

/**
 * Render a calendar month
 * @param {HTMLElement} container - Container for the calendar grid
 * @param {Object} state - Calendar state
 */
function renderCalendarMonth(container, state) {
    container.innerHTML = '';
    
    // Create day labels (Sun-Sat)
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekHeader = document.createElement('div');
    weekHeader.className = 'calendar-week header';
    
    dayLabels.forEach(day => {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day-header';
        dayCell.textContent = day;
        weekHeader.appendChild(dayCell);
    });
    
    container.appendChild(weekHeader);
    
    // Calculate first day of month and total days
    const firstDay = new Date(state.currentYear, state.currentMonth, 1).getDay();
    const daysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
    
    // Create weeks
    let dayCount = 1;
    const totalCells = 42; // 6 rows of 7 days
    
    for (let i = 0; i < totalCells; i += 7) {
        const week = document.createElement('div');
        week.className = 'calendar-week';
        
        for (let j = 0; j < 7; j++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';
            
            if ((i + j) < firstDay || dayCount > daysInMonth) {
                // Empty cell
                dayCell.classList.add('empty');
            } else {
                // Day cell
                dayCell.textContent = dayCount;
                
                // Check if it's today
                const isToday = dayCount === state.today && 
                               state.currentMonth === new Date().getMonth() &&
                               state.currentYear === new Date().getFullYear();
                               
                if (isToday) {
                    dayCell.classList.add('today');
                }
                
                // Check for events on this day
                const dayEvents = state.events.filter(event => {
                    const eventDate = new Date(event.start);
                    return eventDate.getDate() === dayCount &&
                           eventDate.getMonth() === state.currentMonth &&
                           eventDate.getFullYear() === state.currentYear;
                });
                
                if (dayEvents.length > 0) {
                    dayCell.classList.add('has-events');
                    
                    // Add event indicators
                    const eventIndicator = document.createElement('div');
                    eventIndicator.className = 'event-indicator-container';
                    
                    // Group events by type
                    const eventTypes = new Set(dayEvents.map(e => e.backgroundColor));
                    
                    eventTypes.forEach(color => {
                        const dot = document.createElement('span');
                        dot.className = 'task-dot';
                        dot.style.backgroundColor = color;
                        eventIndicator.appendChild(dot);
                    });
                    
                    dayCell.appendChild(eventIndicator);
                    
                    // Add tooltip with event titles
                    if (dayEvents.length > 0) {
                        dayCell.setAttribute('data-bs-toggle', 'tooltip');
                        dayCell.setAttribute('data-bs-html', 'true');
                        dayCell.title = dayEvents.map(e => e.title).join('<br>');
                    }
                }
                
                dayCount++;
            }
            
            week.appendChild(dayCell);
        }
        
        container.appendChild(week);
        
        if (dayCount > daysInMonth) break;
    }
    
    // Initialize tooltips
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltips.forEach(tooltip => new bootstrap.Tooltip(tooltip));
    }
}

/**
 * Get month name from month index
 * @param {number} monthIndex - Month index (0-11)
 * @returns {string} Month name
 */
function getMonthName(monthIndex) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return months[monthIndex];
}

/**
 * Set up form validation for the task planner form
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
        
        // Validate date field
        const dateField = document.getElementById('task_date');
        if (dateField && dateField.value) {
            const selectedDate = new Date(dateField.value);
            const today = new Date();
            
            // Clear time portion for comparison
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                showValidationError(dateField, 'Task date cannot be in the past');
                isValid = false;
            }
        }
        
        if (!isValid) {
            e.preventDefault();
        }
    });
}

/**
 * Setup filtering for tasks
 */
function setupTaskFiltering() {
    const searchInput = document.getElementById('taskSearch');
    const typeFilter = document.getElementById('taskTypeFilter');
    const statusFilter = document.getElementById('taskStatusFilter');
    const tasksList = document.getElementById('tasksList');
    
    if (searchInput && tasksList) {
        searchInput.addEventListener('input', filterTasks);
    }
    
    if (typeFilter && tasksList) {
        typeFilter.addEventListener('change', filterTasks);
    }
    
    if (statusFilter && tasksList) {
        statusFilter.addEventListener('change', filterTasks);
    }
    
    function filterTasks() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedType = typeFilter ? typeFilter.value : 'all';
        const selectedStatus = statusFilter ? statusFilter.value : 'all';
        
        const tasks = tasksList.querySelectorAll('.task-card');
        
        tasks.forEach(task => {
            // Get task properties
            const taskType = Array.from(task.classList)
                .find(cls => ['irrigation', 'fertilizing', 'harvesting', 'sowing', 'pesticide', 'other'].includes(cls));
            
            const isCompleted = task.classList.contains('completed');
            const taskText = task.textContent.toLowerCase();
            
            // Apply filters
            const typeMatch = selectedType === 'all' || taskType === selectedType;
            const statusMatch = selectedStatus === 'all' || 
                               (selectedStatus === 'completed' && isCompleted) ||
                               (selectedStatus === 'pending' && !isCompleted);
            const textMatch = searchTerm === '' || taskText.includes(searchTerm);
            
            // Show/hide based on filters
            if (typeMatch && statusMatch && textMatch) {
                task.style.display = '';
            } else {
                task.style.display = 'none';
            }
        });
        
        // Check if any tasks are visible after filtering
        const visibleTasks = Array.from(tasks).filter(task => task.style.display !== 'none');
        
        if (visibleTasks.length === 0) {
            // Display a message if no tasks match the filter
            let noResultsMsg = tasksList.querySelector('.no-results-message');
            
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'no-results-message text-center py-4';
                noResultsMsg.innerHTML = '<i class="fas fa-search fa-2x text-muted mb-3"></i><p>No tasks match your filter criteria</p>';
                tasksList.appendChild(noResultsMsg);
            }
        } else {
            // Remove the message if there are visible tasks
            const noResultsMsg = tasksList.querySelector('.no-results-message');
            if (noResultsMsg) {
                noResultsMsg.remove();
            }
        }
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
