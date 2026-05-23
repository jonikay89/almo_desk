import UIResponder from './UIResponder.js';
import UIView from './UIView.js';
import { CurrentValueSubject, Binding } from './Observable.js';

class UIViewController extends UIResponder {
    constructor(nibName = null, bundle = null) {
        super();
        this._view = null;
        this._title = '';
        this._nibName = nibName;
        this._bundle = bundle;
        this._isViewLoaded = false;
        this._viewIfLoaded = null;
        this._modalViewController = null;
        this._presentingViewController = null;
        this._presentedViewControllers = [];
        this._parentViewController = null;
        this._childViewControllers = [];
        this._navigationController = null;
        this._tabBarController = null;
        this._splitViewController = null;
        this._toolbarItems = [];
        this._hidesBottomBarWhenPushed = false;
        this._isBeingDismissed = false;
        this._isBeingPresented = false;
        this._isMovingFromParent = false;
        this._isMovingToParent = false;
        this._observables = {};
        this._bindings = [];
    }

    get view() {
        if (!this._view && !this._isViewLoaded) {
            this.loadView();
            this._isViewLoaded = true;
        }
        return this._view;
    }

    set view(value) {
        this._view = value;
        if (value && !value._nextResponder) {
            value._nextResponder = this;
        }
    }

    get viewIfLoaded() {
        return this._isViewLoaded ? this._view : null;
    }

    get isViewLoaded() {
        return this._isViewLoaded;
    }

    get title() {
        return this._title;
    }

    set title(value) {
        this._title = value;
    }

    get nibName() {
        return this._nibName;
    }

    get bundle() {
        return this._bundle;
    }

    get modalViewController() {
        return this._modalViewController;
    }

    get presentingViewController() {
        return this._presentingViewController;
    }

    get presentedViewControllers() {
        return [...this._presentedViewControllers];
    }

    get parentViewController() {
        return this._parentViewController;
    }

    get childViewControllers() {
        return [...this._childViewControllers];
    }

    get navigationController() {
        return this._navigationController;
    }

    set navigationController(value) {
        this._navigationController = value;
    }

    get tabBarController() {
        return this._tabBarController;
    }

    set tabBarController(value) {
        this._tabBarController = value;
    }

    get splitViewController() {
        return this._splitViewController;
    }

    get toolbarItems() {
        return [...this._toolbarItems];
    }

    set toolbarItems(value) {
        this._toolbarItems = value ? [...value] : [];
    }

    get hidesBottomBarWhenPushed() {
        return this._hidesBottomBarWhenPushed;
    }

    set hidesBottomBarWhenPushed(value) {
        this._hidesBottomBarWhenPushed = value;
    }

    get isBeingDismissed() {
        return this._isBeingDismissed;
    }

    get isBeingPresented() {
        return this._isBeingPresented;
    }

    get isMovingFromParent() {
        return this._isMovingFromParent;
    }

    get isMovingToParent() {
        return this._isMovingToParent;
    }

    loadView() {
        this._view = new UIView();
        this._view._nextResponder = this;
        this.viewDidLoad();
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

    viewWillAppear(animated) {
        return;
    }

    viewDidAppear(animated) {
        return;
    }

    viewWillDisappear(animated) {
        return;
    }

    viewDidDisappear(animated) {
        return;
    }

    updateViewConstraints() {
        return;
    }

    addChildViewController(child) {
        if (!child) return;
        if (child._parentViewController) {
            child._parentViewController.removeChildViewController(child);
        }
        child._parentViewController = this;
        this._childViewControllers.push(child);
    }

    removeFromParentViewController() {
        if (!this._parentViewController) return;
        const index = this._parentViewController._childViewControllers.indexOf(this);
        if (index !== -1) {
            this._isMovingFromParent = true;
            this.viewWillDisappear();
            this._parentViewController._childViewControllers.splice(index, 1);
            this._parentViewController = null;
            this.viewDidDisappear();
            this._isMovingFromParent = false;
        }
    }

    removeChildViewController(child) {
        if (!child || child._parentViewController !== this) return;
        const index = this._childViewControllers.indexOf(child);
        if (index !== -1) {
            child._isMovingFromParent = true;
            child.viewWillDisappear();
            this._childViewControllers.splice(index, 1);
            child._parentViewController = null;
            child.viewDidDisappear();
            child._isMovingFromParent = false;
        }
    }

    transition(fromView, toView, duration, options, completion) {
        return new Promise(resolve => {
            setTimeout(() => {
                if (completion) completion();
                resolve();
            }, duration * 1000);
        });
    }

    presentViewController(viewControllerToPresent, animated, completion) {
        if (!viewControllerToPresent) return;
        this._modalViewController = viewControllerToPresent;
        viewControllerToPresent._presentingViewController = this;
        viewControllerToPresent._isBeingPresented = true;
        if (this.view && viewControllerToPresent.view) {
            this.addChildViewController(viewControllerToPresent);
            this.view.addSubview(viewControllerToPresent.view);
        }
        if (completion) completion();
        viewControllerToPresent._isBeingPresented = false;
    }

    dismissViewController(animated, completion) {
        if (!this._modalViewController) {
            if (completion) completion();
            return;
        }
        const modal = this._modalViewController;
        this._modalViewController = null;
        modal._isBeingDismissed = true;
        modal.view.removeFromSuperview();
        modal.removeFromParentViewController();
        modal._presentingViewController = null;
        if (completion) completion();
        modal._isBeingDismissed = false;
    }

    showViewController(viewController, sender) {
        if (!viewController) return;
        if (this._navigationController) {
            this._navigationController.pushViewController(viewController, true);
        } else {
            this.addChildViewController(viewController);
            if (this.view) {
                this.view.addSubview(viewController.view);
            }
        }
    }

    showDetailViewController(viewController, sender) {
        this.showViewController(viewController, sender);
    }

    setToolbarItems(items, animated) {
        this._toolbarItems = items ? [...items] : [];
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

    childViewControllersForStatusBarHidden() {
        return this._childViewControllers;
    }

    childViewControllersForHomeIndicatorAutoHidden() {
        return this._childViewControllers;
    }

    viewControllerForUnwind(fromViewController, toViewController, performHandler) {
        return null;
    }

    unwind(fromViewController, performHandler) {
        return null;
    }

    storyboard() {
        return this._storyboard;
    }

    setStoryboard(value) {
        this._storyboard = value;
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

    restorationIdentifier() {
        return this._restorationIdentifier;
    }

    setRestorationIdentifier(value) {
        this._restorationIdentifier = value;
    }

    encodeRestorableState(coder) {
        return;
    }

    decodeRestorableState(coder) {
        return;
    }

    applicationSupportForUndoMatching() {
        return;
    }

    viewForFirstBaselineLayout() {
        return this._view;
    }

    viewForLastBaselineLayout() {
        return this._view;
    }

    viewForFirstVerticalBaselineLayout() {
        return this._view;
    }

    viewForLastVerticalBaselineLayout() {
        return this._view;
    }

    addKeyframeWithRelativeStartTime(relativeStartTime, relativeDuration, animations) {
        return;
    }

    performWithoutAnimation(actions) {
        return;
    }

    _canPerformAction(action, sender) {
        return false;
    }

    _confirmDelegation() {
        return;
    }

    _setCanPerformAction(value, sender) {
        return;
    }
}

export default UIViewController;
