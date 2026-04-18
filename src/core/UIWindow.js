import { CAGradientLayer, CALayer, CAShapeLayer, CGPath } from './CALayer.js';
import { NSNumber } from './Foundation.js';
import { forCase, guardCase, guardLet, ifCase, ifLet, patternMatch, whileCase } from './PatternMatching.js';
import Switch from './Switch.js';
import UIColor from './UIColor.js';
import UIView from './UIView.js';

class UIWindow extends UIView {
    constructor() {
        super();
        this.rootViewController = null;
        this.windowLevel = 0;
        this._isKeyWindow = false;
        this._isVisible = true;
        this._windowLayer = null;
        this._contentLayer = null;
        this._isWindow = true;
    }

    init() {
        super.init();
        this._layer.cssClass = 'ui-window';
        this.#setupWindowLayers();
        return this;
    }

    #setupWindowLayers() {
        this._windowLayer = CALayer.layer();
        this._windowLayer.name = 'windowLayer';
        this._windowLayer.frame = { x: 0, y: 0, width: 0, height: 0 };
        this._windowLayer.backgroundColor = UIColor.windowBackground();
        this._layer.addSublayer(this._windowLayer);
    }

    get isKeyWindow() {
        return this._isKeyWindow;
    }

    set isKeyWindow(value) {
        this._isKeyWindow = value;
        if (this.element) {
            this.element.style.zIndex = value ? 9999 : this.windowLevel;
        }
    }

    get isVisible() {
        return this._isVisible;
    }

    set isVisible(value) {
        this._isVisible = value;
        if (this.element) {
            this.element.style.visibility = value ? 'visible' : 'hidden';
        }
    }

    deinit() {
        if (this.rootViewController) {
            this.rootViewController.viewWillDisappear();
            this.rootViewController.viewDidDisappear();
            this.rootViewController = null;
        }
        this._windowLayer = null;
        this._contentLayer = null;
        super.deinit();
    }

    setRootViewController(view_controller) {
        if (this.rootViewController) {
            this.rootViewController.view.removeFromSuperview();
            this.rootViewController.viewWillDisappear();
            this.rootViewController.viewDidDisappear();
        }

        this.rootViewController = view_controller;

        if (view_controller) {
            view_controller.view.willMoveToWindow(this);
            this.addSubview(view_controller.view);
            view_controller.viewDidMoveToWindow();
            view_controller.viewWillAppear();
            view_controller.viewDidAppear();
        }
        return this;
    }

    makeKeyWindow() {
        this._isKeyWindow = true;
        if (this.element) {
            this.element.style.zIndex = 9999;
        }
        this._updateAccessibilityAttributes();
        return this;
    }

    resignKeyWindow() {
        this._isKeyWindow = false;
        if (this.element) {
            this.element.style.zIndex = this.windowLevel;
        }
        return this;
    }

    becomeKeyWindow() {
        this._isKeyWindow = true;
        if (this.element) {
            this.element.style.zIndex = 9999;
        }
        this._updateAccessibilityAttributes();
        return this;
    }

    setWindowLevel(level) {
        this.windowLevel = level;
        if (this.element && !this._isKeyWindow) {
            this.element.style.zIndex = level;
        }
        return this;
    }

    setHidden(hidden) {
        this._isVisible = !hidden;
        super.setHidden(hidden);
        return this;
    }

    withRootViewController(view_controller) {
        return this.setRootViewController(view_controller);
    }

    withWindowLevel(level) {
        return this.setWindowLevel(level);
    }

    withHidden(hidden) {
        return this.setHidden(hidden);
    }

    withKey() {
        return this.makeKeyWindow();
    }

    layoutSubviews() {
        super.layoutSubviews();
        if (this._windowLayer) {
            this._windowLayer.frame = this._bounds;
        }
        if (this.rootViewController && this.element) {
            this.rootViewController.view.setFrame(0, 0, this.frame.width, this.frame.height);
        }
    }

    didMoveToWindow() {
        super.didMoveToWindow();
        if (this.rootViewController) {
            this.rootViewController.view.willMoveToWindow(this);
            this.rootViewController.view.didMoveToWindow();
        }
    }

    withGradient(colors, locations, startPoint, endPoint) {
        if (this._windowLayer) {
            const gradient = CAGradientLayer.layer();
            gradient.colors = colors;
            gradient.frame = { x: 0, y: 0, width: this._bounds.width, height: this._bounds.height };
            if (locations) gradient.locations = locations;
            if (startPoint) gradient.startPoint = startPoint;
            if (endPoint) gradient.endPoint = endPoint;
            gradient.name = 'windowGradientLayer';
            this._windowLayer.addSublayer(gradient);
            this.#renderLayers();
        }
        return this;
    }

    withBorder(color, width, radius) {
        if (this._windowLayer) {
            const shapeLayer = CAShapeLayer.layer();
            shapeLayer.frame = this._bounds;
            shapeLayer.path = CGPath.CreateRect(0, 0, this._bounds.width, this._bounds.height);
            shapeLayer.fillColor = null;
            shapeLayer.strokeColor = color;
            shapeLayer.lineWidth = width;
            if (radius) shapeLayer.cornerRadius = radius;
            this._windowLayer.addSublayer(shapeLayer);
            this.#renderLayers();
        }
        return this;
    }

    withShadow(color, opacity, offset, radius) {
        if (this._windowLayer) {
            this._windowLayer.shadowColor = color;
            this._windowLayer.shadowOpacity = opacity;
            this._windowLayer.shadowOffset = offset;
            this._windowLayer.shadowRadius = radius;
        }
        return this;
    }

    setNeedsDisplay() {
        this.#renderLayers();
        return this;
    }

    #renderLayers() {
        if (!this.element || !this._useLayerCanvas) return;
        
        const existingCanvas = this.element.querySelector('.layer-canvas');
        if (existingCanvas) existingCanvas.remove();

        const hasSublayers = this._windowLayer && this._windowLayer._sublayers && this._windowLayer._sublayers.length > 0;
        if (!hasSublayers) return;

        const canvas = document.createElement('canvas');
        canvas.className = 'layer-canvas';
        canvas.style.position = 'absolute';
        canvas.style.left = '0';
        canvas.style.top = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.width = this._bounds.width * 2;
        canvas.height = this._bounds.height * 2;
        
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);

        if (this._windowLayer) {
            for (const sublayer of this._windowLayer._sublayers) {
                sublayer.renderToContext(ctx);
            }
        }

        if (this.element.firstChild !== canvas) {
            this.element.insertBefore(canvas, this.element.firstChild);
        }
    }

    get description() {
        const vcDesc = this.rootViewController ? `rootViewController: UIViewController` : 'rootViewController: null';
        return `UIWindow(${vcDesc}, windowLevel: ${this.windowLevel}, isKeyWindow: ${this._isKeyWindow})`;
    }

    windowLevelAsNumber() {
        return NSNumber.of(this.windowLevel);
    }

    isKeyWindowAsNumber() {
        return NSNumber.of(this._isKeyWindow ? 1 : 0);
    }

    isVisibleAsNumber() {
        return NSNumber.of(this._isVisible ? 1 : 0);
    }

    encode() {
        return {
            windowLevel: this.windowLevel,
            isKeyWindow: this._isKeyWindow,
            isVisible: this._isVisible
        };
    }

    static decode(data) {
        const window = new UIWindow();
        window.windowLevel = data.windowLevel;
        window._isKeyWindow = data.isKeyWindow;
        window._isVisible = data.isVisible;
        return window;
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

    switch() {
        return Switch(this);
    }

    matchWindow(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        return Switch(predicate)
            .case({ keyWindow: true }, () => this._isKeyWindow)
            .case({ keyWindow: false }, () => !this._isKeyWindow)
            .case({ visible: true }, () => this._isVisible)
            .case({ visible: false }, () => !this._isVisible)
            .case({ level: Switch.let('l') }, (m) => this.windowLevel === m.l)
            .case({ hasRootViewController: true }, () => this.rootViewController !== null)
            .case({ hasRootViewController: false }, () => this.rootViewController === null)
            .default(() => false)
            .evaluate();
    }
}

export default UIWindow;