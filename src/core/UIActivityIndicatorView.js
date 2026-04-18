import { forCase, guardCase, guardLet, ifCase, ifLet, patternMatch, whileCase } from './PatternMatching.js';
import Switch from './Switch.js';
import UIColor from './UIColor.js';
import UIView from './UIView.js';

class UIActivityIndicatorView extends UIView {
    constructor() {
        super();
        this.style = 'medium';
        this.color = UIColor.systemBlue();
        this.hidesWhenStopped = true;
        this._isAnimating = false;
        
        this._isAccessibilityElement = true;
        this._accessibilityTraits = ['progressIndicator'];
    }

    get description() {
        return `UIActivityIndicatorView(style: ${this.style}, isAnimating: ${this._isAnimating})`;
    }

    get isAnimating() {
        return this._isAnimating;
    }

    init() {
        super.init();
        this._layer.cssClass = 'ui-activityindicator';
        this.element.className = 'ui-activityindicator';
        this._updateSpinnerColor();
        this._accessibilityLabel = this._isAnimating ? 'Loading' : 'Loaded';
        this._accessibilityValue = this._isAnimating ? 'In progress' : 'Stopped';

        const sizes = { small: 16, medium: 24, large: 36 };
        const size = sizes[this.style] || 24;
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
        
        if (this.hidesWhenStopped && !this._isAnimating) {
            this.element.classList.add('hidden');
        }

        return this;
    }

    _updateSpinnerColor() {
        const spinner = this.element.querySelector('.ui-activityindicator-spinner');
        if (spinner) {
            spinner.style.borderTopColor = this.color.css;
        }
    }

    startAnimating() {
        this._isAnimating = true;
        this.element.classList.remove('hidden');
        this.element.classList.add('spinning');
        this._accessibilityLabel = 'Loading';
        this._accessibilityValue = 'In progress';
    }

    stopAnimating() {
        this._isAnimating = false;
        this.element.classList.remove('spinning');
        if (this.hidesWhenStopped) {
            this.element.classList.add('hidden');
        }
        this._accessibilityLabel = 'Loaded';
        this._accessibilityValue = 'Stopped';
    }

    setStyle(style) {
        this.style = style;
        const sizes = { small: 16, medium: 24, large: 36 };
        const size = sizes[style] || 24;
        
        this.element.classList.remove('small', 'medium', 'large');
        this.element.classList.add(style);
        
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
        return this;
    }

    setColor(color) {
        if (color instanceof UIColor) {
            this.color = color;
        } else if (typeof color === 'string') {
            this.color = UIColor.colorWithHex(color);
        }
        this._updateSpinnerColor();
        return this;
    }

    setHidesWhenStopped(hides) {
        this.hidesWhenStopped = hides;
        if (!this._isAnimating && hides) {
            this.element.classList.add('hidden');
        } else if (!this._isAnimating && !hides) {
            this.element.classList.remove('hidden');
        }
        return this;
    }

    withStyle(style) {
        return this.setStyle(style);
    }

    withColor(color) {
        return this.setColor(color);
    }

    withHidesWhenStopped(hides) {
        return this.setHidesWhenStopped(hides);
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
