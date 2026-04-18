import UIView from './UIView.js';
import UIColor from './UIColor.js';

class UIProgressView extends UIView {
    constructor() {
        super();
        this._progress = 0.5;
        this._trackTintColor = UIColor.gray(0.3);
        this._progressTintColor = UIColor.systemBlue();
    }

    get progress() { return this._progress; }
    set progress(value) { this._progress = Math.max(0, Math.min(1, value)); this._updateDisplay(); }

    get trackTintColor() { return this._trackTintColor; }
    set trackTintColor(value) { this._trackTintColor = value; this._updateDisplay(); }

    get progressTintColor() { return this._progressTintColor; }
    set progressTintColor(value) { this._progressTintColor = value; this._updateDisplay(); }

    _updateDisplay() {
        if (typeof document !== 'undefined' && this._element) {
            this._element.style.setProperty('--progress', `${this._progress * 100}%`);
        }
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('div');
            this._element.style.cssText = `
                position: absolute;
                height: 4px;
                background: #e0e0e0;
                border-radius: 2px;
                overflow: hidden;
            `;
            this._progressBar = document.createElement('div');
            this._progressBar.style.cssText = `
                position: absolute;
                height: 100%;
                width: var(--progress, 50%);
                background: #007aff;
                transition: width 0.3s;
            `;
            this._element.appendChild(this._progressBar);
            this._updateDisplay();
        }
        return this._element;
    }
}

export default UIProgressView;
