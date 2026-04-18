import UIView from './UIView.js';

class UILabel extends UIView {
    constructor(text = '') {
        super();
        this._text = text;
        this._font = { size: 17, weight: 'normal' };
        this._textColor = UIColor.black();
        this._textAlignment = 'left';
        this._numberOfLines = 1;
        this._lineBreakMode = 'wordWrap';
        this._isAccessibilityElement = true;
        this._accessibilityTraits = 0x80;
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
    set numberOfLines(value) { this._numberOfLines = value; }

    get lineBreakMode() { return this._lineBreakMode; }
    set lineBreakMode(value) { this._lineBreakMode = value; }

    _updateDisplay() {
        if (typeof document !== 'undefined' && this._element) {
            this._element.textContent = this._text;
            this._element.style.fontSize = `${this._font.size}px`;
            this._element.style.fontWeight = this._font.weight;
            this._element.style.color = this._textColor ? this._textColor.toRGBAString() : 'black';
            this._element.style.textAlign = this._textAlignment;
            this._element.style.whiteSpace = this._numberOfLines > 1 ? 'normal' : 'nowrap';
            this._element.style.overflow = 'hidden';
            this._element.style.textOverflow = 'ellipsis';
        }
        this.accessibilityLabel = this._text;
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('span');
            this._element.style.position = 'absolute';
            this._element.style.pointerEvents = 'none';
            this._updateDisplay();
        }
        return this._element;
    }
}

import UIColor from './UIColor.js';

export default UILabel;