import { getTasks, addTask, updateTask, deleteTask, getTaskById, getTheme, setTheme } from './storage.js';
import { formatDate, escapeHTML, getPriorityStyles } from './utils.js';
import { handleDragStart, handleDragEnd } from './dragdrop.js';

let currentFilter = { query: '', priority: 'all' };
let currentDeleteId = null;

let els = {};

const initEls = () => {
    els = {
        themeBtn: document.getElementById('theme-toggle'),
        html: document.documentElement,
        columns: {
            'todo': document.getElementById('column-todo'),
            'in-progress': document.getElementById('column-in-progress'),
            'completed': document.getElementById('column-completed')
        },
        counts: {
            'todo': document.getElementById('todo-count'),
            'in-progress': document.getElementById('inprogress-count'),
            'completed': document.getElementById('completed-count')
        },
        modal: {
            overlay: document.getElementById('task-modal'),
            form: document.getElementById('task-form'),
            title: document.getElementById('modal-title'),
            idInput: document.getElementById('task-id'),
            titleInput: document.getElementById('task-title'),
            descInput: document.getElementById('task-desc'),
            priorityInput: document.getElementById('task-priority'),
            statusInput: document.getElementById('task-status'),
            closeBtns: [document.getElementById('close-modal-btn'), document.getElementById('cancel-modal-btn')]
        },
        deleteModal: {
            overlay: document.getElementById('delete-modal'),
            confirm: document.getElementById('confirm-delete-btn'),
            cancel: document.getElementById('cancel-delete-btn')
        },
        addBtn: document.getElementById('add-task-btn'),
        searchInput: document.getElementById('search-input'),
        priorityFilter: document.getElementById('priority-filter')
    };
};

export const initUI = () => {
    initEls();
    initTheme();
    setupEventListeners();
    renderTasks();
};

const initTheme = () => {
    const theme = getTheme();
    if (theme === 'dark') {
        els.html.classList.add('dark');
    }

    els.themeBtn.addEventListener('click', () => {
        els.html.classList.toggle('dark');
        setTheme(els.html.classList.contains('dark') ? 'dark' : 'light');
    });
};

