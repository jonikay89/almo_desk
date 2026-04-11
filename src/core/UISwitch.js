import UIControl from './UIControl.js';
import UIColor from './UIColor.js';
import { NSNumber } from './Foundation.js';
import Switch from './Switch.js';

class UISwitch extends UIControl {
    constructor() {
        super();
        this._isOn = false;
        this.onTintColor = UIColor.systemGreen();
        this.thumbTintColor = UIColor.white();
        this.trackOffColor = UIColor.lightGray();
    }

    get isOn() {
        return this._isOn;
    }

    set isOn(value) {
        this._isOn = !!value;
        this.#updateAppearance();
    }

    get description() {
        return `UISwitch(isOn: ${this._isOn})`;
    }

    isOnAsNumber() {
        return NSNumber.of(this._isOn ? 1 : 0);
    }

    init() {
        super.init();
        this.element.className = 'ui-switch';
        this.element.style.position = 'relative';
        this.element.style.display = 'inline-flex';
        this.element.style.alignItems = 'center';
        this.element.style.justifyContent = 'center';
        this.element.style.cursor = 'pointer';
        this.element.style.userSelect = 'none';

        this.trackElement = document.createElement('div');
        this.trackElement.style.position = 'relative';
        this.trackElement.style.width = '51px';
        this.trackElement.style.height = '31px';
        this.trackElement.style.borderRadius = '15.5px';
        this.trackElement.style.transition = 'background-color 0.2s ease';
        this.trackElement.style.boxSizing = 'border-box';
        this.trackElement.style.display = 'flex';
        this.trackElement.style.alignItems = 'center';

        this.thumbElement = document.createElement('div');
        this.thumbElement.style.position = 'relative';
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
        
        if (animated) {
            this.trackElement.style.transition = 'background-color 0.2s ease';
            this.thumbElement.style.transition = 'transform 0.2s ease, background-color 0.2s ease';
        } else {
            this.trackElement.style.transition = 'none';
            this.thumbElement.style.transition = 'none';
        }

        this.#updateAppearance();
    }

    setOnTintColor(color) {
        if (color instanceof UIColor) {
            this.onTintColor = color;
        } else if (typeof color === 'string') {
            this.onTintColor = UIColor.colorWithHex(color);
        }
        this.#updateAppearance();
    }

    setThumbTintColor(color) {
        if (color instanceof UIColor) {
            this.thumbTintColor = color;
        } else if (typeof color === 'string') {
            this.thumbTintColor = UIColor.colorWithHex(color);
        }
        this.#updateAppearance();
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
}

export default UISwitch;