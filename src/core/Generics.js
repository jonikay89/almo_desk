function Generic(type) {
    return function(target) {
        target._genericType = type;
        return target;
    };
}

function TypeConstraint(constraints = []) {
    return function(target, propertyKey, descriptor) {
        if (!descriptor) {
            descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
        }
        if (descriptor) {
            descriptor._typeConstraints = constraints;
        }
        return descriptor;
    };
}

function requiresType(target, methodName, index, expectedType) {
    const actualType = typeof target[methodName] === 'function' ? 
        target[methodName].toString() : typeof target[methodName];
    if (expectedType && actualType !== expectedType) {
        console.warn(`Type constraint: expected ${expectedType}, got ${actualType}`);
    }
}

class GenericBuilder {
    constructor() {
        this._typeParameters = [];
        this._constraints = {};
    }

    static create(typeParam) {
        const builder = new GenericBuilder();
        builder._typeParameters.push(typeParam);
        return builder;
    }

    static with(typeParams) {
        const builder = new GenericBuilder();
        builder._typeParameters = [...typeParams];
        return builder;
    }

    where(constraints) {
        this._constraints = { ...this._constraints, ...constraints };
        return this;
    }

    build(factoryFn) {
        return (...args) => {
            return factoryFn(this._typeParameters, this._constraints, ...args);
        };
    }
}

function createGenericClass(typeParams, classDefinition) {
    const TypeClass = function(...args) {
        this._typeArguments = typeParams;
        if (classDefinition.constructor) {
            classDefinition.constructor.apply(this, args);
        }
    };

    TypeClass.prototype = Object.create(classDefinition);

    for (const [key, value] of Object.entries(classDefinition)) {
        if (typeof value === 'function' && key !== 'constructor') {
            TypeClass.prototype[key] = function(...args) {
                return value.apply(this, args);
            };
        }
    }

    return TypeClass;
}

function createGenericFunction(typeParam, fn) {
    return function(...args) {
        return fn(...args);
    };
}

class Result {
    constructor(value, error = null) {
        this._value = value;
        this._error = error;
        this._isSuccess = error === null;
    }

    get isSuccess() {
        return this._isSuccess;
    }

    get isFailure() {
        return !this._isSuccess;
    }

    get value() {
        if (!this._isSuccess) {
            throw new Error('Cannot get value from failed Result');
        }
        return this._value;
    }

    get error() {
        return this._error;
    }

    static success(value) {
        return new Result(value, null);
    }

    static failure(error) {
        return new Result(null, error);
    }

    map(transform) {
        if (this._isSuccess) {
            return Result.success(transform(this._value));
        }
        return this;
    }

    flatMap(transform) {
        if (this._isSuccess) {
            return transform(this._value);
        }
        return this;
    }
}

class Optional {
    constructor(value) {
        this._value = value;
        this._isPresent = value !== null && value !== undefined;
    }

    get isPresent() {
        return this._isPresent;
    }

    get isEmpty() {
        return !this._isPresent;
    }

    get value() {
        if (!this._isPresent) {
            throw new Error('Cannot get value from empty Optional');
        }
        return this._value;
    }

    getOrElse(defaultValue) {
        return this._isPresent ? this._value : defaultValue;
    }

    getOrNull() {
        return this._value;
    }

    map(transform) {
        if (this._isPresent) {
            return Optional.of(transform(this._value));
        }
        return Optional.empty();
    }

    flatMap(transform) {
        if (this._isPresent) {
            return transform(this._value);
        }
        return Optional.empty();
    }

    filter(predicate) {
        if (this._isPresent && predicate(this._value)) {
            return this;
        }
        return Optional.empty();
    }

    ifPresent(action) {
        if (this._isPresent) {
            action(this._value);
        }
    }

    ifEmpty(action) {
        if (!this._isPresent) {
            action();
        }
    }

    static of(value) {
        return new Optional(value);
    }

    static empty() {
        return new Optional(null);
    }

    static fromNullable(value) {
        return new Optional(value);
    }
}

class Tuple {
    constructor(...elements) {
        this._elements = elements;
    }

    get length() {
        return this._elements.length;
    }

    get(index) {
        return this._elements[index];
    }

    forEach(action) {
        this._elements.forEach(action);
    }

    map(transform) {
        return new Tuple(...this._elements.map(transform));
    }

