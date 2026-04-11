import { Equatable, Hashable } from './Protocol.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';

class JSONEncoder {
    constructor() {
        this._indent = null;
        this._outputFormatting = 0;
    }

    static encoder() {
        return new JSONEncoder();
    }

    set encoding(encoding) {
        this._encoding = encoding;
    }

    set indent(level) {
        this._indent = level;
    }

    encode(object) {
        if (this._indent !== null) {
            return JSON.stringify(object, null, this._indent);
        }
        return JSON.stringify(object);
    }

    encodeToString(object) {
        return this.encode(object);
    }
}

class JSONDecoder {
    constructor() {
        this._dateDecodingStrategy = 'iso8601';
    }

    static decoder() {
        return new JSONDecoder();
    }

    set dateDecodingStrategy(strategy) {
        this._dateDecodingStrategy = strategy;
    }

    decode(type, data) {
        const json = typeof data === 'string' ? JSON.parse(data) : data;
        if (json === null || json === undefined) return null;

        if (Array.isArray(json)) {
            return json.map(item => this._decodeObject(item, type));
        }

        return this._decodeObject(json, type);
    }

    _decodeObject(obj, type) {
        if (obj === null || obj === undefined) return null;

        if (type && type._isSwiftStruct) {
            const instance = new type();
            for (const key of Object.keys(obj)) {
                if (instance[key] !== undefined) {
                    instance[key] = this._decodeValue(obj[key], type._properties?.[key]);
                }
            }
            return instance;
        }

        if (type === Date) {
            return new Date(obj);
        }

        if (type === String) {
            return String(obj);
        }

        if (type === Number) {
            return Number(obj);
        }

        if (type === Boolean) {
            return Boolean(obj);
        }

        if (type === Array) {
            return Array.isArray(obj) ? obj : [obj];
        }

        if (type === Object || type === null) {
            if (typeof obj === 'object' && obj !== null) {
                const result = {};
                for (const key of Object.keys(obj)) {
                    result[key] = this._decodeValue(obj[key], null);
                }
                return result;
            }
            return obj;
        }

        return obj;
    }

    _decodeValue(value, type) {
        if (value === null || value === undefined) return null;
        return this._decodeObject(value, type);
    }

    decodeString(data) {
        return this.decode(String, data);
    }

    decodeInt(data) {
        return this.decode(Number, data);
    }

    decodeDouble(data) {
        return this.decode(Number, data);
    }

    decodeBool(data) {
        return this.decode(Boolean, data);
    }

    decodeObject(data) {
        return this.decode(Object, data);
    }
}

class NumberFormatter {
    constructor() {
        this._locale = 'en-US';
        this._numberStyle = 'decimal';
        this._minimumFractionDigits = 0;
        this._maximumFractionDigits = 2;
        this._minimum = null;
        this._maximum = null;
        this._currency = 'USD';
    }

    static formatter() {
        return new NumberFormatter();
    }

    static localizedString(fromNumber, style) {
        const formatter = new NumberFormatter();
        formatter._numberStyle = style;
        return formatter.string(fromNumber);
    }

    get locale() {
        return this._locale;
    }

    set locale(loc) {
        this._locale = loc;
    }

    get numberStyle() {
        return this._numberStyle;
    }

    set numberStyle(style) {
        this._numberStyle = style;
    }

    get minimumFractionDigits() {
        return this._minimumFractionDigits;
    }

    set minimumFractionDigits(digits) {
        this._minimumFractionDigits = digits;
    }

    get maximumFractionDigits() {
        return this._maximumFractionDigits;
    }

    set maximumFractionDigits(digits) {
        this._maximumFractionDigits = digits;
    }

    get minimum() {
        return this._minimum;
    }

    set minimum(val) {
        this._minimum = val;
    }

    get maximum() {
        return this._maximum;
    }

    set maximum(val) {
        this._maximum = val;
    }

    string(number) {
        if (this._minimum !== null && number < this._minimum) {
            number = this._minimum;
        }
        if (this._maximum !== null && number > this._maximum) {
            number = this._maximum;
        }

        const options = {
            minimumFractionDigits: this._minimumFractionDigits,
            maximumFractionDigits: this._maximumFractionDigits
        };

        switch (this._numberStyle) {
            case 'currency':
                return new Intl.NumberFormat(this._locale, { ...options, style: 'currency', currency: this._currency }).format(number);
            case 'percent':
                return new Intl.NumberFormat(this._locale, { ...options, style: 'percent' }).format(number);
            case 'scientific':
                return number.toExponential(this._maximumFractionDigits);
            case 'spellout':
                return new Intl.NumberFormat(this._locale, { style: 'spellout' }).format(number);
            default:
                return new Intl.NumberFormat(this._locale, options).format(number);
        }
    }

