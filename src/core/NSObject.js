class NSObject {
    constructor() {
        this._hash = NSObject._nextHash++;
        this._description = null;
    }

    get hash() {
        return this._hash;
    }

    static _nextHash = 1;

    get description() {
        return this._description || `${this.constructor.name}`;
    }

    set description(desc) {
        this._description = desc;
    }

    isEqual(object) {
        if (this === object) return true;
        if (!(object instanceof NSObject)) return false;
        return this._hash === object._hash;
    }

    copy() {
        return new this.constructor();
    }

    respondsToSelector(selector) {
        return typeof this[selector] === 'function';
    }

    isKindOfClass(classRef) {
        let current = this.constructor;
        while (current) {
            if (current === classRef) return true;
            current = Object.getPrototypeOf(current);
        }
        return false;
    }

    isMemberOfClass(classRef) {
        return this.constructor === classRef;
    }

    superclass() {
        return Object.getPrototypeOf(this.constructor).prototype;
    }

    retain() {
        return this;
    }

    release() {
        return this;
    }

    autorelease() {
        return this;
    }
}

export default NSObject;
