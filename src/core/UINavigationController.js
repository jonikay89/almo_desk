import UIViewController from './UIViewController.js';

class UINavigationController extends UIViewController {
    constructor(rootViewController = null) {
        super();
        this._viewControllers = [];
        this._navigationBar = null;
        this._toolbar = null;
        this._isNavigationBarHidden = false;
        this._isToolbarHidden = true;
        this._delegate = null;

        if (rootViewController) {
            this._viewControllers.push(rootViewController);
            rootViewController.navigationController = this;
        }
    }

    get viewControllers() { return this._viewControllers; }

    get topViewController() {
        return this._viewControllers.length > 0
            ? this._viewControllers[this._viewControllers.length - 1]
            : null;
    }

    get visibleViewController() {
        return this.topViewController;
    }

    get navigationBar() { return this._navigationBar; }
    set navigationBar(value) { this._navigationBar = value; }

    get toolbar() { return this._toolbar; }
    set toolbar(value) { this._toolbar = value; }

    get isNavigationBarHidden() { return this._isNavigationBarHidden; }
    set isNavigationBarHidden(value) { this._isNavigationBarHidden = value; }

    get isToolbarHidden() { return this._isToolbarHidden; }
    set isToolbarHidden(value) { this._isToolbarHidden = value; }

    get delegate() { return this._delegate; }
    set delegate(value) { this._delegate = value; }

    pushViewController(viewController, animated = true) {
        if (!viewController) return;
        viewController.navigationController = this;
        this._viewControllers.push(viewController);

        if (this._delegate && this._delegate.navigationController_didShow) {
            this._delegate.navigationController_didShow(this, viewController);
        }
    }

    popViewController(animated = true) {
        if (this._viewControllers.length <= 1) return null;

        const popped = this._viewControllers.pop();
        popped.navigationController = null;

        const current = this.topViewController;

        if (this._delegate && this._delegate.navigationController_didShow) {
            this._delegate.navigationController_didShow(this, current);
        }

        return popped;
    }

    popToViewController(viewController, animated = true) {
        const index = this._viewControllers.indexOf(viewController);
        if (index === -1) return [];

        const popped = this._viewControllers.splice(index + 1);
        popped.forEach(vc => vc.navigationController = null);

        return popped;
    }

    popToRootViewController(animated = true) {
        if (this._viewControllers.length <= 1) return [];

        const popped = this._viewControllers.splice(1);
        popped.forEach(vc => vc.navigationController = null);

        return popped;
    }

    setViewControllers(viewControllers, animated = false) {
        this._viewControllers.forEach(vc => vc.navigationController = null);
        this._viewControllers = viewControllers || [];
        this._viewControllers.forEach(vc => vc.navigationController = this);
    }
}

export default UINavigationController;