    number(fromString) {
        const cleaned = fromString.replace(/[^0-9.-]/g, '');
        return parseFloat(cleaned);
    }

    objectValue(forString) {
        return this.number(forString);
    }

    stringValue(forNumber) {
        return this.string(forNumber);
    }

    toString() {
        return `NumberFormatter(${this._numberStyle})`;
    }
}

class DateFormatter {
    constructor() {
        this._locale = 'en-US';
        this._dateStyle = 'medium';
        this._timeStyle = 'none';
        this._dateFormat = 'yyyy-MM-dd';
        this._timeZone = null;
    }

    static formatter() {
        return new DateFormatter();
    }

    static localizedString(date, dateStyle, timeStyle) {
        const formatter = new DateFormatter();
        formatter._dateStyle = dateStyle;
        formatter._timeStyle = timeStyle;
        return formatter.string(date);
    }

    get locale() {
        return this._locale;
    }

    set locale(loc) {
        this._locale = loc;
    }

    get dateStyle() {
        return this._dateStyle;
    }

    set dateStyle(style) {
        this._dateStyle = style;
    }

    get timeStyle() {
        return this._timeStyle;
    }

    set timeStyle(style) {
        this._timeStyle = style;
    }

    get dateFormat() {
        return this._dateFormat;
    }

    set dateFormat(format) {
        this._dateFormat = format;
    }

    get timeZone() {
        return this._timeZone;
    }

    set timeZone(tz) {
        this._timeZone = tz;
    }

    string(date) {
        const dateStyleMap = {
            'none': undefined,
            'short': 'short',
            'medium': 'medium',
            'long': 'long',
            'full': 'full'
        };
        const options = {};
        
        if (this._dateStyle && this._dateStyle !== 'none') {
            options.dateStyle = dateStyleMap[this._dateStyle] || 'medium';
        }
        if (this._timeStyle && this._timeStyle !== 'none') {
            options.timeStyle = dateStyleMap[this._timeStyle] || 'medium';
        }
        
        if (options.dateStyle || options.timeStyle) {
            if (this._timeZone) {
                options.timeZone = this._timeZone;
            }
            const nativeDate = date._date instanceof Date ? date._date : date;
            return new Intl.DateTimeFormat(this._locale, options).format(nativeDate);
        }
        return this._formatWithFormat(date);
    }

    _formatWithFormat(date) {
        const nativeDate = date._date instanceof Date ? date._date : date;
        const year = nativeDate.getFullYear();
        const month = String(nativeDate.getMonth() + 1).padStart(2, '0');
        const day = String(nativeDate.getDate()).padStart(2, '0');
        const hours = String(nativeDate.getHours()).padStart(2, '0');
        const minutes = String(nativeDate.getMinutes()).padStart(2, '0');
        const seconds = String(nativeDate.getSeconds()).padStart(2, '0');

        return this._dateFormat
            .replace('yyyy', year)
            .replace('yy', String(year).slice(-2))
            .replace('MM', month)
            .replace('dd', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    }

    date(fromString) {
        const d = new Date(fromString);
        return isNaN(d.getTime()) ? null : d;
    }

    objectValue(forString) {
        return this.date(forString);
    }

    stringValue(forDate) {
        return this.string(forDate);
    }

    toString() {
        return `DateFormatter(${this._dateFormat})`;
    }
}

class OrderedSet {
    constructor(array = []) {
        this._items = [];
        this._set = new Set();
        for (const item of array) {
            this.add(item);
        }
    }

    static of(...items) {
        return new OrderedSet(items);
    }

    static from(array) {
        return new OrderedSet(array);
    }

    get count() {
        return this._items.length;
    }

    get length() {
        return this._items.length;
    }

    get array() {
        return [...this._items];
    }

    get first() {
        return this._items[0] || null;
    }

    get last() {
        return this._items[this._items.length - 1] || null;
    }

    contains(item) {
        return this._set.has(item);
    }

    indexOf(item) {
        return this._items.indexOf(item);
    }

    add(item) {
        if (!this._set.has(item)) {
            this._items.push(item);
            this._set.add(item);
        }
        return this;
    }

