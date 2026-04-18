import { NSNumber } from './Foundation.js';
import Switch from './Switch.js';
import UIColor from './UIColor.js';
import UIControl from './UIControl.js';

class UISlider extends UIControl {
    constructor() {
        super();
        this._value = 0.5;
        this._minimumValue = 0;
        this._maximumValue = 1;
        this.minimumTrackTintColor = UIColor.systemBlue();
        this.maximumTrackTintColor = UIColor.lightGray();
        this.thumbTintColor = UIColor.white();
        this.isContinuous = true;
        
        this._accessibilityTraits = ['adjustable'];
        this._isDragging = false;
    }

    get value() {
        return this._value;
    }

    set value(val) {
        this.setValue(val, false);
    }

    get description() {
        return `UISlider(value: ${this._value.toFixed(3)}, range: [${this._minimumValue}, ${this._maximumValue}])`;
    }

    valueAsNumber() {
        return NSNumber.of(this._value);
    }

    minimumValueAsNumber() {
        return NSNumber.of(this._minimumValue);
    }

    maximumValueAsNumber() {
        return NSNumber.of(this._maximumValue);
    }

    init() {
        super.init();
        this._layer.cssClass = 'ui-slider';
        this._layer.positioning = 'relative';
        
        this._trackElement = document.createElement('div');
        this._trackElement.className = 'ui-slider-track';
        this._trackElement.style.backgroundColor = this.maximumTrackTintColor.css;

        this._trackFillElement = document.createElement('div');
        this._trackFillElement.className = 'ui-slider-track-fill';
        this._trackFillElement.style.backgroundColor = this.minimumTrackTintColor.css;
        this._trackElement.appendChild(this._trackFillElement);

        this._thumbElement = document.createElement('div');
        this._thumbElement.className = 'ui-slider-thumb';
        this._thumbElement.style.backgroundColor = this.thumbTintColor.css;

        this.element.appendChild(this._trackElement);
        this.element.appendChild(this._thumbElement);
        
        this._setupEventListeners();
        this._updateAppearance();
        
        return this;
    }

    _setupEventListeners() {
        const updateValue = (clientX) => {
            const rect = this._trackElement.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            const newValue = this._minimumValue + percent * (this._maximumValue - this._minimumValue);
            
            if (newValue !== this._value) {
                this._value = newValue;
                this._updateAppearance();
                this.sendAction('valueChanged', 'valueChanged');
            }
        };

        this.element.addEventListener('mousedown', (e) => {
            this._isDragging = true;
            this._thumbElement.classList.add('active');
            updateValue(e.clientX);
        });

        document.addEventListener('mousemove', (e) => {
            if (this._isDragging) {
                updateValue(e.clientX);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this._isDragging) {
                this._isDragging = false;
                this._thumbElement.classList.remove('active');
            }
        });

        this.element.addEventListener('keydown', (e) => {
            const step = (this._maximumValue - this._minimumValue) * 0.05;
            let newValue = this._value;

            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                newValue = Math.min(this._maximumValue, this._value + step);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                newValue = Math.max(this._minimumValue, this._value - step);
            }

            if (newValue !== this._value) {
                this._value = newValue;
                this._updateAppearance();
                this.sendAction('valueChanged', 'valueChanged');
            }
        });

        this.element.setAttribute('tabindex', '0');
        this.element.setAttribute('role', 'slider');
        this.element.setAttribute('aria-valuemin', this._minimumValue);
        this.element.setAttribute('aria-valuemax', this._maximumValue);
    }

    _updateAppearance() {
        if (!this._trackElement || !this._trackFillElement || !this._thumbElement) return;

        const percent = (this._value - this._minimumValue) / (this._maximumValue - this._minimumValue);
        const trackWidth = this._trackElement.offsetWidth || 100;
        const thumbSize = 20;

        this._trackFillElement.style.width = `${percent * 100}%`;
        this._thumbElement.style.left = `${percent * trackWidth - thumbSize / 2}px`;

        this.element.setAttribute('aria-valuenow', this._value.toFixed(2));
    }

    layoutSubviews() {
        super.layoutSubviews();
        this._updateAppearance();
    }

    setValue(value, animated = false) {
        const clampedValue = Math.max(this._minimumValue, Math.min(this._maximumValue, value));
        this._value = clampedValue;
        this._updateAppearance();
        return this;
    }

    setMinimumValue(min) {
        this._minimumValue = min;
        if (this._value < min) this._value = min;
        this._updateAppearance();
        return this;
    }

    setMaximumValue(max) {
        this._maximumValue = max;
        if (this._value > max) this._value = max;
        this._updateAppearance();
        return this;
    }

    setMinimumTrackTintColor(color) {
        if (color instanceof UIColor) {
            this.minimumTrackTintColor = color;
        } else if (typeof color === 'string') {
            this.minimumTrackTintColor = UIColor.colorWithHex(color);
        }
        if (this._trackFillElement) {
            this._trackFillElement.style.backgroundColor = this.minimumTrackTintColor.css;
        }
        return this;
    }

    setMaximumTrackTintColor(color) {
        if (color instanceof UIColor) {
            this.maximumTrackTintColor = color;
        } else if (typeof color === 'string') {
            this.maximumTrackTintColor = UIColor.colorWithHex(color);
        }
        if (this._trackElement) {
            this._trackElement.style.backgroundColor = this.maximumTrackTintColor.css;
        }
        return this;
    }

    setThumbTintColor(color) {
        if (color instanceof UIColor) {
            this.thumbTintColor = color;
        } else if (typeof color === 'string') {
            this.thumbTintColor = UIColor.colorWithHex(color);
        }
        if (this._thumbElement) {
            this._thumbElement.style.backgroundColor = this.thumbTintColor.css;
        }
        return this;
    }

    setContinuous(continuous) {
        this.isContinuous = continuous;
        return this;
    }

    withValue(value, animated) {
        return this.setValue(value, animated);
    }

    withMinimumValue(min) {
        return this.setMinimumValue(min);
    }

    withMaximumValue(max) {
        return this.setMaximumValue(max);
    }

    withMinimumTrackTintColor(color) {
        return this.setMinimumTrackTintColor(color);
    }

    withMaximumTrackTintColor(color) {
        return this.setMaximumTrackTintColor(color);
    }

    withThumbTintColor(color) {
        return this.setThumbTintColor(color);
    }

    withContinuous(continuous) {
        return this.setContinuous(continuous);
    }

    encode() {
        return {
            value: this._value,
            minimumValue: this._minimumValue,
            maximumValue: this._maximumValue
        };
    }

    static decode(data) {
        const slider = new UISlider();
        slider._value = data.value;
        slider._minimumValue = data.minimumValue;
        slider._maximumValue = data.maximumValue;
        return slider;
    }
}

export default UISlider;
