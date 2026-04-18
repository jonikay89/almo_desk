import UIView from './UIView.js';

class UIActivityIndicatorView extends UIView {
    constructor(style = 'medium') {
        super();
        this._style = style;
        this._isAnimating = false;
    }

    get isAnimating() { return this._isAnimating; }

    startAnimating() {
        this._isAnimating = true;
        if (this._element) {
            this._element.classList.add('animating');
        }
    }

    stopAnimating() {
        this._isAnimating = false;
        if (this._element) {
            this._element.classList.remove('animating');
        }
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('div');
            this._element.style.cssText = `
                width: ${this._style === 'large' ? '40px' : '20px'};
                height: ${this._style === 'large' ? '40px' : '20px'};
                border: 3px solid #ccc;
                border-top-color: #007aff;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            `;
            if (typeof document.head !== 'undefined' && !document.querySelector('#activity-style')) {
                const style = document.createElement('style');
                style.id = 'activity-style';
                style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
                document.head.appendChild(style);
            }
        }
        return this._element;
    }
}

export default UIActivityIndicatorView;
