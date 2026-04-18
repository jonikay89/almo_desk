import UIView from './UIView.js';
import { ViewLayerBridge } from './bridge/index.js';

class UIWindow extends UIView {
    constructor(frame = { x: 0, y: 0, width: 800, height: 600 }) {
        super(frame);
        this._isWindow = true;
        this._rootViewController = null;
        this._windowLevel = 0;
        this._isKeyWindow = false;
        this._isVisible = false;
        this._isFullScreen = false;
        this._screen = null;
        this._windowScene = null;
        this._contentView = null;
        this._backgroundView = null;
        this._bridge = null;
        this._eventMonitor = null;
        this._isResponding = false;
        this._previousKeyWindow = null;
        this._rootView = null;
        this._subwindowStorage = [];
    }

    get rootViewController() {
        return this._rootViewController;
    }

    set rootViewController(value) {
        if (value === this._rootViewController) return;
        if (this._rootViewController) {
            this._rootViewController._isMovingFromParent = true;
            this._rootViewController.viewWillDisappear();
            this._rootViewController._isMovingFromParent = false;
        }
        this._rootViewController = value;
        if (value) {
            value._isMovingToParent = true;
            value.viewWillAppear();
            value._isMovingToParent = false;
            this._setupRootView();
        }
    }

    get windowLevel() {
        return this._windowLevel;
    }

    set windowLevel(value) {
        this._windowLevel = value;
    }

    get isKeyWindow() {
        return this._isKeyWindow;
    }

    set isKeyWindow(value) {
        this._isKeyWindow = value;
    }

    get isVisible() {
        return this._isVisible;
    }

    set isVisible(value) {
        this._isVisible = value;
    }

    get isFullScreen() {
        return this._isFullScreen;
    }

    set isFullScreen(value) {
        this._isFullScreen = value;
    }

    get screen() {
        return this._screen;
    }

    set screen(value) {
        this._screen = value;
    }

    get windowScene() {
        return this._windowScene;
    }

    set windowScene(value) {
        this._windowScene = value;
    }

    _setupRootView() {
        if (!this._rootViewController || !this._rootViewController.view) return;
        if (this._rootView) {
            this._rootView.removeFromSuperview();
        }
        this._rootView = this._rootViewController.view;
        this._rootView._window = this;
        this._rootView._frame = this._bounds;
        this._rootView._bounds = { x: 0, y: 0, width: this._bounds.width, height: this._bounds.height };
        this._rootView._center = { x: this._bounds.width / 2, y: this._bounds.height / 2 };
        this._rootView._syncFrameToLayer();
        this.addSubview(this._rootView);
        this._rootViewController.viewDidAppear();
        this._rootViewController._isMovingToParent = false;
    }

    _createElement() {
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.left = `${this._frame.x}px`;
        element.style.top = `${this._frame.y}px`;
        element.style.width = `${this._frame.width}px`;
        element.style.height = `${this._frame.height}px`;
        element.style.overflow = 'hidden';
        element.style.boxSizing = 'border-box';
        element.className = 'ui-window';
        return element;
    }

    makeKeyWindow() {
        if (this._isKeyWindow) return;
        this._previousKeyWindow = UIWindow._currentKeyWindow;
        UIWindow._currentKeyWindow = this;
        this._isKeyWindow = true;
        if (this._previousKeyWindow) {
            this._previousKeyWindow._isKeyWindow = false;
        }
    }

    resignKeyWindow() {
        if (!this._isKeyWindow) return;
        this._isKeyWindow = false;
        if (UIWindow._currentKeyWindow === this) {
            UIWindow._currentKeyWindow = null;
        }
    }

    becomeKeyWindow() {
        this.makeKeyWindow();
    }

    makeKeyAndVisible() {
        this.makeKeyWindow();
        this.isVisible = true;
        this._isVisible = true;
        if (this._element) {
            this._element.style.display = 'block';
        }
        if (this._rootViewController) {
            this._rootViewController.viewDidAppear();
        }
    }

    becomeKeyWindowAndMakeVisible() {
        this.becomeKeyWindow();
        this.isVisible = true;
        this._isVisible = true;
        if (this._element) {
            this._element.style.visibility = 'visible';
        }
    }

    hide() {
        this.isVisible = false;
        this._isVisible = false;
        if (this._element) {
            this._element.style.display = 'none';
        }
    }

    show() {
        this.isVisible = true;
        this._isVisible = true;
        if (this._element) {
            this._element.style.display = 'block';
        }
    }

    close() {
        if (this._rootViewController) {
            this._rootViewController.viewWillDisappear();
            this._rootViewController.viewDidDisappear();
        }
        if (this._element && this._element.parentElement) {
            this._element.parentElement.removeChild(this._element);
        }
        if (this._bridge) {
            this._bridge.destroy();
            this._bridge = null;
        }
        this._isVisible = false;
    }

    setFrame(frame) {
        this.frame = frame;
        if (this._rootView) {
            this._rootView.frame = this._bounds;
            this._rootView._syncFrameToLayer();
        }
    }

    layoutSubviews() {
        super.layoutSubviews();
        if (this._rootView) {
            this._rootView.frame = this._bounds;
            this._rootView._syncFrameToLayer();
            this._rootView.setNeedsLayout();
        }
    }

