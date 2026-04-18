import UIView from './UIView.js';

class UIPageControl extends UIView {
    constructor() {
        super();
        this._numberOfPages = 5;
        this._currentPage = 0;
        this._isAccessibilityElement = true;
    }

    get numberOfPages() { return this._numberOfPages; }
    set numberOfPages(value) { this._numberOfPages = value; this._updateDisplay(); }

    get currentPage() { return this._currentPage; }
    set currentPage(value) { this._currentPage = value; this._updateDisplay(); }

    _updateDisplay() {
        this.accessibilityLabel = `Page ${this._currentPage + 1} of ${this._numberOfPages}`;
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('div');
            this._element.style.cssText = 'display:flex;gap:8px;align-items:center;';
            this._updateDisplay();

            for (let i = 0; i < this._numberOfPages; i++) {
                const dot = document.createElement('div');
                dot.style.cssText = `width:8px;height:8px;border-radius:50%;background:${i === this._currentPage ? '#007aff' : '#ccc'};cursor:pointer;`;
                dot.addEventListener('click', () => {
                    this.currentPage = i;
                    if (this._target && this._action) this._action.call(this._target, this);
                });
                this._element.appendChild(dot);
            }
        }
        return this._element;
    }
}

UIPageControl.prototype.addTarget = function(target, action) {
    this._target = target;
    this._action = action;
};

export default UIPageControl;
