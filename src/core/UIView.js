import UIResponder from './UIResponder.js';
import { CALayer } from './CALayer.js';
import { ViewLayerBridge } from './bridge/index.js';
import { Observable, Binding } from './Observable.js';

class UIView extends UIResponder {
    static get layerClass() {
        return CALayer;
    }

    constructor(frame = { x: 0, y: 0, width: 0, height: 0 }) {
        super();
        this._frame = { ...frame };
        this._bounds = { x: 0, y: 0, width: frame.width, height: frame.height };
        this._center = { x: frame.x + frame.width / 2, y: frame.y + frame.height / 2 };
        this._transform = null;
        this._alpha = 1;
        this._isHidden = false;
        this._clipsToBounds = false;
        this._backgroundColor = null;
        this._tag = 0;
        this._subviews = [];
        this._superview = null;
        this._window = null;
        this._layer = new (this.constructor.layerClass)();
        this._layer.frame = this._frame;
        this._layer.bounds = this._bounds;
        this._gestureRecognizers = [];
        this._isUserInteractionEnabled = true;
        this._isMultipleTouchEnabled = false;
        this._contentMode = 'scaleToFill';
        this._autoresizingMask = 0;
        this._translatesAutoresizingMaskIntoConstraints = true;
        this._needsLayout = true;
        this._needsDisplay = true;
        this._viewBridge = null;
        this._element = null;
        this._constraints = [];
        this._animationStack = [];
        this._isLayoutSubviewsScheduled = false;
        this._sublayers = [];
        this._observables = {};
        this._bindings = [];
    }

    static layer() {
        return new CALayer();
    }

    get frame() { return this._frame; }
    set frame(value) {
        this._frame = { ...value };
        this._bounds = { x: 0, y: 0, width: value.width, height: value.height };
        this._center = { x: value.x + value.width / 2, y: value.y + value.height / 2 };
        this._syncFrameToLayer();
        this.setNeedsLayout();
    }

    get bounds() { return this._bounds; }
    set bounds(value) {
        this._bounds = { ...value };
        this._frame = {
            x: this._center.x - value.width / 2,
            y: this._center.y - value.height / 2,
            width: value.width,
            height: value.height
        };
        this._syncFrameToLayer();
        this.setNeedsLayout();
    }

    get center() { return this._center; }
    set center(value) {
        this._center = { ...value };
        this._frame = {
            x: value.x - this._bounds.width / 2,
            y: value.y - this._bounds.height / 2,
            width: this._bounds.width,
            height: this._bounds.height
        };
        this._syncFrameToLayer();
        this.setNeedsLayout();
    }

    get transform() { return this._transform; }
    set transform(value) { this._transform = value; this._syncTransformToLayer(); }

    get alpha() { return this._alpha; }
    set alpha(value) { this._alpha = value; this._layer.opacity = value; }

    get isHidden() { return this._isHidden; }
    set isHidden(value) { this._isHidden = value; this._layer.isHidden = value; }

    get clipsToBounds() { return this._clipsToBounds; }
    set clipsToBounds(value) { this._clipsToBounds = value; this._layer.masksToBounds = value; }

    get backgroundColor() { return this._backgroundColor; }
    set backgroundColor(value) { this._backgroundColor = value; this._layer.backgroundColor = value; }

    get tag() { return this._tag; }
    set tag(value) { this._tag = value; }

    get layer() { return this._layer; }

    get subviews() { return [...this._subviews]; }

    get superview() { return this._superview; }

    get window() { return this._window; }

    get isUserInteractionEnabled() { return this._isUserInteractionEnabled; }
    set isUserInteractionEnabled(value) { this._isUserInteractionEnabled = value; }

    get isMultipleTouchEnabled() { return this._isMultipleTouchEnabled; }
    set isMultipleTouchEnabled(value) { this._isMultipleTouchEnabled = value; }

    get contentMode() { return this._contentMode; }
    set contentMode(value) { this._contentMode = value; }

    get autoresizingMask() { return this._autoresizingMask; }
    set autoresizingMask(value) { this._autoresizingMask = value; }

