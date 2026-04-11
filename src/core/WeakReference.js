class WeakRef {
    constructor(target) {
        this._target = target;
        this._id = WeakRef._nextId++;
        if (target && typeof target._addWeakRef === 'function') {
            target._addWeakRef(this);
        }
    }

    get target() {
        return this._target;
    }

    get isValid() {
        return this._target !== null && this._target !== undefined;
    }

    getOrNull() {
        return this._target;
    }

    clear() {
        if (this._target && typeof this._target._removeWeakRef === 'function') {
            this._target._removeWeakRef(this);
        }
        this._target = null;
    }

    toString() {
        return `WeakRef(${this._id}): ${this._target ? 'valid' : 'nil'}`;
    }
}

WeakRef._nextId = 0;

class ReferenceManager {
    constructor() {
        this._strongRefs = new Set();
        this._weakRefs = new Set();
        this._deallocated = false;
    }

    addStrongRef(obj) {
        if (this._deallocated) return;
        this._strongRefs.add(obj);
    }

    removeStrongRef(obj) {
        this._strongRefs.delete(obj);
        if (this._strongRefs.size === 0 && this._weakRefs.size === 0) {
            this._deallocate();
        }
    }

    _addWeakRef(weakRef) {
        if (this._deallocated) return;
        this._weakRefs.add(weakRef);
    }

    _removeWeakRef(weakRef) {
        this._weakRefs.delete(weakRef);
        if (this._strongRefs.size === 0 && this._weakRefs.size === 0) {
            this._deallocate();
        }
    }

    _deallocate() {
        this._deallocated = true;
        for (const weakRef of this._weakRefs) {
            weakRef._target = null;
        }
        this._weakRefs.clear();
        this._strongRefs.clear();
    }

    get isDeallocated() {
        return this._deallocated;
    }

    get strongRefCount() {
        return this._strongRefs.size;
    }

    get weakRefCount() {
        return this._weakRefs.size;
    }
}

class WeakMap {
    constructor() {
        this._map = new Map();
    }

    set(key, value) {
        if (value instanceof WeakRef) {
            const refs = this._map.get(key);
            if (refs) {
                refs.add(value);
            } else {
                this._map.set(key, new Set([value]));
            }
        } else {
            const ref = new WeakRef(value);
            const refs = this._map.get(key);
            if (refs) {
                refs.add(ref);
            } else {
                this._map.set(key, new Set([ref]));
            }
        }
    }

    get(key) {
        const refs = this._map.get(key);
        if (!refs) return undefined;
        for (const ref of refs) {
            if (ref.isValid) {
                return ref.target;
            }
        }
        return undefined;
    }

    has(key) {
        const refs = this._map.get(key);
        if (!refs) return false;
        for (const ref of refs) {
            if (ref.isValid) {
                return true;
            }
        }
        return false;
    }

    delete(key) {
        const refs = this._map.get(key);
        if (refs) {
            for (const ref of refs) {
                ref.clear();
            }
            refs.clear();
            this._map.delete(key);
        }
    }

    cleanup() {
        for (const [key, refs] of this._map) {
            for (const ref of refs) {
                if (!ref.isValid) {
                    refs.delete(ref);
                }
            }
            if (refs.size === 0) {
                this._map.delete(key);
            }
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

    has(value) {
        for (const ref of this._set) {
            if (ref.target === value && ref.isValid) {
                return true;
            }
        }
        return false;
    }

    delete(value) {
        for (const ref of this._set) {
            if (ref.target === value) {
                ref.clear();
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

    cleanup() {
        for (const ref of this._set) {
            if (!ref.isValid) {
                this._set.delete(ref);
            }
        }
    }

    [Symbol.iterator]() {
        return this._getIterator();
    }

    *_getIterator() {
        for (const ref of this._set) {
            if (ref.isValid) {
                yield ref.target;
            }
        }
    }
}

export {
    WeakRef,
    ReferenceManager,
    WeakMap,
    WeakSet
};

export default {
    WeakRef,
    ReferenceManager,
    WeakMap,
    WeakSet
};
