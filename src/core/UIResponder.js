import NSObject from './NSObject.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';

class UIResponder extends NSObject {
    constructor() {
        super();
        this._nextResponder = null;
        this._userInteractionEnabled = true;
    }

    get nextResponder() {
        return this._nextResponder;
    }

    set nextResponder(responder) {
        this._nextResponder = responder;
    }

    get userInteractionEnabled() {
        return this._userInteractionEnabled;
    }

    set userInteractionEnabled(enabled) {
        this._userInteractionEnabled = enabled;
    }

    touchesBegan(touches, event) {}

    touchesMoved(touches, event) {}

    touchesEnded(touches, event) {}

    touchesCancelled(touches, event) {}

    isFirstResponder() {
        return false;
    }

    becomeFirstResponder() {
        return false;
    }

    resignFirstResponder() {
        return false;
    }

    ifCase(pattern, handler) {
        return ifCase(pattern)(this).then(handler);
    }

    guardCase(pattern) {
        return guardCase(pattern)(this);
    }

    static forCase(collection, pattern, handler) {
        for (const item of collection) {
            const result = forCase(pattern)(item);
            if (result !== undefined) {
                handler(result);
            }
        }
    }

    static whileCase(iterator, pattern) {
        return whileCase(pattern)(iterator);
    }

    matchOperator(pattern) {
        return patternMatch(pattern, this);
    }

    ifLet(pattern) {
        return ifLet(this, pattern);
    }

    guardLet(pattern) {
        return guardLet(this, pattern);
    }

    switch() {
        return Switch(this);
    }
}

export default UIResponder;
