class NSObject {
    constructor() {
        this._hash = NSObject._nextHash++;
        this._description = null;
        this._observers = new Map();
        this._keyPaths = new Map();
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
        return this;
    }

    release() {
        return this;
    }

    autorelease() {
        return this;
    }

    addObserver(observer, keyPath, options = {}) {
        if (!this._observers.has(keyPath)) {
            this._observers.set(keyPath, []);
        }
        const observers = this._observers.get(keyPath);
        if (!observers.find(o => o.observer === observer)) {
            observers.push({
                observer,
                options: {
                    newValue: true,
                    oldValue: false,
                    ...options
                }
            });
        }
        if (!this._keyPaths.has(keyPath)) {
            this._keyPaths.set(keyPath, this._getValueForKeyPath(keyPath));
        }
    }

    removeObserver(observer, keyPath) {
        if (this._observers.has(keyPath)) {
            this._observers.set(keyPath, 
                this._observers.get(keyPath).filter(o => o.observer !== observer)
            );
        }
    }

    removeAllObservers() {
        this._observers.clear();
    }

    willChangeValue(keyPath) {
        if (this._observers.has(keyPath)) {
            this._keyPaths.set(keyPath, this._getValueForKeyPath(keyPath));
        }
    }

    didChangeValue(keyPath) {
        if (this._observers.has(keyPath)) {
            const newValue = this._getValueForKeyPath(keyPath);
            const oldValue = this._keyPaths.get(keyPath);
            const observers = this._observers.get(keyPath);
            
            for (const { observer, options } of observers) {
                const change = {
                    object: this,
                    keyPath,
                    newValue: options.newValue ? newValue : undefined,
                    oldValue: options.oldValue ? oldValue : undefined
                };
                
                if (observer.observeValueForKeyPath) {
                    observer.observeValueForKeyPath(change);
                } else if (typeof observer === 'function') {
                    observer(change);
                }
            }
        }
    }

    _getValueForKeyPath(keyPath) {
        const keys = keyPath.split('.');
        let value = this;
        for (const key of keys) {
            if (value === null || value === undefined) return undefined;
            value = value[key];
        }
        return value;
    }

    _setValueForKeyPath(keyPath, value) {
        const keys = keyPath.split('.');
        const lastKey = keys.pop();
        let target = this;
        
        for (const key of keys) {
            if (target === null || target === undefined) return;
            target = target[key];
        }
        
        if (target !== null && target !== undefined) {
            target[lastKey] = value;
        }
    }

    static keyPathsForValuesAffecting(keyPath) {
        return new Set();
    }

    static setKeysTriggeringNotificationsForKeyValueObserving(keys) {}
}

export default NSObject;
