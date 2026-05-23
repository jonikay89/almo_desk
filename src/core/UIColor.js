class UIColor {
    constructor(r = 0, g = 0, b = 0, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    static colorWithRedGreenBlueAlpha(r, g, b, a) {
        return new UIColor(r, g, b, a);
    }

    static white() {
        return new UIColor(1, 1, 1, 1);
    }

    static black() {
        return new UIColor(0, 0, 0, 1);
    }

    static clear() {
        return new UIColor(0, 0, 0, 0);
    }

    static red() {
        return new UIColor(1, 0, 0, 1);
    }

    static blue() {
        return new UIColor(0, 0, 1, 1);
    }

    static green() {
        return new UIColor(0, 1, 0, 1);
    }

    static orange() {
        return new UIColor(1, 0.5, 0, 1);
    }

    static purple() {
        return new UIColor(0.5, 0, 0.5, 1);
    }

    static yellow() {
        return new UIColor(1, 1, 0, 1);
    }

    static cyan() {
        return new UIColor(0, 1, 1, 1);
    }

    static magenta() {
        return new UIColor(1, 0, 1, 1);
    }

    static systemRed() {
        return new UIColor(1, 0.231, 0.188, 1);
    }

    static systemGreen() {
        return new UIColor(0.204, 0.78, 0.349, 1);
    }

    static systemBlue() {
        return new UIColor(0, 0.478, 1, 1);
    }

    static systemOrange() {
        return new UIColor(1, 0.584, 0, 1);
    }

    static systemYellow() {
        return new UIColor(1, 0.8, 0, 1);
    }

    static systemPink() {
        return new UIColor(1, 0.176, 0.333, 1);
    }

    static systemPurple() {
        return new UIColor(0.686, 0.322, 0.871, 1);
    }

    static systemTeal() {
        return new UIColor(0.188, 0.82, 0.878, 1);
    }

    static systemIndigo() {
        return new UIColor(0.345, 0.337, 0.839, 1);
    }

    static systemGray() {
        return new UIColor(0.5, 0.5, 0.5, 1);
    }

    static systemGray2() {
        return new UIColor(0.7, 0.7, 0.7, 1);
    }

    static systemGray3() {
        return new UIColor(0.8, 0.8, 0.8, 1);
    }

    static systemGray4() {
        return new UIColor(0.9, 0.9, 0.9, 1);
    }

    static systemGray5() {
        return new UIColor(0.95, 0.95, 0.95, 1);
    }

    static systemGray6() {
        return new UIColor(0.98, 0.98, 0.98, 1);
    }

    static linkColor() {
        return UIColor.systemBlue();
    }

    static systemBackground() {
        return new UIColor(1, 1, 1, 1);
    }

    static secondarySystemBackground() {
        return new UIColor(0.95, 0.95, 0.97, 1);
    }

    static separatorColor() {
        return new UIColor(0.78, 0.78, 0.8, 1);
    }

    static gray(value) {
        return new UIColor(value, value, value, 1);
    }

    static lightGray() {
        return new UIColor(0.75, 0.75, 0.75, 1);
    }

    static darkGray() {
        return new UIColor(0.25, 0.25, 0.25, 1);
    }

    static colorWithRed(r, g, b, a = 1) {
        return new UIColor(r, g, b, a);
    }

    static colorWithHex(hex) {
        if (!hex || hex === 'transparent') return null;
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return new UIColor(
                parseInt(result[1], 16) / 255,
                parseInt(result[2], 16) / 255,
                parseInt(result[3], 16) / 255,
                1
            );
        }
        let shortResult = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
        if (shortResult) {
            return new UIColor(
                parseInt(shortResult[1] + shortResult[1], 16) / 255,
                parseInt(shortResult[2] + shortResult[2], 16) / 255,
                parseInt(shortResult[3] + shortResult[3], 16) / 255,
                1
            );
        }
        return null;
    }

    static colorWithHSB(h, s, b, a = 1) {
        let r, g, bl;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = b * (1 - s);
        const q = b * (1 - f * s);
        const t = b * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = b; g = t; bl = p; break;
            case 1: r = q; g = b; bl = p; break;
            case 2: r = p; g = b; bl = t; break;
            case 3: r = p; g = q; bl = b; break;
            case 4: r = t; g = p; bl = b; break;
            case 5: r = b; g = p; bl = q; break;
        }
        return new UIColor(r, g, bl, a);
    }

    static colorWithString(str) {
        if (!str) return null;
        if (str.startsWith('#')) {
            return UIColor.colorWithHex(str);
        }
        if (str.startsWith('rgb')) {
            const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (match) {
                const r = parseInt(match[1]) / 255;
                const g = parseInt(match[2]) / 255;
                const b = parseInt(match[3]) / 255;
                const a = match[4] ? parseFloat(match[4]) : 1;
                return new UIColor(r, g, b, a);
            }
        }
        const namedColors = {
            'white': [1, 1, 1, 1],
            'black': [0, 0, 0, 1],
            'red': [1, 0, 0, 1],
            'green': [0, 1, 0, 1],
            'blue': [0, 0, 1, 1],
            'yellow': [1, 1, 0, 1],
            'cyan': [0, 1, 1, 1],
            'magenta': [1, 0, 1, 1],
            'orange': [1, 0.5, 0, 1],
            'purple': [0.5, 0, 0.5, 1],
            'gray': [0.5, 0.5, 0.5, 1],
            'clear': [0, 0, 0, 0]
        };
        const lower = str.toLowerCase();
        if (namedColors[lower]) {
            const [r, g, b, a] = namedColors[lower];
            return new UIColor(r, g, b, a);
        }
        return null;
    }

    get red() { return this.r; }
    get green() { return this.g; }
    get blue() { return this.b; }
    get alpha() { return this.a; }

    set red(v) { this.r = v; }
    set green(v) { this.g = v; }
    set blue(v) { this.b = v; }
    set alpha(v) { this.a = v; }

    withAlpha(a) {
        return new UIColor(this.r, this.g, this.b, a);
    }

    withRed(r) {
        return new UIColor(r, this.g, this.b, this.a);
    }

    withGreen(g) {
        return new UIColor(this.r, g, this.b, this.a);
    }

    withBlue(b) {
        return new UIColor(this.r, this.g, b, this.a);
    }

    toHex() {
        const toHexPart = (n) => Math.round(n * 255).toString(16).padStart(2, '0');
        return `#${toHexPart(this.r)}${toHexPart(this.g)}${toHexPart(this.b)}`;
    }

    toRGBAString() {
        return `rgba(${Math.round(this.r * 255)}, ${Math.round(this.g * 255)}, ${Math.round(this.b * 255)}, ${this.a})`;
    }

    toHSB() {
        const r = this.r, g = this.g, b = this.b;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        let h = 0, s = 0;
        const brightness = max;
        if (delta !== 0) {
            s = delta / max;
            if (max === r) {
                h = ((g - b) / delta) % 6;
            } else if (max === g) {
                h = (b - r) / delta + 2;
            } else {
                h = (r - g) / delta + 4;
            }
            h /= 6;
            if (h < 0) h += 1;
        }
        return { h, s, brightness };
    }

    isEqual(other) {
        if (!other) return false;
        if (!(other instanceof UIColor)) return false;
        return this.r === other.r && this.g === other.g && this.b === other.b && this.a === other.a;
    }

    get css() {
        return this.toRGBAString();
    }

    get type() {
        return 'color';
    }
}

export default UIColor;
