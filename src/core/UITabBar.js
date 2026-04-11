import UIView from './UIView.js';
import UIColor from './UIColor.js';
import { NSNumber, kp, getProperty, updateProperty, compareBy, compareByDescending } from './Foundation.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';
import { defineTypeAlias, invokeProtocolMethod } from './Protocol.js';
import { TabBarDelegate, TabBarDelegate as TabBarDelegateProtocol } from './TypeAliases.js';

defineTypeAlias('TabBarDelegateAlias', TabBarDelegate);

class UITabBar extends UIView {
    constructor() {
        super();
        this.items = [];
        this.selectedItem = null;
        this.tintColor = UIColor.systemBlue();
        this.barTintColor = UIColor.systemBackground();
        this.delegate = null;
    }

    init() {
        this.element = document.createElement('div');
        this.element.className = 'ui-tabbar';
        this.element.style.display = 'flex';
        this.element.style.alignItems = 'center';
        this.element.style.justifyContent = 'space-around';
        this.element.style.height = '49px';
        this.element.style.backgroundColor = UIColor.systemBackground().css;
        this.element.style.borderTop = '1px solid #ddd';
        this.element.style.position = 'relative';
        this.element.style.zIndex = '100';

        return this;
    }

    setItems(items, animated = true) {
        this.items = items;
        this.#render();
    }

    #render() {
        this.element.innerHTML = '';

        this.items.forEach((item, index) => {
            const tabItem = document.createElement('div');
            tabItem.className = 'ui-tabbar-item';
            tabItem.style.display = 'flex';
            tabItem.style.flexDirection = 'column';
            tabItem.style.alignItems = 'center';
            tabItem.style.justifyContent = 'center';
            tabItem.style.flex = '1';
            tabItem.style.height = '100%';
            tabItem.style.cursor = 'pointer';
            tabItem.style.padding = '4px 8px';
            tabItem.dataset.index = index;

            if (item.image) {
                const img = document.createElement('img');
                img.src = item.image;
                img.alt = item.title || '';
                img.style.width = '24px';
                img.style.height = '24px';
                img.style.objectFit = 'contain';
                tabItem.appendChild(img);
            } else if (item.emoji) {
                const emoji = document.createElement('span');
                emoji.textContent = item.emoji;
                emoji.style.fontSize = '22px';
                tabItem.appendChild(emoji);
            }

            if (item.title) {
                const label = document.createElement('span');
                label.textContent = item.title;
                label.style.fontSize = '10px';
                label.style.marginTop = '2px';
                tabItem.appendChild(label);
            }

            tabItem.addEventListener('click', () => {
                this.#selectItem(index);
            });

            this.element.appendChild(tabItem);
        });

