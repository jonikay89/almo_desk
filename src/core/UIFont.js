class UIFont {
    constructor(familyName, size, weight = 'normal', style = 'normal') {
        this._familyName = familyName;
        this._size = size;
        this._weight = weight;
        this._style = style;
    }

    get familyName() { return this._familyName; }
    get size() { return this._size; }
    get weight() { return this._weight; }
    get style() { return this._style; }

    get fontName() {
        return `${this._familyName}-${this._weight}`;
    }

    get pointSize() { return this._size; }

    static systemFont(size = 17, weight = 'normal') {
        return new UIFont('-apple-system, BlinkMacSystemFont, "Segoe UI"', size, weight);
    }

    static boldSystemFont(size = 17) {
        return UIFont.systemFont(size, 'bold');
    }

    static italicSystemFont(size = 17) {
        return new UIFont('-apple-system, BlinkMacSystemFont, "Segoe UI"', size, 'normal', 'italic');
    }

    static monospacedSystemFont(size = 17, weight = 'normal') {
        return new UIFont('ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace', size, weight);
    }

    static fontWithName(familyName, size) {
        return new UIFont(familyName, size);
    }

    withSize(size) {
        return new UIFont(this._familyName, size, this._weight, this._style);
    }

    withWeight(weight) {
        return new UIFont(this._familyName, this._size, weight, this._style);
    }

    withStyle(style) {
        return new UIFont(this._familyName, this._size, this._weight, style);
    }

    toCSS() {
        const style = this._style === 'italic' ? 'italic ' : '';
        return `${style}${this._weight} ${this._size}px ${this._familyName}`;
    }

    get lineHeight() {
        return this._size * 1.2;
    }

    get ascender() {
        return this._size * 0.8;
    }

    get descender() {
        return this._size * -0.2;
    }

    get capHeight() {
        return this._size * 0.7;
    }

    get xHeight() {
        return this._size * 0.5;
    }

    isEqual(other) {
        if (!(other instanceof UIFont)) return false;
        return this._familyName === other._familyName &&
               this._size === other._size &&
               this._weight === other._weight &&
               this._style === other._style;
    }

    get description() {
        return `UIFont(${this._familyName}, ${this._size}, ${this._weight})`;
    }
}

export default UIFont;
