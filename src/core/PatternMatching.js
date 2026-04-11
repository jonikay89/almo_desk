import Switch, { ClosedRange, HalfOpenRange, TypePattern, ValueBindingPattern } from './Switch.js';

function ifCase(pattern) {
    return function(value) {
        return {
            then: (handler) => {
                if (patternMatch(pattern, value)) {
                    const bound = Switch.extractBoundValues(value, pattern);
                    handler(bound);
                    return true;
                }
                return false;
            },
            else: (handler) => {
                if (!patternMatch(pattern, value)) {
                    handler();
                }
            }
        };
    };
}

function ifLet(value, pattern) {
    if (value === null || value === undefined) {
        return { matched: false, value: undefined };
    }
    if (patternMatch(pattern, value)) {
        const bound = Switch.extractBoundValues(value, pattern);
        return { matched: true, value: bound };
    }
    return { matched: false, value: undefined };
}

function guardLet(value, pattern) {
    if (value === null || value === undefined) {
        return { matched: false, value: undefined };
    }
    if (patternMatch(pattern, value)) {
        const bound = Switch.extractBoundValues(value, pattern);
        return { matched: true, value: bound };
    }
    return { matched: false, value: undefined };
}

function guardCase(pattern) {
    return function(value) {
        if (patternMatch(pattern, value)) {
            const bound = Switch.extractBoundValues(value, pattern);
            return { matched: true, value: bound };
        }
        return { matched: false, value: undefined };
    };
}

function whileCase(pattern) {
    return function(iterator) {
        const result = iterator.next();
        if (result.done) return { done: true, value: undefined };
        if (patternMatch(pattern, result.value)) {
            const bound = Switch.extractBoundValues(result.value, pattern);
            return { done: false, value: bound };
        }
        return { done: false, value: undefined };
    };
}

function forCase(pattern) {
    return function(value) {
        if (patternMatch(pattern, value)) {
            return Switch.extractBoundValues(value, pattern);
        }
        return undefined;
    };
}

function forCaseLet(variableName, pattern) {
    return {
        __forCaseLet: true,
        variableName,
        pattern
    };
}

function matchIf(pattern, value, handler) {
    if (patternMatch(pattern, value)) {
        const bound = Switch.extractBoundValues(value, pattern);
        handler(bound);
        return true;
    }
    return false;
}

function matchGuard(pattern, value) {
    if (patternMatch(pattern, value)) {
        return { success: true, value: Switch.extractBoundValues(value, pattern) };
    }
    return { success: false };
}

function optionalPattern(innerPattern = Switch.Wildcard) {
    return {
        __optionalPattern: true,
        innerPattern
    };
}

function isNil(value) {
    return value === null || value === undefined;
}

function isSome(value) {
    return value !== null && value !== undefined;
}

function extractOptional(value) {
    if (value === null || value === undefined) {
        return { isSome: false, value: undefined };
    }
    return { isSome: true, value };
}

class PatternMatcher {
    constructor(pattern) {
        this.pattern = pattern;
    }

    match(value) {
        return patternMatch(this.pattern, value);
    }

    [Symbol.match](value) {
        return patternMatch(this.pattern, value);
    }
}

function patternMatch(pattern, value) {
    if (pattern === null || pattern === undefined) {
        return value === null || value === undefined;
    }

    if (pattern instanceof RegExp) {
        if (typeof value === 'string') {
            return pattern.test(value);
        }
        return false;
    }

    if (pattern instanceof Function) {
        return pattern(value);
    }

    if (pattern instanceof ClosedRangePattern) {
        return pattern.contains(value);
    }

    if (pattern instanceof HalfOpenRange) {
        return pattern.contains(value);
    }

    if (pattern instanceof TypePattern) {
        if (pattern.checkType === 'is') {
            return typeof value === pattern.type;
        }
        if (pattern.checkType === 'as') {
            return typeof value === pattern.type;
        }
    }

    if (pattern instanceof ValueBindingPattern || pattern === '_' || pattern === Switch.Wildcard) {
        return true;
    }

    if (Array.isArray(pattern) && !(value instanceof Array)) {
        return pattern.some(p => patternMatch(p, value));
    }

    if (Array.isArray(pattern) && Array.isArray(value)) {
        if (pattern.length !== value.length) return false;
        return pattern.every((p, i) => patternMatch(p, value[i]));
    }

    if (typeof pattern === 'object' && pattern !== null) {
        if (pattern.__enumCase) {
            return Switch.matchEnum(value, pattern);
        }
        if (pattern.constructor?.name === 'Object' || pattern.constructor === Object) {
            return Object.keys(pattern).every(key => 
                key in value && patternMatch(pattern[key], value[key])
            );
        }
    }

    if (typeof pattern === 'number' || typeof pattern === 'string' || typeof pattern === 'boolean') {
        return value === pattern;
    }

    return false;
}

class ClosedRangePattern {
    constructor(lower, upper) {
        this.lower = lower;
        this.upper = upper;
    }

