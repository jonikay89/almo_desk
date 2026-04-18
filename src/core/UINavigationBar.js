import UIView from './UIView.js';

class UINavigationItem extends UIView {
    constructor(title = '') {
        super();
        this._title = title;
        this._backButtonTitle = '';
    }

    get title() { return this._title; }
    set title(value) { this._title = value; }
}

class UINavigationBar extends UIView {
    constructor() {
        super();
        this._items = [];
        this._title = '';
    }

    get title() { return this._title; }
    set title(value) { this._title = value; this._updateDisplay(); }

    pushItem(item) {
        this._items.push(item);
        this._updateDisplay();
    }

    popItem() {
        const item = this._items.pop();
        this._updateDisplay();
        return item;
    }

    _updateDisplay() {
        if (this._element) {
            this._element.textContent = this._title;
        }
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('div');
            this._element.style.cssText = 'height:44px;background:#f8f8f8;border-bottom:1px solid #ccc;display:flex;align-items:center;justify-content:center;';
            this._updateDisplay();
        }
        return this._element;
    }
}

export default UINavigationBar;
export { UINavigationItem };
