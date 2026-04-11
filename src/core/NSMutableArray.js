import NSArray from './NSArray.js';

class NSMutableArray extends NSArray {
    constructor(objects = []) {
        super(objects);
    }

    addObject(object) {
        this._array.push(object);
    }

    addObjectsFromArray(array) {
        this._array.push(...array._array);
    }

    insertObject(object, atIndex) {
        if (atIndex < 0 || atIndex > this._array.length) return;
        this._array.splice(atIndex, 0, object);
    }

    insertObjects(objects, atIndexes) {
        if (!objects || !atIndexes) return;
        atIndexes.forEach((index, i) => {
            this.insertObject(objects[i], index);
        });
    }

    removeLastObject() {
        this._array.pop();
    }

    removeObjectAtIndex(index) {
        if (index < 0 || index >= this._array.length) return;
        this._array.splice(index, 1);
    }

    removeObjectsAtIndexes(indexes) {
        const sortedIndexes = [...indexes].sort((a, b) => b - a);
        sortedIndexes.forEach(index => {
            this.removeObjectAtIndex(index);
        });
    }

    replaceObjectAtIndex(index, withObject) {
        if (index < 0 || index >= this._array.length) return;
        this._array[index] = withObject;
    }

    replaceObjectsAtIndexes(indexes, withObjects) {
        indexes.forEach((index, i) => {
            this.replaceObjectAtIndex(index, withObjects[i]);
        });
    }

    setArray(array) {
        this._array = [...array._array];
    }

    exchangeObjectAtIndex(index1, withObjectAtIndex) {
        if (index1 < 0 || index1 >= this._array.length) return;
        if (withObjectAtIndex < 0 || withObjectAtIndex >= this._array.length) return;
        const temp = this._array[index1];
        this._array[index1] = this._array[withObjectAtIndex];
        this._array[withObjectAtIndex] = temp;
    }

    removeAllObjects() {
        this._array = [];
    }

    removeObject(object) {
        this._array = this._array.filter(item => !this.#objectsAreEqual(item, object));
    }

    removeObjectsInArray(array) {
        this._array = this._array.filter(item => !array.containsObject(item));
    }

    removeObjectsInRange(range) {
        const { location, length } = range;
        const end = location + length;
        this._array = this._array.filter((_, index) => index < location || index >= end);
    }

    addObjectsFromArray(array) {
        this._array.push(...array._array);
    }

    sortUsingFunction(function_) {
        this._array.sort(function_);
    }

    sortUsingSelector(selector) {
        this._array.sort((a, b) => a[selector](b));
    }

    sortUsingDescriptors(descriptors) {
        let sorted = [...this._array];
        descriptors._array.slice().reverse().forEach(descriptor => {
            const key = descriptor._key;
            const ascending = descriptor._ascending;
            sorted.sort((a, b) => {
                const valA = a[key];
                const valB = b[key];
                if (valA < valB) return ascending ? -1 : 1;
                if (valA > valB) return ascending ? 1 : -1;
                return 0;
            });
        });
        this._array = sorted;
    }

    #objectsAreEqual(a, b) {
        if (a === b) return true;
        if (a && typeof a.isEqual === 'function') return a.isEqual(b);
        if (b && typeof b.isEqual === 'function') return b.isEqual(a);
        return a === b;
    }
}

export default NSMutableArray;
