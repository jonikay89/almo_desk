import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch, ifLet, guardLet } from './PatternMatching.js';

class SwiftSet extends Set {
    constructor(iterable = []) {
        if (iterable instanceof SwiftSet) {
            super(iterable);
        } else if (iterable && iterable[Symbol.iterator]) {
            super(iterable);
        } else {
            super();
        }
    }

    static() {
        return new SwiftSet();
    }

    static elements(...elements) {
        return new SwiftSet(elements);
    }

    get count() {
        return this.size;
    }

    get isEmpty() {
        return this.size === 0;
    }

    contains(element) {
        return super.has(element);
    }

    intersect(other) {
        const result = new SwiftSet();
        for (const element of this) {
            if (other.has(element)) {
                result.add(element);
            }
        }
        return result;
    }

    intersection(other) {
        return this.intersect(other);
    }

    union(other) {
        const result = new SwiftSet(this);
        for (const element of other) {
            result.add(element);
        }
        return result;
    }

    subtracting(other) {
        const result = new SwiftSet(this);
        for (const element of other) {
            result.delete(element);
        }
        return result;
    }

    subtract(other) {
        for (const element of other) {
            this.delete(element);
        }
        return this;
    }

    symmetricDifference(other) {
        const result = new SwiftSet(this);
        for (const element of other) {
            if (result.has(element)) {
                result.delete(element);
            } else {
                result.add(element);
            }
        }
        return result;
    }

    exclusiveOr(other) {
        return this.symmetricDifference(other);
    }

    isSubsetOf(other) {
        for (const element of this) {
            if (!other.has(element)) return false;
        }
        return true;
    }

    isSubsetOfSet(other) {
        return this.isSubsetOf(other);
    }

    isSupersetOf(other) {
        for (const element of other) {
            if (!this.has(element)) return false;
        }
        return true;
    }

    isSupersetOfSet(other) {
        return this.isSupersetOf(other);
    }

    isDisjointWith(other) {
        for (const element of this) {
            if (other.has(element)) return false;
        }
        return true;
    }

    isDisjointWithSet(other) {
        return this.isDisjointWith(other);
    }

    isStrictSubsetOf(other) {
        return this.isSubsetOf(other) && this.size < other.size;
    }

    isStrictSubsetOfSet(other) {
        return this.isStrictSubsetOf(other);
    }

    isStrictSupersetOf(other) {
        return this.isSupersetOf(other) && this.size > other.size;
    }

    isStrictSupersetOfSet(other) {
        return this.isStrictSupersetOf(other);
    }

    filter(isIncluded) {
        const result = new SwiftSet();
        for (const element of this) {
            if (isIncluded(element)) {
                result.add(element);
            }
        }
        return result;
    }

    map(transform) {
        const result = new SwiftSet();
        for (const element of this) {
            result.add(transform(element));
        }
        return result;
    }

    flatMap(transform) {
        const result = new SwiftSet();
        for (const element of this) {
            const mapped = transform(element);
            if (mapped && mapped[Symbol.iterator]) {
                for (const item of mapped) {
                    result.add(item);
                }
            } else {
                result.add(mapped);
            }
        }
        return result;
    }

    forEach(body) {
        super.forEach(body);
    }

    reduce(initialResult, nextPartialResult) {
        let result = initialResult;
        for (const element of this) {
            result = nextPartialResult(result, element);
        }
        return result;
    }

    allSatisfy(predicate) {
        for (const element of this) {
            if (!predicate(element)) return false;
        }
        return true;
    }

    noneSatisfy(predicate) {
        for (const element of this) {
            if (predicate(element)) return false;
        }
        return true;
    }

    someSatisfy(predicate) {
        for (const element of this) {
            if (predicate(element)) return true;
        }
        return false;
    }

    first() {
        const first = this.values().next().value;
        return first !== undefined ? first : null;
    }

    insert(element) {
        const existed = this.has(element);
        this.add(element);
        return { existed, element };
    }

    remove(element) {
        const existed = this.has(element);
        this.delete(element);
        return existed ? element : null;
    }

    toggle(element) {
        if (this.has(element)) {
            this.delete(element);
        } else {
            this.add(element);
        }
    }

    formUnion(other) {
        for (const element of other) {
            this.add(element);
        }
    }

    formIntersection(other) {
        const toRemove = [];
        for (const element of this) {
            if (!other.has(element)) {
                toRemove.push(element);
            }
        }
        toRemove.forEach(e => this.delete(e));
    }

    formSymmetricDifference(other) {
        for (const element of other) {
            if (this.has(element)) {
                this.delete(element);
            } else {
                this.add(element);
            }
        }
    }

    toArray() {
        return new SwiftArray(...Array.from(this));
    }

    toString() {
        const items = Array.from(this).map(item => {
            if (item && typeof item.toString === 'function') return item.toString();
            return String(item);
        });
        return `{${items.join(', ')}}`;
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
                .case({ contains: Switch.let('item') }, (m) => this.has(m.item))
                .default(() => false)
                .evaluate();
        }
        return false;
    }
}

class OptionSet {
    constructor(rawValue = 0) {
        this._rawValue = rawValue;
    }

    get rawValue() {
        return this._rawValue;
    }

    contains(option) {
        return (this._rawValue & option.rawValue) === option.rawValue;
    }

    intersection(other) {
        return this._rawValue & other.rawValue;
    }

    union(other) {
        return this._rawValue | other.rawValue;
    }

    subtracting(other) {
        return this._rawValue & ~other.rawValue;
    }

    symmetricDifference(other) {
        return this._rawValue ^ other.rawValue;
    }

    static() {
        return new this(0);
    }
}

export { SwiftSet, OptionSet };
export default SwiftSet;
