import UIView from './UIView.js';
import UIColor from './UIColor.js';
import { kp, getProperty, updateProperty } from './Foundation.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';

class UIImageView extends UIView {
    constructor(image = null) {
        super();
        this._image = null;
        this._highlightedImage = null;
        this._imageUrl = '';
        this._highlightedImageUrl = '';
        this.contentMode = 'scaleAspectFit';
        this.userInteractionEnabled = false;
        this.multipleTouchEnabled = false;
        this._isHighlighted = false;
        this._renderedImage = null;
        this._animationImages = [];
        this._animationDuration = 0;
        this._animationTimer = null;
        this._animationIndex = 0;
        this._animationRepeatCount = 0;
        this._isAnimating = false;
    }

    get description() {
        return `UIImageView(image: ${this._imageUrl || 'none'}, highlighted: ${this._isHighlighted})`;
    }

    get image() {
        return this._isHighlighted ? (this._highlightedImage || this._image) : this._image;
    }

    set image(value) {
        this._image = value;
        if (value && value.imageUrl) {
            this._imageUrl = value.imageUrl;
        } else if (typeof value === 'string') {
            this._imageUrl = value;
        }
        this.#render();
    }

    get highlightedImage() {
        return this._highlightedImage;
    }

    set highlightedImage(value) {
        this._highlightedImage = value;
        if (value && value.imageUrl) {
            this._highlightedImageUrl = value.imageUrl;
        } else if (typeof value === 'string') {
            this._highlightedImageUrl = value;
        }
        if (this._isHighlighted) {
            this.#render();
        }
    }

    get isHighlighted() {
        return this._isHighlighted;
    }

    set isHighlighted(value) {
        this._isHighlighted = !!value;
        this.#render();
    }

    get imageUrl() {
        return this._imageUrl;
    }

    set imageUrl(value) {
        this._imageUrl = value;
        this.#render();
    }

    get contentMode() {
        return this._contentMode;
    }

    set contentMode(value) {
        this._contentMode = value;
        if (this._renderedImage && this._renderedImage.style) {
            this._renderedImage.style.objectFit = this._mapContentMode(value);
            this._renderedImage.style.objectPosition = this._mapContentAlignment(value);
        }
    }

    _mapContentMode(mode) {
        const modeMap = {
            'scaleToFill': 'fill',
            'scaleAspectFit': 'contain',
            'scaleAspectFill': 'cover',
            'center': 'none',
            'top': 'contain',
            'bottom': 'contain',
            'left': 'contain',
            'right': 'contain',
            'topLeft': 'contain',
            'topRight': 'contain',
            'bottomLeft': 'contain',
            'bottomRight': 'contain',
            'redraw': 'fill'
        };
        return modeMap[mode] || 'contain';
    }

    _mapContentAlignment(mode) {
        const alignmentMap = {
            'top': 'top',
            'bottom': 'bottom',
            'left': 'left',
            'right': 'right',
            'topLeft': 'top left',
            'topRight': 'top right',
            'bottomLeft': 'bottom left',
            'bottomRight': 'bottom right'
        };
        return alignmentMap[mode] || 'center';
    }

    init() {
        super.init();
        this.element = document.createElement('div');
        this.element.className = 'ui-imageview';
        this.element.style.overflow = 'hidden';
        this.element.style.position = 'relative';
        
        this._renderedImage = document.createElement('img');
        this._renderedImage.style.width = '100%';
        this._renderedImage.style.height = '100%';
        this._renderedImage.style.objectFit = this._mapContentMode(this._contentMode);
        this._renderedImage.style.display = 'block';
        
        this.element.appendChild(this._renderedImage);
        
        this.#render();
        
        return this;
    }

    #render() {
        if (!this._renderedImage) return;
        
        const currentUrl = this._isHighlighted ? this._highlightedImageUrl : this._imageUrl;
        
