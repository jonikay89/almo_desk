import { forCase, guardCase, guardLet, ifCase, ifLet, patternMatch, whileCase } from './PatternMatching.js';
import Switch from './Switch.js';
import UIColor from './UIColor.js';
import UIControl from './UIControl.js';
import UIImageView from './UIImageView.js';
import UILabel from './UILabel.js';

class UIButton extends UIControl {
    constructor(title = '') {
        super();
        this._title = title;
        this._attributedTitle = null;
        this._currentTitle = title;
        
        this._titleLabel = null;
        this._imageView = null;
        this._backgroundImageView = null;
        
        this.titleColor = UIColor.black();
        this.highlightedTitleColor = null;
        this.selectedTitleColor = null;
        
        this.backgroundColor = UIColor.systemGray5();
        this.highlightedBackgroundColor = UIColor.systemGray4();
        this.selectedBackgroundColor = UIColor.systemGray3();
        
        this.borderColor = UIColor.systemGray3();
        this.borderWidth = 1;
        this.borderRadius = 8;
        
        this._contentEdgeInsets = { top: 8, left: 16, bottom: 8, right: 16 };
        this._titleEdgeInsets = { top: 0, left: 0, bottom: 0, right: 0 };
        this._imageEdgeInsets = { top: 0, left: 0, bottom: 0, right: 0 };
        
        this._buttonType = 'system';
        this._imagePlacement = 'left';
        
        this._accessibilityTraits = ['button'];
    }

    get titleLabel() {
        return this._titleLabel;
    }

    get imageView() {
        return this._imageView;
    }

    get title() {
        return this._title;
    }

    set title(value) {
        this._title = value || '';
        this._currentTitle = this._title;
        this._accessibilityLabel = this._title;
        this._accessibilityValue = this._title;
        if (this._titleLabel) {
            this._titleLabel.text = this._currentTitle;
        }
        this._updateAccessibilityAttributes();
    }

    get currentTitle() {
        return this._currentTitle;
    }

    get titleColor() {
        return this._titleLabel?.textColor || UIColor.black();
    }

    set titleColor(color) {
        if (color instanceof UIColor) {
            this._titleLabelColor = color;
        } else if (typeof color === 'string') {
            this._titleLabelColor = UIColor.colorWithHex(color);
        } else {
            this._titleLabelColor = UIColor.black();
        }
        if (this._titleLabel) {
            this._titleLabel.textColor = this._titleLabelColor;
        }
    }

    get currentTitleColor() {
        if (this.highlighted && this.highlightedTitleColor) {
            return this.highlightedTitleColor;
        }
        if (this.selected && this.selectedTitleColor) {
            return this.selectedTitleColor;
        }
        return this._titleLabelColor || UIColor.black();
    }

    get attributedTitle() {
        return this._attributedTitle;
    }

    set attributedTitle(value) {
        this._attributedTitle = value;
        if (value && this._titleLabel) {
            this._titleLabel.attributedText = value;
        }
    }

    init() {
        super.init();
        this._layer.cssClass = 'ui-button';
        
        this._titleLabel = new UILabel(this._title);
        this._titleLabel.init();
        this._titleLabel.textColor = this._titleLabelColor || UIColor.black();
        this._titleLabel.textAlignment = 'center';
        this._titleLabel.numberOfLines = 1;
        this._titleLabel.element.style.pointerEvents = 'none';
        this.element.appendChild(this._titleLabel.element);
        
        this._imageView = new UIImageView();
        this._imageView.init();
        this._imageView.element.style.pointerEvents = 'none';
        this._imageView.contentMode = 'scaleAspectFit';
        this.element.appendChild(this._imageView.element);
        
        this.#updateAppearance();
        this.#setupEventListeners();
        
        return this;
    }

    deinit() {
        this._titleLabel = null;
        this._imageView = null;
        this._backgroundImageView = null;
        super.deinit();
    }

