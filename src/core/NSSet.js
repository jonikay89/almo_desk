import NSObject from './NSObject.js';
import NSArray from './NSArray.js';

class NSSet extends NSObject {
    constructor(objects = []) {
        super();
        this._objects = [];
        this._hashMap = new Map();
        if (objects) {
            if (objects instanceof NSSet) {
                for (const obj of objects) {
                    this.addObject(obj);
                }
            } else if (Array.isArray(objects)) {
                objects.forEach(obj => this.addObject(obj));
            } else if (objects[Symbol.iterator]) {
                for (const obj of objects) {
                    this.addObject(obj);
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
        return this._objects.length;
    }

    get length() {
        return this._objects.length;
    }

    allObjects() {
        return new NSArray(this._objects.slice());
    }

    anyObject() {
        return this._objects[0] || null;
    }

    containsObject(object) {
        const hash = this._computeHash(object);
        const existingHash = this._hashMap.get(hash);
        if (!existingHash) return false;
        
        for (const obj of existingHash) {
            if (this._objectsAreEqual(obj, object)) return true;
        }
        return false;
    }

    intersectsSet(otherSet) {
        for (const obj of this._objects) {
            if (otherSet.containsObject(obj)) return true;
        }
        return false;
    }

    isEqualToSet(otherSet) {
        if (this._objects.length !== otherSet._objects.length) return false;
        return this.isSubsetOfSet(otherSet);
    }

    isSubsetOfSet(otherSet) {
        for (const obj of this._objects) {
            if (!otherSet.containsObject(obj)) return false;
        }
        return true;
    }

    member(object) {
        const hash = this._computeHash(object);
        const existingHash = this._hashMap.get(hash);
        if (!existingHash) return null;
        
        for (const obj of existingHash) {
            if (this._objectsAreEqual(obj, object)) return obj;
        }
        return null;
    }

    setByAddingObject(object) {
        const newSet = new NSSet(this);
        newSet.addObject(object);
        return newSet;
    }

    setByAddingObjectsFromSet(otherSet) {
        const newSet = new NSSet(this);
        for (const obj of otherSet) {
            newSet.addObject(obj);
        }
        return newSet;
    }

    setByAddingObjectsFromArray(array) {
        const newSet = new NSSet(this);
        array.forEach(obj => newSet.addObject(obj));
        return newSet;
    }

    addObject(object) {
        if (this.containsObject(object)) return;
        this._objects.push(object);
        const hash = this._computeHash(object);
        if (!this._hashMap.has(hash)) {
            this._hashMap.set(hash, []);
        }
        this._hashMap.get(hash).push(object);
    }

    removeObject(object) {
        const hash = this._computeHash(object);
        const existingHash = this._hashMap.get(hash);
        if (!existingHash) return;
        
        for (let i = 0; i < existingHash.length; i++) {
            if (this._objectsAreEqual(existingHash[i], object)) {
                existingHash.splice(i, 1);
                break;
            }
        }
        
        this._objects = this._objects.filter(obj => !this._objectsAreEqual(obj, object));
    }

    makeObjectsPerformSelector(selector) {
        this._objects.forEach(obj => {
            if (obj && typeof obj[selector] === 'function') {
                obj[selector]();
            }
        });
    }

    makeObjectsPerformSelectorWithObject(selector, withObject) {
        this._objects.forEach(obj => {
            if (obj && typeof obj[selector] === 'function') {
                obj[selector](withObject);
            }
        });
    }

    enumerateObjectsUsingBlock(block) {
        this._objects.forEach(obj => block(obj));
    }

    objectsPassingTest(predicate) {
        const result = this._objects.filter(obj => predicate(obj));
        return new NSSet(result);
    }

    filteredSetUsingPredicate(predicate) {
        const result = this._objects.filter(obj => predicate(obj));
        return new NSSet(result);
    }

    _computeHash(object) {
        if (object && typeof object.hash === 'number') return object.hash;
        if (object && typeof object.hash === 'function') return object.hash();
        if (typeof object === 'string') {
            let hash = 0;
            for (let i = 0; i < object.length; i++) {
                const char = object.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return hash;
        }
        if (typeof object === 'number') return object ^ (object >>> 16);
        if (object === null) return 0;
        if (object === undefined) return 0;
        return typeof object;
    }

    _objectsAreEqual(a, b) {
        if (a === b) return true;
        if (a && typeof a.isEqual === 'function') return a.isEqual(b);
        if (b && typeof b.isEqual === 'function') return b.isEqual(a);
        return false;
    }

    toArray() {
        return this._objects.slice();
    }

    toString() {
        const items = this._objects.map(item => {
            if (item && typeof item.description === 'string') return item.description;
            return String(item);
        });
        return `{${items.join(', ')}}`;
    }

    get description() {
        return this.toString();
    }

    [Symbol.iterator]() {
        return this._objects[Symbol.iterator]();
    }
}

export { NSSet };
export default NSSet;
