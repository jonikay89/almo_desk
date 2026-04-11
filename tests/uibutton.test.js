/**
 * UIButton Test Suite
 * Tests for the UIButton class
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

class UIControl {
    constructor() {
        this.enabled = true;
        this.selected = false;
        this.highlighted = false;
    }

    init() {
        this.element = document.createElement('div');
        return this;
    }

    setHighlighted(highlighted) {
        this.highlighted = highlighted;
    }

    setSelected(selected) {
        this.selected = selected;
    }
}

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
        return this;
    }

    setTitle(title) {
        this.title = title;
        if (this.titleElement) {
            this.titleElement.textContent = title;
        }
    }

    setTitleColor(color) {
        this.titleColor = color;
    }

    setBackgroundColor(color) {
        this.backgroundColor = color;
        if (this.element) {
            this.element.style.backgroundColor = color;
        }
    }
}

describe('UIButton', () => {
    let button;

    beforeEach(() => {
        button = new UIButton('Click Me');
    });

    it('should initialize with default values', () => {
        assert.strictEqual(button.title, 'Click Me');
        assert.strictEqual(button.titleColor, '#000000');
        assert.strictEqual(button.backgroundColor, '#f0f0f0');
        assert.strictEqual(button.borderColor, '#ccc');
        assert.strictEqual(button.borderWidth, 1);
        assert.strictEqual(button.borderRadius, 4);
        assert.strictEqual(button.fontSize, 14);
    });

    it('should initialize without title', () => {
        const emptyButton = new UIButton();
        assert.strictEqual(emptyButton.title, '');
    });

    it('should set title', () => {
        button.titleElement = { textContent: '' };
        button.setTitle('New Title');
        assert.strictEqual(button.title, 'New Title');
        assert.strictEqual(button.titleElement.textContent, 'New Title');
    });

    it('should set title color', () => {
        button.setTitleColor('#ff0000');
        assert.strictEqual(button.titleColor, '#ff0000');
    });

    it('should set background color', () => {
        button.element = { style: {} };
        button.setBackgroundColor('#ff0000');
        assert.strictEqual(button.backgroundColor, '#ff0000');
        assert.strictEqual(button.element.style.backgroundColor, '#ff0000');
    });

    it('should have init method', () => {
        assert.strictEqual(typeof button.init, 'function');
    });

    it('should inherit from UIControl', () => {
        assert.ok(button instanceof UIControl);
    });
});
