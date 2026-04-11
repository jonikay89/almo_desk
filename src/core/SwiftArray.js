class SwiftArray extends Array {
    constructor(...args) {
        super(...args);
    }

    static() {
        return new SwiftArray();
    }

    first() {
        return this[0] ?? null;
    }

    last() {
        return this[this.length - 1] ?? null;
    }

    append(element) {
        this.push(element);
        return this;
    }

    appendContentsOf(newElements) {
        this.push(...newElements);
        return this;
    }

    insertAt(element, index) {
        this.splice(index, 0, element);
        return this;
    }

    insertContentsOfAt(newElements, index) {
        this.splice(index, 0, ...newElements);
        return this;
    }

    removeAt(index) {
        if (index < 0 || index >= this.length) return null;
        const element = this[index];
        this.splice(index, 1);
        return element;
    }

    removeFirst() {
        return this.shift() ?? null;
    }

    removeLast() {
        return this.pop() ?? null;
    }

    removeAll(keepingCapacity = false) {
        this.length = 0;
    }

    removeSubrange(range) {
        const { start, end } = range;
        this.splice(start, end - start);
    }

    popLast() {
        return this.pop() ?? null;
    }

    popFirst() {
        return this.shift() ?? null;
    }

    contains(predicateOrElement) {
        if (typeof predicateOrElement === 'function') {
            return this.some(predicateOrElement);
        }
        return this.includes(predicateOrElement);
    }

    firstIndex(predicate) {
        const index = this.findIndex(predicate);
        return index === -1 ? null : index;
    }

    lastIndex(predicate) {
        const index = this.findLastIndex(predicate);
        return index === -1 ? null : index;
    }

    indexOfElement(element) {
        const index = this.indexOf(element);
        return index === -1 ? null : index;
    }

    filter(isIncluded) {
        return new SwiftArray(...super.filter(isIncluded));
    }

    map(transform) {
        return new SwiftArray(...super.map(transform));
    }

    reduce(initialResult, nextPartialResult) {
        return super.reduce(nextPartialResult, initialResult);
    }

    forEach(body) {
        super.forEach(body);
    }

    sortedBy(areInIncreasingOrder) {
        const sorted = [...this].sort(areInIncreasingOrder);
        return new SwiftArray(...sorted);
    }

    sorted() {
        const sorted = [...this].sort((a, b) => {
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        });
        return new SwiftArray(...sorted);
    }

    reversed() {
        return new SwiftArray(...Array.from(this).reverse());
    }

    shuffle() {
        const shuffled = [...this];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        this.length = 0;
        this.push(...shuffled);
        return this;
    }

    shuffled() {
        const shuffled = [...this];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return new SwiftArray(...shuffled);
    }

    prefix(maxLength) {
        return new SwiftArray(...this.slice(0, maxLength));
    }

    suffix(maxLength) {
        return new SwiftArray(...this.slice(-maxLength));
    }

    dropFirst(k = 1) {
        return new SwiftArray(...this.slice(k));
    }

    dropLast(k = 1) {
        return new SwiftArray(...this.slice(0, -k));
    }

    split(separator, omittingEmptySubsequences = true) {
        const result = [];
        let current = [];
        for (const item of this) {
            if (item === separator) {
                if (!omittingEmptySubsequences || current.length > 0) {
                    result.push(new SwiftArray(...current));
                }
                current = [];
            } else {
                current.push(item);
            }
        }
        if (current.length > 0 || !omittingEmptySubsequences) {
            result.push(new SwiftArray(...current));
        }
        return result;
    }

    joined(separator = '') {
        return this.join(separator);
    }

    flatMap(transform) {
        return new SwiftArray(...super.flatMap(transform));
    }

    compactMap(transform) {
        return new SwiftArray(...this.map(transform).filter(x => x != null));
    }

    count() {
        return this.length;
    }

    isEmpty() {
        return this.length === 0;
    }

    allSatisfy(predicate) {
        return this.every(predicate);
    }

    noneSatisfy(predicate) {
        return !this.some(predicate);
    }

    firstWhere(predicate) {
        return this.find(predicate) ?? null;
    }

    lastWhere(predicate) {
        return this.findLast(predicate) ?? null;
    }

    with(index, element) {
        if (index < 0 || index >= this.length) return this;
        this[index] = element;
        return this;
    }

    firstIndexOf(element) {
        const index = this.indexOf(element);
        return index === -1 ? null : index;
    }

    lastIndexOf(element) {
        const index = this.lastIndexOf(element);
        return index === -1 ? null : index;
    }

    toArray() {
        return [...this];
    }

    toString() {
        return `[${this.join(', ')}]`;
    }

    get description() {
        return this.toString();
    }
}

class ContiguousArray extends SwiftArray {
    static() {
        return new ContiguousArray();
    }
}

class ArraySlice extends SwiftArray {
    constructor(array, start, end) {
        super(...Array.from(array).slice(start, end));
        this.startIndex = start;
        this.endIndex = end;
    }

    static of(array, range) {
        return new ArraySlice(array, range.start, range.end);
    }
}

export { SwiftArray, ContiguousArray, ArraySlice };
export default SwiftArray;
