import { NSNumber } from './Foundation.js';
import { forCase, guardCase, guardLet, ifCase, ifLet, patternMatch, whileCase } from './PatternMatching.js';
import Switch from './Switch.js';
import UIColor from './UIColor.js';
import UIControl from './UIControl.js';

class UIStepper extends UIControl {
    constructor() {
        super();
        this._value = 0;
        this._minimumValue = 0;
        this._maximumValue = 100;
        this._stepValue = 1;
        this.wraps = false;
        this.tintColor = UIColor.systemBlue();
        
        this._accessibilityTraits = ['adjustable'];
    }

    get value() {
        return this._value;
    }

    set value(val) {
        this._value = val;
        this._accessibilityValue = `${this._value}`;
        this._updateAccessibilityAttributes();
    }

    get minimumValue() {
        return this._minimumValue;
    }

    set minimumValue(val) {
        this._minimumValue = val;
        if (this.element) {
            this.element.setAttribute('aria-valuemin', val);
        }
    }

    get maximumValue() {
        return this._maximumValue;
    }

    set maximumValue(val) {
        this._maximumValue = val;
        if (this.element) {
            this.element.setAttribute('aria-valuemax', val);
        }
    }

    get stepValue() {
        return this._stepValue;
    }

    set stepValue(val) {
        this._stepValue = val;
    }

