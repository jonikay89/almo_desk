import UIView from './UIView.js';

class UIStackView extends UIView {
    constructor(axis = 'horizontal') {
        super();
        this._axis = axis;
        this._spacing = 8;
        this._alignment = 'top';
        this._distribution = 'fill';
    }

    get axis() { return this._axis; }
    set axis(value) { this._axis = value; this._updateLayout(); }

    get spacing() { return this._spacing; }
    set spacing(value) { this._spacing = value; this._updateLayout(); }

    get alignment() { return this._alignment; }
    set alignment(value) { this._alignment = value; }

    get distribution() { return this._distribution; }
    set distribution(value) { this._distribution = value; }

    _updateLayout() {
        if (typeof document !== 'undefined' && this._element) {
            this._element.style.display = 'flex';
            this._element.style.flexDirection = this._axis === 'vertical' ? 'column' : 'row';
            this._element.style.gap = `${this._spacing}px`;
            this._element.style.alignItems = this._alignment === 'top' ? 'flex-start' : this._alignment === 'bottom' ? 'flex-end' : 'center';
        }
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('div');
            this._element.style.position = 'absolute';
            this._element.style.boxSizing = 'border-box';
            this._updateLayout();
        }
        return this._element;
    }
}

export default UIStackView;
