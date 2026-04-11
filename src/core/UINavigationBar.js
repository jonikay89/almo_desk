import UIView from './UIView.js';
import UIColor from './UIColor.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';
import { defineTypeAlias, invokeProtocolMethod } from './Protocol.js';
import { NavigationBarDelegate, NavigationBarDelegate as NavigationBarDelegateProtocol } from './TypeAliases.js';
import { kp, getProperty, updateProperty, compareBy, compareByDescending } from './Foundation.js';

defineTypeAlias('NavigationBarDelegateAlias', NavigationBarDelegate);

class UINavigationBar extends UIView {
    constructor() {
        super();
        this.topItem = null;
        this.backItem = null;
        this.barTintColor = UIColor.systemBackground();
        this.prefersLargeTitles = false;
        this.titleTextAttributes = {};
        this.items = [];
        this.delegate = null;
    }

    get description() {
        return `UINavigationBar(title: ${this.topItem?.title || 'none'})`;
    }

    itemsAsArray() {
        return [...this.items];
    }

    init() {
        this.element = document.createElement('nav');
        this.element.className = 'ui-navigationbar';
        this.element.style.display = 'flex';
        this.element.style.alignItems = 'center';
        this.element.style.height = '44px';
        this.element.style.backgroundColor = UIColor.systemBackground().css;
        this.element.style.borderBottom = '1px solid #ddd';
        this.element.style.padding = '0 16px';
        this.element.style.position = 'relative';
        this.element.style.zIndex = '100';

        return this;
    }

    pushNavigationItem(item, animated = true) {
        if (this.topItem) {
            this.backItem = this.topItem;
        }
        this.topItem = item;
        if (!this.items.includes(item)) {
            this.items.push(item);
        }
        
        if (this.delegate) {
            invokeProtocolMethod(NavigationBarDelegateProtocol, this.delegate, 'navigationBarDidSelectItem', this, item);
        }
        
        this.#render(animated);
    }

    popNavigationItem(animated = true) {
        const popped = this.topItem;
        this.topItem = this.backItem;
        this.backItem = null;
        
        if (this.delegate) {
            invokeProtocolMethod(NavigationBarDelegateProtocol, this.delegate, 'navigationBarDidSelectItem', this, this.topItem);
        }
        
        this.#render(animated);
        return popped;
    }

    #render(animated = true) {
        this.element.innerHTML = '';

        if (this.backItem) {
            const backButton = document.createElement('button');
            backButton.className = 'nav-back-button';
            backButton.textContent = '‹ Back';
            backButton.style.background = 'none';
            backButton.style.border = 'none';
            backButton.style.color = UIColor.systemBlue().css;
            backButton.style.fontSize = '17px';
            backButton.style.cursor = 'pointer';
            backButton.style.padding = '8px';
            backButton.style.marginLeft = '-8px';
            backButton.addEventListener('click', () => {
                this.popNavigationItem(true);
                if (this.backItem && typeof this.backItem.backAction === 'function') {
                    this.backItem.backAction();
                }
            });
            this.element.appendChild(backButton);
        }

        if (this.topItem) {
            const titleLabel = document.createElement('span');
            titleLabel.className = 'nav-title';
            titleLabel.textContent = this.topItem.title || '';
            titleLabel.style.flex = '1';
            titleLabel.style.textAlign = 'center';
            titleLabel.style.fontSize = '17px';
            titleLabel.style.fontWeight = '600';
            titleLabel.style.color = '#000';
            this.element.appendChild(titleLabel);
        }

