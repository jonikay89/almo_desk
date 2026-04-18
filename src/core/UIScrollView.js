import UIView from './UIView.js';

class UIScrollView extends UIView {
    constructor() {
        super();
        this._contentSize = { width: 0, height: 0 };
        this._contentOffset = { x: 0, y: 0 };
        this._showsHorizontalScrollIndicator = true;
        this._showsVerticalScrollIndicator = true;
        this._bounces = true;
    }

    get contentSize() { return this._contentSize; }
    set contentSize(value) { this._contentSize = value; }

    get contentOffset() { return this._contentOffset; }
    set contentOffset(value) {
        this._contentOffset = value;
        if (this._element && this._contentElement) {
            this._contentElement.style.transform = `translate(${-value.x}px, ${-value.y}px)`;
        }
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('div');
            this._element.style.overflow = 'auto';
            this._element.style.position = 'absolute';
            this._element.style.boxSizing = 'border-box';

            this._contentElement = document.createElement('div');
            this._contentElement.style.position = 'absolute';
            this._contentElement.style.minWidth = '100%';
            this._contentElement.style.minHeight = '100%';
            this._element.appendChild(this._contentElement);
        }
        return this._element;
    }

    addSubview(view) {
        if (view._element) {
            this._contentElement.appendChild(view._element);
        }
        super.addSubview(view);
    }
}

export default UIScrollView;
