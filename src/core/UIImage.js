class UIImage {
    constructor(src = '') {
        this._src = src;
        this._image = null;
        this._size = { width: 0, height: 0 };
        if (src && typeof Image !== 'undefined') {
            this._image = new Image();
            this._image.src = src;
        }
    }

    get size() { return this._size; }

    static imageNamed(name) {
        return new UIImage(name);
    }

    static systemImage(name) {
        return new UIImage(`system:${name}`);
    }

    toDataURL() {
        if (this._image && typeof canvas !== 'undefined') {
            const canvas = document.createElement('canvas');
            canvas.width = this._image.width;
            canvas.height = this._image.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(this._image, 0, 0);
            return canvas.toDataURL();
        }
        return '';
    }
}

export default UIImage;
