import NSObject from './NSObject.js';

class NSArray extends NSObject {
    constructor(objects = []) {
        super();
        this._array = Array.isArray(objects) ? [...objects] : [];
    }

    get count() {
        return this._array.length;
    }

    get length() {
        return this._array.length;
    }

    get firstObject() {
        return this._array[0] || null;
    }

    get lastObject() {
        return this._array[this._array.length - 1] || null;
    }

    objectAtIndex(index) {
        if (index < 0 || index >= this._array.length) return null;
        return this._array[index];
    }

    objectAtIndexedSubscript(index) {
        return this.objectAtIndex(index);
    }

    containsObject(object) {
        return this._array.some(item => this.#objectsAreEqual(item, object));
    }

    indexOfObject(object) {
        const index = this._array.findIndex(item => this.#objectsAreEqual(item, object));
        return index === -1 ? NSNotFound : index;
    }

    indexOfObjectIdenticalTo(object) {
        const index = this._array.findIndex(item => item === object);
        return index === -1 ? NSNotFound : index;
    }

    firstObjectCommonWithArray(array) {
        for (const item of this._array) {
            if (array.containsObject(item)) {
                return item;
            }
        }
        return null;
    }

    arrayByAddingObject(object) {
        return new NSArray([...this._array, object]);
    }

    arrayByAddingObjectsFromArray(array) {
        return new NSArray([...this._array, ...array._array]);
    }

    subarrayWithRange(range) {
        const { location, length } = range;
        if (location < 0 || location + length > this._array.length) {
            return new NSArray();
        }
        return new NSArray(this._array.slice(location, location + length));
    }

    componentsJoinedByString(separator) {
        return this._array.join(separator);
    }

    enumerateObjectsUsingBlock(block) {
        this._array.forEach((object, index) => {
            block(object, index);
        });
    }

    sortedArrayUsingFunction(function_) {
        const sorted = [...this._array].sort(function_);
        return new NSArray(sorted);
    }

    sortedArrayUsingSelector(selector) {
        const sorted = [...this._array].sort((a, b) => {
            return a[selector](b);
        });
        return new NSArray(sorted);
    }

    valueForKey(key) {
        return new NSArray(this._array.map(item => item?.[key]));
    }

    objectsAtIndexes(indexes) {
        return new NSArray(indexes.map(i => this._array[i]).filter(Boolean));
    }

    #objectsAreEqual(a, b) {
        if (a === b) return true;
        if (a && typeof a.isEqual === 'function') return a.isEqual(b);
        if (b && typeof b.isEqual === 'function') return b.isEqual(a);
        return a === b;
    }

    [Symbol.iterator]() {
        return this._array[Symbol.iterator]();
    }

    toArray() {
        return [...this._array];
    }

    toString() {
        return `[${this._array.map(item => {
            if (item && typeof item.description === 'string') return item.description;
            return String(item);
        }).join(', ')}]`;
    }

    get description() {
        return this.toString();
    }
}

const NSNotFound = -1;

export { NSArray, NSNotFound };
export default NSArray;
