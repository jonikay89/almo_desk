import UIResponder from './UIResponder.js';
import { WeakRef } from './WeakReference.js';
import { NSNumber } from './Foundation.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';

class UIViewController extends UIResponder {
    constructor() {
        super();
        this._view = null;
        this.isViewLoaded = false;
        this._parentController = null;
        this._childControllers = [];
    }

    get view() {
        return this._view;
    }

    set view(view) {
        this._view = view;
        if (view) {
            view._nextResponder = this;
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

    loadView() {
        throw new Error('loadView() must be implemented by subclass');
    }

    viewDidLoad() {}

    viewWillAppear(animated = false) {}

    viewDidAppear(animated = false) {}

    viewWillDisappear(animated = false) {}

    viewDidDisappear(animated = false) {}

    viewDidLayoutSubviews() {}

    didMove(toParentController) {
        if (toParentController) {
            toParentController.addChild(this);
        } else if (this.parentController) {
            this.parentController.removeChild(this);
        }
    }

    addChild(controller) {
        controller.parentController = this;
        const weakRef = controller instanceof WeakRef ? controller : new WeakRef(controller);
        this._childControllers.push(weakRef);
        controller.didMove(this);
    }

    removeChild(controller) {
        controller.parentController = null;
        this._childControllers = this._childControllers.filter(ref => ref.target !== controller);
    }

    removeFromParent() {
        if (this.parentController) {
            this.removeChild(this);
        }
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
        return document.createElement('div');
    }

    getView() {
        return this.loadViewIfNeeded().element;
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
            isViewLoaded: this.isViewLoaded
        };
    }

    static decode(data) {
        const vc = new UIViewController();
        vc.isViewLoaded = data.isViewLoaded;
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
}

export default UIViewController;