        if (this.topItem && this.topItem.rightBarButtonItem) {
            const rightButton = document.createElement('button');
            rightButton.className = 'nav-right-button';
            rightButton.textContent = this.topItem.rightBarButtonItem.title || '';
            rightButton.style.background = 'none';
            rightButton.style.border = 'none';
            rightButton.style.color = UIColor.systemBlue().css;
            rightButton.style.fontSize = '17px';
            rightButton.style.cursor = 'pointer';
            rightButton.style.padding = '8px';
            if (this.topItem.rightBarButtonItem.action) {
                rightButton.addEventListener('click', this.topItem.rightBarButtonItem.action);
            }
            this.element.appendChild(rightButton);
        }
    }

    setBarTintColor(color) {
        this.barTintColor = color;
        if (this.element) {
            this.element.style.backgroundColor = color.css;
        }
    }

    setTitleTextAttributes(attributes) {
        this.titleTextAttributes = attributes;
    }

    setPrefersLargeTitles(prefersLarge) {
        this.prefersLargeTitles = prefersLarge;
        this.#render(false);
        return this;
    }

    setBarTintColor(color) {
        this.barTintColor = color;
        if (this.element) {
            this.element.style.backgroundColor = color?.css || color;
        }
        return this;
    }

    setTitleTextAttributes(attributes) {
        this.titleTextAttributes = attributes;
        this.#render(false);
        return this;
    }

    layoutSubviews() {
        super.layoutSubviews();
        if (this._gradientLayer || this._shapeLayers?.length > 0) {
            this.#renderLayers();
        }
    }

    #renderLayers() {
        if (!this.element) return;
        const existingCanvas = this.element.querySelector('.layer-canvas');
        if (existingCanvas) existingCanvas.remove();
        if (this._layer?._sublayers?.length === 0) return;
        const canvas = document.createElement('canvas');
        canvas.className = 'layer-canvas';
        canvas.style.position = 'absolute';
        canvas.style.left = '0';
        canvas.style.top = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.width = this._bounds.width * 2;
        canvas.height = this._bounds.height * 2;
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);
        for (const sublayer of this._layer._sublayers) {
            sublayer.renderToContext(ctx);
        }
        this.element.style.position = 'relative';
        this.element.insertBefore(canvas, this.element.firstChild);
    }

    withBarTintColor(color) {
        return this.setBarTintColor(color);
    }

    withTitleTextAttributes(attributes) {
        return this.setTitleTextAttributes(attributes);
    }

    withPrefersLargeTitles(prefersLarge) {
        return this.setPrefersLargeTitles(prefersLarge);
    }

    withShadow(color, opacity, offset, radius) {
        this.setShadow?.(color, opacity, offset, radius);
        return this;
    }

    withGradient(colors, locations, startPoint, endPoint) {
        if (this._layer) {
            const { CAGradientLayer } = require('./CALayer.js');
            const gradient = CAGradientLayer.layer();
            gradient.colors = colors;
            gradient.frame = { x: 0, y: 0, width: this._bounds.width, height: this._bounds.height };
            if (locations) gradient.locations = locations;
            if (startPoint) gradient.startPoint = startPoint;
            if (endPoint) gradient.endPoint = endPoint;
            gradient.name = 'navGradientLayer';
            this._layer.addSublayer(gradient);
            this.#renderLayers();
        }
        return this;
    }

    encode() {
        return {
            items: this.items.map(item => ({ title: item.title })),
            prefersLargeTitles: this.prefersLargeTitles
        };
    }

    static decode(data) {
        const navBar = new UINavigationBar();
        navBar.prefersLargeTitles = data.prefersLargeTitles || false;
        return navBar;
    }

    matchBar(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        return Switch(predicate)
            .case({ prefersLargeTitles: true }, () => this.prefersLargeTitles === true)
            .case({ prefersLargeTitles: false }, () => this.prefersLargeTitles === false)
            .case({ hasTopItem: true }, () => this.topItem !== null)
            .case({ hasTopItem: false }, () => this.topItem === null)
            .case({ hasBackItem: true }, () => this.backItem !== null)
            .case({ hasBackItem: false }, () => this.backItem === null)
            .case({ itemCount: Switch.let('n') }, (m) => this.items.length === m.n)
            .case({ topItem: Switch.let('item') }, (m) => {
                if (!this.topItem) return false;
                if (typeof m.item === 'string') return this.topItem.title === m.item;
                if (m.item && typeof m.item === 'object') return this.topItem.matchItem(m.item);
                return false;
            })
            .default(() => false)
            .evaluate();
    }

    matchItem(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        return Switch(predicate)
            .case({ title: Switch.let('t') }, (m) => this.topItem?.title === m.t)
            .case({ hasLeftBarButtonItem: true }, () => this.topItem?.leftBarButtonItem !== null)
            .case({ hasLeftBarButtonItem: false }, () => !this.topItem?.leftBarButtonItem)
            .case({ hasRightBarButtonItem: true }, () => this.topItem?.rightBarButtonItem !== null)
            .case({ hasRightBarButtonItem: false }, () => !this.topItem?.rightBarButtonItem)
            .default(() => false)
            .evaluate();
    }

    switch() {
        return Switch(this);
    }

    patternMatch(predicate) {
        return this.matchBar(predicate);
    }

    sortItemsBy(keyPath, ascending = true) {
        const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
        this.items = ascending 
            ? this.items.slice().sort((a, b) => compareBy(a, b, path))
            : this.items.slice().sort((a, b) => compareByDescending(a, b, path));
        this.#render();
        return this;
    }

    findItem(predicate) {
        return this.items.find(predicate) || null;
    }

    findItemBy(keyPath, value) {
        const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
        return this.items.find(item => getProperty(item, path) === value) || null;
    }

    filterItems(predicate) {
        this.items = this.items.filter(predicate);
        if (this.topItem && !this.items.includes(this.topItem)) {
            this.topItem = this.items[this.items.length - 1] || null;
        }
        this.#render();
        return this;
    }

    filterItemsBy(keyPath, value) {
        const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
        return this.filterItems(item => getProperty(item, path) === value);
    }

    updateTopItem(keyPath, newValue) {
        if (this.topItem) {
            const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
            updateProperty(this.topItem, path, newValue);
            this.#render();
        }
        return this;
    }

    getTopItemValue(keyPath) {
        if (this.topItem) {
            const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
            return getProperty(this.topItem, path);
        }
        return null;
    }
}

