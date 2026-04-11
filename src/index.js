import DesktopOS from './core/DesktopOS.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready');
    const desktop = document.getElementById('webDesktop');
    const taskbar = document.getElementById('taskbar');
    console.log('desktop:', desktop, 'taskbar:', taskbar);
    if (desktop && taskbar) {
        console.log('Creating DesktopOS...');
        window.desktopOS = new DesktopOS();
        console.log('DesktopOS created');
    }
});
