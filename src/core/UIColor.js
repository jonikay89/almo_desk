import { NSNumber } from './Foundation.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';

class UIColor {
    constructor(red, green, blue, alpha = 1) {
        if (typeof red === 'string' && red.startsWith('#')) {
            const hex = red;
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            if (result) {
                this.red = parseInt(result[1], 16) / 255;
                this.green = parseInt(result[2], 16) / 255;
                this.blue = parseInt(result[3], 16) / 255;
                this.alpha = green !== undefined ? green : 1;
            } else {
                this.red = 0; this.green = 0; this.blue = 0; this.alpha = 1;
            }
        } else {
            this.red = red !== undefined ? red : 0;
            this.green = green !== undefined ? green : 0;
            this.blue = blue !== undefined ? blue : 0;
            this.alpha = alpha !== undefined ? alpha : 1;
        }
    }

    get description() {
        if (this.alpha === 0) return 'UIColor.clear';
        if (this.alpha === 1) {
            return `UIColor(red: ${this.red.toFixed(3)}, green: ${this.green.toFixed(3)}, blue: ${this.blue.toFixed(3)})`;
        }
        return `UIColor(red: ${this.red.toFixed(3)}, green: ${this.green.toFixed(3)}, blue: ${this.blue.toFixed(3)}, alpha: ${this.alpha.toFixed(3)})`;
    }

    redValue() {
        return NSNumber.of(this.red);
    }

    greenValue() {
        return NSNumber.of(this.green);
    }

    blueValue() {
        return NSNumber.of(this.blue);
    }

    alphaValue() {
        return NSNumber.of(this.alpha);
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

    static lightGray() {
        return new UIColor(0.75, 0.75, 0.75, 1);
    }

    static darkGray() {
        return new UIColor(0.25, 0.25, 0.25, 1);
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

    static yellow() {
        return new UIColor(1, 1, 0, 1);
    }

    static orange() {
        return new UIColor(1, 0.5, 0, 1);
    }

    static purple() {
        return new UIColor(0.5, 0, 0.5, 1);
    }

    static cyan() {
        return new UIColor(0, 1, 1, 1);
    }

    static magenta() {
        return new UIColor(1, 0, 1, 1);
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

    static systemOrange() {
        return new UIColor(1, 0.584, 0, 1);
    }

    static systemYellow() {
        return new UIColor(1, 0.8, 0, 1);
    }

    static systemPurple() {
        return new UIColor(0.686, 0.322, 0.871, 1);
    }

    static systemPink() {
        return new UIColor(1, 0.176, 0.333, 1);
    }

    static systemTeal() {
        return new UIColor(0.188, 0.82, 0.82, 1);
    }

    static systemIndigo() {
        return new UIColor(0.345, 0.337, 0.839, 1);
    }

    static systemBackground() {
        return new UIColor(1, 1, 1, 1);
    }

    static systemGray() {
        return new UIColor(0.5, 0.5, 0.5, 1);
    }

    static systemGray2() {
        return new UIColor(0.6, 0.6, 0.6, 1);
    }

    static systemGray3() {
        return new UIColor(0.7, 0.7, 0.7, 1);
    }

    static systemGray4() {
        return new UIColor(0.8, 0.8, 0.8, 1);
    }

    static systemGray5() {
        return new UIColor(0.9, 0.9, 0.9, 1);
    }

    static systemGray6() {
        return new UIColor(0.95, 0.95, 0.95, 1);
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

    static colorWithWhiteAlpha(white, alpha) {
        return new UIColor(white, white, white, alpha);
    }

    static colorMatching(pattern) {
        return Switch(pattern)
            .case('clear', () => UIColor.clear())
            .case('black', () => UIColor.black())
            .case('white', () => UIColor.white())
            .case('red', () => UIColor.red())
            .case('green', () => UIColor.green())
            .case('blue', () => UIColor.blue())
            .case('yellow', () => UIColor.yellow())
            .case('orange', () => UIColor.orange())
            .case('purple', () => UIColor.purple())
            .case('cyan', () => UIColor.cyan())
            .case('magenta', () => UIColor.magenta())
            .case('systemBlue', () => UIColor.systemBlue())
            .case('systemGreen', () => UIColor.systemGreen())
            .case('systemRed', () => UIColor.systemRed())
            .case('systemOrange', () => UIColor.systemOrange())
            .case('systemYellow', () => UIColor.systemYellow())
            .case('systemPurple', () => UIColor.systemPurple())
            .case('systemPink', () => UIColor.systemPink())
            .case('systemTeal', () => UIColor.systemTeal())
            .case('systemIndigo', () => UIColor.systemIndigo())
            .case('systemBackground', () => UIColor.systemBackground())
            .case('systemGray', () => UIColor.systemGray())
            .case('gray', () => UIColor.gray())
            .case('lightGray', () => UIColor.lightGray())
            .case('darkGray', () => UIColor.darkGray())
            .case(Switch.let('hex'), (m) => UIColor.colorWithHex(m))
            .default(() => UIColor.black())
            .evaluate();
    }

    static fromPattern(pattern) {
        if (typeof pattern === 'string') {
            return UIColor.colorMatching(pattern);
        }
        if (pattern && typeof pattern === 'object') {
            if (pattern.red !== undefined && pattern.green !== undefined && pattern.blue !== undefined) {
                return new UIColor(pattern.red, pattern.green, pattern.blue, pattern.alpha || 1);
            }
            if (pattern.hex) {
                return UIColor.colorWithHex(pattern.hex);
            }
            if (pattern.白色) return UIColor.white();
            if (pattern.黑色) return UIColor.black();
            if (pattern.红色) return UIColor.red();
            if (pattern.绿色) return UIColor.green();
            if (pattern.蓝色) return UIColor.blue();
        }
        return UIColor.black();
    }

    patternMatch(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        if (typeof predicate === 'object') {
            return Switch(predicate)
                .case({ alpha: 0 }, () => this.alpha === 0)
                .case({ alpha: Switch.let('a') }, (m) => Math.abs(this.alpha - m.a) < 0.001)
                .case({ red: Switch.let('r'), green: Switch.let('g'), blue: Switch.let('b') }, 
                      (m) => Math.abs(this.red - m.r) < 0.001 && 
                             Math.abs(this.green - m.g) < 0.001 && 
                             Math.abs(this.blue - m.b) < 0.001)
                .default(() => false)
                .evaluate();
        }
        return false;
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

    get hex() {
        const r = Math.round(this.red * 255).toString(16).padStart(2, '0');
        const g = Math.round(this.green * 255).toString(16).padStart(2, '0');
        const b = Math.round(this.blue * 255).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }

    get css() {
        return this.toString();
    }

    isEqual(other) {
        if (!(other instanceof UIColor)) return false;
        return this.red === other.red &&
               this.green === other.green &&
               this.blue === other.blue &&
               this.alpha === other.alpha;
    }

    encode() {
        return {
            red: this.red,
            green: this.green,
            blue: this.blue,
            alpha: this.alpha
        };
    }

    static decode(data) {
        return new UIColor(data.red, data.green, data.blue, data.alpha);
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
}

export default UIColor;