        if (currentUrl) {
            this._renderedImage.src = currentUrl;
            this._renderedImage.style.display = 'block';
        } else if (this._image && this._image.imageUrl) {
            this._renderedImage.src = this._image.imageUrl;
            this._renderedImage.style.display = 'block';
        } else {
            this._renderedImage.src = '';
            this._renderedImage.style.display = 'none';
        }
    }

    deinit() {
        if (this._animationTimer) {
            clearInterval(this._animationTimer);
            this._animationTimer = null;
        }
        this._isAnimating = false;
        this._renderedImage = null;
        this._image = null;
        this._highlightedImage = null;
        this._animationImages = [];
        super.deinit();
    }

    setImage(url) {
        this._imageUrl = url;
        if (!this._isHighlighted) {
            this.#render();
        }
        return this;
    }

    setHighlightedImage(url) {
        this._highlightedImageUrl = url;
        if (this._isHighlighted) {
            this.#render();
        }
        return this;
    }

    setContentMode(mode) {
        this.contentMode = mode;
        return this;
    }

    layoutSubviews() {
        super.layoutSubviews();
    }

    encode() {
        return {
            imageUrl: this._imageUrl,
            highlightedImageUrl: this._highlightedImageUrl,
            contentMode: this._contentMode,
            isHighlighted: this._isHighlighted,
            animationImages: this._animationImages,
            animationDuration: this._animationDuration,
            animationRepeatCount: this._animationRepeatCount
        };
    }

    static decode(data) {
        const imageView = new UIImageView();
        imageView._imageUrl = data.imageUrl || '';
        imageView._highlightedImageUrl = data.highlightedImageUrl || '';
        imageView._contentMode = data.contentMode || 'scaleAspectFit';
        imageView._isHighlighted = data.isHighlighted || false;
        imageView._animationImages = data.animationImages || [];
        imageView._animationDuration = data.animationDuration || 0;
        imageView._animationRepeatCount = data.animationRepeatCount || 0;
        return imageView;
    }

    matchImageView(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        return Switch(predicate)
            .case('empty', () => !this._imageUrl && !this._image)
            .case('loaded', () => !!this._imageUrl)
            .case('highlighted', () => this._isHighlighted)
            .case('notHighlighted', () => !this._isHighlighted)
            .case({ contentMode: Switch.let('mode') }, (m) => this._contentMode === m.mode)
            .case({ hasImage: true }, () => !!this._imageUrl || !!this._image)
            .case({ hasImage: false }, () => !this._imageUrl && !this._image)
            .case({ urlContains: Switch.let('str') }, (m) => this._imageUrl?.includes(m.str))
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

    tintColor(color) {
        if (this._renderedImage) {
            if (color instanceof UIColor) {
                this._renderedImage.style.filter = `tint-color(${color.css})`;
            }
        }
        return this;
    }

    startAnimating() {
        if (this._isAnimating) return this;
        if (this._animationImages.length === 0) return this;
        
        this._isAnimating = true;
        this._animationIndex = 0;
        
        const interval = (this._animationDuration * 1000) / this._animationImages.length;
        
        this._animationTimer = setInterval(() => {
            this._animationIndex++;
            if (this._animationIndex >= this._animationImages.length) {
                if (this._animationRepeatCount === 0) {
                    this._animationIndex = 0;
                } else {
                    this._animationIndex = 0;
                    this._animationRepeatCount--;
                    if (this._animationRepeatCount === 0) {
                        this.stopAnimating();
                        return;
                    }
                }
            }
            const imageUrl = this._animationImages[this._animationIndex];
            if (imageUrl) {
                this._imageUrl = imageUrl;
                this.#render();
            }
        }, interval);
        
        return this;
    }

    stopAnimating() {
        if (!this._isAnimating) return this;
        
        this._isAnimating = false;
        if (this._animationTimer) {
            clearInterval(this._animationTimer);
            this._animationTimer = null;
        }
        this._animationIndex = 0;
        
        return this;
    }

    get isAnimating() {
        return this._isAnimating;
    }

    animate(withImages, duration, repeatCount = 0) {
        this._animationImages = withImages || [];
        this._animationDuration = duration || 1;
        this._animationRepeatCount = repeatCount;
        
        if (this._animationImages.length > 0) {
            this._imageUrl = this._animationImages[0];
            this.#render();
            this.startAnimating();
        }
        
        return this;
    }

    setAnimationImages(images) {
        this._animationImages = images || [];
        return this;
    }

    setAnimationDuration(duration) {
        this._animationDuration = duration;
        return this;
    }

    setAnimationRepeatCount(count) {
        this._animationRepeatCount = count;
        return this;
    }

    withImage(url) {
        return this.setImage(url);
    }

    withHighlightedImage(url) {
        return this.setHighlightedImage(url);
    }

    withContentMode(mode) {
        return this.setContentMode(mode);
    }

    withAnimationImages(images) {
        return this.setAnimationImages(images);
    }

    withAnimationDuration(duration) {
        return this.setAnimationDuration(duration);
    }

    withAnimationRepeatCount(count) {
        return this.setAnimationRepeatCount(count);
    }

    withTintColor(color) {
        return this.tintColor(color);
    }
}

export default UIImageView;
