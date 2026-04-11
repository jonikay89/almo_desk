import NSSet from './NSSet.js';

class NSMutableSet extends NSSet {
    constructor(objects = []) {
        super(objects);
    }

    static set() {
        return new NSMutableSet();
    }

    addObject(object) {
        this._set.add(object);
    }

    addObjectsFromArray(array) {
        array.forEach(obj => this._set.add(obj));
    }

    removeObject(object) {
        this._set.delete(object);
    }

    removeObjectsInArray(array) {
        array.forEach(obj => this._set.delete(obj));
    }

    removeAllObjects() {
        this._set.clear();
    }

    intersectSet(otherSet) {
        const toRemove = [];
        this._set.forEach(obj => {
            if (!otherSet.containsObject(obj)) {
                toRemove.push(obj);
            }
        });
        toRemove.forEach(obj => this._set.delete(obj));
    }

    minusSet(otherSet) {
        const toRemove = [];
        this._set.forEach(obj => {
            if (otherSet.containsObject(obj)) {
                toRemove.push(obj);
            }
        });
        toRemove.forEach(obj => this._set.delete(obj));
    }

    unionSet(otherSet) {
        otherSet._set.forEach(obj => this._set.add(obj));
    }

    setSet(otherSet) {
        this._set.clear();
        otherSet._set.forEach(obj => this._set.add(obj));
    }
}

export default NSMutableSet;
