import UIScrollView from './UIScrollView.js';
import UIColor from './UIColor.js';
import { Scanner, NSNumber, kp, getProperty, updateProperty } from './Foundation.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';
import { defineTypeAlias } from './Protocol.js';
import { TextViewDelegate } from './TypeAliases.js';
import { TextStorage, AttributedString } from './TextStorage.js';
import { CALayer, CAShapeLayer, CGPath } from './CALayer.js';

defineTypeAlias('TextViewDelegateAlias', TextViewDelegate);

class UITextView extends UIScrollView {
    constructor(text = '') {
        super();
        this._textColor = UIColor.black();
        this._textStorage = TextStorage.Create();
        this._textStorage.string = text;
        this._textStorage.defaultAttributes = {
            font: { size: 14, family: 'system-ui', weight: 'normal' },
            textColor: UIColor.black(),
            backgroundColor: null
        };
        this.fontSize = 14;
        this.fontFamily = 'system-ui, sans-serif';
        this.textAlignment = 'left';
        this.isEditable = true;
        this.isScrollEnabled = true;
        this.delegate = null;
        this.autocapitalizationType = 'sentences';
        this.autocorrectionType = 'default';
        this.spellCheckingType = 'default';
        this._borderLayer = null;
        this._selectionLayer = null;
        this._linkTextAttributes = {
            textColor: UIColor.systemBlue(),
            underline: true
        };
        this._text = text || '';
        
        this._isAccessibilityElement = true;
        this._accessibilityTraits = ['textField', 'adjustable'];
    }

    get description() {
        return `UITextView(text: "${this.text.substring(0, 20)}${this.text.length > 20 ? '...' : ''}")`;
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
        this.element = document.createElement('div');
        this.element.className = 'ui-textview';
        this.element.style.position = 'relative';
        this.element.style.overflow = 'hidden';

        this.textElement = document.createElement('textarea');
        this.textElement.style.position = 'absolute';
        this.textElement.style.top = '0';
        this.textElement.style.left = '0';
        this.textElement.style.right = '0';
        this.textElement.style.bottom = '0';
        this.textElement.style.width = '100%';
        this.textElement.style.height = '100%';
        this.textElement.style.border = '1px solid #ccc';
        this.textElement.style.borderRadius = '6px';
        this.textElement.style.padding = '8px 12px';
        this.textElement.style.fontSize = `${this.fontSize}px`;
        this.textElement.style.fontFamily = this.fontFamily;
        this.textElement.style.color = this._textColor.css;
        this.textElement.style.backgroundColor = 'transparent';
        this.textElement.style.resize = 'none';
        this.textElement.style.outline = 'none';
        this.textElement.style.boxSizing = 'border-box';

        if (!this.isEditable) {
            this.textElement.readOnly = true;
            this.textElement.style.cursor = 'default';
        }

        if (!this.isScrollEnabled) {
            this.textElement.style.overflow = 'hidden';
        }

        this.element.appendChild(this.textElement);

        this.contentElement = this.textElement;

        this.#updateStyle();
        this.#setupEventListeners();

        return this;
    }

    #setupEventListeners() {
        this.textElement.addEventListener('focus', () => {
            if (this.delegate && typeof this.delegate.textViewDidBeginEditing === 'function') {
                this.delegate.textViewDidBeginEditing(this);
            }
        });

        this.textElement.addEventListener('blur', () => {
            if (this.delegate && typeof this.delegate.textViewDidEndEditing === 'function') {
                this.delegate.textViewDidEndEditing(this);
            }
        });

