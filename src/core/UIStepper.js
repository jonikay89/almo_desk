import UIView from './UIView.js';
import UIColor from './UIColor.js';

class UIStepper extends UIView {
    constructor() {
        super();
        this._value = 0;
        this._minimumValue = 0;
        this._maximumValue = 100;
        this._stepValue = 1;
        this._isAccessibilityElement = true;
    }

    get value() { return this._value; }
    set value(v) { this._value = Math.max(this._minimumValue, Math.min(this._maximumValue, v)); this._updateDisplay(); }

    get minimumValue() { return this._minimumValue; }
    get maximumValue() { return this._maximumValue; }
    get stepValue() { return this._stepValue; }

    _updateDisplay() {
        this.accessibilityLabel = `Stepper value ${this._value}`;
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('div');
            this._element.style.cssText = 'display:flex;align-items:center;gap:0;';
            this._element.innerHTML = `
                <button class="stepper-minus" style="width:30px;height:30px;background:#f0f0f0;border:1px solid #ccc;border-radius:4px 0 0 4px;font-size:18px;cursor:pointer;">−</button>
                <span class="stepper-value" style="width:40px;text-align:center;font-size:14px;">${this._value}</span>
                <button class="stepper-plus" style="width:30px;height:30px;background:#f0f0f0;border:1px solid #ccc;border-radius:0 4px 4px 0;font-size:18px;cursor:pointer;">+</button>
            `;
            this._updateDisplay();

            this._element.querySelector('.stepper-minus').addEventListener('click', () => {
                this.value = Math.max(this._minimumValue, this._value - this._stepValue);
                this._element.querySelector('.stepper-value').textContent = this._value;
                if (this._target && this._action) this._action.call(this._target, this);
            });

            this._element.querySelector('.stepper-plus').addEventListener('click', () => {
                this.value = Math.min(this._maximumValue, this._value + this._stepValue);
                this._element.querySelector('.stepper-value').textContent = this._value;
                if (this._target && this._action) this._action.call(this._target, this);
            });
        }
        return this._element;
    }
}

UIStepper.prototype.addTarget = function(target, action) {
    this._target = target;
    this._action = action;
};

export default UIStepper;
