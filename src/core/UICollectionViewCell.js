import UIView from './UIView.js';
import UIColor from './UIColor.js';

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
}

export default UICollectionViewCell;