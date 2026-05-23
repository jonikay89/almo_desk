import UIResponder from './UIResponder.js';
import { CALayer, CABasicAnimation, CAKeyframeAnimation, CAAnimationGroup } from './CALayer.js';
import { ViewLayerBridge } from './bridge/index.js';
import { CurrentValueSubject, Binding } from './Observable.js';
import { NSLayoutAnchor } from './NSLayoutConstraint.js';

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
        this._dragInteractions = [];
        this._dropInteractions = [];
        this._dragDelegate = null;
        this._dropDelegate = null;
        this._layoutEngine = null;
        this._safeAreaInsets = { top: 0, bottom: 0, left: 0, right: 0 };
        this._contentLayoutGuide = null;
        this._frameLayoutGuide = null;
        this._layoutMargins = { top: 0, bottom: 0, left: 0, right: 0 };
        this._directionalLayoutMargins = { top: 0, leading: 0, bottom: 0, trailing: 0 };
        this._preservesSuperviewLayoutMargins = false;
        this._insetsLayoutMarginsFromSafeArea = true;
        this._contentHuggingPriority = { horizontal: 250, vertical: 250 };
        this._contentCompressionResistancePriority = { horizontal: 750, vertical: 750 };
        this._anchorCache = {};
        this._needsUpdateConstraints = false;

        this._shadow = null;
        this._padding = null;
        this._margin = null;
        this._minHeight = null;
        this._maxWidth = null;
        this._maxHeight = null;
        this._overflow = null;
        this._flex = null;
    }

    static layer() {
        return new CALayer();
    }

    get frame() { return this._frame; }
    set frame(value) {
        this._frame = { ...value };
        this._bounds = { x: 0, y: 0, width: value.width, height: value.height };
        this._center = { x: value.x + value.width / 2, y: value.y + value.height / 2 };
        this._applyFrameToElement();
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
        this._applyFrameToElement();
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
        this._applyFrameToElement();
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
    set clipsToBounds(value) { this._clipsToBounds = value; this._layer.masksToBounds = value; this._applyVisualProperties(); }

    get backgroundColor() { return this._backgroundColor; }
    set backgroundColor(value) { this._backgroundColor = value; this._layer.backgroundColor = value; this._applyVisualProperties(); }

    get tag() { return this._tag; }
    set tag(value) { this._tag = value; }

    get cornerRadius() { return this._cornerRadius || (this._layer ? this._layer.cornerRadius : 0); }
    set cornerRadius(value) { this._cornerRadius = value; if (this._layer) this._layer.cornerRadius = value; this._applyVisualProperties(); }

    get shadow() { return this._shadow; }
    set shadow(value) { this._shadow = value; this._applyVisualProperties(); }

    get padding() { return this._padding; }
    set padding(value) { this._padding = value; this._applyVisualProperties(); }

    get margin() { return this._margin; }
    set margin(value) { this._margin = value; this._applyVisualProperties(); }

    get minHeight() { return this._minHeight; }
    set minHeight(value) { this._minHeight = value; this._applyVisualProperties(); }

    get maxWidth() { return this._maxWidth; }
    set maxWidth(value) { this._maxWidth = value; this._applyVisualProperties(); }

    get maxHeight() { return this._maxHeight; }
    set maxHeight(value) { this._maxHeight = value; this._applyVisualProperties(); }

    get overflow() { return this._overflow; }
    set overflow(value) { this._overflow = value; this._applyVisualProperties(); }

    get flex() { return this._flex; }
    set flex(value) { this._flex = value; this._applyVisualProperties(); }

    setContentHuggingPriority(priority, axis) {
        if (axis === 'horizontal') this._contentHuggingPriority.horizontal = priority;
        else if (axis === 'vertical') this._contentHuggingPriority.vertical = priority;
    }

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

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('div');
            this._element.style.boxSizing = 'border-box';
            this._applyFrameToElement();
            this._applyVisualProperties();
        }
        return this;
    }

    _applyFrameToElement() {
        if (!this._element) return;
        this._element.style.position = 'absolute';
        this._element.style.left = `${this._frame.x}px`;
        this._element.style.top = `${this._frame.y}px`;
        if (this._frame.width > 0) this._element.style.width = `${this._frame.width}px`;
        if (this._frame.height > 0) this._element.style.height = `${this._frame.height}px`;
    }

    _applyVisualProperties() {
        if (!this._element) return;
        if (this._backgroundColor) {
            this._element.style.backgroundColor = this._backgroundColor.toRGBAString ? this._backgroundColor.toRGBAString() : this._backgroundColor.css || 'transparent';
        }
        if (this._alpha !== 1) this._element.style.opacity = String(this._alpha);
        if (this._isHidden) this._element.style.display = 'none';
        this._element.style.overflow = this._clipsToBounds ? 'hidden' : '';
        const cr = this._cornerRadius || (this._layer ? this._layer.cornerRadius : 0);
        if (cr) this._element.style.borderRadius = `${cr}px`;
        if (this._layer) {
            if (this._layer.borderWidth > 0) {
                this._element.style.borderWidth = `${this._layer.borderWidth}px`;
                this._element.style.borderStyle = 'solid';
                this._element.style.borderColor = this._layer.borderColor
                    ? (this._layer.borderColor.toRGBAString ? this._layer.borderColor.toRGBAString() : String(this._layer.borderColor))
                    : 'transparent';
            }
        }
        if (this._shadow) {
            const s = this._shadow;
            this._element.style.boxShadow = `${s.offsetX || 0}px ${s.offsetY || 0}px ${s.radius || 0}px ${s.color || 'rgba(0,0,0,0)'}`;
        }
        if (this._padding) {
            const p = this._padding;
            this._element.style.padding = typeof p === 'number' ? `${p}px` : `${p.top || 0}px ${p.right || 0}px ${p.bottom || 0}px ${p.left || 0}px`;
        }
        if (this._margin) {
            const m = this._margin;
            if (typeof m === 'object') {
                const top = m.top || 0;
                const right = m.right != null ? m.right : 0;
                const bottom = m.bottom || 0;
                const left = m.left != null ? m.left : 0;
                this._element.style.margin = `${typeof top === 'string' ? top : top + 'px'} ${typeof right === 'string' ? right : right + 'px'} ${typeof bottom === 'string' ? bottom : bottom + 'px'} ${typeof left === 'string' ? left : left + 'px'}`;
            } else {
                this._element.style.margin = `${m}px`;
            }
        }
        if (this._minHeight) this._element.style.minHeight = typeof this._minHeight === 'string' ? this._minHeight : `${this._minHeight}px`;
        if (this._maxWidth) this._element.style.maxWidth = typeof this._maxWidth === 'string' ? this._maxWidth : `${this._maxWidth}px`;
        if (this._maxHeight) this._element.style.maxHeight = typeof this._maxHeight === 'string' ? this._maxHeight : `${this._maxHeight}px`;
        if (this._overflow) this._element.style.overflow = this._overflow;
        if (this._flex) this._element.style.flex = this._flex;
    }

    get element() { return this._element; }

    scrollToBottom() {
        if (this._element) {
            this._element.scrollTop = this._element.scrollHeight;
        }
    }

    $observe(propertyName, callback, options = {}) {
        if (!this._observables[propertyName]) {
            this._observables[propertyName] = new CurrentValueSubject(this[propertyName]);
        }
        return this._observables[propertyName].subscribe(callback, options);
    }

    $bind(propertyName, target, targetProperty, options = {}) {
        if (!this._observables[propertyName]) {
            this._observables[propertyName] = new CurrentValueSubject(this[propertyName]);
        }
        if (!target._observables) {
            target._observables = {};
        }
        if (!target._observables[targetProperty]) {
            target._observables[targetProperty] = new CurrentValueSubject(target[targetProperty]);
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
        if (this._element && this._transform) {
            if (typeof this._transform === 'string') {
                this._element.style.transform = this._transform;
            } else if (this._transform.scale) {
                this._element.style.transform = `scale(${this._transform.scale})`;
            } else if (this._transform.rotation) {
                this._element.style.transform = `rotate(${this._transform.rotation}rad)`;
            } else if (this._transform.translateX || this._transform.translateY) {
                this._element.style.transform = `translate(${this._transform.translateX || 0}px, ${this._transform.translateY || 0}px)`;
            }
        }
    }

    setNeedsLayout() {
        if (this._isLayoutSubviewsScheduled) return;
        this._isLayoutSubviewsScheduled = true;
        this._needsLayout = true;
        if (!UIView._pendingRoots) UIView._pendingRoots = [];
        let root = this;
        while (root._superview) root = root._superview;
        if (!UIView._pendingRoots.includes(root)) {
            UIView._pendingRoots.push(root);
        }
        UIView._scheduleLayoutPass();
    }

    layoutSubviews() {
        this._needsLayout = false;
        this.updateConstraints();
        if (this._layoutEngine && this._layoutEngine.isStale()) {
            this._syncOwnFrameToEngine();
            this._layoutEngine.solve();
            this._applyEngineResults();
        }
        if (this._viewBridge) {
            this._viewBridge.syncFrame();
        }
        for (const subview of this._subviews) {
            subview.setNeedsLayout();
        }
    }

    _syncOwnFrameToEngine() {
        if (!this._layoutEngine) return;
        const vars = this._layoutEngine._variables;
        const engine = this._layoutEngine;

        const syncSelf = (view) => {
            const guid = view._layoutGuid;
            if (!guid) return;
            let f = view._frame;
            if (view._element && view._element.getBoundingClientRect) {
                const rect = view._element.getBoundingClientRect();
                if (rect.width > 0) {
                    f = { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
                }
            }
            const pairs = {
                left: f.x, leading: f.x, top: f.y,
                width: f.width, height: f.height,
                right: f.x + f.width, trailing: f.x + f.width,
                bottom: f.y + f.height,
                centerX: f.x + f.width / 2, centerY: f.y + f.height / 2,
            };
            for (const [attr, val] of Object.entries(pairs)) {
                const key = `${guid}.${attr}`;
                if (vars.has(key)) {
                    engine.suggestVariable(key, val);
                }
            }
        };

        const syncSubview = (view) => {
            const guid = view._layoutGuid;
            if (!guid) return;
            let f = view._frame;
            if (view._element && view._element.getBoundingClientRect) {
                const rect = view._element.getBoundingClientRect();
                if (rect.width > 0) {
                    f = { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
                }
            }
            const pairs = {
                left: f.x, leading: f.x, top: f.y,
                width: f.width, height: f.height,
                right: f.x + f.width, trailing: f.x + f.width,
                bottom: f.y + f.height,
                centerX: f.x + f.width / 2, centerY: f.y + f.height / 2,
            };
            for (const [attr, val] of Object.entries(pairs)) {
                const key = `${guid}.${attr}`;
                if (vars.has(key)) {
                    engine.setVariable(key, val);
                }
            }
        };

        syncSelf(this);
        for (const subview of this._subviews) {
            syncSubview(subview);
        }
    }

    _applyEngineResults() {
        if (!this._layoutEngine) return;
        const vars = this._layoutEngine._variables;
        for (const subview of this._subviews) {
            if (subview._layoutGuid) {
                const guid = subview._layoutGuid;
                const left = vars.get(`${guid}.left`) ?? vars.get(`${guid}.leading`);
                const right = vars.get(`${guid}.right`) ?? vars.get(`${guid}.trailing`);
                const top = vars.get(`${guid}.top`);
                const bottom = vars.get(`${guid}.bottom`);
                const w = vars.get(`${guid}.width`);
                const h = vars.get(`${guid}.height`);
                const cx = vars.get(`${guid}.centerX`);
                const cy = vars.get(`${guid}.centerY`);

                let x, width;
                if (left !== undefined && right !== undefined) {
                    x = left;
                    width = right - left;
                } else if (cx !== undefined) {
                    width = w ?? subview._frame.width;
                    x = cx - width / 2;
                } else if (right !== undefined) {
                    width = w ?? subview._frame.width;
                    x = right - width;
                } else {
                    x = left ?? subview._frame.x;
                    width = w ?? subview._frame.width;
                }

                let y, height;
                if (top !== undefined && bottom !== undefined) {
                    y = top;
                    height = bottom - top;
                } else if (cy !== undefined) {
                    height = h ?? subview._frame.height;
                    y = cy - height / 2;
                } else if (bottom !== undefined) {
                    height = h ?? subview._frame.height;
                    y = bottom - height;
                } else {
                    y = top ?? subview._frame.y;
                    height = h ?? subview._frame.height;
                }

                if (width < 0) width = 0;
                if (height < 0) height = 0;
                subview.frame = { x, y, width, height };
            }
        }
    }

    static _scheduleLayoutPass() {
        if (UIView._layoutPassScheduled) return;
        UIView._layoutPassScheduled = true;
        const schedule = typeof requestAnimationFrame === 'function'
            ? requestAnimationFrame
            : (cb) => Promise.resolve().then(cb);
        schedule(() => {
            UIView._layoutPassScheduled = false;
            UIView._runLayoutPass();
        });
    }

    static _runLayoutPass() {
        const roots = UIView._pendingRoots || [];
        UIView._pendingRoots = [];
        for (const root of roots) {
            root._runDeferredLayout();
        }
    }

    _runDeferredLayout() {
        this.updateConstraints();
        this.layoutSubviews();
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
            view._element.style.boxSizing = 'border-box';
            view._applyFrameToElement();
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
        for (const subview of this._subviews) {
            subview.updateConstraints();
        }
    }

    needsUpdateConstraints() {
        return this._constraints.length === 0 ? false : true;
    }

    setNeedsUpdateConstraints() {
        this._needsUpdateConstraints = true;
    }

    get safeAreaInsets() { return { ...this._safeAreaInsets }; }

    safeAreaLayoutGuide() {
        if (!this._safeAreaLayoutGuide) {
            this._safeAreaLayoutGuide = { _owningView: this, layoutFrame: this._bounds };
        }
        return this._safeAreaLayoutGuide;
    }

    layoutMarginsGuide() {
        if (!this._layoutMarginsGuide) {
            this._layoutMarginsGuide = { _owningView: this, layoutFrame: this._bounds };
        }
        return this._layoutMarginsGuide;
    }

    get layoutMargins() { return { ...this._layoutMargins }; }
    set layoutMargins(value) { this._layoutMargins = { ...value }; }

    get directionalLayoutMargins() { return { ...this._directionalLayoutMargins }; }
    set directionalLayoutMargins(value) { this._directionalLayoutMargins = { ...value }; }

    get preservesSuperviewLayoutMargins() { return this._preservesSuperviewLayoutMargins; }
    set preservesSuperviewLayoutMargins(value) { this._preservesSuperviewLayoutMargins = value; }

    get insetsLayoutMarginsFromSafeArea() { return this._insetsLayoutMarginsFromSafeArea; }
    set insetsLayoutMarginsFromSafeArea(value) { this._insetsLayoutMarginsFromSafeArea = value; }

    invalidateIntrinsicContentSize() {
        this.setNeedsLayout();
    }

    intrinsicContentSize() {
        if (this._element) {
            const children = this._element.children;
            if (children.length > 0) {
                let maxW = 0, maxH = 0;
                for (const c of children) {
                    const r = c.getBoundingClientRect();
                    maxW = Math.max(maxW, c.offsetLeft + r.width);
                    maxH = Math.max(maxH, c.offsetTop + r.height);
                }
                return { width: maxW, height: maxH };
            }
        }
        return { width: this._bounds.width, height: this._bounds.height };
    }

    get contentHuggingPriority() { return this._contentHuggingPriority; }
    setContentHuggingPriority(priority, axis) {
        if (axis === 'horizontal' || axis === 'h') this._contentHuggingPriority.horizontal = priority;
        if (axis === 'vertical' || axis === 'v') this._contentHuggingPriority.vertical = priority;
    }
    contentHuggingPriorityForAxis(axis) {
        return axis === 'horizontal' || axis === 'h' ? this._contentHuggingPriority.horizontal : this._contentHuggingPriority.vertical;
    }

    get contentCompressionResistancePriority() { return this._contentCompressionResistancePriority; }
    setContentCompressionResistancePriority(priority, axis) {
        if (axis === 'horizontal' || axis === 'h') this._contentCompressionResistancePriority.horizontal = priority;
        if (axis === 'vertical' || axis === 'v') this._contentCompressionResistancePriority.vertical = priority;
    }
    contentCompressionResistancePriorityForAxis(axis) {
        return axis === 'horizontal' || axis === 'h' ? this._contentCompressionResistancePriority.horizontal : this._contentCompressionResistancePriority.vertical;
    }

    layoutIfNeeded() {
        if (this._needsLayout) {
            this.layoutSubviews();
        }
    }

    _getAnchor(attr) {
        if (!this._anchorCache) this._anchorCache = {};
        if (!this._anchorCache[attr]) {
            this._anchorCache[attr] = new NSLayoutAnchor(this, attr);
        }
        return this._anchorCache[attr];
    }

    get leadingAnchor() { return this._getAnchor('leading'); }
    get trailingAnchor() { return this._getAnchor('trailing'); }
    get leftAnchor() { return this._getAnchor('left'); }
    get rightAnchor() { return this._getAnchor('right'); }
    get topAnchor() { return this._getAnchor('top'); }
    get bottomAnchor() { return this._getAnchor('bottom'); }
    get widthAnchor() { return this._getAnchor('width'); }
    get heightAnchor() { return this._getAnchor('height'); }
    get centerXAnchor() { return this._getAnchor('centerX'); }
    get centerYAnchor() { return this._getAnchor('centerY'); }
    get firstBaselineAnchor() { return this._getAnchor('firstBaseline'); }
    get lastBaselineAnchor() { return this._getAnchor('lastBaseline'); }

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

    addDragInteraction(interaction) {
        if (!interaction) return;
        if (this._dragInteractions.includes(interaction)) return;
        this._dragInteractions.push(interaction);
        interaction._attachToView(this);
    }

    removeDragInteraction(interaction) {
        const index = this._dragInteractions.indexOf(interaction);
        if (index !== -1) {
            this._dragInteractions.splice(index, 1);
            interaction._detachFromView();
        }
    }

    dragInteractions() {
        return [...this._dragInteractions];
    }

    hasDragInteraction() {
        return this._dragInteractions.length > 0;
    }

    addDropInteraction(interaction) {
        if (!interaction) return;
        if (this._dropInteractions.includes(interaction)) return;
        this._dropInteractions.push(interaction);
        interaction._attachToView(this);
    }

    removeDropInteraction(interaction) {
        const index = this._dropInteractions.indexOf(interaction);
        if (index !== -1) {
            this._dropInteractions.splice(index, 1);
            interaction._detachFromView();
        }
    }

    dropInteractions() {
        return [...this._dropInteractions];
    }

    hasDropInteraction() {
        return this._dropInteractions.length > 0;
    }

    _beginDrag(items, point, event) {
        for (const interaction of this._dragInteractions) {
            const session = interaction._beginDrag(items, point, event);
            if (session) return session;
        }
        return null;
    }

    _handleDragMove(point, event) {
        for (const interaction of this._dragInteractions) {
            interaction._updateDrag(point, event);
        }
    }

    _handleDragEnd(point, event) {
        for (const interaction of this._dragInteractions) {
            interaction._endDrag(point, event);
        }
    }

    _handleDragCancel() {
        for (const interaction of this._dragInteractions) {
            interaction._cancelDrag();
        }
    }

    _handleDropEnter(session, point) {
        let proposal = null;
        for (const interaction of this._dropInteractions) {
            proposal = interaction._dragEntered(session, point);
            if (proposal) break;
        }
        return proposal;
    }

    _handleDropUpdate(session, point) {
        for (const interaction of this._dropInteractions) {
            const proposal = interaction._dragUpdated(session, point);
            if (proposal) return proposal;
        }
        return null;
    }

    _handleDropExit(session) {
        for (const interaction of this._dropInteractions) {
            interaction._dragExited(session);
        }
    }

    _handleDrop(session) {
        for (const interaction of this._dropInteractions) {
            interaction._performDrop(session);
        }
    }

    _handleDropEnd(session, operation) {
        for (const interaction of this._dropInteractions) {
            interaction._dragEnded(session, operation);
        }
    }
}

// Static animation API
UIView._animationBlock = null;
UIView._animationDuration = 0.25;
UIView._animationCurve = 'easeInOut';
UIView._animationDelay = 0;
UIView._animationOptions = [];
UIView._animationCompletion = null;

UIView.animateWithDuration = function(duration, animations, completion = null) {
    if (typeof duration === 'object') {
        const opts = duration;
        return UIView._animateWithOptions(opts.duration || 0.25, opts.delay || 0, opts.options || opts.curve || 'easeInOut', animations, opts.completions || completion);
    }
    return UIView._animateWithOptions(duration, 0, 'easeInOut', animations, completion);
};

UIView.animateWithDurationAnimations = function(duration, animations, completion) {
    return UIView._animateWithOptions(duration, 0, 'easeInOut', animations, completion);
};

UIView.animateWithDurationDelayOptionsAnimationsCompletion = function(duration, delay, options, animations, completion) {
    return UIView._animateWithOptions(duration, delay, options, animations, completion);
};

UIView._animateWithOptions = function(duration, delay, options, animations, completion) {
    if (typeof document === 'undefined') {
        if (animations) animations();
        if (completion) completion(true);
        return;
    }

    UIView._animationBlock = animations;
    UIView._animationDuration = duration;
    UIView._animationCurve = options;
    UIView._animationCompletion = completion;

    const transition = {
        'easeInOut': 'cubic-bezier(0.42, 0, 0.58, 1)',
        'easeIn': 'cubic-bezier(0.42, 0, 1, 1)',
        'easeOut': 'cubic-bezier(0, 0, 0.58, 1)',
        'linear': 'linear',
        'curveEaseInOut': 'cubic-bezier(0.42, 0, 0.58, 1)',
        'curveEaseIn': 'cubic-bezier(0.42, 0, 1, 1)',
        'curveEaseOut': 'cubic-bezier(0, 0, 0.58, 1)',
        'curveLinear': 'linear',
    };
    const cssTiming = transition[options] || transition['easeInOut'];

    const animatedViews = [];
    const originalStyles = new Map();

    const collectViews = (view) => {
        if (view._element) {
            animatedViews.push(view);
            originalStyles.set(view, {
                left: view._element.style.left,
                top: view._element.style.top,
                width: view._element.style.width,
                height: view._element.style.height,
                opacity: view._element.style.opacity,
                transform: view._element.style.transform,
                backgroundColor: view._element.style.backgroundColor,
            });
        }
    };

    const allViews = [];
    const collectAll = (v) => {
        allViews.push(v);
        for (const s of v._subviews) collectAll(s);
    };
    collectAll({ _subviews: [] });

    if (animations) animations();

    for (const view of animatedViews) {
        const el = view._element;
        if (!el || !el.parentElement) continue;

        el.style.transition = `all ${duration}s ${cssTiming} ${delay}s`;
    }

    for (const view of animatedViews) {
        if (view._element) {
            view._applyFrameToElement();
            view._applyVisualProperties();
        }
    }

    UIView._animationBlock = null;

    setTimeout(() => {
        for (const view of animatedViews) {
            if (view._element) {
                view._element.style.transition = '';
            }
        }
        if (completion) completion(true);
    }, (duration + delay) * 1000 + 50);
};

UIView.animateKeyframesWithDurationDelayOptionsAnimationsCompletion = function(duration, delay, options, animations, completion) {
    UIView._animateWithOptions(duration, delay, options || 'easeInOut', animations, completion);
};

UIView.transitionWithViewDurationOptionsAnimationsCompletion = function(view, duration, options, animations, completion) {
    const transition = options === 'transitionCrossDissolve' ? 'opacity' :
                       options === 'transitionFlipFromLeft' || options === 'transitionFlipFromRight' ? 'transform' :
                       'all';

    if (view?._element) {
        view._element.style.transition = `${transition} ${duration}s ease-in-out`;
    }
    if (animations) animations();
    if (view?._element) {
        view._applyFrameToElement();
    }
    setTimeout(() => {
        if (view?._element) view._element.style.transition = '';
        if (completion) completion(true);
    }, duration * 1000 + 50);
};

UIView._applyFrameToElement = function(view) {
    if (!view._element) return;
    const el = view._element;
    const f = view._frame;
    el.style.left = `${f.x}px`;
    el.style.top = `${f.y}px`;
    el.style.width = `${f.width}px`;
    el.style.height = `${f.height}px`;
};

UIView.performWithoutAnimation = function(actions) {
    UIView._animationBlock = null;
    if (actions) actions();
};

export default UIView;
