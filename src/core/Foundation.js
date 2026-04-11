import { hashObject } from './Protocol.js';
import Switch from './Switch.js';
import { ifCase, ifLet, guardLet, guardCase, whileCase, forCase, forCaseLet, patternMatch } from './PatternMatching.js';

const CustomStringConvertible = {
    description: {
        get() {
            return this.toString();
        }
    }
};

const RawRepresentable = {
    rawValue: {
        get() {
            return this._rawValue;
        }
    }
};

function createRawRepresentable(underlyingType) {
    return {
        init(rawValue) {
            this._rawValue = rawValue;
            return this;
        }
    };
}

const ExpressibleByStringLiteral = {
    init(stringLiteral) {
        return this.init(stringLiteral);
    }
};

const ExpressibleByNumberLiteral = {
    init(numberLiteral) {
        return this.init(numberLiteral);
    }
};

const ExpressibleByBooleanLiteral = {
    init(booleanLiteral) {
        return this.init(booleanLiteral);
    }
};

const ExpressibleByArrayLiteral = {
    init(arrayLiteral) {
        return this.init(arrayLiteral);
    }
};

const ExpressibleByDictionaryLiteral = {
    init(dictionaryLiteral) {
        return this.init(dictionaryLiteral);
    }
};

class NSValue {
    constructor(value = null, type = null) {
        this._value = value;
        this._type = type || typeof value;
    }

    static valueWithPoint(point) {
        return new NSValue({ x: point.x, y: point.y }, 'point');
    }

    static valueWithSize(size) {
        return new NSValue({ width: size.width, height: size.height }, 'size');
    }

    static valueWithRect(rect) {
        return new NSValue({ x: rect.x, y: rect.y, width: rect.width, height: rect.height }, 'rect');
    }

    get value() {
        return this._value;
    }

    get type() {
        return this._type;
    }

    pointValue() {
        if (this._type === 'point') {
            return this._value;
        }
        return { x: 0, y: 0 };
    }

    sizeValue() {
        if (this._type === 'size') {
            return this._value;
        }
        return { width: 0, height: 0 };
    }

    rectValue() {
        if (this._type === 'rect') {
            return this._value;
        }
        return { x: 0, y: 0, width: 0, height: 0 };
    }

    toString() {
        return `NSValue(${this._type}: ${JSON.stringify(this._value)})`;
    }
}

class NSNumber extends NSValue {
    constructor(value = 0) {
        super(value, 'number');
        this._numberValue = value;
    }

    static valueWithBool(bool) {
        return new NSNumber(bool ? 1 : 0);
    }

    static valueWithInteger(int) {
        return new NSNumber(int);
    }

    static valueWithDouble(double) {
        return new NSNumber(double);
    }

    get numberValue() {
        return this._numberValue;
    }

    get intValue() {
        return Math.floor(this._numberValue);
    }

    get doubleValue() {
        return this._numberValue;
    }

    get boolValue() {
        return this._numberValue !== 0;
    }

    get stringValue() {
        return String(this._numberValue);
    }

    toString() {
        return `NSNumber(${this._numberValue})`;
    }

    static of(value) {
        if (value instanceof NSNumber) return value;
        return new NSNumber(value);
    }

