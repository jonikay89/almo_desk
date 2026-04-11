import UIView from './UIView.js';
import UIColor from './UIColor.js';
import { Data } from './Foundation.js';

class UIImage extends UIView {
    constructor(imageUrl = '') {
        super();
        this.imageUrl = imageUrl;
        this.contentMode = 'fill';
        this._backgroundColor = UIColor.colorWithHex('#e0e0e0');
        this.interactive = false;
        this._imageData = null;
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

    get description() {
        return `UIImage(url: "${this.imageUrl || 'none'}")`;
    }

    get imageData() {
        return this._imageData;
    }

    dataValue() {
        return this._imageData;
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
        this._imageData = null;
        this.element = null;
    }

    setImage(url) {
        this.imageUrl = url;
        if (this.imageElement) {
            this.imageElement.src = url;
        }
        this.#loadImageData(url);
    }

    setImageData(data) {
        if (data instanceof Data) {
            this._imageData = data;
        } else if (data instanceof Uint8Array) {
            this._imageData = Data.fromArray(data);
        } else if (typeof data === 'string') {
            this._imageData = Data.fromString(data);
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

    #loadImageData(url) {
        if (!url) return;
        
        if (url.startsWith('data:')) {
            const base64 = url.split(',')[1];
            if (base64) {
                this._imageData = Data.fromBase64EncodedString(base64);
            }
        }
    }

    layoutSubviews() {
        super.layoutSubviews();
        if (this.element) {
            this.element.style.width = `${this.frame.width}px`;
            this.element.style.height = `${this.frame.height}px`;
        }
    }

    encode() {
        return {
            imageUrl: this.imageUrl,
            contentMode: this.contentMode,
            backgroundColor: this._backgroundColor ? this._backgroundColor.hex : null
        };
    }

    static decode(data) {
        const image = new UIImage(data.imageUrl || '');
        image.contentMode = data.contentMode || 'fill';
        if (data.backgroundColor) {
            image.backgroundColor = UIColor.colorWithHex(data.backgroundColor);
        }
        return image;
    }
}

export default UIImage;