import UIView from './UIView.js';

class UIViewController extends UIView {
    constructor() {
        super();
        this.view = new UIView();
        this.view.element = null;
        this.isViewLoaded = false;
        this.parentController = null;
        this.childControllers = [];
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
        return this.view;
    }

    createView() {
        return document.createElement('div');
    }

    getView() {
        return this.loadViewIfNeeded().element;
    }
}

export default UIViewController;
