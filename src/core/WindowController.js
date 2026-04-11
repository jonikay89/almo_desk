import UIViewController from './UIViewController.js';
import { escapeHtml, createElement } from '../utils/index.js';
import WidgetRegistry from '../widgets/index.js';

const CONFIG = {
    MIN_WIDTH: 300,
    MIN_HEIGHT: 240,
};

class WindowController extends UIViewController {
    constructor({ id, title, widgetType, extraData = {}, x = 100, y = 80, width = 520, height = 400 }) {
        super();
        this.windowId = id;
        this.title = title;
        this.widgetType = widgetType;
        this.extraData = extraData;
        this.widgetController = null;
        this.isMinimized = false;
        
        this.setFrame(x, y, width, height);
    }

    loadView() {
        console.log('WindowController.loadView called for window:', this.windowId);
        this.view.element = this.createView();
        this.isViewLoaded = true;
        console.log('view.element after loadView:', this.view.element);
    }

    createView() {
        const windowEl = document.createElement('div');
        windowEl.className = 'window';
        windowEl.setAttribute('data-id', this.windowId);
        return windowEl;
    }

    viewDidLoad() {
        const header = this.#createHeader();
        const content = this.#createContent();
        const resizeHandle = this.#createResizeHandle();
        
        this.view.element.appendChild(header);
        this.view.element.appendChild(content);
        this.view.element.appendChild(resizeHandle);
        
        this.#setupWidget();
    }

    #createHeader() {
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
                        this.os?.minimizeWindow(this.windowId);
                    }
                }),
                createElement('button', {
                    className: 'close-btn',
                    title: 'Close',
                    textContent: '✕',
                    onClick: (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.os?.closeWindow(this.windowId);
                    }
                })
            ])
        ]);

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('button')) return;
            e.preventDefault();
            this.os?.startDrag(this, e, 'move');
        });

        return header;
    }

    #createContent() {
        const content = createElement('div', { className: 'window-content' });
        const wrapper = createElement('div', { id: `win-content-${this.windowId}`, className: 'window-content-wrapper' });
        content.appendChild(wrapper);
        return content;
    }

    #createResizeHandle() {
        const handle = createElement('div', { className: 'resize-handle' });
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.os?.startDrag(this, e, 'resize');
        });
        return handle;
    }

    #setupWidget() {
        const wrapper = document.getElementById(`win-content-${this.windowId}`);
        if (wrapper) {
            try {
                const widget = WidgetRegistry.create(this.widgetType, this.extraData, this);
                widget.loadView();
                if (widget.element) {
                    wrapper.appendChild(widget.element);
                    widget.didMoveToSuperview();
                }
                this.widgetController = widget;
            } catch (e) {
                wrapper.innerHTML = `<p>Error: ${escapeHtml(e.message)}</p>`;
            }
        }
    }

    viewWillAppear(animated = false) {
        this.view.element?.classList.remove('hidden');
    }

    viewDidAppear(animated = false) {
        this.widgetController?.viewDidAppear?.(animated);
    }

    viewWillDisappear(animated = false) {
        this.widgetController?.viewWillDisappear?.(animated);
    }

    viewDidDisappear(animated = false) {
        this.widgetController?.viewDidDisappear?.(animated);
    }

    viewDidLayoutSubviews() {
        if (this.view.element) {
            this.view.element.style.left = `${this.frame.x}px`;
            this.view.element.style.top = `${this.frame.y}px`;
            this.view.element.style.width = `${this.frame.width}px`;
            this.view.element.style.height = `${this.frame.height}px`;
        }
    }

    setFrame(x, y, width, height) {
        super.setFrame(x, y, 
            Math.max(CONFIG.MIN_WIDTH, width), 
            Math.max(CONFIG.MIN_HEIGHT, height)
        );
        this.viewDidLayoutSubviews();
    }

    setActive(isActive) {
        if (this.view.element) {
            this.view.element.classList.toggle('active', isActive);
        }
    }

    setZIndex(zIndex) {
        this.view.zIndex = zIndex;
        if (this.view.element) {
            this.view.element.style.zIndex = zIndex;
        }
    }

    minimize() {
        this.view.element?.classList.add('minimized');
        this.viewWillDisappear();
        this.viewDidDisappear();
    }

    restore() {
        this.view.element?.classList.remove('minimized');
        this.viewWillAppear();
        this.viewDidAppear();
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
            minimized: this.view.element?.classList.contains('minimized'),
        };
    }
}

export default WindowController;
