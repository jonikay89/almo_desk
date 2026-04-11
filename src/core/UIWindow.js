import UIView from './UIView.js';
import { NSNumber } from './Foundation.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';

class UIWindow extends UIView {
    constructor() {
        super();
        this.rootViewController = null;
        this.windowLevel = 0;
        this.isKeyWindow = false;
        this.isVisible = true;
    }

    init() {
        this.element = document.createElement('div');
        this.element.className = 'ui-window';
        this.element.style.position = 'absolute';
        this.element.style.overflow = 'hidden';
        return this;
    }

    deinit() {
        if (this.rootViewController) {
            this.rootViewController.viewWillDisappear();
            this.rootViewController.viewDidDisappear();
            this.rootViewController = null;
        }
        super.deinit();
    }

    setRootViewController(viewController) {
        if (this.rootViewController) {
            this.rootViewController.view.removeFromSuperview();
            this.rootViewController.viewWillDisappear();
            this.rootViewController.viewDidDisappear();
        }

        this.rootViewController = viewController;

        if (viewController) {
            viewController.view.willMoveToWindow(this);
            this.addSubview(viewController.view);
            viewController.viewDidMoveToWindow();
            viewController.viewWillAppear();
            viewController.viewDidAppear();
        }
    }

    makeKeyWindow() {
        this.isKeyWindow = true;
        if (this.element) {
            this.element.style.zIndex = 9999;
        }
    }

    resignKeyWindow() {
        this.isKeyWindow = false;
    }

    becomeKeyWindow() {
        this.isKeyWindow = true;
    }

    setWindowLevel(level) {
        this.windowLevel = level;
        if (this.element) {
            this.element.style.zIndex = level;
        }
    }

    setHidden(hidden) {
        this.isVisible = !hidden;
        super.setHidden(hidden);
    }

    layoutSubviews() {
        super.layoutSubviews();
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

    get description() {
        const vcDesc = this.rootViewController ? `rootViewController: UIViewController` : 'rootViewController: null';
        return `UIWindow(${vcDesc}, windowLevel: ${this.windowLevel}, isKeyWindow: ${this.isKeyWindow})`;
    }

    windowLevelAsNumber() {
        return NSNumber.of(this.windowLevel);
    }

    isKeyWindowAsNumber() {
        return NSNumber.of(this.isKeyWindow ? 1 : 0);
    }

    isVisibleAsNumber() {
        return NSNumber.of(this.isVisible ? 1 : 0);
    }

    encode() {
        return {
            windowLevel: this.windowLevel,
            isKeyWindow: this.isKeyWindow,
            isVisible: this.isVisible
        };
    }

    static decode(data) {
        const window = new UIWindow();
        window.windowLevel = data.windowLevel;
        window.isKeyWindow = data.isKeyWindow;
        window.isVisible = data.isVisible;
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
}

export default UIWindow;