    get translatesAutoresizingMaskIntoConstraints() { return this._translatesAutoresizingMaskIntoConstraints; }
    set translatesAutoresizingMaskIntoConstraints(value) { this._translatesAutoresizingMaskIntoConstraints = value; }

    get element() { return this._element; }

    $observe(propertyName, callback, options = {}) {
        if (!this._observables[propertyName]) {
            this._observables[propertyName] = new Observable(this[propertyName]);
        }
        return this._observables[propertyName].subscribe(callback, options);
    }

    $bind(propertyName, target, targetProperty, options = {}) {
        if (!this._observables[propertyName]) {
            this._observables[propertyName] = new Observable(this[propertyName]);
        }
        if (!target._observables) {
            target._observables = {};
        }
        if (!target._observables[targetProperty]) {
            target._observables[targetProperty] = new Observable(target[targetProperty]);
        }
        const binding = this._observables[propertyName].bindTo(target._observables[targetProperty], options);
        this._bindings.push(binding);
        binding.activate();
        return binding;
    }

    $set(propertyName, value) {
        this[propertyName] = value;
        if (this._observables[propertyName]) {
            this._observables[propertyName].value = value;
        }
    }

    $unbindAll() {
        for (const binding of this._bindings) {
            binding.dispose();
        }
        this._bindings = [];
    }

    _syncFrameToLayer() {
        if (this._layer) {
            this._layer.frame = this._frame;
            this._layer.bounds = this._bounds;
        }
    }

    _syncTransformToLayer() {
        if (this._layer && this._transform) {
            this._layer.transform = this._transform;
        }
    }

    setNeedsLayout() {
        if (this._isLayoutSubviewsScheduled) return;
        this._isLayoutSubviewsScheduled = true;
        Promise.resolve().then(() => {
            this._isLayoutSubviewsScheduled = false;
            if (this._needsLayout) {
                this.layoutSubviews();
            }
        });
    }

    layoutSubviews() {
        this._needsLayout = false;
        if (this._viewBridge) {
            this._viewBridge.syncFrame();
        }
        for (const subview of this._subviews) {
            subview.setNeedsLayout();
        }
    }

    setNeedsDisplay() {
        this._needsDisplay = true;
    }

    display() {
        this._needsDisplay = false;
    }

    addSubview(view) {
        if (!view || view._superview === this) return;
        if (view._superview) {
            view._superview.removeSubview(view);
        }
        view._superview = this;
        this._subviews.push(view);
        this._syncSubviewLayer(view);
        this._layer.addSublayer(view._layer);
        const effectiveWindow = this._window || (this._isWindow ? this : null);
        if (effectiveWindow && !view._window) {
            view._window = effectiveWindow;
            view.didMoveToWindow();
        }
        this.setNeedsLayout();
    }

    insertSubview(view, index) {
        if (!view) return;
        if (view._superview) {
            view._superview.removeSubview(view);
        }
        view._superview = this;
        const adjustedIndex = Math.min(index, this._subviews.length);
        this._subviews.splice(adjustedIndex, 0, view);
        this._syncSubviewLayer(view);
        this._layer.insertSublayerAtIndex(view._layer, adjustedIndex);
        const effectiveWindow = this._window || (this._isWindow ? this : null);
        if (effectiveWindow && !view._window) {
            view._window = effectiveWindow;
            view.didMoveToWindow();
        }
        this.setNeedsLayout();
    }

    removeSubview(view) {
        if (!view || view._superview !== this) return;
        const index = this._subviews.indexOf(view);
        if (index !== -1) {
            this._subviews.splice(index, 1);
        }
        view._superview = null;
        view._window = null;
        if (view._layer._superlayer === this._layer) {
            this._layer.removeSublayer(view._layer);
        }
        view.didMoveToWindow();
        this.setNeedsLayout();
    }

    removeFromSuperview() {
        if (this._superview) {
            this._superview.removeSubview(this);
        }
    }

