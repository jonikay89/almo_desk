import UIGestureRecognizer from './UIGestureRecognizer.js';

class UISwipeGestureRecognizer extends UIGestureRecognizer {
    static Direction = {
        right: 'right',
        left: 'left',
        up: 'up',
        down: 'down'
    };

    constructor(target, action) {
        super(target, action);
        this._direction = 'right';
        this._numberOfTouchesRequired = 1;
        this._minimumSwipeDistance = 50;
        this._maximumSwipeDuration = 500;
        this._startLocation = null;
        this._startTime = null;
    }

    get direction() { return this._direction; }
    set direction(value) { this._direction = value; }

    get numberOfTouchesRequired() { return this._numberOfTouchesRequired; }
    set numberOfTouchesRequired(value) { this._numberOfTouchesRequired = value; }

    touchesBegan(touches, event) {
        const touch = touches[0];
        if (!touch) return;
        this._startLocation = { x: touch.clientX, y: touch.clientY };
        this._startTime = Date.now();
        this.state = 'began';
    }

    touchesMoved(touches, event) {
    }

    touchesEnded(touches, event) {
        if (!this._startLocation || !this._lastTouchLocation) {
            this.state = 'failed';
            this.reset();
            return;
        }

        const dx = this._lastTouchLocation.x - this._startLocation.x;
        const dy = this._lastTouchLocation.y - this._startLocation.y;
        const elapsed = Date.now() - this._startTime;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (elapsed > this._maximumSwipeDuration) {
            this.state = 'failed';
            this.reset();
            return;
        }

        let detectedDirection = null;

        if (absDx > absDy && absDx >= this._minimumSwipeDistance) {
            detectedDirection = dx > 0 ? 'right' : 'left';
        } else if (absDy >= this._minimumSwipeDistance) {
            detectedDirection = dy > 0 ? 'down' : 'up';
        }

        if (detectedDirection === this._direction) {
            this.state = 'ended';
            this._performAction();
        } else {
            this.state = 'failed';
        }

        this.reset();
    }

    reset() {
        super.reset();
        this._startLocation = null;
        this._startTime = null;
    }
}

export default UISwipeGestureRecognizer;
