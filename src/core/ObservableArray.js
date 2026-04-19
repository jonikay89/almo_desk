import { Observable } from './Observable.js';

class ObservableArray extends Observable {
    constructor(items = []) {
        super([...items]);
        this._items = this._value;
    }

    get length() {
        return this._items.length;
    }

    get items() {
        return [...this._items];
    }

    [Symbol.iterator]() {
        return this._items[Symbol.iterator]();
    }

    _notifyChange(type, index, count, items) {
        const change = {
            type,
            index,
            count,
            items: items ? [...items] : undefined,
            timestamp: Date.now()
        };
        this._changeHistory.push(change);
        if (this._changeHistory.length > this._maxHistoryLength) {
            this._changeHistory.shift();
        }
        for (const subscriber of this._subscribers) {
            if (subscriber.disposed) continue;
            try {
                subscriber.callback(this._items, change);
            } catch (error) {
                console.error('ObservableArray subscriber error:', error);
            }
        }
    }

    push(...items) {
        const index = this._items.length;
        this._items.push(...items);
        this.value = this._items;
        this._notifyChange('push', index, items.length, items);
        return this._items.length;
    }

    pop() {
        if (this._items.length === 0) return undefined;
        const index = this._items.length - 1;
        const item = this._items.pop();
        this.value = this._items;
        this._notifyChange('pop', index, 1, [item]);
        return item;
    }

    shift() {
        if (this._items.length === 0) return undefined;
        const item = this._items.shift();
        this.value = this._items;
        this._notifyChange('shift', 0, 1, [item]);
        return item;
    }

    unshift(...items) {
        this._items.unshift(...items);
        this.value = this._items;
        this._notifyChange('unshift', 0, items.length, items);
        return this._items.length;
    }

    splice(index, count, ...items) {
        const removed = this._items.splice(index, count, ...items);
        this.value = this._items;
        this._notifyChange('splice', index, count, items.length > 0 ? items : undefined);
        return removed;
    }

    insert(item, index) {
        const safeIndex = Math.min(Math.max(0, index), this._items.length);
        this._items.splice(safeIndex, 0, item);
        this.value = this._items;
        this._notifyChange('insert', safeIndex, 1, [item]);
    }

    removeAt(index) {
        if (index < 0 || index >= this._items.length) return undefined;
        const removed = this._items.splice(index, 1)[0];
        this.value = this._items;
        this._notifyChange('remove', index, 1, [removed]);
        return removed;
    }

    remove(item) {
        const index = this._items.indexOf(item);
        if (index !== -1) {
            return this.removeAt(index);
        }
        return undefined;
    }

    replace(index, item) {
        if (index < 0 || index >= this._items.length) return;
        const oldItem = this._items[index];
        this._items[index] = item;
        this.value = this._items;
        this._notifyChange('replace', index, 1, [item]);
        return oldItem;
    }

    move(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this._items.length) return;
        if (toIndex < 0 || toIndex >= this._items.length) return;
        const item = this._items.splice(fromIndex, 1)[0];
        this._items.splice(toIndex, 0, item);
        this.value = this._items;
        this._notifyChange('move', toIndex, 1, [item]);
    }

    swap(index1, index2) {
        if (index1 < 0 || index1 >= this._items.length) return;
        if (index2 < 0 || index2 >= this._items.length) return;
        const temp = this._items[index1];
        this._items[index1] = this._items[index2];
        this._items[index2] = temp;
        this.value = this._items;
        this._notifyChange('swap', Math.min(index1, index2), 2, [this._items[index1], this._items[index2]]);
    }

    clear() {
        const removed = [...this._items];
        this._items.length = 0;
        this.value = this._items;
        this._notifyChange('clear', 0, removed.length, removed);
    }

    indexOf(item) {
        return this._items.indexOf(item);
    }

    includes(item) {
        return this._items.includes(item);
    }

    find(predicate) {
        return this._items.find(predicate);
    }

    findIndex(predicate) {
        return this._items.findIndex(predicate);
    }

    filter(predicate) {
        return this._items.filter(predicate);
    }

    map(fn) {
        return this._items.map(fn);
    }

    reduce(fn, initial) {
        return this._items.reduce(fn, initial);
    }

    forEach(fn) {
        return this._items.forEach(fn);
    }

    some(predicate) {
        return this._items.some(predicate);
    }

    every(predicate) {
        return this._items.every(predicate);
    }

    sort(compareFn) {
        const sorted = compareFn
            ? [...this._items].sort(compareFn)
            : [...this._items].sort();
        this._items.length = 0;
        this._items.push(...sorted);
        this.value = this._items;
        this._notifyChange('sort', 0, this._items.length, sorted);
    }

    reverse() {
        this._items.reverse();
        this.value = this._items;
        this._notifyChange('reverse', 0, this._items.length, [...this._items]);
    }

    slice(start, end) {
        return this._items.slice(start, end);
    }

    concat(...arrays) {
        return this._items.concat(...arrays);
    }

    join(separator) {
        return this._items.join(separator);
    }

    getItem(index) {
        return this._items[index];
    }

    setItem(index, item) {
        this.replace(index, item);
    }

    get changeHistory() {
        return [...this._changeHistory];
    }
}

export { ObservableArray };
export default ObservableArray;