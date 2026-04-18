import UIView from './UIView.js';
import UIColor from './UIColor.js';

class UISegmentedControl extends UIView {
    constructor(segments = []) {
        super();
        this._segments = segments;
        this._selectedIndex = 0;
        this._isAccessibilityElement = true;
        this._accessibilityTraits = 0x1;
    }

    get selectedIndex() { return this._selectedIndex; }
    set selectedIndex(value) { this._selectedIndex = value; this._updateDisplay(); }

    _updateDisplay() {
        if (typeof document !== 'undefined' && this._element) {
            const btns = this._element.querySelectorAll('button');
            btns.forEach((btn, i) => {
                btn.style.background = i === this._selectedIndex ? '#007aff' : '#f0f0f0';
                btn.style.color = i === this._selectedIndex ? 'white' : '#333';
            });
        }
        this.accessibilityLabel = this._segments[this._selectedIndex] || 'Segment';
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('div');
            this._element.style.cssText = 'display:flex;';
            this._updateDisplay();

            this._segments.forEach((title, index) => {
                const btn = document.createElement('button');
                btn.textContent = title;
                btn.style.cssText = 'flex:1;padding:8px 12px;border:1px solid #ccc;font-size:13px;cursor:pointer;background:#f0f0f0;color:#333;';
                if (index === 0) btn.style.borderRadius = '4px 0 0 4px';
                if (index === this._segments.length - 1) btn.style.borderRadius = '0 4px 4px 0';
                btn.addEventListener('click', () => {
                    this.selectedIndex = index;
                    if (this._target && this._action) this._action.call(this._target, this);
                });
                this._element.appendChild(btn);
            });
        }
        return this._element;
    }
}

UISegmentedControl.prototype.addTarget = function(target, action) {
    this._target = target;
    this._action = action;
};

export default UISegmentedControl;
