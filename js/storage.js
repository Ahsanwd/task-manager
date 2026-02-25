const STORAGE_KEY = 'taskmaster_data_v1';
const THEME_KEY = 'taskmaster_theme_v1';

export const getTasks = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

export const saveTasks = (tasks) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const getTaskById = (id) => {
    return getTasks().find(task => task.id === id);
};

export const addTask = (taskData) => {
    const tasks = getTasks();
    const newTask = {
        id: (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
        ...taskData,
        createdAt: Date.now()
    };
    tasks.push(newTask);
    saveTasks(tasks);
    return newTask;
};

export const updateTask = (id, updatedData) => {
    const tasks = getTasks();
    const index = tasks.findIndex(task => task.id === id);
    if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updatedData };
        saveTasks(tasks);
        return tasks[index];
    }
    return null;
};

export const deleteTask = (id) => {
    const tasks = getTasks();
    const filtered = tasks.filter(task => task.id !== id);
    saveTasks(filtered);
};

// Theme Management
export const getTheme = () => {
    return localStorage.getItem(THEME_KEY) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
};

export const setTheme = (theme) => {
    localStorage.setItem(THEME_KEY, theme);
};
