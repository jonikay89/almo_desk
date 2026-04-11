class ClosedRange {
    constructor(lower, upper) {
        this.lower = lower;
        this.upper = upper;
    }

    contains(value) {
        return value >= this.lower && value <= this.upper;
    }

    *[Symbol.iterator]() {
        for (let i = this.lower; i <= this.upper; i++) {
            yield i;
        }
    }
}

class HalfOpenRange {
    constructor(lower, upper) {
        this.lower = lower;
        this.upper = upper;
    }

    contains(value) {
        return value >= this.lower && value < this.upper;
    }

    *[Symbol.iterator]() {
        for (let i = this.lower; i < this.upper; i++) {
            yield i;
        }
    }
}

class RangePattern {
    constructor(range, inverted = false) {
        this.range = range;
        this.inverted = inverted;
    }

    matches(value) {
        if (typeof value !== 'number') return false;
        if (this.range instanceof ClosedRange) {
            return value >= this.range.lower && value <= this.range.upper;
        }
        if (this.range instanceof HalfOpenRange) {
            return value >= this.range.lower && value < this.range.upper;
        }
        return false;
    }
}

class TuplePattern {
    constructor(patterns) {
        this.patterns = patterns;
    }
}

class TypePattern {
    constructor(type, checkType = 'is') {
        this.type = type;
        this.checkType = checkType;
    }
}

class ValueBindingPattern {
    constructor(variableName = null) {
        this.variableName = variableName;
    }
}

class SwitchClass {
    constructor(value) {
        this._value = value;
        this._cases = [];
        this._exhaustive = false;
    }

    case(pattern, handler) {
        const isValueBinding = this.#detectValueBinding(pattern);
        this._cases.push({ pattern, handler, isDefault: false, isValueBinding });
        return this;
    }

