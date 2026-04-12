import UIControl from './UIControl.js';
import UIColor from './UIColor.js';
import { Scanner, NSNumber, kp, getProperty, updateProperty } from './Foundation.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';
import { defineTypeAlias } from './Protocol.js';
import { TextFieldDelegate } from './TypeAliases.js';
import { TextStorage, AttributedString } from './TextStorage.js';
import { CALayer, CAShapeLayer, CGPath } from './CALayer.js';

defineTypeAlias('TextFieldDelegateAlias', TextFieldDelegate);

class UITextField extends UIControl {
    constructor(placeholder = '') {
        super();
        this.placeholder = placeholder;
        this.text = '';
        this._textColor = UIColor.black();
        this._textStorage = TextStorage.Create();
        this._textStorage.defaultAttributes = {
            font: { size: 14, family: 'system-ui', weight: 'normal' },
            textColor: UIColor.black(),
            backgroundColor: null
        };
        this.fontSize = 14;
        this.fontFamily = 'system-ui, sans-serif';
        this.textAlignment = 'left';
        this.isSecureTextEntry = false;
        this.keyboardType = 'default';
        this.isEditing = false;
        this.clearButtonMode = 'never';
        this.borderStyle = 'rounded';
        this._borderLayer = null;
        this._selectionLayer = null;
        this._cursorLayer = null;
        
        this._accessibilityTraits = ['textField'];
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

    get description() {
        return `UITextField(text: "${this.text}", placeholder: "${this.placeholder}")`;
    }

    scanner() {
        return new Scanner(this.text);
    }

    parseInt() {
        const scanner = this.scanner();
        return scanner.scanInt();
    }

    parseDouble() {
        const scanner = this.scanner();
        return scanner.scanDouble();
    }

    textAsNumber() {
        const num = this.parseDouble();
        return num !== null ? NSNumber.of(num) : null;
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
        return this;
    }

    setPlaceholder(text) {
        this.placeholder = text;
        if (this.inputElement) {
            this.inputElement.placeholder = text;
        }
        return this;
    }

    setTextColor(color) {
        this.textColor = color;
        return this;
    }

    setFontSize(size) {
        this.fontSize = size;
        if (this.inputElement) {
            this.inputElement.style.fontSize = `${size}px`;
        }
        return this;
    }

    setFontFamily(family) {
        this.fontFamily = family;
        if (this.inputElement) {
            this.inputElement.style.fontFamily = family;
        }
        return this;
    }

    setTextAlignment(alignment) {
        this.textAlignment = alignment;
        this.#updateStyle();
        return this;
    }

    setSecureTextEntry(secure) {
        this.isSecureTextEntry = secure;
        if (this.inputElement) {
            this.inputElement.type = secure ? 'password' : 'text';
        }
        return this;
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
        return this;
    }

    setBorderStyle(style) {
        this.borderStyle = style;
        this.#applyBorderStyle();
        return this;
    }

    setClearButtonMode(mode) {
        this.clearButtonMode = mode;
        return this;
    }

    withText(text) {
        return this.setText(text);
    }

    withPlaceholder(text) {
        return this.setPlaceholder(text);
    }

    withTextColor(color) {
        return this.setTextColor(color);
    }

    withFontSize(size) {
        return this.setFontSize(size);
    }

    withFontFamily(family) {
        return this.setFontFamily(family);
    }

    withTextAlignment(alignment) {
        return this.setTextAlignment(alignment);
    }

    withSecureTextEntry(secure) {
        return this.setSecureTextEntry(secure);
    }

    withKeyboardType(type) {
        return this.setKeyboardType(type);
    }

    withBorderStyle(style) {
        return this.setBorderStyle(style);
    }

    withClearButtonMode(mode) {
        return this.setClearButtonMode(mode);
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
        this.#updateBorderLayer();
    }

    #updateBorderLayer() {
        if (!this._borderLayer && this.element) {
            this._borderLayer = CAShapeLayer.layer();
            this._borderLayer.name = 'borderLayer';
            this.element.style.position = 'relative';
        }
        
        if (this._borderLayer) {
            const path = CGPath.CreateRoundedRect(0, 0, this._bounds.width, this._bounds.height, 6);
            this._borderLayer.path = path;
            this._borderLayer.fillColor = null;
            this._borderLayer.strokeColor = this._borderColor || UIColor.lightGray();
            this._borderLayer.lineWidth = 1;
            
            if (!this._layer._sublayers.includes(this._borderLayer)) {
                this._layer.addSublayer(this._borderLayer);
            }
        }
    }