    patternMatch(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this._numberValue);
        }
        if (typeof predicate === 'number') {
            return this._numberValue === predicate;
        }
        if (typeof predicate === 'object' && predicate !== null) {
            return Switch(predicate)
                .case({ even: true }, () => this._numberValue % 2 === 0)
                .case({ odd: true }, () => this._numberValue % 2 !== 0)
                .case({ positive: true }, () => this._numberValue > 0)
                .case({ negative: true }, () => this._numberValue < 0)
                .case({ zero: true }, () => this._numberValue === 0)
                .case({ integer: true }, () => Number.isInteger(this._numberValue))
                .case({ float: true }, () => !Number.isInteger(this._numberValue))
                .case({ range: Switch.let('r') }, (m) => m.r.contains(this._numberValue))
                .case(Switch.let('value'), (m) => this._numberValue === m.value)
                .default(() => false)
                .evaluate();
        }
        return false;
    }

    match(predicate) {
        return this.patternMatch(predicate);
    }

    switch(pattern) {
        return Switch(this._numberValue)
            .case(pattern)
            .evaluate();
    }

    ifCase(pattern, handler) {
        return ifCase(pattern)(this._numberValue).then(handler);
    }

    guardCase(pattern) {
        return guardCase(pattern)(this._numberValue);
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
        return patternMatch(pattern, this._numberValue);
    }

    ifLet(pattern) {
        return ifLet(this._numberValue, pattern);
    }

    guardLet(pattern) {
        return guardLet(this._numberValue, pattern);
    }
}

class Data {
    constructor(bytes = []) {
        if (typeof bytes === 'string') {
            this._bytes = new TextEncoder().encode(bytes);
        } else if (bytes instanceof Uint8Array) {
            this._bytes = bytes;
        } else if (Array.isArray(bytes)) {
            this._bytes = new Uint8Array(bytes);
        } else {
            this._bytes = new Uint8Array(0);
        }
    }

    get length() {
        return this._bytes.length;
    }

    static fromString(str) {
        return new Data(new TextEncoder().encode(str));
    }

    static fromArray(arr) {
        return new Data(new Uint8Array(arr));
    }

    static empty() {
        return new Data(new Uint8Array(0));
    }

    toString(encoding = 'utf-8') {
        if (encoding === 'utf-8' || encoding === 'utf8') {
            return new TextDecoder('utf-8').decode(this._bytes);
        }
        return new TextDecoder(encoding).decode(this._bytes);
    }

    toArray() {
        return Array.from(this._bytes);
    }

    toUint8Array() {
        return this._bytes;
    }

    subdata(range) {
        const { location, length } = range;
        return new Data(this._bytes.slice(location, location + length));
    }

    appendData(otherData) {
        const newBytes = new Uint8Array(this._bytes.length + otherData.length);
        newBytes.set(this._bytes, 0);
        newBytes.set(otherData._bytes || otherData, this._bytes.length);
        this._bytes = newBytes;
    }

    rangeOfData(searchData) {
        const searchBytes = searchData._bytes || searchData;
        outer: for (let i = 0; i <= this._bytes.length - searchBytes.length; i++) {
            for (let j = 0; j < searchBytes.length; j++) {
                if (this._bytes[i + j] !== searchBytes[j]) {
                    continue outer;
                }
            }
            return { location: i, length: searchBytes.length };
        }
        return null;
    }

    base64EncodedString() {
        let binary = '';
        for (let i = 0; i < this._bytes.length; i++) {
            binary += String.fromCharCode(this._bytes[i]);
        }
        return btoa(binary);
    }

    static fromBase64EncodedString(base64String) {
        const binary = atob(base64String);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return new Data(bytes);
    }

    hash() {
        let hash = 0;
        for (let i = 0; i < this._bytes.length; i++) {
            hash = ((hash << 5) - hash) + this._bytes[i];
            hash = hash & hash;
        }
        return hash;
    }

    isEqual(other) {
        if (!(other instanceof Data)) return false;
        if (this._bytes.length !== other._bytes.length) return false;
        for (let i = 0; i < this._bytes.length; i++) {
            if (this._bytes[i] !== other._bytes[i]) return false;
        }
        return true;
    }

    toString() {
        return `Data(${this._bytes.length} bytes)`;
    }

    static empty() {
        return new Data(new Uint8Array(0));
    }

    static fromString(str) {
        return new Data(new TextEncoder().encode(str));
    }

    static fromArray(arr) {
        return new Data(new Uint8Array(arr));
    }

