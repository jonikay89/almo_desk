/**
 * CALayer Test Suite
 * Tests for the CALayer class with Core Animation-like behavior
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

class UIColor {
    constructor(r = 0, g = 0, b = 0, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    static white() { return new UIColor(1, 1, 1, 1); }
    static black() { return new UIColor(0, 0, 0, 1); }
    static clear() { return new UIColor(0, 0, 0, 0); }
    static red() { return new UIColor(1, 0, 0, 1); }
    static blue() { return new UIColor(0, 0, 1, 1); }
    static green() { return new UIColor(0, 1, 0, 1); }

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
        return null;
    }
}

class CGPoint {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}

class CGSize {
    constructor(width = 0, height = 0) {
        this.width = width;
        this.height = height;
    }
}

class CGRect {
    constructor(x = 0, y = 0, width = 0, height = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

class CATransform3D {
    constructor() {
        this.m11 = 1; this.m12 = 0; this.m13 = 0; this.m14 = 0;
        this.m21 = 0; this.m22 = 1; this.m23 = 0; this.m24 = 0;
        this.m31 = 0; this.m32 = 0; this.m33 = 1; this.m34 = 0;
        this.m41 = 0; this.m42 = 0; this.m43 = 0; this.m44 = 1;
    }

    static identity() {
        return new CATransform3D();
    }

    static MakeRotation(angle, x, y, z) {
        const transform = new CATransform3D();
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const oneMinusCos = 1 - cos;
        
        transform.m11 = cos + x * x * oneMinusCos;
        transform.m12 = x * y * oneMinusCos - z * sin;
        transform.m13 = x * z * oneMinusCos + y * sin;
        transform.m21 = y * x * oneMinusCos + z * sin;
        transform.m22 = cos + y * y * oneMinusCos;
        transform.m23 = y * z * oneMinusCos - x * sin;
        transform.m31 = z * x * oneMinusCos - y * sin;
        transform.m32 = z * y * oneMinusCos + x * sin;
        transform.m33 = cos + z * z * oneMinusCos;
        
        return transform;
    }

    static MakeScale(sx, sy, sz = 1) {
        const transform = new CATransform3D();
        transform.m11 = sx;
        transform.m22 = sy;
        transform.m33 = sz;
        return transform;
    }

    static MakeTranslation(tx, ty, tz = 0) {
        const transform = new CATransform3D();
        transform.m41 = tx;
        transform.m42 = ty;
        transform.m43 = tz;
        return transform;
    }

    static MakePerspective(m34) {
        const transform = CATransform3D.identity();
        transform.m34 = m34;
        return transform;
    }

    rotated(angle, x, y, z) {
        return this.multiply(CATransform3D.MakeRotation(angle, x, y, z));
    }

    scaled(sx, sy, sz = 1) {
        return this.multiply(CATransform3D.MakeScale(sx, sy, sz));
    }

    translated(tx, ty, tz = 0) {
        return this.multiply(CATransform3D.MakeTranslation(tx, ty, tz));
    }

    multiplied(other) {
        return this.multiply(other);
    }

    multiply(other) {
        const result = new CATransform3D();
        result.m11 = this.m11 * other.m11 + this.m12 * other.m21 + this.m13 * other.m31 + this.m14 * other.m41;
        result.m12 = this.m11 * other.m12 + this.m12 * other.m22 + this.m13 * other.m32 + this.m14 * other.m42;
        result.m13 = this.m11 * other.m13 + this.m12 * other.m23 + this.m13 * other.m33 + this.m14 * other.m43;
        result.m14 = this.m11 * other.m14 + this.m12 * other.m24 + this.m13 * other.m34 + this.m14 * other.m44;
        result.m21 = this.m21 * other.m11 + this.m22 * other.m21 + this.m23 * other.m31 + this.m24 * other.m41;
        result.m22 = this.m21 * other.m12 + this.m22 * other.m22 + this.m23 * other.m32 + this.m24 * other.m42;
        result.m23 = this.m21 * other.m13 + this.m22 * other.m23 + this.m23 * other.m33 + this.m24 * other.m43;
        result.m24 = this.m21 * other.m14 + this.m22 * other.m24 + this.m23 * other.m34 + this.m24 * other.m44;
        result.m31 = this.m31 * other.m11 + this.m32 * other.m21 + this.m33 * other.m31 + this.m34 * other.m41;
        result.m32 = this.m31 * other.m12 + this.m32 * other.m22 + this.m33 * other.m32 + this.m34 * other.m42;
        result.m33 = this.m31 * other.m13 + this.m32 * other.m23 + this.m33 * other.m33 + this.m34 * other.m43;
        result.m34 = this.m31 * other.m14 + this.m32 * other.m24 + this.m33 * other.m34 + this.m34 * other.m44;
        result.m41 = this.m41 * other.m11 + this.m42 * other.m21 + this.m43 * other.m31 + this.m44 * other.m41;
        result.m42 = this.m41 * other.m12 + this.m42 * other.m22 + this.m43 * other.m32 + this.m44 * other.m42;
        result.m43 = this.m41 * other.m13 + this.m42 * other.m23 + this.m43 * other.m33 + this.m44 * other.m43;
        result.m44 = this.m41 * other.m14 + this.m42 * other.m24 + this.m43 * other.m34 + this.m44 * other.m44;
        return result;
    }

    toCSSTransform() {
        return `matrix3d(${this.m11}, ${this.m12}, ${this.m13}, ${this.m14}, ${this.m21}, ${this.m22}, ${this.m23}, ${this.m24}, ${this.m31}, ${this.m32}, ${this.m33}, ${this.m34}, ${this.m41}, ${this.m42}, ${this.m43}, ${this.m44})`;
    }

    toCSSTransformWithAnchor(anchorX, anchorY, width, height) {
        const anchorOffsetX = -anchorX * width;
        const anchorOffsetY = -anchorY * height;
        const translate = CATransform3D.MakeTranslation(anchorOffsetX, anchorOffsetY, 0);
        const combined = this.multiply(translate);
        const untranslate = CATransform3D.MakeTranslation(-anchorOffsetX, -anchorOffsetY, 0);
        return combined.multiply(untranslate).toCSSTransform();
    }

    isIdentity() {
        return this.m11 === 1 && this.m12 === 0 && this.m13 === 0 && this.m14 === 0 &&
               this.m21 === 0 && this.m22 === 1 && this.m23 === 0 && this.m24 === 0 &&
               this.m31 === 0 && this.m32 === 0 && this.m33 === 1 && this.m34 === 0 &&
               this.m41 === 0 && this.m42 === 0 && this.m43 === 0 && this.m44 === 1;
    }

    inverted() {
        const det = this.m11 * (this.m22 * this.m33 - this.m23 * this.m32) -
                    this.m12 * (this.m21 * this.m33 - this.m23 * this.m31) +
                    this.m13 * (this.m21 * this.m32 - this.m22 * this.m31);
        if (det === 0) return null;
        
        const invDet = 1 / det;
        const result = new CATransform3D();
        result.m11 = (this.m22 * this.m33 - this.m23 * this.m32) * invDet;
        result.m12 = -(this.m12 * this.m33 - this.m13 * this.m32) * invDet;
        result.m13 = (this.m12 * this.m23 - this.m13 * this.m22) * invDet;
        result.m21 = -(this.m21 * this.m33 - this.m23 * this.m31) * invDet;
        result.m22 = (this.m11 * this.m33 - this.m13 * this.m31) * invDet;
        result.m23 = -(this.m11 * this.m23 - this.m13 * this.m21) * invDet;
        result.m31 = (this.m21 * this.m32 - this.m22 * this.m31) * invDet;
        result.m32 = -(this.m11 * this.m32 - this.m12 * this.m31) * invDet;
        result.m33 = (this.m11 * this.m22 - this.m12 * this.m21) * invDet;
        return result;
    }
}

class CGAffineTransform {
    constructor() {
        this.a = 1; this.b = 0;
        this.c = 0; this.d = 1;
        this.tx = 0; this.ty = 0;
    }

    static identity() {
        return new CGAffineTransform();
    }

    static MakeRotation(angle) {
        const transform = new CGAffineTransform();
        transform.a = Math.cos(angle);
        transform.b = Math.sin(angle);
        transform.c = -Math.sin(angle);
        transform.d = Math.cos(angle);
        return transform;
    }

    static MakeScale(sx, sy) {
        const transform = new CGAffineTransform();
        transform.a = sx;
        transform.d = sy;
        return transform;
    }

    static MakeTranslation(tx, ty) {
        const transform = new CGAffineTransform();
        transform.tx = tx;
        transform.ty = ty;
        return transform;
    }

    rotated(angle) {
        return this.multiply(CGAffineTransform.MakeRotation(angle));
    }

    scaled(sx, sy) {
        return this.multiply(CGAffineTransform.MakeScale(sx, sy));
    }

    translated(tx, ty) {
        return this.multiply(CGAffineTransform.MakeTranslation(tx, ty));
    }

    multiply(other) {
        const result = new CGAffineTransform();
        result.a = this.a * other.a + this.c * other.b;
        result.b = this.b * other.a + this.d * other.b;
        result.c = this.a * other.c + this.c * other.d;
        result.d = this.b * other.c + this.d * other.d;
        result.tx = this.a * other.tx + this.c * other.ty + this.tx;
        result.ty = this.b * other.tx + this.d * other.ty + this.ty;
        return result;
    }

    inverted() {
        const det = this.a * this.d - this.b * this.c;
        if (det === 0) return null;
        const result = new CGAffineTransform();
        result.a = this.d / det;
        result.b = -this.b / det;
        result.c = -this.c / det;
        result.d = this.a / det;
        result.tx = (this.c * this.ty - this.d * this.tx) / det;
        result.ty = (this.b * this.tx - this.a * this.ty) / det;
        return result;
    }

    isIdentity() {
        return this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1 && this.tx === 0 && this.ty === 0;
    }

    toArray() {
        return [this.a, this.b, this.c, this.d, this.tx, this.ty];
    }

    concat(transform) {
        return this.multiply(transform);
    }
}

class CGPath {
    constructor() {
        this._elements = [];
        this._currentPoint = { x: 0, y: 0 };
        this._boundingBox = null;
    }

    static Create() {
        return new CGPath();
    }

    static CreateRect(x, y, width, height) {
        const path = new CGPath();
        path.moveToPoint(x, y);
        path.addLineToPoint(x + width, y);
        path.addLineToPoint(x + width, y + height);
        path.addLineToPoint(x, y + height);
        path.closeSubpath();
        return path;
    }

    static CreateRoundedRect(x, y, width, height, cornerRadius) {
        const path = new CGPath();
        const r = Math.min(cornerRadius, width / 2, height / 2);
        path.moveToPoint(x + r, y);
        path.addLineToPoint(x + width - r, y);
        path.addArcAtPoint(x + width - r, y + r, r, -Math.PI / 2, 0, false);
        path.addLineToPoint(x + width, y + height - r);
        path.addArcAtPoint(x + width - r, y + height - r, r, 0, Math.PI / 2, false);
        path.addLineToPoint(x + r, y + height);
        path.addArcAtPoint(x + r, y + height - r, r, Math.PI / 2, Math.PI, false);
        path.addLineToPoint(x, y + r);
        path.addArcAtPoint(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
        path.closeSubpath();
        return path;
    }

    static CreateEllipse(x, y, width, height) {
        const path = new CGPath();
        const cx = x + width / 2;
        const cy = y + height / 2;
        const rx = width / 2;
        const ry = height / 2;
        
        path.moveToPoint(cx + rx, cy);
        for (let i = 1; i <= 360; i += 10) {
            const angle = (i * Math.PI) / 180;
            path.addLineToPoint(cx + rx * Math.cos(angle), cy + ry * Math.sin(angle));
        }
        path.closeSubpath();
        return path;
    }

    static CreateCircle(x, y, radius) {
        return CGPath.CreateEllipse(x - radius, y - radius, radius * 2, radius * 2);
    }

    static CreateStar(x, y, outerRadius, innerRadius, points = 5) {
        const path = new CGPath();
        const cx = x;
        const cy = y;
        
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / points - Math.PI / 2;
            if (i === 0) {
                path.moveToPoint(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
            } else {
                path.addLineToPoint(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
            }
        }
        path.closeSubpath();
        return path;
    }

    static CreateLine(fromPoint, toPoint) {
        const path = new CGPath();
        path.moveToPoint(fromPoint.x, fromPoint.y);
        path.addLineToPoint(toPoint.x, toPoint.y);
        return path;
    }

    static CreatePolygon(points) {
        const path = new CGPath();
        if (points.length === 0) return path;
        
        path.moveToPoint(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            path.addLineToPoint(points[i].x, points[i].y);
        }
        path.closeSubpath();
        return path;
    }

    moveToPoint(x, y) {
        const point = typeof x === 'object' ? x : { x, y };
        this._currentPoint = point;
        this._elements.push({ type: 'move', x: point.x, y: point.y });
        return this;
    }

    addLineToPoint(x, y) {
        const point = typeof x === 'object' ? x : { x, y };
        this._elements.push({ type: 'line', x: point.x, y: point.y });
        this._currentPoint = point;
        return this;
    }

    addCurveToPoint(endPoint, controlPoint1, controlPoint2) {
        this._elements.push({ type: 'curve', end: endPoint, cp1: controlPoint1, cp2: controlPoint2 });
        this._currentPoint = endPoint;
    }

    addQuadCurveToPoint(endPoint, controlPoint) {
        this._elements.push({ type: 'quadCurve', end: endPoint, cp: controlPoint });
        return this;
    }

    addArcAtPoint(centerX, centerY, radius, startAngle, endAngle, clockwise) {
        this._elements.push({ type: 'arc', cx: centerX, cy: centerY, radius, startAngle, endAngle, clockwise });
        return this;
    }

    addArcToPoint(x1, y1, x2, y2, radius) {
        this._elements.push({ type: 'arcTo', x1, y1, x2, y2, radius });
        return this;
    }

    closeSubpath() {
        this._elements.push({ type: 'close' });
        return this;
    }

    addPath(path) {
        if (path) {
            this._elements = this._elements.concat(path._elements);
        }
        return this;
    }

    get boundingBox() {
        if (this._boundingBox) return this._boundingBox;
        
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        for (const element of this._elements) {
            if (element.type === 'move' || element.type === 'line') {
                minX = Math.min(minX, element.x);
                minY = Math.min(minY, element.y);
                maxX = Math.max(maxX, element.x);
                maxY = Math.max(maxY, element.y);
            } else if (element.type === 'curve') {
                minX = Math.min(minX, element.end.x, element.cp1.x, element.cp2.x);
                minY = Math.min(minY, element.end.y, element.cp1.y, element.cp2.y);
                maxX = Math.max(maxX, element.end.x, element.cp1.x, element.cp2.x);
                maxY = Math.max(maxY, element.end.y, element.cp1.y, element.cp2.y);
            } else if (element.type === 'arc') {
                minX = Math.min(minX, element.cx - element.radius);
                minY = Math.min(minY, element.cy - element.radius);
                maxX = Math.max(maxX, element.cx + element.radius);
                maxY = Math.max(maxY, element.cy + element.radius);
            }
        }
        
        if (minX === Infinity) return { x: 0, y: 0, width: 0, height: 0 };
        this._boundingBox = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
        return this._boundingBox;
    }

    copy() {
        const path = new CGPath();
        path._elements = this._elements.map(e => ({ ...e }));
        path._boundingBox = this._boundingBox ? { ...this._boundingBox } : null;
        return path;
    }

    isEmpty() {
        return this._elements.length === 0;
    }

    boundingRect() {
        const box = this.boundingBox;
        return { x: box.x, y: box.y, width: box.width, height: box.height };
    }

    unionPath(other) {
        if (!other) return this.copy();
        const combined = new CGPath();
        combined._elements = [...this._elements, ...other._elements];
        return combined;
    }

    transformBy(transform) {
        const transformed = new CGPath();
        for (const element of this._elements) {
            const transformedElement = { ...element };
            if (element.type === 'moveTo' || element.type === 'lineTo') {
                transformedElement.x = transform.a * element.x + transform.c * element.y + transform.tx;
                transformedElement.y = transform.b * element.x + transform.d * element.y + transform.ty;
            }
            transformed._elements.push(transformedElement);
        }
        return transformed;
    }

    containsPoint(point) {
        return this.containsPoint_(point);
    }

    containsPoint_(point) {
        if (this._elements.length === 0) return false;
        
        let x = point.x, y = point.y;
        let inside = false;
        
        for (let i = 0, j = this._elements.length - 1; i < this._elements.length; j = i++) {
            const pi = this._elements[i];
            const pj = this._elements[j];
            
            if (!pi || !pj) continue;
            
            if (((pi.y > y) !== (pj.y > y)) &&
                (x < (pj.x - pi.x) * (y - pi.y) / (pj.y - pi.y) + pi.x)) {
                inside = !inside;
            }
        }
        
        return inside;
    }

    containsPoint(point) {
        return this.containsPoint_(point);
    }

    static CreateRect(x, y, width, height) {
        const path = new CGPath();
        path.moveToPoint({ x, y });
        path.addLineToPoint({ x: x + width, y });
        path.addLineToPoint({ x: x + width, y: y + height });
        path.addLineToPoint({ x, y: y + height });
        path.closeSubpath();
        return path;
    }

    static CreateCircle(x, y, radius) {
        const path = new CGPath();
        path.moveToPoint({ x: x + radius, y });
        for (let i = 1; i <= 360; i += 10) {
            const angle = (i * Math.PI) / 180;
            path.addLineToPoint({
                x: x + radius * Math.cos(angle),
                y: y + radius * Math.sin(angle)
            });
        }
        path.closeSubpath();
        return path;
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
        this._hidden = false;
        this._contents = null;
        this._contentsGravity = 'resize';
        this._backgroundColor = null;
        this._borderColor = null;
        this._borderWidth = 0;
        this._cornerRadius = 0;
        this._shadowColor = null;
        this._shadowOffset = { width: 0, height: 0 };
        this._shadowRadius = 0;
        this._shadowOpacity = 0;
        this._shadowPath = null;
        this._masksToBounds = false;
        this._transform = CATransform3D.identity();
        this._transform3D = CATransform3D.identity();
        this._sublayers = [];
        this._superlayer = null;
        this._delegate = null;
        this._name = '';
        this._opaque = false;
        this._isDoubleSided = true;
        this._geometryFlipped = false;
        this._shouldRasterize = false;
        this._rasterizationScale = 1;
    }

    static layer() {
        return new CALayer();
    }

    get frame() { return this._frame; }
    set frame(value) {
        this._frame = { ...value };
        this._bounds = { x: 0, y: 0, width: value.width, height: value.height };
        this._position = {
            x: value.x + this._anchorPoint.x * value.width,
            y: value.y + this._anchorPoint.y * value.height
        };
    }

    get bounds() { return this._bounds; }
    set bounds(value) {
        this._bounds = { ...value };
    }

    get position() { return this._position; }
    set position(value) {
        this._position = { ...value };
    }

    get anchorPoint() { return this._anchorPoint; }
    set anchorPoint(value) {
        this._anchorPoint = { ...value };
    }

    get zPosition() { return this._zPosition; }
    set zPosition(value) { this._zPosition = value; }

    get opacity() { return this._opacity; }
    set opacity(value) { this._opacity = Math.max(0, Math.min(1, value)); }

    get hidden() { return this._hidden; }
    set hidden(value) { this._hidden = value; }

    get backgroundColor() { return this._backgroundColor; }
    set backgroundColor(value) {
        if (value instanceof UIColor) this._backgroundColor = value;
        else if (typeof value === 'string') this._backgroundColor = UIColor.colorWithHex(value);
        else this._backgroundColor = null;
    }

    get borderColor() { return this._borderColor; }
    set borderColor(value) { this._borderColor = value; }

    get borderWidth() { return this._borderWidth; }
    set borderWidth(value) { this._borderWidth = value; }

    get cornerRadius() { return this._cornerRadius; }
    set cornerRadius(value) { this._cornerRadius = value; }

    get masksToBounds() { return this._masksToBounds; }
    set masksToBounds(value) { this._masksToBounds = value; }

    get shadowColor() { return this._shadowColor; }
    set shadowColor(value) {
        if (value instanceof UIColor) this._shadowColor = value;
        else if (typeof value === 'string') this._shadowColor = UIColor.colorWithHex(value);
        else this._shadowColor = null;
    }
    get shadowOffset() { return this._shadowOffset; }
    set shadowOffset(value) { this._shadowOffset = { ...value }; }
    get shadowRadius() { return this._shadowRadius; }
    set shadowRadius(value) { this._shadowRadius = value; }
    get shadowOpacity() { return this._shadowOpacity; }
    set shadowOpacity(value) { this._shadowOpacity = Math.max(0, Math.min(1, value)); }

    get contents() { return this._contents; }
    set contents(value) { this._contents = value; }

    get contentsGravity() { return this._contentsGravity; }
    set contentsGravity(value) { this._contentsGravity = value; }

    get transform() { return this._transform; }
    set transform(value) { this._transform = value; }

    get transform3D() { return this._transform3D; }
    set transform3D(value) { this._transform3D = value; }

    get opaque() { return this._opaque; }
    set opaque(value) { this._opaque = value; }

    get name() { return this._name; }
    set name(value) { this._name = value; }

    get isHidden() { return this._isHidden; }
    set isHidden(value) { this._isHidden = value; }

    get anchorPointZ() { return this._anchorPointZ; }
    set anchorPointZ(value) { this._anchorPointZ = value; }

    get isDoubleSided() { return this._isDoubleSided; }
    set isDoubleSided(value) { this._isDoubleSided = value; }

    get geometryFlipped() { return this._geometryFlipped; }
    set geometryFlipped(value) { this._geometryFlipped = value; }

    get shouldRasterize() { return this._shouldRasterize; }
    set shouldRasterize(value) { this._shouldRasterize = value; }

    get rasterizationScale() { return this._rasterizationScale; }
    set rasterizationScale(value) { this._rasterizationScale = value; }

    get presentationLayer() { return this._presentationLayer || this; }
    get modelLayer() { return this._modelLayer || this; }

    get mask() { return this._mask; }
    set mask(value) { this._mask = value; }

    get shadowPath() { return this._shadowPath; }
    set shadowPath(value) { this._shadowPath = value; }

    get delegate() { return this._delegate; }
    set delegate(value) { this._delegate = value; }

    addSublayer(layer) {
        if (layer._superlayer) layer._superlayer.removeSublayer(layer);
        layer._superlayer = this;
        this._sublayers.push(layer);
    }

    removeSublayer(layer) {
        const index = this._sublayers.indexOf(layer);
        if (index !== -1) {
            this._sublayers.splice(index, 1);
            layer._superlayer = null;
        }
    }

    removeFromSuperlayer() {
        if (this._superlayer) {
            this._superlayer.removeSublayer(this);
        }
    }

    get sublayers() { return this._sublayers; }
    get superlayer() { return this._superlayer; }

    insertSublayerAtIndex(layer, index) {
        if (layer._superlayer) layer._superlayer.removeSublayer(layer);
        layer._superlayer = this;
        this._sublayers.splice(index, 0, layer);
    }

    replaceSublayer(oldLayer, newLayer) {
        const index = this._sublayers.indexOf(oldLayer);
        if (index !== -1) {
            this._sublayers[index] = newLayer;
            oldLayer._superlayer = null;
            newLayer._superlayer = this;
        }
    }

    containsPoint(point) {
        const bounds = this._bounds;
        return point.x >= 0 && point.x <= bounds.width &&
               point.y >= 0 && point.y <= bounds.height;
    }

    hitTest(point) {
        if (this._hidden || this._opacity === 0) return null;
        if (!this.containsPoint(point)) return null;
        
        for (let i = this._sublayers.length - 1; i >= 0; i--) {
            const sublayer = this._sublayers[i];
            const convertedPoint = {
                x: point.x - this._position.x,
                y: point.y - this._position.y
            };
            const hit = sublayer.hitTest(convertedPoint);
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

    withShadow(color, offset, radius, opacity = 0.3) {
        return this.setShadow(color, offset, radius, opacity);
    }

    withBackgroundColor(color) {
        this._backgroundColor = color;
        return this;
    }

    withCornerRadius(radius) {
        this._cornerRadius = radius;
        return this;
    }

    withBorder(color, width) {
        this._borderColor = color;
        this._borderWidth = width;
        return this;
    }

    withOpacity(opacity) {
        this._opacity = opacity;
        return this;
    }

    withTransform(transform) {
        this._transform = transform;
        return this;
    }

    withName(name) {
        this._name = name;
        return this;
    }

    setFrame(x, y, width, height) {
        this.frame = { x, y, width, height };
        return this;
    }

    setBounds(x, y, width, height) {
        this.bounds = { x, y, width, height };
        return this;
    }

    setPosition(x, y) {
        this.position = { x, y };
        return this;
    }

    setAnchorPoint(x, y) {
        this.anchorPoint = { x, y };
        return this;
    }

    setZPosition(value) {
        this.zPosition = value;
        return this;
    }

    setOpacity(value) {
        this.opacity = value;
        return this;
    }

    setHidden(value) {
        this.isHidden = value;
        return this;
    }

    setBackgroundColor(color) {
        this.backgroundColor = color;
        return this;
    }

    setBorderColor(color) {
        this.borderColor = color;
        return this;
    }

    setBorderWidth(value) {
        this.borderWidth = value;
        return this;
    }

    setCornerRadius(value) {
        this.cornerRadius = value;
        return this;
    }

    setMasksToBounds(value) {
        this.masksToBounds = value;
        return this;
    }

    setShadowColor(color) {
        this.shadowColor = color;
        return this;
    }

    setShadowOpacity(value) {
        this.shadowOpacity = value;
        return this;
    }

    setShadowOffset(width, height) {
        this.shadowOffset = { width, height };
        return this;
    }

    setShadowRadius(value) {
        this.shadowRadius = value;
        return this;
    }

    setShadowPath(path) {
        this.shadowPath = path;
        return this;
    }

    setContents(contents) {
        this.contents = contents;
        return this;
    }

    setContentsGravity(value) {
        this.contentsGravity = value;
        return this;
    }

    setTransform(transform) {
        this.transform = transform;
        return this;
    }

    setMask(mask) {
        this.mask = mask;
        return this;
    }

    setIsDoubleSided(value) {
        this.isDoubleSided = value;
        return this;
    }

    withFrame(x, y, width, height) { return this.setFrame(x, y, width, height); }
    withBounds(x, y, width, height) { return this.setBounds(x, y, width, height); }
    withPosition(x, y) { return this.setPosition(x, y); }
    withAnchorPoint(x, y) { return this.setAnchorPoint(x, y); }
    withZPosition(value) { return this.setZPosition(value); }
    withOpacity(value) { return this.setOpacity(value); }
    withHidden(value) { return this.setHidden(value); }
    withBackgroundColor(color) { return this.setBackgroundColor(color); }
    withBorderColor(color) { return this.setBorderColor(color); }
    withBorderWidth(value) { return this.setBorderWidth(value); }
    withCornerRadius(value) { return this.setCornerRadius(value); }
    withMasksToBounds(value) { return this.setMasksToBounds(value); }
    withShadowColor(color) { return this.setShadowColor(color); }
    withShadowOpacity(value) { return this.setShadowOpacity(value); }
    withShadowOffset(width, height) { return this.setShadowOffset(width, height); }
    withShadowRadius(value) { return this.setShadowRadius(value); }
    withShadowPath(path) { return this.setShadowPath(path); }
    withContents(contents) { return this.setContents(contents); }
    withContentsGravity(value) { return this.setContentsGravity(value); }
    withTransform(transform) { return this.setTransform(transform); }
    withMask(mask) { return this.setMask(mask); }

    rotate(angle, axis = 'z') {
        const axes = axis === 'x' ? [1, 0, 0] : axis === 'y' ? [0, 1, 0] : [0, 0, 1];
        this.transform = this.transform.rotated(angle, axes[0], axes[1], axes[2]);
        return this;
    }

    scale(sx, sy, sz = 1) {
        this.transform = this.transform.scaled(sx, sy, sz);
        return this;
    }

    translate(tx, ty, tz = 0) {
        this.transform = this.transform.translated(tx, ty, tz);
        return this;
    }

    applyPerspective(m34 = -1 / 1000) {
        this.transform = this.transform.multiply(CATransform3D.MakePerspective(m34));
        return this;
    }

    insertSublayerBelow(layer, sibling) {
        const index = this._sublayers.indexOf(sibling);
        return this.insertSublayerAtIndex(layer, index >= 0 ? index : 0);
    }

    insertSublayerAbove(layer, sibling) {
        const index = this._sublayers.indexOf(sibling);
        return this.insertSublayerAtIndex(layer, index >= 0 ? index + 1 : this._sublayers.length);
    }

    sublayerIndex(layer) {
        return this._sublayers.indexOf(layer);
    }

    addAnimation(anim, forKey) {
        this._animations = this._animations || {};
        this._animations[forKey] = anim;
        if (this._delegate?.animationDidStart) {
            this._delegate.animationDidStart(anim);
        }
        return this;
    }

    removeAnimation(forKey) {
        if (this._animations && this._animations[forKey]) {
            delete this._animations[forKey];
        }
        return this;
    }

    removeAllAnimations() {
        this._animations = {};
        return this;
    }

    animationForKey(key) {
        return this._animations ? this._animations[key] : null;
    }

    animationKeys() {
        return this._animations ? Object.keys(this._animations) : [];
    }

    encode() {
        return {
            frame: this._frame,
            bounds: this._bounds,
            position: this._position,
            anchorPoint: this._anchorPoint,
            anchorPointZ: this._anchorPointZ,
            zPosition: this._zPosition,
            opacity: this._opacity,
            isHidden: this._isHidden,
            hidden: this._hidden,
            backgroundColor: this._backgroundColor?.hex || this._backgroundColor,
            borderColor: this._borderColor?.hex || this._borderColor,
            borderWidth: this._borderWidth,
            cornerRadius: this._cornerRadius,
            masksToBounds: this._masksToBounds,
            shadowColor: this._shadowColor?.hex || this._shadowColor,
            shadowOpacity: this._shadowOpacity,
            shadowOffset: this._shadowOffset,
            shadowRadius: this._shadowRadius,
            contents: this._contents,
            contentsGravity: this._contentsGravity,
            name: this._name
        };
    }

    clone() {
        const copy = new CALayer();
        copy._frame = { ...this._frame };
        copy._bounds = { ...this._bounds };
        copy._position = { ...this._position };
        copy._anchorPoint = { ...this._anchorPoint };
        copy._anchorPointZ = this._anchorPointZ;
        copy._zPosition = this._zPosition;
        copy._opacity = this._opacity;
        copy._isHidden = this._isHidden;
        copy._backgroundColor = this._backgroundColor;
        copy._borderColor = this._borderColor;
        copy._borderWidth = this._borderWidth;
        copy._cornerRadius = this._cornerRadius;
        copy._masksToBounds = this._masksToBounds;
        copy._shadowColor = this._shadowColor;
        copy._shadowOpacity = this._shadowOpacity;
        copy._shadowOffset = { ...this._shadowOffset };
        copy._shadowRadius = this._shadowRadius;
        copy._shadowPath = this._shadowPath;
        copy._contents = this._contents;
        copy._contentsGravity = this._contentsGravity;
        copy._transform = this._transform;
        copy._isDoubleSided = this._isDoubleSided;
        copy._geometryFlipped = this._geometryFlipped;
        copy._name = this._name;
        return copy;
    }

    static decode(data) {
        const layer = new CALayer();
        if (data.frame) layer.frame = data.frame;
        if (data.bounds) layer.bounds = data.bounds;
        if (data.position) layer.position = data.position;
        if (data.anchorPoint) layer.anchorPoint = data.anchorPoint;
        if (data.anchorPointZ !== undefined) layer.anchorPointZ = data.anchorPointZ;
        if (data.zPosition !== undefined) layer.zPosition = data.zPosition;
        if (data.opacity !== undefined) layer.opacity = data.opacity;
        if (data.isHidden !== undefined) layer.isHidden = data.isHidden;
        if (data.hidden !== undefined) layer._isHidden = data.hidden;
        if (data.backgroundColor) layer.backgroundColor = UIColor.colorWithHex(data.backgroundColor);
        if (data.borderColor) layer.borderColor = UIColor.colorWithHex(data.borderColor);
        if (data.borderWidth !== undefined) layer.borderWidth = data.borderWidth;
        if (data.cornerRadius !== undefined) layer.cornerRadius = data.cornerRadius;
        if (data.masksToBounds !== undefined) layer.masksToBounds = data.masksToBounds;
        if (data.shadowColor) layer.shadowColor = UIColor.colorWithHex(data.shadowColor);
        if (data.shadowOpacity !== undefined) layer.shadowOpacity = data.shadowOpacity;
        if (data.shadowOffset) layer.shadowOffset = data.shadowOffset;
        if (data.shadowRadius !== undefined) layer.shadowRadius = data.shadowRadius;
        if (data.contents) layer.contents = data.contents;
        if (data.contentsGravity) layer.contentsGravity = data.contentsGravity;
        if (data.name) layer.name = data.name;
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
        this._bounds = { x: 0, y: 0, width: 0, height: 0 };
    }

    static layer() {
        return new CAGradientLayer();
    }

    get colors() { return [...this._colors]; }
    set colors(value) {
        this._colors = value.map(c => c instanceof UIColor ? c : UIColor.colorWithHex(c));
    }

    get locations() { return [...this._locations]; }
    set locations(value) { this._locations = [...value]; }

    get startPoint() { return this._startPoint; }
    set startPoint(value) { this._startPoint = { ...value }; }

    get endPoint() { return this._endPoint; }
    set endPoint(value) { this._endPoint = { ...value }; }

    get type() { return this._type; }
    set type(value) { this._type = value; }

    setColors(colors) { this.colors = colors; return this; }
    setLocations(locations) { this.locations = locations; return this; }
    setStartPoint(point) { this.startPoint = point; return this; }
    setEndPoint(point) { this.endPoint = point; return this; }
    setType(type) { this.type = type; return this; }

    withColors(colors) { return this.setColors(colors); }
    withLocations(locations) { return this.setLocations(locations); }
    withStartPoint(point) { return this.setStartPoint(point); }
    withEndPoint(point) { return this.setEndPoint(point); }
    withType(type) { return this.setType(type); }
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
        this._miterLimit = 10;
        this._lineDashPhase = 0;
        this._lineDashPattern = [];
        this._fillRule = 'nonzero';
    }

    static layer() {
        return new CAShapeLayer();
    }

    static CreateCirclePath(centerX, centerY, radius) {
        return CGPath.CreateCircle(centerX, centerY, radius);
    }

    static CreateRectPath(x, y, width, height) {
        return CGPath.CreateRect(x, y, width, height);
    }

    static CreateRoundedRectPath(x, y, width, height, cornerRadius) {
        return CGPath.CreateRoundedRect(x, y, width, height, cornerRadius);
    }

    static CreateStarPath(centerX, centerY, outerRadius, innerRadius, points) {
        return CGPath.CreateStar(centerX, centerY, outerRadius, innerRadius, points);
    }

    get path() { return this._path; }
    set path(value) { this._path = value; }

    get fillColor() { return this._fillColor; }
    set fillColor(value) {
        if (value instanceof UIColor) this._fillColor = value;
        else if (typeof value === 'string') this._fillColor = UIColor.colorWithHex(value);
        else this._fillColor = null;
    }

    get strokeColor() { return this._strokeColor; }
    set strokeColor(value) {
        if (value instanceof UIColor) this._strokeColor = value;
        else if (typeof value === 'string') this._strokeColor = UIColor.colorWithHex(value);
        else this._strokeColor = null;
    }

    get lineWidth() { return this._lineWidth; }
    set lineWidth(value) { this._lineWidth = value; }

    get lineCap() { return this._lineCap; }
    set lineCap(value) { this._lineCap = value; }

    get lineJoin() { return this._lineJoin; }
    set lineJoin(value) { this._lineJoin = value; }

    get lineDashPhase() { return this._lineDashPhase; }
    set lineDashPhase(value) { this._lineDashPhase = value; }

    get lineDashPattern() { return [...this._lineDashPattern]; }
    set lineDashPattern(value) { this._lineDashPattern = [...value]; }

    get fillRule() { return this._fillRule; }
    set fillRule(value) { this._fillRule = value; }

    setPath(path) { this.path = path; return this; }
    setFillColor(color) { this.fillColor = color; return this; }
    setStrokeColor(color) { this.strokeColor = color; return this; }
    setLineWidth(value) { this.lineWidth = value; return this; }
    setLineCap(value) { this.lineCap = value; return this; }
    setLineJoin(value) { this.lineJoin = value; return this; }
    setLineDashPhase(value) { this.lineDashPhase = value; return this; }
    setLineDashPattern(pattern) { this.lineDashPattern = pattern; return this; }

    withPath(path) { return this.setPath(path); }
    withFillColor(color) { return this.setFillColor(color); }
    withStrokeColor(color) { return this.setStrokeColor(color); }
    withLineWidth(value) { return this.setLineWidth(value); }
    withLineCap(value) { return this.setLineCap(value); }
    withLineJoin(value) { return this.setLineJoin(value); }
}

describe('CALayer', () => {
    let layer;

    beforeEach(() => {
        layer = CALayer.layer();
    });

    describe('Initialization', () => {
        it('should initialize with default values', () => {
            assert.strictEqual(layer._frame.x, 0);
            assert.strictEqual(layer._frame.y, 0);
            assert.strictEqual(layer._frame.width, 0);
            assert.strictEqual(layer._frame.height, 0);
            assert.strictEqual(layer._anchorPoint.x, 0.5);
            assert.strictEqual(layer._anchorPoint.y, 0.5);
            assert.strictEqual(layer._opacity, 1);
            assert.strictEqual(layer._hidden, false);
            assert.deepStrictEqual(layer._sublayers, []);
            assert.strictEqual(layer._superlayer, null);
        });

        it('should create via static layer() method', () => {
            const layer2 = CALayer.layer();
            assert.strictEqual(layer2 instanceof CALayer, true);
        });
    });

    describe('Frame and Bounds', () => {
        it('should set frame and derive bounds', () => {
            layer.frame = { x: 10, y: 20, width: 100, height: 50 };
            assert.strictEqual(layer._frame.x, 10);
            assert.strictEqual(layer._frame.y, 20);
            assert.strictEqual(layer._frame.width, 100);
            assert.strictEqual(layer._frame.height, 50);
            assert.strictEqual(layer._bounds.width, 100);
            assert.strictEqual(layer._bounds.height, 50);
        });

        it('should calculate position from frame and anchor point', () => {
            layer._anchorPoint = { x: 0, y: 0 };
            layer.frame = { x: 10, y: 20, width: 100, height: 50 };
            assert.strictEqual(layer._position.x, 10);
            assert.strictEqual(layer._position.y, 20);
        });

        it('should set position directly', () => {
            layer.position = { x: 50, y: 50 };
            assert.strictEqual(layer._position.x, 50);
            assert.strictEqual(layer._position.y, 50);
        });

        it('should set bounds directly', () => {
            layer.bounds = { x: 0, y: 0, width: 100, height: 100 };
            assert.strictEqual(layer._bounds.width, 100);
            assert.strictEqual(layer._bounds.height, 100);
        });
    });

    describe('Anchor Point', () => {
        it('should set anchor point', () => {
            layer.anchorPoint = { x: 0.25, y: 0.75 };
            assert.strictEqual(layer._anchorPoint.x, 0.25);
            assert.strictEqual(layer._anchorPoint.y, 0.75);
        });

        it('should use default anchor point of (0.5, 0.5)', () => {
            assert.strictEqual(layer._anchorPoint.x, 0.5);
            assert.strictEqual(layer._anchorPoint.y, 0.5);
        });
    });

    describe('Visual Properties', () => {
        it('should set opacity', () => {
            layer.opacity = 0.5;
            assert.strictEqual(layer._opacity, 0.5);
        });

        it('should set hidden', () => {
            layer.hidden = true;
            assert.strictEqual(layer._hidden, true);
        });

        it('should set zPosition', () => {
            layer.zPosition = 100;
            assert.strictEqual(layer._zPosition, 100);
        });

        it('should set opaque', () => {
            layer.opaque = true;
            assert.strictEqual(layer._opaque, true);
            layer.opaque = false;
            assert.strictEqual(layer._opaque, false);
        });

        it('should set backgroundColor', () => {
            const color = new UIColor(1, 0, 0, 1);
            layer.backgroundColor = color;
            assert.strictEqual(layer._backgroundColor, color);
        });

        it('should set border properties', () => {
            layer.borderColor = new UIColor(0, 0, 0, 1);
            layer.borderWidth = 2;
            assert.strictEqual(layer._borderColor.r, 0);
            assert.strictEqual(layer._borderWidth, 2);
        });

        it('should set cornerRadius', () => {
            layer.cornerRadius = 10;
            assert.strictEqual(layer._cornerRadius, 10);
        });
    });

    describe('Sublayers', () => {
        it('should add sublayer', () => {
            const sublayer = CALayer.layer();
            layer.addSublayer(sublayer);
            assert.strictEqual(layer._sublayers.length, 1);
            assert.strictEqual(sublayer._superlayer, layer);
        });

        it('should not add same sublayer twice', () => {
            const sublayer = CALayer.layer();
            layer.addSublayer(sublayer);
            layer.addSublayer(sublayer);
            assert.strictEqual(layer._sublayers.length, 1);
        });

        it('should remove sublayer', () => {
            const sublayer = CALayer.layer();
            layer.addSublayer(sublayer);
            layer.removeSublayer(sublayer);
            assert.strictEqual(layer._sublayers.length, 0);
            assert.strictEqual(sublayer._superlayer, null);
        });

        it('should remove from superlayer', () => {
            const sublayer = CALayer.layer();
            layer.addSublayer(sublayer);
            sublayer.removeFromSuperlayer();
            assert.strictEqual(layer._sublayers.length, 0);
            assert.strictEqual(sublayer._superlayer, null);
        });

        it('should insert sublayer at index', () => {
            const sublayer1 = CALayer.layer();
            const sublayer2 = CALayer.layer();
            layer.addSublayer(sublayer1);
            layer.insertSublayerAtIndex(sublayer2, 0);
            assert.strictEqual(layer._sublayers[0], sublayer2);
        });

        it('should replace sublayer', () => {
            const sublayer1 = CALayer.layer();
            const sublayer2 = CALayer.layer();
            layer.addSublayer(sublayer1);
            layer.replaceSublayer(sublayer1, sublayer2);
            assert.strictEqual(layer._sublayers[0], sublayer2);
        });

        it('should get sublayers', () => {
            const sublayer1 = CALayer.layer();
            const sublayer2 = CALayer.layer();
            layer.addSublayer(sublayer1);
            layer.addSublayer(sublayer2);
            assert.strictEqual(layer.sublayers.length, 2);
        });
    });

    describe('Hit Testing', () => {
        it('should contain point within bounds', () => {
            layer._bounds = { x: 0, y: 0, width: 100, height: 100 };
            assert.strictEqual(layer.containsPoint({ x: 50, y: 50 }), true);
        });

        it('should not contain point outside bounds', () => {
            layer._bounds = { x: 0, y: 0, width: 100, height: 100 };
            assert.strictEqual(layer.containsPoint({ x: 150, y: 150 }), false);
        });

        it('should return null when hidden', () => {
            layer._hidden = true;
            layer._bounds = { x: 0, y: 0, width: 100, height: 100 };
            assert.strictEqual(layer.hitTest({ x: 50, y: 50 }), null);
        });

        it('should return null when opacity is 0', () => {
            layer._opacity = 0;
            layer._bounds = { x: 0, y: 0, width: 100, height: 100 };
            assert.strictEqual(layer.hitTest({ x: 50, y: 50 }), null);
        });

        it('should hit test sublayers', () => {
            const parent = CALayer.layer();
            parent._bounds = { x: 0, y: 0, width: 100, height: 100 };
            
            const child = CALayer.layer();
            child._bounds = { x: 0, y: 0, width: 50, height: 50 };
            parent.addSublayer(child);
            
            const result = parent.hitTest({ x: 25, y: 25 });
            assert.strictEqual(result, child);
        });
    });

    describe('Shadow', () => {
        it('should set shadow properties', () => {
            const result = layer.setShadow('black', { width: 5, height: 5 }, 10, 0.5);
            assert.strictEqual(layer._shadowColor, 'black');
            assert.strictEqual(layer._shadowOffset.width, 5);
            assert.strictEqual(layer._shadowOffset.height, 5);
            assert.strictEqual(layer._shadowRadius, 10);
            assert.strictEqual(layer._shadowOpacity, 0.5);
            assert.strictEqual(result, layer);
        });

        it('should chain with withShadow', () => {
            const result = layer.withShadow('black', { width: 5, height: 5 }, 10);
            assert.strictEqual(result, layer);
        });
    });

    describe('Chaining Methods', () => {
        it('should chain withBackgroundColor', () => {
            const result = layer.withBackgroundColor('red');
            assert.strictEqual(result, layer);
        });

        it('should chain withCornerRadius', () => {
            const result = layer.withCornerRadius(5);
            assert.strictEqual(result, layer);
        });

        it('should chain withBorder', () => {
            const result = layer.withBorder('blue', 2);
            assert.strictEqual(result, layer);
        });

        it('should chain withOpacity', () => {
            const result = layer.withOpacity(0.8);
            assert.strictEqual(result, layer);
        });

        it('should chain withTransform', () => {
            const t = CATransform3D.identity();
            const result = layer.withTransform(t);
            assert.strictEqual(result, layer);
        });

        it('should chain withName', () => {
            const result = layer.withName('testLayer');
            assert.strictEqual(result, layer);
            assert.strictEqual(layer._name, 'testLayer');
        });
    });

    describe('Encoding and Decoding', () => {
        it('should encode layer properties', () => {
            layer.frame = { x: 10, y: 20, width: 100, height: 50 };
            layer.anchorPoint = { x: 0.5, y: 0.5 };
            layer.opacity = 0.5;
            layer.hidden = true;
            
            const encoded = layer.encode();
            assert.strictEqual(encoded.frame.x, 10);
            assert.strictEqual(encoded.opacity, 0.5);
            assert.strictEqual(encoded.hidden, true);
        });

        it('should decode layer properties', () => {
            const data = {
                frame: { x: 10, y: 20, width: 100, height: 50 },
                bounds: { x: 0, y: 0, width: 100, height: 50 },
                position: { x: 60, y: 45 },
                anchorPoint: { x: 0.5, y: 0.5 },
                zPosition: 0,
                opacity: 0.5,
                hidden: false,
                backgroundColor: null,
                borderColor: null,
                borderWidth: 0,
                cornerRadius: 0
            };
            
            const decoded = CALayer.decode(data);
            assert.strictEqual(decoded._frame.x, 10);
            assert.strictEqual(decoded._opacity, 0.5);
        });
    });
});

describe('CATransform3D', () => {
    it('should create identity transform', () => {
        const t = CATransform3D.identity();
        assert.strictEqual(t.m11, 1);
        assert.strictEqual(t.m22, 1);
        assert.strictEqual(t.m33, 1);
        assert.strictEqual(t.m44, 1);
    });

    it('should create perspective transform', () => {
        const t = CATransform3D.MakePerspective(-0.002);
        assert.strictEqual(t.m34, -0.002);
    });

    it('should multiply transforms', () => {
        const t1 = CATransform3D.identity();
        const t2 = CATransform3D.identity();
        const result = t1.multiply(t2);
        assert.strictEqual(result instanceof CATransform3D, true);
    });

    it('should convert to CSS transform', () => {
        const t = CATransform3D.identity();
        const css = t.toCSSTransform();
        assert.strictEqual(css.includes('matrix3d'), true);
    });
});

describe('CGPath', () => {
    let path;

    beforeEach(() => {
        path = new CGPath();
    });

    it('should create empty path', () => {
        assert.strictEqual(path.isEmpty(), true);
    });

    it('should move to point', () => {
        path.moveToPoint({ x: 10, y: 20 });
        assert.strictEqual(path.isEmpty(), false);
    });

    it('should add line to point', () => {
        path.moveToPoint({ x: 0, y: 0 });
        path.addLineToPoint({ x: 100, y: 0 });
        path.addLineToPoint({ x: 100, y: 100 });
        path.addLineToPoint({ x: 0, y: 100 });
        path.closeSubpath();
        assert.strictEqual(path.isEmpty(), false);
    });

    it('should detect point inside polygon', () => {
        path.moveToPoint({ x: 0, y: 0 });
        path.addLineToPoint({ x: 100, y: 0 });
        path.addLineToPoint({ x: 100, y: 100 });
        path.addLineToPoint({ x: 0, y: 100 });
        path.closeSubpath();
        
        assert.strictEqual(path.containsPoint({ x: 50, y: 50 }), true);
        assert.strictEqual(path.containsPoint({ x: 150, y: 150 }), false);
    });

    it('should calculate bounding box', () => {
        path.moveToPoint({ x: 10, y: 20 });
        path.addLineToPoint({ x: 110, y: 20 });
        path.addLineToPoint({ x: 110, y: 120 });
        path.closeSubpath();
        
        const box = path.boundingBox;
        assert.strictEqual(box.x, 10);
        assert.strictEqual(box.y, 20);
        assert.strictEqual(box.width, 100);
        assert.strictEqual(box.height, 100);
    });

    it('should create rectangle path', () => {
        const rect = CGPath.CreateRect(0, 0, 100, 50);
        assert.strictEqual(rect.isEmpty(), false);
        assert.strictEqual(rect.containsPoint({ x: 50, y: 25 }), true);
    });

    it('should create circle path', () => {
        const circle = CGPath.CreateCircle(50, 50, 25);
        assert.strictEqual(circle.isEmpty(), false);
    });

    it('should return false for containsPoint on empty path', () => {
        assert.strictEqual(path.containsPoint({ x: 0, y: 0 }), false);
    });
});

describe('CAGradientLayer', () => {
    let gradient;

    beforeEach(() => {
        gradient = CAGradientLayer.layer();
    });

    it('should initialize with defaults', () => {
        assert.strictEqual(gradient._type, 'axial');
        assert.deepStrictEqual(gradient._startPoint, { x: 0.5, y: 0 });
        assert.deepStrictEqual(gradient._endPoint, { x: 0.5, y: 1 });
        assert.deepStrictEqual(gradient._colors, []);
    });

    it('should set colors', () => {
        gradient.colors = ['red', 'blue'];
        assert.strictEqual(gradient._colors.length, 2);
    });

    it('should set locations', () => {
        gradient.locations = [0, 1];
        assert.strictEqual(gradient._locations.length, 2);
    });

    it('should set start and end points', () => {
        gradient.startPoint = { x: 0, y: 0 };
        gradient.endPoint = { x: 1, y: 1 };
        assert.strictEqual(gradient._startPoint.x, 0);
        assert.strictEqual(gradient._endPoint.x, 1);
    });

    it('should chain setColors', () => {
        const result = gradient.setColors(['red', 'green', 'blue']);
        assert.strictEqual(result, gradient);
    });

    it('should chain setLocations', () => {
        const result = gradient.setLocations([0, 0.5, 1]);
        assert.strictEqual(result, gradient);
    });
});

describe('CAShapeLayer', () => {
    let shape;

    beforeEach(() => {
        shape = CAShapeLayer.layer();
    });

    it('should initialize with defaults', () => {
        assert.strictEqual(shape._path, null);
        assert.strictEqual(shape._fillColor, null);
        assert.strictEqual(shape._strokeColor, null);
        assert.strictEqual(shape._lineWidth, 1);
        assert.strictEqual(shape._lineCap, 'butt');
        assert.strictEqual(shape._lineJoin, 'miter');
    });

    it('should set path', () => {
        const rect = CGPath.CreateRect(0, 0, 100, 100);
        shape.path = rect;
        assert.strictEqual(shape._path, rect);
    });

    it('should set fill and stroke colors', () => {
        shape.fillColor = '#ff0000';
        shape.strokeColor = '#0000ff';
        assert.strictEqual(shape._fillColor instanceof UIColor, true);
        assert.strictEqual(shape._strokeColor instanceof UIColor, true);
    });

    it('should set line width', () => {
        shape.lineWidth = 3;
        assert.strictEqual(shape._lineWidth, 3);
    });

    it('should chain setPath', () => {
        const rect = CGPath.CreateRect(0, 0, 50, 50);
        const result = shape.setPath(rect);
        assert.strictEqual(result, shape);
    });

    it('should chain setFillColor', () => {
        const result = shape.setFillColor('green');
        assert.strictEqual(result, shape);
    });

    it('should chain setStrokeColor', () => {
        const result = shape.setStrokeColor('yellow');
        assert.strictEqual(result, shape);
    });
});

describe('Layer Hierarchy', () => {
    it('should maintain parent-child relationship', () => {
        const parent = CALayer.layer();
        const child = CALayer.layer();
        
        parent.addSublayer(child);
        
        assert.strictEqual(parent.sublayers.length, 1);
        assert.strictEqual(child.superlayer, parent);
    });

    it('should handle nested hierarchies', () => {
        const root = CALayer.layer();
        const child1 = CALayer.layer();
        const child2 = CALayer.layer();
        const grandchild = CALayer.layer();
        
        root.addSublayer(child1);
        root.addSublayer(child2);
        child1.addSublayer(grandchild);
        
        assert.strictEqual(root.sublayers.length, 2);
        assert.strictEqual(child1.sublayers.length, 1);
        assert.strictEqual(grandchild.superlayer, child1);
    });

    it('should move layer between parents', () => {
        const parent1 = CALayer.layer();
        const parent2 = CALayer.layer();
        const child = CALayer.layer();
        
        parent1.addSublayer(child);
        assert.strictEqual(child.superlayer, parent1);
        
        parent2.addSublayer(child);
        assert.strictEqual(child.superlayer, parent2);
        assert.strictEqual(parent1.sublayers.length, 0);
        assert.strictEqual(parent2.sublayers.length, 1);
    });
});

describe('CGPath Extended', () => {
    let path;

    beforeEach(() => {
        path = new CGPath();
    });

    describe('Path Creation', () => {
        it('should create empty path with Create()', () => {
            const p = CGPath.Create();
            assert.strictEqual(p instanceof CGPath, true);
            assert.strictEqual(p.isEmpty(), true);
        });

        it('should create rounded rectangle', () => {
            const rounded = CGPath.CreateRoundedRect(0, 0, 100, 100, 20);
            assert.strictEqual(rounded.isEmpty(), false);
            const box = rounded.boundingBox;
            assert.strictEqual(box.width, 100);
            assert.strictEqual(box.height, 100);
        });

        it('should create ellipse', () => {
            const ellipse = CGPath.CreateEllipse(0, 0, 50, 25);
            assert.strictEqual(ellipse.isEmpty(), false);
        });

        it('should create star', () => {
            const star = CGPath.CreateStar(50, 50, 40, 20, 5);
            assert.strictEqual(star.isEmpty(), false);
            assert.ok(star.containsPoint({ x: 50, y: 50 }));
        });

        it('should create line path', () => {
            const line = CGPath.CreateLine({ x: 0, y: 0 }, { x: 100, y: 100 });
            assert.strictEqual(line.isEmpty(), false);
        });

        it('should create polygon path', () => {
            const points = [
                { x: 0, y: 0 },
                { x: 50, y: 0 },
                { x: 25, y: 50 }
            ];
            const polygon = CGPath.CreatePolygon(points);
            assert.strictEqual(polygon.isEmpty(), false);
            assert.ok(polygon.containsPoint({ x: 25, y: 25 }));
        });
    });

    describe('Path Operations', () => {
        it('should add quad curve', () => {
            path.moveToPoint(0, 0);
            path.addQuadCurveToPoint({ x: 100, y: 0 }, { x: 50, y: 50 });
            assert.strictEqual(path.isEmpty(), false);
        });

        it('should add arc', () => {
            path.addArcAtPoint(50, 50, 25, 0, Math.PI, false);
            assert.strictEqual(path.isEmpty(), false);
        });

        it('should add arc to point', () => {
            path.moveToPoint(0, 0);
            path.addArcToPoint(50, 0, 50, 50, 25);
            assert.strictEqual(path.isEmpty(), false);
        });

        it('should add path', () => {
            const path1 = CGPath.CreateRect(0, 0, 50, 50);
            const path2 = CGPath.CreateRect(50, 50, 50, 50);
            path1.addPath(path2);
            assert.strictEqual(path1.isEmpty(), false);
        });

        it('should copy path', () => {
            path.moveToPoint(10, 20);
            path.addLineToPoint(100, 200);
            const copy = path.copy();
            assert.strictEqual(copy.isEmpty(), false);
        });

        it('should get bounding rect', () => {
            path.moveToPoint(10, 20);
            path.addLineToPoint(110, 120);
            const rect = path.boundingRect();
            assert.strictEqual(rect.x, 10);
            assert.strictEqual(rect.y, 20);
            assert.strictEqual(rect.width, 100);
            assert.strictEqual(rect.height, 100);
        });

        it('should union paths', () => {
            const path1 = CGPath.CreateRect(0, 0, 50, 50);
            const path2 = CGPath.CreateRect(25, 25, 50, 50);
            const union = path1.unionPath(path2);
            assert.strictEqual(union.isEmpty(), false);
        });

        it('should transform path', () => {
            path.moveToPoint(10, 10);
            path.addLineToPoint(50, 50);
            const transform = CGAffineTransform.MakeScale(2, 2);
            const transformed = path.transformBy(transform);
            assert.strictEqual(transformed.isEmpty(), false);
        });
    });
});

describe('CGAffineTransform', () => {
    it('should create rotation transform', () => {
        const t = CGAffineTransform.MakeRotation(Math.PI / 2);
        assert.strictEqual(Math.abs(t.a) < 0.001, true);
        assert.strictEqual(Math.abs(t.b - 1) < 0.001, true);
    });

    it('should create scale transform', () => {
        const t = CGAffineTransform.MakeScale(2, 3);
        assert.strictEqual(t.a, 2);
        assert.strictEqual(t.d, 3);
    });

    it('should create translation transform', () => {
        const t = CGAffineTransform.MakeTranslation(10, 20);
        assert.strictEqual(t.tx, 10);
        assert.strictEqual(t.ty, 20);
    });

    it('should chain rotation', () => {
        const t = CGAffineTransform.identity().rotated(Math.PI / 4);
        assert.strictEqual(t instanceof CGAffineTransform, true);
    });

    it('should chain scale', () => {
        const t = CGAffineTransform.identity().scaled(2, 2);
        assert.strictEqual(t.a, 2);
        assert.strictEqual(t.d, 2);
    });

    it('should chain translation', () => {
        const t = CGAffineTransform.identity().translated(5, 10);
        assert.strictEqual(t.tx, 5);
        assert.strictEqual(t.ty, 10);
    });

    it('should multiply transforms', () => {
        const t1 = CGAffineTransform.MakeScale(2, 2);
        const t2 = CGAffineTransform.MakeTranslation(10, 10);
        const result = t1.multiply(t2);
        assert.strictEqual(result instanceof CGAffineTransform, true);
    });

    it('should invert transform', () => {
        const t = CGAffineTransform.MakeScale(2, 2);
        const inv = t.inverted();
        assert.strictEqual(inv.a, 0.5);
        assert.strictEqual(inv.d, 0.5);
    });

    it('should return null when inverting singular matrix', () => {
        const t = new CGAffineTransform();
        t.a = 0; t.b = 0; t.c = 0; t.d = 0;
        assert.strictEqual(t.inverted(), null);
    });

    it('should check isIdentity', () => {
        const identity = CGAffineTransform.identity();
        assert.strictEqual(identity.isIdentity(), true);
        const scaled = CGAffineTransform.MakeScale(2, 2);
        assert.strictEqual(scaled.isIdentity(), false);
    });

    it('should convert to array', () => {
        const t = CGAffineTransform.identity();
        const arr = t.toArray();
        assert.strictEqual(arr.length, 6);
        assert.deepStrictEqual(arr, [1, 0, 0, 1, 0, 0]);
    });

    it('should concat transforms', () => {
        const t1 = CGAffineTransform.identity();
        const t2 = CGAffineTransform.MakeScale(2, 2);
        const result = t1.concat(t2);
        assert.strictEqual(result instanceof CGAffineTransform, true);
    });
});

describe('CATransform3D Extended', () => {
    it('should create rotation transform with axis', () => {
        const t = CATransform3D.MakeRotation(Math.PI / 2, 0, 0, 1);
        assert.strictEqual(t instanceof CATransform3D, true);
    });

    it('should create scale transform with z', () => {
        const t = CATransform3D.MakeScale(2, 3, 4);
        assert.strictEqual(t.m11, 2);
        assert.strictEqual(t.m22, 3);
        assert.strictEqual(t.m33, 4);
    });

    it('should create translation transform with z', () => {
        const t = CATransform3D.MakeTranslation(1, 2, 3);
        assert.strictEqual(t.m41, 1);
        assert.strictEqual(t.m42, 2);
        assert.strictEqual(t.m43, 3);
    });

    it('should chain rotation', () => {
        const t = CATransform3D.identity().rotated(Math.PI / 4, 0, 0, 1);
        assert.strictEqual(t instanceof CATransform3D, true);
    });

    it('should chain scale with z', () => {
        const t = CATransform3D.identity().scaled(2, 2, 2);
        assert.strictEqual(t.m11, 2);
        assert.strictEqual(t.m22, 2);
        assert.strictEqual(t.m33, 2);
    });

    it('should chain translation with z', () => {
        const t = CATransform3D.identity().translated(1, 2, 3);
        assert.strictEqual(t.m41, 1);
        assert.strictEqual(t.m42, 2);
        assert.strictEqual(t.m43, 3);
    });

    it('should use multiplied alias', () => {
        const t1 = CATransform3D.identity();
        const t2 = CATransform3D.MakeScale(2, 2, 2);
        const result = t1.multiplied(t2);
        assert.strictEqual(result instanceof CATransform3D, true);
    });

    it('should convert to CSS with anchor', () => {
        const t = CATransform3D.identity();
        const css = t.toCSSTransformWithAnchor(0.5, 0.5, 100, 100);
        assert.strictEqual(typeof css, 'string');
        assert.ok(css.includes('matrix3d'));
    });

    it('should check isIdentity', () => {
        const identity = CATransform3D.identity();
        assert.strictEqual(identity.isIdentity(), true);
        const rotated = CATransform3D.MakeRotation(Math.PI / 4, 0, 0, 1);
        assert.strictEqual(rotated.isIdentity(), false);
    });

    it('should invert transform', () => {
        const t = CATransform3D.MakeScale(2, 2, 2);
        const inv = t.inverted();
        assert.strictEqual(inv instanceof CATransform3D, true);
        assert.strictEqual(inv.m11, 0.5);
    });
});

describe('CALayer Extended', () => {
    let layer;

    beforeEach(() => {
        layer = CALayer.layer();
    });

    describe('Additional Properties', () => {
        it('should set anchorPointZ', () => {
            layer.anchorPointZ = 100;
            assert.strictEqual(layer._anchorPointZ, 100);
        });

        it('should set isHidden', () => {
            layer.isHidden = true;
            assert.strictEqual(layer._isHidden, true);
        });

        it('should set masksToBounds', () => {
            layer.masksToBounds = true;
            assert.strictEqual(layer._masksToBounds, true);
        });

        it('should set shadowPath', () => {
            const shadowPath = CGPath.CreateRect(0, 0, 100, 100);
            layer.shadowPath = shadowPath;
            assert.strictEqual(layer._shadowPath, shadowPath);
        });

        it('should set contents', () => {
            layer.contents = 'data:image/png;base64,abc123';
            assert.strictEqual(layer._contents, 'data:image/png;base64,abc123');
        });

        it('should set contentsGravity', () => {
            layer.contentsGravity = 'resizeAspect';
            assert.strictEqual(layer._contentsGravity, 'resizeAspect');
        });

        it('should set mask', () => {
            const maskLayer = CALayer.layer();
            layer.mask = maskLayer;
            assert.strictEqual(layer._mask, maskLayer);
        });

        it('should set isDoubleSided', () => {
            layer.isDoubleSided = false;
            assert.strictEqual(layer._isDoubleSided, false);
        });

        it('should set geometryFlipped', () => {
            layer.geometryFlipped = true;
            assert.strictEqual(layer._geometryFlipped, true);
        });

        it('should set name', () => {
            layer.name = 'testLayer';
            assert.strictEqual(layer._name, 'testLayer');
        });

        it('should set delegate', () => {
            const delegate = { test: true };
            layer.delegate = delegate;
            assert.strictEqual(layer._delegate, delegate);
        });

        it('should get presentationLayer', () => {
            assert.strictEqual(layer.presentationLayer, layer);
        });

        it('should get modelLayer', () => {
            assert.strictEqual(layer.modelLayer, layer);
        });

        it('should set opaque', () => {
            layer.opaque = true;
            assert.strictEqual(layer._opaque, true);
        });

        it('should set shouldRasterize', () => {
            layer.shouldRasterize = true;
            assert.strictEqual(layer._shouldRasterize, true);
        });

        it('should set rasterizationScale', () => {
            layer.rasterizationScale = 2;
            assert.strictEqual(layer._rasterizationScale, 2);
        });

        it('should clamp opacity between 0 and 1', () => {
            layer.opacity = 2;
            assert.strictEqual(layer._opacity, 1);
            layer.opacity = -1;
            assert.strictEqual(layer._opacity, 0);
        });
    });

    describe('Sublayer Insertion', () => {
        it('should insert sublayer below', () => {
            const sublayer1 = CALayer.layer();
            const sublayer2 = CALayer.layer();
            layer.addSublayer(sublayer1);
            layer.insertSublayerBelow(sublayer2, sublayer1);
            assert.strictEqual(layer.sublayers[0], sublayer2);
        });

        it('should insert sublayer above', () => {
            const sublayer1 = CALayer.layer();
            const sublayer2 = CALayer.layer();
            layer.addSublayer(sublayer1);
            layer.insertSublayerAbove(sublayer2, sublayer1);
            assert.strictEqual(layer.sublayers[1], sublayer2);
        });

        it('should get sublayer index', () => {
            const sublayer = CALayer.layer();
            layer.addSublayer(sublayer);
            assert.strictEqual(layer.sublayerIndex(sublayer), 0);
            assert.strictEqual(layer.sublayerIndex(CALayer.layer()), -1);
        });
    });

    describe('Animation Support', () => {
        it('should add animation', () => {
            const anim = { duration: 1 };
            layer.addAnimation(anim, 'testKey');
            assert.strictEqual(layer.animationForKey('testKey'), anim);
        });

        it('should remove animation', () => {
            const anim = { duration: 1 };
            layer.addAnimation(anim, 'testKey');
            layer.removeAnimation('testKey');
            assert.strictEqual(layer.animationForKey('testKey'), undefined);
        });

        it('should remove all animations', () => {
            layer.addAnimation({ duration: 1 }, 'key1');
            layer.addAnimation({ duration: 2 }, 'key2');
            layer.removeAllAnimations();
            assert.strictEqual(layer.animationKeys().length, 0);
        });

        it('should get animation keys', () => {
            layer.addAnimation({ duration: 1 }, 'key1');
            layer.addAnimation({ duration: 2 }, 'key2');
            const keys = layer.animationKeys();
            assert.strictEqual(keys.length, 2);
            assert.ok(keys.includes('key1'));
            assert.ok(keys.includes('key2'));
        });
    });

    describe('Setter Methods', () => {
        it('should chain setFrame', () => {
            const result = layer.setFrame(10, 20, 100, 50);
            assert.strictEqual(result, layer);
            assert.strictEqual(layer._frame.width, 100);
        });

        it('should chain setBounds', () => {
            const result = layer.setBounds(0, 0, 100, 100);
            assert.strictEqual(result, layer);
            assert.strictEqual(layer._bounds.width, 100);
        });

        it('should chain setPosition', () => {
            const result = layer.setPosition(50, 50);
            assert.strictEqual(result, layer);
            assert.strictEqual(layer._position.x, 50);
        });

        it('should chain setAnchorPoint', () => {
            const result = layer.setAnchorPoint(0.25, 0.75);
            assert.strictEqual(result, layer);
            assert.strictEqual(layer._anchorPoint.x, 0.25);
        });

        it('should chain setShadowOpacity', () => {
            const result = layer.setShadowOpacity(0.5);
            assert.strictEqual(result, layer);
            assert.strictEqual(layer._shadowOpacity, 0.5);
        });

        it('should chain setShadowOffset', () => {
            const result = layer.setShadowOffset(5, 10);
            assert.strictEqual(result, layer);
            assert.strictEqual(layer._shadowOffset.width, 5);
            assert.strictEqual(layer._shadowOffset.height, 10);
        });

        it('should chain setShadowPath', () => {
            const shadowPath = CGPath.CreateRect(0, 0, 100, 100);
            const result = layer.setShadowPath(shadowPath);
            assert.strictEqual(result, layer);
            assert.strictEqual(layer._shadowPath, shadowPath);
        });

        it('should chain setContentsGravity', () => {
            const result = layer.setContentsGravity('resizeAspectFill');
            assert.strictEqual(result, layer);
            assert.strictEqual(layer._contentsGravity, 'resizeAspectFill');
        });

        it('should chain setIsDoubleSided', () => {
            const result = layer.setIsDoubleSided(false);
            assert.strictEqual(result, layer);
            assert.strictEqual(layer._isDoubleSided, false);
        });
    });

    describe('Transform Methods', () => {
        it('should rotate layer', () => {
            const result = layer.rotate(Math.PI / 4);
            assert.strictEqual(result, layer);
            assert.strictEqual(layer._transform instanceof CATransform3D, true);
        });

        it('should rotate around x axis', () => {
            layer.rotate(Math.PI / 4, 'x');
            assert.strictEqual(layer._transform instanceof CATransform3D, true);
        });

        it('should rotate around y axis', () => {
            layer.rotate(Math.PI / 4, 'y');
            assert.strictEqual(layer._transform instanceof CATransform3D, true);
        });

        it('should scale layer', () => {
            const result = layer.scale(2, 3);
            assert.strictEqual(result, layer);
            assert.strictEqual(layer._transform.m11, 2);
            assert.strictEqual(layer._transform.m22, 3);
        });

        it('should translate layer', () => {
            const result = layer.translate(10, 20);
            assert.strictEqual(result, layer);
            assert.strictEqual(layer._transform.m41, 10);
            assert.strictEqual(layer._transform.m42, 20);
        });

        it('should translate with z', () => {
            layer.translate(10, 20, 5);
            assert.strictEqual(layer._transform.m43, 5);
        });

        it('should apply perspective', () => {
            const result = layer.applyPerspective();
            assert.strictEqual(result, layer);
            assert.strictEqual(layer._transform instanceof CATransform3D, true);
        });
    });

    describe('With Methods', () => {
        it('should chain withFrame', () => {
            const result = layer.withFrame(10, 20, 100, 50);
            assert.strictEqual(result, layer);
        });

        it('should chain withBounds', () => {
            const result = layer.withBounds(0, 0, 100, 100);
            assert.strictEqual(result, layer);
        });

        it('should chain withPosition', () => {
            const result = layer.withPosition(50, 50);
            assert.strictEqual(result, layer);
        });

        it('should chain withShadowColor', () => {
            const result = layer.withShadowColor('#000');
            assert.strictEqual(result, layer);
        });

        it('should chain withShadowOpacity', () => {
            const result = layer.withShadowOpacity(0.5);
            assert.strictEqual(result, layer);
        });

        it('should chain withShadowOffset', () => {
            const result = layer.withShadowOffset(5, 10);
            assert.strictEqual(result, layer);
        });

        it('should chain withShadowRadius', () => {
            const result = layer.withShadowRadius(10);
            assert.strictEqual(result, layer);
        });

        it('should chain withShadowPath', () => {
            const shadowPath = CGPath.CreateRect(0, 0, 100, 100);
            const result = layer.withShadowPath(shadowPath);
            assert.strictEqual(result, layer);
        });

        it('should chain withContents', () => {
            const result = layer.withContents('data:image/png;base64,abc');
            assert.strictEqual(result, layer);
        });

        it('should chain withContentsGravity', () => {
            const result = layer.withContentsGravity('resizeAspect');
            assert.strictEqual(result, layer);
        });

        it('should chain withTransform', () => {
            const t = CATransform3D.identity();
            const result = layer.withTransform(t);
            assert.strictEqual(result, layer);
        });

        it('should chain withMask', () => {
            const mask = CALayer.layer();
            const result = layer.withMask(mask);
            assert.strictEqual(result, layer);
        });

        it('should chain withName', () => {
            const result = layer.withName('layerName');
            assert.strictEqual(result, layer);
            assert.strictEqual(layer.name, 'layerName');
        });
    });

    describe('Clone', () => {
        it('should clone layer', () => {
            layer.frame = { x: 10, y: 20, width: 100, height: 50 };
            layer.backgroundColor = UIColor.red();
            const clone = layer.clone();
            assert.strictEqual(clone._frame.x, 10);
            assert.strictEqual(clone._frame.width, 100);
            assert.strictEqual(clone._backgroundColor instanceof UIColor, true);
        });

        it('should clone layer properties independently', () => {
            layer.opacity = 0.5;
            const clone = layer.clone();
            clone.opacity = 1;
            assert.strictEqual(layer._opacity, 0.5);
            assert.strictEqual(clone._opacity, 1);
        });
    });

    describe('Encode and Decode Extended', () => {
        it('should encode shadow properties', () => {
            layer.shadowColor = UIColor.black();
            layer.shadowOpacity = 0.5;
            layer.shadowOffset = { width: 5, height: 10 };
            layer.shadowRadius = 10;
            
            const encoded = layer.encode();
            assert.strictEqual(encoded.shadowOpacity, 0.5);
            assert.strictEqual(encoded.shadowOffset.width, 5);
        });

        it('should encode contents properties', () => {
            layer.contents = 'data:image/png;base64,abc';
            layer.contentsGravity = 'resizeAspect';
            
            const encoded = layer.encode();
            assert.strictEqual(encoded.contents, 'data:image/png;base64,abc');
            assert.strictEqual(encoded.contentsGravity, 'resizeAspect');
        });

        it('should decode shadow properties', () => {
            const data = {
                frame: { x: 0, y: 0, width: 100, height: 100 },
                bounds: { x: 0, y: 0, width: 100, height: 100 },
                position: { x: 50, y: 50 },
                anchorPoint: { x: 0.5, y: 0.5 },
                shadowColor: '#000000',
                shadowOpacity: 0.5,
                shadowOffset: { width: 5, height: 5 },
                shadowRadius: 10
            };
            
            const decoded = CALayer.decode(data);
            assert.strictEqual(decoded._shadowOpacity, 0.5);
            assert.strictEqual(decoded._shadowRadius, 10);
        });
    });
});

describe('CAGradientLayer Extended', () => {
    let gradient;

    beforeEach(() => {
        gradient = CAGradientLayer.layer();
    });

    describe('Additional Properties', () => {
        it('should set type', () => {
            gradient.type = 'radial';
            assert.strictEqual(gradient._type, 'radial');
        });

        it('should set colors with hex strings', () => {
            gradient.colors = ['#ff0000', '#00ff00'];
            assert.strictEqual(gradient._colors.length, 2);
        });
    });

    describe('Additional Methods', () => {
        it('should set type', () => {
            const result = gradient.setType('radial');
            assert.strictEqual(result, gradient);
            assert.strictEqual(gradient._type, 'radial');
        });

        it('should chain withColors', () => {
            const result = gradient.withColors(['#ff0000', '#00ff00']);
            assert.strictEqual(result, gradient);
        });

        it('should chain withLocations', () => {
            const result = gradient.withLocations([0, 0.5, 1]);
            assert.strictEqual(result, gradient);
        });

        it('should chain withStartPoint', () => {
            const result = gradient.withStartPoint({ x: 0, y: 0 });
            assert.strictEqual(result, gradient);
        });

        it('should chain withEndPoint', () => {
            const result = gradient.withEndPoint({ x: 1, y: 1 });
            assert.strictEqual(result, gradient);
        });

        it('should chain withType', () => {
            const result = gradient.withType('radial');
            assert.strictEqual(result, gradient);
        });
    });
});

describe('CAShapeLayer Extended', () => {
    let shape;

    beforeEach(() => {
        shape = CAShapeLayer.layer();
    });

    describe('Additional Properties', () => {
        it('should set lineCap', () => {
            shape.lineCap = 'round';
            assert.strictEqual(shape._lineCap, 'round');
        });

        it('should set lineJoin', () => {
            shape.lineJoin = 'round';
            assert.strictEqual(shape._lineJoin, 'round');
        });

        it('should set lineDashPhase', () => {
            shape.lineDashPhase = 5;
            assert.strictEqual(shape._lineDashPhase, 5);
        });

        it('should set lineDashPattern', () => {
            shape.lineDashPattern = [10, 5];
            assert.deepStrictEqual(shape._lineDashPattern, [10, 5]);
        });

        it('should set fillRule', () => {
            shape.fillRule = 'evenodd';
            assert.strictEqual(shape._fillRule, 'evenodd');
        });

        it('should accept hex string for fillColor', () => {
            shape.fillColor = '#ff0000';
            assert.strictEqual(shape._fillColor instanceof UIColor, true);
        });

        it('should accept hex string for strokeColor', () => {
            shape.strokeColor = '#0000ff';
            assert.strictEqual(shape._strokeColor instanceof UIColor, true);
        });
    });

    describe('Additional Methods', () => {
        it('should chain setLineCap', () => {
            const result = shape.setLineCap('round');
            assert.strictEqual(result, shape);
        });

        it('should chain setLineJoin', () => {
            const result = shape.setLineJoin('round');
            assert.strictEqual(result, shape);
        });

        it('should chain setLineDashPhase', () => {
            const result = shape.setLineDashPhase(5);
            assert.strictEqual(result, shape);
        });

        it('should chain setLineDashPattern', () => {
            const result = shape.setLineDashPattern([10, 5]);
            assert.strictEqual(result, shape);
        });

        it('should chain withPath', () => {
            const path = CGPath.CreateRect(0, 0, 100, 100);
            const result = shape.withPath(path);
            assert.strictEqual(result, shape);
        });

        it('should chain withFillColor', () => {
            const result = shape.withFillColor('#ff0000');
            assert.strictEqual(result, shape);
        });

        it('should chain withStrokeColor', () => {
            const result = shape.withStrokeColor('#0000ff');
            assert.strictEqual(result, shape);
        });

        it('should chain withLineWidth', () => {
            const result = shape.withLineWidth(5);
            assert.strictEqual(result, shape);
        });

        it('should chain withLineCap', () => {
            const result = shape.withLineCap('round');
            assert.strictEqual(result, shape);
        });

        it('should chain withLineJoin', () => {
            const result = shape.withLineJoin('round');
            assert.strictEqual(result, shape);
        });
    });

    describe('Static Path Creation', () => {
        it('should create circle path', () => {
            const path = CAShapeLayer.CreateCirclePath(50, 50, 25);
            assert.strictEqual(path instanceof CGPath, true);
        });

        it('should create rect path', () => {
            const path = CAShapeLayer.CreateRectPath(0, 0, 100, 100);
            assert.strictEqual(path instanceof CGPath, true);
        });

        it('should create rounded rect path', () => {
            const path = CAShapeLayer.CreateRoundedRectPath(0, 0, 100, 100, 20);
            assert.strictEqual(path instanceof CGPath, true);
        });

        it('should create star path', () => {
            const path = CAShapeLayer.CreateStarPath(50, 50, 40, 20, 5);
            assert.strictEqual(path instanceof CGPath, true);
        });
    });
});

describe('CATextLayer', () => {
    let textLayer;

    beforeEach(() => {
        textLayer = CATextLayer.layer();
    });

    it('should initialize with defaults', () => {
        assert.strictEqual(textLayer._string, '');
        assert.strictEqual(textLayer._fontSize, 14);
        assert.strictEqual(textLayer._textAlignment, 'left');
        assert.strictEqual(textLayer._isWrapped, true);
        assert.strictEqual(textLayer._truncationMode, 'end');
        assert.strictEqual(textLayer._maximumNumberOfLines, 0);
    });

    describe('Properties', () => {
        it('should set string', () => {
            textLayer.string = 'Hello World';
            assert.strictEqual(textLayer._string, 'Hello World');
        });

        it('should set font', () => {
            textLayer.font = '16px Arial';
            assert.strictEqual(textLayer._font, '16px Arial');
        });

        it('should set font with numeric size', () => {
            textLayer.font = 20;
            assert.strictEqual(textLayer._fontSize, 20);
            assert.strictEqual(textLayer._font.includes('20px'), true);
        });

        it('should set fontSize', () => {
            textLayer.fontSize = 18;
            assert.strictEqual(textLayer._fontSize, 18);
        });

        it('should set textColor with UIColor', () => {
            textLayer.textColor = UIColor.blue();
            assert.strictEqual(textLayer._textColor instanceof UIColor, true);
        });

        it('should set textColor with hex string', () => {
            textLayer.textColor = '#ff0000';
            assert.strictEqual(textLayer._textColor instanceof UIColor, true);
        });

        it('should set textAlignment', () => {
            textLayer.textAlignment = 'center';
            assert.strictEqual(textLayer._textAlignment, 'center');
        });

        it('should set isWrapped', () => {
            textLayer.isWrapped = false;
            assert.strictEqual(textLayer._isWrapped, false);
        });

        it('should set truncationMode', () => {
            textLayer.truncationMode = 'middle';
            assert.strictEqual(textLayer._truncationMode, 'middle');
        });

        it('should set maximumNumberOfLines', () => {
            textLayer.maximumNumberOfLines = 3;
            assert.strictEqual(textLayer._maximumNumberOfLines, 3);
        });
    });

    describe('Methods', () => {
        it('should chain setString', () => {
            const result = textLayer.setString('test');
            assert.strictEqual(result, textLayer);
        });

        it('should chain setFont', () => {
            const result = textLayer.setFont('Arial');
            assert.strictEqual(result, textLayer);
        });

        it('should chain setFontSize', () => {
            const result = textLayer.setFontSize(16);
            assert.strictEqual(result, textLayer);
        });

        it('should chain setTextColor', () => {
            const result = textLayer.setTextColor('#000');
            assert.strictEqual(result, textLayer);
        });

        it('should chain setTextAlignment', () => {
            const result = textLayer.setTextAlignment('right');
            assert.strictEqual(result, textLayer);
        });

        it('should chain setWrapped', () => {
            const result = textLayer.setWrapped(false);
            assert.strictEqual(result, textLayer);
        });

        it('should chain setTruncationMode', () => {
            const result = textLayer.setTruncationMode('start');
            assert.strictEqual(result, textLayer);
        });

        it('should chain setMaximumNumberOfLines', () => {
            const result = textLayer.setMaximumNumberOfLines(2);
            assert.strictEqual(result, textLayer);
        });

        it('should chain withString', () => {
            const result = textLayer.withString('test');
            assert.strictEqual(result, textLayer);
        });

        it('should chain withFont', () => {
            const result = textLayer.withFont('Arial');
            assert.strictEqual(result, textLayer);
        });

        it('should chain withFontSize', () => {
            const result = textLayer.withFontSize(16);
            assert.strictEqual(result, textLayer);
        });

        it('should chain withTextColor', () => {
            const result = textLayer.withTextColor('#000');
            assert.strictEqual(result, textLayer);
        });

        it('should chain withTextAlignment', () => {
            const result = textLayer.withTextAlignment('center');
            assert.strictEqual(result, textLayer);
        });
    });
});

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

    static layer() {
        return new CATextLayer();
    }

    get string() { return this._string; }
    set string(value) { this._string = value; }

    get font() { return this._font; }
    set font(value) {
        this._font = value;
        if (typeof value === 'number') {
            this._fontSize = value;
            this._font = `${value}px system-ui`;
        }
    }

    get fontSize() { return this._fontSize; }
    set fontSize(value) {
        this._fontSize = value;
        this._font = `${value}px system-ui`;
    }

    get textColor() { return this._textColor; }
    set textColor(value) {
        if (value instanceof UIColor) this._textColor = value;
        else if (typeof value === 'string') this._textColor = UIColor.colorWithHex(value);
    }

    get textAlignment() { return this._textAlignment; }
    set textAlignment(value) { this._textAlignment = value; }

    get isWrapped() { return this._isWrapped; }
    set isWrapped(value) { this._isWrapped = value; }

    get truncationMode() { return this._truncationMode; }
    set truncationMode(value) { this._truncationMode = value; }

    get maximumNumberOfLines() { return this._maximumNumberOfLines; }
    set maximumNumberOfLines(value) { this._maximumNumberOfLines = value; }

    setString(value) { this.string = value; return this; }
    setFont(font) { this.font = font; return this; }
    setFontSize(size) { this.fontSize = size; return this; }
    setTextColor(color) { this.textColor = color; return this; }
    setTextAlignment(alignment) { this.textAlignment = alignment; return this; }
    setWrapped(wrapped) { this.isWrapped = wrapped; return this; }
    setTruncationMode(mode) { this.truncationMode = mode; return this; }
    setMaximumNumberOfLines(lines) { this.maximumNumberOfLines = lines; return this; }

    withString(value) { return this.setString(value); }
    withFont(font) { return this.setFont(font); }
    withFontSize(size) { return this.setFontSize(size); }
    withTextColor(color) { return this.setTextColor(color); }
    withTextAlignment(alignment) { return this.setTextAlignment(alignment); }
}

class CAEmitterLayer extends CALayer {
    constructor() {
        super();
        this._emitterPosition = { x: 0, y: 0 };
        this._emitterSize = { width: 0, height: 0 };
        this._emitterShape = 'point';
        this._emitterMode = 'outline';
        this._birthRate = 0;
        this._lifetime = 0;
        this._emissionRange = 0;
        this._emissionPoint = { x: 0, y: 0 };
        this._velocity = 0;
        this._velocityRange = 0;
        this._scale = 1;
        this._scaleRange = 0;
        this._spin = 0;
        this._spinRange = 0;
        this._contents = null;
        this._color = UIColor.white();
        this._alphaSpeed = -0.1;
        this._birthRateSpeed = 0;
        this._isActive = false;
        this._particles = [];
        this._emissionRate = 10;
    }

    static layer() {
        return new CAEmitterLayer();
    }

    get emitterPosition() { return this._emitterPosition; }
    set emitterPosition(value) { this._emitterPosition = { ...value }; }

    get emitterSize() { return this._emitterSize; }
    set emitterSize(value) { this._emitterSize = { ...value }; }

    get emitterShape() { return this._emitterShape; }
    set emitterShape(value) { this._emitterShape = value; }

    get emitterMode() { return this._emitterMode; }
    set emitterMode(value) { this._emitterMode = value; }

    get birthRate() { return this._birthRate; }
    set birthRate(value) { this._birthRate = value; }

    get lifetime() { return this._lifetime; }
    set lifetime(value) { this._lifetime = value; }

    get emissionRange() { return this._emissionRange; }
    set emissionRange(value) { this._emissionRange = value; }

    get velocity() { return this._velocity; }
    set velocity(value) { this._velocity = value; }

    get velocityRange() { return this._velocityRange; }
    set velocityRange(value) { this._velocityRange = value; }

    get scale() { return this._scale; }
    set scale(value) { this._scale = value; }

    get scaleRange() { return this._scaleRange; }
    set scaleRange(value) { this._scaleRange = value; }

    get spin() { return this._spin; }
    set spin(value) { this._spin = value; }

    get spinRange() { return this._spinRange; }
    set spinRange(value) { this._spinRange = value; }

    get color() { return this._color; }
    set color(value) {
        if (value instanceof UIColor) this._color = value;
        else if (typeof value === 'string') this._color = UIColor.colorWithHex(value);
    }

    get alphaSpeed() { return this._alphaSpeed; }
    set alphaSpeed(value) { this._alphaSpeed = value; }

    get emissionRate() { return this._emissionRate; }
    set emissionRate(value) { this._emissionRate = value; }
}

describe('CAEmitterLayer', () => {
    let emitter;

    beforeEach(() => {
        emitter = CAEmitterLayer.layer();
    });

    it('should initialize with defaults', () => {
        assert.strictEqual(emitter._emitterShape, 'point');
        assert.strictEqual(emitter._emitterMode, 'outline');
        assert.strictEqual(emitter._birthRate, 0);
        assert.strictEqual(emitter._lifetime, 0);
        assert.strictEqual(emitter._velocity, 0);
        assert.strictEqual(emitter._scale, 1);
    });

    describe('Emitter Properties', () => {
        it('should set emitterPosition', () => {
            emitter._emitterPosition = { x: 100, y: 200 };
            assert.strictEqual(emitter._emitterPosition.x, 100);
        });

        it('should set emitterSize', () => {
            emitter._emitterSize = { width: 50, height: 50 };
            assert.strictEqual(emitter._emitterSize.width, 50);
        });

        it('should set emitterShape', () => {
            emitter._emitterShape = 'rectangle';
            assert.strictEqual(emitter._emitterShape, 'rectangle');
        });

        it('should set emitterMode', () => {
            emitter._emitterMode = 'volume';
            assert.strictEqual(emitter._emitterMode, 'volume');
        });

        it('should set birthRate', () => {
            emitter._birthRate = 100;
            assert.strictEqual(emitter._birthRate, 100);
        });

        it('should set lifetime', () => {
            emitter._lifetime = 5;
            assert.strictEqual(emitter._lifetime, 5);
        });

        it('should set emissionRange', () => {
            emitter._emissionRange = Math.PI;
            assert.strictEqual(emitter._emissionRange, Math.PI);
        });

        it('should set velocity', () => {
            emitter._velocity = 100;
            assert.strictEqual(emitter._velocity, 100);
        });

        it('should set velocityRange', () => {
            emitter._velocityRange = 50;
            assert.strictEqual(emitter._velocityRange, 50);
        });

        it('should set scale', () => {
            emitter._scale = 2;
            assert.strictEqual(emitter._scale, 2);
        });

        it('should set scaleRange', () => {
            emitter._scaleRange = 1;
            assert.strictEqual(emitter._scaleRange, 1);
        });

        it('should set spin', () => {
            emitter._spin = Math.PI;
            assert.strictEqual(emitter._spin, Math.PI);
        });

        it('should set spinRange', () => {
            emitter._spinRange = Math.PI / 2;
            assert.strictEqual(emitter._spinRange, Math.PI / 2);
        });

        it('should set emissionRate', () => {
            emitter._emissionRate = 50;
            assert.strictEqual(emitter._emissionRate, 50);
        });
    });
});