class UINavigationItem {
    constructor(title) {
        this.title = title;
        this.leftBarButtonItem = null;
        this.rightBarButtonItem = null;
        this.backAction = null;
    }

    get description() {
        return `UINavigationItem(title: ${this.title})`;
    }

    setLeftBarButtonItem(item) {
        this.leftBarButtonItem = item;
    }

    setRightBarButtonItem(item) {
        this.rightBarButtonItem = item;
    }

    setHidesBackButton(hidesBackButton) {
    }

    encode() {
        return {
            title: this.title
        };
    }

    static decode(data) {
        return new UINavigationItem(data.title || '');
    }

    matchItem(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        return Switch(predicate)
            .case({ title: Switch.let('t') }, (m) => this.title === m.t)
            .case({ hasLeftBarButtonItem: true }, () => this.leftBarButtonItem !== null)
            .case({ hasLeftBarButtonItem: false }, () => this.leftBarButtonItem === null)
            .case({ hasRightBarButtonItem: true }, () => this.rightBarButtonItem !== null)
            .case({ hasRightBarButtonItem: false }, () => this.rightBarButtonItem === null)
            .case({ leftItem: Switch.let('item') }, (m) => {
                if (!this.leftBarButtonItem) return false;
                if (typeof m.item === 'string') return this.leftBarButtonItem.title === m.item;
                return false;
            })
            .case({ rightItem: Switch.let('item') }, (m) => {
                if (!this.rightBarButtonItem) return false;
                if (typeof m.item === 'string') return this.rightBarButtonItem.title === m.item;
                return false;
            })
            .default(() => false)
            .evaluate();
    }

    switch() {
        return Switch(this);
    }

    patternMatch(predicate) {
        return this.matchItem(predicate);
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

    updateTitle(keyPath, newValue) {
        const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
        updateProperty(this, path, newValue);
        return this;
    }

    getTitle() {
        return this.title;
    }

    getValue(keyPath) {
        const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
        return getProperty(this, path);
    }
}

UINavigationItem.prototype.setTitle = function(title) {
    this.title = title;
    return this;
};

UINavigationItem.prototype.setLeftBarButtonItem = function(item) {
    this.leftBarButtonItem = item;
    return this;
};

UINavigationItem.prototype.setRightBarButtonItem = function(item) {
    this.rightBarButtonItem = item;
    return this;
};

UINavigationItem.prototype.updateTitle = function(keyPath, newValue) {
    const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
    updateProperty(this, path, newValue);
    return this;
};

UINavigationItem.prototype.getTitle = function() {
    return this.title;
};

UINavigationItem.prototype.getValue = function(keyPath) {
    const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
    return getProperty(this, path);
};

export default UINavigationBar;
export { UINavigationItem };