    patternMatch(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        if (typeof predicate === 'object' && predicate !== null) {
            return Switch(predicate)
                .case({ empty: true }, () => this._bytes.length === 0)
                .case({ length: Switch.let('len') }, (m) => this._bytes.length === m.len)
                .case({ startsWith: Switch.let('prefix') }, (m) => {
                    const prefix = m.prefix instanceof Data ? m.prefix._bytes : m.prefix;
                    if (this._bytes.length < prefix.length) return false;
                    for (let i = 0; i < prefix.length; i++) {
                        if (this._bytes[i] !== prefix[i]) return false;
                    }
                    return true;
                })
                .case({ endsWith: Switch.let('suffix') }, (m) => {
                    const suffix = m.suffix instanceof Data ? m.suffix._bytes : m.suffix;
                    if (this._bytes.length < suffix.length) return false;
                    for (let i = 0; i < suffix.length; i++) {
                        if (this._bytes[this._bytes.length - suffix.length + i] !== suffix[i]) return false;
                    }
                    return true;
                })
                .case({ contains: Switch.let('data') }, (m) => {
                    const searchData = m.data instanceof Data ? m.data._bytes : m.data;
                    return this.rangeOfData(searchData) !== null;
                })
                .default(() => false)
                .evaluate();
        }
        return false;
    }

    match(predicate) {
        return this.patternMatch(predicate);
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

    ifLet(pattern) {
        return ifLet(this, pattern);
    }

    guardLet(pattern) {
        return guardLet(this, pattern);
    }
}

class NSURL {
    constructor(urlString) {
        this._urlString = urlString;
        this._parsed = NSURL.parse(urlString);
    }

    static parse(urlString) {
        try {
            const url = new globalThis.URL(urlString);
            return {
                scheme: url.protocol.replace(':', ''),
                host: url.hostname,
                port: url.port,
                path: url.pathname,
                query: url.search,
                fragment: url.hash,
                username: url.username,
                password: url.password,
                isValid: true
            };
        } catch (e) {
            return {
                scheme: '',
                host: '',
                port: '',
                path: urlString,
                query: '',
                fragment: '',
                username: '',
                password: '',
                isValid: false,
                error: e.message
            };
        }
    }

    static fileURLWithPath(path) {
        if (path.startsWith('file://')) {
            return new NSURL(path);
        }
        return new NSURL(`file://${path}`);
    }

    get scheme() {
        return this._parsed.scheme;
    }

    get host() {
        return this._parsed.host;
    }

    get port() {
        return this._parsed.port;
    }

    get path() {
        return this._parsed.path;
    }

    get query() {
        return this._parsed.query;
    }

    get fragment() {
        return this._parsed.fragment;
    }

    get isFileURL() {
        return this._parsed.scheme === 'file';
    }

    get isValid() {
        return this._parsed.isValid;
    }

    get absoluteString() {
        return this._urlString;
    }

    get relativePath() {
        return this._parsed.path;
    }

    appendingPathComponent(component) {
        const separator = this._parsed.path.endsWith('/') ? '' : '/';
        return new NSURL(`${this._urlString}${separator}${component}`);
    }

    deletingLastPathComponent() {
        const lastSlash = this._parsed.path.lastIndexOf('/');
        if (lastSlash <= 0) {
            return new NSURL(`${this._parsed.scheme}://${this._parsed.host}/`);
        }
        return new NSURL(`${this._parsed.scheme}://${this._parsed.host}${this._parsed.path.substring(0, lastSlash)}`);
    }

    pathExtension() {
        const lastDot = this._parsed.path.lastIndexOf('.');
        if (lastDot === -1 || lastDot === 0) {
            return '';
        }
        return this._parsed.path.substring(lastDot + 1);
    }

    deletingPathExtension() {
        const lastDot = this._parsed.path.lastIndexOf('.');
        if (lastDot === -1 || lastDot === 0) {
            return this;
        }
        const newPath = this._parsed.path.substring(0, lastDot);
        return new URL(`${this._parsed.scheme}://${this._parsed.host}${newPath}`);
    }

