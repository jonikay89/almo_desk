import UIGestureRecognizer from './UIGestureRecognizer.js';

class UIPinchGestureRecognizer extends UIGestureRecognizer {
    constructor(target, action) {
        super(target, action);
        this._scale = 1;
        this._velocity = 0;
        this._lastDistance = null;
        this._lastTimestamp = null;
        this._velocitySamples = [];
    }

    get scale() {
        return this._scale;
    }

    get velocity() {
        return this._velocity;
    }

    _getDistance(touch1, touch2) {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    _handleTouchBegan(touch, event) {
        if (!this._isEnabled) return false;
        
        this._touches.set(touch.identifier || 0, touch);
        
        if (this._touches.size === 2) {
            const touches = Array.from(this._touches.values());
            this._lastDistance = this._getDistance(touches[0], touches[1]);
            this._lastTimestamp = Date.now();
            
            if (this.state === 'possible') {
                this.state = 'began';
            }
            return true;
        }
        return true;
    }

    _handleTouchMoved(touch, event) {
        if (!this._touches.has(touch.identifier || 0)) return false;
        
        this._touches.set(touch.identifier || 0, touch);
        
        if (this._touches.size === 2) {
            const touches = Array.from(this._touches.values());
            const currentDistance = this._getDistance(touches[0], touches[1]);
            const currentTimestamp = Date.now();
            
            if (this._lastDistance !== null) {
                const dt = (currentTimestamp - this._lastTimestamp) / 1000;
                const scaleChange = currentDistance / this._lastDistance;
                
                this._scale *= scaleChange;
                
                if (dt > 0) {
                    const velocity = (scaleChange - 1) / dt;
                    this._velocitySamples.push(velocity);
                    if (this._velocitySamples.length > 5) {
                        this._velocitySamples.shift();
                    }
                    this._computeVelocity();
                }
                
                this.state = 'changed';
            }
            
            this._lastDistance = currentDistance;
            this._lastTimestamp = currentTimestamp;
        }
        
        return true;
    }

    _handleTouchEnded(touch, event) {
        if (!this._touches.has(touch.identifier || 0)) return false;
        
        this._touches.delete(touch.identifier || 0);
        
        if (this._touches.size < 2) {
            if (this.state === 'began' || this.state === 'changed') {
                this.state = 'ended';
                this._performAction();
            }
            this.reset();
        }
        
        return true;
    }

    _handleTouchCancelled(touch, event) {
        if (!this._touches.has(touch.identifier || 0)) return false;
        this._touches.delete(touch.identifier || 0);
        super._handleTouchCancelled(touch, event);
        this.reset();
        return true;
    }

    _computeVelocity() {
        if (this._velocitySamples.length === 0) {
            this._velocity = 0;
            return;
        }
        
        let total = 0;
        for (const sample of this._velocitySamples) {
            total += sample;
        }
        this._velocity = total / this._velocitySamples.length;
    }

    reset() {
        super.reset();
        this._scale = 1;
        this._velocity = 0;
        this._lastDistance = null;
        this._lastTimestamp = null;
        this._velocitySamples = [];
    }
}

export default UIPinchGestureRecognizer;
