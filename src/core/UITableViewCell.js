import UIView from './UIView.js';
import UIColor from './UIColor.js';
import { NSNumber } from './Foundation.js';
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

        if (this.image) {
            const img = document.createElement('img');
            img.src = this.image;
            img.style.width = '40px';
            img.style.height = '40px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '4px';
            img.style.marginRight = '12px';
            this.element.appendChild(img);
        }

        const textContainer = document.createElement('div');
        textContainer.style.flex = '1';
        textContainer.style.overflow = 'hidden';

        const textLabel = document.createElement('span');
        textLabel.className = 'cell-text';
        textLabel.style.fontSize = '16px';
        textLabel.style.color = '#000';
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
            detailLabel.textContent = this.detailText;
            this.detailLabel = detailLabel;
            textContainer.appendChild(detailLabel);
        }

        this.element.appendChild(textContainer);

        this.#updateAccessory();

        return this;
    }

    #updateAccessory() {
        const existingAccessory = this.element.querySelector('.accessory');
        if (existingAccessory) {
            existingAccessory.remove();
        }

        const accessory = document.createElement('div');
        accessory.className = 'accessory';
        accessory.style.marginLeft = '8px';

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
    }

    setDetailText(text) {
        this.detailText = text;
        if (this.detailLabel) {
            this.detailLabel.textContent = text;
        }
    }

    setImage(url) {
        this.image = url;
    }

    setAccessoryType(type) {
        this.accessoryType = type;
        this.#updateAccessory();
    }

    setSelectionStyle(style) {
        this.selectionStyle = style;
    }

    setSelected(selected, animated = false) {
        this._selected = selected;
        if (selected) {
            this.element.style.backgroundColor = UIColor.colorWithWhiteAlpha(0.9, 1).css;
        } else {
            this.element.style.backgroundColor = UIColor.white().css;
        }
    }

    prepareForReuse() {
        this.text = '';
        this.detailText = '';
        this.image = null;
        this.accessoryType = 'none';
        this._selected = false;
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
}

export default UITableViewCell;