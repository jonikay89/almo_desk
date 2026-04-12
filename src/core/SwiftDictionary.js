import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch, ifLet, guardLet } from './PatternMatching.js';

class SwiftDictionary extends Map {
    constructor(entries = []) {
        if (entries instanceof Map) {
            super(entries);
        } else if (Array.isArray(entries)) {
            super(entries);
        } else if (entries && typeof entries === 'object') {
            super(Object.entries(entries));
        } else {
            super();
        }
    }

    static() {
        return new SwiftDictionary();
    }

    static keyValue(key, value) {
        const dict = new SwiftDictionary();
        dict[key] = value;
        return dict;
    }

    static keysValues(keys, values) {
        const dict = new SwiftDictionary();
        keys.forEach((key, index) => {
            dict[key] = values[index];
        });
        return dict;
    }

    get count() {
        return this.size;
    }

    get isEmpty() {
        return this.size === 0;
    }

    get keys() {
        return new SwiftArray(...Array.from(super.keys()));
    }

    get values() {
        return new SwiftArray(...Array.from(super.values()));
    }

    get elements() {
        return new SwiftArray(...Array.from(super.entries()).map(([k, v]) => new SwiftArray([k, v])));
    }

    subscript(key) {
        return this.has(key) ? this.get(key) : null;
    }

    subscriptWithDefault(key, defaultValue) {
        return this.has(key) ? this.get(key) : defaultValue;
    }

    updateValueForKey(value, key) {
        const oldValue = this.get(key);
        this.set(key, value);
        return oldValue ?? null;
    }

    removeValueForKey(key) {
        const value = this.get(key);
        this.delete(key);
        return value ?? null;
    }

    removeAll() {
        this.clear();
    }

    merge(other, combine) {
        const result = new SwiftDictionary(this);
        for (const [key, value] of other) {
            if (result.has(key) && combine) {
                result.set(key, combine(result.get(key), value));
            } else {
                result.set(key, value);
            }
        }
        return result;
    }

    merging(other, combine) {
        const result = new SwiftDictionary(this);
        for (const [key, value] of other) {
            if (result.has(key) && combine) {
                result.set(key, combine(result.get(key), value));
            } else {
                result.set(key, value);
            }
        }
        return result;
    }

    map(transform) {
        const result = [];
        for (const [key, value] of this) {
            result.push(transform(key, value));
        }
        return new SwiftDictionary(result);
    }

    mapValues(transform) {
        const result = new SwiftDictionary();
        for (const [key, value] of this) {
            result.set(key, transform(value));
        }
        return result;
    }

    filter(isIncluded) {
        const result = new SwiftDictionary();
        for (const [key, value] of this) {
            if (isIncluded(key, value)) {
                result.set(key, value);
            }
        }
        return result;
    }

    contains(predicate) {
        for (const [key, value] of this) {
            if (predicate(key, value)) return true;
        }
        return false;
    }

    forEach(body) {
        for (const [key, value] of this) {
            body(key, value);
        }
    }

    reduce(initialResult, nextPartialResult) {
        let result = initialResult;
        for (const [key, value] of this) {
            result = nextPartialResult(result, key, value);
        }
        return result;
    }

    first(predicate) {
        for (const [key, value] of this) {
            if (predicate(key, value)) {
                return { key, value };
            }
        }
        return null;
    }

    firstKey(predicate) {
        for (const [key, value] of this) {
            if (predicate(key, value)) return key;
        }
        return null;
    }

    firstValue(predicate) {
        for (const [key, value] of this) {
            if (predicate(key, value)) return value;
        }
        return null;
    }

    sortedBy(areInIncreasingOrder) {
        const entries = Array.from(super.entries()).sort((a, b) => 
            areInIncreasingOrder(a[0], b[0], a[1], b[1])
        );
        return new SwiftArray(...entries.map(([k, v]) => new SwiftArray([k, v])));
    }

    sortedKeysBy(areInIncreasingOrder) {
        const keys = Array.from(super.keys()).sort((a, b) => 
            areInIncreasingOrder(a, b)
        );
        return new SwiftArray(...keys);
    }

    sortedValuesBy(areInIncreasingOrder) {
        const values = Array.from(super.values()).sort((a, b) => 
            areInIncreasingOrder(a, b)
        );
        return new SwiftArray(...values);
    }

    keysSortedByValue(areInIncreasingOrder) {
        const entries = Array.from(super.entries()).sort((a, b) => 
            areInIncreasingOrder(a[1], b[1])
        );
        return new SwiftArray(...entries.map(([k]) => k));
    }

    toObject() {
        const obj = {};
        for (const [key, value] of this) {
            obj[key] = value;
        }
        return obj;
    }

    toString() {
        const entries = [];
        for (const [key, value] of this) {
            const valueStr = value && typeof value.toString === 'function' ? 
                value.toString() : String(value);
            entries.push(`${String(key)}: ${valueStr}`);
        }
        return `[${entries.join(', ')}]`;
    }

    get description() {
        return this.toString();
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

    switch() {
        return Switch(this);
    }

    patternMatch(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        if (typeof predicate === 'object' && predicate !== null) {
            return Switch(predicate)
                .case({ count: Switch.let('n') }, (m) => this.size === m.n)
                .case({ isEmpty: true }, () => this.size === 0)
                .case({ isEmpty: false }, () => this.size > 0)
                .case({ hasKey: Switch.let('key') }, (m) => this.has(m.key))
                .case({ hasValue: Switch.let('val') }, (m) => Array.from(this.values()).includes(m.val))
                .default(() => false)
                .evaluate();
        }
        return false;
    }
}

class KeyValuePairs extends SwiftDictionary {
    constructor(entries = []) {
        super(entries);
    }

    static of(keyValuePairs) {
        return new KeyValuePairs(keyValuePairs);
    }

    toArray() {
        return new SwiftArray(...Array.from(super.entries()).map(([k, v]) => 
            new SwiftArray([k, v])
        ));
    }
}

export { SwiftDictionary, KeyValuePairs };
export default SwiftDictionary;
