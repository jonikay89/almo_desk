/**
 * UIColor Test Suite
 * Tests for the UIColor class
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';

class UIColor {
    constructor(red, green, blue, alpha = 1) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    }

    static clear() {
        return new UIColor(0, 0, 0, 0);
    }

    static black() {
        return new UIColor(0, 0, 0, 1);
    }

    static white() {
        return new UIColor(1, 1, 1, 1);
    }

    static gray() {
        return new UIColor(0.5, 0.5, 0.5, 1);
    }

    static red() {
        return new UIColor(1, 0, 0, 1);
    }

    static green() {
        return new UIColor(0, 1, 0, 1);
    }

    static blue() {
        return new UIColor(0, 0, 1, 1);
    }

    static systemBlue() {
        return new UIColor(0, 0.478, 1, 1);
    }

    static systemGreen() {
        return new UIColor(0.204, 0.78, 0.349, 1);
    }

    static systemRed() {
        return new UIColor(1, 0.231, 0.188, 1);
    }

    static colorWithRedGreenBlueAlpha(red, green, blue, alpha) {
        return new UIColor(red, green, blue, alpha);
    }

    static colorWithHex(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return new UIColor(
                parseInt(result[1], 16) / 255,
                parseInt(result[2], 16) / 255,
                parseInt(result[3], 16) / 255,
                1
            );
        }
        return UIColor.black();
    }

    toString() {
        if (this.alpha === 0) return 'transparent';
        const r = Math.round(this.red * 255);
        const g = Math.round(this.green * 255);
        const b = Math.round(this.blue * 255);
        if (this.alpha === 1) {
            return `rgb(${r}, ${g}, ${b})`;
        }
        return `rgba(${r}, ${g}, ${b}, ${this.alpha})`;
    }

    withAlpha(alpha) {
        return new UIColor(this.red, this.green, this.blue, alpha);
    }

    get css() {
        return this.toString();
    }
}

describe('UIColor', () => {
    it('should create black color', () => {
        const color = UIColor.black();
        assert.strictEqual(color.red, 0);
        assert.strictEqual(color.green, 0);
        assert.strictEqual(color.blue, 0);
        assert.strictEqual(color.alpha, 1);
    });

    it('should create white color', () => {
        const color = UIColor.white();
        assert.strictEqual(color.red, 1);
        assert.strictEqual(color.green, 1);
        assert.strictEqual(color.blue, 1);
        assert.strictEqual(color.alpha, 1);
    });

    it('should create clear color', () => {
        const color = UIColor.clear();
        assert.strictEqual(color.red, 0);
        assert.strictEqual(color.green, 0);
        assert.strictEqual(color.blue, 0);
        assert.strictEqual(color.alpha, 0);
    });

    it('should create gray color', () => {
        const color = UIColor.gray();
        assert.strictEqual(color.red, 0.5);
        assert.strictEqual(color.green, 0.5);
        assert.strictEqual(color.blue, 0.5);
        assert.strictEqual(color.alpha, 1);
    });

    it('should create red color', () => {
        const color = UIColor.red();
        assert.strictEqual(color.red, 1);
        assert.strictEqual(color.green, 0);
        assert.strictEqual(color.blue, 0);
        assert.strictEqual(color.alpha, 1);
    });

    it('should create system blue color', () => {
        const color = UIColor.systemBlue();
        assert.strictEqual(color.red, 0);
        assert.strictEqual(color.green, 0.478);
        assert.strictEqual(color.blue, 1);
        assert.strictEqual(color.alpha, 1);
    });

    it('should convert to rgb string', () => {
        const color = UIColor.red();
        assert.strictEqual(color.toString(), 'rgb(255, 0, 0)');
    });

    it('should convert to rgba string', () => {
        const color = UIColor.red().withAlpha(0.5);
        assert.strictEqual(color.toString(), 'rgba(255, 0, 0, 0.5)');
    });

    it('should create color from hex', () => {
        const color = UIColor.colorWithHex('#ff0000');
        assert.strictEqual(color.red, 1);
        assert.strictEqual(color.green, 0);
        assert.strictEqual(color.blue, 0);
    });

    it('should create color with RGBA', () => {
        const color = UIColor.colorWithRedGreenBlueAlpha(0.5, 0.5, 0.5, 0.5);
        assert.strictEqual(color.red, 0.5);
        assert.strictEqual(color.green, 0.5);
        assert.strictEqual(color.blue, 0.5);
        assert.strictEqual(color.alpha, 0.5);
    });

    it('should return css property', () => {
        const color = UIColor.black();
        assert.strictEqual(color.css, 'rgb(0, 0, 0)');
    });

    it('should return transparent for clear color', () => {
        const color = UIColor.clear();
        assert.strictEqual(color.toString(), 'transparent');
    });
});
