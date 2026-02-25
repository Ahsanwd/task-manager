import { initUI, updateCountsAndEmptyStates } from './ui.js';
import { initDragAndDrop } from './dragdrop.js';
import { getTasks, addTask } from './storage.js';

initUI();

// We pass updateCountsAndEmptyStates to run after a successful drop operation
initDragAndDrop(updateCountsAndEmptyStates);

// Initial dummy data for review if empty
if (getTasks().length === 0) {
    addTask({
        title: 'Design Dashboard UI',
        description: 'Create a responsive layout using Tailwind CSS with dark mode support.',
        priority: 'high',
        status: 'in-progress'
    });
    addTask({
        title: 'Implement LocalStorage',
        description: 'Save and retrieve tasks seamlessly without backend dependencies.',
        priority: 'medium',
        status: 'completed'
    });
    addTask({
        title: 'Review Animations',
        description: 'Ensure all micro-interactions and modal transitions feel natural.',
        priority: 'low',
        status: 'todo'
    });

    // Re-render UI after adding demo state
    import('./ui.js').then(module => module.renderTasks());
}
