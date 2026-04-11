import UIControl from './UIControl.js';
import UIColor from './UIColor.js';

class UIStepper extends UIControl {
    constructor() {
        super();
        this._value = 0;
        this._minimumValue = 0;
        this._maximumValue = 100;
        this._stepValue = 1;
        this.wraps = false;
        this.tintColor = UIColor.systemBlue();
    }

    get value() {
        return this._value;
    }

    set value(val) {
        this._value = val;
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

    init() {
        super.init();
        this.element.className = 'ui-stepper';
        this.element.style.position = 'relative';
        this.element.style.display = 'inline-flex';
        this.element.style.alignItems = 'center';
        this.element.style.cursor = 'pointer';
        this.element.style.userSelect = 'none';
        this.element.style.backgroundColor = '#f0f0f0';
        this.element.style.borderRadius = '6px';
        this.element.style.overflow = 'hidden';
        this.element.style.border = '1px solid #ccc';

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
        this.#updateValueLabel();
        this.#updateButtonStates();
    }

    setMinimumValue(min) {
        this._minimumValue = min;
        if (this._value < min) this._value = min;
        this.#updateValueLabel();
        this.#updateButtonStates();
        this.element.setAttribute('aria-valuemin', min);
    }

    setMaximumValue(max) {
        this._maximumValue = max;
        if (this._value > max) this._value = max;
        this.#updateValueLabel();
        this.#updateButtonStates();
        this.element.setAttribute('aria-valuemax', max);
    }

    setStepValue(step) {
        this._stepValue = step;
    }

    setWraps(wraps) {
        this.wraps = wraps;
        this.#updateButtonStates();
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
    }

    layoutSubviews() {
        super.layoutSubviews();
        if (this.element) {
            this.element.style.width = `${this.frame.width}px`;
            this.element.style.height = `${this.frame.height}px`;
        }
    }
}

export default UIStepper;