        this.textElement.addEventListener('input', () => {
            this.text = this.textElement.value;
            if (this.delegate && typeof this.delegate.textViewDidChange === 'function') {
                this.delegate.textViewDidChange(this);
            }
        });
    }

    #updateStyle() {
        if (this.textElement) {
            this.textElement.style.color = this._textColor.css;
            this.textElement.style.textAlign = this.textAlignment;
            this.textElement.style.fontSize = `${this.fontSize}px`;
            this.textElement.style.fontFamily = this.fontFamily;
        }
    }

    setText(text) {
        this.text = text;
        if (this.textElement) {
            this.textElement.value = text;
        }
        return this;
    }

    setTextColor(color) {
        this.textColor = color;
        return this;
    }

    setFontSize(size) {
        this.fontSize = size;
        this.#updateStyle();
        return this;
    }

    setFontFamily(family) {
        this.fontFamily = family;
        this.#updateStyle();
        return this;
    }

    setTextAlignment(alignment) {
        this.textAlignment = alignment;
        this.#updateStyle();
        return this;
    }

    setEditable(editable) {
        this.isEditable = editable;
        if (this.textElement) {
            this.textElement.readOnly = !editable;
            this.textElement.style.cursor = editable ? 'text' : 'default';
        }
        return this;
    }

    setScrollEnabled(enabled) {
        this.isScrollEnabled = enabled;
        if (this.textElement) {
            this.textElement.style.overflow = enabled ? 'auto' : 'hidden';
        }
        return this;
    }

    withText(text) {
        return this.setText(text);
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

    withEditable(editable) {
        return this.setEditable(editable);
    }

    withScrollEnabled(enabled) {
        return this.setScrollEnabled(enabled);
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

    setLinkTextAttributes(attributes) {
        this._linkTextAttributes = { ...this._linkTextAttributes, ...attributes };
        return this;
    }

    get text() {
        return this._text;
    }

    set text(value) {
        this._text = value || '';
        this._textStorage.string = this._text;
    }

    #updateBorderLayer() {
        if (!this._borderLayer && this.element) {
            this._borderLayer = CAShapeLayer.layer();
            this._borderLayer.name = 'borderLayer';
        }
        
        if (this._borderLayer) {
            const path = CGPath.CreateRoundedRect(0, 0, this._bounds.width, this._bounds.height, 6);
            this._borderLayer.path = path;
            this._borderLayer.fillColor = null;
            this._borderLayer.strokeColor = UIColor.lightGray();
            this._borderLayer.lineWidth = 1;
            
            if (!this._layer._sublayers.includes(this._borderLayer)) {
                this._layer.addSublayer(this._borderLayer);
            }
        }
    }

    setBorderColor(color) {
        this._borderColor = color instanceof UIColor ? color : UIColor.colorWithHex(color);
        if (this._borderLayer) {
            this._borderLayer.strokeColor = this._borderColor;
        }
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

    becomeFirstResponder() {
        if (this.textElement) {
            this.textElement.focus();
            return true;
        }
        return false;
    }

    resignFirstResponder() {
        if (this.textElement) {
            this.textElement.blur();
            return true;
        }
        return false;
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
            text: this.text,
            fontSize: this.fontSize,
            fontFamily: this.fontFamily,
            textAlignment: this.textAlignment,
            isEditable: this.isEditable,
            isScrollEnabled: this.isScrollEnabled
        };
    }

    static decode(data) {
        const textView = new UITextView(data.text || '');
        textView.fontSize = data.fontSize || 14;
        textView.fontFamily = data.fontFamily || 'system-ui, sans-serif';
        textView.textAlignment = data.textAlignment || 'left';
        textView.isEditable = data.isEditable !== false;
        textView.isScrollEnabled = data.isScrollEnabled !== false;
        return textView;
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
            .case('contains', () => text.length > 0)
            .case(Switch.let('prefix'), (m) => text.startsWith(m.prefix))
            .case(Switch.let('suffix'), (m) => text.endsWith(m.suffix))
            .case(Switch.let('containsStr'), (m) => text.includes(m.containsStr))
            .case(Switch.let('regex'), (m) => new RegExp(m.regex).test(text))
            .case(Switch.let('length'), (m) => text.length === m.length)
            .case(Switch.tuple(Switch.let('min'), Switch.let('max')), (m) => text.length >= m.min && text.length <= m.max)
            .default(() => false)
            .evaluate();
    }

    matchText(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this.text);
        }
        return UITextView.textPattern(this.text, predicate);
    }

    validate(validation) {
        if (typeof validation === 'string') {
            return UITextView.textPattern(this.text, validation);
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

export default UITextView;