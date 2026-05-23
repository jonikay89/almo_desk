import UIView from './UIView.js';

class UILabel extends UIView {
    constructor(text = '') {
        super();
        this._text = text;
        this._font = null;
        this._textColor = null;
        this._textAlignment = 'left';
        this._numberOfLines = 1;
        this._lineBreakMode = 'wordWrap';
        this._isAccessibilityElement = true;
        this._accessibilityTraits = 0x80;
        this.init();
    }

    get text() { return this._text; }
    set text(value) { this._text = value; this._updateDisplay(); }

    get font() { return this._font; }
    set font(value) { this._font = value; this._updateDisplay(); }

    get textColor() { return this._textColor; }
    set textColor(value) { this._textColor = value; this._updateDisplay(); }

    get textAlignment() { return this._textAlignment; }
    set textAlignment(value) { this._textAlignment = value; this._updateDisplay(); }

    get numberOfLines() { return this._numberOfLines; }
    set numberOfLines(value) { this._numberOfLines = value; this._updateDisplay(); }

    get lineBreakMode() { return this._lineBreakMode; }
    set lineBreakMode(value) { this._lineBreakMode = value; }

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
            this._element.textContent = this._text;
            this._applyFont();
            if (this._textColor && this._textColor.toRGBAString) {
                this._element.style.color = this._textColor.toRGBAString();
            } else if (!this._textColor) {
                this._element.style.color = 'black';
            }
            this._element.style.textAlign = this._textAlignment;
            if (this._numberOfLines === 0 || this._numberOfLines > 1) {
                this._element.style.display = 'block';
                this._element.style.whiteSpace = 'normal';
            } else {
                this._element.style.whiteSpace = 'nowrap';
            }
            this._element.style.overflow = 'hidden';
            this._element.style.textOverflow = 'ellipsis';
        }
        this.accessibilityLabel = this._text;
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('span');
            this._element.style.pointerEvents = 'none';
            this._updateDisplay();
        }
        return this;
    }
}

import UIColor from './UIColor.js';

export default UILabel;
