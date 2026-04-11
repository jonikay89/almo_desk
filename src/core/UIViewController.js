import UIResponder from './UIResponder.js';

class UIViewController extends UIResponder {
    constructor() {
        super();
        this.view = null;
        this.isViewLoaded = false;
        this.parentController = null;
        this.childControllers = [];
        this._view = null;
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

    get view() {
        return this._view;
    }

    set view(view) {
        this._view = view;
        if (view) {
            view._nextResponder = this;
        }
    }

    didMove(toParentController) {
        if (toParentController) {
            toParentController.addChild(this);
        } else if (this.parentController) {
            this.parentController.removeChild(this);
        }
    }

    addChild(controller) {
        controller.parentController = this;
        this.childControllers.push(controller);
        controller.didMove(this);
    }

    removeChild(controller) {
        controller.parentController = null;
        this.childControllers = this.childControllers.filter(c => c !== controller);
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
}

export default UIViewController;
