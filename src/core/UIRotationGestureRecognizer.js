import UIGestureRecognizer from './UIGestureRecognizer.js';

class UIRotationGestureRecognizer extends UIGestureRecognizer {
    constructor(target, action) {
        super(target, action);
        this._rotation = 0;
        this._velocity = 0;
        this._lastAngle = null;
        this._lastTimestamp = null;
        this._velocitySamples = [];
    }

    get rotation() {
        return this._rotation;
    }

    get velocity() {
        return this._velocity;
    }

    _getAngle(touch1, touch2) {
        return Math.atan2(
            touch2.clientY - touch1.clientY,
            touch2.clientX - touch1.clientX
        );
    }

    _handleTouchBegan(touch, event) {
        if (!this._isEnabled) return false;
        
        this._touches.set(touch.identifier || 0, touch);
        
        if (this._touches.size === 2) {
            const touches = Array.from(this._touches.values());
            this._lastAngle = this._getAngle(touches[0], touches[1]);
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
            const currentAngle = this._getAngle(touches[0], touches[1]);
            const currentTimestamp = Date.now();
            
            if (this._lastAngle !== null) {
                let angleDiff = currentAngle - this._lastAngle;
                
                if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
                
                this._rotation += angleDiff;
                
                const dt = (currentTimestamp - this._lastTimestamp) / 1000;
                if (dt > 0) {
                    const velocity = angleDiff / dt;
                    this._velocitySamples.push(velocity);
                    if (this._velocitySamples.length > 5) {
                        this._velocitySamples.shift();
                    }
                    this._computeVelocity();
                }
                
                this.state = 'changed';
            }
            
            this._lastAngle = currentAngle;
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
        this._rotation = 0;
        this._velocity = 0;
        this._lastAngle = null;
        this._lastTimestamp = null;
        this._velocitySamples = [];
    }
}

export default UIRotationGestureRecognizer;
