import UIView from './UIView.js';
import UIColor from './UIColor.js';

class UIDatePicker extends UIView {
    constructor() {
        super();
        this._date = new Date();
        this._mode = 'date';
        this._isAccessibilityElement = true;
    }

    get date() { return this._date; }
    set date(value) { this._date = value; this._updateDisplay(); }

    get mode() { return this._mode; }
    set mode(value) { this._mode = value; }

    _updateDisplay() {
        this.accessibilityLabel = `Date picker: ${this._date.toLocaleDateString()}`;
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('input');
            this._element.type = this._mode === 'time' ? 'time' : this._mode === 'datetime' ? 'datetime-local' : 'date';
            this._element.style.position = 'absolute';
            this._element.value = this._date.toISOString().split('T')[0];
            this._updateDisplay();

            this._element.addEventListener('change', (e) => {
                this._date = new Date(e.target.value);
                if (this._target && this._action) this._action.call(this._target, this);
            });
        }
        return this._element;
    }
}

UIDatePicker.prototype.addTarget = function(target, action) {
    this._target = target;
    this._action = action;
};

export default UIDatePicker;
