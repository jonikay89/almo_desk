import UIView from './UIView.js';
import UIColor from './UIColor.js';
import { Data, kp, getProperty, updateProperty } from './Foundation.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch, ifLet, guardLet } from './PatternMatching.js';

class UIImage extends UIView {
    constructor() {
        super();
        this._size = { width: 0, height: 0 };
        this._capInsets = { top: 0, left: 0, bottom: 0, right: 0 };
        this._alignmentRectInsets = { top: 0, left: 0, bottom: 0, right: 0 };
        this._isSymbolImage = false;
        this._imageUrl = '';
        this._scale = 1.0;
        this._orientation = 'up';
        this._renderMode = 'automatic';
        this._flipsForRightToLeft = false;
        this._aspectRatio = 1.0;
        this._isAnimated = false;
        this._isTemplate = false;
    }

    static named(name) {
        const image = new UIImage();
        image._imageUrl = name;
        image._isTemplate = name.includes('system') || false;
        return image;
    }

    static systemName(name) {
        const image = new UIImage();
        image._imageUrl = `system://${name}`;
        image._isSymbolImage = true;
        image._isTemplate = true;
        return image;
    }

    static from(url) {
        const image = new UIImage();
        image._imageUrl = url;
        return image;
    }

    static fromData(data) {
        const image = new UIImage();
        if (data instanceof Data) {
            image._imageData = data;
        }
        return image;
    }

    static empty() {
        return new UIImage();
    }

    static capInsets(image, insets) {
        const newImage = new UIImage();
        newImage._imageUrl = image._imageUrl;
        newImage._capInsets = { ...insets };
        return newImage;
    }

    static renderMode(image, mode) {
        const newImage = new UIImage();
        newImage._imageUrl = image._imageUrl;
        newImage._renderMode = mode;
        return newImage;
    }

    get description() {
        return `UIImage(url: "${this._imageUrl || 'none'}")`;
    }

    get size() {
        return this._size;
    }

    get width() {
        return this._size.width;
    }

    get height() {
        return this._size.height;
    }

    get scale() {
        return this._scale;
    }

    get orientation() {
        return this._orientation;
    }

    get capInsets() {
        return this._capInsets;
    }

    get alignmentRectInsets() {
        return this._alignmentRectInsets;
    }

    get imageUrl() {
        return this._imageUrl;
    }

    get imageData() {
        return this._imageData;
    }

    get isSymbolImage() {
        return this._isSymbolImage;
    }

    get isTemplate() {
        return this._isTemplate || this._renderMode === 'template';
    }

    get renderMode() {
        return this._renderMode;
    }

    get aspectRatio() {
        return this._aspectRatio;
    }

    get isAnimated() {
        return this._isAnimated;
    }

    get flipsForRightToLeft() {
        return this._flipsForRightToLeft;
    }

    set flipsForRightToLeft(value) {
        this._flipsForRightToLeft = value;
    }

    imageDataValue() {
        return this._imageData;
    }

    dataValue() {
        return this._imageData;
    }

    withRenderingMode(mode) {
        const newImage = new UIImage();
        newImage._imageUrl = this._imageUrl;
        newImage._renderMode = mode;
        newImage._isTemplate = mode === 'template';
        return newImage;
    }

    withAlignmentRectInsets(insets) {
        const newImage = new UIImage();
        newImage._imageUrl = this._imageUrl;
        newImage._alignmentRectInsets = { ...insets };
        return newImage;
    }

    withCapInsets(insets) {
        const newImage = new UIImage();
        newImage._imageUrl = this._imageUrl;
        newImage._capInsets = { ...insets };
        return newImage;
    }

    imageFlippedForRightToLeftLayoutDirection() {
        const newImage = new UIImage();
        newImage._imageUrl = this._imageUrl;
        newImage._flipsForRightToLeft = !this._flipsForRightToLeft;
        return newImage;
    }

    withHorizontallyFlippedOrientation() {
        const newImage = new UIImage();
        newImage._imageUrl = this._imageUrl;
        newImage._orientation = this._orientation === 'up' ? 'upMirrored' : 'up';
        return newImage;
    }

    withVerticallyFlippedOrientation() {
        const newImage = new UIImage();
        newImage._imageUrl = this._imageUrl;
        newImage._orientation = this._orientation === 'up' ? 'downMirrored' : 'up';
        return newImage;
    }

    init() {
        this.element = document.createElement('div');
        this.element.className = 'ui-image';
        this.element.style.overflow = 'hidden';
        this.element.style.backgroundColor = 'transparent';
        
        this.imageElement = document.createElement('img');
        this.imageElement.style.width = '100%';
        this.imageElement.style.height = '100%';
        this.imageElement.style.objectFit = 'contain';
        this.imageElement.style.display = 'block';
        
        this.element.appendChild(this.imageElement);
        
        if (this._imageUrl) {
            this.imageElement.src = this._imageUrl;
            this.#updateSize();
        }
        
        if (this._renderMode === 'template') {
            this.imageElement.style.filter = 'grayscale(100%)';
        }
        
        return this;
    }

    deinit() {
        this.imageElement = null;
        this._imageData = null;
        this.element = null;
    }

    setImage(url) {
        this._imageUrl = url;
        if (this.imageElement) {
            this.imageElement.src = url;
            this.#updateSize();
        }
        this.#loadImageData(url);
        return this;
    }

