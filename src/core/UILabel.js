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
            this.element.style.color = this._textColor.css;
            this.element.style.fontSize = `${this.fontSize}px`;
            this.element.style.fontFamily = this.fontFamily;
            this.element.style.textAlign = this.textAlignment;
            this.element.style.fontWeight = this.fontWeight;
            this.element.style.overflow = 'hidden';
            this.element.style.textOverflow = this.lineBreakMode === 'ellipsis' ? 'ellipsis' : 'clip';
            this.element.style.opacity = this.isEnabled ? '1' : '0.5';
            
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
        this.#updateStyle();
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
        this.#updateStyle();
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
        if (this.element) {
            this.element.style.width = `${this.frame.width}px`;
            this.element.style.height = `${this.frame.height}px`;
        }
    }
}

export default UILabel;