    get description() {
        return `UIStepper(value: ${this._value}, range: [${this._minimumValue}, ${this._maximumValue}], step: ${this._stepValue})`;
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

    stepValueAsNumber() {
        return NSNumber.of(this._stepValue);
    }

    init() {
        super.init();
        this._layer.cssClass = 'ui-stepper';

        this.decrementButton = document.createElement('button');
        this.decrementButton.style.border = 'none';
        this.decrementButton.style.background = 'transparent';
        this.decrementButton.style.color = '#333';
        this.decrementButton.style.fontSize = '16px';
        this.decrementButton.style.fontWeight = 'bold';
        this.decrementButton.style.cursor = 'pointer';
        this.decrementButton.style.padding = '8px 12px';
        this.decrementButton.style.display = 'flex';
        this.decrementButton.style.alignItems = 'center';
        this.decrementButton.style.justifyContent = 'center';
        this.decrementButton.textContent = '−';
        this.decrementButton.style.borderRight = '1px solid #ccc';

        this.valueLabel = document.createElement('span');
        this.valueLabel.style.padding = '8px 14px';
        this.valueLabel.style.fontSize = '14px';
        this.valueLabel.style.fontWeight = '600';
        this.valueLabel.style.color = '#333';
        this.valueLabel.style.backgroundColor = 'transparent';
        this.valueLabel.style.minWidth = '40px';
        this.valueLabel.style.textAlign = 'center';

        this.incrementButton = document.createElement('button');
        this.incrementButton.style.border = 'none';
        this.incrementButton.style.background = 'transparent';
        this.incrementButton.style.color = '#333';
        this.incrementButton.style.fontSize = '16px';
        this.incrementButton.style.fontWeight = 'bold';
        this.incrementButton.style.cursor = 'pointer';
        this.incrementButton.style.padding = '8px 12px';
        this.incrementButton.style.display = 'flex';
        this.incrementButton.style.alignItems = 'center';
        this.incrementButton.style.justifyContent = 'center';
        this.incrementButton.textContent = '+';
        this.incrementButton.style.borderLeft = '1px solid #ccc';

        this.element.appendChild(this.decrementButton);
        this.element.appendChild(this.valueLabel);
        this.element.appendChild(this.incrementButton);

        this.#updateValueLabel();
        this.#updateButtonStates();
        this.#setupEventListeners();

        return this;
    }

    #setupEventListeners() {
        const increment = (isLongPress = false) => {
            let newValue = this._value + this._stepValue;
            
            if (newValue > this._maximumValue) {
                if (this.wraps) {
                    newValue = this._minimumValue;
                } else {
                    newValue = this._maximumValue;
                }
            }
            
            if (newValue !== this._value) {
                this._value = newValue;
                this.#updateValueLabel();
                this.#updateButtonStates();
                this.sendAction('valueChanged', 'click');
            }
        };

        const decrement = () => {
            let newValue = this._value - this._stepValue;
            
            if (newValue < this._minimumValue) {
                if (this.wraps) {
                    newValue = this._maximumValue;
                } else {
                    newValue = this._minimumValue;
                }
            }
            
            if (newValue !== this._value) {
                this._value = newValue;
                this.#updateValueLabel();
                this.#updateButtonStates();
                this.sendAction('valueChanged', 'click');
            }
        };

        this.incrementButton.addEventListener('click', (e) => {
            e.stopPropagation();
            increment();
        });

        this.decrementButton.addEventListener('click', (e) => {
            e.stopPropagation();
            decrement();
        });

        let longPressInterval = null;
        const startLongPress = (action) => {
            longPressInterval = setInterval(() => {
                action(true);
            }, 100);
        };
        const stopLongPress = () => {
            if (longPressInterval) {
                clearInterval(longPressInterval);
                longPressInterval = null;
            }
        };

        this.incrementButton.addEventListener('mousedown', () => startLongPress(increment));
        this.decrementButton.addEventListener('mousedown', () => startLongPress(decrement));
        document.addEventListener('mouseup', stopLongPress);
        document.addEventListener('mouseleave', stopLongPress);

        this.element.setAttribute('tabindex', '0');
        this.element.setAttribute('role', 'spinbutton');
        this.element.setAttribute('aria-valuemin', this._minimumValue);
        this.element.setAttribute('aria-valuemax', this._maximumValue);
        this.element.setAttribute('aria-valuenow', this._value);

        this.element.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                increment();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                decrement();
            }
        });
    }

    #updateValueLabel() {
        if (this.valueLabel) {
            this.valueLabel.textContent = this._value;
            this.element.setAttribute('aria-valuenow', this._value);
        }
    }

    #updateButtonStates() {
        if (this.incrementButton && this.decrementButton) {
            this.incrementButton.disabled = !this.wraps && this._value >= this._maximumValue;
            this.decrementButton.disabled = !this.wraps && this._value <= this._minimumValue;
            
            this.incrementButton.style.opacity = this.incrementButton.disabled ? '0.5' : '1';
            this.decrementButton.style.opacity = this.decrementButton.disabled ? '0.5' : '1';
        }
    }

    setValue(value, animated = false) {
        this._value = Math.max(this._minimumValue, Math.min(this._maximumValue, value));
        if (this.valueLabel) {
            this.#updateValueLabel();
        }
        if (this.incrementButton) {
            this.#updateButtonStates();
        }
        return this;
    }

    setMinimumValue(min) {
        this._minimumValue = min;
        if (this._value < min) this._value = min;
        if (this.valueLabel) {
            this.#updateValueLabel();
        }
        if (this.incrementButton) {
            this.#updateButtonStates();
        }
        if (this.element) {
            this.element.setAttribute('aria-valuemin', min);
        }
        return this;
    }

    setMaximumValue(max) {
        this._maximumValue = max;
        if (this._value > max) this._value = max;
        if (this.valueLabel) {
            this.#updateValueLabel();
        }
        if (this.incrementButton) {
            this.#updateButtonStates();
        }
        if (this.element) {
            this.element.setAttribute('aria-valuemax', max);
        }
        return this;
    }

    setStepValue(step) {
        this._stepValue = step;
        return this;
    }

    setWraps(wraps) {
        this.wraps = wraps;
        this.#updateButtonStates();
        return this;
    }

    setTintColor(color) {
        if (color instanceof UIColor) {
            this.tintColor = color;
        } else if (typeof color === 'string') {
            this.tintColor = UIColor.colorWithHex(color);
        }
        if (this.incrementButton) {
            this.incrementButton.style.color = this.tintColor.css;
            this.decrementButton.style.color = this.tintColor.css;
        }
        return this;
    }

    withValue(value) {
        return this.setValue(value);
    }

    withMinimumValue(min) {
        return this.setMinimumValue(min);
    }

    withMaximumValue(max) {
        return this.setMaximumValue(max);
    }

    withStepValue(step) {
        return this.setStepValue(step);
    }

    withWraps(wraps) {
        return this.setWraps(wraps);
    }

    withTintColor(color) {
        return this.setTintColor(color);
    }

    layoutSubviews() {
        super.layoutSubviews();
        if (this.element) {
            this.element.style.width = `${this.frame.width}px`;
            this.element.style.height = `${this.frame.height}px`;
        }
    }

    encode() {
        return {
            value: this._value,
            minimumValue: this._minimumValue,
            maximumValue: this._maximumValue,
            stepValue: this._stepValue,
            wraps: this.wraps
        };
    }

    static decode(data) {
        const stepper = new UIStepper();
        stepper._value = data.value || 0;
        stepper._minimumValue = data.minimumValue || 0;
        stepper._maximumValue = data.maximumValue || 100;
        stepper._stepValue = data.stepValue || 1;
        stepper.wraps = data.wraps || false;
        return stepper;
    }

    matchValue(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this._value);
        }
        return Switch(predicate)
            .case({ min: Switch.let('min'), max: Switch.let('max') }, 
                  (m) => this._value >= m.min && this._value <= m.max)
            .case({ at: Switch.let('v') }, (m) => this._value === m.v)
            .case({ above: Switch.let('v') }, (m) => this._value > m.v)
            .case({ below: Switch.let('v') }, (m) => this._value < m.v)
            .case({ even: true }, () => this._value % 2 === 0)
            .case({ odd: true }, () => this._value % 2 !== 0)
            .case({ zero: true }, () => this._value === 0)
            .case({ positive: true }, () => this._value > 0)
            .case({ negative: true }, () => this._value < 0)
            .case(Switch.let('value'), (m) => this._value === m.value)
            .default(() => false)
            .evaluate();
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

export default UIStepper;