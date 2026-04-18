import UIView from './UIView.js';
import NSObject from './NSObject.js';

class UITabBarItem extends NSObject {
    constructor(title, image, selectedImage) {
        super();
        this._title = title;
        this._image = image;
        this._selectedImage = selectedImage;
        this._badgeValue = null;
    }

    get title() { return this._title; }
    get badgeValue() { return this._badgeValue; }
    set badgeValue(value) { this._badgeValue = value; }
}

class UITabBar extends UIView {
    constructor() {
        super();
        this._items = [];
        this._selectedIndex = 0;
    }

    get selectedIndex() { return this._selectedIndex; }
    set selectedIndex(value) { this._selectedIndex = value; }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('div');
            this._element.style.cssText = 'height:49px;background:#f8f8f8;border-top:1px solid #ccc;display:flex;';
        }
        return this._element;
    }
}

export default UITabBar;
export { UITabBarItem };
