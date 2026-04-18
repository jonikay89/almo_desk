import UIView from './UIView.js';
import UIColor from './UIColor.js';

class UISlider extends UIView {
    constructor() {
        super();
        this._value = 0.5;
        this._minimumValue = 0;
        this._maximumValue = 1;
        this._minimumTrackTintColor = UIColor.systemBlue();
        this._maximumTrackTintColor = UIColor.gray(0.8);
        this._isAccessibilityElement = true;
        this._accessibilityTraits = 0x80;
    }

    get value() { return this._value; }
    set value(v) { this._value = Math.max(this._minimumValue, Math.min(this._maximumValue, v)); this._updateDisplay(); }

    get minimumValue() { return this._minimumValue; }
    set minimumValue(v) { this._minimumValue = v; }

    get maximumValue() { return this._maximumValue; }
    set maximumValue(v) { this._maximumValue = v; }

    _updateDisplay() {
        if (typeof document !== 'undefined' && this._element) {
            const pct = ((this._value - this._minimumValue) / (this._maximumValue - this._minimumValue)) * 100;
            this._element.style.setProperty('--pct', `${pct}%`);
        }
        this.accessibilityLabel = `Slider value ${Math.round(this._value * 100)}%`;
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('input');
            this._element.type = 'range';
            this._element.style.position = 'absolute';
            this._element.style.width = '100%';
            this._element.style.height = '31px';
            this._element.style.minHeight = '31px';
            this._element.min = this._minimumValue;
            this._element.max = this._maximumValue;
            this._element.value = this._value;
            this._updateDisplay();

            this._element.addEventListener('input', (e) => {
                this._value = parseFloat(e.target.value);
                if (this._target && this._action) {
                    this._action.call(this._target, this);
                }
            });
        }
        return this._element;
    }
}

UISlider.prototype.addTarget = function(target, action) {
    this._target = target;
    this._action = action;
};

export default UISlider;
