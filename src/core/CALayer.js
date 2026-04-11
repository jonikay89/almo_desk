import { CGPoint, CGSize, CGRect } from './CGGeometry.js';
import UIColor from './UIColor.js';

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

    scaled(sx, sy, sz) {
        return this.multiply(CATransform3D.MakeScale(sx, sy, sz));
    }

    translated(tx, ty, tz) {
        return this.multiply(CATransform3D.MakeTranslation(tx, ty, tz));
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
        this._actions = {};
        this._style = {};
        this._presentationLayer = null;
        this._modelLayer = null;
    }

    static layer() {
        return new CALayer();
    }

    get frame() {
        return this._frame;
    }

    set frame(value) {
        this._frame = { ...value };
        this._bounds = { x: 0, y: 0, width: value.width, height: value.height };
        this._position = {
            x: value.x + this._anchorPoint.x * value.width,
            y: value.y + this._anchorPoint.y * value.height
        };
    }

    get bounds() {
        return this._bounds;
    }

    set bounds(value) {
        this._bounds = { ...value };
        this._frame = {
            x: this._position.x - this._anchorPoint.x * value.width,
            y: this._position.y - this._anchorPoint.y * value.height,
            width: value.width,
            height: value.height
        };
    }

    get position() {
        return this._position;
    }

    set position(value) {
        this._position = { ...value };
        this._frame = {
            x: value.x - this._anchorPoint.x * this._bounds.width,
            y: value.y - this._anchorPoint.y * this._bounds.height,
            width: this._bounds.width,
            height: this._bounds.height
        };
    }

    get anchorPoint() {
        return this._anchorPoint;
    }

    set anchorPoint(value) {
        const oldAnchor = this._anchorPoint;
        this._anchorPoint = { ...value };
        if (this._frame.width && this._frame.height) {
            const dx = (value.x - oldAnchor.x) * this._frame.width;
            const dy = (value.y - oldAnchor.y) * this._frame.height;
            this._position = {
                x: this._position.x + dx,
                y: this._position.y + dy
            };
        }
    }

    get anchorPointZ() {
        return this._anchorPointZ;
    }

    set anchorPointZ(value) {
        this._anchorPointZ = value;
    }

    get zPosition() {
        return this._zPosition;
    }

    set zPosition(value) {
        this._zPosition = value;
    }

    get opacity() {
        return this._opacity;
    }

    set opacity(value) {
        this._opacity = Math.max(0, Math.min(1, value));
    }

    get isHidden() {
        return this._isHidden;
    }

    set isHidden(value) {
        this._isHidden = value;
    }

    get backgroundColor() {
        return this._backgroundColor;
    }

    set backgroundColor(value) {
        if (value instanceof UIColor) {
            this._backgroundColor = value;
        } else if (typeof value === 'string') {
            this._backgroundColor = UIColor.colorWithHex(value);
        } else {
            this._backgroundColor = null;
        }
    }

    get borderColor() {
        return this._borderColor;
    }

    set borderColor(value) {
        if (value instanceof UIColor) {
            this._borderColor = value;
        } else if (typeof value === 'string') {
            this._borderColor = UIColor.colorWithHex(value);
        } else {
            this._borderColor = null;
        }
    }

    get borderWidth() {
        return this._borderWidth;
    }

    set borderWidth(value) {
        this._borderWidth = value;
    }

    get cornerRadius() {
        return this._cornerRadius;
    }

    set cornerRadius(value) {
        this._cornerRadius = value;
    }

    get masksToBounds() {
        return this._masksToBounds;
    }

    set masksToBounds(value) {
        this._masksToBounds = value;
    }

    get shadowColor() {
        return this._shadowColor;
    }

    set shadowColor(value) {
        if (value instanceof UIColor) {
            this._shadowColor = value;
        } else if (typeof value === 'string') {
            this._shadowColor = UIColor.colorWithHex(value);
        } else {
            this._shadowColor = null;
        }
    }

    get shadowOpacity() {
        return this._shadowOpacity;
    }

    set shadowOpacity(value) {
        this._shadowOpacity = Math.max(0, Math.min(1, value));
    }

    get shadowOffset() {
        return this._shadowOffset;
    }

    set shadowOffset(value) {
        this._shadowOffset = { ...value };
    }

    get shadowRadius() {
        return this._shadowRadius;
    }

    set shadowRadius(value) {
        this._shadowRadius = value;
    }

    get shadowPath() {
        return this._shadowPath;
    }

    set shadowPath(value) {
        this._shadowPath = value;
    }

    get contents() {
        return this._contents;
    }

    set contents(value) {
        this._contents = value;
    }

    get contentsGravity() {
        return this._contentsGravity;
    }

    set contentsGravity(value) {
        this._contentsGravity = value;
    }

    get transform() {
        return this._transform;
    }

    set transform(value) {
        this._transform = value;
    }

    get sublayers() {
        return [...this._sublayers];
    }

    get superlayer() {
        return this._superlayer;
    }

    get mask() {
        return this._mask;
    }

    set mask(value) {
        this._mask = value;
    }

    get isDoubleSided() {
        return this._isDoubleSided;
    }

    set isDoubleSided(value) {
        this._isDoubleSided = value;
    }

    get geometryFlipped() {
        return this._geometryFlipped;
    }

    set geometryFlipped(value) {
        this._geometryFlipped = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get delegate() {
        return this._delegate;
    }

    set delegate(value) {
        this._delegate = value;
    }

    get presentationLayer() {
        return this._presentationLayer || this;
    }

    get modelLayer() {
        return this._modelLayer || this;
    }

    addSublayer(layer) {
        if (layer._superlayer) {
            layer._superlayer.removeSublayer(layer);
        }
        layer._superlayer = this;
        this._sublayers.push(layer);
        return this;
    }

    insertSublayer(layer, atIndex) {
        if (layer._superlayer) {
            layer._superlayer.removeSublayer(layer);
        }
        layer._superlayer = this;
        atIndex = Math.max(0, Math.min(atIndex, this._sublayers.length));
        this._sublayers.splice(atIndex, 0, layer);
        return this;
    }

    insertSublayerBelow(layer, sibling) {
        const index = this._sublayers.indexOf(sibling);
        if (index >= 0) {
            return this.insertSublayer(layer, index);
        }
        return this.insertSublayer(layer, 0);
    }

    insertSublayerAbove(layer, sibling) {
        const index = this._sublayers.indexOf(sibling);
        if (index >= 0) {
            return this.insertSublayer(layer, index + 1);
        }
        return this.addSublayer(layer);
    }

    replaceSublayer(oldLayer, newLayer) {
        const index = this._sublayers.indexOf(oldLayer);
        if (index >= 0) {
            oldLayer._superlayer = null;
            newLayer._superlayer = this;
            this._sublayers[index] = newLayer;
        }
        return this;
    }

    removeSublayer(layer) {
        const index = this._sublayers.indexOf(layer);
        if (index >= 0) {
            this._sublayers.splice(index, 1);
            layer._superlayer = null;
        }
        return this;
    }

    removeFromSuperlayer() {
        if (this._superlayer) {
            this._superlayer.removeSublayer(this);
        }
        return this;
    }

    insertSublayerAtIndex(layer, index) {
        return this.insertSublayer(layer, index);
    }

    sublayerIndex(layer) {
        return this._sublayers.indexOf(layer);
    }

    addAnimation(anim, forKey) {
        this._animations = this._animations || {};
        this._animations[forKey] = anim;
        if (this._delegate && typeof this._delegate.animationDidStart === 'function') {
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

    withFrame(x, y, width, height) {
        return this.setFrame(x, y, width, height);
    }

    withBounds(x, y, width, height) {
        return this.setBounds(x, y, width, height);
    }

    withPosition(x, y) {
        return this.setPosition(x, y);
    }

    withAnchorPoint(x, y) {
        return this.setAnchorPoint(x, y);
    }

    withZPosition(value) {
        return this.setZPosition(value);
    }

    withOpacity(value) {
        return this.setOpacity(value);
    }

    withHidden(value) {
        return this.setHidden(value);
    }

    withBackgroundColor(color) {
        return this.setBackgroundColor(color);
    }

    withBorderColor(color) {
        return this.setBorderColor(color);
    }

    withBorderWidth(value) {
        return this.setBorderWidth(value);
    }

    withCornerRadius(value) {
        return this.setCornerRadius(value);
    }

    withMasksToBounds(value) {
        return this.setMasksToBounds(value);
    }

    withShadowColor(color) {
        return this.setShadowColor(color);
    }

    withShadowOpacity(value) {
        return this.setShadowOpacity(value);
    }

    withShadowOffset(width, height) {
        return this.setShadowOffset(width, height);
    }

    withShadowRadius(value) {
        return this.setShadowRadius(value);
    }

    withShadowPath(path) {
        return this.setShadowPath(path);
    }

    withContents(contents) {
        return this.setContents(contents);
    }

    withContentsGravity(value) {
        return this.setContentsGravity(value);
    }

    withTransform(transform) {
        return this.setTransform(transform);
    }

    withMask(mask) {
        return this.setMask(mask);
    }

    withName(name) {
        this.name = name;
        return this;
    }

    rotate(angle, axis = 'z') {
        const axes = { x: 1, y: 0, z: 0 };
        if (axis === 'x') axes.x = 1, axes.y = 0, axes.z = 0;
        else if (axis === 'y') axes.x = 0, axes.y = 1, axes.z = 0;
        else axes.x = 0, axes.y = 0, axes.z = 1;
        
        this.transform = this.transform.rotated(angle, axes.x, axes.y, axes.z);
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

    renderToContext(ctx) {
        if (this._isHidden) return;

        ctx.save();
        
        ctx.globalAlpha = this._opacity;

        const anchorX = this._anchorPoint.x * this._bounds.width;
        const anchorY = this._anchorPoint.y * this._bounds.height;
        
        ctx.translate(this._position.x, this._position.y);
        ctx.translate(-anchorX, -anchorY);

        if (this._shadowOpacity > 0 && this._shadowColor) {
            ctx.shadowColor = this._shadowColor.css;
            ctx.shadowBlur = this._shadowRadius;
            ctx.shadowOffsetX = this._shadowOffset.width;
            ctx.shadowOffsetY = this._shadowOffset.height;
        }

        if (this._backgroundColor) {
            ctx.fillStyle = this._backgroundColor.css;
            if (this._cornerRadius > 0) {
                this.#roundRect(ctx, 0, 0, this._bounds.width, this._bounds.height, this._cornerRadius);
                ctx.fill();
            } else {
                ctx.fillRect(0, 0, this._bounds.width, this._bounds.height);
            }
        }

        if (this._borderWidth > 0 && this._borderColor) {
            ctx.strokeStyle = this._borderColor.css;
            ctx.lineWidth = this._borderWidth;
            if (this._cornerRadius > 0) {
                this.#roundRect(ctx, 0, 0, this._bounds.width, this._bounds.height, this._cornerRadius);
                ctx.stroke();
            } else {
                ctx.strokeRect(0, 0, this._bounds.width, this._bounds.height);
            }
        }

        if (this._contents) {
            if (typeof this._contents === 'string' && this._contents.startsWith('data:image')) {
                const img = new Image();
                img.src = this._contents;
                if (this._contentsGravity === 'resizeAspect') {
                    ctx.drawImage(img, 0, 0, this._bounds.width, this._bounds.height);
                } else {
                    ctx.drawImage(img, 0, 0);
                }
            }
        }

        if (this._mask) {
            ctx.clip();
        }

        for (const sublayer of this._sublayers) {
            sublayer.renderToContext(ctx);
        }

        ctx.restore();
    }

    #roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
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
        copy._style = { ...this._style };
        return copy;
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
            backgroundColor: this._backgroundColor?.hex,
            borderColor: this._borderColor?.hex,
            borderWidth: this._borderWidth,
            cornerRadius: this._cornerRadius,
            masksToBounds: this._masksToBounds,
            shadowColor: this._shadowColor?.hex,
            shadowOpacity: this._shadowOpacity,
            shadowOffset: this._shadowOffset,
            shadowRadius: this._shadowRadius,
            contents: this._contents,
            contentsGravity: this._contentsGravity,
            name: this._name
        };
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
    }

    static layer() {
        return new CAGradientLayer();
    }

    get colors() {
        return [...this._colors];
    }

    set colors(value) {
        this._colors = value.map(c => c instanceof UIColor ? c : UIColor.colorWithHex(c));
    }

    get locations() {
        return [...this._locations];
    }

    set locations(value) {
        this._locations = [...value];
    }

    get startPoint() {
        return this._startPoint;
    }

    set startPoint(value) {
        this._startPoint = { ...value };
    }

    get endPoint() {
        return this._endPoint;
    }

    set endPoint(value) {
        this._endPoint = { ...value };
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }

    setColors(colors) {
        this.colors = colors;
        return this;
    }

    setLocations(locations) {
        this.locations = locations;
        return this;
    }

    setStartPoint(point) {
        this.startPoint = point;
        return this;
    }

    setEndPoint(point) {
        this.endPoint = point;
        return this;
    }

    setType(type) {
        this.type = type;
        return this;
    }

    withColors(colors) {
        return this.setColors(colors);
    }

    withLocations(locations) {
        return this.setLocations(locations);
    }

    withStartPoint(point) {
        return this.setStartPoint(point);
    }

    withEndPoint(point) {
        return this.setEndPoint(point);
    }

    withType(type) {
        return this.setType(type);
    }

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

        this._colors.forEach((color, index) => {
            const location = this._locations[index] || (index / (this._colors.length - 1));
            gradient.addColorStop(location, color.css);
        });

        if (this._cornerRadius > 0) {
            this.#roundRect(ctx, 0, 0, this._bounds.width, this._bounds.height, this._cornerRadius);
            ctx.fillStyle = gradient;
            ctx.fill();
        } else {
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, this._bounds.width, this._bounds.height);
        }

        ctx.restore();
    }

    #roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
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
        this._miterLimit = 10;
        this._lineDashPhase = 0;
        this._lineDashPattern = [];
        this._fillRule = 'nonzero';
    }

    static layer() {
        return new CAShapeLayer();
    }

    get path() {
        return this._path;
    }

    set path(value) {
        this._path = value;
    }

    get fillColor() {
        return this._fillColor;
    }

    set fillColor(value) {
        if (value instanceof UIColor) {
            this._fillColor = value;
        } else if (typeof value === 'string') {
            this._fillColor = UIColor.colorWithHex(value);
        } else {
            this._fillColor = null;
        }
    }

    get strokeColor() {
        return this._strokeColor;
    }

    set strokeColor(value) {
        if (value instanceof UIColor) {
            this._strokeColor = value;
        } else if (typeof value === 'string') {
            this._strokeColor = UIColor.colorWithHex(value);
        } else {
            this._strokeColor = null;
        }
    }

    get lineWidth() {
        return this._lineWidth;
    }

    set lineWidth(value) {
        this._lineWidth = value;
    }

    get lineCap() {
        return this._lineCap;
    }

    set lineCap(value) {
        this._lineCap = value;
    }

    get lineJoin() {
        return this._lineJoin;
    }

    set lineJoin(value) {
        this._lineJoin = value;
    }

    get lineDashPhase() {
        return this._lineDashPhase;
    }

    set lineDashPhase(value) {
        this._lineDashPhase = value;
    }

    get lineDashPattern() {
        return [...this._lineDashPattern];
    }

    set lineDashPattern(value) {
        this._lineDashPattern = [...value];
    }

    setPath(path) {
        this.path = path;
        return this;
    }

    setFillColor(color) {
        this.fillColor = color;
        return this;
    }

    setStrokeColor(color) {
        this.strokeColor = color;
        return this;
    }

    setLineWidth(value) {
        this.lineWidth = value;
        return this;
    }

    setLineCap(value) {
        this.lineCap = value;
        return this;
    }

    setLineJoin(value) {
        this.lineJoin = value;
        return this;
    }

    setLineDashPhase(value) {
        this.lineDashPhase = value;
        return this;
    }

    setLineDashPattern(pattern) {
        this.lineDashPattern = pattern;
        return this;
    }

    withPath(path) {
        return this.setPath(path);
    }

    withFillColor(color) {
        return this.setFillColor(color);
    }

    withStrokeColor(color) {
        return this.setStrokeColor(color);
    }

    withLineWidth(value) {
        return this.setLineWidth(value);
    }

    withLineCap(value) {
        return this.setLineCap(value);
    }

    withLineJoin(value) {
        return this.setLineJoin(value);
    }

    renderToContext(ctx) {
        if (this._isHidden || !this._path) return;

        ctx.save();
        
        ctx.globalAlpha = this._opacity;

        if (this._fillColor) {
            ctx.fillStyle = this._fillColor.css;
        }
        if (this._strokeColor) {
            ctx.strokeStyle = this._strokeColor.css;
        }
        ctx.lineWidth = this._lineWidth;
        ctx.lineCap = this._lineCap;
        ctx.lineJoin = this._lineJoin;
        ctx.miterLimit = this._miterLimit;

        if (this._lineDashPattern.length > 0) {
            ctx.setLineDash(this._lineDashPattern, this._lineDashPhase);
        }

        if (this._path) {
            ctx.beginPath();
            if (typeof this._path === 'function') {
                this._path(ctx);
            }
            if (this._fillColor) {
                ctx.fill();
            }
            if (this._strokeColor) {
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    static createCirclePath(centerX, centerY, radius) {
        return (ctx) => {
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        };
    }

    static createRectPath(x, y, width, height) {
        return (ctx) => {
            ctx.rect(x, y, width, height);
        };
    }

    static createRoundedRectPath(x, y, width, height, cornerRadius) {
        return (ctx) => {
            ctx.moveTo(x + cornerRadius, y);
            ctx.lineTo(x + width - cornerRadius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
            ctx.lineTo(x + width, y + height - cornerRadius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius, y + height);
            ctx.lineTo(x + cornerRadius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
            ctx.lineTo(x, y + cornerRadius);
            ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
            ctx.closePath();
        };
    }

    static createStarPath(centerX, centerY, outerRadius, innerRadius, points) {
        return (ctx) => {
            const step = Math.PI / points;
            ctx.moveTo(centerX, centerY - outerRadius);
            for (let i = 0; i < points; i++) {
                ctx.lineTo(
                    centerX + Math.sin(step + i * 2 * step) * innerRadius,
                    centerY - Math.cos(step + i * 2 * step) * innerRadius
                );
                ctx.lineTo(
                    centerX + Math.sin(i * 2 * step) * outerRadius,
                    centerY - Math.cos(i * 2 * step) * outerRadius
                );
            }
            ctx.closePath();
        };
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

    static layer() {
        return new CATextLayer();
    }

    get string() {
        return this._string;
    }

    set string(value) {
        this._string = value;
    }

    get font() {
        return this._font;
    }

    set font(value) {
        this._font = value;
        if (typeof value === 'number') {
            this._fontSize = value;
            this._font = `${value}px system-ui`;
        }
    }

    get fontSize() {
        return this._fontSize;
    }

    set fontSize(value) {
        this._fontSize = value;
        this._font = `${value}px system-ui`;
    }

    get textColor() {
        return this._textColor;
    }

    set textColor(value) {
        if (value instanceof UIColor) {
            this._textColor = value;
        } else if (typeof value === 'string') {
            this._textColor = UIColor.colorWithHex(value);
        }
    }

    get textAlignment() {
        return this._textAlignment;
    }

    set textAlignment(value) {
        this._textAlignment = value;
    }

    get isWrapped() {
        return this._isWrapped;
    }

    set isWrapped(value) {
        this._isWrapped = value;
    }

    get truncationMode() {
        return this._truncationMode;
    }

    set truncationMode(value) {
        this._truncationMode = value;
    }

    get maximumNumberOfLines() {
        return this._maximumNumberOfLines;
    }

    set maximumNumberOfLines(value) {
        this._maximumNumberOfLines = value;
    }

    setString(value) {
        this.string = value;
        return this;
    }

    setFont(font) {
        this.font = font;
        return this;
    }

    setFontSize(size) {
        this.fontSize = size;
        return this;
    }

    setTextColor(color) {
        this.textColor = color;
        return this;
    }

    setTextAlignment(alignment) {
        this.textAlignment = alignment;
        return this;
    }

    setWrapped(wrapped) {
        this.isWrapped = wrapped;
        return this;
    }

    setTruncationMode(mode) {
        this.truncationMode = mode;
        return this;
    }

    setMaximumNumberOfLines(lines) {
        this.maximumNumberOfLines = lines;
        return this;
    }

    withString(value) {
        return this.setString(value);
    }

    withFont(font) {
        return this.setFont(font);
    }

    withFontSize(size) {
        return this.setFontSize(size);
    }

    withTextColor(color) {
        return this.setTextColor(color);
    }

    withTextAlignment(alignment) {
        return this.setTextAlignment(alignment);
    }

    renderToContext(ctx) {
        if (this._isHidden) return;

        ctx.save();
        
        ctx.globalAlpha = this._opacity;
        ctx.font = this._font;
        ctx.fillStyle = this._textColor.css;
        ctx.textBaseline = 'top';

        let textX = 0;
        if (this._textAlignment === 'center') {
            ctx.textAlign = 'center';
            textX = this._bounds.width / 2;
        } else if (this._textAlignment === 'right') {
            ctx.textAlign = 'right';
            textX = this._bounds.width;
        } else {
            ctx.textAlign = 'left';
        }

        const text = String(this._string);
        const lines = text.split('\n');
        const lineHeight = this._fontSize * 1.2;
        const maxLines = this._maximumNumberOfLines || lines.length;

        lines.slice(0, maxLines).forEach((line, index) => {
            ctx.fillText(line, textX, index * lineHeight);
        });

        ctx.restore();
    }
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

    get emitterPosition() {
        return this._emitterPosition;
    }

    set emitterPosition(value) {
        this._emitterPosition = { ...value };
    }

    get emitterSize() {
        return this._emitterSize;
    }

    set emitterSize(value) {
        this._emitterSize = { ...value };
    }

    get emitterShape() {
        return this._emitterShape;
    }

    set emitterShape(value) {
        this._emitterShape = value;
    }

    get emitterMode() {
        return this._emitterMode;
    }

    set emitterMode(value) {
        this._emitterMode = value;
    }

    get birthRate() {
        return this._birthRate;
    }

    set birthRate(value) {
        this._birthRate = value;
    }

    get lifetime() {
        return this._lifetime;
    }

    set lifetime(value) {
        this._lifetime = value;
    }

    get emissionRange() {
        return this._emissionRange;
    }

    set emissionRange(value) {
        this._emissionRange = value;
    }

    get velocity() {
        return this._velocity;
    }

    set velocity(value) {
        this._velocity = value;
    }

    get velocityRange() {
        return this._velocityRange;
    }

    set velocityRange(value) {
        this._velocityRange = value;
    }

    get scale() {
        return this._scale;
    }

    set scale(value) {
        this._scale = value;
    }

    get scaleRange() {
        return this._scaleRange;
    }

    set scaleRange(value) {
        this._scaleRange = value;
    }

    get spin() {
        return this._spin;
    }

    set spin(value) {
        this._spin = value;
    }

    set spinRange(value) {
        this._spinRange = value;
    }

    get spinRange() {
        return this._spinRange;
    }

    set spin(value) {
        this._spin = value;
    }

    get contents() {
        return this._contents;
    }

    set contents(value) {
        this._contents = value;
    }

    get color() {
        return this._color;
    }

    set color(value) {
        if (value instanceof UIColor) {
            this._color = value;
        } else if (typeof value === 'string') {
            this._color = UIColor.colorWithHex(value);
        }
    }

    get alphaSpeed() {
        return this._alphaSpeed;
    }

    set alphaSpeed(value) {
        this._alphaSpeed = value;
    }

    setEmitterPosition(point) {
        this.emitterPosition = point;
        return this;
    }

    setEmitterSize(size) {
        this.emitterSize = size;
        return this;
    }

    setEmitterShape(shape) {
        this.emitterShape = shape;
        return this;
    }

    setEmitterMode(mode) {
        this.emitterMode = mode;
        return this;
    }

    setBirthRate(rate) {
        this.birthRate = rate;
        return this;
    }

    setLifetime(lifetime) {
        this.lifetime = lifetime;
        return this;
    }

    setEmissionRange(range) {
        this.emissionRange = range;
        return this;
    }

    setVelocity(velocity) {
        this.velocity = velocity;
        return this;
    }

    setVelocityRange(range) {
        this.velocityRange = range;
        return this;
    }

    setScale(scale) {
        this.scale = scale;
        return this;
    }

    setScaleRange(range) {
        this.scaleRange = range;
        return this;
    }

    setSpin(spin) {
        this.spin = spin;
        return this;
    }

    setSpinRange(range) {
        this.spinRange = range;
        return this;
    }

    setContents(contents) {
        this.contents = contents;
        return this;
    }

    setColor(color) {
        this.color = color;
        return this;
    }

    setAlphaSpeed(speed) {
        this.alphaSpeed = speed;
        return this;
    }

    withEmitterPosition(point) {
        return this.setEmitterPosition(point);
    }

    withEmitterSize(size) {
        return this.setEmitterSize(size);
    }

    withEmitterShape(shape) {
        return this.setEmitterShape(shape);
    }

    withEmitterMode(mode) {
        return this.setEmitterMode(mode);
    }

    withBirthRate(rate) {
        return this.setBirthRate(rate);
    }

    withLifetime(lifetime) {
        return this.setLifetime(lifetime);
    }

    withEmissionRange(range) {
        return this.setEmissionRange(range);
    }

    withVelocity(velocity) {
        return this.setVelocity(velocity);
    }

    withVelocityRange(range) {
        return this.setVelocityRange(range);
    }

    withScale(scale) {
        return this.setScale(scale);
    }

    withScaleRange(range) {
        return this.setScaleRange(range);
    }

    withSpin(spin) {
        return this.setSpin(spin);
    }

    withSpinRange(range) {
        return this.setSpinRange(range);
    }

    withContents(contents) {
        return this.setContents(contents);
    }

    withColor(color) {
        return this.setColor(color);
    }

    withAlphaSpeed(speed) {
        return this.setAlphaSpeed(speed);
    }

    startEmitting() {
        this._isActive = true;
        this._birthRate = this._emissionRate;
        return this;
    }

    stopEmitting() {
        this._isActive = false;
        this._birthRate = 0;
        return this;
    }

    simulate(deltaTime) {
        if (!this._isActive || this._birthRate === 0) return;

        const newParticles = [];
        const particlesToAdd = Math.floor(this._birthRate * deltaTime);
        
        for (let i = 0; i < particlesToAdd; i++) {
            const angle = Math.random() * Math.PI * 2 - Math.PI;
            const speed = this._velocity + (Math.random() - 0.5) * this._velocityRange;
            
            newParticles.push({
                x: this._emitterPosition.x,
                y: this._emitterPosition.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: this._lifetime,
                maxLife: this._lifetime,
                scale: this._scale + (Math.random() - 0.5) * this._scaleRange,
                rotation: Math.random() * Math.PI * 2,
                spin: this._spin + (Math.random() - 0.5) * this._spinRange,
                alpha: 1
            });
        }

        this._particles = this._particles.filter(p => {
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.vy += 50 * deltaTime;
            p.life -= deltaTime;
            p.alpha += this._alphaSpeed * deltaTime;
            p.rotation += p.spin * deltaTime;
            return p.life > 0 && p.alpha > 0;
        });

        this._particles.push(...newParticles);
    }

    renderToContext(ctx) {
        if (this._isHidden) return;

        ctx.save();
        ctx.globalAlpha = this._opacity;

        this._particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha * this._opacity;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.scale(p.scale, p.scale);

            if (this._contents) {
                ctx.drawImage(this._contents, -10, -10, 20, 20);
            } else {
                ctx.fillStyle = this._color.css;
                ctx.beginPath();
                ctx.arc(0, 0, 5, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        });

        ctx.restore();
    }
}

class CABasicAnimation {
    constructor(keyPath, fromValue = null, toValue = null) {
        this.keyPath = keyPath;
        this.fromValue = fromValue;
        this.toValue = toValue;
        this.duration = 0.25;
        this.beginTime = 0;
        this.repeatCount = 0;
        this.repeatDuration = 0;
        this.autoreverses = false;
        this.fillMode = 'removed';
        this.isRemovedOnCompletion = true;
        this.timingFunction = 'linear';
        this.speed = 1;
        this._isExecuting = false;
        this._startTime = 0;
        this._currentValue = fromValue;
    }

    static animationWithKeyPath(keyPath) {
        return new CABasicAnimation(keyPath);
    }

    clone() {
        const copy = new CABasicAnimation(this.keyPath, this.fromValue, this.toValue);
        copy.duration = this.duration;
        copy.beginTime = this.beginTime;
        copy.repeatCount = this.repeatCount;
        copy.repeatDuration = this.repeatDuration;
        copy.autoreverses = this.autoreverses;
        copy.fillMode = this.fillMode;
        copy.isRemovedOnCompletion = this.isRemovedOnCompletion;
        copy.timingFunction = this.timingFunction;
        copy.speed = this.speed;
        return copy;
    }

    interpolate(start, end, progress) {
        if (typeof start === 'number' && typeof end === 'number') {
            return start + (end - start) * progress;
        }
        if (typeof start === 'object' && start && typeof end === 'object') {
            const result = {};
            for (const key in start) {
                if (start.hasOwnProperty(key) && end.hasOwnProperty(key)) {
                    result[key] = this.interpolate(start[key], end[key], progress);
                }
            }
            return result;
        }
        return progress < 0.5 ? start : end;
    }

    getValueAtProgress(progress) {
        if (this.fromValue === null || this.toValue === null) {
            return null;
        }
        let adjustedProgress = progress;
        if (this.autoreverses) {
            if (progress <= 0.5) {
                adjustedProgress = progress * 2;
            } else {
                adjustedProgress = 2 - progress * 2;
            }
        }
        return this.interpolate(this.fromValue, this.toValue, adjustedProgress);
    }
}

class CAKeyframeAnimation extends CABasicAnimation {
    constructor(keyPath) {
        super(keyPath);
        this.values = [];
        this.keyTimes = [];
        this.timingFunctions = [];
        this.calculationMode = 'linear';
        this.path = null;
    }

    static animationWithKeyPath(keyPath) {
        return new CAKeyframeAnimation(keyPath);
    }

    clone() {
        const copy = super.clone();
        copy.values = [...this.values];
        copy.keyTimes = [...this.keyTimes];
        copy.timingFunctions = [...this.timingFunctions];
        copy.calculationMode = this.calculationMode;
        copy.path = this.path;
        return copy;
    }
}

class CAAnimationGroup {
    constructor() {
        this.animations = [];
        this.duration = 0.25;
        this.beginTime = 0;
        this.repeatCount = 0;
        this.autoreverses = false;
        this.fillMode = 'removed';
        this.isRemovedOnCompletion = true;
        this.speed = 1;
    }

    static group() {
        return new CAAnimationGroup();
    }

    addAnimation(anim) {
        this.animations.push(anim);
        return this;
    }

    clone() {
        const copy = new CAAnimationGroup();
        copy.duration = this.duration;
        copy.beginTime = this.beginTime;
        copy.repeatCount = this.repeatCount;
        copy.autoreverses = this.autoreverses;
        copy.fillMode = this.fillMode;
        copy.isRemovedOnCompletion = this.isRemovedOnCompletion;
        copy.speed = this.speed;
        copy.animations = this.animations.map(a => a.clone ? a.clone() : a);
        return copy;
    }
}

class CASpringAnimation extends CABasicAnimation {
    constructor(keyPath) {
        super(keyPath);
        this.mass = 1;
        this.stiffness = 100;
        this.damping = 10;
        this.initialVelocity = 0;
        this.settlingDuration = 0;
    }

    static animationWithKeyPath(keyPath) {
        return new CASpringAnimation(keyPath);
    }

    getSettlingDuration() {
        const dampingRatio = this.damping / (2 * Math.sqrt(this.stiffness * this.mass));
        if (dampingRatio < 1) {
            const omega = Math.sqrt(this.stiffness / this.mass);
            return (Math.log(1 / 0.001) / (dampingRatio * omega));
        }
        return this.duration;
    }
}

export { 
    CALayer, 
    CATransform3D, 
    CAGradientLayer, 
    CAShapeLayer, 
    CATextLayer, 
    CAEmitterLayer,
    CABasicAnimation,
    CAKeyframeAnimation,
    CAAnimationGroup,
    CASpringAnimation
};
