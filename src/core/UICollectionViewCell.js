import UIView from './UIView.js';
import UIColor from './UIColor.js';
import { NSNumber, kp, getProperty, updateProperty } from './Foundation.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';

class UICollectionViewCell extends UIView {
    constructor(reuseIdentifier = null) {
        super();
        this.reuseIdentifier = reuseIdentifier;
        this.imageView = null;
        this.label = null;
        this._selected = false;
        this._highlighted = false;
        this._contentView = null;
    }

    init() {
        this.element = document.createElement('div');
        this.element.className = 'ui-collectionview-cell';
        this.element.style.display = 'flex';
        this.element.style.alignItems = 'center';
        this.element.style.justifyContent = 'center';
        this.element.style.backgroundColor = UIColor.white().css;
        this.element.style.borderRadius = '8px';
        this.element.style.border = '1px solid #ddd';
        this.element.style.overflow = 'hidden';
        this.element.style.cursor = 'pointer';
        this.element.style.userSelect = 'none';

        this._contentView = new UIView();
        this._contentView.init();
        this.element.appendChild(this._contentView.element);

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
        if (!this.imageView) {
            const img = document.createElement('img');
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.display = 'block';
            this.imageView = img;
            this.element.appendChild(img);
        }
        this.imageView.src = url;
        return this;
    }

    setLabel(text) {
        if (!this.label) {
            const label = document.createElement('span');
            label.style.position = 'absolute';
            label.style.bottom = '0';
            label.style.left = '0';
            label.style.right = '0';
            label.style.padding = '4px 8px';
            label.style.backgroundColor = 'rgba(0,0,0,0.5)';
            label.style.color = '#fff';
            label.style.fontSize = '12px';
            label.style.textAlign = 'center';
            this.label = label;
            this.element.appendChild(label);
        }
        this.label.textContent = text;
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

    prepareForReuse() {
        if (this.imageView) {
            this.imageView.src = '';
        }
        if (this.label) {
            this.label.textContent = '';
        }
        this._selected = false;
        this._highlighted = false;
        this.#updateAppearance();
    }

    layoutSubviews() {
        super.layoutSubviews();
    }

    get description() {
        return `UICollectionViewCell(reuseIdentifier: ${this.reuseIdentifier || 'null'}, label: "${this.label?.textContent || ''}")`;
    }

    isSelectedAsNumber() {
        return NSNumber.of(this._selected ? 1 : 0);
    }

    encode() {
        return {
            reuseIdentifier: this.reuseIdentifier,
            label: this.label?.textContent || '',
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
            .case('empty', () => !this.imageView?.src && !this.label?.textContent)
            .case('hasImage', () => !!this.imageView?.src)
            .case('hasLabel', () => !!this.label?.textContent)
            .case({ labelContains: Switch.let('text') }, (m) => this.label?.textContent?.includes(m.text))
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