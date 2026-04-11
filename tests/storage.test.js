/**
 * Storage Utility Test Suite
 * Tests for the localStorage wrapper
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

// Create a mock localStorage for testing
let storageData = {};

const storage = {
    get(key, fallback = null) {
        try {
            const raw = storageData[key];
            return raw ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    },
    
    set(key, value) {
        try {
            storageData[key] = JSON.stringify(value);
            return true;
        } catch (e) {
            console.warn(`Storage write failed for key "${key}":`, e);
            return false;
        }
    },
    
    remove(key) {
        try {
            delete storageData[key];
        } catch {}
    }
};

describe('Storage Utility', () => {
    beforeEach(() => {
        storageData = {};
    });

    describe('storage.get', () => {
        it('should return fallback for non-existent key', () => {
            const result = storage.get('nonExistent', 'default');
            
            assert.strictEqual(result, 'default');
        });

        it('should return null fallback for non-existent key with null fallback', () => {
            const result = storage.get('nonExistent', null);
            
            assert.strictEqual(result, null);
        });

        it('should return stored string value', () => {
            storageData['testKey'] = JSON.stringify('testValue');
            
            const result = storage.get('testKey');
            
            assert.strictEqual(result, 'testValue');
        });

        it('should return stored object value', () => {
            const obj = { name: 'test', value: 123 };
            storageData['testKey'] = JSON.stringify(obj);
            
            const result = storage.get('testKey');
            
            assert.deepStrictEqual(result, obj);
        });

        it('should return stored array value', () => {
            const arr = [1, 2, 3, 'test'];
            storageData['testKey'] = JSON.stringify(arr);
            
            const result = storage.get('testKey');
            
            assert.deepStrictEqual(result, arr);
        });

        it('should return stored boolean value', () => {
            storageData['testKey'] = JSON.stringify(true);
            
            const result = storage.get('testKey');
            
            assert.strictEqual(result, true);
        });

        it('should return stored number value', () => {
            storageData['testKey'] = JSON.stringify(42.5);
            
            const result = storage.get('testKey');
            
            assert.strictEqual(result, 42.5);
        });

        it('should return fallback for invalid JSON', () => {
            storageData['testKey'] = 'not valid json {';
            
            const result = storage.get('testKey', 'fallback');
            
            assert.strictEqual(result, 'fallback');
        });

        it('should handle empty string as valid value', () => {
            storageData['testKey'] = JSON.stringify('');
            
            const result = storage.get('testKey');
            
            assert.strictEqual(result, '');
        });

        it('should handle zero as valid value', () => {
            storageData['testKey'] = JSON.stringify(0);
            
            const result = storage.get('testKey', -1);
            
            assert.strictEqual(result, 0);
        });

        it('should handle false as valid value', () => {
            storageData['testKey'] = JSON.stringify(false);
            
            const result = storage.get('testKey', true);
            
            assert.strictEqual(result, false);
        });
    });

    describe('storage.set', () => {
        it('should store string value', () => {
            const result = storage.set('key', 'value');
            
            assert.strictEqual(result, true);
            assert.strictEqual(JSON.parse(storageData['key']), 'value');
        });

        it('should store object value', () => {
            const obj = { name: 'test', nested: { a: 1 } };
            
            const result = storage.set('key', obj);
            
            assert.strictEqual(result, true);
            assert.deepStrictEqual(JSON.parse(storageData['key']), obj);
        });

        it('should store array value', () => {
            const arr = [1, 2, 3];
            
            const result = storage.set('key', arr);
            
            assert.strictEqual(result, true);
            assert.deepStrictEqual(JSON.parse(storageData['key']), arr);
        });

        it('should overwrite existing value', () => {
            storage.set('key', 'first');
            storage.set('key', 'second');
            
            assert.strictEqual(JSON.parse(storageData['key']), 'second');
        });

        it('should store null value', () => {
            const result = storage.set('key', null);
            
            assert.strictEqual(result, true);
            assert.strictEqual(JSON.parse(storageData['key']), null);
        });

        it('should store boolean false value', () => {
            const result = storage.set('key', false);
            
            assert.strictEqual(result, true);
            assert.strictEqual(JSON.parse(storageData['key']), false);
        });

        it('should store number values including zero', () => {
            storage.set('key', 0);
            
            assert.strictEqual(JSON.parse(storageData['key']), 0);
        });
    });

    describe('storage.remove', () => {
        it('should remove existing key', () => {
            storageData['key'] = JSON.stringify('value');
            
            storage.remove('key');
            
            assert.strictEqual('key' in storageData, false);
        });

        it('should not throw for non-existent key', () => {
            assert.doesNotThrow(() => {
                storage.remove('nonExistent');
            });
        });
    });

    describe('Complex Scenarios', () => {
        it('should handle window state persistence structure', () => {
            const state = {
                windows: [
                    { id: 1, title: 'Window 1', x: 100, y: 100, width: 400, height: 300, zIndex: 100 },
                    { id: 2, title: 'Window 2', x: 200, y: 200, width: 500, height: 400, zIndex: 200 }
                ],
                nextId: 3
            };
            
            storage.set('webDesktopState', state);
            const retrieved = storage.get('webDesktopState');
            
            assert.strictEqual(retrieved.windows.length, 2);
            assert.strictEqual(retrieved.nextId, 3);
            assert.strictEqual(retrieved.windows[0].title, 'Window 1');
            assert.strictEqual(retrieved.windows[1].x, 200);
        });

        it('should handle icons persistence structure', () => {
            const icons = [
                { id: 'demo1', label: 'App 1', icon: '📦', type: 'customHtml' },
                { id: 'demo2', label: 'App 2', icon: '🌐', type: 'webLink', data: { url: 'https://example.com' } }
            ];
            
            storage.set('webDesktopIcons', icons);
            const retrieved = storage.get('webDesktopIcons');
            
            assert.strictEqual(retrieved.length, 2);
            assert.strictEqual(retrieved[0].label, 'App 1');
            assert.strictEqual(retrieved[1].data.url, 'https://example.com');
        });

        it('should handle empty arrays correctly', () => {
            const windows = [];
            
            storage.set('windows', windows);
            const retrieved = storage.get('windows');
            
            assert.deepStrictEqual(retrieved, []);
            assert.ok(Array.isArray(retrieved));
        });
    });
});
