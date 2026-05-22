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
        this._alwaysBounceHorizontal = false;
        this._alwaysBounceVertical = false;
        
        this._decelerationRate = 0.998;
        this._isDecelerating = false;
        this._decelerationTimer = null;
        
        this._minimumZoomScale = 1.0;
        this._maximumZoomScale = 1.0;
        this._zoomScale = 1.0;
        this._isZooming = false;
        
        this._pagingEnabled = false;
        this._pageSize = { width: 0, height: 0 };
        
        this._keyboardDismissMode = 'none';
        this._keyboardAvoidingEnabled = false;
        
        this._delegate = null;
        this._panGestureRecognizer = null;
        this._pinchGestureRecognizer = null;
        
        this._isDragging = false;
        this._isTracking = false;
        
        // Bounce state
        this._isBouncing = false;
        this._bounceAnimation = null;
        this._bounceVelocity = { x: 0, y: 0 };
        
        // Scroll indicators
        this._horizontalIndicator = null;
        this._verticalIndicator = null;
        this._indicatorOpacity = 0;
        this._indicatorTimer = null;
        
        // Drag state
        this._dragStartOffset = { x: 0, y: 0 };
        this._dragStartLocation = { x: 0, y: 0 };
        this._dragVelocity = { x: 0, y: 0 };
        this._dragLastLocation = { x: 0, y: 0 };
        this._dragLastTime = 0;
        
        this._scrollsToTop = true;
        this._delaysContentTouches = true;
        this._canCancelTouchInSubviews = true;
    }

    // Getters and Setters
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
    get isBouncing() { return this._isBouncing; }

    get keyboardDismissMode() { return this._keyboardDismissMode; }
    set keyboardDismissMode(value) { this._keyboardDismissMode = value; }

    get scrollsToTop() { return this._scrollsToTop; }
    set scrollsToTop(value) { this._scrollsToTop = value; }

    // Core calculations
    _getMaxOffset() {
        return {
            x: Math.max(0, this._contentSize.width - this._bounds.width),
            y: Math.max(0, this._contentSize.height - this._bounds.height)
        };
    }

    _clampOffset(offset) {
        const max = this._getMaxOffset();
        return {
            x: Math.max(0, Math.min(offset.x, max.x)),
            y: Math.max(0, Math.min(offset.y, max.y))
        };
    }

    // Apple's rubber banding formula: f(x) = d * (1 - 1 / (x * c / d + 1))
    // where x is overscroll, c is resistance constant (0.55), d is max distance
    _rubberBand(overscroll, maxDistance = 200) {
        const resistance = 0.55;
        return maxDistance * (1 - 1 / ((overscroll * resistance / maxDistance) + 1));
    }

    _applyRubberBanding(offset) {
        const max = this._getMaxOffset();
        let result = { x: offset.x, y: offset.y };
        
        // Check if we should allow horizontal bounce
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
        
        // Check if we should allow vertical bounce
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

    _isOutOfBounds() {
        const max = this._getMaxOffset();
        const epsilon = 0.1;
        return {
            x: this._contentOffset.x < -epsilon || this._contentOffset.x > max.x + epsilon,
            y: this._contentOffset.y < -epsilon || this._contentOffset.y > max.y + epsilon
        };
    }

    _applyZoomScale() {
        if (this._contentElement) {
            this._contentElement.style.transform = `translate3d(${-this._contentOffset.x}px, ${-this._contentOffset.y}px, 0) scale(${this._zoomScale})`;
        }
    }

    _syncContentElement() {
        if (this._contentElement) {
            this._contentElement.style.transform = `translate3d(${-this._contentOffset.x}px, ${-this._contentOffset.y}px, 0) scale(${this._zoomScale})`;
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

    // iOS-style spring bounce animation
    // Uses critically damped spring physics
    _animateBounceBack() {
        if (!this._bounces) return;
        
        // Cancel existing bounce
        if (this._bounceAnimation) {
            cancelAnimationFrame(this._bounceAnimation);
            this._bounceAnimation = null;
        }
        
        const max = this._getMaxOffset();
        const target = this._clampOffset(this._contentOffset);
        const start = { ...this._contentOffset };
        
        // Calculate if we actually need to bounce
        const dx = target.x - start.x;
        const dy = target.y - start.y;
        if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
            this._isBouncing = false;
            return;
        }
        
        this._isBouncing = true;
        
        // Spring constants (tuned for iOS feel)
        const stiffness = 180; // Spring stiffness
        const damping = 16;    // Damping coefficient
        const mass = 1;        // Mass
        
        // Calculate angular frequency
        const omega = Math.sqrt(stiffness / mass);
        const dampingRatio = damping / (2 * Math.sqrt(stiffness * mass));
        
        // Initial conditions
        let position = { x: 0, y: 0 };
        let velocity = { 
            x: this._bounceVelocity.x || (start.x - target.x) * 0.5,
            y: this._bounceVelocity.y || (start.y - target.y) * 0.5
        };
        
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = (currentTime - startTime) / 1000; // seconds
            
            if (elapsed >= 0.5) { // Max animation duration
                this._contentOffset = { ...target };
                this._syncContentElement();
                this._isBouncing = false;
                this._bounceAnimation = null;
                this._bounceVelocity = { x: 0, y: 0 };
                
                if (this._delegate && this._delegate.scrollViewDidEndDragging) {
                    this._delegate.scrollViewDidEndDragging(this, false);
                }
                return;
            }
            
            // Critically damped spring solution
            // x(t) = (A + B*t) * e^(-omega * t)
            const expTerm = Math.exp(-omega * elapsed);
            
            // For critically damped (dampingRatio === 1)
            const A = { x: 1, y: 1 };
            const B = { 
                x: velocity.x + omega * position.x,
                y: velocity.y + omega * position.y
            };
            
            position.x = (A.x + B.x * elapsed) * expTerm;
            position.y = (A.y + B.y * elapsed) * expTerm;
            
            // Apply to actual offset
            this._contentOffset = {
                x: target.x + position.x * dx,
                y: target.y + position.y * dy
            };
            
            this._syncContentElement();
            this._updateScrollIndicators();
            
            if (this._delegate && this._delegate.scrollViewDidScroll) {
                this._delegate.scrollViewDidScroll(this);
            }
            
            this._bounceAnimation = requestAnimationFrame(animate);
        };
        
        this._bounceAnimation = requestAnimationFrame(animate);
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

            this._contentElement = document.createElement('div');
            this._contentElement.style.position = 'absolute';
            this._contentElement.style.transformOrigin = '0 0';
            this._contentElement.style.willChange = 'transform';
            this._element.appendChild(this._contentElement);

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
                borderRadius: '2px',
                pointerEvents: 'none',
                opacity: '0',
                transition: 'opacity 0.2s',
                zIndex: '100',
                backgroundColor: 'rgba(128, 128, 128, 0.5)'
            };
            
            if (isHorizontal) {
                style.height = '3px';
                style.left = '0';
                style.right = '0';
                style.bottom = '2px';
            } else {
                style.width = '3px';
                style.top = '0';
                style.bottom = '0';
                style.right = '2px';
            }
            
            Object.assign(indicator.style, style);
            return indicator;
        };

        this._horizontalIndicator = createIndicator(true);
        this._verticalIndicator = createIndicator(false);
        this._element.appendChild(this._horizontalIndicator);
        this._element.appendChild(this._verticalIndicator);
    }

    _setupEventListeners() {
        if (typeof document === 'undefined') return;
        
        // Mouse events for dragging
        let isDragging = false;
        let startX = 0, startY = 0;
        let lastX = 0, lastY = 0;
        let startOffsetX = 0, startOffsetY = 0;
        let lastTime = 0;
        let velocityX = 0, velocityY = 0;
        
        const onMouseDown = (e) => {
            if (e.target !== this._element && !this._element.contains(e.target)) return;
            if (this._isBouncing) {
                cancelAnimationFrame(this._bounceAnimation);
                this._isBouncing = false;
            }
            
            e.preventDefault();
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            lastX = e.clientX;
            lastY = e.clientY;
            startOffsetX = this._contentOffset.x;
            startOffsetY = this._contentOffset.y;
            lastTime = Date.now();
            velocityX = 0;
            velocityY = 0;
            this._element.style.cursor = 'grabbing';
            
            this._stopDeceleration();
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
            const dt = Math.max(1, now - lastTime);
            
            // Calculate velocity (pixels per second)
            velocityX = (e.clientX - lastX) / dt * 1000;
            velocityY = (e.clientY - lastY) / dt * 1000;
            
            lastX = e.clientX;
            lastY = e.clientY;
            lastTime = now;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            // Calculate new offset with rubber banding
            let newOffset = {
                x: startOffsetX - deltaX,
                y: startOffsetY - deltaY
            };
            
            newOffset = this._applyRubberBanding(newOffset);
            
            this._contentOffset = newOffset;
            this._syncContentElement();
            this._updateScrollIndicators();
            this._dragVelocity = { x: velocityX, y: velocityY };
            
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
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            const max = this._getMaxOffset();
            const isOutOfBounds = this._contentOffset.x < 0 || this._contentOffset.x > max.x ||
                                 this._contentOffset.y < 0 || this._contentOffset.y > max.y;
            
            // Check if we need to bounce back
            if (this._bounces && isOutOfBounds) {
                this._bounceVelocity = { x: velocityX * 0.1, y: velocityY * 0.1 };
                this._animateBounceBack();
                
                if (this._delegate && this._delegate.scrollViewWillEndDragging) {
                    this._delegate.scrollViewWillEndDragging(this, { x: velocityX, y: velocityY }, this._contentOffset);
                }
                if (this._delegate && this._delegate.scrollViewDidEndDragging) {
                    this._delegate.scrollViewDidEndDragging(this, false);
                }
            } 
            // Handle paging
            else if (this._pagingEnabled) {
                const pageWidth = this._pageSize.width > 0 ? this._pageSize.width : this._bounds.width;
                const pageHeight = this._pageSize.height > 0 ? this._pageSize.height : this._bounds.height;
                
                let currentPageX = Math.round(this._contentOffset.x / pageWidth);
                let currentPageY = Math.round(this._contentOffset.y / pageHeight);
                
                const maxPageX = Math.floor(this._contentSize.width / pageWidth);
                const maxPageY = Math.floor(this._contentSize.height / pageHeight);
                
                currentPageX = Math.max(0, Math.min(currentPageX, maxPageX));
                currentPageY = Math.max(0, Math.min(currentPageY, maxPageY));
                
                const dragPercentageX = deltaX / pageWidth;
                const dragPercentageY = deltaY / pageHeight;
                const isFlickX = Math.abs(velocityX) > 500;
                const isFlickY = Math.abs(velocityY) > 500;
                
                let targetPageX = currentPageX;
                let targetPageY = currentPageY;
                
                if (isFlickX) {
                    targetPageX += velocityX > 0 ? -1 : 1;
                } else if (Math.abs(dragPercentageX) > 0.3) {
                    targetPageX += dragPercentageX < 0 ? 1 : -1;
                }
                
                if (isFlickY) {
                    targetPageY += velocityY > 0 ? -1 : 1;
                } else if (Math.abs(dragPercentageY) > 0.3) {
                    targetPageY += dragPercentageY < 0 ? 1 : -1;
                }
                
                targetPageX = Math.max(0, Math.min(targetPageX, maxPageX));
                targetPageY = Math.max(0, Math.min(targetPageY, maxPageY));
                
                const targetOffset = {
                    x: targetPageX * pageWidth,
                    y: targetPageY * pageHeight
                };
                
                this._animateToOffset(targetOffset, 300);
                
                if (this._delegate && this._delegate.scrollViewWillEndDragging) {
                    this._delegate.scrollViewWillEndDragging(this, { x: velocityX, y: velocityY }, targetOffset);
                }
                if (this._delegate && this._delegate.scrollViewDidEndDragging) {
                    this._delegate.scrollViewDidEndDragging(this, false);
                }
            }
            // Handle inertial scrolling
            else {
                const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
                const shouldDecelerate = speed > 50;
                
                if (shouldDecelerate) {
                    this._startDeceleration(velocityX, velocityY);
                }
                
                if (this._delegate && this._delegate.scrollViewWillEndDragging) {
                    this._delegate.scrollViewWillEndDragging(this, { x: velocityX, y: velocityY }, this._contentOffset);
                }
                if (this._delegate && this._delegate.scrollViewDidEndDragging) {
                    this._delegate.scrollViewDidEndDragging(this, shouldDecelerate);
                }
            }
            
            this._hideScrollIndicatorsAfterDelay();
        };
        
        const onMouseLeave = () => {
            if (isDragging) {
                onMouseUp({ clientX: lastX, clientY: lastY });
            }
        };
        
        this._element.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        this._element.addEventListener('mouseleave', onMouseLeave);
        
        // Wheel events for scrolling
        const onWheel = (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const scaleChange = e.deltaY > 0 ? 0.9 : 1.1;
                const newScale = Math.max(this._minimumZoomScale, Math.min(this._maximumZoomScale, this._zoomScale * scaleChange));
                this.zoomScale = newScale;
            } else {
                e.preventDefault();
                
                // Stop any ongoing animations
                this._stopDeceleration();
                if (this._isBouncing) {
                    cancelAnimationFrame(this._bounceAnimation);
                    this._isBouncing = false;
                }
                
                const deltaX = e.deltaX || 0;
                const deltaY = e.deltaY || 0;
                
                let newOffset = {
                    x: this._contentOffset.x + deltaX,
                    y: this._contentOffset.y + deltaY
                };
                
                newOffset = this._applyRubberBanding(newOffset);
                this._contentOffset = newOffset;
                this._syncContentElement();
                this._updateScrollIndicators();
                
                if (this._delegate && this._delegate.scrollViewDidScroll) {
                    this._delegate.scrollViewDidScroll(this);
                }
            }
        };
        
        this._element.addEventListener('wheel', onWheel, { passive: false });
        
        // Store handlers for cleanup
        this._eventHandlers = { onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onWheel };
    }

    _startDeceleration(velocityX, velocityY) {
        if (this._isDecelerating) return;
        
        this._isDecelerating = true;
        let velX = velocityX * 0.1;
        let velY = velocityY * 0.1;
        
        if (this._delegate && this._delegate.scrollViewWillBeginDecelerating) {
            this._delegate.scrollViewWillBeginDecelerating(this);
        }
        
        const decelerate = () => {
            if (!this._isDecelerating) return;
            
            // Apply deceleration
            velX *= this._decelerationRate;
            velY *= this._decelerationRate;
            
            let newX = this._contentOffset.x - velX;
            let newY = this._contentOffset.y - velY;
            
            const max = this._getMaxOffset();
            let shouldStop = false;
            
            // Check bounds
            if (newX < 0 || newX > max.x) {
                if (this._bounces) {
                    newX = this._applyRubberBanding({ x: newX, y: 0 }).x;
                    if (Math.abs(velX) < 10) shouldStop = true;
                } else {
                    newX = Math.max(0, Math.min(newX, max.x));
                    shouldStop = true;
                }
            }
            
            if (newY < 0 || newY > max.y) {
                if (this._bounces) {
                    newY = this._applyRubberBanding({ x: 0, y: newY }).y;
                    if (Math.abs(velY) < 10) shouldStop = true;
                } else {
                    newY = Math.max(0, Math.min(newY, max.y));
                    shouldStop = true;
                }
            }
            
            this._contentOffset = { x: newX, y: newY };
            this._syncContentElement();
            this._updateScrollIndicators();
            
            if (this._delegate && this._delegate.scrollViewDidScroll) {
                this._delegate.scrollViewDidScroll(this);
            }
            
            const speed = Math.sqrt(velX * velX + velY * velY);
            
            if (speed < 5 || shouldStop) {
                this._stopDeceleration();
                
                // Check if we need to bounce back
                if (this._bounces && (this._contentOffset.x < 0 || this._contentOffset.x > max.x ||
                                     this._contentOffset.y < 0 || this._contentOffset.y > max.y)) {
                    this._bounceVelocity = { x: velX, y: velY };
                    this._animateBounceBack();
                }
            } else {
                this._decelerationTimer = requestAnimationFrame(decelerate);
            }
        };
        
        this._decelerationTimer = requestAnimationFrame(decelerate);
    }

    _stopDeceleration() {
        if (this._decelerationTimer) {
            cancelAnimationFrame(this._decelerationTimer);
            this._decelerationTimer = null;
        }
        
        if (this._isDecelerating) {
            this._isDecelerating = false;
            if (this._delegate && this._delegate.scrollViewDidEndDecelerating) {
                this._delegate.scrollViewDidEndDecelerating(this);
            }
        }
    }

    _showScrollIndicators() {
        if (this._indicatorTimer) clearTimeout(this._indicatorTimer);
        
        this._indicatorOpacity = 1;
        if (this._horizontalIndicator && this._showsHorizontalScrollIndicator) {
            this._horizontalIndicator.style.opacity = '1';
        }
        if (this._verticalIndicator && this._showsVerticalScrollIndicator) {
            this._verticalIndicator.style.opacity = '1';
        }
    }

    _hideScrollIndicatorsAfterDelay() {
        if (this._indicatorTimer) clearTimeout(this._indicatorTimer);
        
        this._indicatorTimer = setTimeout(() => {
            if (!this._isDragging && !this._isDecelerating && !this._isBouncing) {
                this._indicatorOpacity = 0;
                if (this._horizontalIndicator) this._horizontalIndicator.style.opacity = '0';
                if (this._verticalIndicator) this._verticalIndicator.style.opacity = '0';
            }
        }, 500);
    }

    _updateScrollIndicators() {
        if (!this._horizontalIndicator || !this._verticalIndicator) return;
        
        const max = this._getMaxOffset();
        
        // Update horizontal indicator
        if (max.x > 0 && this._showsHorizontalScrollIndicator) {
            const indicatorWidth = Math.max(30, (this._bounds.width / this._contentSize.width) * this._bounds.width);
            let indicatorX = (this._contentOffset.x / max.x) * (this._bounds.width - indicatorWidth - 4);
            indicatorX = Math.max(2, Math.min(this._bounds.width - indicatorWidth - 4, indicatorX));
            this._horizontalIndicator.style.width = `${indicatorWidth}px`;
            this._horizontalIndicator.style.left = `${indicatorX}px`;
        }
        
        // Update vertical indicator
        if (max.y > 0 && this._showsVerticalScrollIndicator) {
            const indicatorHeight = Math.max(30, (this._bounds.height / this._contentSize.height) * this._bounds.height);
            let indicatorY = (this._contentOffset.y / max.y) * (this._bounds.height - indicatorHeight - 4);
            indicatorY = Math.max(2, Math.min(this._bounds.height - indicatorHeight - 4, indicatorY));
            this._verticalIndicator.style.height = `${indicatorHeight}px`;
            this._verticalIndicator.style.top = `${indicatorY}px`;
        }
    }

    _updateIndicatorStyles() {
        const style = this._indicatorStyle === 'black' ? 'rgba(0,0,0,0.4)' : 
                      this._indicatorStyle === 'white' ? 'rgba(255,255,255,0.5)' : 
                      'rgba(128,128,128,0.5)';
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
            this.contentOffset = targetOffset;
        }
    }

    _animateToOffset(targetOffset, duration = 300) {
        this._stopDeceleration();
        if (this._isBouncing) {
            cancelAnimationFrame(this._bounceAnimation);
            this._isBouncing = false;
        }
        
        const startOffset = { ...this._contentOffset };
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(1, elapsed / duration);
            // Cubic ease-out for smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 3);
            
            this.contentOffset = {
                x: startOffset.x + (targetOffset.x - startOffset.x) * eased,
                y: startOffset.y + (targetOffset.y - startOffset.y) * eased
            };
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (this._delegate && this._delegate.scrollViewDidEndScrollingAnimation) {
                this._delegate.scrollViewDidEndScrollingAnimation(this);
            }
        };
        
        requestAnimationFrame(animate);
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

    _animateZoom(targetScale) {
        const startScale = this._zoomScale;
        const startTime = performance.now();
        const duration = 250;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(1, elapsed / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            this.zoomScale = startScale + (targetScale - startScale) * eased;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    removeFromSuperview() {
        this._stopDeceleration();
        if (this._bounceAnimation) {
            cancelAnimationFrame(this._bounceAnimation);
        }
        if (this._indicatorTimer) {
            clearTimeout(this._indicatorTimer);
        }
        super.removeFromSuperview();
    }
}

export { UIScrollView, UIScrollViewDelegate };
export default UIScrollView;