/**
 * UIImage Test Suite
 * Tests for the UIImage class
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

class UIImage {
    constructor(imageUrl = '') {
        this.imageUrl = imageUrl;
        this.contentMode = 'fill';
        this.clipsToBounds = true;
        this.backgroundColor = '#e0e0e0';
    }

    init() {
        this.element = document.createElement('div');
        this.element.className = 'ui-image';
        this.element.style.overflow = 'hidden';
        this.element.style.backgroundColor = this.backgroundColor;
        
        this.imageElement = document.createElement('img');
        this.imageElement.style.width = '100%';
        this.imageElement.style.height = '100%';
        this.imageElement.style.objectFit = this.contentMode;
        this.imageElement.style.display = 'block';
        
        this.element.appendChild(this.imageElement);
        
        if (this.imageUrl) {
            this.imageElement.src = this.imageUrl;
        }
        
        return this;
    }

    setImage(url) {
        this.imageUrl = url;
        if (this.imageElement) {
            this.imageElement.src = url;
        }
    }

    setContentMode(mode) {
        this.contentMode = mode;
        if (this.imageElement) {
            this.imageElement.style.objectFit = mode;
        }
    }

    setBackgroundColor(color) {
        this.backgroundColor = color;
        if (this.element) {
            this.element.style.backgroundColor = color;
        }
    }
}

describe('UIImage', () => {
    let image;

    beforeEach(() => {
        image = new UIImage();
    });

    it('should initialize with default values', () => {
        assert.strictEqual(image.imageUrl, '');
        assert.strictEqual(image.contentMode, 'fill');
        assert.strictEqual(image.clipsToBounds, true);
        assert.strictEqual(image.backgroundColor, '#e0e0e0');
    });

    it('should initialize with image URL', () => {
        const imgWithUrl = new UIImage('https://example.com/image.png');
        assert.strictEqual(imgWithUrl.imageUrl, 'https://example.com/image.png');
    });

    it('should set image URL', () => {
        image.imageElement = { src: '' };
        image.setImage('https://example.com/new.png');
        assert.strictEqual(image.imageUrl, 'https://example.com/new.png');
        assert.strictEqual(image.imageElement.src, 'https://example.com/new.png');
    });

    it('should set content mode', () => {
        image.imageElement = { style: {} };
        image.setContentMode('cover');
        assert.strictEqual(image.contentMode, 'cover');
        assert.strictEqual(image.imageElement.style.objectFit, 'cover');
    });

    it('should set background color', () => {
        image.element = { style: {} };
        image.setBackgroundColor('#ff0000');
        assert.strictEqual(image.backgroundColor, '#ff0000');
        assert.strictEqual(image.element.style.backgroundColor, '#ff0000');
    });

    it('should have init method', () => {
        assert.strictEqual(typeof image.init, 'function');
    });
});
