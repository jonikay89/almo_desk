import NSObject from './NSObject.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch, ifLet, guardLet } from './PatternMatching.js';
import { kp, getProperty, updateProperty } from './Foundation.js';

class UIResponder extends NSObject {
    constructor() {
        super();
        this._nextResponder = null;
        this._userInteractionEnabled = true;
        this._isFirstResponder = false;
        this._canBecomeFirstResponder = true;
        this._sharedObjects = new Map();
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

    get canBecomeFirstResponder() {
        return this._canBecomeFirstResponder;
    }

    set canBecomeFirstResponder(value) {
        this._canBecomeFirstResponder = value;
    }

    touchesBegan(touches, event) {}

    touchesMoved(touches, event) {}

    touchesEnded(touches, event) {}

    touchesCancelled(touches, event) {}

    touchesEstimatedPropertiesUpdated(touches) {}

    isFirstResponder() {
        return this._isFirstResponder;
    }

    becomeFirstResponder() {
        if (this._canBecomeFirstResponder) {
            this._isFirstResponder = true;
            return true;
        }
        return false;
    }

    resignFirstResponder() {
        this._isFirstResponder = false;
        return true;
    }

    _responderChain() {
        const chain = [this];
        let responder = this._nextResponder;
        while (responder) {
            chain.push(responder);
            responder = responder._nextResponder;
        }
        return chain;
    }

    _targetForAction(action, untilResponder = null) {
        if (typeof this[action] === 'function') {
            return this;
        }
        if (this._nextResponder && this._nextResponder !== untilResponder) {
            return this._nextResponder._targetForAction(action, untilResponder);
        }
        return null;
    }

    _performAction(action, sender, event = null) {
        const target = this._targetForAction(action);
        if (target) {
            target[action](sender, event);
            return true;
        }
        return false;
    }

    _isDescendantOf(responder) {
        let current = this._nextResponder;
        while (current) {
            if (current === responder) {
                return true;
            }
            current = current._nextResponder;
        }
        return false;
    }

    setSharedObject(key, value) {
        this._sharedObjects.set(key, value);
        return this;
    }

    getSharedObject(key) {
        return this._sharedObjects.get(key);
    }

    removeSharedObject(key) {
        this._sharedObjects.delete(key);
        return this;
    }

    hasSharedObject(key) {
        return this._sharedObjects.has(key);
    }

    _sharedObject(keyPath, value = undefined) {
        const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
        if (value !== undefined) {
            updateProperty(this._sharedObjects, path, value);
            return this;
        }
        return getProperty(this._sharedObjects, path);
    }

    encode() {
        return {
            userInteractionEnabled: this._userInteractionEnabled,
            canBecomeFirstResponder: this._canBecomeFirstResponder
        };
    }

    static decode(data) {
        const responder = new UIResponder();
        responder._userInteractionEnabled = data.userInteractionEnabled ?? true;
        responder._canBecomeFirstResponder = data.canBecomeFirstResponder ?? true;
        return responder;
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

    matchResponder(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        return Switch(predicate)
            .case({ firstResponder: true }, () => this._isFirstResponder)
            .case({ firstResponder: false }, () => !this._isFirstResponder)
            .case({ canBecomeFirstResponder: true }, () => this._canBecomeFirstResponder)
            .case({ canBecomeFirstResponder: false }, () => !this._canBecomeFirstResponder)
            .case({ enabled: true }, () => this._userInteractionEnabled)
            .case({ enabled: false }, () => !this._userInteractionEnabled)
            .case({ hasNextResponder: true }, () => this._nextResponder !== null)
            .case({ hasNextResponder: false }, () => this._nextResponder === null)
            .default(() => false)
            .evaluate();
    }
}

export default UIResponder;