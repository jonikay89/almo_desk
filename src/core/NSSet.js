import NSObject from './NSObject.js';

class NSSet extends NSObject {
    constructor(objects = []) {
        super();
        this._set = new Set();
        if (objects) {
            if (objects instanceof NSSet) {
                objects._set.forEach(obj => this._set.add(obj));
            } else if (Array.isArray(objects)) {
                objects.forEach(obj => this._set.add(obj));
            } else if (objects[Symbol.iterator]) {
                for (const obj of objects) {
                    this._set.add(obj);
                }
            }
        }
    }

    static setWithObject(object) {
        return new NSSet([object]);
    }

    static setWithObjects(objects) {
        return new NSSet(objects);
    }

    static setWithSet(set) {
        return new NSSet(set);
    }

    get count() {
        return this._set.size;
    }

    get length() {
        return this._set.size;
    }

    allObjects() {
        return new NSArray(Array.from(this._set));
    }

    anyObject() {
        const first = this._set.values().next().value;
        return first !== undefined ? first : null;
    }

    containsObject(object) {
        return this.#exists(object);
    }

    intersectsSet(otherSet) {
        for (const obj of this._set) {
            if (otherSet.containsObject(obj)) return true;
        }
        return false;
    }

    isEqualToSet(otherSet) {
        if (this._set.size !== otherSet._set.size) return false;
        return this.isSubsetOfSet(otherSet);
    }

    isSubsetOfSet(otherSet) {
        for (const obj of this._set) {
            if (!otherSet.containsObject(obj)) return false;
        }
        return true;
    }

    member(object) {
        for (const obj of this._set) {
            if (this.#objectsAreEqual(obj, object)) return obj;
        }
        return null;
    }

    setByAddingObject(object) {
        const newSet = new NSSet(this);
        newSet._set.add(object);
        return newSet;
    }

    setByAddingObjectsFromSet(otherSet) {
        const newSet = new NSSet(this);
        otherSet._set.forEach(obj => newSet._set.add(obj));
        return newSet;
    }

    setByAddingObjectsFromArray(array) {
        const newSet = new NSSet(this);
        array.forEach(obj => newSet._set.add(obj));
        return newSet;
    }

    makeObjectsPerformSelector(selector) {
        this._set.forEach(obj => {
            if (obj && typeof obj[selector] === 'function') {
                obj[selector]();
            }
        });
    }

    makeObjectsPerformSelector(selector, withObject) {
        this._set.forEach(obj => {
            if (obj && typeof obj[selector] === 'function') {
                obj[selector](withObject);
            }
        });
    }

    enumerateObjectsUsingBlock(block) {
        this._set.forEach(obj => block(obj));
    }

    objectsPassingTest(predicate) {
        const result = [];
        this._set.forEach(obj => {
            if (predicate(obj)) result.push(obj);
        });
        return new NSSet(result);
    }

    filteredArrayUsingPredicate(predicate) {
        const result = [];
        this._set.forEach(obj => {
            if (predicate(obj)) result.push(obj);
        });
        return new NSSet(result);
    }

    #exists(object) {
        return this.#objectHash(object) in this._set;
    }

    #objectHash(object) {
        if (object && typeof object.hash === 'number') return object.hash;
        if (object && typeof object.hash === 'function') return object.hash();
        return object;
    }

    #objectsAreEqual(a, b) {
        if (a === b) return true;
        if (a && typeof a.isEqual === 'function') return a.isEqual(b);
        if (b && typeof b.isEqual === 'function') return b.isEqual(a);
        return a === b;
    }

    toArray() {
        return Array.from(this._set);
    }

    toString() {
        const items = Array.from(this._set).map(item => {
            if (item && typeof item.description === 'string') return item.description;
            return String(item);
        });
        return `{${items.join(', ')}}`;
    }

    get description() {
        return this.toString();
    }

    [Symbol.iterator]() {
        return this._set[Symbol.iterator]();
    }
}

export { NSSet };
export default NSSet;