        if (this.selectedItem) {
            const selectedIndex = this.items.indexOf(this.selectedItem);
            if (selectedIndex >= 0) {
                this.#updateSelection(selectedIndex);
            }
        }
    }

    #selectItem(index) {
        const previousIndex = this.selectedItem ? this.items.indexOf(this.selectedItem) : -1;
        this.selectedItem = this.items[index];
        this.#updateSelection(index);

        if (this.delegate) {
            const result = invokeProtocolMethod(TabBarDelegateProtocol, this.delegate, 'tabBarDidSelectItem', this, index);
            if (result !== null && result !== undefined) {
                return result;
            }
        }
        return null;
    }

    #updateSelection(selectedIndex) {
        const tabItems = this.element.querySelectorAll('.ui-tabbar-item');
        tabItems.forEach((item, index) => {
            const label = item.querySelector('span');
            if (index === selectedIndex) {
                item.style.color = this.tintColor.css;
                if (label) {
                    label.style.fontWeight = '600';
                }
            } else {
                item.style.color = '#888';
                if (label) {
                    label.style.fontWeight = 'normal';
                }
            }
        });
    }

    setTintColor(color) {
        this.tintColor = color;
        this.#updateSelection(this.selectedItem ? this.items.indexOf(this.selectedItem) : 0);
    }

    setBarTintColor(color) {
        this.barTintColor = color;
        if (this.element) {
            this.element.style.backgroundColor = color.css;
        }
    }

    setSelectedItem(item) {
        this.selectedItem = item;
        const index = this.items.indexOf(item);
        if (index >= 0) {
            this.#updateSelection(index);
        }
        return this;
    }

    setTintColor(color) {
        this.tintColor = color;
        return this;
    }

    setBarTintColor(color) {
        this.barTintColor = color;
        if (this.element) {
            this.element.style.backgroundColor = color?.css || color;
        }
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

    withTintColor(color) {
        return this.setTintColor(color);
    }

    withBarTintColor(color) {
        return this.setBarTintColor(color);
    }

    withSelectedItem(item) {
        return this.setSelectedItem(item);
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
            gradient.name = 'tabGradientLayer';
            this._layer.addSublayer(gradient);
            this.#renderLayers();
        }
        return this;
    }

    get description() {
        const selectedDesc = this.selectedItem ? `, selectedItem: "${this.selectedItem.title}"` : '';
        return `UITabBar(items: ${this.items.length}${selectedDesc})`;
    }

    itemsAsArray() {
        return this.items.map(item => item);
    }

    encode() {
        return {
            items: this.items.map(item => item.encode ? item.encode() : { title: item.title, image: item.image }),
            selectedItem: this.selectedItem ? this.items.indexOf(this.selectedItem) : -1
        };
    }

    static decode(data) {
        const tabBar = new UITabBar();
        tabBar.items = data.items.map(itemData => UITabBarItem.decode ? UITabBarItem.decode(itemData) : itemData);
        if (data.selectedItem >= 0 && data.selectedItem < tabBar.items.length) {
            tabBar.selectedItem = tabBar.items[data.selectedItem];
        }
        return tabBar;
    }

    matchTab(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        return Switch(predicate)
            .case({ itemCount: Switch.let('n') }, (m) => this.items.length === m.n)
            .case({ hasSelectedItem: true }, () => this.selectedItem !== null)
            .case({ hasSelectedItem: false }, () => this.selectedItem === null)
            .case({ selectedIndex: Switch.let('i') }, (m) => {
                const idx = typeof m.i === 'number' ? m.i : parseInt(m.i);
                return this.items[idx] === this.selectedItem;
            })
            .case({ selectedItem: Switch.let('item') }, (m) => {
                if (!this.selectedItem) return false;
                if (typeof m.item === 'string') return this.selectedItem.title === m.item;
                if (m.item && typeof m.item === 'object') return this.selectedItem.matchItem(m.item);
                return false;
            })
            .case({ itemAt: Switch.let('i'), titled: Switch.let('title') }, (m) => {
                const idx = typeof m.i === 'number' ? m.i : parseInt(m.i);
                return this.items[idx] && this.items[idx].title === m.title;
            })
            .default(() => false)
            .evaluate();
    }

    matchSelection(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        const tabBar = this;
        return Switch(predicate)
            .case({ index: Switch.let('i') }, (m) => {
                const idx = typeof m.i === 'number' ? m.i : parseInt(m.i);
                return tabBar.items[idx] === tabBar.selectedItem;
            })
            .case({ title: Switch.let('t') }, (m) => tabBar.selectedItem?.title === m.t)
            .case({ tagged: Switch.let('tag') }, (m) => tabBar.selectedItem?.tag === m.tag)
            .case({ hasBadge: true }, () => tabBar.selectedItem?.badgeValue != null)
            .case({ hasBadge: false }, () => tabBar.selectedItem?.badgeValue == null)
            .default(() => false)
            .evaluate();
    }

    switch() {
        return Switch(this);
    }

    patternMatch(predicate) {
        return this.matchTab(predicate);
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
        const selectedItem = this.selectedItem;
        this.items = this.items.filter(predicate);
        if (selectedItem && !this.items.includes(selectedItem)) {
            this.selectedItem = this.items[0] || null;
        }
        this.#render();
        return this;
    }

    filterItemsBy(keyPath, value) {
        const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
        return this.filterItems(item => getProperty(item, path) === value);
    }

    updateSelectedItem(keyPath, newValue) {
        if (this.selectedItem) {
            const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
            updateProperty(this.selectedItem, path, newValue);
            this.#render();
        }
        return this;
    }

    getSelectedItemValue(keyPath) {
        if (this.selectedItem) {
            const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
            return getProperty(this.selectedItem, path);
        }
        return null;
    }
}