    remove(item) {
        const index = this._items.indexOf(item);
        if (index !== -1) {
            this._items.splice(index, 1);
            this._set.delete(item);
        }
        return this;
    }

    insert(_item, at) {
        const item = _item;
        if (!this._set.has(item)) {
            this._items.splice(at, 0, item);
            this._set.add(item);
        }
        return this;
    }

    append(_item) {
        return this.add(_item);
    }

    appendItems(items) {
        for (const item of items) {
            this.add(item);
        }
        return this;
    }

    prepend(_item) {
        return this.insert(_item, 0);
    }

    prependItems(items) {
        for (let i = items.length - 1; i >= 0; i--) {
            this.insert(items[i], 0);
        }
        return this;
    }

    replaceItem(at, withItem) {
        if (at >= 0 && at < this._items.length) {
            const oldItem = this._items[at];
            this._items[at] = withItem;
            this._set.delete(oldItem);
            this._set.add(withItem);
        }
        return this;
    }

    filter(predicate) {
        const result = new OrderedSet();
        for (let i = 0; i < this._items.length; i++) {
            if (predicate(this._items[i], i)) {
                result.add(this._items[i]);
            }
        }
        return result;
    }

    map(transform) {
        return this._items.map(transform);
    }

    forEach(callback) {
        this._items.forEach(callback);
    }

    sort(comparator) {
        this._items.sort(comparator);
        return this;
    }

    sorted(comparator) {
        const result = new OrderedSet(this._items);
        result.sort(comparator);
        return result;
    }

    reversed() {
        return new OrderedSet([...this._items].reverse());
    }

    slice(start, end) {
        return new OrderedSet(this._items.slice(start, end));
    }

    firstIndex(where) {
        for (let i = 0; i < this._items.length; i++) {
            if (where(this._items[i])) return i;
        }
        return null;
    }

    lastIndex(where) {
        for (let i = this._items.length - 1; i >= 0; i--) {
            if (where(this._items[i])) return i;
        }
        return null;
    }

    isEqual(other) {
        if (!(other instanceof OrderedSet)) return false;
        if (this._items.length !== other._items.length) return false;
        for (let i = 0; i < this._items.length; i++) {
            if (this._items[i] !== other._items[i]) return false;
        }
        return true;
    }

    equals(other) {
        return this.isEqual(other);
    }

    hashCode() {
        let hash = 0;
        for (const item of this._items) {
            hash = (hash * 31 + (item?.hashCode?.() || 0)) | 0;
        }
        return hash;
    }

    toString() {
        return `OrderedSet(${this._items.length} items)`;
    }

    toJSON() {
        return this._items;
    }

    [Symbol.iterator]() {
        return this._items[Symbol.iterator]();
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

    ifCase(pattern, handler) {
        return ifCase(pattern)(this).then(handler);
    }

    guardCase(pattern) {
        return guardCase(pattern)(this);
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
                .case({ count: Switch.let('n') }, (m) => this._items.length === m.n)
                .case({ contains: Switch.let('item') }, (m) => this.contains(m.item))
                .case({ first: Switch.let('item') }, (m) => this.first === m.item)
                .case({ last: Switch.let('item') }, (m) => this.last === m.item)
                .case({ empty: true }, () => this._items.length === 0)
                .case({ empty: false }, () => this._items.length > 0)
                .default(() => false)
                .evaluate();
        }
        return false;
    }
}

class SortedSet {
    constructor(array = [], comparator = null) {
        this._items = [];
        this._comparator = comparator || ((a, b) => {
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        });
        for (const item of array) {
            this.add(item);
        }
    }

    static of(comparator, ...items) {
        return new SortedSet(items, comparator);
    }

    static from(array, comparator) {
        return new SortedSet(array, comparator);
    }

    get count() {
        return this._items.length;
    }

    get length() {
        return this._items.length;
    }

    get array() {
        return [...this._items];
    }

    get first() {
        return this._items[0] || null;
    }

    get last() {
        return this._items[this._items.length - 1] || null;
    }

    contains(item) {
        return this._indexOf(item) !== -1;
    }

    _indexOf(item) {
        let low = 0, high = this._items.length;
        while (low < high) {
            const mid = (low + high) >>> 1;
            const cmp = this._comparator(this._items[mid], item);
            if (cmp < 0) low = mid + 1;
            else if (cmp > 0) high = mid;
            else return mid;
        }
        return -1;
    }

    indexOf(item) {
        return this._indexOf(item);
    }