    toString() {
        return this._urlString;
    }

    static fileURLWithPath(path) {
        if (path.startsWith('file://')) {
            return new NSURL(path);
        }
        return new NSURL(`file://${path}`);
    }

    static parse(urlString) {
        try {
            const url = new globalThis.URL(urlString);
            return {
                scheme: url.protocol.replace(':', ''),
                host: url.hostname,
                port: url.port,
                path: url.pathname,
                query: url.search,
                fragment: url.hash,
                username: url.username,
                password: url.password,
                isValid: true
            };
        } catch (e) {
            return {
                scheme: '',
                host: '',
                port: '',
                path: urlString,
                query: '',
                fragment: '',
                username: '',
                password: '',
                isValid: false,
                error: e.message
            };
        }
    }

    patternMatch(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        if (typeof predicate === 'string') {
            return Switch(predicate)
                .case('file', () => this._parsed.scheme === 'file')
                .case('http', () => this._parsed.scheme === 'http')
                .case('https', () => this._parsed.scheme === 'https')
                .case('valid', () => this._parsed.isValid)
                .case('invalid', () => !this._parsed.isValid)
                .case(Switch.let('scheme'), (m) => this._parsed.scheme === m.scheme)
                .case(Switch.let('host'), (m) => this._parsed.host === m.host)
                .default(() => false)
                .evaluate();
        }
        if (typeof predicate === 'object' && predicate !== null) {
            return Switch(predicate)
                .case({ scheme: Switch.let('s') }, (m) => this._parsed.scheme === m.s)
                .case({ host: Switch.let('h') }, (m) => this._parsed.host === m.h)
                .case({ path: Switch.let('p') }, (m) => this._parsed.path === m.p)
                .case({ isFileURL: true }, () => this._parsed.scheme === 'file')
                .case({ isValid: true }, () => this._parsed.isValid)
                .case({ isValid: false }, () => !this._parsed.isValid)
                .default(() => false)
                .evaluate();
        }
        return false;
    }

    match(predicate) {
        return this.patternMatch(predicate);
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

    ifLet(pattern) {
        return ifLet(this, pattern);
    }

    guardLet(pattern) {
        return guardLet(this, pattern);
    }
}

class Scanner {
    constructor(string) {
        this._string = string || '';
        this._index = 0;
        this._skipCharacters = new Set();
        this.locale = null;
    }

    get location() {
        return this._index;
    }

    set location(value) {
        this._index = Math.max(0, Math.min(value, this._string.length));
    }

    get charactersLeft() {
        return this._string.length - this._index;
    }

    get isAtEnd() {
        return this._index >= this._string.length;
    }

    scanString(string) {
        if (this._index + string.length > this._string.length) {
            return null;
        }
        if (this._string.substring(this._index, this._index + string.length) === string) {
            this._index += string.length;
            return string;
        }
        return null;
    }

    scanUpToString(string) {
        const foundIndex = this._string.indexOf(string, this._index);
        if (foundIndex === -1) {
            const result = this._string.substring(this._index);
            this._index = this._string.length;
            return result;
        }
        const result = this._string.substring(this._index, foundIndex);
        this._index = foundIndex;
        return result;
    }

    scanCharactersFromSet(charSet) {
        let result = '';
        while (this._index < this._string.length && charSet.has(this._string[this._index])) {
            result += this._string[this._index];
            this._index++;
        }
        return result || null;
    }

    scanUpToCharactersFromSet(charSet) {
        let result = '';
        while (this._index < this._string.length && !charSet.has(this._string[this._index])) {
            result += this._string[this._index];
            this._index++;
        }
        return result || null;
    }

    skipCharacters(charSet) {
        while (this._index < this._string.length && charSet.has(this._string[this._index])) {
            this._index++;
        }
    }