    contains(value) {
        return value >= this.lower && value <= this.upper;
    }

    [Symbol.match](value) {
        return this.contains(value);
    }
}

function createPatternMatcher(pattern) {
    return new PatternMatcher(pattern);
}

function range(lower, upper) {
    return new ClosedRangePattern(lower, upper);
}

function halfOpenRange(lower, upper) {
    return new HalfOpenRange(lower, upper);
}

let customMatchers = new Map();

function registerMatcher(patternType, matcher) {
    customMatchers.set(patternType, matcher);
}

function match(value, pattern) {
    if (customMatchers.has(pattern.constructor || pattern)) {
        const matcher = customMatchers.get(pattern.constructor || pattern);
        return matcher(pattern, value);
    }
    return patternMatch(pattern, value);
}

function casePattern(...values) {
    return values;
}

function wildcard() {
    return Switch.Wildcard;
}

function any() {
    return Switch.Any;
}

function isType(type) {
    return new TypePattern(type, 'is');
}

function asType(type) {
    return new TypePattern(type, 'as');
}

function valueCase(name, associated = null) {
    return Switch.enumCase(name, associated);
}

function valueCasePattern(caseName, ...associatedPatterns) {
    return {
        __valueCasePattern: true,
        caseName,
        associatedPatterns,
        matches: (value) => {
            if (!value || typeof value !== 'object') return false;
            const name = value.constructor?.name || value.name;
            if (name !== caseName && !name?.startsWith(caseName)) return false;
            if (associatedPatterns.length === 0) return true;
            if (!Array.isArray(value.associated)) return false;
            if (value.associated.length !== associatedPatterns.length) return false;
            return value.associated.every((v, i) => 
                patternMatch(associatedPatterns[i], v)
            );
        }
    };
}

function extractValueCase(value) {
    if (!value || typeof value !== 'object') return null;
    return {
        name: value.constructor?.name || value.name,
        associated: value.associated || null
    };
}

function indirect(cases) {
    return {
        __indirectEnum: true,
        cases
    };
}

function matchIndirect(value, enumDef) {
    if (!enumDef.__indirectEnum) return false;
    
    for (const c of enumDef.cases) {
        if (c.associated && Array.isArray(c.associated)) {
            if (value.associated?.length !== c.associated.length) continue;
            if (value.name === c.name && 
                c.associated.every((p, i) => patternMatch(p, value.associated[i]))) {
                return true;
            }
        } else if (value.name === c.name || value.constructor?.name === c.name) {
            return true;
        }
    }
    return false;
}

function extractIndirect(value) {
    if (!value || typeof value !== 'object') return null;
    return {
        name: value.name || value.constructor?.name,
        associated: value.associated || null
    };
}

PatternMatcher.Range = ClosedRangePattern;
PatternMatcher.HalfOpenRange = HalfOpenRange;
PatternMatcher.range = range;
PatternMatcher.halfOpenRange = halfOpenRange;
PatternMatcher.registerMatcher = registerMatcher;
PatternMatcher.match = match;
PatternMatcher.patternMatch = patternMatch;
PatternMatcher.wildcard = wildcard;
PatternMatcher.any = any;
PatternMatcher.isType = isType;
PatternMatcher.asType = asType;
PatternMatcher.valueCase = valueCase;
PatternMatcher.valueCasePattern = valueCasePattern;
PatternMatcher.extractValueCase = extractValueCase;
PatternMatcher.indirect = indirect;
PatternMatcher.matchIndirect = matchIndirect;
PatternMatcher.extractIndirect = extractIndirect;
PatternMatcher.casePattern = casePattern;
PatternMatcher.ifCase = ifCase;
PatternMatcher.ifLet = ifLet;
PatternMatcher.guardLet = guardLet;
PatternMatcher.guardCase = guardCase;
PatternMatcher.whileCase = whileCase;
PatternMatcher.forCase = forCase;
PatternMatcher.forCaseLet = forCaseLet;
PatternMatcher.matchIf = matchIf;
PatternMatcher.matchGuard = matchGuard;
PatternMatcher.optionalPattern = optionalPattern;
PatternMatcher.isNil = isNil;
PatternMatcher.isSome = isSome;
PatternMatcher.extractOptional = extractOptional;

export {
    PatternMatcher,
    PatternMatcher as default,
    range,
    halfOpenRange,
    ClosedRangePattern as Range,
    HalfOpenRange,
    registerMatcher,
    match,
    casePattern,
    wildcard,
    any,
    isType,
    asType,
    valueCase,
    valueCasePattern,
    extractValueCase,
    indirect,
    matchIndirect,
    extractIndirect,
    ifCase,
    ifLet,
    guardLet,
    guardCase,
    whileCase,
    forCase,
    forCaseLet,
    matchIf,
    matchGuard,
    optionalPattern,
    isNil,
    isSome,
    extractOptional,
    patternMatch
};
