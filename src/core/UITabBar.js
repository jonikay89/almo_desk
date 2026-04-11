import UIView from './UIView.js';
import UIColor from './UIColor.js';
import { NSNumber } from './Foundation.js';

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

        if (this.delegate && typeof this.delegate.tabBar_didSelectItem === 'function') {
            this.delegate.tabBar_didSelectItem(this, index);
        }
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
    }

    layoutSubviews() {
        super.layoutSubviews();
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
}

export default UITabBar;
export { UITabBarItem };