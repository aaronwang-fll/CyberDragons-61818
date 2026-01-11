// Task Management Application
class TaskManager {
    constructor() {
        this.tasks = [];
        this.subcategories = { Robot: [], Project: [], Other: [] };
        this.currentEditTaskId = null;
        this.currentNoteTaskId = null;
        this.init();
    }

    init() {
        this.loadSubcategories();
        this.loadTasks();
        this.renderTasks();
        this.updateDateDisplay();
        this.setupEventListeners();
        this.populateSubcategoryDropdowns();
    }

    updateDateDisplay() {
        const date = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const day = days[date.getDay()];
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayNum = String(date.getDate()).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        const dateString = `${day} ${month}/${dayNum}/${year}`;
        document.getElementById('dateDisplay').textContent = dateString;
    }

    loadTasks() {
        const stored = localStorage.getItem('cybertracker_tasks');
        if (stored) {
            this.tasks = JSON.parse(stored);
            this.tasks.forEach(task => {
                if (!task.notes) task.notes = [];
                if (!task.names) task.names = Array.isArray(task.name) ? task.name : [task.name || 'Unassigned'];
                if (task.name && !Array.isArray(task.names)) task.names = [task.name];
            });
        }
    }

    saveTasks() {
        localStorage.setItem('cybertracker_tasks', JSON.stringify(this.tasks));
    }

    loadSubcategories() {
        const stored = localStorage.getItem('cybertracker_subcategories');
        if (stored) {
            this.subcategories = JSON.parse(stored);
        }
    }

    saveSubcategories() {
        localStorage.setItem('cybertracker_subcategories', JSON.stringify(this.subcategories));
    }

    populateSubcategoryDropdowns() {
        const select = document.getElementById('taskSubcategory');
        const editSelect = document.getElementById('editTaskSubcategory');
        const categorySelect = document.getElementById('taskCategory');
        const editCategorySelect = document.getElementById('editTaskCategory');
        
        if (select && categorySelect) {
            this.updateSubcategoryDropdown(select, categorySelect.value);
            categorySelect.addEventListener('change', () => {
                this.updateSubcategoryDropdown(select, categorySelect.value);
            });
        }
        
        if (editSelect && editCategorySelect) {
            this.updateSubcategoryDropdown(editSelect, editCategorySelect.value);
            editCategorySelect.addEventListener('change', () => {
                this.updateSubcategoryDropdown(editSelect, editCategorySelect.value);
            });
        }
    }

    updateSubcategoryDropdown(select, category) {
        select.innerHTML = '<option value="">None</option>';
        if (this.subcategories[category]) {
            this.subcategories[category].forEach(sub => {
                const option = document.createElement('option');
                option.value = sub;
                option.textContent = sub;
                select.appendChild(option);
            });
        }
    }