    setImageData(data) {
        if (data instanceof Data) {
            this._imageData = data;
        } else if (data instanceof Uint8Array) {
            this._imageData = Data.fromArray(data);
        } else if (typeof data === 'string') {
            this._imageData = Data.fromString(data);
        }
        return this;
    }

    setRenderingMode(mode) {
        this._renderMode = mode;
        this._isTemplate = mode === 'template';
        if (this.imageElement) {
            if (mode === 'template') {
                this.imageElement.style.filter = 'grayscale(100%)';
            } else {
                this.imageElement.style.filter = 'none';
            }
        }
        return this;
    }

    setCapInsets(insets) {
        this._capInsets = { ...insets };
        return this;
    }

    setAlignmentRectInsets(insets) {
        this._alignmentRectInsets = { ...insets };
        return this;
    }

    setOrientation(orientation) {
        this._orientation = orientation;
        return this;
    }

    setFlipsForRightToLeft(value) {
        this._flipsForRightToLeft = value;
        return this;
    }

    setAspectRatio(ratio) {
        this._aspectRatio = ratio;
        if (this.element) {
            const height = this.element.style.width ? parseFloat(this.element.style.width) / ratio : 100;
            this.element.style.height = `${height}px`;
        }
        return this;
    }

    #updateSize() {
        if (this.imageElement && this.imageElement.naturalWidth) {
            this._size = {
                width: this.imageElement.naturalWidth / this._scale,
                height: this.imageElement.naturalHeight / this._scale
            };
            this._aspectRatio = this._size.width / this._size.height;
        }
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
            imageUrl: this._imageUrl,
            scale: this._scale,
            orientation: this._orientation,
            renderMode: this._renderMode,
            capInsets: this._capInsets,
            alignmentRectInsets: this._alignmentRectInsets,
            isSymbolImage: this._isSymbolImage,
            flipsForRightToLeft: this._flipsForRightToLeft
        };
    }

    static decode(data) {
        const image = new UIImage();
        image._imageUrl = data.imageUrl || '';
        image._scale = data.scale || 1.0;
        image._orientation = data.orientation || 'up';
        image._renderMode = data.renderMode || 'automatic';
        image._capInsets = data.capInsets || { top: 0, left: 0, bottom: 0, right: 0 };
        image._alignmentRectInsets = data.alignmentRectInsets || { top: 0, left: 0, bottom: 0, right: 0 };
        image._isSymbolImage = data.isSymbolImage || false;
        image._flipsForRightToLeft = data.flipsForRightToLeft || false;
        return image;
    }

    matchImage(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        return Switch(predicate)
            .case('empty', () => !this._imageUrl || this._imageUrl.length === 0)
            .case('loaded', () => !!this._imageUrl && !!this.imageElement?.src)
            .case('hasData', () => !!this._imageData)
            .case('symbol', () => this._isSymbolImage)
            .case('template', () => this.isTemplate)
            .case('animated', () => this._isAnimated)
            .case('upOrientation', () => this._orientation === 'up')
            .case({ orientation: Switch.let('o') }, (m) => this._orientation === m.o)
            .case({ renderMode: Switch.let('m') }, (m) => this._renderMode === m.m)
            .case({ scale: Switch.let('s') }, (m) => this._scale === m.s)
            .case({ size: Switch.let('w'), height: Switch.let('h') }, (m) => 
                this._size.width === m.w && this._size.height === m.h)
            .case({ width: Switch.let('w') }, (m) => this._size.width === m.w)
            .case({ height: Switch.let('h') }, (m) => this._size.height === m.h)
            .case({ aspectRatio: Switch.let('r') }, (m) => Math.abs(this._aspectRatio - m.r) < 0.001)
            .case({ url: Switch.let('url') }, (m) => this._imageUrl === m.url)
            .case({ urlContains: Switch.let('str') }, (m) => this._imageUrl?.includes(m.str))
            .case({ extension: Switch.let('ext') }, (m) => {
                const ext = this._imageUrl?.split('.').pop()?.toLowerCase();
                return ext === m.ext?.toLowerCase();
            })
            .case({ type: 'png' }, () => this._imageUrl?.endsWith('.png'))
            .case({ type: 'jpg' }, () => this._imageUrl?.endsWith('.jpg') || this._imageUrl?.endsWith('.jpeg'))
            .case({ type: 'gif' }, () => this._imageUrl?.endsWith('.gif'))
            .case({ type: 'svg' }, () => this._imageUrl?.endsWith('.svg'))
            .case({ type: 'webp' }, () => this._imageUrl?.endsWith('.webp'))
            .default(() => false)
            .evaluate();
    }

    ifCase(pattern, handler) {
        return ifCase(pattern)(this).then(handler);
    }

    guardCase(pattern) {
        return guardCase(pattern)(this);
    }

    static forCase(collection, pattern, handler) {
        for (const item of collection) {
            const result = forCase(pattern)(item);
            if (result !== undefined) {
                handler(result);
            }
        }
    }

    static whileCase(iterator, pattern) {
        return whileCase(pattern)(iterator);
    }

    matchOperator(pattern) {
        return patternMatch(pattern, this);
    }

    ifLet(pattern) {
        return ifLet(this, pattern);
    }

    guardLet(pattern) {
        return guardLet(this, pattern);
    }

    switch() {
        return Switch(this);
    }
}

export default UIImage;
