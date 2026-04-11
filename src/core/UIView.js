import UIColor from './UIColor.js';

class UIView {
    constructor() {
        this.superview = null;
        this.window = null;
        this._frame = { x: 0, y: 0, width: 0, height: 0 };
        this._bounds = { x: 0, y: 0, width: 0, height: 0 };
        this._center = { x: 0, y: 0 };
        this._hidden = false;
        this._alpha = 1;
        this._clipsToBounds = false;
        this.userInteractionEnabled = true;
        this.tag = 0;
        this.subviews = [];
        this.element = document.createElement('div');
        this.zIndex = 0;
        this.translatesAutoresizingMaskIntoConstraints = true;
        this._backgroundColor = null;
        this._borderColor = null;
        this._borderWidth = 0;
        this._cornerRadius = 0;
        this._layer = {
            borderColor: null,
            borderWidth: 0,
            cornerRadius: 0
        };
    }

    get frame() {
        return this._frame;
    }

    set frame(value) {
        this._frame = { x: value.x, y: value.y, width: value.width, height: value.height };
        this._bounds = { x: 0, y: 0, width: value.width, height: value.height };
        this._center = { x: value.x + value.width / 2, y: value.y + value.height / 2 };
        this.layoutSubviews();
    }

    get bounds() {
        return this._bounds;
    }

    set bounds(value) {
        this._bounds = value;
    }

    get center() {
        return this._center;
    }

    set center(value) {
        this._center = value;
    }

    get hidden() {
        return this._hidden;
    }

    set hidden(value) {
        this._hidden = value;
        if (this.element) {
            this.element.style.display = value ? 'none' : '';
        }
    }

    get alpha() {
        return this._alpha;
    }

    set alpha(value) {
        this._alpha = value;
        if (this.element) {
            this.element.style.opacity = value;
        }
    }

    get backgroundColor() {
        return this._backgroundColor;
    }

    set backgroundColor(color) {
        if (color instanceof UIColor) {
            this._backgroundColor = color;
        } else if (typeof color === 'string') {
            this._backgroundColor = UIColor.colorWithHex(color);
        } else {
            this._backgroundColor = null;
        }
        if (this.element) {
            this.element.style.backgroundColor = this._backgroundColor ? this._backgroundColor.css : '';
        }
    }

    get cornerRadius() {
        return this._cornerRadius;
    }

    set cornerRadius(radius) {
        this._cornerRadius = radius;
        if (this.element) {
            this.element.style.borderRadius = `${radius}px`;
        }
    }

    get borderWidth() {
        return this._borderWidth;
    }

    set borderWidth(width) {
        this._borderWidth = width;
        if (this.element) {
            this.element.style.borderWidth = `${width}px`;
            this.element.style.borderStyle = width > 0 ? 'solid' : 'none';
        }
    }

    get borderColor() {
        return this._borderColor;
    }

    set borderColor(color) {
        if (color instanceof UIColor) {
            this._borderColor = color;
        } else if (typeof color === 'string') {
            this._borderColor = UIColor.colorWithHex(color);
        } else {
            this._borderColor = null;
        }
        if (this.element) {
            this.element.style.borderColor = this._borderColor ? this._borderColor.css : '';
        }
    }

    get layer() {
        return this._layer;
    }

    get clipsToBounds() {
        return this._clipsToBounds;
    }

    set clipsToBounds(clips) {
        this._clipsToBounds = clips;
        if (this.element) {
            this.element.style.overflow = clips ? 'hidden' : '';
        }
    }

    init() {
        return this;
    }

    deinit() {
        for (const subview of this.subviews) {
            subview.deinit();
        }
        this.subviews = [];
        this.superview = null;
        this.window = null;
        this.element = null;
    }

    didMoveToSuperview() {}

    willMoveToWindow(window) {}

    didMoveToWindow() {}

    layoutSubviews() {
        if (this.element) {
            this.element.style.left = `${this.frame.x}px`;
            this.element.style.top = `${this.frame.y}px`;
            this.element.style.width = `${this.frame.width}px`;
            this.element.style.height = `${this.frame.height}px`;
        }
    }

    setFrame(x, y, width, height) {
        this.frame = { x, y, width, height };
    }

    addSubview(view) {
        view.removeFromSuperview();
        view.superview = this;
        this.subviews.push(view);
        if (this.element && view.element) {
            this.element.appendChild(view.element);
        }
        view.didMoveToSuperview();
    }

    removeFromSuperview() {
        if (this.superview) {
            this.superview.subviews = this.superview.subviews.filter(v => v !== this);
            if (this.element && this.superview.element) {
                this.superview.element.removeChild(this.element);
            }
            this.superview = null;
        }
    }
}

export default UIView;