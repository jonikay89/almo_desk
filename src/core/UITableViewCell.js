import UIView from './UIView.js';
import UIColor from './UIColor.js';
import { NSNumber, kp, getProperty, updateProperty } from './Foundation.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';

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
        this.textLabel = null;
        this.detailLabel = null;
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

        this._contentView = new UIView();
        this._contentView.init();
        this._contentView.element.style.flex = '1';
        this._contentView.element.style.overflow = 'hidden';

        if (this.image) {
            const img = document.createElement('img');
            img.src = this.image;
            img.style.width = '40px';
            img.style.height = '40px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '4px';
            img.style.marginRight = '12px';
            img.style.flexShrink = '0';
            this.imageView = img;
            this.element.appendChild(img);
        }

        const textContainer = document.createElement('div');
        textContainer.style.flex = '1';
        textContainer.style.overflow = 'hidden';

        const textLabel = document.createElement('span');
        textLabel.className = 'cell-text';
        textLabel.style.fontSize = '16px';
        textLabel.style.color = '#000';
        textLabel.style.whiteSpace = 'nowrap';
        textLabel.style.overflow = 'hidden';
        textLabel.style.textOverflow = 'ellipsis';
        textLabel.textContent = this.text;
        this.textLabel = textLabel;
        textContainer.appendChild(textLabel);

        if (this.detailText) {
            const detailLabel = document.createElement('span');
            detailLabel.className = 'cell-detail-text';
            detailLabel.style.display = 'block';
            detailLabel.style.fontSize = '13px';
            detailLabel.style.color = '#888';
            detailLabel.style.marginTop = '2px';
            detailLabel.style.whiteSpace = 'nowrap';
            detailLabel.style.overflow = 'hidden';
            detailLabel.style.textOverflow = 'ellipsis';
            detailLabel.textContent = this.detailText;
            this.detailLabel = detailLabel;
            textContainer.appendChild(detailLabel);
        }

        this._contentView.element.appendChild(textContainer);
        this.element.appendChild(this._contentView.element);

        this.#updateAccessory();

        return this;
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
            if (this.textLabel) this.textLabel.style.color = '#fff';
            if (this.detailLabel) this.detailLabel.style.color = '#fff';
        } else if (this._highlighted) {
            this.element.style.backgroundColor = UIColor.colorWithWhiteAlpha(0.9, 1).css;
            if (this.textLabel) this.textLabel.style.color = '#000';
            if (this.detailLabel) this.detailLabel.style.color = '#666';
        } else {
            this.element.style.backgroundColor = UIColor.white().css;
            if (this.textLabel) this.textLabel.style.color = '#000';
            if (this.detailLabel) this.detailLabel.style.color = '#888';
        }
    }

    #updateAccessory() {
        const existingAccessory = this.element.querySelector('.accessory');
        if (existingAccessory) {
            existingAccessory.remove();
        }

        const accessory = document.createElement('div');
        accessory.className = 'accessory';
        accessory.style.marginLeft = '8px';
        accessory.style.flexShrink = '0';

        switch (this.accessoryType) {
            case 'disclosureIndicator':
                accessory.innerHTML = '›';
                accessory.style.fontSize = '20px';
                accessory.style.color = '#ccc';
                break;
            case 'checkmark':
                accessory.innerHTML = '✓';
                accessory.style.fontSize = '18px';
                accessory.style.color = UIColor.systemBlue().css;
                break;
            case 'detailButton':
                accessory.innerHTML = 'ⓘ';
                accessory.style.fontSize = '16px';
                accessory.style.color = '#888';
                break;
            case 'detailDisclosureButton':
                accessory.innerHTML = 'ⓘ›';
                accessory.style.fontSize = '16px';
                accessory.style.color = '#888';
                break;
            default:
                return;
        }

        this.element.appendChild(accessory);
    }

    setText(text) {
        this.text = text;
        if (this.textLabel) {
            this.textLabel.textContent = text;
        }
        return this;
    }

    setDetailText(text) {
        this.detailText = text;
        if (this.detailLabel) {
            this.detailLabel.textContent = text;
        }
        return this;
    }

    setImage(url) {
        this.image = url;
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

    prepareForReuse() {
        this.text = '';
        this.detailText = '';
        this.image = null;
        this.accessoryType = 'none';
        this._selected = false;
        this._highlighted = false;
        this.#updateSelectionAppearance();
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
}

export default UITableViewCell;