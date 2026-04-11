import { Optional, Result } from './Generics.js';
import { WeakRef, ReferenceManager, WeakMap } from './WeakReference.js';

class NSObject {
    constructor() {
        this._hash = NSObject._nextHash++;
        this._description = null;
        this._observers = new Map();
        this._keyPaths = new Map();
        this._referenceManager = new ReferenceManager();
        this._weakRefs = new WeakSet();
        this._isDeallocated = false;
    }

    get hash() {
        return this._hash;
    }

    static _nextHash = 1;

    get description() {
        return this._description || `${this.constructor.name}`;
    }

    set description(desc) {
        this._description = desc;
    }

    isEqual(object) {
        if (this === object) return true;
        if (!(object instanceof NSObject)) return false;
        return this._hash === object._hash;
    }

    hashValue() {
        return this._hash;
    }

    copy() {
        return new this.constructor();
    }

    respondsToSelector(selector) {
        return typeof this[selector] === 'function';
    }

    isKindOfClass(classRef) {
        let current = this.constructor;
        while (current) {
            if (current === classRef) return true;
            current = Object.getPrototypeOf(current);
        }
        return false;
    }

    isMemberOfClass(classRef) {
        return this.constructor === classRef;
    }

    superclass() {
        return Object.getPrototypeOf(this.constructor).prototype;
    }

    retain() {
        this._referenceManager.addStrongRef(this);
        return this;
    }

    release() {
        this._referenceManager.removeStrongRef(this);
        return this;
    }

    autorelease() {
        return this;
    }

    get isDeallocated() {
        return this._isDeallocated;
    }

    _addWeakRef(weakRef) {
        this._weakRefs.add(weakRef);
    }

    _removeWeakRef(weakRef) {
        this._weakRefs.delete(weakRef);
    }

    weakRef() {
        return new WeakRef(this);
    }

    addObserver(observer, keyPath, options = {}) {
        if (!this._observers.has(keyPath)) {
            this._observers.set(keyPath, []);
        }
        const observers = this._observers.get(keyPath);
        const observerEntry = {
            observer: observer instanceof WeakRef ? observer : new WeakRef(observer),
            options: {
                newValue: true,
                oldValue: false,
                ...options
            }
        };
        if (!observers.find(o => o.observer.target === observer)) {
            observers.push(observerEntry);
        }
        if (!this._keyPaths.has(keyPath)) {
            this._keyPaths.set(keyPath, this._getValueForKeyPath(keyPath).orNull);
        }
    }

    removeObserver(observer, keyPath) {
        if (this._observers.has(keyPath)) {
            this._observers.set(keyPath, 
                this._observers.get(keyPath).filter(o => o.observer.target !== observer)
            );
        }
    }

    removeAllObservers() {
        this._observers.clear();
    }

    willChangeValue(keyPath) {
        if (this._observers.has(keyPath)) {
            this._keyPaths.set(keyPath, this._getValueForKeyPath(keyPath).orNull);
        }
    }

    didChangeValue(keyPath) {
        if (this._observers.has(keyPath)) {
            const newValueOpt = this._getValueForKeyPath(keyPath);
            const oldValue = this._keyPaths.get(keyPath);
            const observers = this._observers.get(keyPath);
            
            for (const { observer, options } of observers) {
                if (observer.target === null) continue;
                
                const change = {
                    object: this,
                    keyPath,
                    newValue: options.newValue ? newValueOpt.orNull : undefined,
                    oldValue: options.oldValue ? oldValue : undefined
                };
                
                if (observer.target.observeValueForKeyPath) {
                    observer.target.observeValueForKeyPath(change);
                } else if (typeof observer.target === 'function') {
                    observer.target(change);
                }
            }
        }
    }

    _getValueForKeyPath(keyPath) {
        const keys = keyPath.split('.');
        let value = Optional.of(this);
        for (const key of keys) {
            if (value.isEmpty) return Optional.empty();
            value = Optional.fromNullable(value.value[key]);
        }
        return value;
    }

    _setValueForKeyPath(keyPath, value) {
        const keys = keyPath.split('.');
        const lastKey = keys.pop();
        let target = Optional.of(this);
        
        for (const key of keys) {
            if (target.isEmpty) return Result.failure(new Error('Path is nil'));
            target = Optional.fromNullable(target.value[key]);
        }
        
        if (target.isPresent) {
            target.value[lastKey] = value;
            return Result.success(target.value);
        }
        return Result.failure(new Error('Target is nil'));
    }

    static keyPathsForValuesAffecting(keyPath) {
        return new Set();
    }

    static setKeysTriggeringNotificationsForKeyValueObserving(keys) {}

    postNotificationName(name, userInfo = null) {
        NSNotificationCenter.defaultCenter().postNotificationName(name, this, userInfo);
    }

    static notificationName(name) {
        return name;
    }

    deinit() {
        this._isDeallocated = true;
        this._observers.clear();
        this._keyPaths.clear();
        for (const weakRef of this._weakRefs) {
            weakRef.clear();
        }
    }
}

class WeakSet {
    constructor() {
        this._set = new Set();
    }

    add(value) {
        const ref = value instanceof WeakRef ? value : new WeakRef(value);
        this._set.add(ref);
        return this;
    }

    delete(value) {
        for (const ref of this._set) {
            if (ref.target === value) {
                this._set.delete(ref);
                return true;
            }
        }
        return false;
    }

    get size() {
        let count = 0;
        for (const ref of this._set) {
            if (ref.isValid) count++;
        }
        return count;
    }

    *[Symbol.iterator]() {
        for (const ref of this._set) {
            if (ref.isValid) {
                yield ref.target;
            }
        }
    }
}

export default NSObject;