    add(item) {
        let low = 0, high = this._items.length;
        while (low < high) {
            const mid = (low + high) >>> 1;
            const cmp = this._comparator(this._items[mid], item);
            if (cmp < 0) low = mid + 1;
            else if (cmp > 0) high = mid;
            else {
                this._items[mid] = item;
                return this;
            }
        }
        this._items.splice(low, 0, item);
        return this;
    }

    remove(item) {
        const index = this._indexOf(item);
        if (index !== -1) {
            this._items.splice(index, 1);
        }
        return this;
    }

    filter(predicate) {
        const result = new SortedSet([], this._comparator);
        for (const item of this._items) {
            if (predicate(item)) {
                result.add(item);
            }
        }
        return result;
    }

    map(transform) {
        return this._items.map(transform);
    }

    forEach(callback) {
        this._items.forEach(callback);
    }

    slice(start, end) {
        return new SortedSet(this._items.slice(start, end), this._comparator);
    }

    range(from, to) {
        const fromIdx = this._indexOf(from);
        const toIdx = this._indexOf(to);
        return this.slice(
            fromIdx === -1 ? 0 : fromIdx,
            toIdx === -1 ? this._items.length : toIdx + 1
        );
    }

    isEqual(other) {
        if (!(other instanceof SortedSet)) return false;
        if (this._items.length !== other._items.length) return false;
        for (let i = 0; i < this._items.length; i++) {
            if (this._comparator(this._items[i], other._items[i]) !== 0) return false;
        }
        return true;
    }

    equals(other) {
        return this.isEqual(other);
    }

    hashCode() {
        let hash = 0;
        for (const item of this._items) {
            hash = (hash * 31 + (item?.hashCode?.() || 0)) | 0;
        }
        return hash;
    }

    toString() {
        return `SortedSet(${this._items.length} items)`;
    }

    toJSON() {
        return this._items;
    }

    [Symbol.iterator]() {
        return this._items[Symbol.iterator]();
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

    ifCase(pattern, handler) {
        return ifCase(pattern)(this).then(handler);
    }

    guardCase(pattern) {
        return guardCase(pattern)(this);
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
                .case({ count: Switch.let('n') }, (m) => this._items.length === m.n)
                .case({ contains: Switch.let('item') }, (m) => this.contains(m.item))
                .case({ first: Switch.let('item') }, (m) => this.first === m.item)
                .case({ last: Switch.let('item') }, (m) => this.last === m.item)
                .case({ empty: true }, () => this._items.length === 0)
                .default(() => false)
                .evaluate();
        }
        return false;
    }
}

class WeakDictionary {
    constructor(items = []) {
        this._keys = [];
        this._values = [];
        this._keyMap = new WeakMap();
        for (const [key, value] of items) {
            this.set(key, value);
        }
    }

    static of(...items) {
        return new WeakDictionary(items);
    }

    static from(items) {
        return new WeakDictionary(items);
    }

    get count() {
        return this._keys.length;
    }

    get size() {
        return this._keys.length;
    }

    get keys() {
        return [...this._keys];
    }

    get values() {
        return [...this._values];
    }

    get entries() {
        return this._keys.map((key, i) => [key, this._values[i]]);
    }

    has(key) {
        return this._keyMap.has(key);
    }

    get(key) {
        if (!this._keyMap.has(key)) return null;
        const index = this._keys.indexOf(key);
        return index !== -1 ? this._values[index] : null;
    }

    set(key, value) {
        if (this._keyMap.has(key)) {
            const index = this._keys.indexOf(key);
            if (index !== -1) {
                this._values[index] = value;
            }
        } else {
            this._keys.push(key);
            this._values.push(value);
            this._keyMap.set(key, this._keys.length - 1);
        }
        return this;
    }

    remove(key) {
        if (!this._keyMap.has(key)) return this;
        const index = this._keys.indexOf(key);
        if (index !== -1) {
            this._keys.splice(index, 1);
            this._values.splice(index, 1);
            this._rebuildKeyMap();
        }
        return this;
    }

    _rebuildKeyMap() {
        this._keyMap = new WeakMap();
        for (let i = 0; i < this._keys.length; i++) {
            this._keyMap.set(this._keys[i], i);
        }
    }

    update(key, updater) {
        const current = this.get(key);
        this.set(key, updater(current));
        return this;
    }

    merge(other) {
        for (const [key, value] of other.entries) {
            this.set(key, value);
        }
        return this;
    }

