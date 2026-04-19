import UIView from './UIView.js';
import UIPanGestureRecognizer from './UIPanGestureRecognizer.js';
import UIPinchGestureRecognizer from './UIPinchGestureRecognizer.js';

const UIScrollViewDelegate = {
    scrollViewWillBeginDragging(scrollView) {},
    scrollViewDidBeginDragging(scrollView) {},
    scrollViewWillEndDragging(scrollView, velocity, targetContentOffset) {},
    scrollViewDidEndDragging(scrollView, decelerate) {},
    scrollViewWillBeginDecelerating(scrollView) {},
    scrollViewDidEndDecelerating(scrollView) {},
    scrollViewDidEndScrollingAnimation(scrollView) {},
    scrollViewDidScroll(scrollView) {},
    scrollViewDidZoom(scrollView) {},
    scrollViewWillBeginZooming(scrollView) {},
    scrollViewDidEndZooming(scrollView, scale) {},
    scrollViewDidScrollToTop(scrollView) {},
    scrollViewDidChangeAdjustedContentInset(scrollView) {}
};

class UIScrollView extends UIView {
    constructor(frame = { x: 0, y: 0, width: 0, height: 0 }) {
        super(frame);
        this._contentSize = { width: 0, height: 0 };
        this._contentOffset = { x: 0, y: 0 };
        this._contentInset = { top: 0, left: 0, bottom: 0, right: 0 };
        this._adjustedContentInset = { top: 0, left: 0, bottom: 0, right: 0 };
        
        this._showsHorizontalScrollIndicator = true;
        this._showsVerticalScrollIndicator = true;
        this._indicatorStyle = 'default';
        this._indicatorInsets = { top: 0, left: 0, bottom: 0, right: 0 };
        
        this._decelerationRate = 0.998;
        this._velocity = { x: 0, y: 0 };
        this._isDecelerating = false;
        this._decelerationTimer = null;
        
        this._minimumZoomScale = 1.0;
        this._maximumZoomScale = 1.0;
        this._zoomScale = 1.0;
        this._isZooming = false;
        this._zoomBounce = false;
        
        this._pagingEnabled = false;
        this._pageSize = { width: 0, height: 0 };
        this._currentPage = { x: 0, y: 0 };
        
        this._keyboardDismissMode = 'none';
        this._keyboardAvoidingEnabled = false;
        this._keyboardHeight = 0;
        
        this._delegate = null;
        this._panGestureRecognizer = null;
        this._pinchGestureRecognizer = null;
        this._isDragging = false;
        this._isTracking = false;
        
        this._horizontalIndicator = null;
        this._verticalIndicator = null;
        this._indicator_opacity = 0;
        
        this._lastPanLocation = { x: 0, y: 0 };
        this._lastPanTime = 0;
        this._panVelocity = { x: 0, y: 0 };
        
        this._canScrollHorizontal = true;
        this._canScrollVertical = true;
        
        this._scrollsToTop = true;
        this._delaysContentTouches = true;
        this._canCancelTouchInSubviews = true;
        
        this._touchInfo = {
            startTime: 0,
            startOffset: { x: 0, y: 0 },
            startLocation: { x: 0, y: 0 },
            lastLocation: { x: 0, y: 0 },
            lastTime: 0,
            velocity: { x: 0, y: 0 },
            isTracking: false
        };
    }

    get contentSize() { return { ...this._contentSize }; }
    set contentSize(value) {
        this._contentSize = { ...value };
        this._updateContentElement();
        this._updateScrollIndicators();
    }

    get contentOffset() { return { ...this._contentOffset }; }
    set contentOffset(value) {
        const oldOffset = { ...this._contentOffset };
        this._contentOffset = this._clampOffset({ ...value });
        this._syncContentElement();
        this._updateScrollIndicators();
        if (this._delegate && this._delegate.scrollViewDidScroll) {
            this._delegate.scrollViewDidScroll(this);
        }
    }

    get contentInset() { return { ...this._contentInset }; }
    set contentInset(value) {
        this._contentInset = { ...value };
        this._updateAdjustedContentInset();
    }

    get delegate() { return this._delegate; }
    set delegate(value) { this._delegate = value; }

