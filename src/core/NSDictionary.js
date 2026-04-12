import NSObject from './NSObject.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch, ifLet, guardLet } from './PatternMatching.js';

class NSDictionary extends NSObject {
    constructor(keyValuePairs = {}) {
        super();
        this._dict = keyValuePairs instanceof NSDictionary ? 
            new Map(keyValuePairs._dict) : 
            new Map(Object.entries(keyValuePairs || {}));
    }

    static dictionaryWithObject(object, forKey) {
        const dict = new NSDictionary();
        dict._dict.set(forKey, object);
        return dict;
    }

    static dictionaryWithObjects(objects, forKeys) {
        const dict = new NSDictionary();
        objects.forEach((object, index) => {
            dict._dict.set(forKeys[index], object);
        });
        return dict;
    }

    static dictionaryWithDictionary(dict) {
        return new NSDictionary(dict);
    }

    get count() {
        return this._dict.size;
    }

    get length() {
        return this._dict.size;
    }

    get allKeys() {
        return new NSArray(Array.from(this._dict.keys()));
    }

    get allValues() {
        return new NSArray(Array.from(this._dict.values()));
    }

    objectForKey(key) {
        return this._dict.has(key) ? this._dict.get(key) : null;
    }

    objectForKeyedSubscript(key) {
        return this.objectForKey(key);
    }

    valueForKey(key) {
        if (this._dict.has(key)) {
            return this._dict.get(key);
        }
        return null;
    }

    containsKey(key) {
        return this._dict.has(key);
    }

    containsValue(value) {
        return Array.from(this._dict.values()).some(v => {
            if (v === value) return true;
            if (v && typeof v.isEqual === 'function') return v.isEqual(value);
            return v === value;
        });
    }

    keyEnumerator() {
        return Array.from(this._dict.keys())[Symbol.iterator]();
    }

    objectEnumerator() {
        return Array.from(this._dict.values())[Symbol.iterator]();
    }

    allKeysForObject(value) {
        const keys = [];
        for (const [key, val] of this._dict) {
            if (val === value || (val && typeof val.isEqual === 'function' && val.isEqual(value))) {
                keys.push(key);
            }
        }
        return new NSArray(keys);
    }

    keysSortedByValueUsingSelector(selector) {
        const entries = Array.from(this._dict.entries());
        entries.sort((a, b) => a[1][selector](b[1]));
        return new NSArray(entries.map(e => e[0]));
    }

    keysSortedByValueUsingComparator(comparator) {
        const entries = Array.from(this._dict.entries());
        entries.sort((a, b) => comparator(a[1], b[1]));
        return new NSArray(entries.map(e => e[0]));
    }

    dictionaryWithDictionary(dict) {
        return NSDictionary.dictionaryWithDictionary(dict);
    }

    subDictionaryWithKeys(keysArray) {
        const result = {};
        for (const key of keysArray) {
            if (this._dict.has(key)) {
                result[key] = this._dict.get(key);
            }
        }
        return new NSDictionary(result);
    }

    writeToFile(path, atomically = true) {
        const data = JSON.stringify(this.toObject(), null, atomically ? 2 : 0);
        return data;
    }

    toObject() {
        const obj = {};
        for (const [key, value] of this._dict) {
            if (value && typeof value.toObject === 'function') {
                obj[key] = value.toObject();
            } else if (value instanceof NSDictionary) {
                obj[key] = value.toObject();
            } else if (value instanceof NSArray) {
                obj[key] = value.toArray();
            } else {
                obj[key] = value;
            }
        }
        return obj;
    }

    toString() {
        const entries = [];
        for (const [key, value] of this._dict) {
            const valueStr = value && typeof value.description === 'string' ? 
                value.description : String(value);
            entries.push(`${key}: ${valueStr}`);
        }
        return `{${entries.join(', ')}}`;
    }

    get description() {
        return this.toString();
    }

    [Symbol.iterator]() {
        return this._dict[Symbol.iterator]();
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
                .case({ count: Switch.let('n') }, (m) => this.count === m.n)
                .case({ isEmpty: true }, () => this.count === 0)
                .case({ isEmpty: false }, () => this.count > 0)
                .case({ hasKey: Switch.let('key') }, (m) => this.containsKey(m.key))
                .case({ hasValue: Switch.let('val') }, (m) => this.containsValue(m.val))
                .default(() => false)
                .evaluate();
        }
        return false;
    }
}

export { NSDictionary };
export default NSDictionary;