    filter(predicate) {
        const result = new WeakDictionary();
        for (let i = 0; i < this._keys.length; i++) {
            if (predicate(this._keys[i], this._values[i])) {
                result.set(this._keys[i], this._values[i]);
            }
        }
        return result;
    }

    map(transform) {
        return this._keys.map((key, i) => transform(key, this._values[i]));
    }

    forEach(callback) {
        for (let i = 0; i < this._keys.length; i++) {
            callback(this._keys[i], this._values[i]);
        }
    }

    toString() {
        return `WeakDictionary(${this._keys.length} items)`;
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

    ifCase(pattern, handler) {
        return ifCase(pattern)(this).then(handler);
    }

    guardCase(pattern) {
        return guardCase(pattern)(this);
    }

    matchOperator(pattern) {
        return patternMatch(pattern, this);
    }

    switch() {
        return Switch(this);
    }
}

class Regex {
    constructor(pattern, flags = '') {
        this._pattern = pattern;
        this._flags = flags;
        this._regex = new RegExp(pattern, flags);
    }

    static from(pattern, flags = '') {
        try {
            return new Regex(pattern, flags);
        } catch {
            return null;
        }
    }

    static tryCreate(pattern, flags = '') {
        return Regex.from(pattern, flags);
    }

    get pattern() {
        return this._pattern;
    }

    get flags() {
        return this._flags;
    }

    get description() {
        return `/${this._pattern}/${this._flags}`;
    }

    matches(string) {
        return string.match(this._regex);
    }

    match(string) {
        return this._regex.exec(string);
    }

    firstMatch(string) {
        return this.match(string);
    }

    numberOfMatches(string) {
        const matches = string.match(this._regex);
        return matches ? matches.length : 0;
    }

    stringByReplacingMatches(string, replacement) {
        return string.replace(this._regex, replacement);
    }

    replacingMatches(string, replacement) {
        return this.stringByReplacingMatches(string, replacement);
    }

    split(string) {
        return string.split(this._regex);
    }

    isEqual(other) {
        if (!(other instanceof Regex)) return false;
        return this._pattern === other._pattern && this._flags === other._flags;
    }

    equals(other) {
        return this.isEqual(other);
    }

    hashCode() {
        return (this._pattern.hashCode() * 31 + this._flags.hashCode()) | 0;
    }

    toString() {
        return this.description;
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

    ifCase(pattern, handler) {
        return ifCase(pattern)(this).then(handler);
    }

    guardCase(pattern) {
        return guardCase(pattern)(this);
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
        return Switch(predicate)
            .case(Switch.let('pattern'), (m) => this._pattern === m.pattern)
            .default(() => false)
            .evaluate();
    }
}

class RegexComponent {
    constructor(regex) {
        this._regex = regex instanceof Regex ? regex : new Regex(regex);
    }

    static of(regex) {
        return new RegexComponent(regex);
    }

    get regex() {
        return this._regex;
    }

    matches(string) {
        return this._regex.matches(string);
    }

    firstMatch(string) {
        return this._regex.firstMatch(string);
    }

    isPrefix(string) {
        const prefixRegex = new Regex(`^${this._regex._pattern}`, this._regex._flags);
        return prefixRegex.test(string);
    }

    isSuffix(string) {
        const suffixRegex = new Regex(`${this._regex._pattern}$`, this._regex._flags);
        return suffixRegex.test(string);
    }

    isEqual(other) {
        if (!(other instanceof RegexComponent)) return false;
        return this._regex.isEqual(other._regex);
    }

    equals(other) {
        return this.isEqual(other);
    }

    hashCode() {
        return this._regex.hashCode();
    }

    toString() {
        return this._regex.toString();
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

    ifCase(pattern, handler) {
        return ifCase(pattern)(this).then(handler);
    }

    guardCase(pattern) {
        return guardCase(pattern)(this);
    }

    matchOperator(pattern) {
        return patternMatch(pattern, this);
    }

    switch() {
        return Switch(this);
    }
}

class Predicate {
    constructor(format, args = []) {
        this._format = format;
        this._args = args;
        this._evaluator = null;
    }

    static of(format, args = []) {
        return new Predicate(format, args);
    }

    static from(_predicate) {
        if (_predicate instanceof Predicate) return _predicate;
        if (typeof _predicate === 'function') {
            return new PredicateFunction(_predicate);
        }
        if (typeof _predicate === 'string') {
            return new Predicate(_predicate);
        }
        return new Predicate('TRUEPREDICATE');
    }

    static true() {
        return new Predicate('TRUEPREDICATE');
    }

