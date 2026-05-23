import UIView from './UIView.js';

class UIBarButtonItem extends UIView {
    constructor(title, style = 'plain', target = null, action = null) {
        super();
        this._title = title;
        this._style = style;
        this._target = target;
        this._action = action;
        this._image = null;
        this._isEnabled = true;
        this._tintColor = null;
        this._width = 0;
    }

    static barButtonSystemItem(systemItem, target, action) {
        const item = new UIBarButtonItem('', 'done', target, action);
        item._systemItem = systemItem;
        return item;
    }

    get title() { return this._title; }
    set title(value) { this._title = value; }

    get style() { return this._style; }

    get image() { return this._image; }
    set image(value) { this._image = value; }

    get isEnabled() { return this._isEnabled; }
    set isEnabled(value) { this._isEnabled = value; }

    get tintColor() { return this._tintColor; }
    set tintColor(value) { this._tintColor = value; }

    get width() { return this._width; }
    set width(value) { this._width = value; }

    get target() { return this._target; }
    set target(value) { this._target = value; }

    get action() { return this._action; }
    set action(value) { this._action = value; }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('button');
            this._element.textContent = this._title;
            this._element.style.cssText = `
                background: none;
                border: none;
                font-size: 17px;
                padding: 8px 12px;
                cursor: pointer;
                color: #007AFF;
            `;
            if (this._style === 'done') {
                this._element.style.fontWeight = 'bold';
            }
            this._element.addEventListener('click', () => {
                if (this._isEnabled && this._target && this._action) {
                    this._action.call(this._target, this);
                }
            });
        }
        return this._element;
    }
}

class UIToolbar extends UIView {
    constructor() {
        super();
        this._items = [];
        this._barTintColor = null;
        this._isTranslucent = true;
    }

    get items() { return this._items; }
    set items(value) {
        this._items = value;
    }

    get barTintColor() { return this._barTintColor; }
    set barTintColor(value) { this._barTintColor = value; }

    get isTranslucent() { return this._isTranslucent; }
    set isTranslucent(value) { this._isTranslucent = value; }

    setItems(items, animated = false) {
        this._items = items;
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('div');
            this._element.style.cssText = `
                height: 44px;
                background: ${this._barTintColor || '#f8f8f8'};
                border-top: 1px solid #ccc;
                display: flex;
                align-items: center;
                padding: 0 8px;
                gap: 4px;
            `;
            if (this._isTranslucent) {
                this._element.style.backgroundColor = this._barTintColor
                    ? this._barTintColor
                    : 'rgba(248, 248, 248, 0.9)';
            }
        }
        return this._element;
    }
}

export default UIToolbar;
export { UIBarButtonItem };
