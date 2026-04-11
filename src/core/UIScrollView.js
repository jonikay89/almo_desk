import UIView from './UIView.js';
import { Optional, Result } from './Generics.js';
import { WeakRef } from './WeakReference.js';

class UIScrollView extends UIView {
    constructor() {
        super();
        this._contentSize = { width: 0, height: 0 };
        this._contentOffset = { x: 0, y: 0 };
        this._showsHorizontalScrollIndicator = true;
        this._showsVerticalScrollIndicator = true;
        this._bounces = true;
        this._alwaysBounceHorizontal = false;
        this._alwaysBounceVertical = false;
        this.contentInset = { top: 0, right: 0, bottom: 0, left: 0 };
        this._delegate = null;
    }

    get delegate() {
        return this._delegate ? this._delegate.target : null;
    }

    set delegate(value) {
        this._delegate = value instanceof WeakRef ? value : (value ? new WeakRef(value) : null);
    }

    get contentSize() {
        return this._contentSize;
    }

    set contentSize(value) {
        this._contentSize = value;
        if (this.contentElement) {
            this.contentElement.style.width = `${value.width}px`;
            this.contentElement.style.height = `${value.height}px`;
        }
    }

    get contentOffset() {
        return this._contentOffset;
    }

    set contentOffset(value) {
        this._contentOffset = value;
        if (this.element) {
            this.element.scrollLeft = value.x;
            this.element.scrollTop = value.y;
        }
    }

    get showsHorizontalScrollIndicator() {
        return this._showsHorizontalScrollIndicator;
    }

    set showsHorizontalScrollIndicator(value) {
        this._showsHorizontalScrollIndicator = value;
        this.#updateScrollbars();
    }

    get showsVerticalScrollIndicator() {
        return this._showsVerticalScrollIndicator;
    }

    set showsVerticalScrollIndicator(value) {
        this._showsVerticalScrollIndicator = value;
        this.#updateScrollbars();
    }

    get bounces() {
        return this._bounces;
    }

    set bounces(value) {
        this._bounces = value;
        if (this.element) {
            this.element.style.overscrollBehavior = value ? 'auto' : 'none';
        }
    }

    get alwaysBounceHorizontal() {
        return this._alwaysBounceHorizontal;
    }

    set alwaysBounceHorizontal(value) {
        this._alwaysBounceHorizontal = value;
        if (this.element) {
            this.element.style.overscrollBehaviorX = value ? 'auto' : 'none';
        }
    }

    get alwaysBounceVertical() {
        return this._alwaysBounceVertical;
    }

    set alwaysBounceVertical(value) {
        this._alwaysBounceVertical = value;
        if (this.element) {
            this.element.style.overscrollBehaviorY = value ? 'auto' : 'none';
        }
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
            this._contentOffset = { x: this.element.scrollLeft, y: this.element.scrollTop };
            
            const result = Optional.of(this.delegate?.scrollViewDidScroll)
                .flatMap(fn => Optional.fromNullable(fn(this)));
            
            if (result.isFailure) {
                console.error(result.error);
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

    setContentOffset(x, y, animated = false) {
        if (animated) {
            this.element.style.transition = 'scroll-behavior 0.2s ease';
        }
        this.contentOffset = { x, y };
        return Result.success(true);
    }

    setContentSize(width, height) {
        this.contentSize = { width, height };
        return Result.success(true);
    }

    scrollRectToVisible(rect, animated = false) {
        if (animated) {
            this.element.style.transition = 'scroll-behavior 0.2s ease';
        }
        if (this.element) {
            this.element.scrollLeft = rect.x;
            this.element.scrollTop = rect.y;
            return Result.success(true);
        }
        return Result.failure(new Error('Element not found'));
    }

    addSubview(view) {
        view.removeFromSuperview();
        view.superview = this;
        this.subviews.push(view);
        if (this.contentElement && view.element) {
            this.contentElement.appendChild(view.element);
        }
        view.didMoveToSuperview();
        return Result.success(view);
    }

    removeFromSuperview() {
        super.removeFromSuperview();
    }

    isDragging() {
        return Optional.fromNullable(this.element?.classList.contains('dragging')).getOrElse(false);
    }

    isDecelerating() {
        return Optional.fromNullable(this.element?.classList.contains('decelerating')).getOrElse(false);
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