    toArray() {
        return this._elements.slice();
    }

    static create(...elements) {
        return new Tuple(...elements);
    }
}

function Pair(first, second) {
    return {
        first,
        second,
        swap() {
            return Pair.create(second, first);
        },
        map(transform) {
            return Pair.create(transform(first), transform(second));
        }
    };
}
Pair.create = (first, second) => ({ first, second, swap: () => Pair.create(second, first) });

class Box {
    constructor(value) {
        this._value = value;
    }

    get value() {
        return this._value;
    }

    map(transform) {
        return new Box(transform(this._value));
    }

    flatMap(transform) {
        return transform(this._value);
    }

    static of(value) {
        return new Box(value);
    }
}

function Lazy(fn) {
    let _value;
    let _evaluated = false;

    return {
        get value() {
            if (!_evaluated) {
                _value = fn();
                _evaluated = true;
            }
            return _value;
        },
        isEvaluated() {
            return _evaluated;
        },
        invalidate() {
            _evaluated = false;
            _value = undefined;
        }
    };
}

class Stack {
    constructor() {
        this._items = [];
    }

    push(item) {
        this._items.push(item);
        return this;
    }

    pop() {
        return this._items.pop();
    }

    peek() {
        return this._items[this._items.length - 1];
    }

    get isEmpty() {
        return this._items.length === 0;
    }

    get count() {
        return this._items.length;
    }

    clear() {
        this._items = [];
    }
}

class Queue {
    constructor() {
        this._items = [];
    }

    enqueue(item) {
        this._items.push(item);
        return this;
    }

    dequeue() {
        return this._items.shift();
    }

    peek() {
        return this._items[0];
    }

    get isEmpty() {
        return this._items.length === 0;
    }

    get count() {
        return this._items.length;
    }

    clear() {
        this._items = [];
    }
}

class Deque {
    constructor() {
        this._items = [];
    }

    pushFront(item) {
        this._items.unshift(item);
        return this;
    }

    pushBack(item) {
        this._items.push(item);
        return this;
    }

    popFront() {
        return this._items.shift();
    }

    popBack() {
        return this._items.pop();
    }

    peekFront() {
        return this._items[0];
    }

    peekBack() {
        return this._items[this._items.length - 1];
    }

    get isEmpty() {
        return this._items.length === 0;
    }

    get count() {
        return this._items.length;
    }
}

class PriorityQueue {
    constructor(comparator = (a, b) => a - b) {
        this._items = [];
        this._comparator = comparator;
    }

    enqueue(item) {
        this._items.push(item);
        this._bubbleUp(this._items.length - 1);
        return this;
    }

    dequeue() {
        const top = this._items[0];
        const bottom = this._items.pop();
        if (this._items.length > 0) {
            this._items[0] = bottom;
            this._bubbleDown(0);
        }
        return top;
    }

    peek() {
        return this._items[0];
    }

    get isEmpty() {
        return this._items.length === 0;
    }

    get count() {
        return this._items.length;
    }

    _bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this._comparator(this._items[index], this._items[parentIndex]) >= 0) {
                break;
            }
            [this._items[index], this._items[parentIndex]] = [this._items[parentIndex], this._items[index]];
            index = parentIndex;
        }
    }

    _bubbleDown(index) {
        const length = this._items.length;
        while (true) {
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            let smallest = index;

            if (leftChild < length && this._comparator(this._items[leftChild], this._items[smallest]) < 0) {
                smallest = leftChild;
            }
            if (rightChild < length && this._comparator(this._items[rightChild], this._items[smallest]) < 0) {
                smallest = rightChild;
            }
            if (smallest === index) {
                break;
            }
            [this._items[index], this._items[smallest]] = [this._items[smallest], this._items[index]];
            index = smallest;
        }
    }
}

export {
    Generic,
    TypeConstraint,
    requiresType,
    GenericBuilder,
    createGenericClass,
    createGenericFunction,
    Result,
    Optional,
    Tuple,
    Pair,
    Box,
    Lazy,
    Stack,
    Queue,
    Deque,
    PriorityQueue
};

export default {
    Generic,
    TypeConstraint,
    GenericBuilder,
    createGenericClass,
    createGenericFunction,
    Result,
    Optional,
    Tuple,
    Pair,
    Box,
    Lazy,
    Stack,
    Queue,
    Deque,
    PriorityQueue
};
