import UIControl from './UIControl.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';

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

        const bgResult = Switch({ highlighted: this.highlighted, selected: this.selected })
            .case({ highlighted: true, selected: Switch.Wildcard }, 
                  () => this.highlightedBackgroundColor || this.backgroundColor)
            .case({ highlighted: false, selected: true }, 
                  () => this.selectedBackgroundColor || this.backgroundColor)
            .default(() => this.backgroundColor)
            .evaluate();
        this.element.style.backgroundColor = bgResult;

        const colorResult = Switch({ highlighted: this.highlighted, selected: this.selected })
            .case({ highlighted: true, selected: Switch.Wildcard }, 
                  () => this.highlightedTitleColor || this.titleColor)
            .case({ highlighted: false, selected: true }, 
                  () => this.selectedTitleColor || this.titleColor)
            .default(() => this.titleColor)
            .evaluate();
        this.element.style.color = colorResult;
    }

    #getStateDescription() {
        return Switch({ highlighted: this.highlighted, selected: this.selected, enabled: this.enabled })
            .case({ highlighted: true, selected: true }, () => 'highlighted+selected')
            .case({ highlighted: true, selected: false }, () => 'highlighted')
            .case({ highlighted: false, selected: true }, () => 'selected')
            .case({ enabled: false }, () => 'disabled')
            .default(() => 'normal')
            .evaluate();
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
            .case({ title: Switch.let('t') }, (m) => this.title === m.t)
            .case({ hasTitle: true }, () => !!this.title)
            .case({ hasTitle: false }, () => !this.title)
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
}

export default UIButton;
