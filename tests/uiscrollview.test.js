/**
 * UIScrollView Test Suite
 * Tests for the UIScrollView class
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

class UIScrollView {
    constructor() {
        this.contentSize = { width: 0, height: 0 };
        this.contentOffset = { x: 0, y: 0 };
        this.showsHorizontalScrollIndicator = true;
        this.showsVerticalScrollIndicator = true;
        this.bounces = true;
        this.alwaysBounceHorizontal = false;
        this.alwaysBounceVertical = false;
        this.contentInset = { top: 0, right: 0, bottom: 0, left: 0 };
        this.delegate = null;
        this.subviews = [];
    }

    init() {
        this.element = document.createElement('div');
        this.element.className = 'ui-scrollview';
        this.element.style.overflow = 'auto';
        this.element.style.position = 'relative';
        
        this.contentElement = document.createElement('div');
        this.contentElement.className = 'ui-scrollview-content';
        this.contentElement.style.position = 'absolute';
        
        this.element.appendChild(this.contentElement);
        
        return this;
    }

    setContentSize(width, height) {
        this.contentSize = { width, height };
        if (this.contentElement) {
            this.contentElement.style.width = `${width}px`;
            this.contentElement.style.height = `${height}px`;
        }
    }

    setContentOffset(x, y) {
        this.contentOffset = { x, y };
    }

    setShowsHorizontalScrollIndicator(show) {
        this.showsHorizontalScrollIndicator = show;
    }

    setShowsVerticalScrollIndicator(show) {
        this.showsVerticalScrollIndicator = show;
    }

    setBounces(bounces) {
        this.bounces = bounces;
    }

    setAlwaysBounceHorizontal(alwaysBounce) {
        this.alwaysBounceHorizontal = alwaysBounce;
    }

    setAlwaysBounceVertical(alwaysBounce) {
        this.alwaysBounceVertical = alwaysBounce;
    }

    addSubview(view) {
        view.removeFromSuperview = () => {};
        view.superview = this;
        this.subviews.push(view);
    }
}

describe('UIScrollView', () => {
    let scrollView;

    beforeEach(() => {
        scrollView = new UIScrollView();
    });

    it('should initialize with default values', () => {
        assert.deepStrictEqual(scrollView.contentSize, { width: 0, height: 0 });
        assert.deepStrictEqual(scrollView.contentOffset, { x: 0, y: 0 });
        assert.strictEqual(scrollView.showsHorizontalScrollIndicator, true);
        assert.strictEqual(scrollView.showsVerticalScrollIndicator, true);
        assert.strictEqual(scrollView.bounces, true);
        assert.strictEqual(scrollView.alwaysBounceHorizontal, false);
        assert.strictEqual(scrollView.alwaysBounceVertical, false);
        assert.deepStrictEqual(scrollView.contentInset, { top: 0, right: 0, bottom: 0, left: 0 });
        assert.strictEqual(scrollView.delegate, null);
        assert.deepStrictEqual(scrollView.subviews, []);
    });

    it('should set content size', () => {
        scrollView.contentElement = { style: {} };
        scrollView.setContentSize(200, 400);
        assert.deepStrictEqual(scrollView.contentSize, { width: 200, height: 400 });
        assert.strictEqual(scrollView.contentElement.style.width, '200px');
        assert.strictEqual(scrollView.contentElement.style.height, '400px');
    });

    it('should set content offset', () => {
        scrollView.setContentOffset(50, 100);
        assert.deepStrictEqual(scrollView.contentOffset, { x: 50, y: 100 });
    });

    it('should toggle horizontal scroll indicator', () => {
        scrollView.setShowsHorizontalScrollIndicator(false);
        assert.strictEqual(scrollView.showsHorizontalScrollIndicator, false);
    });

    it('should toggle vertical scroll indicator', () => {
        scrollView.setShowsVerticalScrollIndicator(false);
        assert.strictEqual(scrollView.showsVerticalScrollIndicator, false);
    });

    it('should set bounces', () => {
        scrollView.setBounces(false);
        assert.strictEqual(scrollView.bounces, false);
    });

    it('should set always bounce horizontal', () => {
        scrollView.setAlwaysBounceHorizontal(true);
        assert.strictEqual(scrollView.alwaysBounceHorizontal, true);
    });

    it('should set always bounce vertical', () => {
        scrollView.setAlwaysBounceVertical(true);
        assert.strictEqual(scrollView.alwaysBounceVertical, true);
    });

    it('should have init method', () => {
        assert.strictEqual(typeof scrollView.init, 'function');
    });

    it('should add subview', () => {
        const child = {};
        scrollView.addSubview(child);
        assert.strictEqual(scrollView.subviews.length, 1);
        assert.strictEqual(child.superview, scrollView);
    });
});