    static false() {
        return new Predicate('FALSEPREDICATE');
    }

    get format() {
        return this._format;
    }

    evaluate(object) {
        if (this._evaluator) {
            return this._evaluator(object);
        }
        return this._evaluateFormat(object);
    }

    _evaluateFormat(object) {
        if (this._format === 'TRUEPREDICATE') return true;
        if (this._format === 'FALSEPREDICATE') return false;
        return true;
    }

    and(_other) {
        const other = Predicate.from(_other);
        return new PredicateCompound('AND', [this, other]);
    }

    or(_other) {
        const other = Predicate.from(_other);
        return new PredicateCompound('OR', [this, other]);
    }

    not() {
        return new PredicateNot(this);
    }

    isEqual(other) {
        if (!(other instanceof Predicate)) return false;
        return this._format === other._format;
    }

    equals(other) {
        return this.isEqual(other);
    }

    hashCode() {
        return this._format.hashCode();
    }

    toString() {
        return `Predicate(${this._format})`;
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

    ifCase(pattern, handler) {
        return ifCase(pattern)(this).then(handler);
    }

    guardCase(pattern) {
        return guardCase(pattern)(this);
    }

    matchOperator(pattern) {
        return patternMatch(pattern, this);
    }

    switch() {
        return Switch(this);
    }
}

class PredicateFunction extends Predicate {
    constructor(fn) {
        super('FUNCTION');
        this._fn = fn;
    }

    evaluate(object) {
        return this._fn(object);
    }
}

class PredicateCompound extends Predicate {
    constructor(type, predicates) {
        super(type);
        this._predicates = predicates;
    }

    evaluate(object) {
        switch (this._format) {
            case 'AND':
                return this._predicates.every(p => p.evaluate(object));
            case 'OR':
                return this._predicates.some(p => p.evaluate(object));
            default:
                return true;
        }
    }
}

class PredicateNot extends Predicate {
    constructor(predicate) {
        super('NOT');
        this._predicate = predicate;
    }

    evaluate(object) {
        return !this._predicate.evaluate(object);
    }
}

class Task {
    constructor(fn, priority = 0) {
        this._fn = fn;
        this._priority = priority;
        this._canceled = false;
        this._completed = false;
        this._result = null;
        this._error = null;
        this._continuations = [];
    }

    static priority(priority) {
        return (fn) => new Task(fn, priority);
    }

    static run(fn, priority = 0) {
        const task = new Task(fn, priority);
        return task.start();
    }

    static sleep(duration) {
        return new Task((resolve) => {
            setTimeout(resolve, duration);
        });
    }

    start() {
        try {
            const result = this._fn(
                (value) => this._resolve(value),
                (error) => this._reject(error)
            );
            if (result instanceof Promise) {
                result.then(v => this._resolve(v)).catch(e => this._reject(e));
            }
        } catch (e) {
            this._reject(e);
        }
        return this;
    }

    _resolve(value) {
        if (this._canceled) return;
        this._completed = true;
        this._result = value;
        this._continuations.forEach(c => c(value, null));
        this._continuations = [];
    }

    _reject(error) {
        if (this._canceled) return;
        this._completed = true;
        this._error = error;
        this._continuations.forEach(c => c(null, error));
        this._continuations = [];
    }

    get result() {
        return this._result;
    }

    get error() {
        return this._error;
    }

    get isCompleted() {
        return this._completed;
    }

    get isCanceled() {
        return this._canceled;
    }

    cancel() {
        this._canceled = true;
    }

    then(onFulfilled, onRejected) {
        return new Promise((resolve, reject) => {
            if (this._completed) {
                if (this._error) {
                    reject(this._error);
                } else {
                    resolve(this._result);
                }
            } else {
                this._continuations.push((result, error) => {
                    if (error) {
                        if (onRejected) {
                            try {
                                resolve(onRejected(error));
                            } catch (e) {
                                reject(e);
                            }
                        } else {
                            reject(error);
                        }
                    } else {
                        if (onFulfilled) {
                            try {
                                resolve(onFulfilled(result));
                            } catch (e) {
                                reject(e);
                            }
                        } else {
                            resolve(result);
                        }
                    }
                });
            }
        });
    }

    catch(onRejected) {
        return this.then(null, onRejected);
    }

    finally(onSettled) {
        return this.then(
            value => { onSettled(); return value; },
            error => { onSettled(); throw error; }
        );
    }

