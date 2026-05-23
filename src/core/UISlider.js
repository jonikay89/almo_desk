import UIView from './UIView.js';
import UIColor from './UIColor.js';

let sliderStylesInjected = false;

function injectSliderStyles() {
    if (sliderStylesInjected || typeof document === 'undefined') return;
    sliderStylesInjected = true;
    const style = document.createElement('style');
    style.textContent = `
        input[type="range"].ui-slider {
            -webkit-appearance: none;
            appearance: none;
            height: 4px;
            border-radius: 2px;
            outline: none;
            border: none;
            padding: 0;
            margin: 0;
            cursor: pointer;
        }
        input[type="range"].ui-slider::-webkit-slider-runnable-track {
            height: 4px;
            border-radius: 2px;
            background: transparent;
        }
        input[type="range"].ui-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #007aff;
            margin-top: -8px;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        input[type="range"].ui-slider::-moz-range-track {
            height: 4px;
            border-radius: 2px;
            background: transparent;
        }
        input[type="range"].ui-slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #007aff;
            border: none;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        input[type="range"].ui-slider::-moz-range-progress {
            background: #007aff;
            border-radius: 2px;
            height: 4px;
        }
    `;
    document.head.appendChild(style);
}

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
        this.init();
    }

    get value() { return this._value; }
    set value(v) { this._value = Math.max(this._minimumValue, Math.min(this._maximumValue, v)); this._updateDisplay(); }

    get minimumValue() { return this._minimumValue; }
    set minimumValue(v) { this._minimumValue = v; this._updateDisplay(); }

    get maximumValue() { return this._maximumValue; }
    set maximumValue(v) { this._maximumValue = v; this._updateDisplay(); }

    _updateDisplay() {
        if (typeof document !== 'undefined' && this._element) {
            this._element.min = this._minimumValue;
            this._element.max = this._maximumValue;
            this._element.value = this._value;
            const pct = this._minimumValue === this._maximumValue ? 0 : ((this._value - this._minimumValue) / (this._maximumValue - this._minimumValue)) * 100;
            this._element.style.background = `linear-gradient(to right, #007aff ${pct}%, #e0e0e0 ${pct}%)`;
        }
        this.accessibilityLabel = `Slider value ${Math.round(this._value * 100)}%`;
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            injectSliderStyles();
            this._element = document.createElement('input');
            this._element.type = 'range';
            this._element.className = 'ui-slider';
            this._element.min = this._minimumValue;
            this._element.max = this._maximumValue;
            this._element.value = this._value;
            this._element.style.cursor = 'pointer';
            this._updateDisplay();

            this._element.addEventListener('input', (e) => {
                this._value = parseFloat(e.target.value);
                this._updateDisplay();
                if (this._target && this._action) {
                    this._action.call(this._target, this);
                }
            });
        }
        return this;
    }
}

UISlider.prototype.addTarget = function(target, action) {
    this._target = target;
    this._action = action;
};

export default UISlider;