    addSubwindow(window) {
        if (!window || window === this) return;
        this._subwindowStorage.push(window);
        window._window = this;
        window._frame = {
            x: 0,
            y: 0,
            width: this._bounds.width,
            height: this._bounds.height
        };
        window._bounds = this._bounds;
        window._syncFrameToLayer();
        if (typeof document !== 'undefined' && this._element && window._element) {
            this._element.appendChild(window._element);
        }
        window.isVisible = true;
        window.viewWasAddedToWindow();
    }

    removeSubwindow(window) {
        if (!window) return;
        const index = this._subwindowStorage.indexOf(window);
        if (index !== -1) {
            this._subwindowStorage.splice(index, 1);
        }
        window._window = null;
        if (window._element && window._element.parentElement === this._element) {
            this._element.removeChild(window._element);
        }
        window.isVisible = false;
        window.viewWasRemovedFromWindow();
    }

    viewWasAddedToWindow() {
        return;
    }

    viewWasRemovedFromWindow() {
        return;
    }

    sendEvent(event) {
        this._isResponding = true;
        const touch = event.touches ? event.touches[0] : event;
        const point = { x: touch.clientX, y: touch.clientY };
        const hitView = this.hitTest(point, event);
        if (hitView) {
            hitView.touchesBegan([touch], event);
        }
        this._isResponding = false;
    }

    _handleTouchBegan(event) {
        if (!event.touches || event.touches.length === 0) return;
        const touches = Array.from(event.touches);
        const point = { x: touches[0].clientX, y: touches[0].clientY };
        const hitView = this.hitTest(point, event);
        if (hitView) {
            hitView.touchesBegan(touches, event);
        }
    }

    _handleTouchMove(event) {
        if (!event.touches || event.touches.length === 0) return;
        const touches = Array.from(event.touches);
        const point = { x: touches[0].clientX, y: touches[0].clientY };
        const hitView = this.hitTest(point, event);
        if (hitView) {
            hitView.touchesMoved(touches, event);
        }
    }

    _handleTouchEnd(event) {
        if (!event.changedTouches || event.changedTouches.length === 0) return;
        const touches = Array.from(event.changedTouches);
        const point = { x: touches[0].clientX, y: touches[0].clientY };
        const hitView = this.hitTest(point, event);
        if (hitView) {
            hitView.touchesEnded(touches, event);
        }
    }

    _handleTouchCancel(event) {
        if (!event.changedTouches || event.changedTouches.length === 0) return;
        const touches = Array.from(event.changedTouches);
        const point = { x: touches[0].clientX, y: touches[0].clientY };
        const hitView = this.hitTest(point, event);
        if (hitView) {
            hitView.touchesCancelled(touches, event);
        }
    }

    _attachEventListeners() {
        if (typeof document === 'undefined') return;
        this._element.addEventListener('touchstart', this._handleTouchBegan.bind(this), { passive: false });
        this._element.addEventListener('touchmove', this._handleTouchMove.bind(this), { passive: false });
        this._element.addEventListener('touchend', this._handleTouchEnd.bind(this), { passive: false });
        this._element.addEventListener('touchcancel', this._handleTouchCancel.bind(this), { passive: false });
        this._element.addEventListener('mousedown', this._handleTouchBegan.bind(this));
        this._element.addEventListener('mousemove', this._handleTouchMove.bind(this));
        this._element.addEventListener('mouseup', this._handleTouchEnd.bind(this));
    }

    _detachEventListeners() {
        if (typeof document === 'undefined') return;
        this._element.removeEventListener('touchstart', this._handleTouchBegan.bind(this));
        this._element.removeEventListener('touchmove', this._handleTouchMove.bind(this));
        this._element.removeEventListener('touchend', this._handleTouchEnd.bind(this));
        this._element.removeEventListener('touchcancel', this._handleTouchCancel.bind(this));
        this._element.removeEventListener('mousedown', this._handleTouchBegan.bind(this));
        this._element.removeEventListener('mousemove', this._handleTouchMove.bind(this));
        this._element.removeEventListener('mouseup', this._handleTouchEnd.bind(this));
    }

    static allWindows() {
        return UIWindow._allWindows ? [...UIWindow._allWindows] : [];
    }

    static keyWindow() {
        return UIWindow._currentKeyWindow;
    }

    static _registerWindow(window) {
        if (!UIWindow._allWindows) UIWindow._allWindows = new Set();
        UIWindow._allWindows.add(window);
    }

    static _unregisterWindow(window) {
        if (UIWindow._allWindows) {
            UIWindow._allWindows.delete(window);
        }
    }

    static windowWithWindowLevel(level) {
        if (!UIWindow._allWindows) return null;
        for (const window of UIWindow._allWindows) {
            if (window._windowLevel === level) return window;
        }
        return null;
    }

    init() {
        UIWindow._registerWindow(this);
        if (!this._element) {
            this._element = this._createElement();
        }
        if (this._rootViewController) {
            this._setupRootView();
        }
        this._attachEventListeners();
        return this._element;
    }

    destroy() {
        UIWindow._unregisterWindow(this);
        this._detachEventListeners();
        if (this._bridge) {
            this._bridge.destroy();
            this._bridge = null;
        }
        if (this._element && this._element.parentElement) {
            this._element.parentElement.removeChild(this._element);
        }
    }
}

UIWindow._currentKeyWindow = null;
UIWindow._allWindows = null;

export default UIWindow;
