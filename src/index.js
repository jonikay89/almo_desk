import DesktopOS from './core/DesktopOS.js';

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('webDesktop') && document.getElementById('taskbar')) {
        window.desktopOS = new DesktopOS();
    }
});
