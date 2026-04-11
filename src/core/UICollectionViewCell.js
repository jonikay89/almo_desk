import UIView from './UIView.js';
import UIColor from './UIColor.js';
import { NSNumber } from './Foundation.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';

class UICollectionViewCell extends UIView {
    constructor(reuseIdentifier = null) {
        super();
        this.reuseIdentifier = reuseIdentifier;
        this.imageView = null;
        this.label = null;
        this._selected = false;
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

        return this;
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
    }

    setSelected(selected) {
        this._selected = selected;
        if (selected) {
            this.element.style.borderColor = UIColor.systemBlue().css;
            this.element.style.borderWidth = '2px';
        } else {
            this.element.style.borderColor = '#ddd';
            this.element.style.borderWidth = '1px';
        }
    }

    prepareForReuse() {
        if (this.imageView) {
            this.imageView.src = '';
        }
        if (this.label) {
            this.label.textContent = '';
        }
        this._selected = false;
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
            _selected: this._selected
        };
    }

    static decode(data) {
        const cell = new UICollectionViewCell(data.reuseIdentifier);
        if (data.label) {
            cell.setLabel(data.label);
        }
        cell._selected = data._selected;
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
}

export default UICollectionViewCell;