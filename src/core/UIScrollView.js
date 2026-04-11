import UIView from './UIView.js';

class UIScrollView extends UIView {
    constructor() {
        super();
        this.contentSize = { width: 0, height: 0 };
        this.contentOffset = { x: 0, y: 0 };
        this.showsHorizontalScrollIndicator = true;
        this.showsVerticalScrollIndicator = true;
        this.bounces = true;
        this.alwaysBounceHorizontal = false;
        this.alwaysBounceVertical = false;
        this.contentInset = { top: 0, right: 0, bottom: 0, left: 0 };
        this.delegate = null;
    }

    init() {
        this.element = document.createElement('div');
        this.element.className = 'ui-scrollview';
        this.element.style.overflow = 'auto';
        this.element.style.position = 'relative';
        
        this.contentElement = document.createElement('div');
        this.contentElement.className = 'ui-scrollview-content';
        this.contentElement.style.position = 'absolute';
        this.contentElement.style.minWidth = '100%';
        this.contentElement.style.minHeight = '100%';
        
        this.element.appendChild(this.contentElement);
        
        this.element.addEventListener('scroll', () => {
            this.contentOffset.x = this.element.scrollLeft;
            this.contentOffset.y = this.element.scrollTop;
            
            if (this.delegate && typeof this.delegate.scrollViewDidScroll === 'function') {
                this.delegate.scrollViewDidScroll(this);
            }
        });
        
        this.#updateScrollbars();
        
        return this;
    }

    deinit() {
        this.contentElement = null;
        this.delegate = null;
        super.deinit();
    }

    #updateScrollbars() {
        if (this.element) {
            if (this.showsHorizontalScrollIndicator) {
                this.element.style.overflowX = 'auto';
            } else {
                this.element.style.overflowX = 'hidden';
            }
            
            if (this.showsVerticalScrollIndicator) {
                this.element.style.overflowY = 'auto';
            } else {
                this.element.style.overflowY = 'hidden';
            }
        }
    }

    setContentSize(width, height) {
        this.contentSize = { width, height };
        if (this.contentElement) {
            this.contentElement.style.width = `${width}px`;
            this.contentElement.style.height = `${height}px`;
        }
    }

    setContentOffset(x, y, animated = false) {
        if (animated) {
            this.element.style.transition = 'scroll-behavior 0.2s ease';
        }
        this.contentOffset = { x, y };
        if (this.element) {
            this.element.scrollLeft = x;
            this.element.scrollTop = y;
        }
    }

    scrollRectToVisible(rect, animated = false) {
        if (animated) {
            this.element.style.transition = 'scroll-behavior 0.2s ease';
        }
        if (this.element) {
            this.element.scrollLeft = rect.x;
            this.element.scrollTop = rect.y;
        }
    }

    setShowsHorizontalScrollIndicator(show) {
        this.showsHorizontalScrollIndicator = show;
        this.#updateScrollbars();
    }

    setShowsVerticalScrollIndicator(show) {
        this.showsVerticalScrollIndicator = show;
        this.#updateScrollbars();
    }

    setBounces(bounces) {
        this.bounces = bounces;
        if (this.element) {
            this.element.style.overscrollBehavior = bounces ? 'auto' : 'none';
        }
    }

    setAlwaysBounceHorizontal(alwaysBounce) {
        this.alwaysBounceHorizontal = alwaysBounce;
        if (this.element) {
            this.element.style.overscrollBehaviorX = alwaysBounce ? 'auto' : 'none';
        }
    }

    setAlwaysBounceVertical(alwaysBounce) {
        this.alwaysBounceVertical = alwaysBounce;
        if (this.element) {
            this.element.style.overscrollBehaviorY = alwaysBounce ? 'auto' : 'none';
        }
    }

    addSubview(view) {
        view.removeFromSuperview();
        view.superview = this;
        this.subviews.push(view);
        if (this.contentElement && view.element) {
            this.contentElement.appendChild(view.element);
        }
        view.didMoveToSuperview();
    }

    removeFromSuperview() {
        super.removeFromSuperview();
    }

    layoutSubviews() {
        super.layoutSubviews();
        if (this.element) {
            this.element.style.width = `${this.frame.width}px`;
            this.element.style.height = `${this.frame.height}px`;
        }
    }
}

export default UIScrollView;