    _syncSubviewLayer(view) {
        if (typeof document !== 'undefined' && !view._element) {
            view._element = document.createElement('div');
            view._element.style.position = 'absolute';
            view._element.style.left = '0px';
            view._element.style.top = '0px';
        }
        if (view._element && this._element && typeof document !== 'undefined') {
            if (view._element.parentElement !== this._element) {
                this._element.appendChild(view._element);
            }
        }
    }

    didMoveToWindow() {
        for (const subview of this._subviews) {
            if (this._window && !subview._window) {
                subview._window = this._window;
                subview.didMoveToWindow();
            } else if (!this._window) {
                subview._window = null;
                subview.didMoveToWindow();
            }
        }
    }

    didMoveToSuperview() {
        return;
    }

    viewDidLoad() {
        return;
    }

    viewWillAppear() {
        return;
    }

    viewDidAppear() {
        return;
    }

    viewWillDisappear() {
        return;
    }

    viewDidDisappear() {
        return;
    }

    viewWillLayout() {
        return;
    }

    viewDidLayout() {
        return;
    }

    bringSubviewToFront(view) {
        if (!view || view._superview !== this) return;
        const index = this._subviews.indexOf(view);
        if (index !== -1 && index < this._subviews.length - 1) {
            this._subviews.splice(index, 1);
            this._subviews.push(view);
            this._layer.bringSublayerToFront(view._layer);
            if (view._element && view._element.parentElement) {
                view._element.parentElement.appendChild(view._element);
            }
        }
    }

    sendSubviewToBack(view) {
        if (!view || view._superview !== this) return;
        const index = this._subviews.indexOf(view);
        if (index !== -1 && index > 0) {
            this._subviews.splice(index, 1);
            this._subviews.unshift(view);
            this._layer.sendSublayerToBack(view._layer);
            if (view._element && view._element.parentElement) {
                view._element.parentElement.insertBefore(view._element, view._element.parentElement.firstChild);
            }
        }
    }

    insertSublayer(sublayer, atIndex = 0) {
        if (!sublayer) return;
        this._sublayers.push(sublayer);
        this._layer.insertSublayerAtIndex(sublayer, atIndex);
    }

    exchangeSubviewAtIndex(index1, index2) {
        if (index1 === index2) return;
        const maxIndex = this._subviews.length - 1;
        if (index1 < 0 || index1 > maxIndex || index2 < 0 || index2 > maxIndex) return;
        const temp = this._subviews[index1];
        this._subviews[index1] = this._subviews[index2];
        this._subviews[index2] = temp;
        this._layer.exchangeSublayerAtIndexWith(index1, index2);
    }

    allSubviews() {
        const result = [];
        const collect = (views) => {
            for (const view of views) {
                result.push(view);
                if (view._subviews.length > 0) {
                    collect(view._subviews);
                }
            }
        };
        collect(this._subviews);
        return result;
    }

    hitTest(point, event) {
        if (!this._isUserInteractionEnabled || this._isHidden || this._alpha < 0.01) {
            return null;
        }
        if (this._clipsToBounds) {
            if (point.x < 0 || point.x > this._bounds.width ||
                point.y < 0 || point.y > this._bounds.height) {
                return null;
            }
        }
        for (let i = this._subviews.length - 1; i >= 0; i--) {
            const subview = this._subviews[i];
            const convertedPoint = this.convertPoint(point, subview);
            const hitView = subview.hitTest(convertedPoint, event);
            if (hitView) {
                return hitView;
            }
        }
        return this;
    }

    containsPoint(point) {
        return point.x >= 0 && point.x <= this._bounds.width &&
               point.y >= 0 && point.y <= this._bounds.height;
    }

    convertPoint(point, toView) {
        if (!toView) {
            return { x: point.x + this._frame.x, y: point.y + this._frame.y };
        }
        const windowPoint = this.convertPointToWindow(point);
        return toView.convertPointFromWindow(windowPoint);
    }

    convertPointToWindow(point) {
        let view = this;
        let result = { ...point };
        while (view) {
            result.x += view._frame.x;
            result.y += view._frame.y;
            view = view._superview;
        }
        return result;
    }

