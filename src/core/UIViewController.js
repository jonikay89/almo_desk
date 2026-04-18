import { CALayer } from './CALayer.js';
import { NSNumber } from './Foundation.js';
import { forCase, guardCase, guardLet, ifCase, ifLet, patternMatch, whileCase } from './PatternMatching.js';
import Switch from './Switch.js';
import UIResponder from './UIResponder.js';
import { WeakRef } from './WeakReference.js';

class UIViewController extends UIResponder {
    constructor() {
        super();
        this._view = null;
        this.isViewLoaded = false;
        this._parentController = null;
        this._childControllers = [];
        this._viewControllerLayer = null;
        this._isAppearing = false;
        this._isDisappearing = false;
        this._transitioning = false;
        this._modalPresentationStyle = 'none';
        this._modalTransitionStyle = 'coverVertical';
    }

    get view() {
        return this._view;
    }

    set view(v) {
        this._view = v;
        if (v) {
            v._nextResponder = this;
        }
    }

    get parentController() {
        return this._parentController ? this._parentController.target : null;
    }

    set parentController(value) {
        this._parentController = value instanceof WeakRef ? value : (value ? new WeakRef(value) : null);
    }

    get childControllers() {
        return this._childControllers
            .map(ref => ref.target)
            .filter(c => c !== null);
    }

    get isAppearing() {
        return this._isAppearing;
    }

    get isDisappearing() {
        return this._isDisappearing;
    }

    get modalPresentationStyle() {
        return this._modalPresentationStyle;
    }

    set modalPresentationStyle(style) {
        this._modalPresentationStyle = style;
    }

    get modalTransitionStyle() {
        return this._modalTransitionStyle;
    }

    set modalTransitionStyle(style) {
        this._modalTransitionStyle = style;
    }

    get isBeingDismissed() {
        return this._isDisappearing;
    }

    get isBeingPresented() {
        return this._isAppearing;
    }

    loadView() {
        throw new Error('loadView() must be implemented by subclass');
    }

    viewDidLoad() {}

    viewWillAppear(animated = false) {
        this._isAppearing = true;
    }

    viewDidAppear(animated = false) {
        this._isAppearing = false;
        this._view?._updateAccessibilityAttributes();
    }

    viewWillDisappear(animated = false) {
        this._isDisappearing = true;
    }

    viewDidDisappear(animated = false) {
        this._isDisappearing = false;
    }

    viewDidLayoutSubviews() {}

    didMove(toParentController) {
        if (toParentController) {
            toParentController.addChild(this);
        } else if (this.parentController) {
            this.parentController.removeChild(this);
        }
    }

    willMoveToParentViewController(parent) {
        if (parent === null && this.parentController) {
        }
    }

    didMoveToParentViewController(parent) {
        if (parent) {
            this.parentController = parent;
        } else {
            this.parentController = null;
        }
    }

    addChild(controller) {
        controller.parentController = this;
        const weakRef = controller instanceof WeakRef ? controller : new WeakRef(controller);
        this._childControllers.push(weakRef);
        controller.didMoveToParentViewController(this);
        controller.didMove(this);
        return this;
    }

    removeChild(controller) {
        controller.willMoveToParentViewController(null);
        controller.parentController = null;
        this._childControllers = this._childControllers.filter(ref => ref.target !== controller);
        controller.didMoveToParentViewController(null);
        return this;
    }

    removeFromParent() {
        if (this.parentController) {
            this.parentController.removeChild(this);
        }
        return this;
    }

    loadViewIfNeeded() {
        if (!this.isViewLoaded) {
            this.loadView();
            this.isViewLoaded = true;
            this.viewDidLoad();
        }
        return this._view;
    }

    createView() {
        const view = document.createElement('div');
        view.className = 'ui-view-controller-view';
        view.style.width = '100%';
        view.style.height = '100%';
        return view;
    }

    getView() {
        return this.loadViewIfNeeded().element;
    }

    setupViewLayers() {
        if (this._view && !this._viewControllerLayer) {
            this._viewControllerLayer = CALayer.layer();
            this._viewControllerLayer.name = 'viewControllerLayer';
            this._viewControllerLayer.frame = { x: 0, y: 0, width: 0, height: 0 };
            this._view.layer.addSublayer(this._viewControllerLayer);
        }
    }

