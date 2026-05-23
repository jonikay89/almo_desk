import UIControl from './UIControl.js';
import UIColor from './UIColor.js';

class UIButton extends UIControl {
    constructor(title = '') {
        super();
        this._title = title;
        this._backgroundColor = UIColor.systemBlue();
        this._titleColor = UIColor.white();
        this._cornerRadius = 8;
        this._padding = { horizontal: 16, vertical: 10 };
        this._isAccessibilityElement = true;
        this._accessibilityTraits = 0x1;
    }

    get title() { return this._title; }
    set title(value) { this._title = value; this._updateDisplay(); }

    get backgroundColor() { return this._backgroundColor; }
    set backgroundColor(value) { this._backgroundColor = value; this._updateDisplay(); }

    get titleColor() { return this._titleColor; }
    set titleColor(value) { this._titleColor = value; this._updateDisplay(); }

    setTitleColor(color) { this.titleColor = color; }

    _updateDisplay() {
        if (typeof document !== 'undefined' && this._element) {
            this._element.textContent = this._title;
            this._element.style.background = this._backgroundColor ? this._backgroundColor.toRGBAString() : '#007aff';
            this._element.style.color = this._titleColor ? this._titleColor.toRGBAString() : 'white';
            this._element.style.borderRadius = `${this._cornerRadius}px`;
            this._element.style.padding = `${this._padding.vertical}px ${this._padding.horizontal}px`;
            this._element.style.cursor = this._isEnabled ? 'pointer' : 'not-allowed';
            this._element.style.opacity = this._isEnabled ? '1' : '0.5';
        }
        this.accessibilityLabel = this._title;
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('button');
            this._element.style.border = 'none';
            this._element.style.fontFamily = 'inherit';
            this._element.style.fontSize = '15px';
            this._element.style.fontWeight = '600';
            this._element.style.display = 'inline-flex';
            this._element.style.alignItems = 'center';
            this._element.style.justifyContent = 'center';
            this._element.style.transition = 'opacity 0.15s, transform 0.1s';
            this._updateDisplay();

            this._element.addEventListener('click', () => {
                if (this._isEnabled) {
                    this.sendActionsForControlEvents('touchUpInside');
                }
            });

            this._element.addEventListener('mousedown', () => {
                if (this._isEnabled) {
                    this._element.style.transform = 'scale(0.97)';
                }
            });

            this._element.addEventListener('mouseup', () => {
                this._element.style.transform = 'scale(1)';
            });

            this._element.addEventListener('mouseleave', () => {
                this._element.style.transform = 'scale(1)';
            });
        }
        return this._element;
    }
}

export default UIButton;