import { Equatable, Hashable } from './Protocol.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';

class CGPoint {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    get description() {
        return `CGPoint(x: ${this.x}, y: ${this.y})`;
    }

    toString() {
        return `{${this.x}, ${this.y}}`;
    }

    static zero() {
        return new CGPoint(0, 0);
    }

    static from(obj) {
        if (obj instanceof CGPoint) return obj;
        if (obj && typeof obj === 'object') {
            return new CGPoint(obj.x || 0, obj.y || 0);
        }
        return new CGPoint(0, 0);
    }

    isEqual(other) {
        if (!(other instanceof CGPoint)) return false;
        return this.x === other.x && this.y === other.y;
    }

    equals(other) {
        return this.isEqual(other);
    }

    hashCode() {
        return (this.x * 31 + this.y) | 0;
    }

    distance(to) {
        const dx = this.x - to.x;
        const dy = this.y - to.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalized() {
        const mag = this.magnitude();
        if (mag === 0) return new CGPoint(0, 0);
        return new CGPoint(this.x / mag, this.y / mag);
    }

    adding(point) {
        return new CGPoint(this.x + point.x, this.y + point.y);
    }

    subtracting(point) {
        return new CGPoint(this.x - point.x, this.y - point.y);
    }

    multipliedBy(scalar) {
        return new CGPoint(this.x * scalar, this.y * scalar);
    }

    dividedBy(scalar) {
        return new CGPoint(this.x / scalar, this.y / scalar);
    }

    dotProduct(point) {
        return this.x * point.x + this.y * point.y;
    }

    crossProduct(point) {
        return this.x * point.y - this.y * point.x;
    }

    applying(transform) {
        if (typeof transform === 'function') {
            return transform(this);
        }
        return this;
    }

    clamped(toRect) {
        return new CGPoint(
            Math.max(toRect.minX, Math.min(this.x, toRect.maxX)),
            Math.max(toRect.minY, Math.min(this.y, toRect.maxY))
        );
    }

    lerp(to, t) {
        return new CGPoint(
            this.x + (to.x - this.x) * t,
            this.y + (to.y - this.y) * t
        );
    }

    midPoint(to) {
        return this.lerp(to, 0.5);
    }

    patternMatch(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        if (typeof predicate === 'object') {
            return Switch(predicate)
                .case('zero', () => this.x === 0 && this.y === 0)
                .case({ x: Switch.let('xVal'), y: Switch.let('yVal') }, 
                      (m) => this.x === m.xVal && this.y === m.yVal)
                .case({ near: Switch.let('other') }, 
                      (m) => this.distance(CGPoint.from(m.other)) < 0.0001)
                .case({ magnitude: Switch.let('mag') }, 
                      (m) => Math.abs(this.magnitude() - mag) < 0.0001)
                .default(() => false)
                .evaluate();
        }
        return false;
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

    switch() {
        return Switch(this);
    }
}

class CGSize {
    constructor(width = 0, height = 0) {
        this.width = width;
        this.height = height;
    }

    get description() {
        return `CGSize(width: ${this.width}, height: ${this.height})`;
    }

    toString() {
        return `{${this.width}, ${this.height}}`;
    }

    static zero() {
        return new CGSize(0, 0);
    }

    static from(obj) {
        if (obj instanceof CGSize) return obj;
        if (obj && typeof obj === 'object') {
            return new CGSize(obj.width || 0, obj.height || 0);
        }
        return new CGSize(0, 0);
    }

    isEqual(other) {
        if (!(other instanceof CGSize)) return false;
        return this.width === other.width && this.height === other.height;
    }

    equals(other) {
        return this.isEqual(other);
    }

    hashCode() {
        return (this.width * 31 + this.height) | 0;
    }

    aspectRatio() {
        if (this.height === 0) return 0;
        return this.width / this.height;
    }

    area() {
        return this.width * this.height;
    }

    perimeter() {
        return 2 * (this.width + this.height);
    }

    scaled(by) {
        if (typeof by === 'number') {
            return new CGSize(this.width * by, this.height * by);
        }
        return new CGSize(this.width * by.width, this.height * by.height);
    }

    adding(size) {
        return new CGSize(this.width + size.width, this.height + size.height);
    }

    subtracting(size) {
        return new CGSize(this.width - size.width, this.height - size.height);
    }

    applying(transform) {
        if (typeof transform === 'function') {
            return transform(this);
        }
        return this;
    }

    fitting(into) {
        const widthRatio = into.width / this.width;
        const heightRatio = into.height / this.height;
        const scale = Math.min(widthRatio, heightRatio);
        return this.scaled(scale);
    }

    filling(into) {
        const widthRatio = into.width / this.width;
        const heightRatio = into.height / this.height;
        const scale = Math.max(widthRatio, heightRatio);
        return this.scaled(scale);
    }

    patternMatch(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        if (typeof predicate === 'object') {
            return Switch(predicate)
                .case('zero', () => this.width === 0 && this.height === 0)
                .case({ width: Switch.let('w'), height: Switch.let('h') }, 
                      (m) => this.width === m.w && this.height === m.h)
                .case({ aspectRatio: Switch.let('ratio') }, 
                      (m) => Math.abs(this.aspectRatio() - ratio) < 0.0001)
                .case({ area: Switch.let('a') }, 
                      (m) => Math.abs(this.area() - a) < 0.0001)
                .default(() => false)
                .evaluate();
        }
        return false;
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

    switch() {
        return Switch(this);
    }
}

class CGRect {
    constructor(x = 0, y = 0, width = 0, height = 0) {
        this.origin = new CGPoint(x, y);
        this.size = new CGSize(width, height);
    }

    get x() { return this.origin.x; }
    get y() { return this.origin.y; }
    get width() { return this.size.width; }
    get height() { return this.size.height; }

    set x(val) { this.origin.x = val; }
    set y(val) { this.origin.y = val; }
    set width(val) { this.size.width = val; }
    set height(val) { this.size.height = val; }

    get description() {
        return `CGRect(x: ${this.x}, y: ${this.y}, width: ${this.width}, height: ${this.height})`;
    }

    toString() {
        return `{{${this.x}, ${this.y}}, {${this.width}, ${this.height}}}`;
    }

    static zero() {
        return new CGRect(0, 0, 0, 0);
    }

    static from(obj) {
        if (obj instanceof CGRect) return obj;
        if (obj && typeof obj === 'object') {
            if (obj.origin && obj.size) {
                return new CGRect(
                    obj.origin.x || 0,
                    obj.origin.y || 0,
                    obj.size.width || 0,
                    obj.size.height || 0
                );
            }
            return new CGRect(obj.x || 0, obj.y || 0, obj.width || 0, obj.height || 0);
        }
        return new CGRect(0, 0, 0, 0);
    }

    static union(rects) {
        if (!rects || rects.length === 0) return CGRect.zero();
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const rect of rects) {
            const r = CGRect.from(rect);
            minX = Math.min(minX, r.minX);
            minY = Math.min(minY, r.minY);
            maxX = Math.max(maxX, r.maxX);
            maxY = Math.max(maxY, r.maxY);
        }
        return new CGRect(minX, minY, maxX - minX, maxY - minY);
    }

    static intersection(a, b) {
        const r1 = CGRect.from(a);
        const r2 = CGRect.from(b);
        const x1 = Math.max(r1.minX, r2.minX);
        const y1 = Math.max(r1.minY, r2.minY);
        const x2 = Math.min(r1.maxX, r2.maxX);
        const y2 = Math.min(r1.maxY, r2.maxY);
        if (x2 < x1 || y2 < y1) return CGRect.zero();
        return new CGRect(x1, y1, x2 - x1, y2 - y1);
    }

    isEqual(other) {
        if (!(other instanceof CGRect)) return false;
        return this.origin.isEqual(other.origin) && this.size.isEqual(other.size);
    }

    equals(other) {
        return this.isEqual(other);
    }

    hashCode() {
        return (this.origin.hashCode() * 31 + this.size.hashCode()) | 0;
    }

    get minX() { return this.x; }
    get maxX() { return this.x + this.width; }
    get minY() { return this.y; }
    get maxY() { return this.y + this.height; }

    get midX() { return this.x + this.width / 2; }
    get midY() { return this.y + this.height / 2; }

    get center() { return new CGPoint(this.midX, this.midY); }
    get area() { return this.width * this.height; }
    get perimeter() { return 2 * (this.width + this.height); }

    get isEmpty() { return this.width === 0 || this.height === 0; }
    get isNull() { return this.width === 0 && this.height === 0 && this.x === 0 && this.y === 0; }

    contains(point) {
        const p = CGPoint.from(point);
        return p.x >= this.minX && p.x <= this.maxX && p.y >= this.minY && p.y <= this.maxY;
    }

    intersects(other) {
        const r = CGRect.from(other);
        return !(r.maxX < this.minX || r.minX > this.maxX || r.maxY < this.minY || r.minY > this.maxY);
    }

    intersection(other) {
        return CGRect.intersection(this, other);
    }

    union(other) {
        return CGRect.union([this, other]);
    }

    insetBy(top, right, bottom, left) {
        return new CGRect(
            this.x + left,
            this.y + top,
            this.width - left - right,
            this.height - top - bottom
        );
    }

    insetByAmount(amount) {
        if (typeof amount === 'number') {
            return this.insetBy(amount, amount, amount, amount);
        }
        return this.insetBy(amount.top || 0, amount.right || 0, amount.bottom || 0, amount.left || 0);
    }

    offsetBy(dx, dy) {
        return new CGRect(this.x + dx, this.y + dy, this.width, this.height);
    }

    offsetTo(x, y) {
        return new CGRect(x, y, this.width, this.height);
    }

    standardized() {
        let x = this.x, y = this.y, w = this.width, h = this.height;
        if (w < 0) { x = x + w; w = -w; }
        if (h < 0) { y = y + h; h = -h; }
        return new CGRect(x, y, w, h);
    }

    applying(transform) {
        if (typeof transform === 'function') {
            return transform(this);
        }
        return this;
    }

    dividing(by, fromEdge) {
        const amount = typeof by === 'number' ? by : by.amount || 0;
        switch (fromEdge) {
            case 'top':
                return {
                    first: new CGRect(this.x, this.y, this.width, amount),
                    second: new CGRect(this.x, this.y + amount, this.width, this.height - amount)
                };
            case 'bottom':
                return {
                    first: new CGRect(this.x, this.y + this.height - amount, this.width, amount),
                    second: new CGRect(this.x, this.y, this.width, this.height - amount)
                };
            case 'left':
                return {
                    first: new CGRect(this.x, this.y, amount, this.height),
                    second: new CGRect(this.x + amount, this.y, this.width - amount, this.height)
                };
            case 'right':
                return {
                    first: new CGRect(this.x + this.width - amount, this.y, amount, this.height),
                    second: new CGRect(this.x, this.y, this.width - amount, this.height)
                };
            default:
                return { first: this, second: this };
        }
    }

    patternMatch(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        if (typeof predicate === 'object') {
            return Switch(predicate)
                .case('zero', () => this.isEmpty)
                .case('null', () => this.isNull)
                .case('empty', () => this.isEmpty)
                .case({ contains: Switch.let('point') }, (m) => this.contains(CGPoint.from(m.point)))
                .case({ intersects: Switch.let('rect') }, (m) => this.intersects(CGRect.from(m.rect)))
                .case({ x: Switch.let('xVal'), y: Switch.let('yVal'), width: Switch.let('w'), height: Switch.let('h') }, 
                      (m) => this.x === m.xVal && this.y === m.yVal && this.width === m.w && this.height === m.h)
                .case({ minX: Switch.let('min'), maxX: Switch.let('max'), minY: Switch.let('minY'), maxY: Switch.let('maxY') }, 
                      (m) => this.minX === m.min && this.maxX === m.max && this.minY === m.minY && this.maxY === m.maxY)
                .default(() => false)
                .evaluate();
        }
        return false;
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

    switch() {
        return Switch(this);
    }
}

export {
    CGPoint,
    CGSize,
    CGRect
};

export default {
    CGPoint,
    CGSize,
    CGRect
};
