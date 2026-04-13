import UIView from './UIView.js';
import UIWindow from './UIWindow.js';
import UILabel from './UILabel.js';
import UIButton from './UIButton.js';
import UIImage from './UIImage.js';
import UIColor from './UIColor.js';
import UIScrollView from './UIScrollView.js';
import WindowController from './WindowController.js';
import { storage } from '../utils/index.js';

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
        this.desktopView = new UIView().init();
        this.taskbarView = new UIView().init();
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
                win.loadView();
                if (win.view) {
                    win.view.zIndex = w.zIndex ?? 100;
                }
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
        
        this.desktopView.element = this.desktopEl;
        this.desktopView.element.style.position = 'relative';
        this.desktopView.element.style.width = '100%';
        this.desktopView.element.style.height = '100%';
        
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

        const container = new UIView();
        container.init();
        container.element.className = 'desktop-icons';
        container.element.style.position = 'absolute';
        container.element.style.top = '10px';
        container.element.style.left = '10px';
        container.element.style.display = 'flex';
        container.element.style.flexDirection = 'column';
        container.element.style.gap = '8px';

        icons.forEach(ic => {
            const iconView = this.#createDesktopIcon(ic);
            container.addSubview(iconView);
        });

        const addIcon = this.#createAddIconButton();
        container.addSubview(addIcon);

        this.desktopEl.appendChild(container.element);
    }

    #createDesktopIcon(iconData) {
        const iconView = new UIView().init();
        iconView.element.className = 'desktop-icon';
        iconView.element.style.display = 'flex';
        iconView.element.style.flexDirection = 'column';
        iconView.element.style.alignItems = 'center';
        iconView.element.style.cursor = 'pointer';
        iconView.element.style.padding = '8px';
        iconView.element.style.borderRadius = '8px';
        iconView.element.style.transition = 'background-color 0.2s';
        
        const iconLabel = new UILabel(iconData.icon).init();
        iconLabel.setFrame(0, 0, 48, 48);
        iconLabel.setTextAlignment('center');
        iconLabel.setFontSize(32);
        iconView.addSubview(iconLabel);
        
        const textLabel = new UILabel(iconData.label).init();
        textLabel.setFrame(0, 52, 64, 20);
        textLabel.setFontSize(11);
        textLabel.setTextAlignment('center');
        textLabel.setNumberOfLines(2);
        iconView.addSubview(textLabel);

        iconView.element.addEventListener('click', (e) => {
            e.stopPropagation();
            const existing = this.windows.find(w => w.widgetType === iconData.type && w.title === iconData.label);
            if (existing) {
                if (existing.isMinimized) this.restoreWindow(existing.windowId);
                else this.bringToFront(existing.windowId);
            } else {
                this.addWindow(iconData.label, iconData.type, iconData.data, 100 + Math.random() * 80, 80 + Math.random() * 100);
            }
        });

        iconView.element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (confirm(`Delete desktop icon "${iconData.label}"?`)) {
                let icons = storage.get(CONFIG.STORAGE_KEY_ICONS, []) || [];
                icons = icons.filter(i => i.id !== iconData.id);
                storage.set(CONFIG.STORAGE_KEY_ICONS, icons);
                this.#renderDesktopIcons();
            }
        });

        iconView.element.addEventListener('mouseenter', () => {
            iconView.element.style.backgroundColor = 'rgba(255,255,255,0.2)';
        });

        iconView.element.addEventListener('mouseleave', () => {
            iconView.element.style.backgroundColor = 'transparent';
        });

        return iconView;
    }

    #createAddIconButton() {
        const addView = new UIView().init();
        addView.element.className = 'desktop-icon';
        addView.element.style.display = 'flex';
        addView.element.style.flexDirection = 'column';
        addView.element.style.alignItems = 'center';
        addView.element.style.cursor = 'pointer';
        addView.element.style.padding = '8px';
        addView.element.style.borderRadius = '8px';
        
        const iconLabel = new UILabel('➕').init();
        iconLabel.setFrame(0, 0, 48, 48);
        iconLabel.setTextAlignment('center');
        iconLabel.setFontSize(32);
        addView.addSubview(iconLabel);
        
        const textLabel = new UILabel('New Icon').init();
        textLabel.setFrame(0, 52, 64, 20);
        textLabel.setFontSize(11);
        textLabel.setTextAlignment('center');
        addView.addSubview(textLabel);

        addView.element.addEventListener('click', () => this.#promptNewIcon());

        addView.element.addEventListener('mouseenter', () => {
            addView.element.style.backgroundColor = 'rgba(255,255,255,0.2)';
        });

        addView.element.addEventListener('mouseleave', () => {
            addView.element.style.backgroundColor = 'transparent';
        });

        return addView;
    }

    #renderTaskbar() {
        if (!this.taskbarEl) return;
        
        clearInterval(this.taskbarInterval);

        this.taskbarEl.innerHTML = '';
        
        this.taskbarView.element = this.taskbarEl;
        this.taskbarView.element.style.display = 'flex';
        this.taskbarView.element.style.alignItems = 'center';
        this.taskbarView.element.style.height = `${CONFIG.TASKBAR_HEIGHT}px`;
        
        const startButton = new UIButton('🚀 Start').init();
        startButton.setFrame(0, 0, 100, CONFIG.TASKBAR_HEIGHT - 8);
        startButton.setBackgroundColor(UIColor.systemBlue());
        startButton.setTitleColor(UIColor.white());
        startButton.element.style.borderRadius = '4px';
        startButton.element.style.marginLeft = '8px';
        startButton.element.addEventListener('click', () => this.#toggleStartMenu());
        this.taskbarView.addSubview(startButton);

        const windowsContainer = new UIScrollView().init();
        windowsContainer.setFrame(100, 0, window.innerWidth - 250, CONFIG.TASKBAR_HEIGHT - 8);
        windowsContainer.setShowsHorizontalScrollIndicator(true);
        windowsContainer.setShowsVerticalScrollIndicator(false);
        windowsContainer.element.style.display = 'flex';
        windowsContainer.element.style.alignItems = 'center';
        windowsContainer.element.style.gap = '4px';
        windowsContainer.element.style.padding = '0 8px';
        windowsContainer.element.style.backgroundColor = 'transparent';
        windowsContainer.element.style.border = 'none';
        windowsContainer.element.style.overflowX = 'auto';
        windowsContainer.element.style.overflowY = 'hidden';
        
        this.windows.forEach(win => {
            const btn = new UIButton(win.title.substring(0, 22)).init();
            btn.setBackgroundColor(this.activeWindowId === win.windowId ? UIColor.systemBlue() : UIColor.gray());
            btn.setTitleColor(UIColor.white());
            btn.element.style.marginRight = '4px';
            btn.element.style.padding = '6px 12px';
            btn.element.style.borderRadius = '4px';
            btn.element.style.fontSize = '12px';
            btn.element.style.height = '32px';
            
            btn.element.addEventListener('click', () => {
                if (win.isMinimized) this.restoreWindow(win.windowId);
                else if (this.activeWindowId === win.windowId) this.minimizeWindow(win.windowId);
                else this.bringToFront(win.windowId);
            });

            windowsContainer.contentElement.appendChild(btn.element);
        });

        this.taskbarView.addSubview(windowsContainer);

        const clockLabel = new UILabel('').init();
        clockLabel.setFrame(window.innerWidth - 130, 0, 120, CONFIG.TASKBAR_HEIGHT - 8);
        clockLabel.setTextAlignment('center');
        clockLabel.setFontSize(14);
        clockLabel.setFontWeight('bold');
        this.taskbarView.addSubview(clockLabel);

        this.#updateTaskbarClockLabel(clockLabel);
        this.taskbarInterval = setInterval(() => this.#updateTaskbarClockLabel(clockLabel), 1000);
    }

    #updateTaskbarClockLabel(label) {
        label.setText(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }

    #toggleStartMenu() {
        const existing = document.querySelector('.start-menu');
        if (existing) {
            existing.remove();
            this.startMenuOpen = false;
            return;
        }

        const menu = new UIView().init();
        menu.element.className = 'start-menu';
        menu.element.style.position = 'absolute';
        menu.element.style.top = `${CONFIG.TASKBAR_HEIGHT}px`;
        menu.element.style.left = '8px';
        menu.element.style.backgroundColor = UIColor.darkGray().css;
        menu.element.style.borderRadius = '8px';
        menu.element.style.padding = '8px 0';
        menu.element.style.minWidth = '200px';
        menu.element.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        menu.element.style.zIndex = '10000';

        const menuItems = [
            { text: '➕ Create New Desktop Icon', action: 'newIcon' },
            { text: '🌐 Add Web Link Icon', action: 'newWeblink' },
            { text: '📄 Add Custom HTML Icon', action: 'newHtml' },
            { text: 'ℹ️ About Web Desktop', action: 'about' },
        ];

        menuItems.forEach(item => {
            const menuItem = new UILabel(item.text).init();
            menuItem.setFrame(0, 0, 200, 36);
            menuItem.setFontSize(14);
            menuItem.setTextAlignment('left');
            menuItem.element.style.padding = '8px 16px';
            menuItem.element.style.cursor = 'pointer';
            menuItem.element.addEventListener('mouseenter', () => {
                menuItem.element.style.backgroundColor = 'rgba(255,255,255,0.1)';
            });
            menuItem.element.addEventListener('mouseleave', () => {
                menuItem.element.style.backgroundColor = 'transparent';
            });
            menuItem.element.addEventListener('click', () => {
                this.#handleMenuAction(item.action);
                this.#toggleStartMenu();
            });
            menu.element.appendChild(menuItem.element);
        });

        document.body.appendChild(menu.element);
        this.startMenuOpen = true;

        const closeMenu = (e) => {
            if (!menu.element.contains(e.target) && !e.target.closest('.start-button')) {
                this.#toggleStartMenu();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 100);
    }

    #handleMenuAction(action) {
        const actions = {
            newIcon: () => this.#promptNewIcon(),
            newWeblink: () => this.#promptWeblinkIcon(),
            newHtml: () => this.#promptHtmlIcon(),
            about: () => alert('Web Desktop OS v4.0\niOS UIKit-Inspired Architecture\nDrag • Resize • Persist'),
        };
        const fn = actions[action];
        if (fn) fn();
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
            data: { htmlContent: `<h3>${label}</h3><p>Custom widget</p>` },
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