const createTaskCard = (task) => {
    const card = document.createElement('div');
    card.className = 'task-card bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 animate-slide-in group relative overflow-hidden flex flex-col';
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-id', task.id);
    card.setAttribute('data-status', task.status);

    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);

    const pStyles = getPriorityStyles(task.priority);
    const priorityLabel = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

    card.innerHTML = `
        <div class="absolute left-0 top-0 bottom-0 w-1 ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}"></div>
        
        <div class="flex justify-between items-start mb-3 ml-2">
            <span class="${pStyles.badge} border text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                ${pStyles.icon} ${priorityLabel}
            </span>
            <div class="flex space-x-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button class="edit-btn text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20" title="Edit">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="delete-btn text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
        
        <h3 class="font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight ml-2 break-words">${escapeHTML(task.title)}</h3>
        ${task.description ? `<p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 ml-2 leading-relaxed break-words">${escapeHTML(task.description)}</p>` : ''}
        
        <div class="flex justify-between items-center text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-auto pt-3 border-t border-gray-50 dark:border-gray-700/50 mx-2">
            <span class="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-md"><i class="fa-regular fa-clock"></i> ${formatDate(task.createdAt)}</span>
        </div>
    `;

    card.querySelector('.edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(task.id);
    });

    card.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openDeleteModal(task.id);
    });

    return card;
};

export const renderTasks = () => {
    const allTasks = getTasks();
    let filteredTasks = allTasks;

    if (currentFilter.query) {
        const q = currentFilter.query.toLowerCase();
        filteredTasks = filteredTasks.filter(t =>
            t.title.toLowerCase().includes(q) ||
            (t.description && t.description.toLowerCase().includes(q))
        );
    }

    if (currentFilter.priority !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.priority === currentFilter.priority);
    }

    Object.values(els.columns).forEach(col => col.innerHTML = '');

    const counts = { 'todo': 0, 'in-progress': 0, 'completed': 0 };

    // Sort by createdAt descending
    filteredTasks.sort((a, b) => b.createdAt - a.createdAt).forEach(task => {
        const col = els.columns[task.status];
        if (col) {
            col.appendChild(createTaskCard(task));
            counts[task.status]++;
        }
    });

    Object.keys(els.columns).forEach(status => {
        if (counts[status] === 0) {
            els.columns[status].innerHTML = `
                <div class="h-28 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500/80 text-sm border-2 border-dashed border-gray-200 dark:border-gray-700/50 rounded-xl my-2 gap-2 p-4 text-center">
                    <i class="fa-solid fa-clipboard-list text-xl opacity-50"></i>
                    <span>Drop tasks here</span>
                </div>
            `;
        }
        els.counts[status].textContent = counts[status];
    });
};

export const updateCountsAndEmptyStates = () => {
    const counts = { 'todo': 0, 'in-progress': 0, 'completed': 0 };

    Object.keys(els.columns).forEach(status => {
        const col = els.columns[status];
        const cards = col.querySelectorAll('.task-card');
        counts[status] = cards.length;

        if (counts[status] === 0 && !col.querySelector('.fa-clipboard-list')) {
            col.innerHTML = `
                <div class="h-28 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500/80 text-sm border-2 border-dashed border-gray-200 dark:border-gray-700/50 rounded-xl my-2 gap-2 p-4 text-center">
                    <i class="fa-solid fa-clipboard-list text-xl opacity-50"></i>
                    <span>Drop tasks here</span>
                </div>
            `;
        } else if (counts[status] > 0) {
            const emptyState = col.querySelector('.fa-clipboard-list');
            if (emptyState) {
                emptyState.closest('div').remove();
            }
        }

        els.counts[status].textContent = counts[status];
    });
};

const setupEventListeners = () => {
    els.addBtn.addEventListener('click', () => openModal());
    els.modal.closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

    els.modal.form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveTaskFromForm();
    });

    els.deleteModal.cancel.addEventListener('click', closeDeleteModal);
    els.deleteModal.confirm.addEventListener('click', confirmDelete);

    els.searchInput.addEventListener('input', (e) => {
        currentFilter.query = e.target.value;
        renderTasks();
    });

    els.priorityFilter.addEventListener('change', (e) => {
        currentFilter.priority = e.target.value;
        renderTasks();
    });
};

const openModal = (id = null) => {
    els.modal.form.reset();

    if (id) {
        const task = getTaskById(id);
        if (task) {
            els.modal.title.textContent = 'Edit Task';
            els.modal.idInput.value = task.id;
            els.modal.titleInput.value = task.title;
            els.modal.descInput.value = task.description;
            els.modal.priorityInput.value = task.priority;
            els.modal.statusInput.value = task.status;
        }
    } else {
        els.modal.title.textContent = 'Add New Task';
        els.modal.idInput.value = '';
        els.modal.statusInput.value = 'todo';
    }

    els.modal.overlay.classList.remove('hidden');
    requestAnimationFrame(() => {
        els.modal.overlay.classList.remove('opacity-0');
        els.modal.overlay.children[0].classList.remove('scale-95');
        els.modal.titleInput.focus();
    });
};

const closeModal = () => {
    els.modal.overlay.classList.add('opacity-0');
    els.modal.overlay.children[0].classList.add('scale-95');
    setTimeout(() => {
        els.modal.overlay.classList.add('hidden');
    }, 300);
};

const saveTaskFromForm = () => {
    const id = els.modal.idInput.value;
    const taskData = {
        title: els.modal.titleInput.value.trim(),
        description: els.modal.descInput.value.trim(),
        priority: els.modal.priorityInput.value,
        status: els.modal.statusInput.value
    };

    if (id) {
        updateTask(id, taskData);
    } else {
        addTask(taskData);
    }

    renderTasks();
    closeModal();
};

const openDeleteModal = (id) => {
    currentDeleteId = id;
    els.deleteModal.overlay.classList.remove('hidden');
    requestAnimationFrame(() => {
        els.deleteModal.overlay.classList.remove('opacity-0');
        els.deleteModal.overlay.children[0].classList.remove('scale-95');
    });
};

const closeDeleteModal = () => {
    els.deleteModal.overlay.classList.add('opacity-0');
    els.deleteModal.overlay.children[0].classList.add('scale-95');
    setTimeout(() => {
        els.deleteModal.overlay.classList.add('hidden');
        currentDeleteId = null;
    }, 300);
};

const confirmDelete = () => {
    if (currentDeleteId) {
        const taskCard = document.querySelector(`.task-card[data-id="${currentDeleteId}"]`);
        if (taskCard) {
            taskCard.classList.add('animate-slide-out');
            setTimeout(() => {
                deleteTask(currentDeleteId);
                renderTasks();
            }, 300);
        } else {
            deleteTask(currentDeleteId);
            renderTasks();
        }
        closeDeleteModal();
    }
};
