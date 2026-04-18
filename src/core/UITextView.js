import UIView from './UIView.js';
import UIColor from './UIColor.js';

class UITextView extends UIView {
    constructor(text = '') {
        super();
        this._text = text;
        this._font = { size: 17, weight: 'normal' };
        this._textColor = UIColor.black();
        this._isEditable = true;
        this._isScrollEnabled = true;
        this._textAlignment = 'left';
        this._isAccessibilityElement = true;
        this._accessibilityTraits = 0x80;
    }

    get text() { return this._text; }
    set text(value) { this._text = value; this._updateDisplay(); }

    get font() { return this._font; }
    set font(value) { this._font = value; this._updateDisplay(); }

    get textColor() { return this._textColor; }
    set textColor(value) { this._textColor = value; this._updateDisplay(); }

    get isEditable() { return this._isEditable; }
    set isEditable(value) { this._isEditable = value; this._updateDisplay(); }

    get isScrollEnabled() { return this._isScrollEnabled; }
    set isScrollEnabled(value) { this._isScrollEnabled = value; }

    get textAlignment() { return this._textAlignment; }
    set textAlignment(value) { this._textAlignment = value; this._updateDisplay(); }

    _updateDisplay() {
        if (typeof document !== 'undefined' && this._element) {
            this._element.value = this._text;
            this._element.style.fontSize = `${this._font.size}px`;
            this._element.style.fontWeight = this._font.weight;
            this._element.style.color = this._textColor ? this._textColor.toRGBAString() : 'black';
            this._element.readOnly = !this._isEditable;
            this._element.style.resize = 'none';
        }
        this.accessibilityLabel = 'Text view';
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('textarea');
            this._element.style.position = 'absolute';
            this._element.style.outline = 'none';
            this._element.style.boxSizing = 'border-box';
            this._element.style.overflow = 'auto';
            this._updateDisplay();

            this._element.addEventListener('input', (e) => {
                this._text = e.target.value;
            });
        }
        return this._element;
    }
}

export default UITextView;