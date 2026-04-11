import UIControl from './UIControl.js';

class UIButton extends UIControl {
    constructor(title = '') {
        super();
        this.title = title;
        this.titleColor = '#000000';
        this.highlightedTitleColor = null;
        this.selectedTitleColor = null;
        this.backgroundColor = '#f0f0f0';
        this.highlightedBackgroundColor = '#e0e0e0';
        this.selectedBackgroundColor = '#d0d0d0';
        this.borderColor = '#ccc';
        this.borderWidth = 1;
        this.borderRadius = 4;
        this.fontSize = 14;
        this.fontFamily = 'system-ui, sans-serif';
    }

    init() {
        super.init();
        this.element.className = 'ui-button';
        this.element.style.backgroundColor = this.backgroundColor;
        this.element.style.border = `${this.borderWidth}px solid ${this.borderColor}`;
        this.element.style.borderRadius = `${this.borderRadius}px`;
        this.element.style.color = this.titleColor;
        this.element.style.fontSize = `${this.fontSize}px`;
        this.element.style.fontFamily = this.fontFamily;
        this.element.style.padding = '8px 16px';
        this.element.style.textAlign = 'center';
        this.element.style.display = 'inline-block';
        
        this.titleElement = document.createElement('span');
        this.titleElement.textContent = this.title;
        this.titleElement.style.pointerEvents = 'none';
        this.element.appendChild(this.titleElement);
        
        this.element.addEventListener('mouseenter', () => this.setHighlighted(true));
        this.element.addEventListener('mouseleave', () => this.setHighlighted(false));
        this.element.addEventListener('mousedown', () => this.setHighlighted(true));
        this.element.addEventListener('mouseup', () => this.setHighlighted(false));
        
        return this;
    }

    deinit() {
        this.titleElement = null;
        super.deinit();
    }

    setTitle(title) {
        this.title = title;
        if (this.titleElement) {
            this.titleElement.textContent = title;
        }
    }

    setTitleColor(color) {
        this.titleColor = color;
        this.#updateAppearance();
    }

    setHighlightedTitleColor(color) {
        this.highlightedTitleColor = color;
        this.#updateAppearance();
    }

    setSelectedTitleColor(color) {
        this.selectedTitleColor = color;
        this.#updateAppearance();
    }

    setBackgroundColor(color) {
        this.backgroundColor = color;
        this.#updateAppearance();
    }

    setBorder(color, width = 1, radius = 4) {
        this.borderColor = color;
        this.borderWidth = width;
        this.borderRadius = radius;
        if (this.element) {
            this.element.style.border = `${width}px solid ${color}`;
            this.element.style.borderRadius = `${radius}px`;
        }
    }

    #updateAppearance() {
        if (!this.element) return;
        
        if (this.highlighted && this.highlightedBackgroundColor) {
            this.element.style.backgroundColor = this.highlightedBackgroundColor;
        } else if (this.selected && this.selectedBackgroundColor) {
            this.element.style.backgroundColor = this.selectedBackgroundColor;
        } else {
            this.element.style.backgroundColor = this.backgroundColor;
        }
        
        if (this.highlighted && this.highlightedTitleColor) {
            this.element.style.color = this.highlightedTitleColor;
        } else if (this.selected && this.selectedTitleColor) {
            this.element.style.color = this.selectedTitleColor;
        } else {
            this.element.style.color = this.titleColor;
        }
    }

    setHighlighted(highlighted) {
        super.setHighlighted(highlighted);
        this.#updateAppearance();
    }

    setSelected(selected) {
        super.setSelected(selected);
        this.#updateAppearance();
    }

    layoutSubviews() {
        super.layoutSubviews();
        if (this.element) {
            this.element.style.width = `${this.frame.width}px`;
            this.element.style.height = `${this.frame.height}px`;
        }
    }
}

export default UIButton;
