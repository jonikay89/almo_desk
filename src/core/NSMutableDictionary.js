import NSDictionary from './NSDictionary.js';

class NSMutableDictionary extends NSDictionary {
    constructor(keyValuePairs = {}) {
        super(keyValuePairs);
    }

    static dictionary() {
        return new NSMutableDictionary();
    }

    setObject(object, forKey) {
        if (forKey !== undefined && forKey !== null) {
            this._dict.set(forKey, object);
        }
    }

    setValue(value, forKey) {
        this._dict.set(forKey, value);
    }

    removeObjectForKey(key) {
        this._dict.delete(key);
    }

    removeObjectsForKeys(keys) {
        for (const key of keys) {
            this._dict.delete(key);
        }
    }

    addEntriesFromDictionary(dict) {
        if (dict instanceof NSDictionary) {
            for (const [key, value] of dict._dict) {
                this._dict.set(key, value);
            }
        } else if (dict && typeof dict === 'object') {
            Object.entries(dict).forEach(([key, value]) => {
                this._dict.set(key, value);
            });
        }
    }

    setDictionary(dict) {
        this._dict.clear();
        this.addEntriesFromDictionary(dict);
    }

    removeAllObjects() {
        this._dict.clear();
    }

    setObjectForKey(object, key) {
        this.setObject(object, key);
    }

    forKey(key) {
        return this.objectForKey(key);
    }
}

export default NSMutableDictionary;
