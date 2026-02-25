import { updateTask } from './storage.js';

let draggedCard = null;

export const initDragAndDrop = (onDropSuccess) => {
    const columns = document.querySelectorAll('.task-column');

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();

            const targetCol = e.target.closest('.task-column');
            if (targetCol) {
                document.querySelectorAll('.task-column').forEach(c => c.classList.remove('drag-over'));
                targetCol.classList.add('drag-over');
            }

            const afterElement = getDragAfterElement(column, e.clientY);
            const draggable = document.querySelector('.dragging');
            if (draggable) {
                if (afterElement == null) {
                    column.appendChild(draggable);
                } else {
                    column.insertBefore(draggable, afterElement);
                }
            }
        });

        column.addEventListener('dragleave', (e) => {
            // Need to check if we actually left the column, not just a child element
            const rect = column.getBoundingClientRect();
            if (e.clientX < rect.left || e.clientX >= rect.right || e.clientY < rect.top || e.clientY >= rect.bottom) {
                column.classList.remove('drag-over');
            }
        });

        column.addEventListener('drop', (e) => {
            e.preventDefault();
            column.classList.remove('drag-over');

            const taskId = e.dataTransfer.getData('text/plain');
            const newStatus = column.dataset.status;

            if (taskId) {
                const updatedTask = updateTask(taskId, { status: newStatus });
                if (updatedTask) {
                    const card = column.querySelector(`[data-id="${taskId}"]`);
                    if (card) {
                        card.setAttribute('data-status', newStatus);
                        card.classList.add('task-highlight');
                        setTimeout(() => card.classList.remove('task-highlight'), 300);
                    }
                    if (onDropSuccess) onDropSuccess();
                }
            }
        });
    });
};

export const handleDragStart = (e) => {
    draggedCard = e.target.closest('.task-card');

    setTimeout(() => {
        if (draggedCard) draggedCard.classList.add('dragging');
    }, 0);

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedCard.dataset.id);
};

export const handleDragEnd = (e) => {
    if (draggedCard) {
        draggedCard.classList.remove('dragging');
        draggedCard = null;
    }
    document.querySelectorAll('.task-column').forEach(col => {
        col.classList.remove('drag-over');
    });
};

const getDragAfterElement = (container, y) => {
    const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
};
