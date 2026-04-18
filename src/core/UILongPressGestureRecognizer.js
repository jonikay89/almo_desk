import UIGestureRecognizer from './UIGestureRecognizer.js';

class UILongPressGestureRecognizer extends UIGestureRecognizer {
    constructor(target, action) {
        super(target, action);
        this._minimumPressDuration = 0.5;
        this._numberOfTapsRequired = 0;
        this._numberOfTouchesRequired = 1;
        this._tapCount = 0;
        this._touchStartLocation = null;
        this._touchStartTime = null;
        this._timer = null;
        this._isRecognizing = false;
    }

    get minimumPressDuration() {
        return this._minimumPressDuration;
    }

    set minimumPressDuration(value) {
        this._minimumPressDuration = Math.max(0, value);
    }

    get numberOfTapsRequired() {
        return this._numberOfTapsRequired;
    }

    set numberOfTapsRequired(value) {
        this._numberOfTapsRequired = Math.max(0, value);
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
        }
        
        this._touches.set(touch.identifier || 0, touch);
        
        if (this._touches.size >= this._numberOfTouchesRequired) {
            this._startTimer();
        }
        
        return true;
    }

    _handleTouchMoved(touch, event) {
        if (!this._touches.has(touch.identifier || 0)) return false;
        
        const location = { x: touch.clientX, y: touch.clientY };
        this._touches.set(touch.identifier || 0, touch);
        
        if (this._touchStartLocation) {
            const dx = location.x - this._touchStartLocation.x;
            const dy = location.y - this._touchStartLocation.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 10 && this._timer) {
                this._cancelTimer();
                if (this._isRecognizing) {
                    this.state = 'cancelled';
                    this._isRecognizing = false;
                }
            }
        }
        
        if (this._isRecognizing) {
            this.state = 'changed';
        }
        
        return true;
    }

    _handleTouchEnded(touch, event) {
        if (!this._touches.has(touch.identifier || 0)) return false;
        
        this._touches.delete(touch.identifier || 0);
        
        if (this._isRecognizing) {
            this.state = 'ended';
            this._performAction();
        }
        
        this._cancelTimer();
        this.reset();
        return true;
    }

    _handleTouchCancelled(touch, event) {
        if (!this._touches.has(touch.identifier || 0)) return false;
        this._touches.delete(touch.identifier || 0);
        this._cancelTimer();
        if (this._isRecognizing) {
            this.state = 'cancelled';
        }
        this._isRecognizing = false;
        super._handleTouchCancelled(touch, event);
        this.reset();
        return true;
    }

    _startTimer() {
        if (this._timer) return;
        
        this._timer = setTimeout(() => {
            if (this._touches.size >= this._numberOfTouchesRequired) {
                if (this.state === 'possible') {
                    this.state = 'began';
                    this._isRecognizing = true;
                    this._performAction();
                }
            }
        }, this._minimumPressDuration * 1000);
    }

    _cancelTimer() {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
    }

    reset() {
        super.reset();
        this._cancelTimer();
        this._tapCount = 0;
        this._touchStartLocation = null;
        this._touchStartTime = null;
        this._isRecognizing = false;
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

export default UILongPressGestureRecognizer;