class UITabBarItem {
    constructor(title, image, selectedImage) {
        this.title = title;
        this.image = image;
        this.selectedImage = selectedImage;
        this.badgeValue = null;
        this.tag = 0;
    }

    get description() {
        return `UITabBarItem(title: "${this.title}", image: ${this.image || 'null'}, badgeValue: ${this.badgeValue || 'null'})`;
    }

    badgeValueAsNumber() {
        return this.badgeValue != null ? NSNumber.of(this.badgeValue) : null;
    }

    tagAsNumber() {
        return NSNumber.of(this.tag);
    }

    encode() {
        return {
            title: this.title,
            image: this.image,
            selectedImage: this.selectedImage,
            badgeValue: this.badgeValue,
            tag: this.tag
        };
    }

    static decode(data) {
        const item = new UITabBarItem(data.title, data.image, data.selectedImage);
        item.badgeValue = data.badgeValue;
        item.tag = data.tag;
        return item;
    }

    static systemItem(systemItem) {
        const items = {
            more: { title: 'More', emoji: '⋯' },
            favorites: { title: 'Favorites', emoji: '♥' },
            featured: { title: 'Featured', emoji: '★' },
            topRated: { title: 'Top Rated', emoji: '👍' },
            recents: { title: 'Recents', emoji: '↺' },
            contacts: { title: 'Contacts', emoji: '👤' },
            history: { title: 'History', emoji: '⏱' },
            bookmarks: { title: 'Bookmarks', emoji: '🔖' },
            search: { title: 'Search', emoji: '🔍' },
            downloads: { title: 'Downloads', emoji: '⬇️' },
        };
        return new UITabBarItem(items[systemItem]?.title, null, null);
    }

    matchItem(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        return Switch(predicate)
            .case({ title: Switch.let('t') }, (m) => this.title === m.t)
            .case({ badge: Switch.let('b') }, (m) => this.badgeValue === m.b)
            .case({ hasBadge: true }, () => this.badgeValue != null)
            .case({ hasBadge: false }, () => this.badgeValue == null)
            .case({ tagged: Switch.let('tag') }, (m) => this.tag === m.tag)
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

    updateTitle(keyPath, newValue) {
        const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
        updateProperty(this, path, newValue);
        return this;
    }

    getTitle() {
        return this.title;
    }

    getBadgeValue() {
        return this.badgeValue;
    }

    getValue(keyPath) {
        const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
        return getProperty(this, path);
    }
}

UITabBarItem.prototype.setTitle = function(title) {
    this.title = title;
    return this;
};

UITabBarItem.prototype.setBadgeValue = function(badgeValue) {
    this.badgeValue = badgeValue;
    return this;
};

UITabBarItem.prototype.updateTitle = function(keyPath, newValue) {
    const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
    updateProperty(this, path, newValue);
    return this;
};

UITabBarItem.prototype.getTitle = function() {
    return this.title;
};

UITabBarItem.prototype.getBadgeValue = function() {
    return this.badgeValue;
};

UITabBarItem.prototype.getValue = function(keyPath) {
    const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
    return getProperty(this, path);
};

export default UITabBar;
export { UITabBarItem };