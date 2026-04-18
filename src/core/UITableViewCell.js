import { CALayer, CAShapeLayer } from './CALayer.js';
import { NSNumber, getProperty, kp, updateProperty } from './Foundation.js';
import { forCase, guardCase, guardLet, ifCase, ifLet, patternMatch, whileCase } from './PatternMatching.js';
import Switch from './Switch.js';
import UIColor from './UIColor.js';
import UIImageView from './UIImageView.js';
import UILabel from './UILabel.js';
import UIView from './UIView.js';

class UITableViewCell extends UIView {
    constructor(reuseIdentifier = null) {
        super();
        this.reuseIdentifier = reuseIdentifier;
        this.text = '';
        this.detailText = '';
        this.image = null;
        this.accessoryType = 'none';
        this.selectionStyle = 'default';
        this._selected = false;
        this._highlighted = false;
        this._contentView = null;
        this._textLabel = null;
        this._detailTextLabel = null;
        this._imageView = null;
        this._accessoryView = null;
    }

    get textLabel() {
        return this._textLabel;
    }

    get detailTextLabel() {
        return this._detailTextLabel;
    }

    get imageView() {
        return this._imageView;
    }

    init() {
        this.element = document.createElement('div');
        this.element.className = 'ui-tableview-cell';
        this.element.style.display = 'flex';
        this.element.style.alignItems = 'center';
        this.element.style.height = '100%';
        this.element.style.backgroundColor = UIColor.white().css;
        this.element.style.borderBottom = '1px solid #eee';
        this.element.style.padding = '0 16px';
        this.element.style.cursor = 'pointer';
        this.element.style.userSelect = 'none';
        this.element.style.position = 'absolute';

        this._contentView = new UIView();
        this._contentView.init();
        this._contentView.element.style.flex = '1';
        this._contentView.element.style.overflow = 'hidden';
        this._contentView.element.style.display = 'flex';
        this._contentView.element.style.alignItems = 'center';

        this._imageView = new UIImageView();
        this._imageView.init();
        this._imageView.contentMode = 'scaleAspectFill';
        this._imageView.element.style.width = '40px';
        this._imageView.element.style.height = '40px';
        this._imageView.element.style.borderRadius = '4px';
        this._imageView.element.style.marginRight = '12px';
        this._imageView.element.style.flexShrink = '0';
        this._imageView.element.style.objectFit = 'cover';
        if (this.image) {
            this._imageView.imageUrl = this.image;
        }
        this._contentView.element.appendChild(this._imageView.element);

        const textContainer = document.createElement('div');
        textContainer.style.flex = '1';
        textContainer.style.overflow = 'hidden';
        textContainer.style.display = 'flex';
        textContainer.style.flexDirection = 'column';
        textContainer.style.justifyContent = 'center';

        this._textLabel = new UILabel(this.text);
        this._textLabel.init();
        this._textLabel.fontSize = 16;
        this._textLabel.numberOfLines = 1;
        this._textLabel.lineBreakMode = 'ellipsis';
        this._textLabel.element.style.color = '#000';
        this._textLabel.element.className = 'cell-text';
        textContainer.appendChild(this._textLabel.element);

        this._detailTextLabel = new UILabel(this.detailText);
        this._detailTextLabel.init();
        this._detailTextLabel.fontSize = 13;
        this._detailTextLabel.textColor = UIColor.gray();
        this._detailTextLabel.numberOfLines = 1;
        this._detailTextLabel.lineBreakMode = 'ellipsis';
        this._detailTextLabel.element.style.marginTop = '2px';
        this._detailTextLabel.element.className = 'cell-detail-text';
        if (this.detailText) {
            textContainer.appendChild(this._detailTextLabel.element);
        }

        this._contentView.element.appendChild(textContainer);
        this.element.appendChild(this._contentView.element);

        this.#updateAccessory();
        this.#setupLayers();

        return this;
    }

