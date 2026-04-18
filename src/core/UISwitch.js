import UIView from './UIView.js';
import UIColor from './UIColor.js';

class UISwitch extends UIView {
    constructor() {
        super();
        this._isOn = false;
        this._onTintColor = UIColor.systemGreen();
        this._thumbTintColor = UIColor.white();
        this._isAccessibilityElement = true;
        this._accessibilityTraits = 0x20;
    }

    get isOn() { return this._isOn; }
    set isOn(value) { this._isOn = value; this._updateDisplay(); }

    get onTintColor() { return this._onTintColor; }
    set onTintColor(value) { this._onTintColor = value; this._updateDisplay(); }

    _updateDisplay() {
        if (typeof document !== 'undefined' && this._element) {
            this._element.style.background = this._isOn 
                ? (this._onTintColor ? this._onTintColor.toRGBAString() : '#34c759')
                : '#e8e8ed';
            this._element.style.cursor = 'pointer';
        }
        this.accessibilityLabel = `Switch ${this._isOn ? 'on' : 'off'}`;
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('div');
            this._element.style.position = 'absolute';
            this._element.style.width = '51px';
            this._element.style.height = '31px';
            this._element.style.borderRadius = '16px';
            this._element.style.transition = 'background 0.2s';
            this._updateDisplay();

            const track = document.createElement('div');
            track.style.cssText = 'position:absolute;width:43px;height:27px;background:#fff;border-radius:14px;top:2px;left:4px;transition:transform 0.2s;';
            track.className = 'switch-thumb';
            this._element.appendChild(track);

            this._element.addEventListener('click', () => {
                this._isOn = !this._isOn;
                this._updateDisplay();
                track.style.transform = this._isOn ? 'translateX(20px)' : 'translateX(0)';
                this.sendActionsForControlEvents('valueChanged');
            });
        }
        return this._element;
    }
}

UISwitch.prototype.sendActionsForControlEvents = function(event) {
    if (this._target && this._action) {
        this._action.call(this._target, this);
    }
};

UISwitch.prototype.addTarget = function(target, action) {
    this._target = target;
    this._action = action;
};

export default UISwitch;
