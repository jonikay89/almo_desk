import UIView from './UIView.js';
import UIColor from './UIColor.js';
import { NSNumber } from './Foundation.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';

class UIActivityIndicatorView extends UIView {
    constructor() {
        super();
        this.style = 'medium';
        this.color = UIColor.systemBlue();
        this.hidesWhenStopped = true;
        this._isAnimating = false;
    }

    get description() {
        return `UIActivityIndicatorView(style: ${this.style}, isAnimating: ${this._isAnimating})`;
    }

    get isAnimating() {
        return this._isAnimating;
    }

    init() {
        this.element = document.createElement('div');
        this.element.className = 'ui-activityindicator';
        this.element.style.position = 'relative';
        this.element.style.display = 'inline-block';

        const sizes = {
            small: 16,
            medium: 24,
            large: 36
        };
        const size = sizes[this.style] || 24;

        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;

        this.spinnerElement = document.createElement('div');
        this.spinnerElement.style.width = '100%';
        this.spinnerElement.style.height = '100%';
        this.spinnerElement.style.borderRadius = '50%';
        this.spinnerElement.style.border = `${size / 6}px solid rgba(0,0,0,0.1)`;
        this.spinnerElement.style.borderTopColor = this.color.css;
        this.spinnerElement.style.animation = 'ui-activity-spin 0.8s linear infinite';

        const styleEl = document.createElement('style');
        styleEl.textContent = `
            @keyframes ui-activity-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        if (!document.querySelector('#ui-activity-styles')) {
            styleEl.id = 'ui-activity-styles';
            document.head.appendChild(styleEl);
        }

        this.element.appendChild(this.spinnerElement);

        if (this.hidesWhenStopped && !this._isAnimating) {
            this.element.style.display = 'none';
        }

        return this;
    }

    startAnimating() {
        this._isAnimating = true;
        if (this.spinnerElement) {
            this.spinnerElement.style.animation = 'ui-activity-spin 0.8s linear infinite';
        }
        if (this.hidesWhenStopped && this.element) {
            this.element.style.display = 'inline-block';
        }
    }

    stopAnimating() {
        this._isAnimating = false;
        if (this.spinnerElement) {
            this.spinnerElement.style.animation = 'none';
        }
        if (this.hidesWhenStopped && this.element) {
            this.element.style.display = 'none';
        }
    }

    setStyle(style) {
        this.style = style;
        if (this.element) {
            const sizes = { small: 16, medium: 24, large: 36 };
            const size = sizes[style] || 24;
            this.element.style.width = `${size}px`;
            this.element.style.height = `${size}px`;
            this.spinnerElement.style.borderWidth = `${size / 6}px`;
        }
    }

    setColor(color) {
        if (color instanceof UIColor) {
            this.color = color;
        } else if (typeof color === 'string') {
            this.color = UIColor.colorWithHex(color);
        }
        if (this.spinnerElement) {
            this.spinnerElement.style.borderTopColor = this.color.css;
        }
    }

    setHidesWhenStopped(hides) {
        this.hidesWhenStopped = hides;
        if (!this._isAnimating && hides && this.element) {
            this.element.style.display = 'none';
        }
    }

    layoutSubviews() {
        super.layoutSubviews();
    }

    encode() {
        return {
            style: this.style,
            hidesWhenStopped: this.hidesWhenStopped
        };
    }

    static decode(data) {
        const indicator = new UIActivityIndicatorView();
        indicator.style = data.style || 'medium';
        indicator.hidesWhenStopped = data.hidesWhenStopped !== false;
        return indicator;
    }

    matchState(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this._isAnimating);
        }
        return Switch(predicate)
            .case('animating', () => this._isAnimating === true)
            .case('stopped', () => this._isAnimating === false)
            .case('hidden', () => this._isAnimating === false && this.hidesWhenStopped)
            .case(true, () => this._isAnimating === true)
            .case(false, () => this._isAnimating === false)
            .default(() => false)
            .evaluate();
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

    ifLet(pattern) {
        return ifLet(this, pattern);
    }

    guardLet(pattern) {
        return guardLet(this, pattern);
    }

    switch() {
        return Switch(this);
    }
}

export default UIActivityIndicatorView;