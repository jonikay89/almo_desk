import { NSNumber } from './Foundation.js';
import { forCase, guardCase, guardLet, ifCase, ifLet, patternMatch, whileCase } from './PatternMatching.js';
import Switch from './Switch.js';
import UIColor from './UIColor.js';
import UIControl from './UIControl.js';

class UISwitch extends UIControl {
    constructor() {
        super();
        this._isOn = false;
        this.onTintColor = UIColor.systemGreen();
        this.thumbTintColor = UIColor.white();
        this.trackOffColor = UIColor.lightGray();
        
        this._accessibilityTraits = ['button', 'adjustable'];
    }

    get isOn() {
        return this._isOn;
    }

    set isOn(value) {
        this._isOn = !!value;
        this._accessibilityValue = this._isOn ? 'On' : 'Off';
        this._accessibilityState = this._accessibilityState || {};
        this._accessibilityState.selected = this._isOn;
        this.#updateAppearance();
        this._updateAccessibilityAttributes();
    }

    get description() {
        return `UISwitch(isOn: ${this._isOn})`;
    }

    isOnAsNumber() {
        return NSNumber.of(this._isOn ? 1 : 0);
    }

    init() {
        super.init();
        this._layer.cssClass = 'ui-switch';

        this.trackElement = document.createElement('div');
        this.trackElement.style.position = 'absolute';
        this.trackElement.style.width = '51px';
        this.trackElement.style.height = '31px';
        this.trackElement.style.borderRadius = '15.5px';
        this.trackElement.style.transition = 'background-color 0.2s ease';
        this.trackElement.style.boxSizing = 'border-box';
        this.trackElement.style.display = 'flex';
        this.trackElement.style.alignItems = 'center';

        this.thumbElement = document.createElement('div');
        this.thumbElement.style.position = 'absolute';
        this.thumbElement.style.width = '27px';
        this.thumbElement.style.height = '27px';
        this.thumbElement.style.borderRadius = '13.5px';
        this.thumbElement.style.backgroundColor = '#ffffff';
        this.thumbElement.style.transition = 'transform 0.2s ease, background-color 0.2s ease';
        this.thumbElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        this.thumbElement.style.flexShrink = '0';

        this.trackElement.appendChild(this.thumbElement);
        this.element.appendChild(this.trackElement);

        this.#updateAppearance();
        this.#setupEventListeners();

        return this;
    }

    #setupEventListeners() {
        this.element.addEventListener('click', () => {
            this.setOn(!this._isOn, true);
            this.sendAction('valueChanged', 'click');
        });

        this.element.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                this.setOn(!this._isOn, true);
                this.sendAction('valueChanged', 'keydown');
            }
        });

        this.element.setAttribute('tabindex', '0');
        this.element.setAttribute('role', 'switch');
        this.element.setAttribute('aria-checked', this._isOn);
    }

    #updateAppearance() {
        if (!this.trackElement || !this.thumbElement) return;

        if (this._isOn) {
            this.trackElement.style.backgroundColor = this.onTintColor.css;
            this.trackElement.style.border = `2px solid ${this.onTintColor.withAlpha(0.8).css}`;
            this.thumbElement.style.backgroundColor = this.thumbTintColor.css;
            this.thumbElement.style.transform = 'translateX(12px)';
        } else {
            this.trackElement.style.backgroundColor = this.trackOffColor.css;
            this.trackElement.style.border = '2px solid transparent';
            this.thumbElement.style.backgroundColor = this.thumbTintColor.css;
            this.thumbElement.style.transform = 'translateX(-12px)';
        }

        if (this.element) {
            this.element.setAttribute('aria-checked', this._isOn);
        }
    }

    setOn(on, animated = false) {
        this._isOn = !!on;
        
        if (this.trackElement && this.thumbElement) {
            if (animated) {
                this.trackElement.style.transition = 'background-color 0.2s ease';
                this.thumbElement.style.transition = 'transform 0.2s ease, background-color 0.2s ease';
            } else {
                this.trackElement.style.transition = 'none';
                this.thumbElement.style.transition = 'none';
            }
        }

        if (this.trackElement && this.thumbElement) {
            this.#updateAppearance();
        }
        return this;
    }

    setOnTintColor(color) {
        if (color instanceof UIColor) {
            this.onTintColor = color;
        } else if (typeof color === 'string') {
            this.onTintColor = UIColor.colorWithHex(color);
        }
        if (this.trackElement && this.thumbElement) {
            this.#updateAppearance();
        }
        return this;
    }

    setThumbTintColor(color) {
        if (color instanceof UIColor) {
            this.thumbTintColor = color;
        } else if (typeof color === 'string') {
            this.thumbTintColor = UIColor.colorWithHex(color);
        }
        if (this.trackElement && this.thumbElement) {
            this.#updateAppearance();
        }
        return this;
    }

    setTrackOffColor(color) {
        if (color instanceof UIColor) {
            this.trackOffColor = color;
        } else if (typeof color === 'string') {
            this.trackOffColor = UIColor.colorWithHex(color);
        }
        if (this.trackElement && this.thumbElement) {
            this.#updateAppearance();
        }
        return this;
    }

    withOn(on, animated) {
        return this.setOn(on, animated);
    }

    withOnTintColor(color) {
        return this.setOnTintColor(color);
    }

    withThumbTintColor(color) {
        return this.setThumbTintColor(color);
    }

    withTrackOffColor(color) {
        return this.setTrackOffColor(color);
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
            isOn: this._isOn
        };
    }

    static decode(data) {
        const sw = new UISwitch();
        sw._isOn = data.isOn || false;
        return sw;
    }

    matchState(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this._isOn);
        }
        return Switch(predicate)
            .case('on', () => this._isOn === true)
            .case('off', () => this._isOn === false)
            .case(true, () => this._isOn === true)
            .case(false, () => this._isOn === false)
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

export default UISwitch;