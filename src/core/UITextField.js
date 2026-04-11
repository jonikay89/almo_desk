import UIControl from './UIControl.js';
import UIColor from './UIColor.js';

class UITextField extends UIControl {
    constructor(placeholder = '') {
        super();
        this.placeholder = placeholder;
        this.text = '';
        this._textColor = UIColor.black();
        this.fontSize = 14;
        this.fontFamily = 'system-ui, sans-serif';
        this.textAlignment = 'left';
        this.isSecureTextEntry = false;
        this.keyboardType = 'default';
        this.isEditing = false;
        this.clearButtonMode = 'never';
        this.borderStyle = 'rounded';
    }

    get textColor() {
        return this._textColor;
    }

    set textColor(color) {
        if (color instanceof UIColor) {
            this._textColor = color;
        } else if (typeof color === 'string') {
            this._textColor = UIColor.colorWithHex(color);
        }
        this.#updateStyle();
    }

    init() {
        super.init();
        this.element.className = 'ui-textfield';
        this.element.style.position = 'relative';
        this.element.style.display = 'inline-flex';
        this.element.style.alignItems = 'center';

        this.inputElement = document.createElement('input');
        this.inputElement.type = this.isSecureTextEntry ? 'password' : 'text';
        this.inputElement.placeholder = this.placeholder;
        this.inputElement.style.border = 'none';
        this.inputElement.style.background = 'transparent';
        this.inputElement.style.outline = 'none';
        this.inputElement.style.width = '100%';
        this.inputElement.style.padding = '8px 12px';
        this.inputElement.style.fontSize = `${this.fontSize}px`;
        this.inputElement.style.fontFamily = this.fontFamily;
        this.inputElement.style.color = this._textColor.css;

        this.element.appendChild(this.inputElement);

        this.#applyBorderStyle();
        this.#updateStyle();
        this.#setupEventListeners();

        return this;
    }

    deinit() {
        this.inputElement = null;
        super.deinit();
    }

    #applyBorderStyle() {
        const styles = {
            rounded: 'border: 1px solid #ccc; border-radius: 6px;',
            square: 'border: 1px solid #ccc; border-radius: 0;',
            line: 'border: none; border-bottom: 1px solid #ccc; border-radius: 0;',
            none: 'border: none;'
        };
        const style = styles[this.borderStyle] || styles.rounded;
        this.element.setAttribute('style', this.element.getAttribute('style') + ';' + style);
    }

    #setupEventListeners() {
        this.inputElement.addEventListener('focus', () => {
            this.isEditing = true;
            this.sendAction('editingDidBegin', 'focus');
        });

        this.inputElement.addEventListener('blur', () => {
            this.isEditing = false;
            this.sendAction('editingDidEnd', 'blur');
        });

        this.inputElement.addEventListener('input', () => {
            this.text = this.inputElement.value;
            this.sendAction('editingChanged', 'input');
        });

        this.inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.sendAction('editingDidEndOnExit', 'keydown');
            }
        });
    }

    #updateStyle() {
        if (this.inputElement) {
            this.inputElement.style.color = this._textColor.css;
            this.inputElement.style.textAlign = this.textAlignment;
        }
    }

    setText(text) {
        this.text = text;
        if (this.inputElement) {
            this.inputElement.value = text;
        }
    }

    setPlaceholder(text) {
        this.placeholder = text;
        if (this.inputElement) {
            this.inputElement.placeholder = text;
        }
    }

    setTextColor(color) {
        this.textColor = color;
    }

    setFontSize(size) {
        this.fontSize = size;
        if (this.inputElement) {
            this.inputElement.style.fontSize = `${size}px`;
        }
    }

    setTextAlignment(alignment) {
        this.textAlignment = alignment;
        this.#updateStyle();
    }

    setSecureTextEntry(secure) {
        this.isSecureTextEntry = secure;
        if (this.inputElement) {
            this.inputElement.type = secure ? 'password' : 'text';
        }
    }

    setKeyboardType(type) {
        const typeMap = {
            default: 'text',
            emailAddress: 'email',
            numberPad: 'number',
            phonePad: 'tel',
            url: 'url'
        };
        this.keyboardType = type;
        if (this.inputElement && !this.isSecureTextEntry) {
            this.inputElement.type = typeMap[type] || 'text';
        }
    }

    setBorderStyle(style) {
        this.borderStyle = style;
        this.#applyBorderStyle();
    }

    setClearButtonMode(mode) {
        this.clearButtonMode = mode;
    }

    becomeFirstResponder() {
        if (this.inputElement) {
            this.inputElement.focus();
            return true;
        }
        return false;
    }

    resignFirstResponder() {
        if (this.inputElement) {
            this.inputElement.blur();
            return true;
        }
        return false;
    }

    selectText() {
        if (this.inputElement) {
            this.inputElement.select();
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

export default UITextField;