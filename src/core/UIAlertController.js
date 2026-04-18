import UIView from './UIView.js';

class UIAlertController extends UIView {
    constructor() {
        super();
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('div');
            this._element.style.position = 'absolute';
        }
        return this._element;
    }
}

export default UIAlertController;