    convertPointFromWindow(point) {
        let view = this;
        const chain = [];
        while (view) {
            chain.unshift(view);
            view = view._superview;
        }
        let result = { ...point };
        for (const v of chain) {
            result.x -= v._frame.x;
            result.y -= v._frame.y;
        }
        return result;
    }

    convertRect(rect, toView) {
        if (!toView) {
            return {
                x: rect.x + this._frame.x,
                y: rect.y + this._frame.y,
                width: rect.width,
                height: rect.height
            };
        }
        const windowPoint = this.convertPointToWindow({ x: rect.x, y: rect.y });
        return {
            x: windowPoint.x,
            y: windowPoint.y,
            width: rect.width,
            height: rect.height
        };
    }

    sizeThatFits(size) {
        return { width: this._bounds.width, height: this._bounds.height };
    }

    sizeToFit() {
        const size = this.sizeThatFits(this._bounds);
        this.frame = {
            x: this._frame.x,
            y: this._frame.y,
            width: size.width,
            height: size.height
        };
    }

    setAccessibilityLabel(label) {
        this._accessibilityLabel = label;
        if (this._element) {
            this._element.setAttribute('aria-label', label);
        }
    }

    setAccessibilityHint(hint) {
        this._accessibilityHint = hint;
        if (this._element) {
            this._element.setAttribute('aria-description', hint);
        }
    }

    addConstraint(constraint) {
        if (!constraint) return;
        this._constraints.push(constraint);
        constraint._view = this;
    }

    removeConstraint(constraint) {
        if (!constraint) return;
        const index = this._constraints.indexOf(constraint);
        if (index !== -1) {
            this._constraints.splice(index, 1);
            constraint._view = null;
        }
    }

    removeAllConstraints() {
        for (const constraint of this._constraints) {
            constraint._view = null;
        }
        this._constraints = [];
    }

    constraints() {
        return [...this._constraints];
    }

    updateConstraints() {
        return;
    }

    needsUpdateConstraints() {
        return this._constraints.length === 0 ? false : true;
    }

    setNeedsUpdateConstraints() {
        return;
    }

    invalidateIntrinsicContentSize() {
        this.setNeedsLayout();
    }

    intrinsicContentSize() {
        return { width: this._bounds.width, height: this._bounds.height };
    }

    addAnimation(animation, key) {
        if (this._layer) {
            this._layer.addAnimation(animation, key);
        }
    }

    removeAnimation(key) {
        if (this._layer) {
            this._layer.removeAnimation(key);
        }
    }

    removeAllAnimations() {
        if (this._layer) {
            const keys = this._layer.animationKeys() || [];
            for (const key of keys) {
                this._layer.removeAnimation(key);
            }
        }
    }

    animationKeys() {
        if (this._layer) {
            return this._layer.animationKeys();
        }
        return [];
    }

    get x() { return this._frame.x; }
    set x(value) {
        this.frame = { ...this._frame, x: value };
    }

    get y() { return this._frame.y; }
    set y(value) {
        this.frame = { ...this._frame, y: value };
    }

    get width() { return this._frame.width; }
    set width(value) {
        this.frame = { ...this._frame, width: value };
    }

    get height() { return this._frame.height; }
    set height(value) {
        this.frame = { ...this._frame, height: value };
    }

    touchesBegan(touches, event) {
        let handled = false;
        for (const touch of touches) {
            if (this._handleGestureRecognizerTouchBegan(touch, event)) {
                handled = true;
            }
        }
        return handled;
    }

    touchesMoved(touches, event) {
        let handled = false;
        for (const touch of touches) {
            if (this._handleGestureRecognizerTouchMoved(touch, event)) {
                handled = true;
            }
        }
        return handled;
    }

    touchesEnded(touches, event) {
        let handled = false;
        for (const touch of touches) {
            if (this._handleGestureRecognizerTouchEnded(touch, event)) {
                handled = true;
            }
        }
        return handled;
    }

    touchesCancelled(touches, event) {
        let handled = false;
        for (const touch of touches) {
            if (this._handleGestureRecognizerTouchCancelled(touch, event)) {
                handled = true;
            }
        }
        return handled;
    }
}

export default UIView;
