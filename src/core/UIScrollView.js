import UIView from './UIView.js';

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

        this._bounces = true;
        this._bouncesZoom = true;
        this._alwaysBounceHorizontal = true;
        this._alwaysBounceVertical = true;

        this._decelerationRate = 0.975;
        this._isDecelerating = false;
        this._decelerationTimer = null;

        this._minimumZoomScale = 1.0;
        this._maximumZoomScale = 1.0;
        this._zoomScale = 1.0;
        this._isZooming = false;

        this._pagingEnabled = false;
        this._pageSize = { width: 0, height: 0 };

        this._keyboardDismissMode = 'none';

        this._delegate = null;

        this._isDragging = false;
        this._isTracking = false;

        this._bounceAnimation = null;
        this._scrollAnimation = null;

        this._horizontalIndicator = null;
        this._verticalIndicator = null;
        this._indicatorTimer = null;

        this._dragStartOffset = { x: 0, y: 0 };
        this._dragStartLocation = { x: 0, y: 0 };
        this._dragVelocity = { x: 0, y: 0 };
        this._velocitySamples = [];
        this._lastDragLocation = { x: 0, y: 0 };
        this._lastDragTime = 0;

        this._scrollsToTop = true;
        this._delaysContentTouches = true;
        this._canCancelTouchInSubviews = true;

        this._useGPUAcceleration = true;

        this._isAnimating = false;
    }

    get contentSize() { return { ...this._contentSize }; }
    set contentSize(value) {
        this._contentSize = { ...value };
        this._updateContentElement();
        this._updateScrollIndicators();
        this._applyTransform();
    }

    get contentOffset() { return { ...this._contentOffset }; }
    set contentOffset(value) {
        if (this._isAnimating) return;
        const clamped = this._clampOffset({ ...value });
        this._contentOffset = clamped;
        this._applyTransform();
        this._updateScrollIndicators();

        if (this._delegate && this._delegate.scrollViewDidScroll) {
            this._delegate.scrollViewDidScroll(this);
        }
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

    get bounces() { return this._bounces; }
    set bounces(value) { this._bounces = value; }

    get alwaysBounceHorizontal() { return this._alwaysBounceHorizontal; }
    set alwaysBounceHorizontal(value) { this._alwaysBounceHorizontal = value; }

    get alwaysBounceVertical() { return this._alwaysBounceVertical; }
    set alwaysBounceVertical(value) { this._alwaysBounceVertical = value; }

    get decelerationRate() { return this._decelerationRate; }
    set decelerationRate(value) { this._decelerationRate = value; }

    get minimumZoomScale() { return this._minimumZoomScale; }
    set minimumZoomScale(value) { this._minimumZoomScale = value; }

    get maximumZoomScale() { return this._maximumZoomScale; }
    set maximumZoomScale(value) { this._maximumZoomScale = value; }

    get zoomScale() { return this._zoomScale; }
    set zoomScale(value) {
        const scale = Math.max(this._minimumZoomScale, Math.min(this._maximumZoomScale, value));
        if (Math.abs(scale - this._zoomScale) < 0.001) return;
        this._zoomScale = scale;

        const clamped = this._clampOffset(this._contentOffset);
        this._contentOffset = clamped;

        this._applyTransform();

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

    _canScrollHorizontal() {
        return this._getMaxOffset().x > 0;
    }

    _canScrollVertical() {
        return this._getMaxOffset().y > 0;
    }

    _getMaxOffset() {
        const maxX = Math.max(0, this._contentSize.width * this._zoomScale - this._bounds.width);
        const maxY = Math.max(0, this._contentSize.height * this._zoomScale - this._bounds.height);
        return { x: maxX, y: maxY };
    }

    _clampOffset(offset) {
        const max = this._getMaxOffset();
        return {
            x: Math.max(0, Math.min(offset.x, max.x)),
            y: Math.max(0, Math.min(offset.y, max.y))
        };
    }

    _rubberBand(overscroll, maxDistance = 200) {
        const resistance = 0.55;
        const sign = overscroll > 0 ? 1 : -1;
        const absOverscroll = Math.abs(overscroll);
        const result = maxDistance * (1 - 1 / ((absOverscroll * resistance / maxDistance) + 1));
        return sign * result;
    }

    _applyRubberBanding(offset) {
        const max = this._getMaxOffset();
        let result = { x: offset.x, y: offset.y };

        const canBounceX = this._bounces && (this._alwaysBounceHorizontal || max.x > 0);
        if (canBounceX) {
            if (offset.x < 0) {
                result.x = -this._rubberBand(-offset.x);
            } else if (offset.x > max.x) {
                result.x = max.x + this._rubberBand(offset.x - max.x);
            }
        } else {
            result.x = Math.max(0, Math.min(offset.x, max.x));
        }

        const canBounceY = this._bounces && (this._alwaysBounceVertical || max.y > 0);
        if (canBounceY) {
            if (offset.y < 0) {
                result.y = -this._rubberBand(-offset.y);
            } else if (offset.y > max.y) {
                result.y = max.y + this._rubberBand(offset.y - max.y);
            }
        } else {
            result.y = Math.max(0, Math.min(offset.y, max.y));
        }

        return result;
    }

    _applyTransform() {
        if (!this._contentElement) return;

        const s = this._zoomScale;
        const tx = -this._contentOffset.x;
        const ty = -this._contentOffset.y;

        if (this._useGPUAcceleration) {
            this._contentElement.style.transform = `matrix3d(${s},0,0,0, 0,${s},0,0, 0,0,1,0, ${tx},${ty}, 0, 1)`;
        } else {
            this._contentElement.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${s})`;
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

    _stopAllAnimations() {
        if (this._bounceAnimation) {
            cancelAnimationFrame(this._bounceAnimation);
            this._bounceAnimation = null;
        }
        if (this._scrollAnimation) {
            cancelAnimationFrame(this._scrollAnimation);
            this._scrollAnimation = null;
        }
        if (this._decelerationTimer) {
            cancelAnimationFrame(this._decelerationTimer);
            this._decelerationTimer = null;
        }
        this._isAnimating = false;
    }

    _easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    _animateToOffset(targetOffset, duration = 300, onComplete = null) {
        this._stopAllAnimations();

        const startOffset = { ...this._contentOffset };
        const startTime = performance.now();
        this._isAnimating = true;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(1, elapsed / duration);
            const eased = this._easeOutCubic(progress);

            this._contentOffset = {
                x: startOffset.x + (targetOffset.x - startOffset.x) * eased,
                y: startOffset.y + (targetOffset.y - startOffset.y) * eased
            };
            this._applyTransform();
            this._updateScrollIndicators();

            if (this._delegate && this._delegate.scrollViewDidScroll) {
                this._delegate.scrollViewDidScroll(this);
            }

            if (progress < 1) {
                this._scrollAnimation = requestAnimationFrame(animate);
            } else {
                this._scrollAnimation = null;
                this._isAnimating = false;
                if (onComplete) {
                    onComplete();
                } else if (this._delegate && this._delegate.scrollViewDidEndScrollingAnimation) {
                    this._delegate.scrollViewDidEndScrollingAnimation(this);
                }
            }
        };

        this._scrollAnimation = requestAnimationFrame(animate);
    }

    _animateBounceBack(fromDeceleration = false) {
        const target = this._clampOffset(this._contentOffset);
        const start = { ...this._contentOffset };

        const dx = Math.abs(target.x - start.x);
        const dy = Math.abs(target.y - start.y);

        if (dx < 0.5 && dy < 0.5) {
            this._contentOffset = { ...target };
            this._applyTransform();
            this._updateScrollIndicators();
            this._isDecelerating = false;
            this._completeDrag(fromDeceleration);
            return;
        }

        const duration = Math.min(350, Math.max(100, Math.max(dx, dy) * 0.6));

        this._animateToOffset(target, duration, () => {
            this._isDecelerating = false;
            this._completeDrag(fromDeceleration);
        });
    }

    _completeDrag(fromDeceleration) {
        if (this._delegate) {
            if (fromDeceleration && this._delegate.scrollViewDidEndDecelerating) {
                this._delegate.scrollViewDidEndDecelerating(this);
            } else if (this._delegate && this._delegate.scrollViewDidEndDragging) {
                this._delegate.scrollViewDidEndDragging(this, false);
            }
        }
        this._bounceAnimation = null;
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
            this._element.style.willChange = 'transform';

            this._scrollContainer = document.createElement('div');
            this._scrollContainer.style.position = 'relative';
            this._scrollContainer.style.width = '100%';
            this._scrollContainer.style.height = '100%';
            this._scrollContainer.style.overflow = 'visible';

            this._contentElement = document.createElement('div');
            this._contentElement.style.position = 'absolute';
            this._contentElement.style.transformOrigin = '0 0';
            this._contentElement.style.willChange = 'transform';

            this._scrollContainer.appendChild(this._contentElement);
            this._element.appendChild(this._scrollContainer);

            this._createScrollIndicators();
            this._setupEventListeners();
        }
        return this._element;
    }

    _createScrollIndicators() {
        const createIndicator = (isHorizontal) => {
            const indicator = document.createElement('div');
            const style = {
                position: 'absolute',
                borderRadius: '3px',
                pointerEvents: 'none',
                opacity: '0',
                transition: 'opacity 0.2s ease-out',
                zIndex: '100',
                backgroundColor: 'rgba(128, 128, 128, 0.6)',
                willChange: 'opacity'
            };

            if (isHorizontal) {
                style.height = '3px';
                style.bottom = '2px';
                style.left = '0';
                style.right = '0';
            } else {
                style.width = '3px';
                style.right = '2px';
                style.top = '0';
                style.bottom = '0';
            }

            Object.assign(indicator.style, style);
            return indicator;
        };

        this._horizontalIndicator = createIndicator(true);
        this._verticalIndicator = createIndicator(false);
        this._element.appendChild(this._horizontalIndicator);
        this._element.appendChild(this._verticalIndicator);
    }

    _addVelocitySample(x, y, time) {
        this._velocitySamples.unshift({ x, y, time });
        if (this._velocitySamples.length > 5) {
            this._velocitySamples.pop();
        }

        let totalWeight = 0;
        let weightedX = 0;
        let weightedY = 0;

        for (let i = 0; i < this._velocitySamples.length; i++) {
            const sample = this._velocitySamples[i];
            const weight = Math.pow(0.7, i);
            weightedX += sample.x * weight;
            weightedY += sample.y * weight;
            totalWeight += weight;
        }

        if (totalWeight > 0) {
            this._dragVelocity = {
                x: weightedX / totalWeight,
                y: weightedY / totalWeight
            };
        }
    }

    _setupEventListeners() {
        if (typeof document === 'undefined') return;

        let isDragging = false;
        let startX = 0, startY = 0;
        let startOffsetX = 0, startOffsetY = 0;
        let dragAxis = null;

        const onMouseDown = (e) => {
            if (e.target !== this._element && !this._element.contains(e.target)) return;

            this._stopAllAnimations();

            e.preventDefault();
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startOffsetX = this._contentOffset.x;
            startOffsetY = this._contentOffset.y;
            dragAxis = null;

            this._velocitySamples = [];
            this._lastDragLocation = { x: e.clientX, y: e.clientY };
            this._lastDragTime = Date.now();

            this._element.style.cursor = 'grabbing';
            this._isDragging = true;
            this._dragStartOffset = { x: startOffsetX, y: startOffsetY };
            this._dragStartLocation = { x: startX, y: startY };

            if (this._delegate && this._delegate.scrollViewWillBeginDragging) {
                this._delegate.scrollViewWillBeginDragging(this);
            }
            if (this._delegate && this._delegate.scrollViewDidBeginDragging) {
                this._delegate.scrollViewDidBeginDragging(this);
            }

            this._showScrollIndicators();
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;

            e.preventDefault();

            const now = Date.now();
            const dt = Math.max(1, now - this._lastDragTime);

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            if (dragAxis === null) {
                const absDeltaX = Math.abs(deltaX);
                const absDeltaY = Math.abs(deltaY);
                const threshold = 5;

                if (absDeltaX > threshold || absDeltaY > threshold) {
                    const canH = this._canScrollHorizontal();
                    const canV = this._canScrollVertical();

                    if (canH && !canV) {
                        dragAxis = 'horizontal';
                    } else if (canV && !canH) {
                        dragAxis = 'vertical';
                    } else {
                        dragAxis = 'both';
                    }
                } else {
                    return;
                }
            }

            let moveX = (dragAxis === 'horizontal' || dragAxis === 'both') ? deltaX : 0;
            let moveY = (dragAxis === 'vertical' || dragAxis === 'both') ? deltaY : 0;

            const vx = (dragAxis === 'horizontal' || dragAxis === 'both') ? (e.clientX - this._lastDragLocation.x) / dt * 1000 : 0;
            const vy = (dragAxis === 'vertical' || dragAxis === 'both') ? (e.clientY - this._lastDragLocation.y) / dt * 1000 : 0;

            this._addVelocitySample(vx, vy, now);

            this._lastDragLocation = { x: e.clientX, y: e.clientY };
            this._lastDragTime = now;

            let newOffset = {
                x: startOffsetX - moveX,
                y: startOffsetY - moveY
            };

            if (this._pagingEnabled) {
                newOffset = this._applyRubberBanding(newOffset);
            } else {
                newOffset = this._applyRubberBanding(newOffset);
            }

            this._contentOffset = newOffset;
            this._applyTransform();
            this._updateScrollIndicators();

            if (this._delegate && this._delegate.scrollViewDidScroll) {
                this._delegate.scrollViewDidScroll(this);
            }
        };

        const onMouseUp = (e) => {
            if (!isDragging) return;

            e.preventDefault();
            isDragging = false;
            this._element.style.cursor = 'grab';
            this._isDragging = false;

            if (dragAxis === null) {
                this._hideScrollIndicatorsAfterDelay();
                return;
            }

            const velocity = { ...this._dragVelocity };

            if (this._pagingEnabled) {
                this._handlePaging(velocity);
                this._hideScrollIndicatorsAfterDelay();
                return;
            }

            const max = this._getMaxOffset();
            const isOutOfBounds = this._contentOffset.x < 0 || this._contentOffset.x > max.x ||
                                 this._contentOffset.y < 0 || this._contentOffset.y > max.y;

            if (this._bounces && isOutOfBounds) {
                this._animateBounceBack();
                if (this._delegate && this._delegate.scrollViewWillEndDragging) {
                    this._delegate.scrollViewWillEndDragging(this, velocity, this._contentOffset);
                }
                return;
            }

            this._handleInertialScrolling(velocity);
            this._hideScrollIndicatorsAfterDelay();
        };

        const onWheel = (e) => {
            e.preventDefault();

            if (e.ctrlKey || e.metaKey) {
                const scaleChange = e.deltaY > 0 ? 0.95 : 1.05;
                const newScale = Math.max(this._minimumZoomScale, Math.min(this._maximumZoomScale, this._zoomScale * scaleChange));
                if (Math.abs(newScale - this._zoomScale) > 0.001) {
                    if (!this._isZooming) {
                        this._isZooming = true;
                        if (this._delegate && this._delegate.scrollViewWillBeginZooming) {
                            this._delegate.scrollViewWillBeginZooming(this);
                        }
                    }
                    this.zoomScale = newScale;
                    clearTimeout(this._zoomEndTimer);
                    this._zoomEndTimer = setTimeout(() => {
                        this._isZooming = false;
                        if (this._delegate && this._delegate.scrollViewDidEndZooming) {
                            this._delegate.scrollViewDidEndZooming(this, this._zoomScale);
                        }
                    }, 200);
                }
                return;
            }

            this._stopAllAnimations();

            const deltaX = e.deltaX * (e.shiftKey && e.deltaY !== 0 ? e.deltaY : 1);
            const deltaY = e.deltaY;

            let newOffset = {
                x: this._canScrollHorizontal() ? this._contentOffset.x + deltaX : this._contentOffset.x,
                y: this._canScrollVertical() ? this._contentOffset.y + deltaY : this._contentOffset.y
            };

            const max = this._getMaxOffset();
            const wasInBounds = this._contentOffset.x >= 0 && this._contentOffset.x <= max.x &&
                                this._contentOffset.y >= 0 && this._contentOffset.y <= max.y;

            newOffset = this._clampOffset(newOffset);
            this._contentOffset = newOffset;
            this._applyTransform();
            this._updateScrollIndicators();

            if (this._delegate && this._delegate.scrollViewDidScroll) {
                this._delegate.scrollViewDidScroll(this);
            }

            this._showScrollIndicators();
            this._hideScrollIndicatorsAfterDelay();
        };

        const onTouchStart = (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                onMouseDown({
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    preventDefault: () => e.preventDefault(),
                    target: e.target
                });
            }
        };

        const onTouchMove = (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                onMouseMove({
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    preventDefault: () => e.preventDefault()
                });
            }
        };

        const onTouchEnd = (e) => {
            onMouseUp(e);
        };

        this._element.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        this._element.addEventListener('touchstart', onTouchStart, { passive: false });
        this._element.addEventListener('touchmove', onTouchMove, { passive: false });
        this._element.addEventListener('touchend', onTouchEnd);
        this._element.addEventListener('wheel', onWheel, { passive: false });

        this._eventHandlers = { onMouseDown, onMouseMove, onMouseUp, onTouchStart, onTouchMove, onTouchEnd, onWheel };
    }

    _handlePaging(velocity) {
        const pageWidth = this._pageSize.width > 0 ? this._pageSize.width : this._bounds.width;
        const pageHeight = this._pageSize.height > 0 ? this._pageSize.height : this._bounds.height;

        const clampedOffset = this._clampOffset(this._contentOffset);
        const currentPageX = Math.round(clampedOffset.x / pageWidth);
        const currentPageY = Math.round(clampedOffset.y / pageHeight);

        const maxPageX = Math.max(0, Math.ceil(this._contentSize.width / pageWidth) - 1);
        const maxPageY = Math.max(0, Math.ceil(this._contentSize.height / pageHeight) - 1);

        let targetPageX = currentPageX;
        let targetPageY = currentPageY;

        const isFlickX = Math.abs(velocity.x) > 300;
        const isFlickY = Math.abs(velocity.y) > 300;

        if (isFlickX) {
            targetPageX += velocity.x > 0 ? -1 : 1;
        }

        if (isFlickY) {
            targetPageY += velocity.y > 0 ? -1 : 1;
        }

        targetPageX = Math.max(0, Math.min(targetPageX, maxPageX));
        targetPageY = Math.max(0, Math.min(targetPageY, maxPageY));

        const targetOffset = {
            x: targetPageX * pageWidth,
            y: targetPageY * pageHeight
        };

        this._animateToOffset(targetOffset, 300, () => {
            if (this._delegate && this._delegate.scrollViewDidEndScrollingAnimation) {
                this._delegate.scrollViewDidEndScrollingAnimation(this);
            }
        });

        if (this._delegate && this._delegate.scrollViewWillEndDragging) {
            this._delegate.scrollViewWillEndDragging(this, velocity, targetOffset);
        }
        if (this._delegate && this._delegate.scrollViewDidEndDragging) {
            this._delegate.scrollViewDidEndDragging(this, false);
        }
    }

    _handleInertialScrolling(velocity) {
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        const shouldDecelerate = speed > 50;

        if (shouldDecelerate) {
            this._startDeceleration(velocity.x, velocity.y);
        }

        if (this._delegate && this._delegate.scrollViewWillEndDragging) {
            this._delegate.scrollViewWillEndDragging(this, velocity, this._contentOffset);
        }
        if (this._delegate && this._delegate.scrollViewDidEndDragging) {
            this._delegate.scrollViewDidEndDragging(this, shouldDecelerate);
        }
    }

    _startDeceleration(velocityX, velocityY) {
        if (this._isDecelerating) return;

        this._isDecelerating = true;
        let velX = velocityX;
        let velY = velocityY;

        if (this._delegate && this._delegate.scrollViewWillBeginDecelerating) {
            this._delegate.scrollViewWillBeginDecelerating(this);
        }

        const startTime = performance.now();
        const startOffset = { ...this._contentOffset };

        const decelerate = (currentTime) => {
            if (!this._isDecelerating) return;

            const elapsed = (currentTime - startTime) / 1000;

            const decayFactor = Math.pow(this._decelerationRate, elapsed * 60);
            const currentVelX = velX * decayFactor;
            const currentVelY = velY * decayFactor;

            const logRate = Math.log(this._decelerationRate) * 60;
            let newX = startOffset.x + (velX * (1 - decayFactor) / logRate);
            let newY = startOffset.y + (velY * (1 - decayFactor) / logRate);

            const max = this._getMaxOffset();
            let shouldStop = false;

            if (newX < 0) {
                if (this._bounces) {
                    newX = -this._rubberBand(-newX);
                    if (Math.abs(currentVelX) < 50) shouldStop = true;
                } else {
                    newX = 0;
                    shouldStop = true;
                }
            } else if (newX > max.x) {
                if (this._bounces) {
                    newX = max.x + this._rubberBand(newX - max.x);
                    if (Math.abs(currentVelX) < 50) shouldStop = true;
                } else {
                    newX = max.x;
                    shouldStop = true;
                }
            }

            if (newY < 0) {
                if (this._bounces) {
                    newY = -this._rubberBand(-newY);
                    if (Math.abs(currentVelY) < 50) shouldStop = true;
                } else {
                    newY = 0;
                    shouldStop = true;
                }
            } else if (newY > max.y) {
                if (this._bounces) {
                    newY = max.y + this._rubberBand(newY - max.y);
                    if (Math.abs(currentVelY) < 50) shouldStop = true;
                } else {
                    newY = max.y;
                    shouldStop = true;
                }
            }

            this._contentOffset = { x: newX, y: newY };
            this._applyTransform();
            this._updateScrollIndicators();

            if (this._delegate && this._delegate.scrollViewDidScroll) {
                this._delegate.scrollViewDidScroll(this);
            }

            const currentSpeed = Math.sqrt(currentVelX * currentVelX + currentVelY * currentVelY);

            if (currentSpeed < 50 || shouldStop || elapsed > 0.6) {
                this._isDecelerating = false;
                if (this._decelerationTimer) {
                    cancelAnimationFrame(this._decelerationTimer);
                    this._decelerationTimer = null;
                }

                const isOutOfBounds = this._contentOffset.x < 0 || this._contentOffset.x > max.x ||
                                     this._contentOffset.y < 0 || this._contentOffset.y > max.y;
                if (this._bounces && isOutOfBounds) {
                    this._animateBounceBack(true);
                } else {
                    this._contentOffset = this._clampOffset(this._contentOffset);
                    this._applyTransform();
                    if (this._delegate && this._delegate.scrollViewDidEndDecelerating) {
                        this._delegate.scrollViewDidEndDecelerating(this);
                    }
                }
            } else {
                this._decelerationTimer = requestAnimationFrame(decelerate);
            }
        };

        if (this._decelerationTimer) {
            cancelAnimationFrame(this._decelerationTimer);
        }

        this._decelerationTimer = requestAnimationFrame(decelerate);
    }

    _stopDeceleration() {
        if (this._decelerationTimer) {
            cancelAnimationFrame(this._decelerationTimer);
            this._decelerationTimer = null;
        }

        if (this._isDecelerating) {
            this._isDecelerating = false;
        }
    }

    _showScrollIndicators() {
        if (this._indicatorTimer) clearTimeout(this._indicatorTimer);

        if (this._horizontalIndicator && this._showsHorizontalScrollIndicator && this._getMaxOffset().x > 0) {
            this._horizontalIndicator.style.opacity = '0.8';
        }
        if (this._verticalIndicator && this._showsVerticalScrollIndicator && this._getMaxOffset().y > 0) {
            this._verticalIndicator.style.opacity = '0.8';
        }
    }

    _hideScrollIndicatorsAfterDelay() {
        if (this._indicatorTimer) clearTimeout(this._indicatorTimer);

        this._indicatorTimer = setTimeout(() => {
            if (!this._isDragging && !this._isDecelerating && !this._scrollAnimation) {
                if (this._horizontalIndicator) this._horizontalIndicator.style.opacity = '0';
                if (this._verticalIndicator) this._verticalIndicator.style.opacity = '0';
            }
        }, 1000);
    }

    _updateScrollIndicators() {
        if (!this._horizontalIndicator || !this._verticalIndicator) return;

        const max = this._getMaxOffset();
        const zoomedWidth = this._contentSize.width * this._zoomScale;
        const zoomedHeight = this._contentSize.height * this._zoomScale;

        if (max.x > 0 && this._showsHorizontalScrollIndicator) {
            const viewportRatio = this._bounds.width / zoomedWidth;
            const indicatorWidth = Math.max(30, viewportRatio * this._bounds.width);
            const maxIndicatorX = this._bounds.width - indicatorWidth - 4;
            let indicatorX = (this._contentOffset.x / max.x) * maxIndicatorX;
            indicatorX = Math.max(2, Math.min(maxIndicatorX, indicatorX));

            this._horizontalIndicator.style.width = `${indicatorWidth}px`;
            this._horizontalIndicator.style.transform = `translateX(${indicatorX}px)`;
        }

        if (max.y > 0 && this._showsVerticalScrollIndicator) {
            const viewportRatio = this._bounds.height / zoomedHeight;
            const indicatorHeight = Math.max(30, viewportRatio * this._bounds.height);
            const maxIndicatorY = this._bounds.height - indicatorHeight - 4;
            let indicatorY = (this._contentOffset.y / max.y) * maxIndicatorY;
            indicatorY = Math.max(2, Math.min(maxIndicatorY, indicatorY));

            this._verticalIndicator.style.height = `${indicatorHeight}px`;
            this._verticalIndicator.style.transform = `translateY(${indicatorY}px)`;
        }
    }

    _updateIndicatorStyles() {
        const style = this._indicatorStyle === 'black' ? 'rgba(0,0,0,0.6)' :
                      this._indicatorStyle === 'white' ? 'rgba(255,255,255,0.6)' :
                      'rgba(128,128,128,0.6)';
        if (this._horizontalIndicator) this._horizontalIndicator.style.backgroundColor = style;
        if (this._verticalIndicator) this._verticalIndicator.style.backgroundColor = style;
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
            const frame = view.frame;
            maxX = Math.max(maxX, frame.x + frame.width);
            maxY = Math.max(maxY, frame.y + frame.height);
        }
        this.contentSize = { width: maxX, height: maxY };
    }

    sizeToFit() {
        if (!this._contentElement) return;

        this._contentElement.style.width = `${this._bounds.width}px`;

        const children = this._contentElement.children;
        let maxX = 0;
        let maxY = 0;

        for (const child of children) {
            const rect = child.getBoundingClientRect();
            const x = child.offsetLeft + rect.width;
            const y = child.offsetTop + rect.height;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        }

        if (maxX <= this._bounds.width) maxX = this._bounds.width;

        this.contentSize = { width: maxX, height: maxY };
    }

    scrollRectToVisible(rect, animated = true) {
        let targetOffset = { ...this._contentOffset };

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

        targetOffset = this._clampOffset(targetOffset);

        if (animated) {
            this._animateToOffset(targetOffset);
        } else {
            this._contentOffset = targetOffset;
            this._applyTransform();
            this._updateScrollIndicators();
        }
    }

    setContentOffsetAnimated(offset, duration = 0.25) {
        this._animateToOffset(offset, duration * 1000);
    }

    scrollToTop(animated = true) {
        this.scrollRectToVisible({ x: 0, y: 0, width: 1, height: 1 }, animated);
        if (this._delegate && this._delegate.scrollViewDidScrollToTop) {
            this._delegate.scrollViewDidScrollToTop(this);
        }
    }

    scrollToBottom(animated = true) {
        const maxY = Math.max(0, this._contentSize.height * this._zoomScale - this._bounds.height);
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
            x: rect.x * targetScale - (this._bounds.width - rect.width * targetScale) / 2,
            y: rect.y * targetScale - (this._bounds.height - rect.height * targetScale) / 2
        };

        if (animated) {
            this._animateZoomAndOffset(targetScale, targetOffset);
        } else {
            this._zoomScale = targetScale;
            this._contentOffset = this._clampOffset(targetOffset);
            this._applyTransform();
        }
    }

    _animateZoomAndOffset(targetScale, targetOffset, duration = 250) {
        this._stopAllAnimations();

        const startScale = this._zoomScale;
        const startOffset = { ...this._contentOffset };
        const clampedTarget = this._clampOffset(targetOffset);
        const startTime = performance.now();
        this._isAnimating = true;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(1, elapsed / duration);
            const eased = this._easeOutCubic(progress);

            this._zoomScale = startScale + (targetScale - startScale) * eased;
            this._contentOffset = {
                x: startOffset.x + (clampedTarget.x - startOffset.x) * eased,
                y: startOffset.y + (clampedTarget.y - startOffset.y) * eased
            };
            this._applyTransform();
            this._updateScrollIndicators();

            if (this._delegate && this._delegate.scrollViewDidZoom) {
                this._delegate.scrollViewDidZoom(this);
            }
            if (this._delegate && this._delegate.scrollViewDidScroll) {
                this._delegate.scrollViewDidScroll(this);
            }

            if (progress < 1) {
                this._scrollAnimation = requestAnimationFrame(animate);
            } else {
                this._scrollAnimation = null;
                this._isAnimating = false;
            }
        };

        this._scrollAnimation = requestAnimationFrame(animate);
    }

    removeFromSuperview() {
        this._stopAllAnimations();
        if (this._indicatorTimer) {
            clearTimeout(this._indicatorTimer);
        }

        if (this._eventHandlers && this._element) {
            const handlers = this._eventHandlers;
            this._element.removeEventListener('mousedown', handlers.onMouseDown);
            this._element.removeEventListener('touchstart', handlers.onTouchStart);
            this._element.removeEventListener('touchmove', handlers.onTouchMove);
            this._element.removeEventListener('touchend', handlers.onTouchEnd);
            this._element.removeEventListener('wheel', handlers.onWheel);
            window.removeEventListener('mousemove', handlers.onMouseMove);
            window.removeEventListener('mouseup', handlers.onMouseUp);
        }

        super.removeFromSuperview();
    }
}

export { UIScrollView, UIScrollViewDelegate };
export default UIScrollView;
