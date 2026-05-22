import { describe, it } from 'node:test';
import assert from 'node:assert';

const PropertyPolicy = (await import('../src/core/PropertyPolicy.js')).default;
const NSObject = (await import('../src/core/NSObject.js')).default;

describe('PropertyPolicy', () => {
    describe('static let()', () => {
        it('should create non-writable property', () => {
            const obj = {};
            PropertyPolicy.let(obj, 'name', 'John');
            assert.strictEqual(obj.name, 'John');
            assert.throws(() => { obj.name = 'Jane'; }, TypeError);
        });

        it('should create non-configurable property', () => {
            const obj = {};
            PropertyPolicy.let(obj, 'id', 42);
            assert.throws(() => { delete obj.id; }, TypeError);
        });

        it('should make property enumerable', () => {
            const obj = {};
            PropertyPolicy.let(obj, 'key', 'value');
            assert.ok(Object.keys(obj).includes('key'));
        });

        it('should work with objects and arrays', () => {
            const obj = {};
            const data = [1, 2, 3];
            PropertyPolicy.let(obj, 'data', data);
            assert.deepStrictEqual(obj.data, [1, 2, 3]);
            assert.throws(() => { obj.data = []; }, TypeError);
        });

        it('should return the target', () => {
            const obj = {};
            const result = PropertyPolicy.let(obj, 'x', 1);
            assert.strictEqual(result, obj);
        });
    });

    describe('static variable()', () => {
        it('should create writable property', () => {
            const obj = {};
            PropertyPolicy.variable(obj, 'count', 0);
            assert.strictEqual(obj.count, 0);
            obj.count = 5;
            assert.strictEqual(obj.count, 5);
        });

        it('should make property enumerable', () => {
            const obj = {};
            PropertyPolicy.variable(obj, 'key', 'value');
            assert.ok(Object.keys(obj).includes('key'));
        });

        it('should support change callback', () => {
            const obj = {};
            const changes = [];
            PropertyPolicy.variable(obj, 'score', 0, (newVal, oldVal) => {
                changes.push({ newVal, oldVal });
            });
            obj.score = 10;
            obj.score = 20;
            assert.deepStrictEqual(changes, [
                { newVal: 10, oldVal: 0 },
                { newVal: 20, oldVal: 10 }
            ]);
        });

        it('should return the target', () => {
            const obj = {};
            const result = PropertyPolicy.variable(obj, 'x', 1);
            assert.strictEqual(result, obj);
        });
    });
});

describe('NSObject let/variable', () => {
    it('should declare let property on NSObject subclass', () => {
        class Person extends NSObject {
            constructor(name) {
                super();
                this.let('name', name);
            }
        }
        const p = new Person('Alice');
        assert.strictEqual(p.name, 'Alice');
        assert.throws(() => { p.name = 'Bob'; }, TypeError);
    });

    it('should declare variable property on NSObject subclass', () => {
        class Counter extends NSObject {
            constructor() {
                super();
                this.variable('count', 0);
            }
        }
        const c = new Counter();
        assert.strictEqual(c.count, 0);
        c.count = 10;
        assert.strictEqual(c.count, 10);
    });

    it('should declare variable with change callback', () => {
        class Score extends NSObject {
            constructor() {
                super();
                this._changes = [];
                this.variable('points', 0, (newVal, oldVal) => {
                    this._changes.push({ newVal, oldVal });
                });
            }
        }
        const s = new Score();
        s.points = 100;
        s.points = 200;
        assert.deepStrictEqual(s._changes, [
            { newVal: 100, oldVal: 0 },
            { newVal: 200, oldVal: 100 }
        ]);
    });

    it('should allow mixed let and variable properties', () => {
        class User extends NSObject {
            constructor(id) {
                super();
                this.let('id', id);
                this.variable('name', 'Unknown');
            }
        }
        const u = new User(1);
        assert.strictEqual(u.id, 1);
        assert.strictEqual(u.name, 'Unknown');
        assert.throws(() => { u.id = 2; }, TypeError);
        u.name = 'Alice';
        assert.strictEqual(u.name, 'Alice');
    });

    it('should chain let and variable calls', () => {
        class Config extends NSObject {
            constructor() {
                super();
                this.let('version', '1.0').variable('debug', false);
            }
        }
        const c = new Config();
        assert.strictEqual(c.version, '1.0');
        assert.strictEqual(c.debug, false);
        c.debug = true;
        assert.strictEqual(c.debug, true);
        assert.throws(() => { c.version = '2.0'; }, TypeError);
    });
});
