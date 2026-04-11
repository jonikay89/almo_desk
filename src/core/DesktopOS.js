import WindowController from './WindowController.js';
import { storage, createElement, escapeHtml } from '../utils/index.js';

const CONFIG = {
    MIN_WIDTH: 300,
    MIN_HEIGHT: 240,
    DEFAULT_WIDTH: 520,
    DEFAULT_HEIGHT: 400,
    TASKBAR_HEIGHT: 48,
    DRAG_MARGIN: 40,
    SAVE_DEBOUNCE_MS: 300,
    STORAGE_KEY_STATE: 'webDesktopState',
    STORAGE_KEY_ICONS: 'webDesktopIcons',
};

class DesktopOS {
    constructor() {
        this.windows = [];
        this.nextId = 1;
        this.activeWindowId = null;
        this.startMenuOpen = false;
        this.drag = null;
        this.saveTimer = null;
        this.taskbarInterval = null;
        this.desktopEl = document.getElementById('webDesktop');
        this.taskbarEl = document.getElementById('taskbar');
        this.#init();
    }

    #init() {
        this.#loadState();
        this.#setupGlobalListeners();
        this.#render();
    }

    #loadState() {
        const data = storage.get(CONFIG.STORAGE_KEY_STATE, null);
        
        if (data && Array.isArray(data.windows)) {
            this.windows = data.windows.map(w => {
                const win = new WindowController({
                    id: w.id,
                    title: w.title,
                    widgetType: w.widgetType,
                    extraData: w.extraData || {},
                    x: w.x,
                    y: w.y,
                    width: w.width,
                    height: w.height,
                });
                win.os = this;
                win.view.zIndex = w.zIndex ?? 100;
                win.isMinimized = !!w.minimized;
                return win;
            });
            this.nextId = data.nextId || 1;
        }
        
        if (this.windows.length === 0) {
            this.#createDefaultWindows();
        }
    }

    #createDefaultWindows() {
        this.addWindow('JIT Code Editor', 'codeEditor', {}, 60, 50, 640, 520);
        this.addWindow('Live Clock', 'clock', {}, 520, 50, 280, 200);
        this.addWindow('Sticky Notes', 'notes', { notesText: 'Write your ideas here...' }, 200, 320, 320, 260);
    }

    saveState() {
        const data = {
            windows: this.windows.map(w => w.toJSON()),
            nextId: this.nextId,
        };
        storage.set(CONFIG.STORAGE_KEY_STATE, data);
    }

    saveDebounced() {
        clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => this.saveState(), CONFIG.SAVE_DEBOUNCE_MS);
    }

    addWindow(title, widgetType, extraData = {}, x = 100, y = 80, w = CONFIG.DEFAULT_WIDTH, h = CONFIG.DEFAULT_HEIGHT) {
        const id = this.nextId++;
        const maxZ = this.windows.length > 0 ? Math.max(...this.windows.map(w => w.view.zIndex)) : 100;
        
        const win = new WindowController({ id, title, widgetType, extraData, x, y, width: w, height: h });
        win.os = this;
        win.view.zIndex = maxZ + 1;
        
        this.windows.push(win);
        this.activeWindowId = id;
        this.saveDebounced();
        this.#render();
    }

    closeWindow(id) {
        const win = this.windows.find(w => w.windowId === id);
        if (win) {
            win.viewWillDisappear();
            win.viewDidDisappear();
        }
        this.windows = this.windows.filter(w => w.windowId !== id);
        if (this.activeWindowId === id) this.activeWindowId = null;
        this.saveDebounced();
        this.#render();
    }

    minimizeWindow(id) {
        const win = this.windows.find(w => w.windowId === id);
        if (!win) return;
        win.minimize();
        if (this.activeWindowId === id) this.activeWindowId = null;
        this.saveDebounced();
        this.#renderTaskbar();
    }

    restoreWindow(id) {
        const win = this.windows.find(w => w.windowId === id);
        if (!win) return;
        win.restore();
        this.bringToFront(id);
    }

    bringToFront(id) {
        const win = this.windows.find(w => w.windowId === id);
        if (!win) return;
        
        const maxZ = Math.max(200, ...this.windows.map(w => w.view.zIndex));
        win.setZIndex(maxZ + 1);
        win.restore();
        this.activeWindowId = id;
        
        this.windows.forEach(w => w.setActive(w.windowId === id));
        this.saveDebounced();
    }

    startDrag(windowController, e, mode) {
        e.preventDefault();
        
        const element = windowController.view.element;
        const rect = element.getBoundingClientRect();
        this.drag = {
            windowController,
            mode,
            startX: e.clientX,
            startY: e.clientY,
            initialLeft: rect.left,
            initialTop: rect.top,
            initialWidth: element.offsetWidth,
            initialHeight: element.offsetHeight,
        };

        const onMove = (ev) => {
            ev.preventDefault();
            this.#onDrag(ev);
        };
        const onUp = (ev) => {
            this.drag = null;
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            this.saveState();
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }

    #onDrag(e) {
        if (!this.drag) return;
        
        const win = this.drag.windowController;
        if (!win) return;

        const deltaX = e.clientX - this.drag.startX;
        const deltaY = e.clientY - this.drag.startY;

        if (this.drag.mode === 'move') {
            const newX = Math.max(0, Math.min(this.drag.initialLeft + deltaX, window.innerWidth - CONFIG.DRAG_MARGIN));
            const newY = Math.max(0, Math.min(this.drag.initialTop + deltaY, window.innerHeight - CONFIG.TASKBAR_HEIGHT - CONFIG.DRAG_MARGIN));
            win.setFrame(newX, newY, win.frame.width, win.frame.height);
        } else if (this.drag.mode === 'resize') {
            win.setFrame(win.frame.x, win.frame.y, this.drag.initialWidth + deltaX, this.drag.initialHeight + deltaY);
        }
    }

    #render() {
        this.#renderDesktop();
        this.#renderTaskbar();
    }

    #renderDesktop() {
        if (!this.desktopEl) return;
        this.desktopEl.innerHTML = '';
        
        this.#renderDesktopIcons();

        const visibleWindows = this.windows
            .filter(w => !w.isMinimized)
            .sort((a, b) => a.view.zIndex - b.view.zIndex);

        visibleWindows.forEach(win => {
            win.loadViewIfNeeded();
            win.view.element.classList.toggle('active', this.activeWindowId === win.windowId);
            win.view.element.addEventListener('mousedown', () => this.bringToFront(win.windowId));
            this.desktopEl.appendChild(win.view.element);
        });
    }

    #renderDesktopIcons() {
        let icons = storage.get(CONFIG.STORAGE_KEY_ICONS, null);
        
        if (!icons || icons.length === 0) {
            icons = [
                { id: 'demo-weblink', label: 'WebLink Demo', icon: '🌐', type: 'webLink', data: { url: 'https://x.ai' } },
                { id: 'demo-html', label: 'HTML Sandbox', icon: '📄', type: 'customHtml', data: { htmlContent: '<div style="padding:20px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border-radius:16px;text-align:center;"><h3>Custom Card</h3><p>Drag me around!</p></div>' } },
            ];
            storage.set(CONFIG.STORAGE_KEY_ICONS, icons);
        }

        const container = createElement('div', { className: 'desktop-icons' });

        icons.forEach(ic => {
            const icon = createElement('div', { className: 'desktop-icon' }, [
                createElement('div', { className: 'icon-img', textContent: ic.icon }),
                createElement('div', { className: 'icon-label', textContent: ic.label })
            ]);

            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                const existing = this.windows.find(w => w.widgetType === ic.type && w.title === ic.label);
                if (existing) {
                    if (existing.isMinimized) this.restoreWindow(existing.windowId);
                    else this.bringToFront(existing.windowId);
                } else {
                    this.addWindow(ic.label, ic.type, ic.data, 100 + Math.random() * 80, 80 + Math.random() * 100);
                }
            });

            icon.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (confirm(`Delete desktop icon "${ic.label}"?`)) {
                    icons = icons.filter(i => i.id !== ic.id);
                    storage.set(CONFIG.STORAGE_KEY_ICONS, icons);
                    this.#renderDesktopIcons();
                }
            });

            container.appendChild(icon);
        });

        const addBtn = createElement('div', { className: 'desktop-icon' }, [
            createElement('div', { className: 'icon-img', textContent: '➕' }),
            createElement('div', { className: 'icon-label', textContent: 'New Icon' })
        ]);
        addBtn.addEventListener('click', () => this.#promptNewIcon());
        container.appendChild(addBtn);

        this.desktopEl.appendChild(container);
    }

    #renderTaskbar() {
        if (!this.taskbarEl) return;
        
        clearInterval(this.taskbarInterval);

        this.taskbarEl.innerHTML = '';
        
        const startBtn = createElement('div', { 
            className: 'start-button', 
            id: 'startBtn',
            textContent: '🚀 Start',
            onClick: () => this.#toggleStartMenu()
        });
        this.taskbarEl.appendChild(startBtn);

        const windowsContainer = createElement('div', { className: 'taskbar-windows' });
        
        this.windows.forEach(win => {
            const btn = createElement('div', {
                className: `taskbar-item ${this.activeWindowId === win.windowId ? 'active' : ''}`
            }, [createElement('span', { textContent: win.title.substring(0, 22) })]);

            btn.addEventListener('click', () => {
                if (win.isMinimized) this.restoreWindow(win.windowId);
                else if (this.activeWindowId === win.windowId) this.minimizeWindow(win.windowId);
                else this.bringToFront(win.windowId);
            });

            windowsContainer.appendChild(btn);
        });

        this.taskbarEl.appendChild(windowsContainer);

        const clock = createElement('div', { className: 'clock-area', id: 'liveClock' });
        this.taskbarEl.appendChild(clock);

        this.#updateTaskbarClock();
        this.taskbarInterval = setInterval(() => this.#updateTaskbarClock(), 1000);
    }

    #updateTaskbarClock() {
        const el = document.getElementById('liveClock');
        if (el) {
            el.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }

    #toggleStartMenu() {
        const existing = document.querySelector('.start-menu');
        if (existing) {
            existing.remove();
            this.startMenuOpen = false;
            return;
        }

        const menu = createElement('div', { className: 'start-menu' }, [
            createElement('div', { className: 'start-menu-item', 'data-action': 'newIcon', textContent: '➕ Create New Desktop Icon' }),
            createElement('div', { className: 'start-menu-item', 'data-action': 'newWeblink', textContent: '🌐 Add Web Link Icon' }),
            createElement('div', { className: 'start-menu-item', 'data-action': 'newHtml', textContent: '📄 Add Custom HTML Icon' }),
            createElement('hr', { style: 'margin:8px 0; border-color:#444;' }),
            createElement('div', { className: 'start-menu-item', 'data-action': 'about', textContent: 'ℹ️ About Web Desktop' }),
        ]);

        const actions = {
            newIcon: () => this.#promptNewIcon(),
            newWeblink: () => this.#promptWeblinkIcon(),
            newHtml: () => this.#promptHtmlIcon(),
            about: () => alert('Web Desktop OS v4.0\niOS UIKit-Inspired Architecture\nDrag • Resize • Persist'),
        };

        menu.querySelectorAll('.start-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = actions[item.getAttribute('data-action')];
                if (action) action();
                this.#toggleStartMenu();
            });
        });

        document.body.appendChild(menu);
        this.startMenuOpen = true;

        const closeMenu = (e) => {
            if (!menu.contains(e.target) && !e.target.closest('.start-button')) {
                this.#toggleStartMenu();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 100);
    }

    #promptNewIcon() {
        const label = prompt('Icon label:', 'My App');
        const iconEmoji = prompt('Icon emoji:', '📦');
        if (!label || !iconEmoji) return;
        
        let icons = storage.get(CONFIG.STORAGE_KEY_ICONS, []) || [];
        icons.push({
            id: Date.now().toString(36),
            label,
            icon: iconEmoji,
            type: 'customHtml',
            data: { htmlContent: `<h3>${escapeHtml(label)}</h3><p>Custom widget</p>` },
        });
        storage.set(CONFIG.STORAGE_KEY_ICONS, icons);
        this.#renderDesktopIcons();
    }

    #promptWeblinkIcon() {
        const label = prompt('Link label:', 'My Website');
        const url = prompt('URL:', 'https://example.com');
        if (!label || !url) return;
        
        let icons = storage.get(CONFIG.STORAGE_KEY_ICONS, []) || [];
        icons.push({
            id: Date.now().toString(36),
            label,
            icon: '🔗',
            type: 'webLink',
            data: { url, embedCode: '' },
        });
        storage.set(CONFIG.STORAGE_KEY_ICONS, icons);
        this.#renderDesktopIcons();
    }

    #promptHtmlIcon() {
        const label = prompt('HTML Widget label:', 'Custom HTML');
        const htmlCode = prompt('HTML content:', '<div style="padding:20px;background:#f0f0f0;"><h3>My Widget</h3></div>');
        if (!label || !htmlCode) return;
        
        let icons = storage.get(CONFIG.STORAGE_KEY_ICONS, []) || [];
        icons.push({
            id: Date.now().toString(36),
            label,
            icon: '📄',
            type: 'customHtml',
            data: { htmlContent: htmlCode },
        });
        storage.set(CONFIG.STORAGE_KEY_ICONS, icons);
        this.#renderDesktopIcons();
    }

    #setupGlobalListeners() {
        window.addEventListener('resize', () => {
            this.windows.forEach(w => {
                w.frame.x = Math.min(w.frame.x, window.innerWidth - CONFIG.DRAG_MARGIN);
                w.frame.y = Math.min(w.frame.y, window.innerHeight - CONFIG.TASKBAR_HEIGHT - CONFIG.DRAG_MARGIN);
                w.setFrame(w.frame.x, w.frame.y, w.frame.width, w.frame.height);
            });
            this.saveDebounced();
        });

        window.addEventListener('beforeunload', () => this.saveState());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.startMenuOpen) this.#toggleStartMenu();
            if (e.key === 'Delete' && this.activeWindowId) {
                if (confirm('Delete this window permanently?')) this.closeWindow(this.activeWindowId);
            }
        });
    }
}

export default DesktopOS;
