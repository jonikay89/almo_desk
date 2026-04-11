import UIView from './UIView.js';
import UIColor from './UIColor.js';

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
}

export default UILabel;