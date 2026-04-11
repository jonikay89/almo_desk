class UIView {
    constructor() {
        this.superview = null;
        this.window = null;
        this.frame = { x: 0, y: 0, width: 0, height: 0 };
        this.bounds = { x: 0, y: 0, width: 0, height: 0 };
        this.center = { x: 0, y: 0 };
        this.alpha = 1;
        this.hidden = false;
        this.clipsToBounds = false;
        this.userInteractionEnabled = true;
        this.tag = 0;
        this.subviews = [];
        this.element = null;
        this.zIndex = 0;
        this.translatesAutoresizingMaskIntoConstraints = true;
    }

    didMoveToSuperview() {}

    willMoveToWindow(window) {}

    didMoveToWindow() {}

    layoutSubviews() {}

    addSubview(view) {
        view.removeFromSuperview();
        view.superview = this;
        this.subviews.push(view);
        if (this.element && view.element) {
            this.element.appendChild(view.element);
        }
        view.didMoveToSuperview();
    }

    removeFromSuperview() {
        if (this.superview) {
            this.superview.subviews = this.superview.subviews.filter(v => v !== this);
            if (this.element && this.superview.element) {
                this.superview.element.removeChild(this.element);
            }
            this.superview = null;
        }
    }

    setFrame(x, y, width, height) {
        this.frame = { x, y, width, height };
        this.bounds = { x: 0, y: 0, width, height };
        this.center = { x: x + width / 2, y: y + height / 2 };
        this.layoutSubviews();
    }

    setHidden(hidden) {
        this.hidden = hidden;
        if (this.element) {
            this.element.style.display = hidden ? 'none' : '';
        }
    }

    setAlpha(alpha) {
        this.alpha = alpha;
        if (this.element) {
            this.element.style.opacity = alpha;
        }
    }
}

export default UIView;
