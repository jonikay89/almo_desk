import UIScrollView from './UIScrollView.js';
import UIColor from './UIColor.js';
import { Scanner, NSNumber } from './Foundation.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';

class UITextView extends UIScrollView {
    constructor(text = '') {
        super();
        this.text = text;
        this._textColor = UIColor.black();
        this.fontSize = 14;
        this.fontFamily = 'system-ui, sans-serif';
        this.textAlignment = 'left';
        this.isEditable = true;
        this.isScrollEnabled = true;
        this.delegate = null;
        this.autocapitalizationType = 'sentences';
        this.autocorrectionType = 'default';
        this.spellCheckingType = 'default';
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
    }

    setTextColor(color) {
        this.textColor = color;
    }

    setFontSize(size) {
        this.fontSize = size;
        this.#updateStyle();
    }

    setFontFamily(family) {
        this.fontFamily = family;
        this.#updateStyle();
    }

    setTextAlignment(alignment) {
        this.textAlignment = alignment;
        this.#updateStyle();
    }

    setEditable(editable) {
        this.isEditable = editable;
        if (this.textElement) {
            this.textElement.readOnly = !editable;
            this.textElement.style.cursor = editable ? 'text' : 'default';
        }
    }

    setScrollEnabled(enabled) {
        this.isScrollEnabled = enabled;
        if (this.textElement) {
            this.textElement.style.overflow = enabled ? 'auto' : 'hidden';
        }
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