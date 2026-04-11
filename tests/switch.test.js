import { describe, it } from 'node:test';
import assert from 'node:assert';
import Switch, { 
    ClosedRange,
    HalfOpenRange,
    RangePattern, 
    TuplePattern, 
    TypePattern, 
    ValueBindingPattern 
} from '../src/core/Switch.js';
import PatternMatcher, {
    range,
    halfOpenRange,
    match,
    casePattern,
    wildcard,
    any,
    isType,
    asType,
    valueCase,
    indirect
} from '../src/core/PatternMatching.js';

describe('Switch', () => {
    describe('Basic Matching', () => {
        it('should match exact values', () => {
            const result = Switch(5)
                .case(5, () => 'five')
                .case(10, () => 'ten')
                .default(() => 'other')
                .evaluate();
            assert.strictEqual(result, 'five');
        });

        it('should match string values', () => {
            const result = Switch('hello')
                .case('hello', () => 'greeting')
                .case('bye', () => 'farewell')
                .default(() => 'unknown')
                .evaluate();
            assert.strictEqual(result, 'greeting');
        });

        it('should use wildcard to match any value', () => {
            const result = Switch(42)
                .case(1, () => 'one')
                .case(Switch.Wildcard, () => 'anything')
                .evaluate();
            assert.strictEqual(result, 'anything');
        });
    });

    describe('Range Patterns', () => {
        it('should match closed range', () => {
            const result = Switch(5)
                .case(Switch.closedRange(1, 10), () => 'in range')
                .default(() => 'out of range')
                .evaluate();
            assert.strictEqual(result, 'in range');
        });

        it('should not match value outside closed range', () => {
            const result = Switch(15)
                .case(Switch.closedRange(1, 10), () => 'in range')
                .default(() => 'out of range')
                .evaluate();
            assert.strictEqual(result, 'out of range');
        });

        it('should match half-open range', () => {
            const result = Switch(9)
                .case(Switch.halfOpenRange(1, 10), () => 'in range')
                .default(() => 'out of range')
                .evaluate();
            assert.strictEqual(result, 'in range');
        });

        it('should not match upper bound in half-open range', () => {
            const result = Switch(10)
                .case(Switch.halfOpenRange(1, 10), () => 'in range')
                .default(() => 'out of range')
                .evaluate();
            assert.strictEqual(result, 'out of range');
        });
    });

    describe('Tuple Patterns', () => {
        it('should match tuple patterns', () => {
            const result = Switch([0, 0])
                .case(Switch.tuple(0, 0), () => 'origin')
                .case(Switch.tuple(Switch.Wildcard, 0), () => 'on x-axis')
                .default(() => 'somewhere')
                .evaluate();
            assert.strictEqual(result, 'origin');
        });

        it('should match tuple with wildcard', () => {
            const result = Switch([5, 0])
                .case(Switch.tuple(0, 0), () => 'origin')
                .case(Switch.tuple(Switch.Wildcard, 0), () => 'on x-axis')
                .default(() => 'somewhere')
                .evaluate();
            assert.strictEqual(result, 'on x-axis');
        });
    });

    describe('Value Binding', () => {
        it('should bind values in tuple pattern', () => {
            let boundValues = null;
            Switch([3, 4])
                .case(Switch.tuple(Switch.let('x'), Switch.let('y')), (vals) => {
                    boundValues = vals;
                    return `(${vals[0]}, ${vals[1]})`;
                })
                .evaluate();
            assert.deepStrictEqual(boundValues, [3, 4]);
        });
    });

    describe('Where Clauses', () => {
        it('should filter with where condition', () => {
            const result = Switch([3, 3])
                .caseLet(
                    Switch.tuple(Switch.let('x'), Switch.let('y')),
                    (vals) => vals[0] === vals[1],
                    (vals) => 'diagonal'
                )
                .case(Switch.Wildcard, () => 'not diagonal')
                .evaluate();
            assert.strictEqual(result, 'diagonal');
        });

        it('should not match where condition fails', () => {
            const result = Switch([3, 4])
                .caseLet(
                    Switch.tuple(Switch.let('x'), Switch.let('y')),
                    (vals) => vals[0] === vals[1],
                    (vals) => 'diagonal'
                )
                .case(Switch.Wildcard, () => 'not diagonal')
                .evaluate();
            assert.strictEqual(result, 'not diagonal');
        });
    });

    describe('Enum Cases', () => {
        it('should match enum cases', () => {
            const result = Switch({ name: 'success', associated: 'Done' })
                .case(valueCase('success', Switch.let('msg')), (val) => `Success: ${val}`)
                .case(valueCase('failure', Switch.let('err')), (val) => `Failure: ${val}`)
                .evaluate();
            assert.strictEqual(result, 'Success: Done');
        });
    });

    describe('Type Patterns', () => {
        it('should match type with is pattern', () => {
            const result = Switch(42)
                .case(isType('number'), () => 'is number')
                .case(isType('string'), () => 'is string')
                .default(() => 'unknown')
                .evaluate();
            assert.strictEqual(result, 'is number');
        });

        it('should match string type', () => {
            const result = Switch('hello')
                .case(isType('number'), () => 'is number')
                .case(isType('string'), () => 'is string')
                .default(() => 'unknown')
                .evaluate();
            assert.strictEqual(result, 'is string');
        });
    });

    describe('Expression Syntax', () => {
        it('should work as expression', () => {
            const score = 85;
            const grade = Switch(score)
                .case(Switch.closedRange(90, 100), () => 'A')
                .case(Switch.closedRange(80, 89), () => 'B')
                .case(Switch.closedRange(70, 79), () => 'C')
                .default(() => 'F')
                .evaluate();
            assert.strictEqual(grade, 'B');
        });
    });
});