    #setupLayers() {
        this._layer = CALayer.layer();
        this._layer.name = 'cellLayer';
        this._layer.frame = { x: 0, y: 0, width: 0, height: 0 };
    }

    get contentView() {
        return this._contentView;
    }

    get isSelected() {
        return this._selected;
    }

    set isSelected(value) {
        this._selected = value;
        this.#updateSelectionAppearance();
    }

    get isHighlighted() {
        return this._highlighted;
    }

    set isHighlighted(value) {
        this._highlighted = value;
        this.#updateSelectionAppearance();
    }

    #updateSelectionAppearance() {
        const style = this.selectionStyle;
        if (style === 'none') return;

        if (this._selected) {
            this.element.style.backgroundColor = UIColor.systemBlue().css;
            if (this._textLabel) this._textLabel.textColor = UIColor.white();
            if (this._detailTextLabel) this._detailTextLabel.textColor = UIColor.white();
        } else if (this._highlighted) {
            this.element.style.backgroundColor = UIColor.colorWithWhiteAlpha(0.9, 1).css;
            if (this._textLabel) this._textLabel.textColor = UIColor.black();
            if (this._detailTextLabel) this._detailTextLabel.textColor = UIColor.gray();
        } else {
            this.element.style.backgroundColor = UIColor.white().css;
            if (this._textLabel) this._textLabel.textColor = UIColor.black();
            if (this._detailTextLabel) this._detailTextLabel.textColor = UIColor.gray();
        }
    }

    #updateAccessory() {
        if (this._accessoryView) {
            this._accessoryView.element.remove();
            this._accessoryView = null;
        }

        const accessoryContainer = document.createElement('div');
        accessoryContainer.className = 'accessory';
        accessoryContainer.style.marginLeft = '8px';
        accessoryContainer.style.flexShink = '0';
        accessoryContainer.style.display = 'flex';
        accessoryContainer.style.alignItems = 'center';

        switch (this.accessoryType) {
            case 'disclosureIndicator':
                const disclosure = document.createElement('span');
                disclosure.textContent = '›';
                disclosure.style.fontSize = '20px';
                disclosure.style.color = '#ccc';
                accessoryContainer.appendChild(disclosure);
                break;
            case 'checkmark':
                const checkmark = document.createElement('span');
                checkmark.textContent = '✓';
                checkmark.style.fontSize = '18px';
                checkmark.style.color = UIColor.systemBlue().css;
                accessoryContainer.appendChild(checkmark);
                break;
            case 'detailButton':
                const detailBtn = document.createElement('span');
                detailBtn.textContent = 'ⓘ';
                detailBtn.style.fontSize = '16px';
                detailBtn.style.color = '#888';
                accessoryContainer.appendChild(detailBtn);
                break;
            case 'detailDisclosureButton':
                const detailDisclose = document.createElement('span');
                detailDisclose.textContent = 'ⓘ›';
                detailDisclose.style.fontSize = '16px';
                detailDisclose.style.color = '#888';
                accessoryContainer.appendChild(detailDisclose);
                break;
            default:
                this.element.appendChild(accessoryContainer);
                return;
        }

        this.element.appendChild(accessoryContainer);
    }

    setText(text) {
        this.text = text;
        if (this._textLabel) {
            this._textLabel.text = text;
        }
        return this;
    }

    setDetailText(text) {
        this.detailText = text;
        if (this._detailTextLabel) {
            if (text) {
                this._detailTextLabel.text = text;
                this._detailTextLabel.element.style.display = '';
            } else {
                this._detailTextLabel.element.style.display = 'none';
            }
        }
        return this;
    }

    setImage(url) {
        this.image = url;
        if (this._imageView) {
            this._imageView.imageUrl = url;
            this._imageView.element.style.display = url ? '' : 'none';
        }
        return this;
    }

    setAccessoryType(type) {
        this.accessoryType = type;
        this.#updateAccessory();
        return this;
    }

    setSelectionStyle(style) {
        this.selectionStyle = style;
        return this;
    }

    setSelected(selected, animated = false) {
        this._selected = selected;
        this.#updateSelectionAppearance();
        return this;
    }

    setHighlighted(highlighted, animated = false) {
        this._highlighted = highlighted;
        this.#updateSelectionAppearance();
        return this;
    }

    withText(text) {
        return this.setText(text);
    }

    withDetailText(text) {
        return this.setDetailText(text);
    }

    withImage(url) {
        return this.setImage(url);
    }

    withAccessoryType(type) {
        return this.setAccessoryType(type);
    }

    withSelectionStyle(style) {
        return this.setSelectionStyle(style);
    }

    prepareForReuse() {
        this.text = '';
        this.detailText = '';
        this.image = null;
        this.accessoryType = 'none';
        this._selected = false;
        this._highlighted = false;
        this.selectionStyle = 'default';
        
        if (this._textLabel) {
            this._textLabel.text = '';
            this._textLabel.textColor = UIColor.black();
        }
        if (this._detailTextLabel) {
            this._detailTextLabel.text = '';
            this._detailTextLabel.textColor = UIColor.gray();
        }
        if (this._imageView) {
            this._imageView.imageUrl = null;
            this._imageView.element.style.display = 'none';
        }
        
        if (this._accessoryView) {
            this._accessoryView.element.remove();
            this._accessoryView = null;
        }
        
        this.element.style.backgroundColor = UIColor.white().css;
        this.element.classList.remove('selected', 'highlighted');
        
        if (this._contentView) {
            this._contentView.element.style.backgroundColor = 'transparent';
        }
    }

    layoutSubviews() {
        super.layoutSubviews();
    }

    get description() {
        return `UITableViewCell(text: "${this.text}", detailText: "${this.detailText}", accessoryType: "${this.accessoryType}")`;
    }

    selectionStyleAsNumber() {
        const styleMap = { none: 0, default: 1 };
        return NSNumber.of(styleMap[this.selectionStyle] !== undefined ? styleMap[this.selectionStyle] : 0);
    }

    encode() {
        return {
            reuseIdentifier: this.reuseIdentifier,
            text: this.text,
            detailText: this.detailText,
            image: this.image,
            accessoryType: this.accessoryType,
            selectionStyle: this.selectionStyle
        };
    }

    static decode(data) {
        const cell = new UITableViewCell(data.reuseIdentifier);
        cell.text = data.text;
        cell.detailText = data.detailText;
        cell.image = data.image;
        cell.accessoryType = data.accessoryType;
        cell.selectionStyle = data.selectionStyle;
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
            .case('empty', () => !this.text && !this.detailText && !this.image)
            .case('hasImage', () => !!this.image)
            .case('hasDetail', () => !!this.detailText)
            .case({ textContains: Switch.let('t') }, (m) => this.text?.includes(m.t))
            .case({ detailContains: Switch.let('t') }, (m) => this.detailText?.includes(m.t))
            .case({ accessory: Switch.let('a') }, (m) => this.accessoryType === m.a)
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

    withBorder(color, width, radius) {
        if (this._layer) {
            const shapeLayer = CAShapeLayer.layer();
            shapeLayer.frame = this._bounds;
            const rect = CGPath.CreateRect(0, 0, this._bounds.width, this._bounds.height);
            shapeLayer.path = rect;
            shapeLayer.fillColor = null;
            shapeLayer.strokeColor = color;
            shapeLayer.lineWidth = width;
            this._layer.addSublayer(shapeLayer);
        }
        return this;
    }

    withCornerRadius(radius) {
        if (this.element) {
            this.element.style.borderRadius = `${radius}px`;
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
}

export default UITableViewCell;