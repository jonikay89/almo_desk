import UIColor from './UIColor.js';

class UIView {
    constructor() {
        this.superview = null;
        this.window = null;
        this.frame = { x: 0, y: 0, width: 0, height: 0 };
        this.bounds = { x: 0, y: 0, width: 0, height: 0 };
        this.center = { x: 0, y: 0 };
        this.alpha = 1;
        this.hidden = false;
        this.clipsToBounds = false;
        this.userInteractionEnabled = true;
        this.tag = 0;
        this.subviews = [];
        this.element = document.createElement('div');
        this.zIndex = 0;
        this.translatesAutoresizingMaskIntoConstraints = true;
        this.flexWidth = false;
        this.flexHeight = false;
        this._backgroundColor = null;
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

    setBackgroundColor(color) {
        this.backgroundColor = color;
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

    layoutSubviews() {}

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

    setFrame(x, y, width, height) {
        this.frame = { x, y, width, height };
        this.bounds = { x: 0, y: 0, width, height };
        this.center = { x: x + width / 2, y: y + height / 2 };
        this.layoutSubviews();
    }

    setHidden(hidden) {
        this.hidden = hidden;
        if (this.element) {
            this.element.style.display = hidden ? 'none' : '';
        }
    }

    setAlpha(alpha) {
        this.alpha = alpha;
        if (this.element) {
            this.element.style.opacity = alpha;
        }
    }

    setFlexibleWidth(flexible) {
        this.flexWidth = flexible;
        if (this.element) {
            this.element.style.flexGrow = flexible ? 1 : 0;
            this.element.style.flexShrink = flexible ? 1 : 0;
        }
    }

    setFlexibleHeight(flexible) {
        this.flexHeight = flexible;
        if (this.element) {
            this.element.style.flexGrow = flexible ? 1 : 0;
            this.element.style.flexShrink = flexible ? 1 : 0;
        }
    }

    setFlexibile(flexible) {
        this.setFlexibleWidth(flexible);
        this.setFlexibleHeight(flexible);
    }
}

export default UIView;
