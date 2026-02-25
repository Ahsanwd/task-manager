// Utility functions

export const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
};

export const escapeHTML = (str) => {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

export const getPriorityStyles = (priority) => {
    switch (priority) {
        case 'high':
            return {
                badge: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
                icon: '<i class="fa-solid fa-fire text-red-500"></i>'
            };
        case 'medium':
            return {
                badge: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
                icon: '<i class="fa-solid fa-bolt text-amber-500"></i>'
            };
        case 'low':
            return {
                badge: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
                icon: '<i class="fa-solid fa-leaf text-emerald-500"></i>'
            };
        default:
            return {
                badge: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
                icon: ''
            };
    }
};