    get showsHorizontalScrollIndicator() { return this._showsHorizontalScrollIndicator; }
    set showsHorizontalScrollIndicator(value) {
        this._showsHorizontalScrollIndicator = value;
        if (this._horizontalIndicator) {
            this._horizontalIndicator.style.display = value ? '' : 'none';
        }
    }

    get showsVerticalScrollIndicator() { return this._showsVerticalScrollIndicator; }
    set showsVerticalScrollIndicator(value) {
        this._showsVerticalScrollIndicator = value;
        if (this._verticalIndicator) {
            this._verticalIndicator.style.display = value ? '' : 'none';
        }
    }

    get indicatorStyle() { return this._indicatorStyle; }
    set indicatorStyle(value) {
        this._indicatorStyle = value;
        this._updateIndicatorStyles();
    }

    get decelerationRate() { return this._decelerationRate; }
    set decelerationRate(value) { this._decelerationRate = value; }

    get minimumZoomScale() { return this._minimumZoomScale; }
    set minimumZoomScale(value) { this._minimumZoomScale = value; }

    get maximumZoomScale() { return this._maximumZoomScale; }
    set maximumZoomScale(value) { this._maximumZoomScale = value; }

    get zoomScale() { return this._zoomScale; }
    set zoomScale(value) {
        const scale = Math.max(this._minimumZoomScale, Math.min(this._maximumZoomScale, value));
        if (scale === this._zoomScale) return;
        this._zoomScale = scale;
        this._applyZoomScale();
        if (this._delegate && this._delegate.scrollViewDidZoom) {
            this._delegate.scrollViewDidZoom(this);
        }
    }

    get pagingEnabled() { return this._pagingEnabled; }
    set pagingEnabled(value) { 
        this._pagingEnabled = value; 
        if (value && this._pageSize.width === 0) {
            this._pageSize = { width: this._bounds.width, height: this._bounds.height };
        }
    }

    get pageSize() { return { ...this._pageSize }; }
    set pageSize(value) { this._pageSize = { ...value }; }

    get isDecelerating() { return this._isDecelerating; }

    get isDragging() { return this._isDragging; }

    get isZooming() { return this._isZooming; }

    get keyboardDismissMode() { return this._keyboardDismissMode; }
    set keyboardDismissMode(value) { this._keyboardDismissMode = value; }

    get scrollsToTop() { return this._scrollsToTop; }
    set scrollsToTop(value) { this._scrollsToTop = value; }

    get delaysContentTouches() { return this._delaysContentTouches; }
    set delaysContentTouches(value) { this._delaysContentTouches = value; }

    get canCancelTouchInSubviews() { return this._canCancelTouchInSubviews; }
    set canCancelTouchInSubviews(value) { this._canCancelTouchInSubviews = value; }

    get contentLength() {
        return {
            width: this._contentSize.width - this._bounds.width,
            height: this._contentSize.height - this._bounds.height
        };
    }

    get canScrollHorizontal() {
        return this._contentSize.width > this._bounds.width;
    }

    get canScrollVertical() {
        return this._contentSize.height > this._bounds.height;
    }

    _clampOffset(offset) {
        const maxX = Math.max(0, this._contentSize.width - this._bounds.width);
        const maxY = Math.max(0, this._contentSize.height - this._bounds.height);
        
        return {
            x: Math.max(0, Math.min(offset.x, maxX)),
            y: Math.max(0, Math.min(offset.y, maxY))
        };
    }

    _applyZoomScale() {
        if (this._contentElement) {
            this._contentElement.style.transform = `translate(${-this._contentOffset.x}px, ${-this._contentOffset.y}px) scale(${this._zoomScale})`;
        }
    }

    _syncContentElement() {
        if (this._contentElement) {
            this._contentElement.style.transform = `translate(${-this._contentOffset.x}px, ${-this._contentOffset.y}px) scale(${this._zoomScale})`;
        }
    }

    _updateContentElement() {
        if (!this._contentElement) return;
        this._contentElement.style.width = `${this._contentSize.width}px`;
        this._contentElement.style.height = `${this._contentSize.height}px`;
    }