    await() {
        return new Promise((resolve, reject) => {
            if (this._completed) {
                if (this._error) reject(this._error);
                else resolve(this._result);
            } else {
                this._continuations.push((result, error) => {
                    if (error) reject(error);
                    else resolve(result);
                });
            }
        });
    }

    toString() {
        return `Task(${this._canceled ? 'canceled' : this._completed ? 'completed' : 'pending'})`;
    }
}

class AsyncSequence {
    constructor(iteratorFn) {
        this._iteratorFn = iteratorFn;
        this._iterator = null;
    }

    static of(iteratorFn) {
        return new AsyncSequence(iteratorFn);
    }

    static from(array) {
        let index = 0;
        return new AsyncSequence(async function* () {
            for (const item of array) {
                yield item;
            }
        });
    }

    static empty() {
        return new AsyncSequence(async function* () {});
    };

    static interval(interval, duration) {
        let count = 0;
        return new AsyncSequence(async function* () {
            const endTime = duration ? Date.now() + duration : Infinity;
            while (Date.now() < endTime) {
                yield count++;
                await Task.sleep(interval).await();
            }
        });
    }

    async next() {
        if (!this._iterator) {
            this._iterator = this._iteratorFn();
        }
        return this._iterator.next();
    }

    async forEach(callback) {
        const iterator = this._iteratorFn();
        let result;
        while (!(result = await iterator.next()).done) {
            callback(result.value);
        }
    }

    async filter(predicate) {
        const results = [];
        await this.forEach(item => {
            if (predicate(item)) {
                results.push(item);
            }
        });
        return results;
    }

    async map(transform) {
        const results = [];
        await this.forEach(item => {
            results.push(transform(item));
        });
        return results;
    }

    async toArray() {
        const results = [];
        await this.forEach(item => {
            results.push(item);
        });
        return results;
    }

    async first() {
        const iterator = this._iteratorFn();
        const result = await iterator.next();
        return result.done ? null : result.value;
    }

    async reduce(reducer, initial) {
        let accumulator = initial;
        await this.forEach(item => {
            accumulator = reducer(accumulator, item);
        });
        return accumulator;
    }

    toString() {
        return 'AsyncSequence';
    }
}

class Lock {
    constructor() {
        this._locked = false;
        this._queue = [];
    }

    static lock() {
        return new Lock();
    }

    get isLocked() {
        return this._locked;
    }

    acquire() {
        return new Promise((resolve) => {
            if (!this._locked) {
                this._locked = true;
                resolve(true);
            } else {
                this._queue.push(resolve);
            }
        });
    }

    release() {
        if (this._queue.length > 0) {
            const resolve = this._queue.shift();
            resolve(true);
        } else {
            this._locked = false;
        }
    }

    withLock(fn) {
        return this.acquire().then(() => {
            try {
                return fn();
            } finally {
                this.release();
            }
        });
    }

    async withLockAsync(fn) {
        await this.acquire();
        try {
            return await fn();
        } finally {
            this.release();
        }
    }

    toString() {
        return `Lock(${this._locked ? 'locked' : 'unlocked'})`;
    }
}

class ReadWriteLock {
    constructor() {
        this._readers = 0;
        this._writers = 0;
        this._readQueue = [];
        this._writeQueue = [];
    }

    static lock() {
        return new ReadWriteLock();
    }

    get isReadLocked() {
        return this._readers > 0;
    }

    get isWriteLocked() {
        return this._writers > 0;
    }

    acquireRead() {
        return new Promise((resolve) => {
            if (this._writers === 0) {
                this._readers++;
                resolve(true);
            } else {
                this._readQueue.push(resolve);
            }
        });
    }

    acquireWrite() {
        return new Promise((resolve) => {
            if (this._readers === 0 && this._writers === 0) {
                this._writers++;
                resolve(true);
            } else {
                this._writeQueue.push(resolve);
            }
        });
    }

    releaseRead() {
        this._readers--;
        if (this._readers === 0 && this._writeQueue.length > 0) {
            const resolve = this._writeQueue.shift();
            this._writers++;
            resolve(true);
        }
    }

    releaseWrite() {
        this._writers--;
        if (this._writeQueue.length > 0) {
            const resolve = this._writeQueue.shift();
            this._writers++;
            resolve(true);
        } else if (this._readQueue.length > 0) {
            while (this._readQueue.length > 0) {
                const resolve = this._readQueue.shift();
                this._readers++;
                resolve(true);
            }
        }
    }

