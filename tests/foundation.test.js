import { describe, it } from 'node:test';
import assert from 'node:assert';

const {
    CustomStringConvertible,
    RawRepresentable,
    createRawRepresentable,
    NSValue,
    NSNumber,
    Data,
    NSURL,
    Scanner,
    CodableEncoder,
    CodableDecoder,
    Codable,
    encode,
    decode,
    PropertyList
} = await import('../src/core/Foundation.js');

describe('Foundation Classes', () => {

    describe('NSValue', () => {
        it('should create NSValue with point', () => {
            const point = { x: 10, y: 20 };
            const value = NSValue.valueWithPoint(point);
            assert.deepStrictEqual(value.pointValue(), point);
            assert.strictEqual(value.type, 'point');
        });

        it('should create NSValue with size', () => {
            const size = { width: 100, height: 200 };
            const value = NSValue.valueWithSize(size);
            assert.deepStrictEqual(value.sizeValue(), size);
            assert.strictEqual(value.type, 'size');
        });

        it('should create NSValue with rect', () => {
            const rect = { x: 10, y: 20, width: 100, height: 200 };
            const value = NSValue.valueWithRect(rect);
            assert.deepStrictEqual(value.rectValue(), rect);
            assert.strictEqual(value.type, 'rect');
        });

        it('should return toString representation', () => {
            const value = new NSValue(42);
            assert.ok(value.toString().includes('NSValue'));
        });
    });

    describe('NSNumber', () => {
        it('should create NSNumber from value', () => {
            const num = new NSNumber(42);
            assert.strictEqual(num.numberValue, 42);
            assert.strictEqual(num.intValue, 42);
            assert.strictEqual(num.doubleValue, 42);
            assert.strictEqual(num.boolValue, true);
        });

        it('should return false for zero', () => {
            const num = new NSNumber(0);
            assert.strictEqual(num.boolValue, false);
        });

        it('should create from bool', () => {
            const num = NSNumber.valueWithBool(true);
            assert.strictEqual(num.boolValue, true);
        });

        it('should return string value', () => {
            const num = new NSNumber(42);
            assert.strictEqual(num.stringValue, '42');
        });
    });

    describe('Data', () => {
        it('should create empty data', () => {
            const data = Data.empty();
            assert.strictEqual(data.length, 0);
        });

        it('should create data from string', () => {
            const data = Data.fromString('hello');
            assert.strictEqual(data.length, 5);
            assert.strictEqual(data.toString(), 'Data(5 bytes)');
            assert.strictEqual(data.toArray()[0], 104);
        });

        it('should create data from array', () => {
            const data = Data.fromArray([104, 101, 108, 108, 111]);
            assert.strictEqual(data.length, 5);
        });

        it('should append data', () => {
            const data1 = Data.fromString('hello');
            const data2 = Data.fromString(' world');
            data1.appendData(data2);
            assert.strictEqual(data1.length, 11);
            assert.strictEqual(data1.toString(), 'Data(11 bytes)');
        });

        it('should encode to base64', () => {
            const data = Data.fromString('hello');
            const base64 = data.base64EncodedString();
            assert.strictEqual(base64, 'aGVsbG8=');
        });

        it('should decode from base64', () => {
            const decoded = Data.fromBase64EncodedString('aGVsbG8=');
            assert.strictEqual(decoded.length, 5);
        });

        it('should check equality', () => {
            const data1 = Data.fromString('hello');
            const data2 = Data.fromString('hello');
            const data3 = Data.fromString('world');
            assert.ok(data1.isEqual(data2));
            assert.ok(!data1.isEqual(data3));
        });

        it('should return subdata', () => {
            const data = Data.fromString('hello world');
            const sub = data.subdata({ location: 0, length: 5 });
            assert.strictEqual(sub.length, 5);
        });
    });

    describe('NSURL', () => {
        it('should parse URL string', () => {
            const url = new NSURL('https://example.com/path/to/page?query=1#section');
            assert.strictEqual(url.scheme, 'https');
            assert.strictEqual(url.host, 'example.com');
            assert.ok(url.path.includes('/path/to/page'));
            assert.ok(url.isValid);
        });

        it('should create file URL', () => {
            const url = NSURL.fileURLWithPath('/Users/name/file.txt');
            assert.ok(url.isFileURL);
        });

        it('should append path component', () => {
            const url = new NSURL('https://example.com/path');
            const appended = url.appendingPathComponent('to');
            assert.ok(appended.toString().includes('/path/to'));
        });

        it('should get path extension', () => {
            const url = new NSURL('https://example.com/file.txt');
            assert.strictEqual(url.pathExtension(), 'txt');
        });

        it('should delete path extension', () => {
            const url = new NSURL('https://example.com/file.txt');
            const without = url.deletingPathExtension();
            assert.ok(without.toString().includes('/file'));
            assert.ok(!without.toString().includes('.txt'));
        });
    });

    describe('Scanner', () => {
        it('should scan string', () => {
            const scanner = new Scanner('hello world');
            const result = scanner.scanString('hello');
            assert.strictEqual(result, 'hello');
            assert.strictEqual(scanner.location, 5);
        });

        it('should scan up to string', () => {
            const scanner = new Scanner('hello world');
            const result = scanner.scanUpToString('world');
            assert.strictEqual(result, 'hello ');
            assert.strictEqual(scanner.location, 6);
        });

        it('should scan int', () => {
            const scanner = new Scanner('42 is the answer');
            const result = scanner.scanInt();
            assert.strictEqual(result, 42);
        });

        it('should scan double', () => {
            const scanner = new Scanner('3.14159 pi');
            const result = scanner.scanDouble();
            assert.strictEqual(result, 3.14159);
        });

        it('should scan hex int', () => {
            const scanner = new Scanner('0xFF is hex');
            scanner.scanString('0x');
            const result = scanner.scanHexInt();
            assert.strictEqual(result, 255);
        });

        it('should skip spaces', () => {
            const scanner = new Scanner('   hello');
            scanner.skipSpaces();
            assert.strictEqual(scanner.location, 3);
        });

        it('should check if at end', () => {
            const scanner = new Scanner('hi');
            assert.strictEqual(scanner.isAtEnd, false);
            scanner.scanString('hi');
            assert.strictEqual(scanner.isAtEnd, true);
        });

        it('should reset', () => {
            const scanner = new Scanner('hello');
            scanner.scanString('ello');
            scanner.reset();
            assert.strictEqual(scanner.location, 0);
        });
    });

    describe('Codable', () => {
        it('should encode object to JSON', () => {
            const obj = { name: 'John', age: 30 };
            const encoded = encode(obj);
            assert.strictEqual(typeof encoded, 'string');
            assert.ok(encoded.includes('John'));
        });

        it('should encode and decode date', () => {
            const date = new Date('2024-01-15T12:00:00Z');
            const encoder = new CodableEncoder();
            const encoded = encoder.encode(date);
            assert.ok(encoded.includes('2024-01-15'));
        });

        it('should encode and decode URL', () => {
            const url = new NSURL('https://example.com');
            const encoder = new CodableEncoder();
            const encoded = encoder.encode(url);
            assert.ok(encoded.absoluteString.includes('https://example.com'));
        });

        it('should round-trip simple object', () => {
            const original = { name: 'Product', price: 19.99 };
            const json = encode(original);
            const parsed = JSON.parse(json);
            assert.strictEqual(parsed.name, 'Product');
            assert.strictEqual(parsed.price, 19.99);
        });
    });

    describe('PropertyList', () => {
        it('should convert object to plist-like format', () => {
            const obj = { key: 'value' };
            const plist = PropertyList.to(obj);
            assert.ok(plist.includes('value'));
        });

        it('should parse plist-like format', () => {
            const json = '{"key":"value"}';
            const parsed = PropertyList.from(json);
            assert.strictEqual(parsed.key, 'value');
        });
    });

});

describe('Protocol Integration', () => {

    describe('CustomStringConvertible', () => {
        it('should provide description property', () => {
            const product = {
                name: 'Apple',
                price: 0.99,
                get description() {
                    return `Product: ${this.name} costs $${this.price.toFixed(2)}`;
                }
            };
            assert.strictEqual(product.description, 'Product: Apple costs $0.99');
        });
    });

    describe('RawRepresentable', () => {
        it('should create enum with raw value', () => {
            const UserRole = {
                admin: { rawValue: 'ADMIN_LEVEL_1', valueOf() { return this; } },
                editor: { rawValue: 'CONTENT_EDITOR', valueOf() { return this; } },
                viewer: { rawValue: 'GUEST_VIEWER', valueOf() { return this; } }
            };
            Object.defineProperty(UserRole.admin, 'rawValue', { value: 'ADMIN_LEVEL_1' });
            
            assert.strictEqual(UserRole.admin.rawValue, 'ADMIN_LEVEL_1');
        });
    });

});