    _updateAdjustedContentInset() {
        this._adjustedContentInset = { ...this._contentInset };
        if (this._delegate && this._delegate.scrollViewDidChangeAdjustedContentInset) {
            this._delegate.scrollViewDidChangeAdjustedContentInset(this);
        }
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('div');
            this._element.style.overflow = 'hidden';
            this._element.style.position = 'absolute';
            this._element.style.boxSizing = 'border-box';
            this._element.style.touchAction = 'none';
            this._element.style.width = `${this._bounds.width}px`;
            this._element.style.height = `${this._bounds.height}px`;
            this._element.style.cursor = 'grab';

            this._contentElement = document.createElement('div');
            this._contentElement.style.position = 'absolute';
            this._contentElement.style.transformOrigin = '0 0';
            this._element.appendChild(this._contentElement);

            this._createScrollIndicators();
            this._setupGestureRecognizers();
            this._setupDOMEventListeners();
            this._setupKeyboardObservers();
        }
        return this._element;
    }

    _createScrollIndicators() {
        const createIndicator = (isHorizontal) => {
            const indicator = document.createElement('div');
            indicator.style.cssText = `
                position: absolute;
                ${isHorizontal ? 'height: 4px; left: 0; right: 0; bottom: 2px;' : 'width: 4px; top: 0; bottom: 0; right: 2px;'}
                background: rgba(128, 128, 128, 0.5);
                border-radius: 2px;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s;
                z-index: 100;
            `;
            return indicator;
        };

        this._horizontalIndicator = createIndicator(true);
        this._verticalIndicator = createIndicator(false);
        this._element.appendChild(this._horizontalIndicator);
        this._element.appendChild(this._verticalIndicator);
    }

    _setupGestureRecognizers() {
        this._panGestureRecognizer = new UIPanGestureRecognizer();
        this._panGestureRecognizer._target = this;
        this._panGestureRecognizer._handlePanBegan = (location, translation) => this._handlePanBegan(location, translation);
        this._panGestureRecognizer._handlePanChanged = (translation, velocity) => this._handlePanChanged(translation, velocity);
        this._panGestureRecognizer._handlePanEnded = (translation, velocity) => this._handlePanEnded(translation, velocity);
        this._panGestureRecognizer._handlePanCancelled = () => this._handlePanCancelled();

        this._pinchGestureRecognizer = new UIPinchGestureRecognizer();
        this._pinchGestureRecognizer._target = this;
        this._pinchGestureRecognizer._handlePinchBegan = () => this._handlePinchBegan();
        this._pinchGestureRecognizer._handlePinchChanged = (scale, velocity) => this._handlePinchChanged(scale, velocity);
        this._pinchGestureRecognizer._handlePinchEnded = (scale, velocity) => this._handlePinchEnded(scale, velocity);
    }

    _setupDOMEventListeners() {
        if (typeof document === 'undefined') return;
        
        let isDragging = false;
        let startX = 0, startY = 0;
        let lastX = 0, lastY = 0;
        let startOffsetX = 0, startOffsetY = 0;
        let velocityX = 0, velocityY = 0;
        let lastTime = 0;

        const onMouseDown = (e) => {
            if (e.target !== this._element && !this._element.contains(e.target)) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            lastX = e.clientX;
            lastY = e.clientY;
            startOffsetX = this._contentOffset.x;
            startOffsetY = this._contentOffset.y;
            velocityX = 0;
            velocityY = 0;
            lastTime = Date.now();
            this._element.style.cursor = 'grabbing';
            
            this._handlePanBegan({ x: e.clientX, y: e.clientY }, { x: 0, y: 0 });
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            
            const now = Date.now();
            const dt = now - lastTime;
            
            if (dt > 0) {
                velocityX = (e.clientX - lastX) / dt * 16;
                velocityY = (e.clientY - lastY) / dt * 16;
            }
            
            lastX = e.clientX;
            lastY = e.clientY;
            lastTime = now;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            this._handlePanChanged({ x: deltaX, y: deltaY }, { x: velocityX, y: velocityY });
        };

        const onMouseUp = (e) => {
            if (!isDragging) return;
            isDragging = false;
            this._element.style.cursor = 'grab';
            
            this._handlePanEnded({ x: e.clientX - startX, y: e.clientY - startY }, { x: velocityX * 10, y: velocityY * 10 });
        };

        const onMouseLeave = (e) => {
            if (!isDragging) return;
            isDragging = false;
            this._element.style.cursor = 'grab';
            
            this._handlePanEnded({ x: e.clientX - startX, y: e.clientY - startY }, { x: velocityX * 10, y: velocityY * 10 });
        };

        this._element.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        this._element.addEventListener('mouseleave', onMouseLeave);
        
        this._mouseHandlers = { onMouseDown, onMouseMove, onMouseUp, onMouseLeave };

        let lastPinchScale = 1;
        let isPinching = false;

        const onWheel = (e) => {
            e.preventDefault();
            
            if (e.ctrlKey || e.metaKey) {
                const scaleChange = e.deltaY > 0 ? 0.9 : 1.1;
                const newScale = Math.max(this._minimumZoomScale, Math.min(this._maximumZoomScale, this._zoomScale * scaleChange));
                this.zoomScale = newScale;
            } else {
                const deltaX = e.deltaX || 0;
                const deltaY = e.deltaY || 0;
                
                this.contentOffset = {
                    x: this._contentOffset.x + deltaX,
                    y: this._contentOffset.y + deltaY
                };
            }
        };

        this._element.addEventListener('wheel', onWheel, { passive: false });
        this._wheelHandler = onWheel;
    }

    _handlePanBegan(location, translation) {
        this._stopDeceleration();
        this._isDragging = true;
        this._touchInfo.startOffset = { ...this._contentOffset };
        this._touchInfo.lastLocation = location;
        this._touchInfo.lastTime = Date.now();
        this._touchInfo.velocity = { x: 0, y: 0 };
        this._touchInfo.isTracking = true;

        if (this._delegate && this._delegate.scrollViewWillBeginDragging) {
            this._delegate.scrollViewWillBeginDragging(this);
        }
        if (this._delegate && this._delegate.scrollViewDidBeginDragging) {
            this._delegate.scrollViewDidBeginDragging(this);
        }

        this._showScrollIndicators();
    }

    _handlePanChanged(translation, velocity) {
        if (!this._touchInfo.isTracking) return;

        const now = Date.now();
        const dt = Math.max(1, now - this._touchInfo.lastTime);
        this._touchInfo.velocity = {
            x: (velocity.x - this._touchInfo.lastLocation.x) / dt * 16,
            y: (velocity.y - this._touchInfo.lastLocation.y) / dt * 16
        };
        this._touchInfo.lastLocation = velocity;
        this._touchInfo.lastTime = now;

        const maxX = Math.max(0, this._contentSize.width - this._bounds.width);
        const maxY = Math.max(0, this._contentSize.height - this._bounds.height);
        
        let newOffset = {
            x: this._touchInfo.startOffset.x - translation.x,
            y: this._touchInfo.startOffset.y - translation.y
        };

        newOffset.x = Math.max(0, Math.min(newOffset.x, maxX));
        newOffset.y = Math.max(0, Math.min(newOffset.y, maxY));

        this.contentOffset = newOffset;
        this._velocity = { ...this._touchInfo.velocity };
    }

    _handlePanEnded(translation, velocity) {
        this._isDragging = false;
        this._touchInfo.isTracking = false;

        const maxX = Math.max(0, this._contentSize.width - this._bounds.width);
        const maxY = Math.max(0, this._contentSize.height - this._bounds.height);
        
        let targetOffset = { ...this._contentOffset };
        let shouldDecelerate = false;
        
        if (this._pagingEnabled) {
            const pageWidth = this._pageSize.width > 0 ? this._pageSize.width : this._bounds.width;
            const pageHeight = this._pageSize.height > 0 ? this._pageSize.height : this._bounds.height;
            
            const currentPageX = Math.round(this._contentOffset.x / pageWidth);
            const currentPageY = Math.round(this._contentOffset.y / pageHeight);
            
            const dragPercentageX = translation.x / pageWidth;
            const dragPercentageY = translation.y / pageHeight;
            
            const isFlickX = Math.abs(velocity.x) > 0.5;
            const isFlickY = Math.abs(velocity.y) > 0.5;
            
            let targetPageX = currentPageX;
            let targetPageY = currentPageY;
            
            if (isFlickX) {
                targetPageX += velocity.x > 0 ? -1 : 1;
            } else {
                if (dragPercentageX < -0.3) targetPageX += 1;
                else if (dragPercentageX > 0.3) targetPageX -= 1;
            }
            
            if (isFlickY) {
                targetPageY += velocity.y > 0 ? -1 : 1;
            } else {
                if (dragPercentageY < -0.3) targetPageY += 1;
                else if (dragPercentageY > 0.3) targetPageY -= 1;
            }
            
            const maxPageX = Math.floor(this._contentSize.width / pageWidth);
            const maxPageY = Math.floor(this._contentSize.height / pageHeight);
            
            targetPageX = Math.max(0, Math.min(targetPageX, maxPageX));
            targetPageY = Math.max(0, Math.min(targetPageY, maxPageY));
            
            targetOffset.x = targetPageX * pageWidth;
            targetOffset.y = targetPageY * pageHeight;
            
            this._animateToOffset(targetOffset, 250);
        } else {
            shouldDecelerate = Math.abs(velocity.x) > 0.5 || Math.abs(velocity.y) > 0.5;
            
            if (shouldDecelerate) {
                this._velocity = { x: velocity.x * 0.1, y: velocity.y * 0.1 };
                this._startDeceleration();
            } else {
                targetOffset.x = Math.max(0, Math.min(targetOffset.x, maxX));
                targetOffset.y = Math.max(0, Math.min(targetOffset.y, maxY));
                this.contentOffset = targetOffset;
            }
        }

        if (this._delegate && this._delegate.scrollViewWillEndDragging) {
            this._delegate.scrollViewWillEndDragging(this, velocity, targetOffset);
        }

        if (this._delegate && this._delegate.scrollViewDidEndDragging) {
            this._delegate.scrollViewDidEndDragging(this, shouldDecelerate);
        }

        this._hideScrollIndicatorsAfterDelay();
    }

    _handlePanCancelled() {
        this._isDragging = false;
        this._touchInfo.isTracking = false;
        this._stopDeceleration();
    }

    _handlePinchBegan() {
        if (this._maximumZoomScale <= this._minimumZoomScale) return;
        this._isZooming = true;
        this._zoomBounce = false;
        if (this._delegate && this._delegate.scrollViewWillBeginZooming) {
            this._delegate.scrollViewWillBeginZooming(this);
        }
    }

    _handlePinchChanged(scale, velocity) {
        if (!this._isZooming) return;
        const newScale = this._zoomScale * scale;
        this.zoomScale = newScale;
    }

    _handlePinchEnded(scale, velocity) {
        if (!this._isZooming) return;
        this._isZooming = false;
        
        if (this._zoomScale < this._minimumZoomScale) {
            this._animateZoom(this._minimumZoomScale);
        } else if (this._zoomScale > this._maximumZoomScale) {
            this._animateZoom(this._maximumZoomScale);
        }

        if (this._delegate && this._delegate.scrollViewDidEndZooming) {
            this._delegate.scrollViewDidEndZooming(this, this._zoomScale);
        }
    }

    _animateZoom(targetScale) {
        const startScale = this._zoomScale;
        const startTime = Date.now();
        const duration = 250;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            this.zoomScale = startScale + (targetScale - startScale) * eased;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    _shouldBounceHorizontal() {
        return this._alwaysBounceHorizontal || this._contentSize.width > this._bounds.width;
    }

    _shouldBounceVertical() {
        return this._alwaysBounceVertical || this._contentSize.height > this._bounds.height;
    }

    _animateBounceBack(fromOffset, toOffset) {
        const startX = fromOffset.x;
        const startY = fromOffset.y;
        const deltaX = toOffset.x - startX;
        const deltaY = toOffset.y - startY;
        const startTime = Date.now();
        const duration = 300;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            
            this.contentOffset = {
                x: startX + deltaX * eased,
                y: startY + deltaY * eased
            };
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    _startDeceleration() {
        if (this._isDecelerating) return;
        this._isDecelerating = true;

        if (this._delegate && this._delegate.scrollViewWillBeginDecelerating) {
            this._delegate.scrollViewWillBeginDecelerating(this);
        }

        const maxX = Math.max(0, this._contentSize.width - this._bounds.width);
        const maxY = Math.max(0, this._contentSize.height - this._bounds.height);

        const step = () => {
            if (!this._isDecelerating) return;

            this._velocity.x *= this._decelerationRate;
            this._velocity.y *= this._decelerationRate;

            let newX = this._contentOffset.x - this._velocity.x;
            let newY = this._contentOffset.y - this._velocity.y;

            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));

            this.contentOffset = { x: newX, y: newY };

            if (Math.abs(this._velocity.x) < 0.1 && Math.abs(this._velocity.y) < 0.1) {
                this._stopDeceleration();
            } else {
                this._decelerationTimer = requestAnimationFrame(step);
            }
        };

        this._decelerationTimer = requestAnimationFrame(step);
    }

    _stopDeceleration() {
        this._isDecelerating = false;
        if (this._decelerationTimer) {
            cancelAnimationFrame(this._decelerationTimer);
            this._decelerationTimer = null;
        }
        if (this._delegate && this._delegate.scrollViewDidEndDecelerating) {
            this._delegate.scrollViewDidEndDecelerating(this);
        }
    }

    _showScrollIndicators() {
        this._indicator_opacity = 1;
        if (this._horizontalIndicator) this._horizontalIndicator.style.opacity = '1';
        if (this._verticalIndicator) this._verticalIndicator.style.opacity = '1';
    }

    _hideScrollIndicatorsAfterDelay() {
        setTimeout(() => {
            if (!this._isDragging && !this._isDecelerating) {
                this._indicator_opacity = 0;
                if (this._horizontalIndicator) this._horizontalIndicator.style.opacity = '0';
                if (this._verticalIndicator) this._verticalIndicator.style.opacity = '0';
            }
        }, 300);
    }

    _updateScrollIndicators() {
        if (!this._horizontalIndicator || !this._verticalIndicator) return;

        const maxX = Math.max(0, this._contentSize.width - this._bounds.width);
        const maxY = Math.max(0, this._contentSize.height - this._bounds.height);

        if (maxX > 0) {
            const indicatorWidth = Math.max(30, (this._bounds.width / this._contentSize.width) * this._bounds.width);
            const indicatorX = (this._contentOffset.x / maxX) * (this._bounds.width - indicatorWidth - 4);
            this._horizontalIndicator.style.width = `${indicatorWidth}px`;
            this._horizontalIndicator.style.left = `${indicatorX}px`;
            this._horizontalIndicator.style.opacity = this._indicator_opacity.toString();
        } else {
            this._horizontalIndicator.style.opacity = '0';
        }

        if (maxY > 0) {
            const indicatorHeight = Math.max(30, (this._bounds.height / this._contentSize.height) * this._bounds.height);
            const indicatorY = (this._contentOffset.y / maxY) * (this._bounds.height - indicatorHeight - 4);
            this._verticalIndicator.style.height = `${indicatorHeight}px`;
            this._verticalIndicator.style.top = `${indicatorY}px`;
            this._verticalIndicator.style.opacity = this._indicator_opacity.toString();
        } else {
            this._verticalIndicator.style.opacity = '0';
        }
    }

    _updateIndicatorStyles() {
        const style = this._indicatorStyle === 'black' ? 'rgba(0,0,0,0.4)' : 
                      this._indicatorStyle === 'white' ? 'rgba(255,255,255,0.5)' : 
                      'rgba(128,128,128,0.5)';
        if (this._horizontalIndicator) this._horizontalIndicator.style.background = style;
        if (this._verticalIndicator) this._verticalIndicator.style.background = style;
    }

    _setupKeyboardObservers() {
        if (typeof document === 'undefined') return;
        
        this._keyboardWillShow = (e) => {
            if (this._keyboardDismissMode === 'interactive' || this._keyboardDismissMode === 'onDrag') {
                this._handleKeyboardShow(e);
            }
        };
        
        this._keyboardWillHide = (e) => {
            this._handleKeyboardHide(e);
        };
    }

    _handleKeyboardShow(e) {
        if (!this._keyboardAvoidingEnabled) return;
        this._keyboardHeight = e.keyboardHeight || 300;
        this.contentInset = {
            ...this._contentInset,
            bottom: this._keyboardHeight
        };
    }

    _handleKeyboardHide(e) {
        if (!this._keyboardAvoidingEnabled) return;
        this._keyboardHeight = 0;
        this.contentInset = {
            ...this._contentInset,
            bottom: 0
        };
    }

    addSubview(view) {
        if (view._element && this._contentElement) {
            this._contentElement.appendChild(view._element);
        }
        super.addSubview(view);
        if (this._contentSize.width === 0 || this._contentSize.height === 0) {
            this._updateContentSizeFromSubviews();
        }
    }

    _updateContentSizeFromSubviews() {
        if (this._subviews.length === 0) return;
        let maxX = 0, maxY = 0;
        for (const view of this._subviews) {
            maxX = Math.max(maxX, view._frame.x + view._frame.width);
            maxY = Math.max(maxY, view._frame.y + view._frame.height);
        }
        this.contentSize = { width: maxX, height: maxY };
    }

    scrollRectToVisible(rect, animated = true) {
        const targetOffset = { ...this._contentOffset };
        
        if (rect.x < this._contentOffset.x) {
            targetOffset.x = rect.x;
        } else if (rect.x + rect.width > this._contentOffset.x + this._bounds.width) {
            targetOffset.x = rect.x + rect.width - this._bounds.width;
        }
        
        if (rect.y < this._contentOffset.y) {
            targetOffset.y = rect.y;
        } else if (rect.y + rect.height > this._contentOffset.y + this._bounds.height) {
            targetOffset.y = rect.y + rect.height - this._bounds.height;
        }

        if (animated) {
            this._animateToOffset(targetOffset);
        } else {
            this.contentOffset = targetOffset;
        }
    }

    _animateToOffset(targetOffset, duration = 300) {
        const startOffset = { ...this._contentOffset };
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            
            this.contentOffset = {
                x: startOffset.x + (targetOffset.x - startOffset.x) * eased,
                y: startOffset.y + (targetOffset.y - startOffset.y) * eased
            };
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    setContentOffsetAnimated(offset, duration = 0.25) {
        this._animateToOffset(offset, duration * 1000);
    }

    scrollToTop(animated = true) {
        this.scrollRectToVisible({ x: 0, y: 0, width: 1, height: 1 }, animated);
    }

    scrollToBottom(animated = true) {
        const maxY = Math.max(0, this._contentSize.height - this._bounds.height);
        this.scrollRectToVisible({ x: 0, y: maxY, width: 1, height: 1 }, animated);
    }

    flashScrollIndicators() {
        this._showScrollIndicators();
        this._hideScrollIndicatorsAfterDelay();
    }

    zoomToRect(rect, animated = true) {
        if (this._maximumZoomScale <= this._minimumZoomScale) return;
        
        const targetScale = Math.max(this._minimumZoomScale, Math.min(
            this._maximumZoomScale,
            Math.min(this._bounds.width / rect.width, this._bounds.height / rect.height)
        ));
        
        const targetOffset = {
            x: rect.x - (this._bounds.width - rect.width * targetScale) / 2,
            y: rect.y - (this._bounds.height - rect.height * targetScale) / 2
        };

        if (animated) {
            this._animateZoom(targetScale);
            this._animateToOffset(targetOffset);
        } else {
            this.zoomScale = targetScale;
            this.contentOffset = targetOffset;
        }
    }

    addGestureRecognizer(gesture) {
        super.addGestureRecognizer(gesture);
        if (gesture instanceof UIPanGestureRecognizer) {
            this._panGestureRecognizer = gesture;
        } else if (gesture instanceof UIPinchGestureRecognizer) {
            this._pinchGestureRecognizer = gesture;
        }
    }

    touchesBegan(touches, event) {
        this._isTracking = true;
        return super.touchesBegan(touches, event);
    }

    touchesEnded(touches, event) {
        this._isTracking = false;
        return super.touchesEnded(touches, event);
    }

    touchesCancelled(touches, event) {
        this._isTracking = false;
        return super.touchesCancelled(touches, event);
    }

    removeFromSuperview() {
        this._stopDeceleration();
        super.removeFromSuperview();
    }
}

export { UIScrollView, UIScrollViewDelegate };
export default UIScrollView;