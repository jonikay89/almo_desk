import UIView from './UIView.js';

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
}

export default UIWindow;
