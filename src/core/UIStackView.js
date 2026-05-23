import UIView from './UIView.js';

class UIStackView extends UIView {
    constructor(axis = 'horizontal') {
        super();
        this._axis = axis;
        this._spacing = 8;
        this._alignment = 'fill';
        this._distribution = 'fill';
        this.init();
    }

    get axis() { return this._axis; }
    set axis(value) { this._axis = value; this._updateLayout(); }

    get spacing() { return this._spacing; }
    set spacing(value) { this._spacing = value; this._updateLayout(); }

    get alignment() { return this._alignment; }
    set alignment(value) { this._alignment = value; this._updateLayout(); }

    get distribution() { return this._distribution; }
    set distribution(value) { this._distribution = value; this._updateLayout(); }

    _updateLayout() {
        if (typeof document !== 'undefined' && this._element) {
            this._element.style.display = 'flex';
            this._element.style.flexDirection = this._axis === 'vertical' ? 'column' : 'row';
            this._element.style.gap = `${this._spacing}px`;
            const alignMap = { 'fill': 'stretch', 'center': 'center', 'leading': 'flex-start', 'trailing': 'flex-end', 'top': 'flex-start', 'bottom': 'flex-end' };
            this._element.style.alignItems = alignMap[this._alignment] || this._alignment;
            if (this._distribution === 'center') {
                this._element.style.justifyContent = 'center';
            }
            this._element.style.boxSizing = 'border-box';
        }
    }

    addArrangedSubview(view) {
        if (!view) return;
        if (!view.element) view.init();
        if (view.element) {
            view.element.style.position = '';
            view.element.style.left = '';
            view.element.style.top = '';
            view.element.style.minHeight = '';
            view.element.style.overflowY = '';
            view.element.style.flexShrink = '0';
            if (this._alignment === 'fill') {
                if (this._axis === 'vertical') {
                    view.element.style.width = '';
                } else {
                    view.element.style.height = '';
                }
            }
            const chp = view._contentHuggingPriority;
            if (chp) {
                const isLow = this._axis === 'horizontal' ? chp.horizontal < 250 : chp.vertical < 250;
                if (isLow) view.element.style.flexGrow = '1';
            }
            this._element.appendChild(view.element);
            if (!this._subviews.includes(view)) {
                this.addSubview(view);
            }
        }
    }

    removeAllArrangedSubviews() {
        const views = [...this._subviews];
        for (const view of views) {
            if (view._element && view._element.parentElement === this._element) {
                this._element.removeChild(view._element);
            }
            this.removeSubview(view);
        }
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('div');
            this._updateLayout();
        }
        return this;
    }
}

export default UIStackView;
