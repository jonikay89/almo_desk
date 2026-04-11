import UIColor from './UIColor.js';
import UIResponder from './UIResponder.js';
import { NSValue } from './Foundation.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';

class UIView extends UIResponder {
    constructor() {
        super();
        this.superview = null;
        this.window = null;
        this._frame = { x: 0, y: 0, width: 0, height: 0 };
        this._bounds = { x: 0, y: 0, width: 0, height: 0 };
        this._center = { x: 0, y: 0 };
        this._hidden = false;
        this._alpha = 1;
        this._clipsToBounds = false;
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

    get description() {
        return `UIView(frame: {x: ${this._frame.x}, y: ${this._frame.y}, width: ${this._frame.width}, height: ${this._frame.height}})`;
    }

    frameValue() {
        return NSValue.valueWithRect(this._frame);
    }

    boundsValue() {
        return NSValue.valueWithRect(this._bounds);
    }

    centerValue() {
        return NSValue.valueWithPoint(this._center);
    }

    sizeValue() {
        return NSValue.valueWithSize({ width: this._frame.width, height: this._frame.height });
    }

    pointValue() {
        return NSValue.valueWithPoint({ x: this._frame.x, y: this._frame.y });
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

    encode() {
        return {
            frame: this._frame,
            bounds: this._bounds,
            center: this._center,
            alpha: this._alpha,
            hidden: this._hidden,
            tag: this.tag,
            zIndex: this.zIndex,
            backgroundColor: this._backgroundColor ? this._backgroundColor.hex : null
        };
    }

    static decode(data) {
        const view = new UIView();
        if (data.frame) view.frame = data.frame;
        if (data.alpha !== undefined) view.alpha = data.alpha;
        if (data.hidden !== undefined) view.hidden = data.hidden;
        if (data.tag !== undefined) view.tag = data.tag;
        if (data.zIndex !== undefined) view.zIndex = data.zIndex;
        if (data.backgroundColor) view.backgroundColor = UIColor.colorWithHex(data.backgroundColor);
        return view;
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

    ifLet(pattern) {
        return ifLet(this, pattern);
    }

    guardLet(pattern) {
        return guardLet(this, pattern);
    }

    matchView(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        return Switch(predicate)
            .case({ hidden: true }, () => this._hidden === true)
            .case({ hidden: false }, () => this._hidden === false)
            .case({ tagged: Switch.let('t') }, (m) => this.tag === m.t)
            .case({ hasSuperview: true }, () => this.superview !== null)
            .case({ hasSuperview: false }, () => this.superview === null)
            .case({ alpha: Switch.let('a') }, (m) => Math.abs(this._alpha - m.a) < 0.001)
            .default(() => false)
            .evaluate();
    }

    switch() {
        return Switch(this);
    }

    patternMatch(predicate) {
        return this.matchView(predicate);
    }
}

export default UIView;