import NSObject from './NSObject.js';

class UIGestureRecognizer extends NSObject {
    constructor(target, action) {
        super();
        this._target = target;
        this._action = action;
        this._view = null;
        this._state = 'possible';
        this._isEnabled = true;
        this._cancelsTouchesInView = true;
        this._delaysTouchesBegan = false;
        this._delaysTouchesEnded = true;
        this._requiresExclusiveTouch = true;
        this._lastTouchLocation = null;
        this._touches = new Map();
        this._delegate = null;
    }

    get view() {
        return this._view;
    }

    get state() {
        return this._state;
    }

    set state(value) {
        this._state = value;
    }

    get isEnabled() {
        return this._isEnabled;
    }

    set isEnabled(value) {
        this._isEnabled = value;
    }

    get cancelsTouchesInView() {
        return this._cancelsTouchesInView;
    }

    set cancelsTouchesInView(value) {
        this._cancelsTouchesInView = value;
    }

    get delaysTouchesBegan() {
        return this._delaysTouchesBegan;
    }

    set delaysTouchesBegan(value) {
        this._delaysTouchesBegan = value;
    }

    get delaysTouchesEnded() {
        return this._delaysTouchesEnded;
    }

    set delaysTouchesEnded(value) {
        this._delaysTouchesEnded = value;
    }

    get delegate() {
        return this._delegate;
    }

    set delegate(value) {
        this._delegate = value;
    }

    _handleTouchBegan(touch, event) {
        if (!this._isEnabled) return false;
        this._touches.set(touch.identifier || 0, touch);
        this._lastTouchLocation = { x: touch.clientX, y: touch.clientY };
        this.touchesBegan([touch], event);
        return true;
    }

    _handleTouchMoved(touch, event) {
        if (!this._touches.has(touch.identifier || 0)) return false;
        this._touches.set(touch.identifier || 0, touch);
        const previousLocation = this._lastTouchLocation;
        this._lastTouchLocation = { x: touch.clientX, y: touch.clientY };
        this.touchesMoved([touch], event);
        return true;
    }

    _handleTouchEnded(touch, event) {
        if (!this._touches.has(touch.identifier || 0)) return false;
        this._touches.delete(touch.identifier || 0);
        this.touchesEnded([touch], event);
        return true;
    }

    _handleTouchCancelled(touch, event) {
        if (!this._touches.has(touch.identifier || 0)) return false;
        this._touches.delete(touch.identifier || 0);
        this.touchesCancelled([touch], event);
        return true;
    }

    touchesBegan(touches, event) {
        this.state = 'began';
    }

    touchesMoved(touches, event) {
    }

    touchesEnded(touches, event) {
        this.state = 'ended';
        this._performAction();
    }

    touchesCancelled(touches, event) {
        this.state = 'cancelled';
        this._touches.clear();
    }

    _performAction() {
        if (this._target && this._action) {
            this._action.call(this._target, this);
        }
    }

    reset() {
        this._touches.clear();
        this._lastTouchLocation = null;
        this._state = 'possible';
    }

    locationInView(view) {
        if (!view || !this._lastTouchLocation) {
            return { x: 0, y: 0 };
        }
        if (view === this._view) {
            return { ...this._lastTouchLocation };
        }
        return this._view.convertPointFromWindow(this._lastTouchLocation);
    }

    static State() {
        return {
            possible: 'possible',
            began: 'began',
            changed: 'changed',
            ended: 'ended',
            cancelled: 'cancelled',
            failed: 'failed'
        };
    }
}

export default UIGestureRecognizer;
