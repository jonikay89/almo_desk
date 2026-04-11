import UIView from '../core/UIView.js';

class WidgetView extends UIView {
    constructor(extraData = {}) {
        super();
        this.extraData = extraData;
        this.autoresizingMask = {
            flexWidth: false,
            flexHeight: false
        };
    }

    loadView() {
        this.element = this.createView();
        this.isViewLoaded = true;
    }

    createView() {
        throw new Error('createView() must be implemented by subclass');
    }

    viewDidLoad() {}

    viewWillAppear(animated = false) {}

    viewDidAppear(animated = false) {}

    viewWillDisappear(animated = false) {}

    viewDidDisappear(animated = false) {}

    didMoveToSuperview() {
        if (this.superview) {
            this.viewWillAppear();
            this.viewDidAppear();
        } else {
            this.viewWillDisappear();
            this.viewDidDisappear();
        }
    }

    layoutSubviews() {
        if (this.element) {
            this.element.style.left = `${this.frame.x}px`;
            this.element.style.top = `${this.frame.y}px`;
            this.element.style.width = `${this.frame.width}px`;
            this.element.style.height = `${this.frame.height}px`;
        }
    }

    setFrame(x, y, width, height) {
        this.frame = { x, y, width, height };
        this.bounds = { x: 0, y: 0, width, height };
        this.center = { x: x + width / 2, y: y + height / 2 };
        this.layoutSubviews();
    }

    getView() {
        if (!this.isViewLoaded) {
            this.loadView();
            this.viewDidLoad();
        }
        return this.element;
    }
}

export default WidgetView;