    skipSpaces() {
        this.skipCharacters(new Set([' ', '\t', '\n', '\r']));
    }

    scanInt() {
        this.skipSpaces();
        let sign = 1;
        if (this._index < this._string.length && this._string[this._index] === '-') {
            sign = -1;
            this._index++;
        } else if (this._index < this._string.length && this._string[this._index] === '+') {
            this._index++;
        }
        
        let result = '';
        while (this._index < this._string.length && /\d/.test(this._string[this._index])) {
            result += this._string[this._index];
            this._index++;
        }
        
        if (result.length === 0) {
            return null;
        }
        return parseInt(result, 10) * sign;
    }

    scanDouble() {
        this.skipSpaces();
        let sign = 1;
        if (this._index < this._string.length && this._string[this._index] === '-') {
            sign = -1;
            this._index++;
        } else if (this._index < this._string.length && this._string[this._index] === '+') {
            this._index++;
        }
        
        let result = '';
        while (this._index < this._string.length && /[\d.]/.test(this._string[this._index])) {
            if (this._string[this._index] === '.' && result.includes('.')) {
                break;
            }
            result += this._string[this._index];
            this._index++;
        }
        
        if (result.length === 0 || result === '.') {
            return null;
        }
        return parseFloat(result) * sign;
    }

    scanHexInt() {
        let result = '';
        while (this._index < this._string.length && /[0-9a-fA-F]/.test(this._string[this._index])) {
            result += this._string[this._index];
            this._index++;
        }
        if (result.length === 0) {
            return null;
        }
        return parseInt(result, 16);
    }

    scanHexDouble() {
        this.skipSpaces();
        if (this.scanString('0x') || this.scanString('0X')) {
            return this.scanHexInt();
        }
        return this.scanDouble();
    }

    reset() {
        this._index = 0;
    }

    toString() {
        return `Scanner(${this._index}/${this._string.length}) "${this._string.substring(0, 50)}..."`;
    }

    match(pattern) {
        if (typeof pattern === 'string') {
            return this.scanString(pattern) !== null;
        }
        if (typeof pattern === 'function') {
            const savedIndex = this._index;
            const result = pattern(this);
            if (result) {
                return true;
            }
            this._index = savedIndex;
            return false;
        }
        if (typeof pattern === 'object' && pattern !== null) {
            return Switch(pattern)
                .case({ type: 'int' }, () => this.scanInt() !== null)
                .case({ type: 'double' }, () => this.scanDouble() !== null)
                .case({ type: 'hex' }, () => this.scanHexInt() !== null)
                .case({ type: 'string', value: Switch.let('v') }, (m) => this.scanString(m.v) !== null)
                .case({ atEnd: true }, () => this.isAtEnd)
                .case({ notAtEnd: true }, () => !this.isAtEnd)
                .default(() => false)
                .evaluate();
        }
        return false;
    }

    expect(pattern) {
        const savedIndex = this._index;
        if (this.match(pattern)) {
            return true;
        }
        this._index = savedIndex;
        return false;
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

    ifLet(pattern) {
        return ifLet(this, pattern);
    }

    guardLet(pattern) {
        return guardLet(this, pattern);
    }
}

Scanner.whitespaceCharacterSet = new Set([' ', '\t', '\n', '\r', '\f', '\v']);
Scanner.alphanumericCharacterSet = new Set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
Scanner.hexadecimalCharacterSet = new Set('0123456789abcdefABCDEF');
Scanner.decimalDigitCharacterSet = new Set('0123456789');

class CodableEncoder {
    constructor() {
        this.output = {};
        this.CodingKeys = null;
    }

    static encoder() {
        return new CodableEncoder();
    }

    encode(value) {
        return this._encodeValue(value);
    }

