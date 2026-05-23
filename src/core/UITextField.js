import UIView from './UIView.js';
import UIColor from './UIColor.js';

class UITextField extends UIView {
    constructor(placeholder = '') {
        super();
        this._text = '';
        this._placeholder = placeholder;
        this._font = null;
        this._textColor = UIColor.black();
        this._placeholderColor = UIColor.gray();
        this._borderStyle = 'roundedRect';
        this._padding = { top: 8, left: 12, bottom: 8, right: 12 };
        this._isSecureTextEntry = false;
        this._isEnabled = true;
        this._isAccessibilityElement = true;
        this._accessibilityTraits = 0x80;
        this.init();
    }

    get text() { return this._text; }
    set text(value) { this._text = value; this._updateDisplay(); }

    getText() { return this._text; }
    setText(value) { this.text = value; }

    get placeholder() { return this._placeholder; }
    set placeholder(value) { this._placeholder = value; this._updateDisplay(); }

    get font() { return this._font; }
    set font(value) {
        this._font = value;
        this._updateDisplay();
    }

    get textColor() { return this._textColor; }
    set textColor(value) { this._textColor = value; this._updateDisplay(); }

    get borderStyle() { return this._borderStyle; }
    set borderStyle(value) { this._borderStyle = value; this._updateDisplay(); }

    get padding() { return this._padding; }
    set padding(value) { this._padding = { ...this._padding, ...value }; this._updateDisplay(); }

    get isSecureTextEntry() { return this._isSecureTextEntry; }
    set isSecureTextEntry(value) { this._isSecureTextEntry = value; this._updateDisplay(); }

    get isEnabled() { return this._isEnabled; }
    set isEnabled(value) { this._isEnabled = value; this._updateDisplay(); }

    _applyFont() {
        if (!this._element || !this._font) return;
        if (typeof this._font.toCSS === 'function') {
            this._element.style.font = this._font.toCSS();
        } else {
            const f = this._font;
            if (f.size) this._element.style.fontSize = `${f.size}px`;
            if (f.weight) this._element.style.fontWeight = f.weight;
            if (f.family) this._element.style.fontFamily = f.family;
        }
    }

    _updateDisplay() {
        if (typeof document !== 'undefined' && this._element) {
            this._element.value = this._text;
            this._element.placeholder = this._placeholder;
            this._applyFont();
            this._element.style.color = this._textColor ? this._textColor.toRGBAString() : 'black';
            this._element.style.background = 'transparent';
            this._element.style.padding = `${this._padding.top}px ${this._padding.right}px ${this._padding.bottom}px ${this._padding.left}px`;

            if (this._borderStyle === 'none') {
                this._element.style.border = 'none';
            } else if (this._borderStyle === 'line') {
                this._element.style.border = 'none';
                this._element.style.borderBottom = '1px solid #ccc';
            } else if (this._borderStyle === 'bezel') {
                this._element.style.border = '2px solid #999';
            } else {
                const cr = this._cornerRadius || (this._layer ? this._layer.cornerRadius : 6);
                const bw = this._layer && this._layer.borderWidth > 0 ? this._layer.borderWidth : 1;
                const bc = this._layer && this._layer.borderColor
                    ? (this._layer.borderColor.toRGBAString ? this._layer.borderColor.toRGBAString() : String(this._layer.borderColor))
                    : '#ccc';
                this._element.style.border = `${bw}px solid ${bc}`;
                this._element.style.borderRadius = `${cr}px`;
            }

            this._element.disabled = !this._isEnabled;
            this._element.style.opacity = this._isEnabled ? '1' : '0.5';
        }
        this.accessibilityLabel = this._placeholder || 'Text field';
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('input');
            this._element.type = this._isSecureTextEntry ? 'password' : 'text';
            this._element.style.outline = 'none';
            this._element.style.boxSizing = 'border-box';
            this._updateDisplay();

            this._element.addEventListener('input', (e) => {
                this._text = e.target.value;
                if (this._action) {
                    this._action.call(this._target, this);
                }
            });
        }
        return this;
    }
}

UITextField.prototype.addTarget = function(target, action) {
    this._target = target;
    this._action = action;
};

export default UITextField;
