import UIView from './UIView.js';
import UIColor from './UIColor.js';

class UISearchBar extends UIView {
    constructor() {
        super();
        this._text = '';
        this._placeholder = 'Search';
        this._isAccessibilityElement = true;
        this._accessibilityTraits = 0x8;
    }

    get text() { return this._text; }
    set text(value) { this._text = value; this._updateDisplay(); }

    get placeholder() { return this._placeholder; }
    set placeholder(value) { this._placeholder = value; this._updateDisplay(); }

    _updateDisplay() {
        this.accessibilityLabel = `Search: ${this._text || 'empty'}`;
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('div');
            this._element.style.cssText = 'display:flex;align-items:center;background:#f0f0f0;border-radius:10px;padding:8px 12px;gap:8px;';
            
            const searchIcon = document.createElement('span');
            searchIcon.textContent = '🔍';
            searchIcon.style.cssText = 'font-size:14px;';
            this._element.appendChild(searchIcon);
            
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = this._placeholder;
            input.style.cssText = 'flex:1;border:none;background:transparent;outline:none;font-size:15px;';
            input.addEventListener('input', (e) => {
                this._text = e.target.value;
                if (this._target && this._action) this._action.call(this._target, this);
            });
            this._element.appendChild(input);
            this._inputElement = input;
        }
        return this._element;
    }
}

UISearchBar.prototype.addTarget = function(target, action) {
    this._target = target;
    this._action = action;
};

export default UISearchBar;