    setupEventListeners() {
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            document.getElementById('modalTitle').textContent = 'Add New Task';
            document.getElementById('submitBtn').textContent = 'Add Task';
            document.getElementById('formError').style.display = 'none';
            const category = document.getElementById('taskCategory').value;
            this.updateSubcategoryDropdown(document.getElementById('taskSubcategory'), category);
            document.getElementById('taskModal').style.display = 'block';
        });

        document.getElementById('createSubcategoryBtn').addEventListener('click', () => {
            this.createSubcategory('add');
        });

        document.getElementById('editCreateSubcategoryBtn').addEventListener('click', () => {
            this.createSubcategory('edit');
        });

        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('taskModal').style.display = 'none';
            document.getElementById('taskForm').reset();
            document.getElementById('formError').style.display = 'none';
        });

        document.querySelector('.close-edit').addEventListener('click', () => {
            document.getElementById('editTaskModal').style.display = 'none';
            document.getElementById('editTaskForm').reset();
            document.getElementById('editFormError').style.display = 'none';
            this.currentEditTaskId = null;
        });

        document.querySelector('.close-note').addEventListener('click', () => {
            document.getElementById('noteModal').style.display = 'none';
            document.getElementById('noteForm').reset();
            this.currentNoteTaskId = null;
        });

        window.addEventListener('click', (e) => {
            const taskModal = document.getElementById('taskModal');
            const editModal = document.getElementById('editTaskModal');
            const noteModal = document.getElementById('noteModal');
            
            if (e.target === taskModal) {
                taskModal.style.display = 'none';
                document.getElementById('taskForm').reset();
                document.getElementById('formError').style.display = 'none';
            }
            if (e.target === editModal) {
                editModal.style.display = 'none';
                document.getElementById('editTaskForm').reset();
                document.getElementById('editFormError').style.display = 'none';
                this.currentEditTaskId = null;
            }
            if (e.target === noteModal) {
                noteModal.style.display = 'none';
                document.getElementById('noteForm').reset();
                this.currentNoteTaskId = null;
            }
        });

        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        document.getElementById('editTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEditTask();
        });

        document.getElementById('noteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNote();
        });

        document.getElementById('exportPdfBtn').addEventListener('click', () => {
            this.exportToPDF();
        });
    }

    createSubcategory(mode) {
        const categorySelect = mode === 'add' 
            ? document.getElementById('taskCategory')
            : document.getElementById('editTaskCategory');
        const newSubInput = mode === 'add'
            ? document.getElementById('newSubcategory')
            : document.getElementById('editNewSubcategory');
        const subSelect = mode === 'add'
            ? document.getElementById('taskSubcategory')
            : document.getElementById('editTaskSubcategory');

        const category = categorySelect.value;
        const newSub = newSubInput.value.trim();

        if (newSub && category) {
            if (!this.subcategories[category].includes(newSub)) {
                this.subcategories[category].push(newSub);
                this.saveSubcategories();
                
                const option = document.createElement('option');
                option.value = newSub;
                option.textContent = newSub;
                subSelect.appendChild(option);
                subSelect.value = newSub;
                newSubInput.value = '';
            }
        }
    }

    addTask() {
        const nameSelect = document.getElementById('taskName');
        const selectedNames = Array.from(nameSelect.selectedOptions).map(opt => opt.value);
        const task = document.getElementById('taskDescription').value.trim();
        const category = document.getElementById('taskCategory').value;
        const subcategory = document.getElementById('taskSubcategory').value;
        const deadline = document.getElementById('taskDeadline').value;
        const errorDiv = document.getElementById('formError');

        if (selectedNames.length === 0) {
            errorDiv.textContent = 'Please select a name';
            errorDiv.style.display = 'block';
            return;
        }

        if (!task) {
            errorDiv.textContent = 'Please enter a task description';
            errorDiv.style.display = 'block';
            return;
        }

        const newTask = {
            id: Date.now().toString(),
            names: selectedNames,
            task: task,
            category: category,
            subcategory: subcategory || null,
            status: 'not_started',
            createdAt: new Date().toISOString(),
            notes: [],
            deadline: deadline || null
        };

        this.tasks.push(newTask);
        this.saveTasks();
        this.renderTasks();
        
        document.getElementById('taskModal').style.display = 'none';
        document.getElementById('taskForm').reset();
        errorDiv.style.display = 'none';
    }

    startTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = 'in_progress';
            this.saveTasks();
            this.renderTasks();
        }
    }

    goBack(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            if (task.status === 'in_progress') {
                task.status = 'not_started';
            } else if (task.status === 'completed') {
                task.status = 'in_progress';
            }
            this.saveTasks();
            this.renderTasks();
        }
    }

    finishTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = 'completed';
            this.saveTasks();
            this.renderTasks();
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.renderTasks();
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.currentEditTaskId = taskId;
            const nameSelect = document.getElementById('editTaskName');
            Array.from(nameSelect.options).forEach(opt => {
                opt.selected = task.names.includes(opt.value);
            });
            document.getElementById('editTaskDescription').value = task.task;
            document.getElementById('editTaskCategory').value = task.category;
            this.updateSubcategoryDropdown(document.getElementById('editTaskSubcategory'), task.category);
            if (task.subcategory) {
                document.getElementById('editTaskSubcategory').value = task.subcategory;
            }
            if (task.deadline) {
                document.getElementById('editTaskDeadline').value = task.deadline;
            }
            document.getElementById('editTaskModal').style.display = 'block';
        }
    }

    saveEditTask() {
        if (!this.currentEditTaskId) return;

        const task = this.tasks.find(t => t.id === this.currentEditTaskId);
        const nameSelect = document.getElementById('editTaskName');
        const selectedNames = Array.from(nameSelect.selectedOptions).map(opt => opt.value);
        const taskDesc = document.getElementById('editTaskDescription').value.trim();
        const errorDiv = document.getElementById('editFormError');

        if (selectedNames.length === 0) {
            errorDiv.textContent = 'Please select a name';
            errorDiv.style.display = 'block';
            return;
        }

        if (!taskDesc) {
            errorDiv.textContent = 'Please enter a task description';
            errorDiv.style.display = 'block';
            return;
        }

        if (task) {
            task.names = selectedNames;
            task.task = taskDesc;
            task.category = document.getElementById('editTaskCategory').value;
            task.subcategory = document.getElementById('editTaskSubcategory').value || null;
            task.deadline = document.getElementById('editTaskDeadline').value || null;

            this.saveTasks();
            this.renderTasks();
            
            document.getElementById('editTaskModal').style.display = 'none';
            document.getElementById('editTaskForm').reset();
            errorDiv.style.display = 'none';
            this.currentEditTaskId = null;
        }
    }

    openNoteModal(taskId) {
        this.currentNoteTaskId = taskId;
        document.getElementById('noteModal').style.display = 'block';
    }

    addNote() {
        if (!this.currentNoteTaskId) return;

        const task = this.tasks.find(t => t.id === this.currentNoteTaskId);
        const noteText = document.getElementById('noteText').value.trim();
        
        if (task && noteText) {
            if (!task.notes) {
                task.notes = [];
            }
            task.notes.push({
                text: noteText,
                date: new Date().toISOString()
            });
            this.saveTasks();
            this.renderTasks();
            
            document.getElementById('noteModal').style.display = 'none';
            document.getElementById('noteForm').reset();
            this.currentNoteTaskId = null;
        }
    }

    sortTasksByCategory(category) {
        const categoryTasks = this.tasks.filter(t => t.category === category);
        
        const subcategoryGroups = {};
        categoryTasks.forEach(task => {
            const sub = task.subcategory || 'Uncategorized';
            if (!subcategoryGroups[sub]) {
                subcategoryGroups[sub] = [];
            }
            subcategoryGroups[sub].push(task);
        });

        Object.keys(subcategoryGroups).forEach(sub => {
            const tasks = subcategoryGroups[sub];
            const notCompleted = tasks.filter(t => t.status !== 'completed');
            const completed = tasks.filter(t => t.status === 'completed');
            
            notCompleted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            completed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            subcategoryGroups[sub] = [...notCompleted, ...completed];
        });

        return Object.values(subcategoryGroups).flat();
    }

    renderTasks() {
        const robotTasks = this.sortTasksByCategory('Robot');
        const projectTasks = this.sortTasksByCategory('Project');
        const otherTasks = this.sortTasksByCategory('Other');

        const robotContainer = document.getElementById('robotTasks');
        const projectContainer = document.getElementById('projectTasks');
        const otherContainer = document.getElementById('otherTasks');

        robotContainer.innerHTML = robotTasks.length > 0 
            ? robotTasks.map(task => this.createTaskBox(task)).join('')
            : '<p style="text-align: center; color: #ffffff; font-size: 1.2rem; font-weight: bold; padding: 40px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">No tasks yet</p>';

        projectContainer.innerHTML = projectTasks.length > 0
            ? projectTasks.map(task => this.createTaskBox(task)).join('')
            : '<p style="text-align: center; color: #ffffff; font-size: 1.2rem; font-weight: bold; padding: 40px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">No tasks yet</p>';

        otherContainer.innerHTML = otherTasks.length > 0
            ? otherTasks.map(task => this.createTaskBox(task)).join('')
            : '<p style="text-align: center; color: #ffffff; font-size: 1.2rem; font-weight: bold; padding: 40px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">No tasks yet</p>';

        this.tasks.forEach(task => {
            const taskBox = document.querySelector(`[data-task-id="${task.id}"]`);
            if (taskBox) {
                const mainBtn = taskBox.querySelector('.task-btn.main-action');
                if (mainBtn) {
                    mainBtn.addEventListener('click', () => {
                        this.handleTaskAction(task.id, task.status);
                    });
                }

                const backBtn = taskBox.querySelector('.task-btn.back');
                if (backBtn) {
                    backBtn.addEventListener('click', () => {
                        this.goBack(task.id);
                    });
                }

                const deleteBtn = taskBox.querySelector('.task-btn.delete');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', () => {
                        this.deleteTask(task.id);
                    });
                }

                const editBtn = taskBox.querySelector('.task-btn.edit');
                if (editBtn) {
                    editBtn.addEventListener('click', () => {
                        this.editTask(task.id);
                    });
                }

                const noteBtn = taskBox.querySelector('.task-btn.note');
                if (noteBtn) {
                    noteBtn.addEventListener('click', () => {
                        this.openNoteModal(task.id);
                    });
                }
            }
        });
    }

    createTaskBox(task) {
        const statusLabels = {
            'not_started': 'Not Started',
            'in_progress': 'In Progress',
            'completed': 'COMPLETED'
        };

        const statusClasses = {
            'not_started': 'not-started',
            'in_progress': 'in-progress',
            'completed': 'completed'
        };

        const categoryClass = task.category.toLowerCase();
        const completedClass = task.status === 'completed' ? 'completed' : '';
        const names = task.names || (task.name ? [task.name] : ['Unassigned']);

        let actionButtons = '';
        if (task.status === 'not_started') {
            actionButtons = `
                <div class="task-actions-row">
                    <button class="task-btn start main-action" title="Start this task">Start Task</button>
                    <button class="task-btn edit small" title="Edit task details">Edit</button>
                    <button class="task-btn note small" title="Add a note">Note</button>
                    <button class="task-btn delete small" title="delete task">Delete</button>
                </div>
            `;
        } else if (task.status === 'in_progress') {
            actionButtons = `
                <div class="task-actions-row">
                    <button class="task-btn finish main-action" title="Mark as completed">Finish Task</button>
                    <button class="task-btn back small" title="Go back to not started">Back</button>
                </div>
                <div class="task-actions-row">
                    <button class="task-btn edit small" title="Edit task details">Edit</button>
                    <button class="task-btn note small" title="Add a note">Note</button>
                    <button class="task-btn delete small" title="delete task">Delete</button>
                </div>
            `;
        } else if (task.status === 'completed') {
            actionButtons = `
                <div class="task-actions-row">
                    <button class="task-btn back main-action" title="Go back to in progress">Back</button>
                    <button class="task-btn delete small" title="delete task">Delete</button>
                </div>
                <div class="task-actions-row">
                    <button class="task-btn edit small" title="Edit task details">Edit</button>
                    <button class="task-btn note small" title="Add a note">Note</button>
                </div>
            `;
        }

        let notesHtml = '';
        if (task.notes && task.notes.length > 0) {
            notesHtml = '<div class="task-box-notes">';
            task.notes.forEach(note => {
                notesHtml += `
                    <div class="task-note">
                        ${this.escapeHtml(note.text)}
                    </div>
                `;
            });
            notesHtml += '</div>';
        }

        let deadlineHtml = '';
        if (task.deadline) {
            const deadline = new Date(task.deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const deadlineDate = new Date(deadline);
            deadlineDate.setHours(0, 0, 0, 0);
            const isOverdue = deadlineDate < today && task.status !== 'completed';
            const deadlineClass = isOverdue ? 'overdue' : '';
            deadlineHtml = `<div class="task-deadline ${deadlineClass}">📅 Deadline: ${deadline.toLocaleDateString()}</div>`;
        }

        const subcategoryHtml = task.subcategory 
            ? `<div class="task-category ${categoryClass}" style="margin-top: 5px; font-size: 0.75rem;">${this.escapeHtml(task.subcategory)}</div>`
            : '';

        return `
            <div class="task-box category-${categoryClass} ${completedClass}" data-task-id="${task.id}">
                ${notesHtml}
                <div class="task-box-content">
                    <div class="task-description">${this.escapeHtml(task.task)}</div>
                    <div class="task-name">
                        <div class="task-name-list">
                            ${names.map(name => `<span class="task-name-tag">${this.escapeHtml(name)}</span>`).join(', ')}
                        </div>
                    </div>
                    <div class="task-status ${statusClasses[task.status]}">${statusLabels[task.status]}</div>
                    ${deadlineHtml}
                    <div class="task-header">
                        ${subcategoryHtml}
                    </div>
                    <div class="task-actions">
                        ${actionButtons}
                    </div>
                </div>
            </div>
        `;
    }

    handleTaskAction(taskId, currentStatus) {
        if (currentStatus === 'not_started') {
            this.startTask(taskId);
        } else if (currentStatus === 'in_progress') {
            this.finishTask(taskId);
        }
    }

    exportToPDF() {
        const completedTasks = this.tasks.filter(t => t.status === 'completed');
        
        if (completedTasks.length === 0) {
            alert('No completed tasks to export.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('Daily Dragon', 14, 20);
        
        const date = new Date();
        const dateString = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        doc.setFontSize(14);
        doc.setFont(undefined, 'normal');
        doc.text(dateString, 14, 30);
        
        let yPos = 45;
        
        completedTasks.forEach((task, index) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(`Task ${index + 1}: ${task.task}`, 14, yPos);
            yPos += 7;
            
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            const names = task.names || (task.name ? [task.name] : ['Unassigned']);
            doc.text(`Assigned to: ${names.join(', ')}`, 14, yPos);
            yPos += 6;
            
            let categoryText = `Category: ${task.category}`;
            if (task.subcategory) {
                categoryText += ` - ${task.subcategory}`;
            }
            doc.text(categoryText, 14, yPos);
            yPos += 6;
            
            if (task.deadline) {
                doc.text(`Deadline: ${new Date(task.deadline).toLocaleDateString()}`, 14, yPos);
                yPos += 6;
            }
            
            if (task.notes && task.notes.length > 0) {
                doc.text('Notes:', 14, yPos);
                yPos += 5;
                task.notes.forEach(note => {
                    const noteLines = doc.splitTextToSize(`- ${note.text}`, 180);
                    doc.text(noteLines, 20, yPos);
                    yPos += noteLines.length * 5;
                });
                yPos += 3;
            }
            
            doc.text(`Status: COMPLETED`, 14, yPos);
            yPos += 10;
        });
        
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        }).replace(/\//g, '-');
        const hour = now.getHours();
        const timeOfDay = hour < 12 ? 'Morning' : 'Afternoon';
        const filename = `Daily Dragon ${dateStr} ${timeOfDay}.pdf`;
        
        doc.save(filename);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});