describe('PatternMatcher', () => {
    describe('Basic Matching', () => {
        it('should match using function', () => {
            assert.strictEqual(match(42, 42), true);
            assert.strictEqual(match(42, 'string'), false);
        });
    });

    describe('Range Matching', () => {
        it('should match closed range', () => {
            const r = range(1, 10);
            assert.strictEqual(match(5, r), true);
            assert.strictEqual(match(0, r), false);
            assert.strictEqual(match(11, r), false);
        });

        it('should match half-open range', () => {
            const r = halfOpenRange(1, 10);
            assert.strictEqual(match(9, r), true);
            assert.strictEqual(match(10, r), false);
        });
    });

    describe('Type Patterns', () => {
        it('should match types with isType', () => {
            assert.strictEqual(match(42, isType('number')), true);
            assert.strictEqual(match('hi', isType('number')), false);
        });

        it('should match types with asType', () => {
            assert.strictEqual(match('hi', asType('string')), true);
            assert.strictEqual(match(42, asType('string')), false);
        });
    });

    describe('Wildcard and Any', () => {
        it('should wildcard match anything', () => {
            assert.strictEqual(match(42, wildcard()), true);
            assert.strictEqual(match('string', wildcard()), true);
            assert.strictEqual(match(null, wildcard()), true);
        });
    });

    describe('Case Patterns', () => {
        it('should match multiple values', () => {
            const pattern = casePattern(1, 2, 3);
            assert.strictEqual(match(2, pattern), true);
            assert.strictEqual(match(5, pattern), false);
        });
    });
});

describe('Range Classes', () => {
    describe('ClosedRange', () => {
        it('should contain values within bounds', () => {
            const r = new ClosedRange(1, 10);
            assert.strictEqual(r.contains(1), true);
            assert.strictEqual(r.contains(10), true);
            assert.strictEqual(r.contains(5), true);
            assert.strictEqual(r.contains(0), false);
            assert.strictEqual(r.contains(11), false);
        });

        it('should be iterable', () => {
            const r = new ClosedRange(1, 3);
            const values = [...r];
            assert.deepStrictEqual(values, [1, 2, 3]);
        });
    });

    describe('HalfOpenRange', () => {
        it('should contain values from lower to upper-1', () => {
            const r = new HalfOpenRange(1, 10);
            assert.strictEqual(r.contains(1), true);
            assert.strictEqual(r.contains(9), true);
            assert.strictEqual(r.contains(10), false);
        });
    });
});

describe('Pattern Matching Integration', () => {
    it('should work with Swift-like switch syntax', () => {
        const point = { x: 5, y: 5 };

        const result = Switch(point)
            .case({ x: 0, y: 0 }, () => 'origin')
            .case({ x: Switch.Wildcard, y: 0 }, () => 'on x-axis')
            .case(({ x, y }) => x === y, () => 'diagonal')
            .default(() => 'somewhere else')
            .evaluate();

        assert.strictEqual(result, 'diagonal');
    });

    it('should handle complex nested patterns', () => {
        const nested = {
            type: 'user',
            data: {
                name: 'John',
                age: 30
            }
        };

        const result = Switch(nested)
            .case({ type: 'user', data: { name: Switch.let('n'), age: Switch.let('a') } }, 
                  (bound) => `${bound.name} is ${bound.age}`)
            .case({ type: 'post', data: Switch.let('content') }, 
                  (c) => `Post: ${c}`)
            .default(() => 'unknown')
            .evaluate();

        assert.strictEqual(result, 'John is 30');
    });
});
