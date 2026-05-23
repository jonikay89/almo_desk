import UIView from './UIView.js';
import UIColor from './UIColor.js';

class UIControl extends UIView {
    constructor() {
        super();
        this._isEnabled = true;
        this._isSelected = false;
        this._isHighlighted = false;
        this._contentVerticalAlignment = 'center';
        this._contentHorizontalAlignment = 'center';
        this._onTouchUpInside = null;
        this._target = null;
        this._action = null;
    }

    get isEnabled() { return this._isEnabled; }
    set isEnabled(value) { this._isEnabled = value; }

    get isSelected() { return this._isSelected; }
    set isSelected(value) { this._isSelected = value; }

    get isHighlighted() { return this._isHighlighted; }
    set isHighlighted(value) { this._isHighlighted = value; }

    addTarget(target, action) {
        this._target = target;
        this._action = action;
    }

    removeTarget(target, action) {
        if (this._target === target) {
            this._target = null;
            this._action = null;
        }
    }

    sendActionsForControlEvents(event) {
        if (this._action) {
            this._action.call(this._target, this);
        }
    }
}

export default UIControl;