    setBorderColor(color) {
        this._borderColor = color instanceof UIColor ? color : UIColor.colorWithHex(color);
        this.#updateBorderLayer();
        return this;
    }

    setBorderWidth(width) {
        this._borderWidth = width;
        if (this._borderLayer) {
            this._borderLayer.lineWidth = width;
        }
        return this;
    }

    setCornerRadius(radius) {
        this._cornerRadius = radius;
        this.#updateBorderLayer();
        return this;
    }

    get textStorage() {
        return this._textStorage;
    }

    setAttributedText(attributedText) {
        if (attributedText instanceof TextStorage) {
            this._textStorage = attributedText;
            this.text = attributedText.string;
        } else if (attributedText instanceof AttributedString) {
            this._textStorage.string = attributedText.string;
            this.text = attributedText.string;
        }
        return this;
    }

    get attributedText() {
        return this._textStorage;
    }

    withBorderColor(color) {
        return this.setBorderColor(color);
    }

    withBorderWidth(width) {
        return this.setBorderWidth(width);
    }

    withCornerRadius(radius) {
        return this.setCornerRadius(radius);
    }

    withAttributedText(attributedText) {
        return this.setAttributedText(attributedText);
    }

    encode() {
        return {
            text: this.text,
            placeholder: this.placeholder,
            fontSize: this.fontSize,
            textAlignment: this.textAlignment,
            isSecureTextEntry: this.isSecureTextEntry,
            keyboardType: this.keyboardType
        };
    }

    static decode(data) {
        const textField = new UITextField(data.placeholder || '');
        textField.text = data.text || '';
        textField.fontSize = data.fontSize || 14;
        textField.textAlignment = data.textAlignment || 'left';
        textField.isSecureTextEntry = data.isSecureTextEntry || false;
        textField.keyboardType = data.keyboardType || 'default';
        return textField;
    }

    static textPattern(text, pattern) {
        return Switch(pattern)
            .case('email', () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text))
            .case('url', () => /^https?:\/\/.+/.test(text))
            .case('phone', () => /^[\d\s\-\+\(\)]+$/.test(text))
            .case('number', () => !isNaN(parseFloat(text)) && isFinite(text))
            .case('integer', () => /^\-?\d+$/.test(text))
            .case('alphanumeric', () => /^[a-zA-Z0-9]+$/.test(text))
            .case('alpha', () => /^[a-zA-Z]+$/.test(text))
            .case('empty', () => text.length === 0)
            .case('whitespace', () => /^\s+$/.test(text))
            .case('lowercase', () => text === text.toLowerCase())
            .case('uppercase', () => text === text.toUpperCase())
            .case(Switch.let('prefix'), (m) => text.startsWith(m.prefix))
            .case(Switch.let('suffix'), (m) => text.endsWith(m.suffix))
            .case(Switch.let('contains'), (m) => text.includes(m.contains))
            .case(Switch.let('regex'), (m) => new RegExp(m.regex).test(text))
            .default(() => false)
            .evaluate();
    }

    matchText(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this.text);
        }
        return UITextField.textPattern(this.text, predicate);
    }

    validate(validation) {
        if (typeof validation === 'string') {
            return UITextField.textPattern(this.text, validation);
        }
        if (typeof validation === 'function') {
            return validation(this.text);
        }
        return false;
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

export default UITextField;