    withReadLock(fn) {
        return this.acquireRead().then(() => {
            try {
                return fn();
            } finally {
                this.releaseRead();
            }
        });
    }

    withWriteLock(fn) {
        return this.acquireWrite().then(() => {
            try {
                return fn();
            } finally {
                this.releaseWrite();
            }
        });
    }

    toString() {
        return `ReadWriteLock(readers:${this._readers}, writers:${this._writers})`;
    }
}

class AtomicInt {
    constructor(initialValue = 0) {
        this._value = initialValue;
    }

    static of(initialValue) {
        return new AtomicInt(initialValue);
    }

    get value() {
        return this._value;
    }

    set value(val) {
        this._value = val;
    }

    get() {
        return this._value;
    }

    set(val) {
        this._value = val;
    }

    addAndGet(delta) {
        this._value += delta;
        return this._value;
    }

    incrementAndGet() {
        return this.addAndGet(1);
    }

    decrementAndGet() {
        return this.addAndGet(-1);
    }

    compareAndSet(expected, desired) {
        if (this._value === expected) {
            this._value = desired;
            return true;
        }
        return false;
    }

    updateAndGet(updater) {
        this._value = updater(this._value);
        return this._value;
    }

    getAndAdd(delta) {
        const old = this._value;
        this._value += delta;
        return old;
    }

    getAndIncrement() {
        return this.getAndAdd(1);
    }

    getAndDecrement() {
        return this.getAndAdd(-1);
    }

    toString() {
        return String(this._value);
    }

    valueOf() {
        return this._value;
    }
}

class AtomicBool {
    constructor(initialValue = false) {
        this._value = !!initialValue;
    }

    static of(initialValue) {
        return new AtomicBool(initialValue);
    }

    get value() {
        return this._value;
    }

    set value(val) {
        this._value = !!val;
    }

    get() {
        return this._value;
    }

    set(val) {
        this._value = !!val;
    }

    true() {
        this._value = true;
    }

    false() {
        this._value = false;
    }

    toggle() {
        this._value = !this._value;
    }

    compareAndSet(expected, desired) {
        if (this._value === expected) {
            this._value = desired;
            return true;
        }
        return false;
    }

    toString() {
        return String(this._value);
    }

    valueOf() {
        return this._value;
    }
}

class UnsafePointer {
    constructor(address, type = null) {
        this._address = address;
        this._type = type;
    }

    static null() {
        return new UnsafePointer(null);
    }

    static from(value, type) {
        return new UnsafePointer(value, type);
    }

    get address() {
        return this._address;
    }

    get type() {
        return this._type;
    }

    get isNull() {
        return this._address === null;
    }

    pointee() {
        return this._address;
    }

    load() {
        return this._address;
    }

    store(value) {
        this._address = value;
        return this;
    }

    advanced(by) {
        return new UnsafePointer(this._address + by, this._type);
    }

    isEqual(other) {
        if (!(other instanceof UnsafePointer)) return false;
        return this._address === other._address;
    }

    equals(other) {
        return this.isEqual(other);
    }

    hashCode() {
        return (this._address?.hashCode?.() || 0);
    }

    toString() {
        return `UnsafePointer(${this._address})`;
    }
}

class UnsafeMutablePointer extends UnsafePointer {
    constructor(address, type = null) {
        super(address, type);
    }

    static mutableNull() {
        return new UnsafeMutablePointer(null);
    }

    static from(value, type) {
        return new UnsafeMutablePointer(value, type);
    }

    pointee() {
        return this._address;
    }

    load() {
        return this._address;
    }

    store(value) {
        this._address = value;
        return this;
    }

    toString() {
        return `UnsafeMutablePointer(${this._address})`;
    }
}

export {
    JSONEncoder,
    JSONDecoder,
    NumberFormatter,
    DateFormatter,
    OrderedSet,
    SortedSet,
    WeakDictionary,
    Regex,
    RegexComponent,
    Predicate,
    Task,
    AsyncSequence,
    Lock,
    ReadWriteLock,
    AtomicInt,
    AtomicBool,
    UnsafePointer,
    UnsafeMutablePointer
};

export default {
    JSONEncoder,
    JSONDecoder,
    NumberFormatter,
    DateFormatter,
    OrderedSet,
    SortedSet,
    WeakDictionary,
    Regex,
    RegexComponent,
    Predicate,
    Task,
    AsyncSequence,
    Lock,
    ReadWriteLock,
    AtomicInt,
    AtomicBool,
    UnsafePointer,
    UnsafeMutablePointer
};
