class PropertyPolicy {
    constructor() {
        this._frozen = false;
        this._immutableKeys = new Set();
    }

    static let(target, key, descriptor) {
        if (descriptor) {
            Object.defineProperty(target, key, descriptor);
            return descriptor;
        }
        
        return function(target, key, descriptor) {
            const originalDescriptor = descriptor || Object.getOwnPropertyDescriptor(target, key);
            if (originalDescriptor && originalDescriptor.set) {
                const getter = originalDescriptor.get;
                const set = originalDescriptor.set;
                Object.defineProperty(target, key, {
                    get: getter,
                    set: undefined,
                    enumerable: originalDescriptor.enumerable,
                    configurable: originalDescriptor.configurable
                });
            }
            return descriptor;
        };
    }

    static var(target, key, descriptor) {
        return descriptor || Object.getOwnPropertyDescriptor(target, key);
    }

    static frozen(target) {
        if (typeof target === 'function') {
            const original = target;
            function FrozenClass(...args) {
                const instance = new original(...args);
                return Object.freeze(instance);
            }
            FrozenClass.prototype = original.prototype;
            return FrozenClass;
        }
        return Object.freeze(target);
    }

    freeze() {
        this._frozen = true;
    }

    isFrozen() {
        return this._frozen;
    }

    markImmutable(key) {
        this._immutableKeys.add(key);
    }

    isImmutable(key) {
        return this._immutableKeys.has(key);
    }

    assertMutable(key) {
        if (this._frozen || this._immutableKeys.has(key)) {
            throw new Error(`Cannot mutate immutable property: ${String(key)}`);
        }
    }
}

Object.defineProperty(PropertyPolicy, 'let', {
    value: function(target, key, descriptor) {
        if (descriptor) {
            const d = Object.assign({}, descriptor);
            delete d.set;
            d.configurable = false;
            Object.defineProperty(target, key, d);
            return d;
        }
        return function(target, key, descriptor) {
            const original = descriptor || Object.getOwnPropertyDescriptor(target, key);
            if (original && original.set) {
                const getter = original.get;
                Object.defineProperty(target, key, {
                    get: getter,
                    set: undefined,
                    enumerable: original.enumerable,
                    configurable: false
                });
            }
            return descriptor;
        };
    },
    writable: false,
    configurable: false
});

Object.defineProperty(PropertyPolicy, 'var', {
    value: function(target, key, descriptor) {
        return descriptor || Object.getOwnPropertyDescriptor(target, key);
    },
    writable: false,
    configurable: false
});

export default PropertyPolicy;
export { PropertyPolicy };