    #detectValueBinding(pattern) {
        if (pattern instanceof ValueBindingPattern) return true;
        if (pattern instanceof TuplePattern) {
            return pattern.patterns.some(p => this.#detectValueBinding(p));
        }
        if (Array.isArray(pattern)) {
            return pattern.some(p => this.#detectValueBinding(p));
        }
        if (pattern && pattern.__enumCase) {
            return this.#detectValueBinding(pattern.associated);
        }
        if (pattern && typeof pattern === 'object' && pattern.constructor === Object) {
            return Object.values(pattern).some(v => this.#detectValueBinding(v));
        }
        return false;
    }

    caseLet(pattern, whereCondition, handler) {
        this._cases.push({ pattern, handler, whereCondition, isDefault: false, isValueBinding: true });
        return this;
    }

    default(handler) {
        this._cases.push({ pattern: SwitchClass.Wildcard, handler, isDefault: true });
        return this;
    }

    exhaustive() {
        this._exhaustive = true;
        return this;
    }

    evaluate() {
        for (const caseItem of this._cases) {
            if (caseItem.isDefault) {
                return caseItem.handler();
            }

            if (SwitchClass.match(this._value, caseItem.pattern)) {
                if (caseItem.whereCondition) {
                    const boundValues = SwitchClass.extractBoundValues(this._value, caseItem.pattern);
                    if (!caseItem.whereCondition(boundValues)) {
                        continue;
                    }
                }
                if (caseItem.isValueBinding) {
                    const boundValues = SwitchClass.extractBoundValues(this._value, caseItem.pattern);
                    return caseItem.handler(boundValues);
                }
                return caseItem.handler();
            }
        }

        if (this._exhaustive) {
            throw new Error(`Non-exhaustive switch: no matching case for ${JSON.stringify(this._value)}`);
        }

        return undefined;
    }

    static match(value, pattern) {
        if (pattern === SwitchClass.Wildcard || pattern === '_') {
            return true;
        }

        if (pattern === SwitchClass.Any) {
            return true;
        }

        if (pattern instanceof RangePattern) {
            return pattern.matches(value);
        }

        if (pattern instanceof ClosedRange) {
            return pattern.contains(value);
        }

        if (pattern instanceof HalfOpenRange) {
            return pattern.contains(value);
        }

        if (pattern instanceof TuplePattern) {
            if (!Array.isArray(value) || value.length !== pattern.patterns.length) {
                return false;
            }
            return pattern.patterns.every((p, i) => SwitchClass.match(value[i], p));
        }

        if (pattern instanceof TypePattern) {
            if (pattern.checkType === 'is') {
                return typeof value === pattern.type;
            }
            if (pattern.checkType === 'as') {
                return typeof value === pattern.type;
            }
        }

        if (pattern instanceof ValueBindingPattern) {
            return true;
        }

        if (Array.isArray(pattern)) {
            if (!Array.isArray(value) || value.length !== pattern.length) {
                return false;
            }
            return pattern.every((p, i) => SwitchClass.match(value[i], p));
        }

        if (typeof pattern === 'function') {
            return pattern(value);
        }

        if (typeof pattern === 'number' || typeof pattern === 'string' || typeof pattern === 'boolean') {
            return value === pattern;
        }

        if (value && typeof value === 'object') {
            if (pattern.__enumCase) {
                return SwitchClass.matchEnum(value, pattern);
            }

            if (pattern.constructor && value.constructor &&
                pattern.constructor.name !== 'Object' &&
                pattern.constructor.name !== value.constructor.name) {
                return false;
            }

            if (pattern.constructor?.name === value.constructor?.name) {
                if (pattern.constructor.name === 'Object' || pattern.constructor.name === undefined) {
                    return Object.keys(pattern).every(key => 
                        key in value && SwitchClass.match(value[key], pattern[key])
                    );
                }
            }
        }

        return value === pattern;
    }

    static extractBoundValues(value, pattern) {
        if (pattern === SwitchClass.Wildcard || pattern === '_' || pattern === SwitchClass.Any) {
            return value;
        }

        if (pattern instanceof ValueBindingPattern) {
            return value;
        }

        if (pattern.__enumCase) {
            if (pattern.associated instanceof ValueBindingPattern) {
                return value.associated;
            }
            if (Array.isArray(pattern.associated)) {
                const result = [];
                pattern.associated.forEach((p, i) => {
                    if (p instanceof ValueBindingPattern) {
                        result.push(value.associated[i]);
                    }
                });
                return result;
            }
            return value.associated;
        }

        if (pattern instanceof TuplePattern) {
            if (!Array.isArray(value)) return {};
            const result = [];
            pattern.patterns.forEach((p, i) => {
                if (p instanceof ValueBindingPattern) {
                    result.push(value[i]);
                }
            });
            return result;
        }

        if (Array.isArray(pattern) && Array.isArray(value)) {
            const result = {};
            pattern.forEach((p, i) => {
                if (p instanceof ValueBindingPattern) {
                    result[p.variableName || `value${i}`] = value[i];
                }
            });
            return result;
        }

        if (pattern && typeof pattern === 'object' && pattern.constructor === Object) {
            const result = {};
            Object.keys(pattern).forEach(key => {
                if (pattern[key] instanceof ValueBindingPattern) {
                    result[key] = value[key];
                } else if (pattern[key] && typeof pattern[key] === 'object') {
                    const nestedResult = SwitchClass.extractBoundValues(value[key], pattern[key]);
                    if (nestedResult && typeof nestedResult === 'object' && !Array.isArray(nestedResult)) {
                        Object.assign(result, nestedResult);
                    }
                }
            });
            return result;
        }

        return value;
    }

    static matchEnum(value, pattern) {
        if (!value || typeof value !== 'object') return false;
        if (!pattern.__enumCase) return false;
        
        if (value.constructor?.name !== pattern.name) {
            if (value.constructor?.name !== pattern.name && 
                !value.name?.startsWith(pattern.name)) {
                return false;
            }
        }

        if (pattern.associated !== null && pattern.associated !== undefined) {
            if (Array.isArray(pattern.associated)) {
                if (!Array.isArray(value.associated)) return false;
                if (pattern.associated.length !== value.associated.length) return false;
                return pattern.associated.every((p, i) => 
                    SwitchClass.match(value.associated[i], p)
                );
            }
            if (typeof pattern.associated === 'function') {
                return pattern.associated(value.associated);
            }
            return SwitchClass.match(value.associated, pattern.associated);
        }

        return true;
    }
}

function Switch(value) {
    return new SwitchClass(value);
}

Switch.Wildcard = Symbol('wildcard');
Switch.Any = Symbol('any');
Switch.Class = SwitchClass;
SwitchClass.Wildcard = Switch.Wildcard;
SwitchClass.Any = Switch.Any;

Switch.RangePattern = RangePattern;
Switch.TuplePattern = TuplePattern;
Switch.TypePattern = TypePattern;
Switch.ValueBindingPattern = ValueBindingPattern;
Switch.ClosedRange = ClosedRange;
Switch.HalfOpenRange = HalfOpenRange;

Switch.range = (lower, upper) => new ClosedRange(lower, upper);
Switch.rangeTo = (lower, upper) => new HalfOpenRange(lower, upper);
Switch.closedRange = (lower, upper) => new ClosedRange(lower, upper);
Switch.halfOpenRange = (lower, upper) => new HalfOpenRange(lower, upper);

Switch.is = (type) => new TypePattern(type, 'is');
Switch.as = (type) => new TypePattern(type, 'as');
Switch.let = (name) => new ValueBindingPattern(name);
Switch._ = Switch.Wildcard;

Switch.tuple = (...patterns) => new TuplePattern(patterns);

Switch.tupleOf = (values) => {
    return values.map(v => v);
};

function caseOf(...values) {
    return values;
}

Switch.caseOf = caseOf;

Switch.ismatch = (value, pattern) => {
    return SwitchClass.match(value, pattern);
};

function where(condition) {
    return { where: condition };
}

Switch.where = where;

Switch.enumCase = (name, associated = null) => {
    return {
        __enumCase: true,
        name,
        associated
    };
};

Switch.matchEnum = SwitchClass.matchEnum;

Switch.extractEnum = (value) => {
    if (!value || typeof value !== 'object') return null;
    if (value.associated !== undefined) {
        return {
            name: value.name,
            associated: value.associated
        };
    }
    return {
        name: value.constructor?.name || value.name,
        associated: null
    };
};

function indirectEnum(cases) {
    return cases;
}

Switch.indirect = indirectEnum;

function expression(value) {
    return new SwitchClass(value);
}

Switch.expr = expression;
Switch.switch = expression;

function match(value) {
    return new SwitchClass(value);
}

Switch.matchValue = match;

export {
    Switch,
    Switch as default,
    ClosedRange,
    HalfOpenRange,
    RangePattern,
    TuplePattern,
    TypePattern,
    ValueBindingPattern
};