    _encodeValue(value) {
        if (value === null || value === undefined) {
            return null;
        }
        if (value instanceof Data) {
            return value.base64EncodedString();
        }
        if (value instanceof Date) {
            return value.toISOString();
        }
        if (value instanceof URL) {
            return value.absoluteString;
        }
        if (typeof value === 'object' && value.constructor.name === 'Object') {
            const result = {};
            for (const [key, val] of Object.entries(value)) {
                result[key] = this._encodeValue(val);
            }
            return result;
        }
        if (Array.isArray(value)) {
            return value.map(item => this._encodeValue(item));
        }
        return value;
    }
}

class CodableDecoder {
    constructor() {
        this.CodingKeys = null;
    }

    static decoder() {
        return new CodableDecoder();
    }

    decode(type, data) {
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                return null;
            }
        }
        return this._decodeValue(type, data);
    }

    _decodeValue(type, data) {
        if (data === null || data === undefined) {
            return null;
        }
        if (type === String || type === 'String') {
            return String(data);
        }
        if (type === Number || type === 'Number') {
            return Number(data);
        }
        if (type === Boolean || type === 'Boolean') {
            return Boolean(data);
        }
        if (type === Data || type === 'Data') {
            if (typeof data === 'string') {
                return Data.fromBase64EncodedString(data);
            }
            return new Data(data);
        }
        if (type === Date || type === 'Date') {
            if (typeof data === 'string') {
                return new Date(data);
            }
            return null;
        }
        if (type === URL || type === 'URL') {
            if (typeof data === 'string') {
                return new URL(data);
            }
            return null;
        }
        if (Array.isArray(type)) {
            const [elementType] = type;
            if (Array.isArray(data)) {
                return data.map(item => this._decodeValue(elementType, item));
            }
            return [];
        }
        if (typeof type === 'function') {
            const instance = new type();
            for (const [key, value] of Object.entries(data)) {
                if (instance.hasOwnProperty(key)) {
                    const typeInfo = instance.constructor._propertyTypes ? instance.constructor._propertyTypes[key] : null;
                    instance[key] = this._decodeValue(typeInfo || String, value);
                }
            }
            return instance;
        }
        return data;
    }
}

function encode(object) {
    return JSON.stringify(CodableEncoder.encoder().encode(object));
}

function decode(type, jsonString) {
    const data = JSON.parse(jsonString);
    return CodableDecoder.decoder().decode(type, data);
}

function Codable(target) {
    if (typeof target === 'function') {
        target.prototype.toJSON = function() {
            const result = {};
            for (const [key, value] of Object.entries(this)) {
                if (value instanceof Data) {
                    result[key] = value.base64EncodedString();
                } else if (value instanceof Date) {
                    result[key] = value.toISOString();
                } else if (value instanceof URL) {
                    result[key] = value.absoluteString;
                } else if (typeof value === 'object' && value !== null) {
                    result[key] = value.toJSON ? value.toJSON() : value;
                } else {
                    result[key] = value;
                }
            }
            return result;
        };
        return target;
    }
    return function(target) {
        Codable(target);
    };
}

class PropertyList {
    static to(object, format = 'json') {
        if (format === 'json' || format === 'plist') {
            return JSON.stringify(object, null, 2);
        }
        return encode(object);
    }

    static from(stringOrData, format = 'json') {
        try {
            if (format === 'plist') {
                return decode(Object, stringOrData);
            }
            return JSON.parse(stringOrData);
        } catch (e) {
            return null;
        }
    }
}

export {
    CustomStringConvertible,
    RawRepresentable,
    createRawRepresentable,
    ExpressibleByStringLiteral,
    ExpressibleByNumberLiteral,
    ExpressibleByBooleanLiteral,
    ExpressibleByArrayLiteral,
    ExpressibleByDictionaryLiteral,
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
};

export default {
    CustomStringConvertible,
    RawRepresentable,
    ExpressibleByStringLiteral,
    ExpressibleByNumberLiteral,
    ExpressibleByBooleanLiteral,
    ExpressibleByArrayLiteral,
    ExpressibleByDictionaryLiteral,
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
};