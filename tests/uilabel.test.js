/**
 * UILabel Test Suite
 * Tests for the UILabel class
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

class UILabel {
    constructor(text = '') {
        this.text = text;
        this.textColor = '#000000';
        this.fontSize = 14;
        this.fontFamily = 'system-ui, sans-serif';
        this.textAlignment = 'left';
        this.numberOfLines = 1;
        this.lineBreakMode = 'ellipsis';
        this.adjustsFontSizeToFitWidth = false;
        this.minimumScaleFactor = 0.5;
    }

    init() {
        this.element = document.createElement('span');
        this.element.className = 'ui-label';
        this.element.style.display = 'inline-block';
        this.element.style.whiteSpace = 'pre-wrap';
        this.#updateText();
        this.#updateStyle();
        return this;
    }

    #updateText() {
        if (this.element) {
            this.element.textContent = this.text;
        }
    }

    #updateStyle() {
        if (this.element) {
            this.element.style.color = this.textColor;
            this.element.style.fontSize = `${this.fontSize}px`;
            this.element.style.fontFamily = this.fontFamily;
            this.element.style.textAlign = this.textAlignment;
        }
    }

    setText(text) {
        this.text = text;
        this.#updateText();
    }

    setTextColor(color) {
        this.textColor = color;
        this.#updateStyle();
    }

    setFontSize(size) {
        this.fontSize = size;
        this.#updateStyle();
    }
}

describe('UILabel', () => {
    let label;

    beforeEach(() => {
        label = new UILabel('Hello');
    });

    it('should initialize with default values', () => {
        assert.strictEqual(label.text, 'Hello');
        assert.strictEqual(label.textColor, '#000000');
        assert.strictEqual(label.fontSize, 14);
        assert.strictEqual(label.textAlignment, 'left');
        assert.strictEqual(label.numberOfLines, 1);
    });

    it('should initialize without text', () => {
        const emptyLabel = new UILabel();
        assert.strictEqual(emptyLabel.text, '');
    });

    it('should update text', () => {
        label.element = { textContent: '' };
        label.setText('World');
        assert.strictEqual(label.text, 'World');
        assert.strictEqual(label.element.textContent, 'World');
    });

    it('should update text color', () => {
        label.element = { style: {} };
        label.setTextColor('#ff0000');
        assert.strictEqual(label.textColor, '#ff0000');
        assert.strictEqual(label.element.style.color, '#ff0000');
    });

    it('should update font size', () => {
        label.element = { style: {} };
        label.setFontSize(18);
        assert.strictEqual(label.fontSize, 18);
        assert.strictEqual(label.element.style.fontSize, '18px');
    });

    it('should have init method', () => {
        assert.strictEqual(typeof label.init, 'function');
    });
});
