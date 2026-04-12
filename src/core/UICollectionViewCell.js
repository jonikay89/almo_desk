import UIView from './UIView.js';
import UIColor from './UIColor.js';
import { NSNumber, kp, getProperty, updateProperty } from './Foundation.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';
import UILabel from './UILabel.js';
import UIImageView from './UIImageView.js';
import { CALayer, CAShapeLayer, CGPath } from './CALayer.js';

class UICollectionViewCell extends UIView {
    constructor(reuseIdentifier = null) {
        super();
        this.reuseIdentifier = reuseIdentifier;
        this._selected = false;
        this._highlighted = false;
        this._contentView = null;
        this._imageView = null;
        this._textLabel = null;
        this._backgroundImageView = null;
    }

    get contentView() {
        return this._contentView;
    }

    get imageView() {
        return this._imageView;
    }

    get textLabel() {
        return this._textLabel;
    }

    init() {
        this.element = document.createElement('div');
        this.element.className = 'ui-collectionview-cell';
        this.element.style.display = 'flex';
        this.element.style.flexDirection = 'column';
        this.element.style.alignItems = 'center';
        this.element.style.justifyContent = 'center';
        this.element.style.backgroundColor = UIColor.white().css;
        this.element.style.borderRadius = '8px';
        this.element.style.border = '1px solid #ddd';
        this.element.style.overflow = 'hidden';
        this.element.style.cursor = 'pointer';
        this.element.style.userSelect = 'none';
        this.element.style.position = 'relative';

        this._contentView = new UIView();
        this._contentView.init();
        this._contentView.element.style.flex = '1';
        this._contentView.element.style.width = '100%';
        this._contentView.element.style.position = 'relative';
        this._contentView.element.style.overflow = 'hidden';

        this._imageView = new UIImageView();
        this._imageView.init();
        this._imageView.contentMode = 'scaleAspectFill';
        this._imageView.element.style.width = '100%';
        this._imageView.element.style.height = '100%';
        this._imageView.element.style.display = 'block';
        this._contentView.element.appendChild(this._imageView.element);

        this._textLabel = new UILabel('');
        this._textLabel.init();
        this._textLabel.textAlignment = 'center';
        this._textLabel.fontSize = 12;
        this._textLabel.textColor = UIColor.white();
        this._textLabel.numberOfLines = 1;
        this._textLabel.element.style.position = 'absolute';
        this._textLabel.element.style.bottom = '0';
        this._textLabel.element.style.left = '0';
        this._textLabel.element.style.right = '0';
        this._textLabel.element.style.padding = '4px 8px';
        this._textLabel.element.style.backgroundColor = 'rgba(0,0,0,0.5)';
        this._contentView.element.appendChild(this._textLabel.element);

        this.element.appendChild(this._contentView.element);
        this.#setupLayers();

        return this;
    }

    #setupLayers() {
        this._layer = CALayer.layer();
        this._layer.name = 'cellLayer';
        this._layer.frame = { x: 0, y: 0, width: 0, height: 0 };
        this._layer.cornerRadius = 8;
        this._layer.borderWidth = 1;
        this._layer.borderColor = UIColor.colorWithHex('#ddd');
    }

    get isSelected() {
        return this._selected;
    }

    set isSelected(value) {
        this._selected = value;
        this.#updateAppearance();
    }

    get isHighlighted() {
        return this._highlighted;
    }

    set isHighlighted(value) {
        this._highlighted = value;
        this.#updateAppearance();
    }

    #updateAppearance() {
        if (this._selected) {
            this.element.style.borderColor = UIColor.systemBlue().css;
            this.element.style.borderWidth = '2px';
        } else if (this._highlighted) {
            this.element.style.borderColor = UIColor.systemGray().css;
            this.element.style.borderWidth = '1px';
            this.element.style.opacity = '0.7';
        } else {
            this.element.style.borderColor = '#ddd';
            this.element.style.borderWidth = '1px';
            this.element.style.opacity = '1';
        }
    }

    setImage(url) {
        if (this._imageView) {
            this._imageView.imageUrl = url;
            this._imageView.element.style.display = url ? '' : 'none';
        }
        return this;
    }

    setLabel(text) {
        if (this._textLabel) {
            this._textLabel.text = text || '';
            this._textLabel.element.style.display = text ? '' : 'none';
        }
        return this;
    }

    setSelected(selected, animated = false) {
        this._selected = selected;
        this.#updateAppearance();
        return this;
    }

    setHighlighted(highlighted, animated = false) {
        this._highlighted = highlighted;
        this.#updateAppearance();
        return this;
    }

    withImage(url) {
        return this.setImage(url);
    }

    withLabel(text) {
        return this.setLabel(text);
    }

    withCornerRadius(radius) {
        if (this.element) {
            this.element.style.borderRadius = `${radius}px`;
        }
        if (this._layer) {
            this._layer.cornerRadius = radius;
        }
        return this;
    }

    withBorder(color, width = 1) {
        if (this.element) {
            this.element.style.border = `${width}px solid ${color}`;
        }
        if (this._layer) {
            this._layer.borderColor = color instanceof UIColor ? color : UIColor.colorWithHex(color);
            this._layer.borderWidth = width;
        }
        return this;
    }

    withShadow(color, offset, radius, opacity = 0.3) {
        if (this._layer) {
            this._layer.shadowColor = color;
            this._layer.shadowOffset = offset;
            this._layer.shadowRadius = radius;
            this._layer.shadowOpacity = opacity;
        }
        return this;
    }

    prepareForReuse() {
        if (this._imageView) {
            this._imageView.imageUrl = null;
        }
        if (this._textLabel) {
            this._textLabel.text = '';
        }
        this._selected = false;
        this._highlighted = false;
        this.#updateAppearance();
    }

    layoutSubviews() {
        super.layoutSubviews();
    }

    get description() {
        return `UICollectionViewCell(reuseIdentifier: ${this.reuseIdentifier || 'null'}, label: "${this._textLabel?.text || ''}")`;
    }

    isSelectedAsNumber() {
        return NSNumber.of(this._selected ? 1 : 0);
    }

    encode() {
        return {
            reuseIdentifier: this.reuseIdentifier,
            label: this._textLabel?.text || '',
            _selected: this._selected,
            _highlighted: this._highlighted
        };
    }

    static decode(data) {
        const cell = new UICollectionViewCell(data.reuseIdentifier);
        if (data.label) {
            cell.setLabel(data.label);
        }
        cell._selected = data._selected || false;
        cell._highlighted = data._highlighted || false;
        return cell;
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

    matchCell(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        return Switch(predicate)
            .case('selected', () => this._selected)
            .case('highlighted', () => this._highlighted)
            .case('empty', () => !this._imageView?.image && !this._textLabel?.text)
            .case('hasImage', () => !!this._imageView?.image)
            .case('hasLabel', () => !!this._textLabel?.text)
            .case({ labelContains: Switch.let('text') }, (m) => this._textLabel?.text?.includes(m.text))
            .default(() => false)
            .evaluate();
    }

    updateValue(keyPath, newValue) {
        const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
        updateProperty(this, path, newValue);
        return this;
    }

    getValue(keyPath) {
        const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
        return getProperty(this, path);
    }
}

export default UICollectionViewCell;