class BaseWidget {
    constructor(os, extraData = {}) {
        this.os = os;
        this.extraData = extraData;
        this.element = null;
        this.intervals = [];
    }

    createElement() {
        throw new Error('Widget must implement createElement()');
    }

    registerInterval(id) {
        this.intervals.push(id);
        return id;
    }

    destroy() {
        this.intervals.forEach(id => clearInterval(id));
        this.intervals = [];
    }
}

export default BaseWidget;
