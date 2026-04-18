import UIView from './UIView.js';
import UIColor from './UIColor.js';

class UITextField extends UIView {
    constructor(placeholder = '') {
        super();
        this._text = '';
        this._placeholder = placeholder;
        this._font = { size: 17, weight: 'normal' };
        this._textColor = UIColor.black();
        this._placeholderColor = UIColor.gray();
        this._borderStyle = 'none';
        this._isSecureTextEntry = false;
        this._isEnabled = true;
        this._isAccessibilityElement = true;
        this._accessibilityTraits = 0x80;
    }

    get text() { return this._text; }
    set text(value) { this._text = value; this._updateDisplay(); }

    get placeholder() { return this._placeholder; }
    set placeholder(value) { this._placeholder = value; this._updateDisplay(); }

    get font() { return this._font; }
    set font(value) { this._font = value; this._updateDisplay(); }

    get textColor() { return this._textColor; }
    set textColor(value) { this._textColor = value; this._updateDisplay(); }

    get isSecureTextEntry() { return this._isSecureTextEntry; }
    set isSecureTextEntry(value) { this._isSecureTextEntry = value; this._updateDisplay(); }

    get isEnabled() { return this._isEnabled; }
    set isEnabled(value) { this._isEnabled = value; this._updateDisplay(); }

    _updateDisplay() {
        if (typeof document !== 'undefined' && this._element) {
            this._element.value = this._text;
            this._element.placeholder = this._placeholder;
            this._element.style.fontSize = `${this._font.size}px`;
            this._element.style.fontWeight = this._font.weight;
            this._element.style.color = this._textColor ? this._textColor.toRGBAString() : 'black';
            this._element.style.background = 'transparent';
            this._element.style.border = this._borderStyle === 'none' ? 'none' : '1px solid #ccc';
            this._element.style.padding = '8px';
            this._element.disabled = !this._isEnabled;
            this._element.style.opacity = this._isEnabled ? '1' : '0.5';
        }
        this.accessibilityLabel = this._placeholder || 'Text field';
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('input');
            this._element.type = this._isSecureTextEntry ? 'password' : 'text';
            this._element.style.position = 'absolute';
            this._element.style.outline = 'none';
            this._element.style.boxSizing = 'border-box';
            this._updateDisplay();

            this._element.addEventListener('input', (e) => {
                this._text = e.target.value;
            });
        }
        return this._element;
    }
}

export default UITextField;