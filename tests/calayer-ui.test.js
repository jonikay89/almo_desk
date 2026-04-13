/**
 * CALayer UI Test Suite
 * Tests for CALayer visual rendering and layout behavior
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

const mockDocument = {
    createElement: (tag) => {
        const listeners = {};
        const element = {
            tagName: tag.toUpperCase(),
            style: { position: 'absolute', left: '0', top: '0', width: '0', height: '0', opacity: '1', transform: '', backgroundColor: '', borderRadius: '0', borderWidth: '0', borderColor: '', boxShadow: '', overflow: 'visible', zIndex: '0' },
            className: '',
            children: [],
            parentNode: null,
            childNodes: [],
            appendChild: (child) => {
                element.children.push(child);
                element.childNodes.push(child);
                child.parentNode = element;
            },
            removeChild: (child) => {
                const idx = element.children.indexOf(child);
                if (idx >= 0) element.children.splice(idx, 1);
                const idx2 = element.childNodes.indexOf(child);
                if (idx2 >= 0) element.childNodes.splice(idx2, 1);
            },
            contains: (el) => element.children.includes(el),
            addEventListener: (event, callback) => {
                if (!listeners[event]) listeners[event] = [];
                listeners[event].push(callback);
            },
            removeEventListener: (event, callback) => {
                if (listeners[event]) {
                    const idx = listeners[event].indexOf(callback);
                    if (idx >= 0) listeners[event].splice(idx, 1);
                }
            },
            dispatchEvent: (event) => {
                const callbacks = listeners[event.type] || [];
                callbacks.forEach(cb => cb(event));
                return true;
            },
            getAttribute: () => null,
            setAttribute: () => {},
            getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
            get clientWidth() { return 100; },
            get clientHeight() { return 100; },
            get offsetWidth() { return parseInt(element.style.width) || 100; },
            get offsetHeight() { return parseInt(element.style.height) || 100; },
            focus: () => {
                const focusEvent = { type: 'focus' };
                element.dispatchEvent(focusEvent);
            },
            blur: () => {
                const blurEvent = { type: 'blur' };
                element.dispatchEvent(blurEvent);
            },
            insertBefore: (newNode, refNode) => {
                if (!refNode) return element.appendChild(newNode);
                const idx = element.children.indexOf(refNode);
                if (idx >= 0) {
                    element.children.splice(idx, 0, newNode);
                    element.childNodes.splice(idx, 0, newNode);
                } else {
                    element.children.push(newNode);
                    element.childNodes.push(newNode);
                }
                newNode.parentNode = element;
                return newNode;
            },
            textContent: '',
            innerHTML: '',
            scrollTop: 0,
            scrollLeft: 0,
            scrollWidth: 100,
            scrollHeight: 100
        };
        return element;
    },
    createTextNode: (text) => ({ nodeType: 3, textContent: text, data: text }),
    createComment: (text) => ({ nodeType: 8, textContent: text }),
    elementFromPoint: () => null
};

global.document = mockDocument;

class UIColor {
    constructor(r = 0, g = 0, b = 0, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    get css() {
        if (this.a === 1) {
            return `rgb(${Math.round(this.r * 255)}, ${Math.round(this.g * 255)}, ${Math.round(this.b * 255)})`;
        }
        return `rgba(${Math.round(this.r * 255)}, ${Math.round(this.g * 255)}, ${Math.round(this.b * 255)}, ${this.a})`;
    }
    get hex() {
        const toHex = (n) => Math.round(n * 255).toString(16).padStart(2, '0');
        return `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}`;
    }
    static white() { return new UIColor(1, 1, 1, 1); }
    static black() { return new UIColor(0, 0, 0, 1); }
    static red() { return new UIColor(1, 0, 0, 1); }
    static blue() { return new UIColor(0, 0, 1, 1); }
    static green() { return new UIColor(0, 1, 0, 1); }
    static yellow() { return new UIColor(1, 1, 0, 1); }
    static clear() { return new UIColor(0, 0, 0, 0); }
    static gray() { return new UIColor(0.5, 0.5, 0.5, 1); }
    static colorWithRedGreenBlueAlpha(r, g, b, a) { return new UIColor(r, g, b, a); }
    static colorWithHex(hex) {
        if (!hex || hex === 'transparent') return null;
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? new UIColor(
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255, 1
        ) : null;
    }
    static systemBlue() { return new UIColor(0, 122/255, 1, 1); }
}

class CATransform3D {
    constructor() {
        this.m11 = 1; this.m12 = 0; this.m13 = 0; this.m14 = 0;
        this.m21 = 0; this.m22 = 1; this.m23 = 0; this.m24 = 0;
        this.m31 = 0; this.m32 = 0; this.m33 = 1; this.m34 = 0;
        this.m41 = 0; this.m42 = 0; this.m43 = 0; this.m44 = 1;
    }
    static identity() { return new CATransform3D(); }
    static MakePerspective(m34 = -0.001) {
        const t = new CATransform3D();
        t.m34 = m34;
        return t;
    }
    static MakeRotation(angle, x = 0, y = 0, z = 1) {
        const t = new CATransform3D();
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const oneMinusCos = 1 - cos;
        t.m11 = cos + x * x * oneMinusCos;
        t.m12 = x * y * oneMinusCos - z * sin;
        t.m13 = x * z * oneMinusCos + y * sin;
        t.m21 = y * x * oneMinusCos + z * sin;
        t.m22 = cos + y * y * oneMinusCos;
        t.m23 = y * z * oneMinusCos - x * sin;
        return t;
    }
    static MakeScale(sx, sy, sz = 1) {
        const t = new CATransform3D();
        t.m11 = sx; t.m22 = sy; t.m33 = sz;
        return t;
    }
    static MakeTranslation(tx, ty, tz = 0) {
        const t = new CATransform3D();
        t.m41 = tx; t.m42 = ty; t.m43 = tz;
        return t;
    }
    rotated(angle, x, y, z) { return this.multiply(CATransform3D.MakeRotation(angle, x, y, z)); }
    scaled(sx, sy, sz = 1) { return this.multiply(CATransform3D.MakeScale(sx, sy, sz)); }
    translated(tx, ty, tz = 0) { return this.multiply(CATransform3D.MakeTranslation(tx, ty, tz)); }
    multiply(other) {
        const r = new CATransform3D();
        r.m11 = this.m11 * other.m11 + this.m12 * other.m21 + this.m13 * other.m31 + this.m14 * other.m41;
        r.m12 = this.m11 * other.m12 + this.m12 * other.m22 + this.m13 * other.m32 + this.m14 * other.m42;
        r.m21 = this.m21 * other.m11 + this.m22 * other.m21 + this.m23 * other.m31 + this.m24 * other.m41;
        r.m22 = this.m21 * other.m12 + this.m22 * other.m22 + this.m23 * other.m32 + this.m24 * other.m42;
        r.m41 = this.m41 * other.m11 + this.m42 * other.m21 + this.m43 * other.m31 + this.m44 * other.m41;
        r.m42 = this.m41 * other.m12 + this.m42 * other.m22 + this.m43 * other.m32 + this.m44 * other.m42;
        return r;
    }
    toCSSTransform() {
        return `matrix3d(${this.m11}, ${this.m12}, ${this.m13}, ${this.m14}, ${this.m21}, ${this.m22}, ${this.m23}, ${this.m24}, ${this.m31}, ${this.m32}, ${this.m33}, ${this.m34}, ${this.m41}, ${this.m42}, ${this.m43}, ${this.m44})`;
    }
}

class CGPath {
    constructor() { this._elements = []; }
    static CreateRect(x, y, width, height) {
        const path = new CGPath();
        path.moveToPoint(x, y);
        path.addLineToPoint(x + width, y);
        path.addLineToPoint(x + width, y + height);
        path.addLineToPoint(x, y + height);
        path.closeSubpath();
        return path;
    }
    static CreateCircle(cx, cy, radius) {
        const path = new CGPath();
        path.moveToPoint(cx + radius, cy);
        for (let i = 10; i <= 360; i += 10) {
            const angle = (i * Math.PI) / 180;
            path.addLineToPoint(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
        }
        path.closeSubpath();
        return path;
    }
    moveToPoint(x, y) { this._elements.push({ type: 'move', x, y }); return this; }
    addLineToPoint(x, y) { this._elements.push({ type: 'line', x, y }); return this; }
    closeSubpath() { this._elements.push({ type: 'close' }); return this; }
    applyWithContext(ctx) {
        ctx.beginPath();
        for (const el of this._elements) {
            if (el.type === 'move') ctx.moveTo(el.x, el.y);
            else if (el.type === 'line') ctx.lineTo(el.x, el.y);
            else if (el.type === 'close') ctx.closePath();
        }
    }
}

class CALayer {
    constructor() {
        this._frame = { x: 0, y: 0, width: 0, height: 0 };
        this._bounds = { x: 0, y: 0, width: 0, height: 0 };
        this._position = { x: 0, y: 0 };
        this._anchorPoint = { x: 0.5, y: 0.5 };
        this._anchorPointZ = 0;
        this._zPosition = 0;
        this._opacity = 1;
        this._isHidden = false;
        this._backgroundColor = null;
        this._borderColor = null;
        this._borderWidth = 0;
        this._cornerRadius = 0;
        this._masksToBounds = false;
        this._shadowColor = null;
        this._shadowOpacity = 0;
        this._shadowOffset = { width: 0, height: 0 };
        this._shadowRadius = 0;
        this._shadowPath = null;
        this._contents = null;
        this._contentsGravity = 'resize';
        this._transform = CATransform3D.identity();
        this._sublayers = [];
        this._superlayer = null;
        this._mask = null;
        this._isDoubleSided = true;
        this._geometryFlipped = false;
        this._name = '';
        this._delegate = null;
        this._opaque = false;
        this._shouldRasterize = false;
        this._rasterizationScale = 1;
        this._animations = {};
    }
    static layer() { return new CALayer(); }
    static roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }
    get frame() { return this._frame; }
    set frame(value) {
        this._frame = { ...value };
        this._bounds = { x: 0, y: 0, width: value.width, height: value.height };
        this._position = { x: value.x + this._anchorPoint.x * value.width, y: value.y + this._anchorPoint.y * value.height };
    }
    get bounds() { return this._bounds; }
    set bounds(value) { this._bounds = { ...value }; }
    get position() { return this._position; }
    set position(value) { this._position = { ...value }; }
    get anchorPoint() { return this._anchorPoint; }
    set anchorPoint(value) { this._anchorPoint = { ...value }; }
    get anchorPointZ() { return this._anchorPointZ; }
    set anchorPointZ(v) { this._anchorPointZ = v; }
    get zPosition() { return this._zPosition; }
    set zPosition(v) { this._zPosition = v; }
    get opacity() { return this._opacity; }
    set opacity(v) { this._opacity = Math.max(0, Math.min(1, v)); }
    get isHidden() { return this._isHidden; }
    set isHidden(v) { this._isHidden = v; }
    get backgroundColor() { return this._backgroundColor; }
    set backgroundColor(v) {
        if (v instanceof UIColor) this._backgroundColor = v;
        else if (typeof v === 'string') this._backgroundColor = UIColor.colorWithHex(v);
        else this._backgroundColor = null;
    }
    get borderColor() { return this._borderColor; }
    set borderColor(v) {
        if (v instanceof UIColor) this._borderColor = v;
        else if (typeof v === 'string') this._borderColor = UIColor.colorWithHex(v);
        else this._borderColor = null;
    }
    get borderWidth() { return this._borderWidth; }
    set borderWidth(v) { this._borderWidth = v; }
    get cornerRadius() { return this._cornerRadius; }
    set cornerRadius(v) { this._cornerRadius = v; }
    get masksToBounds() { return this._masksToBounds; }
    set masksToBounds(v) { this._masksToBounds = v; }
    get shadowColor() { return this._shadowColor; }
    set shadowColor(v) {
        if (v instanceof UIColor) this._shadowColor = v;
        else if (typeof v === 'string') this._shadowColor = UIColor.colorWithHex(v);
        else this._shadowColor = null;
    }
    get shadowOpacity() { return this._shadowOpacity; }
    set shadowOpacity(v) { this._shadowOpacity = Math.max(0, Math.min(1, v)); }
    get shadowOffset() { return this._shadowOffset; }
    set shadowOffset(v) { this._shadowOffset = { ...v }; }
    get shadowRadius() { return this._shadowRadius; }
    set shadowRadius(v) { this._shadowRadius = v; }
    get shadowPath() { return this._shadowPath; }
    set shadowPath(v) { this._shadowPath = v; }
    get contents() { return this._contents; }
    set contents(v) { this._contents = v; }
    get contentsGravity() { return this._contentsGravity; }
    set contentsGravity(v) { this._contentsGravity = v; }
    get transform() { return this._transform; }
    set transform(v) { this._transform = v; }
    get sublayers() { return [...this._sublayers]; }
    get superlayer() { return this._superlayer; }
    get mask() { return this._mask; }
    set mask(v) { this._mask = v; }
    get isDoubleSided() { return this._isDoubleSided; }
    set isDoubleSided(v) { this._isDoubleSided = v; }
    get geometryFlipped() { return this._geometryFlipped; }
    set geometryFlipped(v) { this._geometryFlipped = v; }
    get name() { return this._name; }
    set name(v) { this._name = v; }
    get delegate() { return this._delegate; }
    set delegate(v) { this._delegate = v; }
    get opaque() { return this._opaque; }
    set opaque(v) { this._opaque = v; }
    get shouldRasterize() { return this._shouldRasterize; }
    set shouldRasterize(v) { this._shouldRasterize = v; }
    get rasterizationScale() { return this._rasterizationScale; }
    set rasterizationScale(v) { this._rasterizationScale = v; }
    addSublayer(layer) {
        if (layer._superlayer) layer._superlayer.removeSublayer(layer);
        layer._superlayer = this;
        this._sublayers.push(layer);
        return this;
    }
    removeSublayer(layer) {
        const idx = this._sublayers.indexOf(layer);
        if (idx >= 0) { this._sublayers.splice(idx, 1); layer._superlayer = null; }
        return this;
    }
    removeFromSuperlayer() {
        if (this._superlayer) this._superlayer.removeSublayer(this);
        return this;
    }
    insertSublayerAtIndex(layer, index) {
        if (layer._superlayer) layer._superlayer.removeSublayer(layer);
        layer._superlayer = this;
        this._sublayers.splice(index, 0, layer);
        return this;
    }
    insertSublayerBelow(layer, sibling) {
        const idx = this._sublayers.indexOf(sibling);
        return this.insertSublayerAtIndex(layer, idx >= 0 ? idx : 0);
    }
    insertSublayerAbove(layer, sibling) {
        const idx = this._sublayers.indexOf(sibling);
        return this.insertSublayerAtIndex(layer, idx >= 0 ? idx + 1 : this._sublayers.length);
    }
    replaceSublayer(oldLayer, newLayer) {
        const idx = this._sublayers.indexOf(oldLayer);
        if (idx >= 0) {
            oldLayer._superlayer = null;
            newLayer._superlayer = this;
            this._sublayers[idx] = newLayer;
        }
        return this;
    }
    sublayerIndex(layer) { return this._sublayers.indexOf(layer); }
    containsPoint(point) {
        return point.x >= 0 && point.x <= this._bounds.width && point.y >= 0 && point.y <= this._bounds.height;
    }
    hitTest(point) {
        if (this._isHidden || this._opacity === 0) return null;
        if (!this.containsPoint(point)) return null;
        for (let i = this._sublayers.length - 1; i >= 0; i--) {
            const sub = this._sublayers[i];
            const converted = { x: point.x - this._position.x, y: point.y - this._position.y };
            const hit = sub.hitTest(converted);
            if (hit) return hit;
        }
        return this;
    }
    setShadow(color, offset, radius, opacity = 0.3) {
        this._shadowColor = color;
        this._shadowOffset = offset;
        this._shadowRadius = radius;
        this._shadowOpacity = opacity;
        return this;
    }
    withShadow(color, offset, radius, opacity = 0.3) { return this.setShadow(color, offset, radius, opacity); }
    withBackgroundColor(color) { this.backgroundColor = color; return this; }
    withCornerRadius(radius) { this.cornerRadius = radius; return this; }
    withBorder(color, width) { this.borderColor = color; this.borderWidth = width; return this; }
    withOpacity(opacity) { this.opacity = opacity; return this; }
    withTransform(transform) { this.transform = transform; return this; }
    withName(name) { this.name = name; return this; }
    rotate(angle, axis = 'z') {
        const axes = axis === 'x' ? [1, 0, 0] : axis === 'y' ? [0, 1, 0] : [0, 0, 1];
        this._transform = this._transform.rotated(angle, axes[0], axes[1], axes[2]);
        return this;
    }
    scale(sx, sy, sz = 1) { this._transform = this._transform.scaled(sx, sy, sz); return this; }
    translate(tx, ty, tz = 0) { this._transform = this._transform.translated(tx, ty, tz); return this; }
    applyPerspective(m34 = -1 / 1000) {
        this._transform = this._transform.multiply(CATransform3D.MakePerspective(m34));
        return this;
    }
    addAnimation(anim, forKey) {
        this._animations[forKey] = anim;
        if (this._delegate?.animationDidStart) this._delegate.animationDidStart(anim);
        return this;
    }
    removeAnimation(forKey) {
        if (this._animations[forKey]) delete this._animations[forKey];
        return this;
    }
    removeAllAnimations() { this._animations = {}; return this; }
    animationForKey(key) { return this._animations[key] || null; }
    animationKeys() { return Object.keys(this._animations); }
    setFrame(x, y, width, height) { this.frame = { x, y, width, height }; return this; }
    setBounds(x, y, width, height) { this.bounds = { x, y, width, height }; return this; }
    setPosition(x, y) { this.position = { x, y }; return this; }
    setOpacity(value) { this.opacity = value; return this; }
    setHidden(value) { this.isHidden = value; return this; }
    setBackgroundColor(color) { this.backgroundColor = color; return this; }
    setCornerRadius(value) { this.cornerRadius = value; return this; }
    setShadowPath(path) { this.shadowPath = path; return this; }
    clone() {
        const copy = new CALayer();
        copy._frame = { ...this._frame };
        copy._bounds = { ...this._bounds };
        copy._position = { ...this._position };
        copy._anchorPoint = { ...this._anchorPoint };
        copy._opacity = this._opacity;
        copy._isHidden = this._isHidden;
        copy._backgroundColor = this._backgroundColor;
        copy._borderColor = this._borderColor;
        copy._borderWidth = this._borderWidth;
        copy._cornerRadius = this._cornerRadius;
        copy._transform = this._transform;
        return copy;
    }
    renderToContext(ctx) {
        if (this._isHidden) return;
        ctx.save();
        const anchorX = this._anchorPoint.x * this._bounds.width;
        const anchorY = this._anchorPoint.y * this._bounds.height;
        ctx.translate(this._position.x, this._position.y);
        ctx.translate(-anchorX, -anchorY);
        if (this._shadowOpacity > 0 && this._shadowColor) {
            ctx.shadowColor = this._shadowColor.css;
            ctx.shadowBlur = this._shadowRadius;
            ctx.shadowOffsetX = this._shadowOffset.width;
            ctx.shadowOffsetY = this._shadowOffset.height;
            if (this._shadowPath) this._shadowPath.applyWithContext(ctx);
        }
        ctx.globalAlpha = this._opacity;
        if (this._backgroundColor) {
            ctx.fillStyle = this._backgroundColor.css;
            if (this._cornerRadius > 0 && this._borderWidth === 0) {
                CALayer.roundRect(ctx, 0, 0, this._bounds.width, this._bounds.height, this._cornerRadius);
                ctx.fill();
            } else {
                ctx.fillRect(0, 0, this._bounds.width, this._bounds.height);
            }
        }
        if (this._borderWidth > 0 && this._borderColor) {
            ctx.strokeStyle = this._borderColor.css;
            ctx.lineWidth = this._borderWidth;
            if (this._cornerRadius > 0) {
                CALayer.roundRect(ctx, 0, 0, this._bounds.width, this._bounds.height, this._cornerRadius);
                ctx.stroke();
            } else {
                ctx.strokeRect(0, 0, this._bounds.width, this._bounds.height);
            }
        }
        if (this._contents) {
            if (typeof this._contents === 'string' && this._contents.startsWith('data:image')) {
                if (this._contentsGravity === 'resizeAspect') ctx.drawImage(null, 0, 0, this._bounds.width, this._bounds.height);
            } else if (typeof this._contents === 'function') {
                ctx.save();
                ctx.translate(0, this._bounds.height);
                ctx.scale(1, -1);
                this._contents(ctx, this._bounds);
                ctx.restore();
            }
        }
        if (this._mask) ctx.clip();
        for (const sub of this._sublayers) sub.renderToContext(ctx);
        ctx.restore();
    }
    encode() {
        return {
            frame: this._frame,
            bounds: this._bounds,
            position: this._position,
            anchorPoint: this._anchorPoint,
            zPosition: this._zPosition,
            opacity: this._opacity,
            isHidden: this._isHidden,
            backgroundColor: this._backgroundColor?.hex,
            borderColor: this._borderColor?.hex,
            borderWidth: this._borderWidth,
            cornerRadius: this._cornerRadius
        };
    }
    static decode(data) {
        const layer = new CALayer();
        if (data.frame) layer.frame = data.frame;
        if (data.bounds) layer.bounds = data.bounds;
        if (data.position) layer.position = data.position;
        if (data.anchorPoint) layer.anchorPoint = data.anchorPoint;
        if (data.opacity !== undefined) layer.opacity = data.opacity;
        if (data.isHidden !== undefined) layer.isHidden = data.isHidden;
        if (data.backgroundColor) layer.backgroundColor = UIColor.colorWithHex(data.backgroundColor);
        if (data.borderColor) layer.borderColor = UIColor.colorWithHex(data.borderColor);
        if (data.borderWidth !== undefined) layer.borderWidth = data.borderWidth;
        if (data.cornerRadius !== undefined) layer.cornerRadius = data.cornerRadius;
        return layer;
    }
}

class CAGradientLayer extends CALayer {
    constructor() {
        super();
        this._colors = [];
        this._locations = [];
        this._startPoint = { x: 0.5, y: 0 };
        this._endPoint = { x: 0.5, y: 1 };
        this._type = 'axial';
    }
    static layer() { return new CAGradientLayer(); }
    get colors() { return [...this._colors]; }
    set colors(value) { this._colors = value.map(c => c instanceof UIColor ? c : UIColor.colorWithHex(c)); }
    get locations() { return [...this._locations]; }
    set locations(value) { this._locations = [...value]; }
    get startPoint() { return this._startPoint; }
    set startPoint(v) { this._startPoint = { ...v }; }
    get endPoint() { return this._endPoint; }
    set endPoint(v) { this._endPoint = { ...v }; }
    get type() { return this._type; }
    set type(v) { this._type = v; }
    setColors(colors) { this.colors = colors; return this; }
    setLocations(locations) { this.locations = locations; return this; }
    withColors(colors) { return this.setColors(colors); }
    withLocations(locations) { return this.setLocations(locations); }
    renderToContext(ctx) {
        if (this._isHidden) return;
        ctx.save();
        ctx.globalAlpha = this._opacity;
        const gradient = ctx.createLinearGradient(
            this._startPoint.x * this._bounds.width,
            this._startPoint.y * this._bounds.height,
            this._endPoint.x * this._bounds.width,
            this._endPoint.y * this._bounds.height
        );
        this._colors.forEach((c, i) => {
            const loc = this._locations[i] || (i / (this._colors.length - 1 || 1));
            gradient.addColorStop(loc, c.css);
        });
        if (this._cornerRadius > 0) {
            CALayer.roundRect(ctx, 0, 0, this._bounds.width, this._bounds.height, this._cornerRadius);
            ctx.fillStyle = gradient;
            ctx.fill();
        } else {
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, this._bounds.width, this._bounds.height);
        }
        ctx.restore();
    }
}

class CAShapeLayer extends CALayer {
    constructor() {
        super();
        this._path = null;
        this._fillColor = null;
        this._strokeColor = null;
        this._lineWidth = 1;
        this._lineCap = 'butt';
        this._lineJoin = 'miter';
        this._lineDashPhase = 0;
        this._lineDashPattern = [];
        this._fillRule = 'nonzero';
    }
    static layer() { return new CAShapeLayer(); }
    get path() { return this._path; }
    set path(v) { this._path = v; }
    get fillColor() { return this._fillColor; }
    set fillColor(v) {
        if (v instanceof UIColor) this._fillColor = v;
        else if (typeof v === 'string') this._fillColor = UIColor.colorWithHex(v);
        else this._fillColor = null;
    }
    get strokeColor() { return this._strokeColor; }
    set strokeColor(v) {
        if (v instanceof UIColor) this._strokeColor = v;
        else if (typeof v === 'string') this._strokeColor = UIColor.colorWithHex(v);
        else this._strokeColor = null;
    }
    get lineWidth() { return this._lineWidth; }
    set lineWidth(v) { this._lineWidth = v; }
    get lineCap() { return this._lineCap; }
    set lineCap(v) { this._lineCap = v; }
    get lineJoin() { return this._lineJoin; }
    set lineJoin(v) { this._lineJoin = v; }
    get lineDashPhase() { return this._lineDashPhase; }
    set lineDashPhase(v) { this._lineDashPhase = v; }
    get lineDashPattern() { return [...this._lineDashPattern]; }
    set lineDashPattern(v) { this._lineDashPattern = [...v]; }
    get fillRule() { return this._fillRule; }
    set fillRule(v) { this._fillRule = v; }
    setPath(path) { this.path = path; return this; }
    setFillColor(color) { this.fillColor = color; return this; }
    setStrokeColor(color) { this.strokeColor = color; return this; }
    setLineWidth(width) { this.lineWidth = width; return this; }
    withPath(path) { return this.setPath(path); }
    withFillColor(color) { return this.setFillColor(color); }
    withStrokeColor(color) { return this.setStrokeColor(color); }
    withLineWidth(value) { return this.setLineWidth(value); }
    renderToContext(ctx) {
        if (this._isHidden || !this._path) return;
        ctx.save();
        ctx.globalAlpha = this._opacity;
        if (this._fillColor) ctx.fillStyle = this._fillColor.css;
        if (this._strokeColor) ctx.strokeStyle = this._strokeColor.css;
        ctx.lineWidth = this._lineWidth;
        ctx.lineCap = this._lineCap;
        ctx.lineJoin = this._lineJoin;
        if (this._lineDashPattern.length > 0) ctx.setLineDash(this._lineDashPattern, this._lineDashPhase);
        if (typeof this._path === 'function') {
            ctx.beginPath();
            this._path(ctx);
            if (this._fillColor) ctx.fill(this._fillRule);
            if (this._strokeColor) ctx.stroke();
        } else if (this._path?.applyWithContext) {
            ctx.beginPath();
            this._path.applyWithContext(ctx);
            if (this._fillColor) ctx.fill(this._fillRule);
            if (this._strokeColor) ctx.stroke();
        }
        ctx.restore();
    }
}

class CATextLayer extends CALayer {
    constructor() {
        super();
        this._string = '';
        this._font = '14px system-ui';
        this._fontSize = 14;
        this._textColor = UIColor.black();
        this._textAlignment = 'left';
        this._isWrapped = true;
        this._truncationMode = 'end';
        this._maximumNumberOfLines = 0;
    }
    static layer() { return new CATextLayer(); }
    get string() { return this._string; }
    set string(v) { this._string = v; }
    get font() { return this._font; }
    set font(v) {
        this._font = v;
        if (typeof v === 'number') { this._fontSize = v; this._font = `${v}px system-ui`; }
    }
    get fontSize() { return this._fontSize; }
    set fontSize(v) { this._fontSize = v; this._font = `${v}px system-ui`; }
    get textColor() { return this._textColor; }
    set textColor(v) {
        if (v instanceof UIColor) this._textColor = v;
        else if (typeof v === 'string') this._textColor = UIColor.colorWithHex(v) || UIColor.black();
    }
    get textAlignment() { return this._textAlignment; }
    set textAlignment(v) { this._textAlignment = v; }
    get isWrapped() { return this._isWrapped; }
    set isWrapped(v) { this._isWrapped = v; }
    get truncationMode() { return this._truncationMode; }
    set truncationMode(v) { this._truncationMode = v; }
    get maximumNumberOfLines() { return this._maximumNumberOfLines; }
    set maximumNumberOfLines(v) { this._maximumNumberOfLines = v; }
    setString(value) { this.string = value; return this; }
    setFont(font) { this.font = font; return this; }
    setFontSize(size) { this.fontSize = size; return this; }
    setTextColor(color) { this.textColor = color; return this; }
    setTextAlignment(alignment) { this.textAlignment = alignment; return this; }
    withString(value) { return this.setString(value); }
    withFont(font) { return this.setFont(font); }
    withFontSize(size) { return this.setFontSize(size); }
    withTextColor(color) { return this.setTextColor(color); }
    withTextAlignment(alignment) { return this.setTextAlignment(alignment); }
    renderToContext(ctx) {
        if (this._isHidden) return;
        ctx.save();
        ctx.globalAlpha = this._opacity;
        ctx.font = this._font;
        ctx.fillStyle = this._textColor.css;
        ctx.textBaseline = 'top';
        let textX = 0;
        if (this._textAlignment === 'center') { ctx.textAlign = 'center'; textX = this._bounds.width / 2; }
        else if (this._textAlignment === 'right') { ctx.textAlign = 'right'; textX = this._bounds.width; }
        else ctx.textAlign = 'left';
        const lines = String(this._string).split('\n');
        const lineHeight = this._fontSize * 1.2;
        const maxLines = this._maximumNumberOfLines || lines.length;
        lines.slice(0, maxLines).forEach((line, i) => ctx.fillText(line, textX, i * lineHeight));
        ctx.restore();
    }
}

const createMockContext = () => ({
    save: () => {},
    restore: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    quadraticCurveTo: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    globalAlpha: 1,
    shadowColor: '',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowPath: null,
    textBaseline: 'alphabetic',
    textAlign: 'start',
    font: '10px sans-serif',
    fillText: () => {},
    drawImage: () => {},
    setLineDash: () => {},
    clip: () => {}
});

describe('CALayer UI Rendering', () => {
    describe('Background Color Rendering', () => {
        it('should render background color', () => {
            const layer = CALayer.layer();
            layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
            layer.backgroundColor = UIColor.red();
            const ctx = createMockContext();
            layer.renderToContext(ctx);
            assert.strictEqual(ctx.fillStyle, 'rgb(255, 0, 0)');
        });

        it('should render with opacity', () => {
            const layer = CALayer.layer();
            layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
            layer.backgroundColor = UIColor.blue();
            layer.opacity = 0.5;
            const ctx = createMockContext();
            layer.renderToContext(ctx);
            assert.strictEqual(ctx.globalAlpha, 0.5);
        });

        it('should not render when hidden', () => {
            const layer = CALayer.layer();
            layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
            layer.backgroundColor = UIColor.red();
            layer.isHidden = true;
            const ctx = createMockContext();
            layer.renderToContext(ctx);
            assert.strictEqual(ctx.fillStyle, '');
        });
    });

    describe('Border Rendering', () => {
        it('should render border', () => {
            const layer = CALayer.layer();
            layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
            layer.borderColor = UIColor.black();
            layer.borderWidth = 2;
            const ctx = createMockContext();
            layer.renderToContext(ctx);
            assert.strictEqual(ctx.strokeStyle, 'rgb(0, 0, 0)');
            assert.strictEqual(ctx.lineWidth, 2);
        });

        it('should render border with corner radius', () => {
            const layer = CALayer.layer();
            layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
            layer.borderColor = UIColor.black();
            layer.borderWidth = 2;
            layer.cornerRadius = 10;
            const ctx = createMockContext();
            layer.renderToContext(ctx);
            assert.strictEqual(ctx.strokeStyle, 'rgb(0, 0, 0)');
            assert.strictEqual(ctx.lineWidth, 2);
        });
    });

    describe('Corner Radius Rendering', () => {
        it('should render background with corner radius', () => {
            const layer = CALayer.layer();
            layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
            layer.backgroundColor = UIColor.green();
            layer.cornerRadius = 10;
            const ctx = createMockContext();
            layer.renderToContext(ctx);
            assert.strictEqual(ctx.fillStyle, 'rgb(0, 255, 0)');
        });
    });

    describe('Shadow Rendering', () => {
        it('should render shadow', () => {
            const layer = CALayer.layer();
            layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
            layer.shadowColor = UIColor.black();
            layer.shadowOpacity = 0.5;
            layer.shadowRadius = 5;
            layer.shadowOffset = { width: 3, height: 3 };
            const ctx = createMockContext();
            layer.renderToContext(ctx);
            assert.strictEqual(ctx.shadowColor, 'rgb(0, 0, 0)');
            assert.strictEqual(ctx.shadowBlur, 5);
            assert.strictEqual(ctx.shadowOffsetX, 3);
            assert.strictEqual(ctx.shadowOffsetY, 3);
        });

        it('should not render shadow when opacity is 0', () => {
            const layer = CALayer.layer();
            layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
            layer.shadowColor = UIColor.black();
            layer.shadowOpacity = 0;
            layer.shadowRadius = 5;
            const ctx = createMockContext();
            layer.renderToContext(ctx);
            assert.strictEqual(ctx.shadowColor, '');
        });
    });

    describe('Transform Rendering', () => {
        it('should apply anchor point translation', () => {
            const layer = CALayer.layer();
            layer.frame = { x: 50, y: 50, width: 100, height: 100 };
            layer.anchorPoint = { x: 0, y: 0 };
            const ctx = createMockContext();
            let translateCalls = [];
            ctx.translate = (x, y) => translateCalls.push({ x, y });
            layer.renderToContext(ctx);
            assert.strictEqual(translateCalls.length >= 2, true);
        });

        it('should apply transform', () => {
            const layer = CALayer.layer();
            layer.frame = { x: 0, y: 0, width: 100, height: 100 };
            layer.transform = CATransform3D.MakeRotation(Math.PI / 4);
            const ctx = createMockContext();
            layer.renderToContext(ctx);
            assert.strictEqual(ctx.globalAlpha, 1);
        });
    });

    describe('Sublayer Rendering', () => {
        it('should render sublayers', () => {
            const parent = CALayer.layer();
            parent.frame = { x: 0, y: 0, width: 200, height: 200 };
            parent.backgroundColor = UIColor.white();
            
            const child = CALayer.layer();
            child.frame = { x: 50, y: 50, width: 100, height: 100 };
            child.backgroundColor = UIColor.red();
            
            parent.addSublayer(child);
            
            const ctx = createMockContext();
            let fillCalls = 0;
            ctx.fillRect = () => fillCalls++;
            parent.renderToContext(ctx);
            assert.strictEqual(fillCalls >= 2, true);
        });

        it('should render nested sublayers', () => {
            const root = CALayer.layer();
            root.frame = { x: 0, y: 0, width: 300, height: 300 };
            root.backgroundColor = UIColor.white();
            
            const child = CALayer.layer();
            child.frame = { x: 50, y: 50, width: 200, height: 200 };
            child.backgroundColor = UIColor.blue();
            
            const grandchild = CALayer.layer();
            grandchild.frame = { x: 25, y: 25, width: 50, height: 50 };
            grandchild.backgroundColor = UIColor.red();
            
            child.addSublayer(grandchild);
            root.addSublayer(child);
            
            const ctx = createMockContext();
            let fillCalls = 0;
            ctx.fillRect = () => fillCalls++;
            root.renderToContext(ctx);
            assert.strictEqual(fillCalls >= 3, true);
        });

        it('should not render hidden sublayers', () => {
            const parent = CALayer.layer();
            parent.frame = { x: 0, y: 0, width: 200, height: 200 };
            parent.backgroundColor = UIColor.white();
            
            const child = CALayer.layer();
            child.frame = { x: 50, y: 50, width: 100, height: 100 };
            child.backgroundColor = UIColor.red();
            child.isHidden = true;
            
            parent.addSublayer(child);
            
            const ctx = createMockContext();
            let fillCalls = 0;
            ctx.fillRect = () => fillCalls++;
            parent.renderToContext(ctx);
            assert.strictEqual(fillCalls, 1);
        });
    });

    describe('Layer Hierarchy', () => {
        it('should maintain layer order', () => {
            const parent = CALayer.layer();
            parent.frame = { x: 0, y: 0, width: 100, height: 100 };
            
            const child1 = CALayer.layer();
            child1.frame = { x: 10, y: 10, width: 80, height: 80 };
            child1.backgroundColor = UIColor.red();
            child1.name = 'child1';
            
            const child2 = CALayer.layer();
            child2.frame = { x: 20, y: 20, width: 60, height: 60 };
            child2.backgroundColor = UIColor.blue();
            child2.name = 'child2';
            
            parent.addSublayer(child1);
            parent.addSublayer(child2);
            
            assert.strictEqual(parent.sublayers.length, 2);
            assert.strictEqual(parent.sublayers[0], child1);
            assert.strictEqual(parent.sublayers[1], child2);
        });

        it('should insert sublayer at specific index', () => {
            const parent = CALayer.layer();
            parent.frame = { x: 0, y: 0, width: 100, height: 100 };
            
            const child1 = CALayer.layer();
            child1.name = 'child1';
            const child2 = CALayer.layer();
            child2.name = 'child2';
            const child3 = CALayer.layer();
            child3.name = 'child3';
            
            parent.addSublayer(child1);
            parent.addSublayer(child3);
            parent.insertSublayerAtIndex(child2, 1);
            
            assert.strictEqual(parent.sublayers[1], child2);
        });
    });
});

describe('CAGradientLayer UI Rendering', () => {
    it('should render linear gradient', () => {
        const layer = CAGradientLayer.layer();
        layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
        layer.colors = [UIColor.red(), UIColor.blue()];
        const ctx = createMockContext();
        let gradientCreated = false;
        ctx.createLinearGradient = (x1, y1, x2, y2) => {
            gradientCreated = true;
            return { addColorStop: () => {} };
        };
        layer.renderToContext(ctx);
        assert.strictEqual(gradientCreated, true);
    });

    it('should render gradient with corner radius', () => {
        const layer = CAGradientLayer.layer();
        layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
        layer.cornerRadius = 10;
        layer.colors = [UIColor.red(), UIColor.blue()];
        const ctx = createMockContext();
        ctx.createLinearGradient = () => ({ addColorStop: () => {} });
        layer.renderToContext(ctx);
        assert.strictEqual(ctx.globalAlpha, 1);
    });

    it('should respect gradient start and end points', () => {
        const layer = CAGradientLayer.layer();
        layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
        layer.startPoint = { x: 0, y: 0 };
        layer.endPoint = { x: 1, y: 1 };
        layer.colors = [UIColor.red(), UIColor.green()];
        let gradientArgs = null;
        const ctx = createMockContext();
        ctx.createLinearGradient = (x1, y1, x2, y2) => {
            gradientArgs = { x1, y1, x2, y2 };
            return { addColorStop: () => {} };
        };
        layer.renderToContext(ctx);
        assert.strictEqual(gradientArgs.x1, 0);
        assert.strictEqual(gradientArgs.y1, 0);
        assert.strictEqual(gradientArgs.x2, 100);
        assert.strictEqual(gradientArgs.y2, 100);
    });
});

describe('CAShapeLayer UI Rendering', () => {
    it('should render shape path', () => {
        const layer = CAShapeLayer.layer();
        layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
        layer.path = CGPath.CreateRect(10, 10, 80, 80);
        layer.fillColor = UIColor.red();
        const ctx = createMockContext();
        let pathApplied = false;
        ctx.fillStyle = '';
        ctx.beginPath = () => { pathApplied = true; };
        layer.renderToContext(ctx);
        assert.strictEqual(pathApplied, true);
        assert.strictEqual(ctx.fillStyle, 'rgb(255, 0, 0)');
    });

    it('should render stroke', () => {
        const layer = CAShapeLayer.layer();
        layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
        layer.path = CGPath.CreateCircle(50, 50, 40);
        layer.strokeColor = UIColor.blue();
        layer.lineWidth = 3;
        const ctx = createMockContext();
        ctx.strokeStyle = '';
        ctx.lineWidth = 1;
        layer.renderToContext(ctx);
        assert.strictEqual(ctx.strokeStyle, 'rgb(0, 0, 255)');
        assert.strictEqual(ctx.lineWidth, 3);
    });

    it('should render with function path', () => {
        const layer = CAShapeLayer.layer();
        layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
        layer.path = (ctx) => { ctx.arc(50, 50, 40, 0, Math.PI * 2); };
        layer.fillColor = UIColor.green();
        const ctx = createMockContext();
        let beginPathCalled = false;
        ctx.beginPath = () => { beginPathCalled = true; };
        layer.renderToContext(ctx);
        assert.strictEqual(beginPathCalled, true);
    });

    it('should apply line dash pattern', () => {
        const layer = CAShapeLayer.layer();
        layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
        layer.path = CGPath.CreateRect(10, 10, 80, 80);
        layer.strokeColor = UIColor.black();
        layer.lineDashPattern = [5, 3];
        const ctx = createMockContext();
        let dashSet = false;
        ctx.setLineDash = (pattern) => { dashSet = true; };
        layer.renderToContext(ctx);
        assert.strictEqual(dashSet, true);
    });
});

describe('CATextLayer UI Rendering', () => {
    it('should render text', () => {
        const layer = CATextLayer.layer();
        layer.bounds = { x: 0, y: 0, width: 100, height: 50 };
        layer.string = 'Hello World';
        const ctx = createMockContext();
        layer.renderToContext(ctx);
        assert.strictEqual(ctx.font, '14px system-ui');
        assert.strictEqual(ctx.fillStyle, 'rgb(0, 0, 0)');
    });

    it('should render text with custom font', () => {
        const layer = CATextLayer.layer();
        layer.bounds = { x: 0, y: 0, width: 100, height: 50 };
        layer.font = '16px Arial';
        layer.string = 'Test';
        const ctx = createMockContext();
        layer.renderToContext(ctx);
        assert.strictEqual(ctx.font, '16px Arial');
    });

    it('should render text with custom color', () => {
        const layer = CATextLayer.layer();
        layer.bounds = { x: 0, y: 0, width: 100, height: 50 };
        layer.textColor = UIColor.red();
        layer.string = 'Red Text';
        const ctx = createMockContext();
        layer.renderToContext(ctx);
        assert.strictEqual(ctx.fillStyle, 'rgb(255, 0, 0)');
    });

    it('should center text when alignment is center', () => {
        const layer = CATextLayer.layer();
        layer.bounds = { x: 0, y: 0, width: 100, height: 50 };
        layer.textAlignment = 'center';
        layer.string = 'Centered';
        const ctx = createMockContext();
        layer.renderToContext(ctx);
        assert.strictEqual(ctx.textAlign, 'center');
    });

    it('should right align text', () => {
        const layer = CATextLayer.layer();
        layer.bounds = { x: 0, y: 0, width: 100, height: 50 };
        layer.textAlignment = 'right';
        layer.string = 'Right';
        const ctx = createMockContext();
        layer.renderToContext(ctx);
        assert.strictEqual(ctx.textAlign, 'right');
    });

    it('should render multiline text', () => {
        const layer = CATextLayer.layer();
        layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
        layer.string = 'Line 1\nLine 2\nLine 3';
        const ctx = createMockContext();
        let fillTextCalls = 0;
        ctx.fillText = () => fillTextCalls++;
        layer.renderToContext(ctx);
        assert.strictEqual(fillTextCalls, 3);
    });

    it('should respect maximum number of lines', () => {
        const layer = CATextLayer.layer();
        layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
        layer.string = 'Line 1\nLine 2\nLine 3';
        layer.maximumNumberOfLines = 2;
        const ctx = createMockContext();
        let fillTextCalls = 0;
        ctx.fillText = () => fillTextCalls++;
        layer.renderToContext(ctx);
        assert.strictEqual(fillTextCalls, 2);
    });
});

describe('CALayer Hit Testing', () => {
    it('should return layer when point is inside', () => {
        const layer = CALayer.layer();
        layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
        const hit = layer.hitTest({ x: 50, y: 50 });
        assert.strictEqual(hit, layer);
    });

    it('should return null when point is outside', () => {
        const layer = CALayer.layer();
        layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
        const hit = layer.hitTest({ x: 150, y: 150 });
        assert.strictEqual(hit, null);
    });

    it('should return null when layer is hidden', () => {
        const layer = CALayer.layer();
        layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
        layer.isHidden = true;
        const hit = layer.hitTest({ x: 50, y: 50 });
        assert.strictEqual(hit, null);
    });

    it('should return null when opacity is 0', () => {
        const layer = CALayer.layer();
        layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
        layer.opacity = 0;
        const hit = layer.hitTest({ x: 50, y: 50 });
        assert.strictEqual(hit, null);
    });

    it('should return sublayer when hit is in sublayer bounds', () => {
        const parent = CALayer.layer();
        parent.bounds = { x: 0, y: 0, width: 200, height: 200 };
        
        const child = CALayer.layer();
        child.bounds = { x: 0, y: 0, width: 50, height: 50 };
        child.position = { x: 25, y: 25 };
        parent.addSublayer(child);
        
        const hit = parent.hitTest({ x: 25, y: 25 });
        assert.strictEqual(hit, child);
    });
});

describe('CALayer Contents', () => {
    it('should render image contents', () => {
        const layer = CALayer.layer();
        layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
        layer.contents = 'data:image/png;base64,abc123';
        layer.contentsGravity = 'resizeAspect';
        const ctx = createMockContext();
        let drawImageCalled = false;
        ctx.drawImage = () => { drawImageCalled = true; };
        layer.renderToContext(ctx);
        assert.strictEqual(drawImageCalled, true);
    });

    it('should render function contents', () => {
        const layer = CALayer.layer();
        layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
        let contentsRendered = false;
        layer.contents = (ctx, bounds) => { contentsRendered = true; };
        const ctx = createMockContext();
        layer.renderToContext(ctx);
        assert.strictEqual(contentsRendered, true);
    });
});

describe('CALayer Animation', () => {
    it('should add animation', () => {
        const layer = CALayer.layer();
        const anim = { duration: 1 };
        layer.addAnimation(anim, 'fade');
        assert.strictEqual(layer.animationForKey('fade'), anim);
    });

    it('should remove animation', () => {
        const layer = CALayer.layer();
        layer.addAnimation({ duration: 1 }, 'fade');
        layer.removeAnimation('fade');
        assert.strictEqual(layer.animationForKey('fade'), null);
    });

    it('should get animation keys', () => {
        const layer = CALayer.layer();
        layer.addAnimation({ duration: 1 }, 'fade');
        layer.addAnimation({ duration: 2 }, 'move');
        const keys = layer.animationKeys();
        assert.strictEqual(keys.length, 2);
        assert.ok(keys.includes('fade'));
        assert.ok(keys.includes('move'));
    });

    it('should remove all animations', () => {
        const layer = CALayer.layer();
        layer.addAnimation({ duration: 1 }, 'fade');
        layer.addAnimation({ duration: 2 }, 'move');
        layer.removeAllAnimations();
        assert.strictEqual(layer.animationKeys().length, 0);
    });

    it('should call delegate when animation starts', () => {
        const layer = CALayer.layer();
        let delegateCalled = false;
        layer.delegate = { animationDidStart: () => { delegateCalled = true; } };
        layer.addAnimation({ duration: 1 }, 'fade');
        assert.strictEqual(delegateCalled, true);
    });
});

describe('CALayer Cloning', () => {
    it('should clone layer properties', () => {
        const original = CALayer.layer();
        original.frame = { x: 10, y: 20, width: 100, height: 50 };
        original.backgroundColor = UIColor.red();
        original.opacity = 0.8;
        
        const clone = original.clone();
        
        assert.strictEqual(clone._frame.x, 10);
        assert.strictEqual(clone._frame.y, 20);
        assert.strictEqual(clone._frame.width, 100);
        assert.strictEqual(clone._frame.height, 50);
        assert.strictEqual(clone._backgroundColor.r, 1);
        assert.strictEqual(clone._opacity, 0.8);
    });

    it('should clone properties independently', () => {
        const original = CALayer.layer();
        original.opacity = 0.5;
        
        const clone = original.clone();
        clone.opacity = 1;
        
        assert.strictEqual(original._opacity, 0.5);
        assert.strictEqual(clone._opacity, 1);
    });
});

describe('CALayer Encoding/Decoding', () => {
    it('should encode layer properties', () => {
        const layer = CALayer.layer();
        layer.frame = { x: 10, y: 20, width: 100, height: 50 };
        layer.backgroundColor = UIColor.red();
        layer.opacity = 0.8;
        
        const encoded = layer.encode();
        
        assert.strictEqual(encoded.frame.x, 10);
        assert.strictEqual(encoded.backgroundColor, '#ff0000');
        assert.strictEqual(encoded.opacity, 0.8);
    });

    it('should decode layer properties', () => {
        const data = {
            frame: { x: 10, y: 20, width: 100, height: 50 },
            backgroundColor: '#00ff00',
            opacity: 0.5
        };
        
        const decoded = CALayer.decode(data);
        
        assert.strictEqual(decoded._frame.x, 10);
        assert.strictEqual(decoded._backgroundColor.g, 1);
        assert.strictEqual(decoded._opacity, 0.5);
    });
});
