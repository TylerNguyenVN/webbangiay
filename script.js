document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const rootElement = document.documentElement;
    
    // Check local storage for saved theme
    const savedTheme = localStorage.getItem('starbucks-theme');
    
    if (savedTheme) {
        rootElement.setAttribute('data-theme', savedTheme);
    } else {
        // Check system preference if no saved theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            rootElement.setAttribute('data-theme', 'dark');
        }
    }

    // Toggle theme
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = rootElement.getAttribute('data-theme');
        let newTheme = 'light';
        
        if (currentTheme !== 'dark') {
            newTheme = 'dark';
        }
        
        rootElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('starbucks-theme', newTheme);
    });

    // Optional: Frap button micro-interaction
    const frapBtn = document.querySelector('.frap-button');
    if(frapBtn) {
        frapBtn.addEventListener('mousedown', () => {
            frapBtn.style.transform = 'scale(0.95)';
        });
        frapBtn.addEventListener('mouseup', () => {
            frapBtn.style.transform = 'scale(1)';
        });
        frapBtn.addEventListener('mouseleave', () => {
            frapBtn.style.transform = 'scale(1)';
        });
    }
});
