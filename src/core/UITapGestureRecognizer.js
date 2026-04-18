import UIGestureRecognizer from './UIGestureRecognizer.js';

class UITapGestureRecognizer extends UIGestureRecognizer {
    constructor(target, action) {
        super(target, action);
        this._numberOfTapsRequired = 1;
        this._numberOfTouchesRequired = 1;
        this._tapCount = 0;
        this._touchStartLocation = null;
        this._touchStartTime = null;
    }

    get numberOfTapsRequired() {
        return this._numberOfTapsRequired;
    }

    set numberOfTapsRequired(value) {
        this._numberOfTapsRequired = Math.max(1, value);
    }

    get numberOfTouchesRequired() {
        return this._numberOfTouchesRequired;
    }

    set numberOfTouchesRequired(value) {
        this._numberOfTouchesRequired = Math.max(1, value);
    }

    _handleTouchBegan(touch, event) {
        if (!this._isEnabled) return false;
        
        const location = { x: touch.clientX, y: touch.clientY };
        
        if (this._tapCount === 0) {
            this._touchStartLocation = location;
            this._touchStartTime = Date.now();
        } else {
            if (!this._touchStartLocation) {
                this._tapCount = 0;
                this._touchStartLocation = location;
                this._touchStartTime = Date.now();
            }
        }
        
        this._touches.set(touch.identifier || 0, touch);
        return true;
    }

    _handleTouchEnded(touch, event) {
        if (!this._touches.has(touch.identifier || 0)) return false;
        
        const location = { x: touch.clientX, y: touch.clientY };
        const timeSinceStart = Date.now() - this._touchStartTime;
        
        if (this._touchStartLocation && 
            this._isWithinTapRadius(location, this._touchStartLocation) &&
            timeSinceStart < 500) {
            this._tapCount++;
            
            if (this._tapCount >= this._numberOfTapsRequired) {
                this.state = 'ended';
                this._performAction();
                this.reset();
            }
        } else {
            this.reset();
        }
        
        this._touches.delete(touch.identifier || 0);
        return true;
    }

    _handleTouchCancelled(touch, event) {
        super._handleTouchCancelled(touch, event);
        this.reset();
        return true;
    }

    _isWithinTapRadius(l1, l2) {
        const dx = l1.x - l2.x;
        const dy = l1.y - l2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 25;
    }

    reset() {
        super.reset();
        this._tapCount = 0;
        this._touchStartLocation = null;
        this._touchStartTime = null;
    }

    locationInView(view) {
        if (!view || !this._touchStartLocation) {
            return { x: 0, y: 0 };
        }
        if (view === this._view) {
            return { ...this._touchStartLocation };
        }
        return this._view.convertPointFromWindow(this._touchStartLocation);
    }
}

export default UITapGestureRecognizer;