    #setupEventListeners() {
        this.element.addEventListener('mouseenter', () => this.setHighlighted(true));
        this.element.addEventListener('mouseleave', () => this.setHighlighted(false));
        this.element.addEventListener('mousedown', () => this.setHighlighted(true));
        this.element.addEventListener('mouseup', () => this.setHighlighted(false));
    }

    #updateAppearance() {
        if (!this.element) return;

        const bgResult = Switch({ highlighted: this.highlighted, selected: this.selected })
            .case({ highlighted: true, selected: Switch.Wildcard }, 
                  () => this.highlightedBackgroundColor || this.backgroundColor)
            .case({ highlighted: false, selected: true }, 
                  () => this.selectedBackgroundColor || this.backgroundColor)
            .default(() => this.backgroundColor)
            .evaluate();
        
        if (bgResult instanceof UIColor) {
            this.element.style.backgroundColor = bgResult.css;
        } else if (bgResult) {
            this.element.style.backgroundColor = bgResult;
        }

        if (this._titleLabel) {
            const titleColor = this.highlighted && this.highlightedTitleColor ? 
                this.highlightedTitleColor : 
                (this.selected && this.selectedTitleColor ? this.selectedTitleColor : this._titleLabelColor);
            
            if (titleColor instanceof UIColor) {
                this._titleLabel.textColor = titleColor;
            } else if (typeof titleColor === 'string') {
                this._titleLabel.textColor = UIColor.colorWithHex(titleColor);
            }
        }

        this.element.style.border = `${this.borderWidth}px solid ${this.borderColor?.css || this.borderColor}`;
        this.element.style.borderRadius = `${this.borderRadius}px`;
    }

    #updateLayout() {
        if (!this.element || !this._titleLabel || !this._imageView) return;

        const width = this._bounds.width || 100;
        const height = this._bounds.height || 44;
        
        this._titleLabel.element.style.position = 'absolute';
        this._imageView.element.style.position = 'absolute';

        const hasImage = this._imageView.image || this._imageView._imageUrl;
        const imageSize = hasImage ? 20 : 0;
        const imagePadding = hasImage ? 8 : 0;
        
        let contentWidth = 0;
        let contentHeight = 0;

        if (this._titleLabel.text) {
            const labelWidth = this._titleLabel.element.offsetWidth || 50;
            const labelHeight = this._titleLabel.element.offsetHeight || 20;
            contentWidth += labelWidth;
            contentHeight = Math.max(contentHeight, labelHeight);
        }

        if (hasImage) {
            contentWidth += imageSize + (this._title ? imagePadding : 0);
            contentHeight = Math.max(contentHeight, imageSize);
        }

        const totalWidth = contentWidth + this._contentEdgeInsets.left + this._contentEdgeInsets.right;
        const totalHeight = contentHeight + this._contentEdgeInsets.top + this._contentEdgeInsets.bottom;

        let xOffset = (width - totalWidth) / 2 + this._contentEdgeInsets.left;
        let yOffset = (height - totalHeight) / 2 + this._contentEdgeInsets.top;

        if (hasImage && this._title) {
            if (this._imagePlacement === 'left') {
                this._imageView.element.style.left = `${xOffset}px`;
                this._imageView.element.style.top = `${yOffset + (contentHeight - imageSize) / 2}px`;
                this._imageView.element.style.width = `${imageSize}px`;
                this._imageView.element.style.height = `${imageSize}px`;
                xOffset += imageSize + imagePadding;
            }
        }

        if (this._title) {
            this._titleLabel.element.style.left = `${xOffset}px`;
            this._titleLabel.element.style.top = `${yOffset}px`;
            this._titleLabel.element.style.width = 'auto';
            this._titleLabel.element.style.height = 'auto';
        }
    }

    layoutSubviews() {
        super.layoutSubviews();
        if (this.element) {
            this.element.style.width = `${this._bounds.width}px`;
            this.element.style.height = `${this._bounds.height}px`;
        }
        this.#updateLayout();
    }

    setTitle(title) {
        this.title = title;
        return this;
    }

    setAttributedTitle(attributedTitle) {
        this.attributedTitle = attributedTitle;
        return this;
    }

    setTitleColor(color) {
        this.titleColor = color;
        return this;
    }

    setHighlightedTitleColor(color) {
        this.highlightedTitleColor = color;
        this.#updateAppearance();
        return this;
    }

    setSelectedTitleColor(color) {
        this.selectedTitleColor = color;
        this.#updateAppearance();
        return this;
    }

    setBackgroundColor(color) {
        if (color instanceof UIColor) {
            this.backgroundColor = color;
        } else if (typeof color === 'string') {
            this.backgroundColor = UIColor.colorWithHex(color);
        }
        this.#updateAppearance();
        return this;
    }

    setImage(image) {
        if (this._imageView) {
            if (image instanceof UIImage) {
                this._imageView.image = image;
            } else if (typeof image === 'string') {
                this._imageView.imageUrl = image;
            }
        }
        this.#updateLayout();
        return this;
    }

    setBackgroundImage(image) {
        if (!this._backgroundImageView && this.element) {
            this._backgroundImageView = new UIImageView();
            this._backgroundImageView.init();
            this._backgroundImageView.element.style.position = 'absolute';
            this._backgroundImageView.element.style.top = '0';
            this._backgroundImageView.element.style.left = '0';
            this._backgroundImageView.element.style.width = '100%';
            this._backgroundImageView.element.style.height = '100%';
            this.element.insertBefore(this._backgroundImageView.element, this.element.firstChild);
        }
        
        if (this._backgroundImageView) {
            if (image instanceof UIImage) {
                this._backgroundImageView.image = image;
            } else if (typeof image === 'string') {
                this._backgroundImageView.imageUrl = image;
            }
        }
        return this;
    }

    setBorder(color, width = 1, radius = 4) {
        this.borderColor = color;
        this.borderWidth = width;
        this.borderRadius = radius;
        this.#updateAppearance();
        return this;
    }

    setContentEdgeInsets(insets) {
        this._contentEdgeInsets = insets;
        this.#updateLayout();
        return this;
    }

    setTitleEdgeInsets(insets) {
        this._titleEdgeInsets = insets;
        this.#updateLayout();
        return this;
    }

    setImageEdgeInsets(insets) {
        this._imageEdgeInsets = insets;
        this.#updateLayout();
        return this;
    }

    setImagePlacement(placement) {
        this._imagePlacement = placement;
        this.#updateLayout();
        return this;
    }

    setCornerRadius(radius) {
        this.borderRadius = radius;
        this.#updateAppearance();
        return this;
    }

    setFont(font) {
        if (this._titleLabel) {
            if (typeof font === 'number') {
                this._titleLabel.fontSize = font;
            } else if (typeof font === 'object') {
                if (font.size) this._titleLabel.fontSize = font.size;
                if (font.family) this._titleLabel.fontFamily = font.family;
                if (font.weight) this._titleLabel.fontWeight = font.weight;
            }
        }
        return this;
    }

    setFontSize(size) {
        if (this._titleLabel) {
            this._titleLabel.fontSize = size;
        }
        return this;
    }

    setFontFamily(family) {
        if (this._titleLabel) {
            this._titleLabel.fontFamily = family;
        }
        return this;
    }

    setFontWeight(weight) {
        if (this._titleLabel) {
            this._titleLabel.fontWeight = weight;
        }
        return this;
    }

    setHighlighted(highlighted) {
        super.setHighlighted(highlighted);
        this.#updateAppearance();
    }

    setSelected(selected) {
        super.setSelected(selected);
        this.#updateAppearance();
    }

    withTitle(title) {
        return this.setTitle(title);
    }

    withAttributedTitle(attributedTitle) {
        return this.setAttributedTitle(attributedTitle);
    }

    withTitleColor(color) {
        return this.setTitleColor(color);
    }

    withHighlightedTitleColor(color) {
        return this.setHighlightedTitleColor(color);
    }

    withSelectedTitleColor(color) {
        return this.setSelectedTitleColor(color);
    }

    withBackgroundColor(color) {
        return this.setBackgroundColor(color);
    }

    withImage(image) {
        return this.setImage(image);
    }

    withBackgroundImage(image) {
        return this.setBackgroundImage(image);
    }

    withBorder(color, width, radius) {
        return this.setBorder(color, width, radius);
    }

    withCornerRadius(radius) {
        return this.setCornerRadius(radius);
    }

    withContentEdgeInsets(insets) {
        return this.setContentEdgeInsets(insets);
    }

    withTitleEdgeInsets(insets) {
        return this.setTitleEdgeInsets(insets);
    }

    withImageEdgeInsets(insets) {
        return this.setImageEdgeInsets(insets);
    }

    withImagePlacement(placement) {
        return this.setImagePlacement(placement);
    }

    withFont(font) {
        return this.setFont(font);
    }

    withFontSize(size) {
        return this.setFontSize(size);
    }

    withFontFamily(family) {
        return this.setFontFamily(family);
    }

    withFontWeight(weight) {
        return this.setFontWeight(weight);
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

    matchButton(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        return Switch(predicate)
            .case({ title: Switch.let('t') }, (m) => this._title === m.t)
            .case({ hasTitle: true }, () => !!this._title)
            .case({ hasTitle: false }, () => !this._title)
            .case({ hasImage: true }, () => !!this._imageView?.image || !!this._imageView?._imageUrl)
            .case({ hasImage: false }, () => !this._imageView?.image && !this._imageView?._imageUrl)
            .case({ highlighted: true }, () => this.highlighted === true)
            .case({ highlighted: false }, () => this.highlighted === false)
            .case({ selected: true }, () => this.selected === true)
            .case({ selected: false }, () => this.selected === false)
            .case({ enabled: true }, () => this.enabled === true)
            .case({ enabled: false }, () => this.enabled === false)
            .default(() => false)
            .evaluate();
    }

    switch() {
        return Switch(this);
    }

    patternMatch(predicate) {
        return this.matchButton(predicate);
    }

    encode() {
        return {
            title: this._title,
            titleColor: this._titleLabelColor?.hex,
            highlightedTitleColor: this.highlightedTitleColor?.hex,
            selectedTitleColor: this.selectedTitleColor?.hex,
            backgroundColor: this.backgroundColor?.hex,
            borderColor: this.borderColor?.hex,
            borderWidth: this.borderWidth,
            borderRadius: this.borderRadius
        };
    }

    static decode(data) {
        const button = new UIButton(data.title || '');
        if (data.titleColor) button.titleColor = UIColor.colorWithHex(data.titleColor);
        if (data.highlightedTitleColor) button.highlightedTitleColor = UIColor.colorWithHex(data.highlightedTitleColor);
        if (data.selectedTitleColor) button.selectedTitleColor = UIColor.colorWithHex(data.selectedTitleColor);
        if (data.backgroundColor) button.backgroundColor = UIColor.colorWithHex(data.backgroundColor);
        if (data.borderColor) button.borderColor = UIColor.colorWithHex(data.borderColor);
        if (data.borderWidth !== undefined) button.borderWidth = data.borderWidth;
        if (data.borderRadius !== undefined) button.borderRadius = data.borderRadius;
        return button;
    }
}

export default UIButton;
