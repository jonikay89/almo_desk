import UIView from './UIView.js';
import UIColor from './UIColor.js';
import { kp, getProperty, updateProperty } from './Foundation.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';

class UILabel extends UIView {
    constructor(text = '') {
        super();
        this.text = text;
        this._textColor = UIColor.black();
        this.fontSize = 14;
        this.fontFamily = 'system-ui, sans-serif';
        this.textAlignment = 'left';
        this.numberOfLines = 1;
        this.lineBreakMode = 'ellipsis';
        this.adjustsFontSizeToFitWidth = false;
        this.minimumScaleFactor = 0.5;
        this.fontWeight = 'normal';
        this.isEnabled = true;
        this._shadowColor = null;
        this._shadowOffset = { width: 0, height: 0 };
    }

    get description() {
        return `UILabel(text: "${this.text}")`;
    }

    get textColor() {
        return this._textColor;
    }

    set textColor(color) {
        if (color instanceof UIColor) {
            this._textColor = color;
        } else if (typeof color === 'string') {
            this._textColor = UIColor.colorWithHex(color);
        } else {
            this._textColor = UIColor.black();
        }
        this.#updateStyle();
    }

    get color() {
        return this._textColor;
    }

    set color(c) {
        this.textColor = c;
    }

    get font() {
        return { size: this.fontSize, family: this.fontFamily, weight: this.fontWeight };
    }

    set font(f) {
        if (typeof f === 'object') {
            if (f.size) this.fontSize = f.size;
            if (f.family) this.fontFamily = f.family;
            if (f.weight) this.fontWeight = f.weight;
        }
        this.#updateStyle();
    }

    get fontSize() {
        return this._fontSize || 14;
    }

    set fontSize(size) {
        this._fontSize = size;
        this.#updateStyle();
    }

    get textAlignment() {
        return this._textAlignment;
    }

    set textAlignment(alignment) {
        this._textAlignment = alignment;
        this.#updateStyle();
    }

    get lineHeight() {
        return this._lineHeight || this.fontSize * 1.4;
    }

    set lineHeight(height) {
        this._lineHeight = height;
        this.#updateStyle();
    }

    init() {
        this.element = document.createElement('span');
        this.element.className = 'ui-label';
        this.element.style.display = 'inline-block';
        this.element.style.whiteSpace = 'pre-wrap';
        this.#updateText();
        this.#updateStyle();
        return this;
    }

    deinit() {
        this.text = '';
        this.element = null;
    }

    #updateText() {
        if (this.element) {
            this.element.textContent = this.text;
        }
    }

    #updateStyle() {
        if (this.element) {
            this.element.style.color = this._textColor ? this._textColor.css : '#000';
            this.element.style.fontSize = `${this.fontSize}px`;
            this.element.style.fontFamily = this.fontFamily;
            this.element.style.textAlign = this.textAlignment;
            this.element.style.fontWeight = this.fontWeight;
            this.element.style.overflow = 'hidden';
            this.element.style.textOverflow = this.lineBreakMode === 'ellipsis' ? 'ellipsis' : 'clip';
            this.element.style.opacity = this.isEnabled ? '1' : '0.5';
            this.element.style.lineHeight = `${this.lineHeight}px`;
            
            if (this.numberOfLines === 1) {
                this.element.style.whiteSpace = 'nowrap';
            } else {
                this.element.style.display = '-webkit-box';
                this.element.style.WebkitLineClamp = this.numberOfLines;
                this.element.style.WebkitBoxOrient = 'vertical';
            }

            if (this.adjustsFontSizeToFitWidth) {
                this.element.style.wordBreak = 'break-all';
            }
        }
    }

    setText(text) {
        this.text = text;
        this.#updateText();
    }

    setTextColor(color) {
        this.textColor = color;
    }

    setFontSize(size) {
        this.fontSize = size;
    }

    setFontFamily(family) {
        this.fontFamily = family;
        this.#updateStyle();
    }

    setFontWeight(weight) {
        this.fontWeight = weight;
        this.#updateStyle();
    }

    setTextAlignment(alignment) {
        this.textAlignment = alignment;
    }

    setNumberOfLines(lines) {
        this.numberOfLines = lines;
        this.#updateStyle();
    }

    setLineBreakMode(mode) {
        this.lineBreakMode = mode;
        this.#updateStyle();
    }

    setEnabled(enabled) {
        this.isEnabled = enabled;
        this.#updateStyle();
    }

    sizeToFit() {
        if (this.element) {
            this.element.style.width = 'auto';
            this.element.style.height = 'auto';
            const rect = this.element.getBoundingClientRect();
            this.setFrame(this.frame.x, this.frame.y, rect.width, rect.height);
        }
    }

    layoutSubviews() {
        super.layoutSubviews();
    }

    encode() {
        return {
            text: this.text,
            fontSize: this.fontSize,
            fontFamily: this.fontFamily,
            fontWeight: this.fontWeight,
            textAlignment: this.textAlignment,
            numberOfLines: this.numberOfLines,
            isEnabled: this.isEnabled
        };
    }

    static decode(data) {
        const label = new UILabel(data.text || '');
        label.fontSize = data.fontSize || 14;
        label.fontFamily = data.fontFamily || 'system-ui, sans-serif';
        label.fontWeight = data.fontWeight || 'normal';
        label.textAlignment = data.textAlignment || 'left';
        label.numberOfLines = data.numberOfLines || 1;
        label.isEnabled = data.isEnabled !== false;
        return label;
    }

    matchText(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this.text);
        }
        return Switch(predicate)
            .case('empty', () => this.text.length === 0)
            .case('nonEmpty', () => this.text.length > 0)
            .case(Switch.let('value'), (m) => this.text === m.value)
            .case(Switch.let('prefix'), (m) => this.text.startsWith(m.prefix))
            .case(Switch.let('suffix'), (m) => this.text.endsWith(m.suffix))
            .case(Switch.let('contains'), (m) => this.text.includes(m.contains))
            .default(() => false)
            .evaluate();
    }

    matchStyle(predicate) {
        if (typeof predicate === 'function') {
            return predicate({
                fontSize: this.fontSize,
                fontWeight: this.fontWeight,
                textAlignment: this.textAlignment,
                numberOfLines: this.numberOfLines,
                isEnabled: this.isEnabled
            });
        }
        return Switch(predicate)
            .case({ bold: true }, () => this.fontWeight === 'bold' || this.fontWeight === '700')
            .case({ light: true }, () => this.fontWeight === 'light' || this.fontWeight === '300')
            .case({ centered: true }, () => this.textAlignment === 'center')
            .case({ left: true }, () => this.textAlignment === 'left')
            .case({ right: true }, () => this.textAlignment === 'right')
            .case({ multiline: true }, () => this.numberOfLines > 1)
            .case({ singleLine: true }, () => this.numberOfLines === 1)
            .case({ disabled: true }, () => !this.isEnabled)
            .case({ enabled: true }, () => this.isEnabled)
            .case({ fontSize: Switch.let('size') }, (m) => this.fontSize === m.size)
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

export default UILabel;