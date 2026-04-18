import NSObject from './NSObject.js';

class UIAccessibility extends NSObject {
    static get Traits() {
        return {
            button: 'button',
            link: 'link',
            header: 'header',
            searchField: 'searchField',
            image: 'image',
            selected: 'selected',
            playsSound: 'playsSound',
            keyboardKey: 'keyboardKey',
            staticText: 'staticText',
            summaryElement: 'summaryElement',
            notEnabled: 'notEnabled',
            updatesFrequently: 'updatesFrequently'
        };
    }

    static get Notification() {
        return {
            screenChanged: 'screenChanged',
            layoutChanged: 'layoutChanged',
            pageScrolled: 'pageScrolled',
           Announcement: 'announcement'
        };
    }
}

class UIAccessibilityElement extends NSObject {
    constructor(accessibilityContainer) {
        super();
        this._container = accessibilityContainer;
        this._isAccessibilityElement = true;
        this._accessibilityLabel = '';
        this._accessibilityHint = '';
        this._accessibilityValue = '';
        this._accessibilityTraits = 0;
        this._isAccessibilityEnabled = true;
        this._accessibilityElements = [];
    }

    get isAccessibilityElement() {
        return this._isAccessibilityElement;
    }

    set isAccessibilityElement(value) {
        this._isAccessibilityElement = value;
    }

    get accessibilityLabel() {
        return this._accessibilityLabel;
    }

    set accessibilityLabel(value) {
        this._accessibilityLabel = value;
    }

    get accessibilityHint() {
        return this._accessibilityHint;
    }

    set accessibilityHint(value) {
        this._accessibilityHint = value;
    }

    get accessibilityValue() {
        return this._accessibilityValue;
    }

    set accessibilityValue(value) {
        this._accessibilityValue = value;
    }

    get accessibilityTraits() {
        return this._accessibilityTraits;
    }

    set accessibilityTraits(value) {
        this._accessibilityTraits = value;
    }

    get isAccessibilityEnabled() {
        return this._isAccessibilityEnabled;
    }

    set isAccessibilityEnabled(value) {
        this._isAccessibilityEnabled = value;
    }

    get accessibilityContainer() {
        return this._container;
    }
}

export { UIAccessibility, UIAccessibilityElement };
export default UIAccessibility;