    viewWillLayoutSubviews() {}

    viewLayoutMarginsDidChange() {}

    viewSafeAreaInsetsDidChange() {}

    preferredContentSizeDidChangeForChildContentContainer(container) {}

    sizeForChildContentContainer(container, parentSize) {
        return container.preferredContentSize || { width: 0, height: 0 };
    }

    childViewControllerForStatusBarStyle() {
        return null;
    }

    childViewControllerForStatusBarHidden() {
        return null;
    }

    prefersStatusBarHidden() {
        return false;
    }

    preferredStatusBarStyle() {
        return 'default';
    }

    prefersHomeIndicatorAutoHidden() {
        return false;
    }

    touchesBegan(touches, event) {
        this._view?.touchesBegan?.(touches, event);
    }

    touchesMoved(touches, event) {
        this._view?.touchesMoved?.(touches, event);
    }

    touchesEnded(touches, event) {
        this._view?.touchesEnded?.(touches, event);
    }

    touchesCancelled(touches, event) {
        this._view?.touchesCancelled?.(touches, event);
    }

    withView(view) {
        this._view = view;
        if (view) {
            view._nextResponder = this;
        }
        return this;
    }

    withModalPresentationStyle(style) {
        this._modalPresentationStyle = style;
        return this;
    }

    withModalTransitionStyle(style) {
        this._modalTransitionStyle = style;
        return this;
    }

    present(viewController, animated = true, completion = null) {
        if (animated && viewController._modalTransitionStyle) {
            setTimeout(() => {
                completion?.();
            }, 300);
        } else {
            completion?.();
        }
        return this;
    }

    dismiss(animated = true, completion = null) {
        if (animated) {
            setTimeout(() => {
                completion?.();
            }, 300);
        } else {
            completion?.();
        }
        return this;
    }

    show(viewController, sender = null) {
        return this;
    }

    showDetailViewController(viewController, sender) {
        return this;
    }

    transition(fromViewController, toViewController, duration, options, animations, completion) {
        this._transitioning = true;
        if (animations) {
            animations();
        }
        setTimeout(() => {
            this._transitioning = false;
            completion?.();
        }, duration * 1000);
        return this;
    }

    get description() {
        const childCount = this._childControllers.length;
        return `UIViewController(childControllers: ${childCount}, isViewLoaded: ${this.isViewLoaded})`;
    }

    childControllersAsArray() {
        return this.childControllers;
    }

    isViewLoadedAsNumber() {
        return NSNumber.of(this.isViewLoaded ? 1 : 0);
    }

    encode() {
        return {
            isViewLoaded: this.isViewLoaded,
            modalPresentationStyle: this._modalPresentationStyle,
            modalTransitionStyle: this._modalTransitionStyle
        };
    }

    static decode(data) {
        const vc = new UIViewController();
        vc.isViewLoaded = data.isViewLoaded;
        vc._modalPresentationStyle = data.modalPresentationStyle || 'none';
        vc._modalTransitionStyle = data.modalTransitionStyle || 'coverVertical';
        return vc;
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

    matchViewController(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        return Switch(predicate)
            .case({ viewLoaded: true }, () => this.isViewLoaded)
            .case({ viewLoaded: false }, () => !this.isViewLoaded)
            .case({ appearing: true }, () => this._isAppearing)
            .case({ appearing: false }, () => !this._isAppearing)
            .case({ disappearing: true }, () => this._isDisappearing)
            .case({ disappearing: false }, () => !this._isDisappearing)
            .case({ transitioning: true }, () => this._transitioning)
            .case({ transitioning: false }, () => !this._transitioning)
            .case({ hasParent: true }, () => this.parentController !== null)
            .case({ hasParent: false }, () => this.parentController === null)
            .case({ hasChildren: true }, () => this._childControllers.length > 0)
            .case({ hasChildren: false }, () => this._childControllers.length === 0)
            .default(() => false)
            .evaluate();
    }
}

export default UIViewController;