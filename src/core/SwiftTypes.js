import { Equatable, Hashable } from './Protocol.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';

const SwiftDate = globalThis.Date;

String.prototype.hashCode = function() {
    let hash = 0;
    for (let i = 0; i < this.length; i++) {
        const char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
};

class Date {
    constructor(dateOrTimeInterval = null) {
        if (dateOrTimeInterval instanceof Date) {
            this._date = new SwiftDate(dateOrTimeInterval._date);
        } else if (typeof dateOrTimeInterval === 'number') {
            this._date = new SwiftDate(dateOrTimeInterval * 1000);
        } else if (dateOrTimeInterval instanceof SwiftDate) {
            this._date = new SwiftDate(dateOrTimeInterval);
        } else {
            this._date = new SwiftDate();
        }
    }

    static now() {
        return new SwiftDate();
    }

    static timeIntervalSince1970() {
        return Date.now().timeIntervalSince1970;
    }

    static from(timeInterval) {
        return new Date(timeInterval);
    }

    static distantPast() {
        return new Date(-86400 * 365 * 100);
    }

    static distantFuture() {
        return new Date(86400 * 365 * 100);
    }

    static parse(string) {
        const d = new Date(string);
        return isNaN(d.getTime()) ? null : new Date(d);
    }

    static ISO8601(string) {
        const d = new Date(string);
        return isNaN(d.getTime()) ? null : new Date(d);
    }

    get timeIntervalSince1970() {
        return this._date.getTime() / 1000;
    }

    get timeIntervalSinceNow() {
        return (this._date.getTime() - Date.now()) / 1000;
    }

    get timeIntervalSinceDate() {
        return (date) => (this._date.getTime() - date._date.getTime()) / 1000;
    }

    get description() {
        return this._date.toISOString();
    }

    toString() {
        return this._date.toString();
    }

    toISOString() {
        return this._date.toISOString();
    }

    toLocaleString() {
        return this._date.toLocaleString();
    }

    toDateString() {
        return this._date.toDateString();
    }

    toTimeString() {
        return this._date.toTimeString();
    }

    addingTimeInterval(timeInterval) {
        return new Date(this._date.getTime() + timeInterval * 1000);
    }

    addTimeInterval(timeInterval) {
        return this.addingTimeInterval(timeInterval);
    }

    earlierDate(date) {
        return this._date <= date._date ? this : date;
    }

    laterDate(date) {
        return this._date >= date._date ? this : date;
    }

    compare(date) {
        const a = this._date.getTime();
        const b = date._date.getTime();
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    }

    isEqual(other) {
        if (!(other instanceof Date)) return false;
        return this._date.getTime() === other._date.getTime();
    }

    equals(other) {
        return this.isEqual(other);
    }

    hashCode() {
        return (this._date.getTime() / 1000 | 0);
    }

    isSameDay(date) {
        return this._date.getFullYear() === date._date.getFullYear() &&
               this._date.getMonth() === date._date.getMonth() &&
               this._date.getDate() === date._date.getDate();
    }

    isToday() {
        return this.isSameDay(Date.now());
    }

    isTomorrow() {
        const tomorrow = new SwiftDate();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.isSameDay(tomorrow);
    }

    isYesterday() {
        const yesterday = new SwiftDate();
        yesterday.setDate(yesterday.getDate() - 1);
        return this.isSameDay(yesterday);
    }

    get year() {
        return this._date.getFullYear();
    }

    get month() {
        return this._date.getMonth() + 1;
    }

    get day() {
        return this._date.getDate();
    }

    get hour() {
        return this._date.getHours();
    }

    get minute() {
        return this._date.getMinutes();
    }

    get second() {
        return this._date.getSeconds();
    }

    get nanosecond() {
        return this._date.getMilliseconds() * 1000000;
    }

    get weekday() {
        return this._date.getDay() + 1;
    }

    get era() {
        return this._date.getFullYear() >= 1 ? 1 : 0;
    }

    get isLeapYear() {
        const year = this._date.getFullYear();
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    get daysInMonth() {
        return new SwiftDate(this.year, this.month, 0).getDate();
    }

    startOfDay() {
        const d = new SwiftDate(this._date);
        d.setHours(0, 0, 0, 0);
        return new Date(d);
    }

    endOfDay() {
        const d = new SwiftDate(this._date);
        d.setHours(23, 59, 59, 999);
        return new Date(d);
    }

    startOfMonth() {
        return new Date(this.year, this.month - 1, 1);
    }

    endOfMonth() {
        return new Date(this.year, this.month, 0);
    }

    startOfYear() {
        return new Date(this.year, 0, 1);
    }

    endOfYear() {
        return new Date(this.year, 11, 31);
    }

    addingYears(years) {
        const d = new SwiftDate(this._date);
        d.setFullYear(d.getFullYear() + years);
        return new Date(d);
    }

    addingMonths(months) {
        const d = new SwiftDate(this._date);
        d.setMonth(d.getMonth() + months);
        return new Date(d);
    }

    addingDays(days) {
        const d = new SwiftDate(this._date);
        d.setDate(d.getDate() + days);
        return new Date(d);
    }

    addingHours(hours) {
        const d = new SwiftDate(this._date);
        d.setHours(d.getHours() + hours);
        return new Date(d);
    }

    addingMinutes(minutes) {
        const d = new SwiftDate(this._date);
        d.setMinutes(d.getMinutes() + minutes);
        return new Date(d);
    }

    addingSeconds(seconds) {
        const d = new SwiftDate(this._date);
        d.setSeconds(d.getSeconds() + seconds);
        return new Date(d);
    }

    format(formatStr) {
        const year = this._date.getFullYear();
        const month = String(this._date.getMonth() + 1).padStart(2, '0');
        const day = String(this._date.getDate()).padStart(2, '0');
        const hours = String(this._date.getHours()).padStart(2, '0');
        const minutes = String(this._date.getMinutes()).padStart(2, '0');
        const seconds = String(this._date.getSeconds()).padStart(2, '0');

        return formatStr
            .replace('yyyy', year)
            .replace('yy', String(year).slice(-2))
            .replace('MM', month)
            .replace('dd', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    }

    patternMatch(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        if (typeof predicate === 'string') {
            return Switch(predicate)
                .case('today', () => this.isToday())
                .case('tomorrow', () => this.isTomorrow())
                .case('yesterday', () => this.isYesterday())
                .case('past', () => this._date < new SwiftDate())
                .case('future', () => this._date > new SwiftDate())
                .case('leapYear', () => this.isLeapYear)
                .default(() => false)
                .evaluate();
        }
        if (typeof predicate === 'object' && predicate !== null) {
            return Switch(predicate)
                .case({ year: Switch.let('y') }, (m) => this.year === m.y)
                .case({ month: Switch.let('m') }, (m) => this.month === m.m)
                .case({ day: Switch.let('d') }, (m) => this.day === m.d)
                .default(() => false)
                .evaluate();
        }
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

    switch() {
        return Switch(this);
    }
}

class URL {
    constructor(string) {
        this._url = new globalThis.URL(string);
    }

    static from(string) {
        try {
            return new URL(string);
        } catch {
            return null;
        }
    }

    static parse(string) {
        try {
            return new URL(string);
        } catch {
            return null;
        }
    }

    static fileURLWithPath(path) {
        return new URL(`file://${path}`);
    }

    static absoluteURLWithString(string) {
        try {
            return new URL(string);
        } catch {
            return null;
        }
    }

    get scheme() {
        return this._url.protocol.replace(':', '');
    }

    set scheme(val) {
        this._url.protocol = val + ':';
    }

    get host() {
        return this._url.hostname;
    }

    set host(val) {
        this._url.hostname = val;
    }

    get port() {
        return this._url.port;
    }

    set port(val) {
        this._url.port = val;
    }

    get path() {
        return this._url.pathname;
    }

    set path(val) {
        this._url.pathname = val;
    }

    get query() {
        return this._url.search;
    }

    get fragment() {
        return this._url.hash;
    }

    get user() {
        return this._url.username;
    }

    get password() {
        return this._url.password;
    }

    get absoluteString() {
        return this._url.href;
    }

    get relativeString() {
        return this._url.pathname + this._url.search + this._url.hash;
    }

    get baseURL() {
        return `${this._url.protocol}//${this._url.host}`;
    }

    get isFileURL() {
        return this._url.protocol === 'file:';
    }

    get isValid() {
        return true;
    }

    get standardized() {
        const normalized = this._url.href.replace(/\/+/g, '/');
        return new URL(normalized);
    }

    appendingPathComponent(component) {
        let base = this._url.pathname;
        if (!base.endsWith('/')) {
            base += '/';
        }
        const newUrl = new URL(`${this._url.protocol}//${this._url.host}${base}${component}`);
        return newUrl;
    }

    appendingQueryItem(name, value) {
        const url = new URL(this._url.href);
        url._url.searchParams.set(name, value);
        return url;
    }

    appendingQueryParameter(name, value) {
        return this.appendingQueryItem(name, value);
    }

    deletingLastPathComponent() {
        const path = this._url.pathname;
        const lastSlash = path.lastIndexOf('/');
        const newPath = lastSlash > 0 ? path.substring(0, lastSlash) : '/';
        return new URL(`${this._url.protocol}//${this._url.host}${newPath}${this._url.search}${this._url.hash}`);
    }

    deletingPathExtension() {
        const path = this._url.pathname;
        const lastDot = path.lastIndexOf('.');
        const lastSlash = path.lastIndexOf('/');
        if (lastDot === -1 || lastDot < lastSlash) {
            return this;
        }
        const newPath = path.substring(0, lastDot);
        return new URL(`${this._url.protocol}//${this._url.host}${newPath}${this._url.search}${this._url.hash}`);
    }

    pathExtension() {
        const path = this._url.pathname;
        const lastDot = path.lastIndexOf('.');
        const lastSlash = path.lastIndexOf('/');
        if (lastDot === -1 || lastDot < lastSlash) {
            return '';
        }
        return path.substring(lastDot + 1);
    }

    hasDirectoryPath() {
        const path = this._url.pathname;
        return path.endsWith('/');
    }

    standardize() {
        return this.standardized;
    }

    toString() {
        return this._url.href;
    }

    toJSON() {
        return this._url.href;
    }

    isEqual(other) {
        if (!(other instanceof URL)) return false;
        return this._url.href === other._url.href;
    }

    equals(other) {
        return this.isEqual(other);
    }

    hashCode() {
        return this._url.href.hashCode();
    }

    patternMatch(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        if (typeof predicate === 'string') {
            return Switch(predicate)
                .case('file', () => this.scheme === 'file')
                .case('http', () => this.scheme === 'http')
                .case('https', () => this.scheme === 'https')
                .case('valid', () => this.isValid)
                .case('invalid', () => !this.isValid)
                .case('hasDirectoryPath', () => this.hasDirectoryPath())
                .default(() => false)
                .evaluate();
        }
        if (typeof predicate === 'object' && predicate !== null) {
            return Switch(predicate)
                .case({ scheme: Switch.let('s') }, (m) => this.scheme === m.s)
                .case({ host: Switch.let('h') }, (m) => this.host === m.h)
                .case({ path: Switch.let('p') }, (m) => this.path === m.p)
                .case({ isFileURL: true }, () => this.isFileURL)
                .case({ isValid: true }, () => this.isValid)
                .default(() => false)
                .evaluate();
        }
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

    switch() {
        return Switch(this);
    }
}

class URLQueryItem {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }

    static of(name, value) {
        return new URLQueryItem(name, value);
    }

    get isKeyValuePair() {
        return true;
    }

    toString() {
        if (this.value === null || this.value === undefined) {
            return this.name;
        }
        return `${encodeURIComponent(this.name)}=${encodeURIComponent(this.value)}`;
    }

    isEqual(other) {
        if (!(other instanceof URLQueryItem)) return false;
        return this.name === other.name && this.value === other.value;
    }

    equals(other) {
        return this.isEqual(other);
    }

    hashCode() {
        return (this.name.hashCode() * 31 + (this.value || '').hashCode()) | 0;
    }
}

class URLComponents {
    constructor(string = null) {
        this._string = string;
        this._url = string ? new globalThis.URL(string) : null;
        this._scheme = this._url ? this._url.protocol.replace(':', '') : null;
        this._host = this._url ? this._url.hostname : null;
        this._port = this._url ? this._url.port : null;
        this._path = this._url ? this._url.pathname : null;
        this._queryItems = [];
        this._fragment = this._url ? this._url.hash.replace('#', '') : null;
        this._user = this._url ? this._url.username : null;
        this._password = this._url ? this._url.password : null;

        if (this._url && this._url.searchParams) {
            this._url.searchParams.forEach((value, name) => {
                this._queryItems.push(new URLQueryItem(name, value));
            });
        }
    }

    static from(string) {
        try {
            return new URLComponents(string);
        } catch {
            return null;
        }
    }

    static componentsWithString(string) {
        return URLComponents.from(string);
    }

    get scheme() {
        return this._scheme;
    }

    set scheme(val) {
        this._scheme = val;
    }

    get host() {
        return this._host;
    }

    set host(val) {
        this._host = val;
    }

    get port() {
        return this._port;
    }

    set port(val) {
        this._port = val;
    }

    get path() {
        return this._path;
    }

    set path(val) {
        this._path = val;
    }

    get queryItems() {
        return this._queryItems;
    }

    set queryItems(items) {
        this._queryItems = items || [];
    }

    get fragment() {
        return this._fragment;
    }

    set fragment(val) {
        this._fragment = val;
    }

    get user() {
        return this._user;
    }

    set user(val) {
        this._user = val;
    }

    get password() {
        return this._password;
    }

    set password(val) {
        this._password = val;
    }

    get url() {
        if (!this._scheme || !this._host) return null;
        let urlString = `${this._scheme}://${this._host}`;
        if (this._port) {
            urlString += `:${this._port}`;
        }
        urlString += this._path || '/';
        if (this._user) {
            urlString = `${this._scheme}://${this._user}:${this._password || ''}@${this._host}`;
            if (this._port) {
                urlString += `:${this._port}`;
            }
            urlString += this._path || '/';
        }
        if (this._queryItems.length > 0) {
            const queryString = this._queryItems.map(item => item.toString()).join('&');
            urlString += `?${queryString}`;
        }
        if (this._fragment) {
            urlString += `#${this._fragment}`;
        }
        try {
            return new URL(urlString);
        } catch {
            return null;
        }
    }

    get string() {
        const u = this.url;
        return u ? u.absoluteString : null;
    }

    get description() {
        return this.string || '';
    }

    appendingQueryItem(item) {
        const copy = new URLComponents(this._string);
        copy._queryItems = [...this._queryItems, item];
        return copy;
    }

    appendingQueryItems(items) {
        const copy = new URLComponents(this._string);
        copy._queryItems = [...this._queryItems, ...items];
        return copy;
    }

    removingQueryItem(name) {
        const copy = new URLComponents(this._string);
        copy._queryItems = this._queryItems.filter(item => item.name !== name);
        return copy;
    }

    setQueryItems(items) {
        const copy = new URLComponents(this._string);
        copy._queryItems = items || [];
        return copy;
    }

    getQueryItemForName(name) {
        return this._queryItems.find(item => item.name === name) || null;
    }

    hasQueryItem(name) {
        return this._queryItems.some(item => item.name === name);
    }

    clearQueryItems() {
        const copy = new URLComponents(this._string);
        copy._queryItems = [];
        return copy;
    }

    toString() {
        return this.string || '';
    }

    isEqual(other) {
        if (!(other instanceof URLComponents)) return false;
        if (this._scheme !== other._scheme) return false;
        if (this._host !== other._host) return false;
        if (this._port !== other._port) return false;
        if (this._path !== other._path) return false;
        if (this._fragment !== other._fragment) return false;
        if (this._queryItems.length !== other._queryItems.length) return false;
        for (let i = 0; i < this._queryItems.length; i++) {
            if (!this._queryItems[i].isEqual(other._queryItems[i])) return false;
        }
        return true;
    }

    equals(other) {
        return this.isEqual(other);
    }

    hashCode() {
        let hash = (this._scheme || '').hashCode();
        hash = (hash * 31 + (this._host || '').hashCode()) | 0;
        hash = (hash * 31 + (this._port || '').hashCode()) | 0;
        hash = (hash * 31 + (this._path || '').hashCode()) | 0;
        for (const item of this._queryItems) {
            hash = (hash * 31 + item.hashCode()) | 0;
        }
        return hash;
    }

    patternMatch(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        if (typeof predicate === 'object' && predicate !== null) {
            return Switch(predicate)
                .case({ scheme: Switch.let('s') }, (m) => this._scheme === m.s)
                .case({ host: Switch.let('h') }, (m) => this._host === m.h)
                .case({ hasQueryItem: Switch.let('name') }, (m) => this.hasQueryItem(m.name))
                .default(() => false)
                .evaluate();
        }
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

    switch() {
        return Switch(this);
    }
}

class UUID {
    constructor(string = null) {
        if (string instanceof UUID) {
            this._uuid = string._uuid;
        } else if (string) {
            this._uuid = UUID.parse(string) ? string : UUID.generate();
        } else {
            this._uuid = UUID.generate();
        }
    }

    static generate() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    static parse(string) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(string);
    }

    static from(string) {
        if (!UUID.parse(string)) return null;
        return new UUID(string);
    }

    static isValid(string) {
        return UUID.parse(string);
    }

    get uuidString() {
        return this._uuid;
    }

    get string() {
        return this._uuid;
    }

    get description() {
        return this._uuid;
    }

    toString() {
        return this._uuid;
    }

    toJSON() {
        return this._uuid;
    }

    isEqual(other) {
        if (!(other instanceof UUID)) return false;
        return this._uuid === other._uuid;
    }

    equals(other) {
        return this.isEqual(other);
    }

    hashCode() {
        return this._uuid.hashCode();
    }

    compare(other) {
        return this._uuid.localeCompare(other._uuid);
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
            .case(Switch.let('uuid'), (m) => this._uuid === m.uuid)
            .default(() => false)
            .evaluate();
    }
}

class Decimal {
    constructor(value = 0) {
        if (value instanceof Decimal) {
            this._value = value.toNumber();
        } else if (typeof value === 'string') {
            this._value = parseFloat(value) || 0;
        } else {
            this._value = Number(value) || 0;
        }
        this._string = this._toString();
    }

    _toString() {
        return this._value.toFixed(10).replace(/\.?0+$/, '') || '0';
    }

    static from(value) {
        return new Decimal(value);
    }

    static fromString(string) {
        const num = parseFloat(string);
        if (isNaN(num)) return null;
        return new Decimal(num);
    }

    static of(value) {
        return new Decimal(value);
    }

    static zero() {
        return new Decimal(0);
    }

    static one() {
        return new Decimal(1);
    }

    static ten() {
        return new Decimal(10);
    }

    get description() {
        return this._string;
    }

    toString() {
        return this._string;
    }

    toJSON() {
        return this._string;
    }

    toNumber() {
        return this.valueOf();
    }

    toFixed(digits) {
        return this.valueOf().toFixed(digits);
    }

    adding(other) {
        return new Decimal(this.toNumber() + new Decimal(other).toNumber());
    }

    subtracting(other) {
        return new Decimal(this.toNumber() - new Decimal(other).toNumber());
    }

    multiplying(by) {
        return new Decimal(this.toNumber() * new Decimal(by).toNumber());
    }

    dividing(by) {
        return new Decimal(this.toNumber() / new Decimal(by).toNumber());
    }

    addingDecimal(other) {
        return this.adding(other);
    }

    subtractingDecimal(other) {
        return this.subtracting(other);
    }

    multiplyingDecimal(other) {
        return this.multiplying(other);
    }

    dividingDecimal(other) {
        return this.dividing(other);
    }

    remainder(dividend) {
        return new Decimal(this.toNumber() % new Decimal(dividend).toNumber());
    }

    power(exponent) {
        return new Decimal(Math.pow(this.toNumber(), new Decimal(exponent).toNumber()));
    }

    negate() {
        return new Decimal(-this.toNumber());
    }

    absoluteValue() {
        return new Decimal(Math.abs(this.toNumber()));
    }

    floor() {
        return new Decimal(Math.floor(this.toNumber()));
    }

    ceiling() {
        return new Decimal(Math.ceil(this.toNumber()));
    }

    rounded() {
        return new Decimal(Math.round(this.toNumber()));
    }

    isEqual(other) {
        if (!(other instanceof Decimal)) return false;
        return this.toNumber() === other.toNumber();
    }

    equals(other) {
        return this.isEqual(other);
    }

    hashCode() {
        return (this.toNumber() * 1000000 | 0);
    }

    compare(other) {
        const a = this.toNumber();
        const b = new Decimal(other).toNumber();
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    }

    isNaN() {
        return isNaN(this.toNumber());
    }

    isFinite() {
        return isFinite(this.toNumber());
    }

    isZero() {
        return this.toNumber() === 0;
    }

    isPositive() {
        return this.toNumber() > 0;
    }

    isNegative() {
        return this.toNumber() < 0;
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
        if (typeof predicate === 'string') {
            return Switch(predicate)
                .case('zero', () => this.isZero())
                .case('positive', () => this.isPositive())
                .case('negative', () => this.isNegative())
                .case('nan', () => this.isNaN())
                .case('finite', () => this.isFinite())
                .default(() => false)
                .evaluate();
        }
        if (typeof predicate === 'number') {
            return this.toNumber() === predicate;
        }
        return false;
    }
}

class Character {
    constructor(char) {
        if (char instanceof Character) {
            this._char = char._char;
        } else if (typeof char === 'string') {
            this._char = char.charAt(0) || '';
        } else if (typeof char === 'number') {
            this._char = String.fromCodePoint(char);
        } else {
            this._char = '';
        }
    }

    static from(char) {
        return new Character(char);
    }

    static of(char) {
        return new Character(char);
    }

    static space() {
        return new Character(' ');
    }

    static tab() {
        return new Character('\t');
    }

    static newline() {
        return new Character('\n');
    }

    static carriageReturn() {
        return new Character('\r');
    }

    static isLetter(char) {
        return /^[a-zA-Z]$/.test(char._char || char);
    }

    static isNumber(char) {
        return /^[0-9]$/.test(char._char || char);
    }

    static isWhitespace(char) {
        return /\s/.test(char._char || char);
    }

    static isAlphanumeric(char) {
        return /^[a-zA-Z0-9]$/.test(char._char || char);
    }

    get char() {
        return this._char;
    }

    get string() {
        return this._char;
    }

    get scalar() {
        return this._char.codePointAt(0);
    }

    get asciiValue() {
        return this._char.charCodeAt(0);
    }

    get unicodeScalars() {
        return [this._char.codePointAt(0)];
    }

    get description() {
        return this._char;
    }

    toString() {
        return this._char;
    }

    toJSON() {
        return this._char;
    }

    toUpperCase() {
        return new Character(this._char.toUpperCase());
    }

    toLowerCase() {
        return new Character(this._char.toLowerCase());
    }

    isLetter() {
        return Character.isLetter(this);
    }

    isNumber() {
        return Character.isNumber(this);
    }

    isWhitespace() {
        return Character.isWhitespace(this);
    }

    isAlphanumeric() {
        return Character.isAlphanumeric(this);
    }

    isEqual(other) {
        if (!(other instanceof Character)) return false;
        return this._char === other._char;
    }

    equals(other) {
        return this.isEqual(other);
    }

    hashCode() {
        return this._char.charCodeAt(0);
    }

    compare(other) {
        return this._char.localeCompare(new Character(other)._char);
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
        if (typeof predicate === 'string') {
            return Switch(predicate)
                .case('letter', () => this.isLetter())
                .case('number', () => this.isNumber())
                .case('whitespace', () => this.isWhitespace())
                .case('alphanumeric', () => this.isAlphanumeric())
                .case(Switch.let('c'), (m) => this._char === m.c)
                .default(() => false)
                .evaluate();
        }
        if (typeof predicate === 'object' && predicate !== null) {
            return Switch(predicate)
                .case({ upper: Switch.let('u') }, (m) => this.toUpperCase()._char === m.u)
                .case({ lower: Switch.let('l') }, (m) => this.toLowerCase()._char === m.l)
                .case({ ascii: Switch.let('code') }, (m) => this.asciiValue === m.code)
                .default(() => false)
                .evaluate();
        }
        return false;
    }
}

class TimeZone {
    constructor(identifier = null) {
        if (identifier instanceof TimeZone) {
            this._identifier = identifier._identifier;
        } else if (identifier) {
            this._identifier = identifier;
        } else {
            this._identifier = 'UTC';
        }
    }

    static from(identifier) {
        return new TimeZone(identifier);
    }

    static UTC() {
        return new TimeZone('UTC');
    }

    static current() {
        return new TimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }

    static knownTimeZoneIdentifiers() {
        return Intl.supportedValuesOf('timeZone');
    }

    static default() {
        return TimeZone.current();
    }

    static setDefault(identifier) {
        TimeZone._default = new TimeZone(identifier);
    }

    get identifier() {
        return this._identifier;
    }

    get displayName() {
        return new Intl.DateTimeFormat('en-US', { timeZone: this._identifier, timeZoneName: 'long' })
            .formatToParts(new SwiftDate())
            .find(p => p.type === 'timeZoneName')?.value || this._identifier;
    }

    get abbreviation() {
        return new Intl.DateTimeFormat('en-US', { timeZone: this._identifier, timeZoneName: 'short' })
            .formatToParts(new SwiftDate())
            .find(p => p.type === 'timeZoneName')?.value || this._identifier;
    }

    get secondsFromGMT() {
        return -new SwiftDate().getTimezoneOffset() * 60;
    }

    get dayLightSavingTimeOffset() {
        const jan = new SwiftDate(new SwiftDate().getFullYear(), 0, 1);
        const jul = new SwiftDate(new SwiftDate().getFullYear(), 6, 1);
        const stdOffset = (offset) => {
            const testDate = new SwiftDate(new SwiftDate().getFullYear(), 6, 1);
            return offset === new SwiftDate(testDate).getTimezoneOffset() ? 0 : 60;
        };
        return stdOffset(new SwiftDate(jan).getTimezoneOffset());
    }

    get isDayLightSavingTime() {
        return this.dayLightSavingTimeOffset !== 0;
    }

    nextDaylightSavingTimeTransition(date = null) {
        return null;
    }

    secondsFromGMTDate(forDate = null) {
        return this.secondsFromGMT;
    }

    isEqual(other) {
        if (!(other instanceof TimeZone)) return false;
        return this._identifier === other._identifier;
    }

    equals(other) {
        return this.isEqual(other);
    }

    hashCode() {
        return this._identifier.hashCode();
    }

    compare(other) {
        return this._identifier.localeCompare(other._identifier);
    }

    toString() {
        return this._identifier;
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
        if (typeof predicate === 'string') {
            return Switch(predicate)
                .case('utc', () => this._identifier === 'UTC')
                .case('current', () => this._identifier === TimeZone.current()._identifier)
                .case('daylight', () => this.isDayLightSavingTime)
                .case(Switch.let('id'), (m) => this._identifier === m.id)
                .default(() => false)
                .evaluate();
        }
        return false;
    }
}

class Calendar {
    constructor(identifier = 'gregorian') {
        this._identifier = identifier;
        this._locale = null;
    }

    static from(identifier) {
        return new Calendar(identifier);
    }

    static current() {
        return new Calendar(Intl.DateTimeFormat().resolvedOptions().calendar || 'gregorian');
    }

    static ISO8601() {
        return new Calendar('iso8601');
    }

    get identifier() {
        return this._identifier;
    }

    set locale(loc) {
        this._locale = loc;
    }

    get locale() {
        return this._locale || 'en-US';
    }

    dateComponents(from = null) {
        const d = from instanceof Date ? from._date : (from ? new SwiftDate(from) : new SwiftDate());
        return {
            era: d.getFullYear() >= 1 ? 1 : 0,
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            day: d.getDate(),
            hour: d.getHours(),
            minute: d.getMinutes(),
            second: d.getSeconds(),
            weekday: d.getDay() + 1,
            quarter: Math.floor(d.getMonth() / 3) + 1,
            weekOfYear: this._weekOfYear(d),
            yearForWeekOfYear: d.getFullYear()
        };
    }

    _weekOfYear(date) {
        const firstDay = new SwiftDate(date.getFullYear(), 0, 1);
        const pastDays = (date - firstDay) / 86400000;
        return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
    }

    component(enumValue, from = null) {
        const components = this.dateComponents(from);
        const keyMap = {
            era: 'era',
            year: 'year',
            month: 'month',
            day: 'day',
            hour: 'hour',
            minute: 'minute',
            second: 'second',
            weekday: 'weekday',
            quarter: 'quarter',
            weekOfYear: 'weekOfYear',
            yearForWeekOfYear: 'yearForWeekOfYear'
        };
        return components[keyMap[enumValue]] || null;
    }

    date(from = null) {
        if (from instanceof Date) return from;
        return from ? new Date(from) : new Date();
    }

    dateByAdding(component, value, to = null) {
        const d = to instanceof Date ? new SwiftDate(to._date) : (to ? new SwiftDate(to) : new SwiftDate());
        const addMap = {
            year: (v) => d.setFullYear(d.getFullYear() + v),
            month: (v) => d.setMonth(d.getMonth() + v),
            day: (v) => d.setDate(d.getDate() + v),
            hour: (v) => d.setHours(d.getHours() + v),
            minute: (v) => d.setMinutes(d.getMinutes() + v),
            second: (v) => d.setSeconds(d.getSeconds() + v)
        };
        if (addMap[component]) {
            addMap[component](value);
        }
        return new Date(d);
    }

    dateBySubtracting(component, value, from = null) {
        return this.dateByAdding(component, -value, from);
    }

    startOfDay(forDate = null) {
        const d = forDate instanceof Date ? new SwiftDate(forDate._date) : (forDate ? new SwiftDate(forDate) : new SwiftDate());
        d.setHours(0, 0, 0, 0);
        return new Date(d);
    }

    endOfDay(forDate = null) {
        const d = forDate instanceof Date ? new SwiftDate(forDate._date) : (forDate ? new SwiftDate(forDate) : new SwiftDate());
        d.setHours(23, 59, 59, 999);
        return new Date(d);
    }

    startOfMonth(forDate = null) {
        const d = forDate instanceof Date ? new SwiftDate(forDate._date) : (forDate ? new SwiftDate(forDate) : new SwiftDate());
        return new Date(d.getFullYear(), d.getMonth(), 1);
    }

    endOfMonth(forDate = null) {
        const d = forDate instanceof Date ? new SwiftDate(forDate._date) : (forDate ? new SwiftDate(forDate) : new SwiftDate());
        return new Date(d.getFullYear(), d.getMonth() + 1, 0);
    }

    startOfYear(forDate = null) {
        const d = forDate instanceof Date ? new SwiftDate(forDate._date) : (forDate ? new SwiftDate(forDate) : new SwiftDate());
        return new Date(d.getFullYear(), 0, 1);
    }

    endOfYear(forDate = null) {
        const d = forDate instanceof Date ? new SwiftDate(forDate._date) : (forDate ? new SwiftDate(forDate) : new SwiftDate());
        return new Date(d.getFullYear(), 11, 31);
    }

    rangeOf(enumValue, inDate = null) {
        const d = inDate instanceof Date ? new SwiftDate(inDate._date) : (inDate ? new SwiftDate(inDate) : new SwiftDate());
        switch (enumValue) {
            case 'day':
                return { start: this.startOfDay(d), end: this.endOfDay(d) };
            case 'month':
                return { start: this.startOfMonth(d), end: this.endOfMonth(d) };
            case 'year':
                return { start: this.startOfYear(d), end: this.endOfYear(d) };
            default:
                return { start: d, end: d };
        }
    }

    isDateInToday(date) {
        return this._isSameDay(date, new SwiftDate());
    }

    isDateInTomorrow(date) {
        const tomorrow = new SwiftDate();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this._isSameDay(date, tomorrow);
    }

    isDateInYesterday(date) {
        const yesterday = new SwiftDate();
        yesterday.setDate(yesterday.getDate() - 1);
        return this._isSameDay(date, yesterday);
    }

    _isSameDay(a, b) {
        return a.getFullYear() === b.getFullYear() &&
               a.getMonth() === b.getMonth() &&
               a.getDate() === b.getDate();
    }

    compare(date1, date2) {
        const a = date1 instanceof Date ? date1 : new SwiftDate(date1);
        const b = date2 instanceof Date ? date2 : new SwiftDate(date2);
        return a.getTime() - b.getTime();
    }

    isEqual(other) {
        if (!(other instanceof Calendar)) return false;
        return this._identifier === other._identifier;
    }

    equals(other) {
        return this.isEqual(other);
    }

    hashCode() {
        return this._identifier.hashCode();
    }

    toString() {
        return `Calendar(${this._identifier})`;
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
            .case('iso8601', () => this._identifier === 'iso8601')
            .case('gregorian', () => this._identifier === 'gregorian')
            .case(Switch.let('id'), (m) => this._identifier === m.id)
            .default(() => false)
            .evaluate();
    }
}

class Locale {
    constructor(identifier = 'en-US') {
        if (identifier instanceof Locale) {
            this._identifier = identifier._identifier;
        } else {
            this._identifier = identifier;
        }
    }

    static current() {
        return new Locale(Intl.DateTimeFormat().resolvedOptions().locale);
    }

    static from(identifier) {
        return new Locale(identifier);
    }

    static knownLocales() {
        return Intl.supportedValuesOf('locale');
    }

    get identifier() {
        return this._identifier;
    }

    get languageCode() {
        return this._identifier.split('-')[0];
    }

    get countryCode() {
        return this._identifier.split('-')[1] || '';
    }

    get displayName() {
        return new Intl.DisplayNames([this._identifier], { type: 'language' }).of(this._identifier) || this._identifier;
    }

    get localizedString() {
        return this.displayName;
    }

    localizedStringFor(enumValue, value) {
        const formatter = new Intl.DisplayNames([this._identifier], { type: enumValue });
        return formatter.of(value) || value;
    }

    isEqual(other) {
        if (!(other instanceof Locale)) return false;
        return this._identifier === other._identifier;
    }

    equals(other) {
        return this.isEqual(other);
    }

    hashCode() {
        return this._identifier.hashCode();
    }

    compare(other) {
        return this._identifier.localeCompare(other._identifier);
    }

    toString() {
        return this._identifier;
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
            .case('current', () => this._identifier === Locale.current()._identifier)
            .case(Switch.let('id'), (m) => this._identifier === m.id)
            .default(() => false)
            .evaluate();
    }
}

class Unit {
    constructor(symbol, coefficient = 1) {
        this._symbol = symbol;
        this._coefficient = coefficient;
    }

    get symbol() {
        return this._symbol;
    }

    get coefficient() {
        return this._coefficient;
    }

    equals(other) {
        if (!(other instanceof Unit)) return false;
        return this._symbol === other._symbol && this._coefficient === other._coefficient;
    }

    toString() {
        return this._symbol;
    }
}

class Measurement {
    constructor(value, unit) {
        this._value = value;
        this._unit = unit instanceof Unit ? unit : new Unit(unit);
    }

    static of(value, unit) {
        return new Measurement(value, unit);
    }

    get value() {
        return this._value;
    }

    set value(val) {
        this._value = val;
    }

    get unit() {
        return this._unit;
    }

    get symbol() {
        return this._unit.symbol;
    }

    converting(toUnit) {
        if (this._unit._symbol === toUnit._symbol) {
            return new Measurement(this._value, toUnit);
        }
        const convertedValue = this._value * (this._unit._coefficient / toUnit._coefficient);
        return new Measurement(convertedValue, toUnit);
    }

    adding(other) {
        if (!(other instanceof Measurement)) {
            other = new Measurement(other, this._unit);
        }
        const converted = other.converting(this._unit);
        return new Measurement(this._value + converted._value, this._unit);
    }

    subtracting(other) {
        if (!(other instanceof Measurement)) {
            other = new Measurement(other, this._unit);
        }
        const converted = other.converting(this._unit);
        return new Measurement(this._value - converted._value, this._unit);
    }

    comparing(other) {
        if (!(other instanceof Measurement)) {
            other = new Measurement(other, this._unit);
        }
        const converted = other.converting(this._unit);
        if (this._value < converted._value) return -1;
        if (this._value > converted._value) return 1;
        return 0;
    }

    isEqual(other) {
        if (!(other instanceof Measurement)) return false;
        const converted = other.converting(this._unit);
        return Math.abs(this._value - converted._value) < 0.0001;
    }

    equals(other) {
        return this.isEqual(other);
    }

    hashCode() {
        return (this._value * 1000 | 0);
    }

    toString() {
        return `${this._value} ${this._unit.symbol}`;
    }

    description() {
        return this.toString();
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
                .case({ value: Switch.let('v'), unit: Switch.let('u') }, 
                      (m) => Math.abs(this._value - m.v) < 0.0001 && this._unit.symbol === m.u)
                .case({ greaterThan: Switch.let('other') }, (m) => this.comparing(m.other) > 0)
                .case({ lessThan: Switch.let('other') }, (m) => this.comparing(m.other) < 0)
                .default(() => false)
                .evaluate();
        }
        return false;
    }
}

class UnitLength {
    static get millimeter() { return new Unit('mm', 0.001); }
    static get centimeter() { return new Unit('cm', 0.01); }
    static get meter() { return new Unit('m', 1); }
    static get kilometer() { return new Unit('km', 1000); }
    static get inch() { return new Unit('in', 0.0254); }
    static get foot() { return new Unit('ft', 0.3048); }
    static get yard() { return new Unit('yd', 0.9144); }
    static get mile() { return new Unit('mi', 1609.344); }
}

class UnitMass {
    static get milligram() { return new Unit('mg', 0.000001); }
    static get gram() { return new Unit('g', 0.001); }
    static get kilogram() { return new Unit('kg', 1); }
    static get pound() { return new Unit('lb', 0.453592); }
    static get ounce() { return new Unit('oz', 0.0283495); }
}

class UnitTemperature {
    static get kelvin() { return new Unit('K', 1); }
    static get celsius() { return new Unit('°C', 1); }
    static get fahrenheit() { return new Unit('°F', 1); }
}

class UnitTime {
    static get second() { return new Unit('s', 1); }
    static get millisecond() { return new Unit('ms', 0.001); }
    static get minute() { return new Unit('min', 60); }
    static get hour() { return new Unit('h', 3600); }
    static get day() { return new Unit('d', 86400); }
}

class FileManager {
    constructor() {
        this._cwd = '/';
    }

    static default() {
        return new FileManager();
    }

    get currentDirectory() {
        return this._cwd;
    }

    changeCurrentDirectory(path) {
        this._cwd = path;
        return true;
    }

    fileExists(atPath) {
        return false;
    }

    isReadable(atPath) {
        return true;
    }

    isWritable(atPath) {
        return true;
    }

    isExecutable(atPath) {
        return true;
    }

    isDeletable(atPath) {
        return true;
    }

    contentsOfDirectory(atPath) {
        return [];
    }

    createDirectory(atPath) {
        return true;
    }

    createFile(atPath, contents = '') {
        return true;
    }

    removeItem(atPath) {
        return true;
    }

    copyItem(src, dest) {
        return true;
    }

    moveItem(src, dest) {
        return true;
    }

    attributesOfItem(atPath) {
        return {
            fileSize: 0,
            creationDate: new SwiftDate(),
            modificationDate: new SwiftDate()
        };
    }

    homeDirectory() {
        return '/home/user';
    }

    documentsDirectory() {
        return '/home/user/Documents';
    }

    cachesDirectory() {
        return '/home/user/Caches';
    }

    temporaryDirectory() {
        return '/tmp';
    }

    toString() {
        return `FileManager(${this._cwd})`;
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

class UserDefaults {
    constructor(suiteName = null) {
        this._suiteName = suiteName;
        this._storage = {};
        this._load();
    }

    static standard() {
        return new UserDefaults();
    }

    static from(suiteName) {
        return new UserDefaults(suiteName);
    }

    _load() {
        try {
            const data = localStorage.getItem(`UserDefaults_${this._suiteName || 'standard'}`);
            if (data) {
                this._storage = JSON.parse(data);
            }
        } catch {
            this._storage = {};
        }
    }

    _save() {
        try {
            localStorage.setItem(`UserDefaults_${this._suiteName || 'standard'}`, JSON.stringify(this._storage));
        } catch {
        }
    }

    object(forKey) {
        return this._storage[forKey] || null;
    }

    string(forKey) {
        return this._storage[forKey] || null;
    }

    array(forKey) {
        return this._storage[forKey] || null;
    }

    dictionary(forKey) {
        return this._storage[forKey] || null;
    }

    integer(forKey) {
        return this._storage[forKey] || 0;
    }

    float(forKey) {
        return this._storage[forKey] || 0.0;
    }

    double(forKey) {
        return this._storage[forKey] || 0.0;
    }

    bool(forKey) {
        return !!this._storage[forKey];
    }

    set(value, forKey) {
        this._storage[forKey] = value;
        this._save();
        return this;
    }

    removeObject(forKey) {
        delete this._storage[forKey];
        this._save();
    }

    containsObject(forKey) {
        return forKey in this._storage;
    }

    dictionaryRepresentation() {
        return { ...this._storage };
    }

    synchronize() {
        this._save();
        return true;
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

class Bundle {
    constructor(path = null) {
        this._path = path || '';
        this._resources = {};
    }

    static main() {
        return new Bundle('');
    }

    static from(path) {
        return new Bundle(path);
    }

    get bundlePath() {
        return this._path;
    }

    get resourcePath() {
        return this._path ? `${this._path}/Resources` : '/Resources';
    }

    get identifier() {
        return 'com.app.bundle';
    }

    get infoDictionary() {
        return {
            CFBundleName: 'App',
            CFBundleVersion: '1.0',
            CFBundleIdentifier: this.identifier
        };
    }

    object(forInfoDictionaryKey) {
        return this.infoDictionary[forInfoDictionaryKey];
    }

    path(forResource, ofType) {
        return `${this.resourcePath}/${forResource}.${ofType}`;
    }

    URL(forResource, ofType) {
        return new URL(this.path(forResource, ofType));
    }

    load() {
        return true;
    }

    isLoaded() {
        return true;
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

class Notification {
    constructor(name, object = null, userInfo = null) {
        this._name = name;
        this._object = object;
        this._userInfo = userInfo;
        this._date = new SwiftDate();
    }

    static from(name, object = null, userInfo = null) {
        return new Notification(name, object, userInfo);
    }

    static named(name) {
        return new Notification(name);
    }

    get name() {
        return this._name;
    }

    get object() {
        return this._object;
    }

    get userInfo() {
        return this._userInfo;
    }

    get date() {
        return this._date;
    }

    get description() {
        return `Notification(${this._name})`;
    }

    toString() {
        return this._name;
    }

    isEqual(other) {
        if (!(other instanceof Notification)) return false;
        return this._name === other._name;
    }

    equals(other) {
        return this.isEqual(other);
    }

    hashCode() {
        return this._name.hashCode();
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
        if (typeof predicate === 'string') {
            return Switch(predicate)
                .case(this._name, () => true)
                .case(Switch.let('name'), (m) => this._name === m.name)
                .default(() => false)
                .evaluate();
        }
        return false;
    }
}

class AppError {
    constructor(domain, code, message = '', userInfo = null) {
        this._domain = domain;
        this._code = code;
        this._message = message;
        this._userInfo = userInfo || {};
        this._date = new SwiftDate();
    }

    static from(error) {
        if (error instanceof AppError) return error;
        if (error instanceof Error) {
            return new AppError('SwiftError', -1, error.message);
        }
        return new AppError('Unknown', -1, String(error));
    }

    static error(domain, code, message, userInfo) {
        return new AppError(domain, code, message, userInfo);
    }

    static validationError(message) {
        return new AppError('ValidationError', 1001, message);
    }

    static notFoundError(message) {
        return new AppError('NotFoundError', 1004, message);
    }

    static unauthorizedError(message) {
        return new AppError('UnauthorizedError', 1001, message);
    }

    get domain() {
        return this._domain;
    }

    get code() {
        return this._code;
    }

    get message() {
        return this._message;
    }

    get userInfo() {
        return this._userInfo;
    }

    get localizedDescription() {
        return this._message;
    }

    get description() {
        return `Error(${this._domain}, ${this._code}): ${this._message}`;
    }

    toString() {
        return this.description;
    }

    toJSON() {
        return {
            domain: this._domain,
            code: this._code,
            message: this._message,
            userInfo: this._userInfo,
            date: this._date.toISOString()
        };
    }

    isEqual(other) {
        if (!(other instanceof AppError)) return false;
        return this._domain === other._domain && this._code === other._code;
    }

    equals(other) {
        return this.isEqual(other);
    }

    hashCode() {
        return (this._domain.hashCode() * 31 + this._code) | 0;
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
                .case({ domain: Switch.let('d'), code: Switch.let('c') }, 
                      (m) => this._domain === m.d && this._code === m.c)
                .case({ domain: Switch.let('d') }, (m) => this._domain === m.d)
                .case({ code: Switch.let('c') }, (m) => this._code === m.c)
                .case({ message: Switch.let('m') }, (m) => this._message.includes(m.m))
                .default(() => false)
                .evaluate();
        }
        return false;
    }
}

class AnyHashable {
    constructor(value) {
        this._value = value;
        this._hash = this._computeHash();
    }

    static from(value) {
        return new AnyHashable(value);
    }

    static of(value) {
        return new AnyHashable(value);
    }

    _computeHash() {
        if (this._value && typeof this._value.hashCode === 'function') {
            return this._value.hashCode();
        }
        if (this._value && typeof this._value.hash === 'function') {
            return this._value.hash();
        }
        return String(this._value).hashCode();
    }

    get value() {
        return this._value;
    }

    get hashValue() {
        return this._hash;
    }

    get description() {
        return `AnyHashable(${this._value})`;
    }

    toString() {
        return String(this._value);
    }

    isEqual(other) {
        if (!(other instanceof AnyHashable)) return false;
        if (typeof this._value === 'object' && this._value?.isEqual) {
            return this._value.isEqual(other._value);
        }
        return this._value === other._value;
    }

    equals(other) {
        return this.isEqual(other);
    }

    hashCode() {
        return this._hash;
    }

    compare(other) {
        const a = String(this._value);
        const b = String(other._value);
        return a.localeCompare(b);
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
            .case(Switch.let('val'), (m) => this._value === m.val)
            .default(() => false)
            .evaluate();
    }
}

export {
    Date,
    URL,
    URLQueryItem,
    URLComponents,
    UUID,
    Decimal,
    Character,
    TimeZone,
    Calendar,
    Locale,
    Measurement,
    Unit,
    UnitLength,
    UnitMass,
    UnitTemperature,
    UnitTime,
    FileManager,
    UserDefaults,
    Bundle,
    Notification,
    AppError,
    AnyHashable
};

export default {
    Date,
    URL,
    URLQueryItem,
    URLComponents,
    UUID,
    Decimal,
    Character,
    TimeZone,
    Calendar,
    Locale,
    Measurement,
    Unit,
    UnitLength,
    UnitMass,
    UnitTemperature,
    UnitTime,
    FileManager,
    UserDefaults,
    Bundle,
    Notification,
    AppError,
    AnyHashable
};
