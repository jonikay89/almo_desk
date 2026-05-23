import NSObject from './NSObject.js';

class UIPasteboard extends NSObject {
    static _general = null;

    constructor() {
        super();
        this._items = [];
        this._changeCount = 0;
    }

    static get general() {
        if (!UIPasteboard._general) {
            UIPasteboard._general = new UIPasteboard();
        }
        return UIPasteboard._general;
    }

    get changeCount() { return this._changeCount; }

    get items() { return this._items; }
    set items(value) {
        this._items = value;
        this._changeCount++;
    }

    get string() {
        return this._getFirstValueForType('public.utf8-plain-text');
    }
    set string(value) {
        this._setItems([{ 'public.utf8-plain-text': value }]);
    }

    get strings() {
        return this._items
            .map(item => item['public.utf8-plain-text'])
            .filter(Boolean);
    }

    get url() {
        const val = this._getFirstValueForType('public.url');
        return val || null;
    }
    set url(value) {
        this._setItems([{ 'public.url': value }]);
    }

    get image() {
        return this._getFirstValueForType('public.png');
    }
    set image(value) {
        this._setItems([{ 'public.png': value }]);
    }

    get colors() {
        return this._items
            .map(item => item['public.color'])
            .filter(Boolean);
    }

    hasStrings() {
        return this._items.some(item => item['public.utf8-plain-text'] !== undefined);
    }

    hasURLs() {
        return this._items.some(item => item['public.url'] !== undefined);
    }

    hasImages() {
        return this._items.some(item => item['public.png'] !== undefined || item['public.jpeg'] !== undefined);
    }

    hasColors() {
        return this._items.some(item => item['public.color'] !== undefined);
    }

    addItems(items) {
        this._items.push(...items);
        this._changeCount++;
    }

    setItems(items) {
        this._setItems(items);
    }

    _setItems(items) {
        this._items = items;
        this._changeCount++;
    }

    _getFirstValueForType(type) {
        for (const item of this._items) {
            if (item[type] !== undefined) return item[type];
        }
        return null;
    }

    clearContents() {
        this._items = [];
        this._changeCount++;
    }

    static withObjects(objects) {
        const pb = new UIPasteboard();
        const items = objects.map(obj => {
            if (typeof obj === 'string') return { 'public.utf8-plain-text': obj };
            if (obj instanceof URL) return { 'public.url': obj.toString() };
            return { 'public.data': obj };
        });
        pb.items = items;
        return pb;
    }
}

export default UIPasteboard;
