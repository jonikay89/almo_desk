import { NSNumber } from './Foundation.js';
import { forCase, guardCase, guardLet, ifCase, ifLet, patternMatch, whileCase } from './PatternMatching.js';
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
    }

    get value() {
        return this._value;
    }

    set value(val) {
        this._value = Math.max(this._minimumValue, Math.min(this._maximumValue, val));
        this._accessibilityValue = `${this._value}`;
        this.#updateAppearance();
        this._updateAccessibilityAttributes();
    }

    get minimumValue() {
        return this._minimumValue;
    }

    get maximumValue() {
        return this._maximumValue;
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

        this.trackElement = document.createElement('div');
        this.trackElement.style.position = 'absolute';
        this.trackElement.style.flexGrow = '1';
        this.trackElement.style.height = '4px';
        this.trackElement.style.borderRadius = '2px';
        this.trackElement.style.backgroundColor = this.maximumTrackTintColor.css;

        this.minimumTrackElement = document.createElement('div');
        this.minimumTrackElement.style.position = 'absolute';
        this.minimumTrackElement.style.left = '0';
        this.minimumTrackElement.style.top = '0';
        this.minimumTrackElement.style.height = '100%';
        this.minimumTrackElement.style.borderRadius = '2px';
        this.minimumTrackElement.style.backgroundColor = this.minimumTrackTintColor.css;

        this.trackElement.appendChild(this.minimumTrackElement);
        this.element.appendChild(this.trackElement);

        this.thumbElement = document.createElement('div');
        this.thumbElement.style.position = 'absolute';
        this.thumbElement.style.width = '20px';
        this.thumbElement.style.height = '20px';
        this.thumbElement.style.borderRadius = '50%';
        this.thumbElement.style.backgroundColor = this.thumbTintColor.css;
        this.thumbElement.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        this.thumbElement.style.cursor = 'grab';
        this.thumbElement.style.transition = 'transform 0.1s ease';

        this.element.appendChild(this.thumbElement);

        this.#updateAppearance();
        this.#setupEventListeners();

        return this;
    }

    #setupEventListeners() {
        let isDragging = false;

        const updateValue = (clientX) => {
            const rect = this.trackElement.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            const newValue = this._minimumValue + percent * (this._maximumValue - this._minimumValue);
            
            const oldValue = this._value;
            this._value = newValue;
            this.#updateAppearance();

            if (this.isContinuous && oldValue !== newValue) {
                this.sendAction('valueChanged', 'input');
            }
        };

        this.element.addEventListener('mousedown', (e) => {
            isDragging = true;
            this.thumbElement.style.cursor = 'grabbing';
            updateValue(e.clientX);
            this.sendAction('editingDidBegin', 'mousedown');
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                updateValue(e.clientX);
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.thumbElement.style.cursor = 'grab';
                if (!this.isContinuous) {
                    this.sendAction('valueChanged', 'mouseup');
                }
                this.sendAction('editingDidEnd', 'mouseup');
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
                this.#updateAppearance();
                this.sendAction('valueChanged', 'keydown');
            }
        });

        this.element.setAttribute('tabindex', '0');
        this.element.setAttribute('role', 'slider');
        this.element.setAttribute('aria-valuemin', this._minimumValue);
        this.element.setAttribute('aria-valuemax', this._maximumValue);
    }

    #updateAppearance() {
        if (!this.trackElement || !this.minimumTrackElement || !this.thumbElement) return;

        const percent = (this._value - this._minimumValue) / (this._maximumValue - this._minimumValue);
        const trackWidth = this.trackElement.offsetWidth || 100;
        const thumbOffset = 10;

        this.minimumTrackElement.style.width = `${percent * (trackWidth - thumbOffset * 2)}px`;
        this.thumbElement.style.left = `${percent * (trackWidth - thumbOffset * 2) + thumbOffset - 10}px`;

        if (this.element) {
            this.element.setAttribute('aria-valuenow', this._value);
        }
    }

    setValue(value, animated = false) {
        const clampedValue = Math.max(this._minimumValue, Math.min(this._maximumValue, value));
        
        if (this.minimumTrackElement && this.thumbElement) {
            if (animated) {
                this.minimumTrackElement.style.transition = 'width 0.2s ease';
                this.thumbElement.style.transition = 'left 0.2s ease';
            } else {
                this.minimumTrackElement.style.transition = 'none';
                this.thumbElement.style.transition = 'none';
            }
        }

        this._value = clampedValue;
        if (this.minimumTrackElement && this.thumbElement) {
            this.#updateAppearance();
        }
        return this;
    }

    setMinimumValue(min) {
        this._minimumValue = min;
        if (this._value < min) this._value = min;
        this.#updateAppearance();
        return this;
    }

    setMaximumValue(max) {
        this._maximumValue = max;
        if (this._value > max) this._value = max;
        this.#updateAppearance();
        return this;
    }

    setMinimumTrackTintColor(color) {
        if (color instanceof UIColor) {
            this.minimumTrackTintColor = color;
        } else if (typeof color === 'string') {
            this.minimumTrackTintColor = UIColor.colorWithHex(color);
        }
        if (this.minimumTrackElement) {
            this.minimumTrackElement.style.backgroundColor = this.minimumTrackTintColor.css;
        }
        return this;
    }

    setMaximumTrackTintColor(color) {
        if (color instanceof UIColor) {
            this.maximumTrackTintColor = color;
        } else if (typeof color === 'string') {
            this.maximumTrackTintColor = UIColor.colorWithHex(color);
        }
        if (this.trackElement) {
            this.trackElement.style.backgroundColor = this.maximumTrackTintColor.css;
        }
        return this;
    }

    setThumbTintColor(color) {
        if (color instanceof UIColor) {
            this.thumbTintColor = color;
        } else if (typeof color === 'string') {
            this.thumbTintColor = UIColor.colorWithHex(color);
        }
        if (this.thumbElement) {
            this.thumbElement.style.backgroundColor = this.thumbTintColor.css;
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

    layoutSubviews() {
        super.layoutSubviews();
        if (this.element) {
            this.element.style.width = `${this.frame.width}px`;
            this.element.style.height = `${this.frame.height}px`;
        }
        this.#updateAppearance();
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

    ifCase(pattern, handler) {
        return ifCase(pattern)(this).then(handler);
    }

    guardCase(pattern) {
        return guardCase(pattern)(this);
    }

    static forCase(collection, pattern, handler) {
        for (const item of collection) {
            const result = forCase(pattern)(item);
            if (result !== undefined) {
                handler(result);
            }
        }
    }

    static whileCase(iterator, pattern) {
        return whileCase(pattern)(iterator);
    }

    matchOperator(pattern) {
        return patternMatch(pattern, this);
    }

    ifLet(pattern) {
        return ifLet(this, pattern);
    }

    guardLet(pattern) {
        return guardLet(this, pattern);
    }

    switch() {
        return Switch(this);
    }
}

export default UISlider;