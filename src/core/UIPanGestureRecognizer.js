import UIGestureRecognizer from './UIGestureRecognizer.js';

class UIPanGestureRecognizer extends UIGestureRecognizer {
    constructor(target, action) {
        super(target, action);
        this._minimumNumberOfTouches = 1;
        this._maximumNumberOfTouches = 2;
        this._translation = { x: 0, y: 0 };
        this._velocity = { x: 0, y: 0 };
        this._lastLocation = null;
        this._lastTimestamp = null;
        this._sampleCount = 0;
        this._velocitySamples = [];
    }

    get minimumNumberOfTouches() {
        return this._minimumNumberOfTouches;
    }

    set minimumNumberOfTouches(value) {
        this._minimumNumberOfTouches = Math.max(1, value);
    }

    get maximumNumberOfTouches() {
        return this._maximumNumberOfTouches;
    }

    set maximumNumberOfTouches(value) {
        this._maximumNumberOfTouches = Math.max(1, value);
    }

    get translation() {
        return { ...this._translation };
    }

    get velocity() {
        return { ...this._velocity };
    }

    setTranslation(translation, inView) {
        this._translation = { ...translation };
    }

    _handleTouchBegan(touch, event) {
        if (!this._isEnabled) return false;
        
        if (this._touches.size < this._maximumNumberOfTouches) {
            this._touches.set(touch.identifier || 0, touch);
            this._lastLocation = { x: touch.clientX, y: touch.clientY };
            this._lastTimestamp = Date.now();
            this._velocitySamples = [];
            this._sampleCount = 0;
            
            if (this._touches.size >= this._minimumNumberOfTouches) {
                if (this.state === 'possible') {
                    this.state = 'began';
                }
            }
            return true;
        }
        return false;
    }

    _handleTouchMoved(touch, event) {
        if (!this._touches.has(touch.identifier || 0)) return false;
        
        const currentLocation = { x: touch.clientX, y: touch.clientY };
        const currentTimestamp = Date.now();
        
        this._touches.set(touch.identifier || 0, touch);
        
        if (this._lastLocation) {
            const dt = (currentTimestamp - this._lastTimestamp) / 1000;
            if (dt > 0) {
                const dx = currentLocation.x - this._lastLocation.x;
                const dy = currentLocation.y - this._lastLocation.y;
                
                this._translation.x += dx;
                this._translation.y += dy;
                
                this._velocitySamples.push({ dx, dy, dt });
                if (this._velocitySamples.length > 5) {
                    this._velocitySamples.shift();
                }
                
                this._computeVelocity();
                
                if (this.state === 'began') {
                    this.state = 'changed';
                } else if (this.state === 'changed') {
                    this.state = 'changed';
                }
            }
        }
        
        this._lastLocation = currentLocation;
        this._lastTimestamp = currentTimestamp;
        return true;
    }

    _handleTouchEnded(touch, event) {
        if (!this._touches.has(touch.identifier || 0)) return false;
        
        this._touches.delete(touch.identifier || 0);
        
        if (this._touches.size < this._minimumNumberOfTouches) {
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
            this._velocity = { x: 0, y: 0 };
            return;
        }
        
        let totalDx = 0;
        let totalDy = 0;
        let totalDt = 0;
        
        for (const sample of this._velocitySamples) {
            totalDx += sample.dx;
            totalDy += sample.dy;
            totalDt += sample.dt;
        }
        
        if (totalDt > 0) {
            this._velocity = {
                x: totalDx / totalDt,
                y: totalDy / totalDt
            };
        }
    }

    reset() {
        super.reset();
        this._translation = { x: 0, y: 0 };
        this._velocity = { x: 0, y: 0 };
        this._lastLocation = null;
        this._lastTimestamp = null;
        this._velocitySamples = [];
    }

    translationInView(view) {
        return { ...this._translation };
    }

    velocityInView(view) {
        return { ...this._velocity };
    }
}

export default UIPanGestureRecognizer;
