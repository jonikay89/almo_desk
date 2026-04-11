import UIView from './UIView.js';
import UIColor from './UIColor.js';

class UIImage extends UIView {
    constructor(imageUrl = '') {
        super();
        this.imageUrl = imageUrl;
        this.contentMode = 'fill';
        this._backgroundColor = UIColor.colorWithHex('#e0e0e0');
        this.interactive = false;
    }

    get backgroundColor() {
        return this._backgroundColor;
    }

    set backgroundColor(color) {
        if (color instanceof UIColor) {
            this._backgroundColor = color;
        } else if (typeof color === 'string') {
            this._backgroundColor = UIColor.colorWithHex(color);
        } else {
            this._backgroundColor = UIColor.clear();
        }
        if (this.element) {
            this.element.style.backgroundColor = this._backgroundColor.css;
        }
    }

    init() {
        this.element = document.createElement('div');
        this.element.className = 'ui-image';
        this.element.style.overflow = 'hidden';
        this.element.style.backgroundColor = this._backgroundColor.css;
        
        this.imageElement = document.createElement('img');
        this.imageElement.style.width = '100%';
        this.imageElement.style.height = '100%';
        this.imageElement.style.objectFit = this.contentMode;
        this.imageElement.style.display = 'block';
        
        this.element.appendChild(this.imageElement);
        
        if (this.imageUrl) {
            this.imageElement.src = this.imageUrl;
        }
        
        return this;
    }

    deinit() {
        this.imageElement = null;
        this.element = null;
    }

    setImage(url) {
        this.imageUrl = url;
        if (this.imageElement) {
            this.imageElement.src = url;
        }
    }

    setContentMode(mode) {
        this.contentMode = mode;
        if (this.imageElement) {
            this.imageElement.style.objectFit = mode;
        }
    }

    setBackgroundColor(color) {
        this.backgroundColor = color;
    }

    layoutSubviews() {
        super.layoutSubviews();
        if (this.element) {
            this.element.style.width = `${this.frame.width}px`;
            this.element.style.height = `${this.frame.height}px`;
        }
    }
}

export default UIImage;
