import UIView from './UIView.js';
import UIColor from './UIColor.js';
import { NSNumber } from './Foundation.js';

class UIPageControl extends UIView {
    constructor() {
        super();
        this._numberOfPages = 0;
        this._currentPage = 0;
        this.pageIndicatorTintColor = UIColor.lightGray();
        this.currentPageIndicatorTintColor = UIColor.systemBlue();
        this.enabled = true;
    }

    get numberOfPages() {
        return this._numberOfPages;
    }

    set numberOfPages(value) {
        this._numberOfPages = Math.max(0, Math.floor(value));
        this.#rebuildDots();
    }

    get currentPage() {
        return this._currentPage;
    }

    set currentPage(value) {
        this._currentPage = Math.max(0, Math.min(this._numberOfPages - 1, Math.floor(value)));
        this.#updateDots();
    }

    get description() {
        return `UIPageControl(currentPage: ${this._currentPage}, numberOfPages: ${this._numberOfPages})`;
    }

    currentPageAsNumber() {
        return NSNumber.of(this._currentPage);
    }

    numberOfPagesAsNumber() {
        return NSNumber.of(this._numberOfPages);
    }

    init() {
        this.element = document.createElement('div');
        this.element.className = 'ui-pagecontrol';
        this.element.style.display = 'flex';
        this.element.style.gap = '8px';
        this.element.style.alignItems = 'center';

        this.dotsContainer = document.createElement('div');
        this.dotsContainer.style.display = 'flex';
        this.dotsContainer.style.gap = '8px';

        this.element.appendChild(this.dotsContainer);

        return this;
    }

    #rebuildDots() {
        if (!this.dotsContainer) return;

        this.dotsContainer.innerHTML = '';

        for (let i = 0; i < this._numberOfPages; i++) {
            const dot = document.createElement('div');
            dot.style.width = '8px';
            dot.style.height = '8px';
            dot.style.borderRadius = '50%';
            dot.style.backgroundColor = this.pageIndicatorTintColor.css;
            dot.style.cursor = this.enabled ? 'pointer' : 'default';
            dot.style.transition = 'all 0.2s ease';

            const index = i;
            if (this.enabled) {
                dot.addEventListener('click', () => {
                    this.currentPage = index;
                });
            }

            this.dotsContainer.appendChild(dot);
        }

        this.#updateDots();
    }

    #updateDots() {
        if (!this.dotsContainer) return;

        const dots = this.dotsContainer.children;
        for (let i = 0; i < dots.length; i++) {
            const isCurrent = i === this._currentPage;
            dots[i].style.backgroundColor = isCurrent 
                ? this.currentPageIndicatorTintColor.css 
                : this.pageIndicatorTintColor.css;
            dots[i].style.transform = isCurrent ? 'scale(1.3)' : 'scale(1)';
        }
    }

    updateCurrentPageDisplay() {
        this.#updateDots();
    }

    layoutSubviews() {
        super.layoutSubviews();
        if (this.element) {
            this.element.style.width = `${this.frame.width}px`;
            this.element.style.height = `${this.frame.height}px`;
        }
    }

    encode() {
        return {
            currentPage: this._currentPage,
            numberOfPages: this._numberOfPages
        };
    }

    static decode(data) {
        const pc = new UIPageControl();
        pc._currentPage = data.currentPage || 0;
        pc._numberOfPages = data.numberOfPages || 0;
        return pc;
    }
}

export default UIPageControl;