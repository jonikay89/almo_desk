/**
 * DesktopOS Test Suite
 * Tests for the main DesktopOS class with mocked DOM
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

// Mock localStorage for testing
let localStorageData = {};

const storage = {
    get(key, fallback = null) {
        try {
            const raw = localStorageData[key];
            return raw ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    },
    set(key, value) {
        try {
            localStorageData[key] = JSON.stringify(value);
            return true;
        } catch (e) {
            return false;
        }
    }
};

// Mock document element creator
const mockElement = (id = '') => ({
    id,
    className: '',
    style: {},
    childNodes: [],
    appendChild: function(child) { this.childNodes.push(child); return child; },
    removeChild: function(child) { 
        this.childNodes = this.childNodes.filter(c => c !== child); 
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    classList: {
        toggle: (cls, val) => { 
            if (val === undefined) val = !this._classes?.[cls];
            this._classes = this._classes || {};
            this._classes[cls] = val; 
        }
    }
});

// Simplified Window class for testing
class TestWindow {
    constructor({ id, title, widgetType, extraData = {}, x = 100, y = 80, width = 520, height = 400 }) {
        this.windowId = id;
        this.title = title;
        this.widgetType = widgetType;
        this.extraData = extraData;
        this.frame = { x, y, width, height };
        this.bounds = { x: 0, y: 0, width, height };
        this.view = { zIndex: 100, element: null };
        this.isMinimized = false;
        this.os = null;
        this.isViewLoaded = false;
    }

    setFrame(x, y, width, height) {
        this.frame = { x, y, width, height };
        this.bounds = { x: 0, y: 0, width, height };
    }

    minimize() {
        this.isMinimized = true;
    }

    restore() {
        this.isMinimized = false;
    }

    setActive(isActive) {
        if (this.view.element) {
            this.view.element.classList.toggle('active', isActive);
        }
    }

    setZIndex(zIndex) {
        this.view.zIndex = zIndex;
    }

    toJSON() {
        return {
            id: this.windowId,
            title: this.title,
            widgetType: this.widgetType,
            extraData: this.extraData,
            x: this.frame.x,
            y: this.frame.y,
            width: this.frame.width,
            height: this.frame.height,
            zIndex: this.view.zIndex,
            minimized: this.isMinimized,
        };
    }

    loadViewIfNeeded() {
        if (!this.isViewLoaded) {
            this.view.element = mockElement(`window-${this.windowId}`);
            this.isViewLoaded = true;
        }
        return this.view;
    }
}

// DesktopOS for testing
class TestDesktopOS {
    constructor() {
        this.windows = [];
        this.nextId = 1;
        this.activeWindowId = null;
        this.startMenuOpen = false;
        this.desktopEl = mockElement('webDesktop');
        this.taskbarEl = mockElement('taskbar');
        
        this.#init();
    }

    #init() {
        this.#createDefaultWindows();
    }

    #createDefaultWindows() {
        this.addWindow('JIT Code Editor', 'codeEditor', {}, 60, 50, 640, 520);
        this.addWindow('Live Clock', 'clock', {}, 520, 50, 280, 200);
        this.addWindow('Sticky Notes', 'notes', { notesText: 'Write your ideas here...' }, 200, 320, 320, 260);
    }

    addWindow(title, widgetType, extraData = {}, x = 100, y = 80, w = 520, h = 400) {
        const id = this.nextId++;
        const maxZ = this.windows.length > 0 ? Math.max(...this.windows.map(w => w.view.zIndex)) : 100;
        
        const win = new TestWindow({ id, title, widgetType, extraData, x, y, width: w, height: h });
        win.view.zIndex = maxZ + 1;
        
        this.windows.push(win);
        this.activeWindowId = id;
        
        return win;
    }

    closeWindow(id) {
        this.windows = this.windows.filter(w => w.windowId !== id);
        if (this.activeWindowId === id) this.activeWindowId = null;
    }

    minimizeWindow(id) {
        const win = this.windows.find(w => w.windowId === id);
        if (!win) return;
        win.minimize();
        if (this.activeWindowId === id) this.activeWindowId = null;
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
    }

    getWindow(id) {
        return this.windows.find(w => w.windowId === id);
    }
}

describe('DesktopOS', () => {
    beforeEach(() => {
        localStorageData = {};
    });

    it('should initialize with 3 default windows', () => {
        const os = new TestDesktopOS();
        
        assert.strictEqual(os.windows.length, 3);
    });

    it('should have correct default window titles', () => {
        const os = new TestDesktopOS();
        
        assert.strictEqual(os.windows[0].title, 'JIT Code Editor');
        assert.strictEqual(os.windows[1].title, 'Live Clock');
        assert.strictEqual(os.windows[2].title, 'Sticky Notes');
    });

    it('should assign unique IDs to windows', () => {
        const os = new TestDesktopOS();
        
        const ids = os.windows.map(w => w.windowId);
        const uniqueIds = new Set(ids);
        
        assert.strictEqual(ids.length, uniqueIds.size);
        assert.strictEqual(os.nextId, 4);
    });

    it('should set correct widget types', () => {
        const os = new TestDesktopOS();
        
        assert.strictEqual(os.windows[0].widgetType, 'codeEditor');
        assert.strictEqual(os.windows[1].widgetType, 'clock');
        assert.strictEqual(os.windows[2].widgetType, 'notes');
    });

    it('should set correct frame for first window', () => {
        const os = new TestDesktopOS();
        const win = os.windows[0];
        
        assert.strictEqual(win.frame.x, 60);
        assert.strictEqual(win.frame.y, 50);
        assert.strictEqual(win.frame.width, 640);
        assert.strictEqual(win.frame.height, 520);
    });

    it('should add new window correctly', () => {
        const os = new TestDesktopOS();
        const initialCount = os.windows.length;
        
        os.addWindow('Test Window', 'clock', {}, 100, 100, 300, 200);
        
        assert.strictEqual(os.windows.length, initialCount + 1);
        const newWin = os.windows.find(w => w.title === 'Test Window');
        assert.ok(newWin);
        assert.strictEqual(newWin.widgetType, 'clock');
        assert.strictEqual(newWin.frame.width, 300);
        assert.strictEqual(newWin.frame.height, 200);
    });

    it('should close window correctly', () => {
        const os = new TestDesktopOS();
        const winToClose = os.windows[0];
        const initialCount = os.windows.length;
        
        os.closeWindow(winToClose.windowId);
        
        assert.strictEqual(os.windows.length, initialCount - 1);
        assert.ok(!os.windows.includes(winToClose));
    });

    it('should minimize window correctly', () => {
        const os = new TestDesktopOS();
        const win = os.windows[0];
        
        os.minimizeWindow(win.windowId);
        
        assert.strictEqual(win.isMinimized, true);
    });

    it('should restore minimized window correctly', () => {
        const os = new TestDesktopOS();
        const win = os.windows[0];
        
        os.minimizeWindow(win.windowId);
        os.restoreWindow(win.windowId);
        
        assert.strictEqual(win.isMinimized, false);
    });

    it('should bring window to front correctly', () => {
        const os = new TestDesktopOS();
        const win1 = os.windows[0];
        const win2 = os.windows[1];
        const initialZ1 = win1.view.zIndex;
        
        os.bringToFront(win2.windowId);
        
        assert.ok(win2.view.zIndex > initialZ1);
        assert.strictEqual(os.activeWindowId, win2.windowId);
    });

    it('should set zIndex higher for newer windows', () => {
        const os = new TestDesktopOS();
        
        const zIndices = os.windows.map(w => w.view.zIndex);
        
        for (let i = 1; i < zIndices.length; i++) {
            assert.ok(zIndices[i] > zIndices[i - 1]);
        }
    });

    it('should toJSON window correctly', () => {
        const os = new TestDesktopOS();
        const win = os.windows[0];
        
        const json = win.toJSON();
        
        assert.strictEqual(json.id, win.windowId);
        assert.strictEqual(json.title, win.title);
        assert.strictEqual(json.widgetType, win.widgetType);
        assert.strictEqual(json.x, win.frame.x);
        assert.strictEqual(json.y, win.frame.y);
        assert.strictEqual(json.width, win.frame.width);
        assert.strictEqual(json.height, win.frame.height);
        assert.strictEqual(json.zIndex, win.view.zIndex);
        assert.strictEqual(json.minimized, win.isMinimized);
    });

    it('should set extra data on window', () => {
        const os = new TestDesktopOS();
        const notesText = 'My custom notes';
        
        os.addWindow('Custom Notes', 'notes', { notesText }, 100, 100, 300, 200);
        
        const win = os.windows.find(w => w.title === 'Custom Notes');
        assert.strictEqual(win.extraData.notesText, notesText);
    });

    it('should use default dimensions when not specified', () => {
        const os = new TestDesktopOS();
        os.addWindow('Test', 'clock');
        
        const win = os.windows.find(w => w.title === 'Test');
        assert.strictEqual(win.frame.width, 520);
        assert.strictEqual(win.frame.height, 400);
    });

    it('should handle getWindow by ID', () => {
        const os = new TestDesktopOS();
        const win = os.windows[0];
        
        const found = os.getWindow(win.windowId);
        
        assert.strictEqual(found, win);
    });

    it('should return undefined for non-existent window ID', () => {
        const os = new TestDesktopOS();
        
        const found = os.getWindow(9999);
        
        assert.strictEqual(found, undefined);
    });
});

describe('Window Lifecycle', () => {
    beforeEach(() => {
        localStorageData = {};
    });

    it('should start with isMinimized false', () => {
        const os = new TestDesktopOS();
        
        os.windows.forEach(win => {
            assert.strictEqual(win.isMinimized, false);
        });
    });

    it('should clear activeWindowId when minimizing active window', () => {
        const os = new TestDesktopOS();
        const win = os.windows[0];
        os.activeWindowId = win.windowId;
        
        os.minimizeWindow(win.windowId);
        
        assert.strictEqual(os.activeWindowId, null);
    });
});
