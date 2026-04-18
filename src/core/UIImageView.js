import UIView from './UIView.js';

class UIImageView extends UIView {
    constructor(image = null) {
        super();
        this._image = image;
        this._contentMode = 'scaleToFill';
    }

    get image() { return this._image; }
    set image(value) { this._image = value; this._updateDisplay(); }

    get contentMode() { return this._contentMode; }
    set contentMode(value) { this._contentMode = value; }

    _updateDisplay() {
        if (typeof document !== 'undefined' && this._element && this._image) {
            if (this._image._image) {
                this._element.src = this._image._image.src;
            } else if (this._image._src) {
                this._element.src = this._image._src;
            }
        }
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('img');
            this._element.style.position = 'absolute';
            this._element.style.objectFit = this._contentMode === 'scaleToFill' ? 'fill' : 'contain';
            this._updateDisplay();
        }
        return this._element;
    }
}

export default UIImageView;
