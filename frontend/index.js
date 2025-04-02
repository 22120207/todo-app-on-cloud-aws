// Global variables
let tasks = [];
let currentFilter = 'all';
const API_URL = config.API_URL;

// Event listener when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    getCurrentDate();
    setupFilterButtons();
    setupDueDateFilter();
    setupAddButton();
    fetchTasks();
});

// Fetch all tasks from the backend
async function fetchTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        tasks = await response.json();
        updateTasks();
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

// Setup filter buttons (All, Active, Completed)
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll(".filterBtn");
    
    filterButtons[0].classList.add("visitedFilterButton");

    filterButtons.forEach(button => {
        button.addEventListener("click", function () {
            // Remove active class from all filter buttons
            document.querySelectorAll(".filterBtn, .dueDateFilterBtn").forEach(btn => {
                btn.classList.remove("visitedFilterButton");
            });

            // Add active class to the clicked button
            this.classList.add("visitedFilterButton");
            
            // Set current filter based on button text
            currentFilter = this.textContent.toLowerCase();
            
            // Update displayed tasks
            updateTasks();
        });
    });
}

// Setup due date filter button
function setupDueDateFilter() {
    const dueDateFilterBtn = document.querySelector(".dueDateFilterBtn");
    
    dueDateFilterBtn.addEventListener("click", function() {
        // Remove active class from all filter buttons
        document.querySelectorAll(".filterBtn, .dueDateFilterBtn").forEach(btn => {
            btn.classList.remove("visitedFilterButton");
        });
        
        // Add active class to the due date filter button
        this.classList.add("visitedFilterButton");
        
        // Set current filter to 'duedate'
        currentFilter = 'duedate';
        
        // Update displayed tasks
        updateTasks();
    });
}

// Handle add task
function setupAddButton() {
    document.querySelector('.addButton').addEventListener('click', async function (event) {
        event.preventDefault();
        
        const taskInput = document.querySelector('.inputTask');
        const dueDateInput = document.querySelector('.inputDueDate');
        
        const title = taskInput.value.trim();
        const dueDate = dueDateInput.value ? new Date(dueDateInput.value) : null;
        
        if (!title) return;
        
        try {
            const response = await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, dueDate })
            });
            
            if (!response.ok) {
                throw new Error('Failed to add task');
            }
            
            const newTask = await response.json();
            tasks.push(newTask);
            
            // Clear input fields
            taskInput.value = "";
            dueDateInput.value = "";
            
            updateTasks();
        } catch (error) {
            console.error('Error adding task:', error);
        }
    });
}

// Toggle task completion status
async function toggleTaskComplete(id, completed) {
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PATCH', // Changed from 'PUT' to 'PATCH' to match backend
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed: !completed })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update task');
        }
        
        const updatedTask = await response.json();
        
        // Update task in local array
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex] = updatedTask;
        }
        
        updateTasks();
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

// Delete a task
async function deleteTask(id) {
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
        
        // Remove task from local array
        tasks = tasks.filter(task => task.id !== id);
        
        updateTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

// Edit a task
async function editTask(id) {
    // Find the task
    const task = tasks.find(task => task.id === id);
    if (!task) return;
    
    // Prompt for new task text
    const newTaskText = prompt("Edit your task:", task.title);
    if (!newTaskText || newTaskText.trim() === '') return;
    
    // Prompt for new due date
    const currentDueDate = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
    const newDueDateStr = prompt("Enter new due date (YYYY-MM-DD) or leave empty:", currentDueDate);
    
    const newDueDate = newDueDateStr ? new Date(newDueDateStr) : null;
    
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PATCH', // Changed from 'PUT' to 'PATCH'
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                title: newTaskText.trim(),
                dueDate: newDueDate
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update task');
        }
        
        const updatedTask = await response.json();
        
        // Update task in local array
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex] = updatedTask;
        }
        
        updateTasks();
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

// Get filtered tasks based on current filter
function getFilteredTasks() {
    let filteredTasks;
    
    switch (currentFilter) {
        case 'active':
            filteredTasks = tasks.filter(task => !task.completed);
            break;
        case 'completed':
            filteredTasks = tasks.filter(task => task.completed);
            break;
        case 'duedate':
            // Sort by due date proximity to current date
            const today = new Date();
            filteredTasks = [...tasks].sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                
                const dateA = new Date(a.dueDate);
                const dateB = new Date(b.dueDate);
                
                return dateA - dateB;
            });
            break;
        case 'all':
        default:
            filteredTasks = [...tasks]; // This preserves the original order
            break;
    }
    
    return filteredTasks;
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'No due date';
    
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if date is today
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    }
    
    // Check if date is tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    }
    
    // Format date as MM/DD/YYYY
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

// Check if a task is overdue
function isOverdue(dateString) {
    if (!dateString) return false;
    
    const dueDate = new Date(dateString);
    dueDate.setHours(23, 59, 59, 999); // End of the due date
    
    const now = new Date();
    
    return dueDate < now && dueDate.toDateString() !== now.toDateString();
}

// Update displayed tasks
function updateTasks() {
    const listContainer = document.querySelector('.listContainer');
    listContainer.innerHTML = '';
    
    const filteredTasks = getFilteredTasks();

    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'empty-list-message';
        emptyMessage.textContent = `No ${currentFilter !== 'all' ? currentFilter : ''} tasks found.`;
        listContainer.appendChild(emptyMessage);
        return;
    }

    filteredTasks.forEach(task => {
        const formattedDueDate = formatDate(task.dueDate);
        const isTaskOverdue = isOverdue(task.dueDate);
        
        const taskList = document.createElement('li');
        taskList.innerHTML = `
            <div class="taskList ${task.completed ? "completed" : ""} ${isTaskOverdue && !task.completed ? "overdue" : ""}">
                <label for="task-${task.id}">
                    <input id="task-${task.id}" type="checkbox" ${task.completed ? "checked" : ""}/>
                    <span>${task.title}</span>
                </label>
                <div class="task-details">
                    <span class="due-date ${isTaskOverdue && !task.completed ? "overdue-text" : ""}">${formattedDueDate}</span>
                    <div class="task-actions">
                        <button class="editButton" onclick="editTask('${task.id}')">
                            <img src="./assets/edit-icon.svg" alt="Edit" class="edit-icon">
                        </button>
                        <button class="deleteButton" onclick="deleteTask('${task.id}')">
                            <img src="./assets/delete.svg" alt="Delete" class="delete-icon">
                        </button>
                    </div>
                </div>
            </div>
        `;

        listContainer.appendChild(taskList);
    });
    
    // Add event listeners to checkboxes
    filteredTasks.forEach(task => {
        const checkbox = document.querySelector(`input[id="task-${task.id}"]`);
        if (checkbox) {
            checkbox.addEventListener("change", () => toggleTaskComplete(task.id, task.completed));
        }
    });
}

// Display current date
function getCurrentDate() {
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const month = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];

    const date = new Date();
    const dateDisplay = document.querySelector('.dateDisplay');
    
    if (dateDisplay) {
        dateDisplay.textContent = `${dayOfWeek[date.getDay()]}, ${date.getDate()} ${month[date.getMonth()]} ${date.getFullYear()}`;
    } else {
        console.error("dateDisplay element not found in the DOM");
    }
}
