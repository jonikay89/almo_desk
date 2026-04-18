import UIView from './UIView.js';

class UITableViewCell extends UIView {
    constructor(style = 'default') {
        super();
        this._style = style;
        this._text = '';
        this._detailText = '';
        this._image = null;
        this._accessoryType = 'none';
    }

    get text() { return this._text; }
    set text(value) { this._text = value; this._updateDisplay(); }

    get detailText() { return this._detailText; }
    set detailText(value) { this._detailText = value; }

    get image() { return this._image; }
    set image(value) { this._image = value; }

    _updateDisplay() {
        if (this._element) {
            this._element.textContent = this._text;
        }
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('div');
            this._element.style.cssText = 'padding:12px;border-bottom:1px solid #eee;display:flex;align-items:center;';
        }
        return this._element;
    }
}

export default UITableViewCell;
