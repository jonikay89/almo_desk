import { createElement, escapeHtml } from '../utils/index.js';
import WidgetRegistry from '../widgets/index.js';

const CONFIG = {
    MIN_WIDTH: 300,
    MIN_HEIGHT: 240,
};

class Window {
    constructor({ id, title, widgetType, extraData = {}, x = 100, y = 80, width = 520, height = 400 }) {
        this.id = id;
        this.title = title;
        this.widgetType = widgetType;
        this.extraData = extraData;
        this.x = Math.max(0, x);
        this.y = Math.max(0, y);
        this.width = Math.max(CONFIG.MIN_WIDTH, width);
        this.height = Math.max(CONFIG.MIN_HEIGHT, height);
        this.zIndex = 100;
        this.minimized = false;
        this.element = null;
        this.contentElement = null;
        this.widget = null;
        this.os = null;
    }

    render(os, isActive) {
        this.os = os;
        this.element = document.createElement('div');
        this.element.className = `window ${isActive ? 'active' : ''}`;
        this.element.setAttribute('data-id', this.id);
        this.element.style.cssText = `
            left: ${this.x}px;
            top: ${this.y}px;
            width: ${this.width}px;
            height: ${this.height}px;
            z-index: ${this.zIndex};
        `;

        this.element.appendChild(this.#createHeader(os));
        this.element.appendChild(this.#createContent());
        this.element.appendChild(this.#createResizeHandle());

        return this.element;
    }

    #createHeader(os) {
        const header = createElement('div', { className: 'window-header' }, [
            createElement('span', { className: 'window-title', textContent: escapeHtml(this.title) }),
            createElement('div', { className: 'window-controls' }, [
                createElement('button', {
                    className: 'minimize-btn',
                    title: 'Minimize',
                    textContent: '−',
                    onClick: (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        os.minimizeWindow(this.id);
                    }
                }),
                createElement('button', {
                    className: 'close-btn',
                    title: 'Close',
                    textContent: '✕',
                    onClick: (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        os.closeWindow(this.id);
                    }
                })
            ])
        ]);

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('button')) return;
            e.preventDefault();
            os.startDrag(this.element, this.id, e, 'move');
        });

        return header;
    }

    #createContent() {
        const content = createElement('div', { className: 'window-content' });
        this.contentElement = createElement('div', { id: `win-content-${this.id}` });
        
        try {
            this.contentElement.appendChild(WidgetRegistry.create(this.widgetType, this.extraData));
        } catch (e) {
            this.contentElement.innerHTML = `<p>Error loading widget: ${escapeHtml(e.message)}</p>`;
        }
        
        content.appendChild(this.contentElement);
        return content;
    }

    #createResizeHandle() {
        const handle = createElement('div', { className: 'resize-handle' });
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.os.startDrag(this.element, this.id, e, 'resize');
        });
        return handle;
    }

    updatePosition(x, y) {
        this.x = x;
        this.y = y;
        if (this.element) {
            this.element.style.left = `${x}px`;
            this.element.style.top = `${y}px`;
        }
    }

    updateSize(width, height) {
        this.width = Math.max(CONFIG.MIN_WIDTH, width);
        this.height = Math.max(CONFIG.MIN_HEIGHT, height);
        if (this.element) {
            this.element.style.width = `${this.width}px`;
            this.element.style.height = `${this.height}px`;
        }
    }

    setActive(isActive) {
        if (this.element) {
            this.element.classList.toggle('active', isActive);
        }
    }

    setZIndex(zIndex) {
        this.zIndex = zIndex;
        if (this.element) {
            this.element.style.zIndex = zIndex;
        }
    }

    minimize() {
        this.minimized = true;
        if (this.element) {
            this.element.classList.add('minimized');
        }
    }

    restore() {
        this.minimized = false;
        if (this.element) {
            this.element.classList.remove('minimized');
        }
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            widgetType: this.widgetType,
            extraData: this.extraData,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            zIndex: this.zIndex,
            minimized: this.minimized,
        };
    }
}

export default Window;
