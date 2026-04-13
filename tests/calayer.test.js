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
        this.m = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }

    static identity() {
        return new CATransform3D();
    }

    static MakePerspective(m34 = -0.001) {
        const t = new CATransform3D();
        t.m[10] = m34;
        return t;
    }

    multiply(other) {
        const result = new CATransform3D();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result.m[i * 4 + j] = 0;
                for (let k = 0; k < 4; k++) {
                    result.m[i * 4 + j] += this.m[i * 4 + k] * other.m[k * 4 + j];
                }
            }
        }
        return result;
    }

    toCSSTransform() {
        return `matrix3d(${this.m.join(',')})`;
    }
}

class CGPath {
    constructor() {
        this._elements = [];
        this._currentPoint = { x: 0, y: 0 };
    }

    moveToPoint(point) {
        this._currentPoint = point;
        this._elements.push({ type: 'moveTo', point });
    }

    addLineToPoint(point) {
        this._elements.push({ type: 'lineTo', point });
        this._currentPoint = point;
    }

    addCurveToPoint(endPoint, controlPoint1, controlPoint2) {
        this._elements.push({ type: 'curveTo', endPoint, controlPoint1, controlPoint2 });
        this._currentPoint = endPoint;
    }

    closeSubpath() {
        this._elements.push({ type: 'close' });
    }

    isEmpty() {
        return this._elements.length === 0;
    }

    containsPoint_(point) {
        if (this._elements.length === 0) return false;
        
        let x = point.x, y = point.y;
        let inside = false;
        
        for (let i = 0, j = this._elements.length - 1; i < this._elements.length; j = i++) {
            const pi = this._elements[i].point;
            const pj = this._elements[j].point;
            
            if (!pi || !pj) continue;
            
            if (((pi.y > y) !== (pj.y > y)) &&
                (x < (pj.x - pi.x) * (y - pi.y) / (pj.y - pi.y) + pi.x)) {
                inside = !inside;
            }
        }
        
        return inside;
    }

    boundingBox() {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        for (const el of this._elements) {
            if (!el.point) continue;
            minX = Math.min(minX, el.point.x);
            minY = Math.min(minY, el.point.y);
            maxX = Math.max(maxX, el.point.x);
            maxY = Math.max(maxY, el.point.y);
        }
        
        if (minX === Infinity) return { x: 0, y: 0, width: 0, height: 0 };
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
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
        this._zPosition = 0;
        this._opacity = 1;
        this._hidden = false;
        this._contents = null;
        this._backgroundColor = null;
        this._borderColor = null;
        this._borderWidth = 0;
        this._cornerRadius = 0;
        this._shadowColor = null;
        this._shadowOffset = { width: 0, height: 0 };
        this._shadowRadius = 0;
        this._shadowOpacity = 0;
        this._masksToBounds = false;
        this._transform = CATransform3D.identity();
        this._transform3D = CATransform3D.identity();
        this._sublayers = [];
        this._superlayer = null;
        this._delegate = null;
        this._name = null;
        this._opaque = false;
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
    set opacity(value) { this._opacity = value; }

    get hidden() { return this._hidden; }
    set hidden(value) { this._hidden = value; }

    get backgroundColor() { return this._backgroundColor; }
    set backgroundColor(value) { this._backgroundColor = value; }

    get borderColor() { return this._borderColor; }
    set borderColor(value) { this._borderColor = value; }

    get borderWidth() { return this._borderWidth; }
    set borderWidth(value) { this._borderWidth = value; }

    get cornerRadius() { return this._cornerRadius; }
    set cornerRadius(value) { this._cornerRadius = value; }

    get masksToBounds() { return this._masksToBounds; }
    set masksToBounds(value) { this._masksToBounds = value; }

    get shadowColor() { return this._shadowColor; }
    get shadowOffset() { return this._shadowOffset; }
    get shadowRadius() { return this._shadowRadius; }
    get shadowOpacity() { return this._shadowOpacity; }

    get transform() { return this._transform; }
    set transform(value) { this._transform = value; }

    get transform3D() { return this._transform3D; }
    set transform3D(value) { this._transform3D = value; }

    get opaque() { return this._opaque; }
    set opaque(value) { this._opaque = value; }

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

    encode() {
        return {
            frame: this._frame,
            bounds: this._bounds,
            position: this._position,
            anchorPoint: this._anchorPoint,
            zPosition: this._zPosition,
            opacity: this._opacity,
            hidden: this._hidden,
            backgroundColor: this._backgroundColor,
            borderColor: this._borderColor,
            borderWidth: this._borderWidth,
            cornerRadius: this._cornerRadius
        };
    }

    static decode(data) {
        const layer = new CALayer();
        layer._frame = data.frame;
        layer._bounds = data.bounds;
        layer._position = data.position;
        layer._anchorPoint = data.anchorPoint;
        layer._zPosition = data.zPosition;
        layer._opacity = data.opacity;
        layer._hidden = data.hidden;
        layer._backgroundColor = data.backgroundColor;
        layer._borderColor = data.borderColor;
        layer._borderWidth = data.borderWidth;
        layer._cornerRadius = data.cornerRadius;
        return layer;
    }
}

class CAGradientLayer extends CALayer {
    constructor() {
        super();
        this._colors = [];
        this._locations = null;
        this._startPoint = { x: 0.5, y: 0 };
        this._endPoint = { x: 0.5, y: 1 };
        this._type = 'axial';
    }

    static layer() {
        return new CAGradientLayer();
    }

    get colors() { return this._colors; }
    set colors(value) { this._colors = value; }

    get locations() { return this._locations; }
    set locations(value) { this._locations = value; }

    get startPoint() { return this._startPoint; }
    set startPoint(value) { this._startPoint = value; }

    get endPoint() { return this._endPoint; }
    set endPoint(value) { this._endPoint = value; }

    get type() { return this._type; }
    set type(value) { this._type = value; }

    setColors(colors) { this._colors = colors; return this; }
    setLocations(locations) { this._locations = locations; return this; }
    setStartPoint(point) { this._startPoint = point; return this; }
    setEndPoint(point) { this._endPoint = point; return this; }
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
        this._lineDashPattern = null;
        this._fillRule = 'nonzero';
    }

    static layer() {
        return new CAShapeLayer();
    }

    get path() { return this._path; }
    set path(value) { this._path = value; }

    get fillColor() { return this._fillColor; }
    set fillColor(value) { this._fillColor = value; }

    get strokeColor() { return this._strokeColor; }
    set strokeColor(value) { this._strokeColor = value; }

    get lineWidth() { return this._lineWidth; }
    set lineWidth(value) { this._lineWidth = value; }

    setPath(path) { this._path = path; return this; }
    setFillColor(color) { this._fillColor = color; return this; }
    setStrokeColor(color) { this._strokeColor = color; return this; }
    setLineWidth(width) { this._lineWidth = width; return this; }
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
        assert.strictEqual(t.m[0], 1);
        assert.strictEqual(t.m[5], 1);
        assert.strictEqual(t.m[10], 1);
        assert.strictEqual(t.m[15], 1);
    });

    it('should create perspective transform', () => {
        const t = CATransform3D.MakePerspective(-0.002);
        assert.strictEqual(t.m[10], -0.002);
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
        
        const box = path.boundingBox();
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
        shape.fillColor = 'red';
        shape.strokeColor = 'blue';
        assert.strictEqual(shape._fillColor, 'red');
        assert.strictEqual(shape._strokeColor, 'blue');
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
