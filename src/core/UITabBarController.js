import UIViewController from './UIViewController.js';

class UITabBarController extends UIViewController {
    constructor() {
        super();
        this._viewControllers = [];
        this._selectedIndex = 0;
        this._delegate = null;
        this._tabBar = null;
        this._customizableViewControllers = null;
        this._moreNavigationController = null;
    }

    get viewControllers() { return this._viewControllers; }
    set viewControllers(value) {
        this._viewControllers = value || [];
        this._selectedIndex = Math.min(this._selectedIndex, this._viewControllers.length - 1);
        this._viewControllers.forEach(vc => vc.tabBarController = this);
    }

    get selectedIndex() { return this._selectedIndex; }
    set selectedIndex(value) {
        if (value < 0 || value >= this._viewControllers.length) return;
        const previousIndex = this._selectedIndex;
        this._selectedIndex = value;

        if (this._delegate && this._delegate.tabBarController_didSelect) {
            this._delegate.tabBarController_didSelect(this, this.selectedViewController);
        }
    }

    get selectedViewController() {
        return this._viewControllers[this._selectedIndex] || null;
    }
    set selectedViewController(value) {
        const index = this._viewControllers.indexOf(value);
        if (index !== -1) {
            this.selectedIndex = index;
        }
    }

    get tabBar() { return this._tabBar; }
    set tabBar(value) { this._tabBar = value; }

    get delegate() { return this._delegate; }
    set delegate(value) { this._delegate = value; }

    get customizableViewControllers() { return this._customizableViewControllers; }
    set customizableViewControllers(value) { this._customizableViewControllers = value; }

    get moreNavigationController() { return this._moreNavigationController; }
}

export default UITabBarController;
