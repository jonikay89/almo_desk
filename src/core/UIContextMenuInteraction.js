import NSObject from './NSObject.js';

class UIMenuElement {
    constructor(title, options = {}) {
        this._title = title;
        this._image = options.image || null;
        this._attributes = options.attributes || [];
        this._state = options.state || 'off';
    }

    get title() { return this._title; }
    get image() { return this._image; }
    get attributes() { return this._attributes; }
    get state() { return this._state; }
}

class UIAction extends UIMenuElement {
    constructor(title, options = {}) {
        super(title, options);
        this._handler = options.handler || null;
        this._identifier = options.identifier || null;
        this._discoverabilityTitle = options.discoverabilityTitle || null;
    }

    static actionWithTitle(title, image, identifier, handler) {
        return new UIAction(title, { image, identifier, handler });
    }

    get handler() { return this._handler; }
    get identifier() { return this._identifier; }
}

class UIMenu extends UIMenuElement {
    constructor(title, options = {}) {
        super(title, options);
        this._children = options.children || [];
        this._identifier = options.identifier || null;
        this._subtitle = options.subtitle || null;
    }

    static menuWithTitle(title, options = {}) {
        return new UIMenu(title, options);
    }

    get children() { return this._children; }
    get identifier() { return this._identifier; }
    get subtitle() { return this._subtitle; }

    menuByReplacingChildren(children) {
        return new UIMenu(this._title, {
            ...this._options,
            children
        });
    }
}

class UIContextMenuInteraction extends NSObject {
    constructor(delegate = null) {
        super();
        this._delegate = delegate;
        this._menu = null;
        this._isActive = false;
        this._view = null;
    }

    get delegate() { return this._delegate; }
    get isActive() { return this._isActive; }
    get view() { return this._view; }

    willPresentMenu() {
        this._isActive = true;
        if (this._delegate && this._delegate.contextMenuInteraction_menuForPoint) {
            return this._delegate.contextMenuInteraction_menuForPoint(this, { x: 0, y: 0 });
        }
        return this._menu;
    }

    willEnd() {
        this._isActive = false;
    }

    setMenu(menu) {
        this._menu = menu;
    }
}

export default UIContextMenuInteraction;
export { UIMenuElement, UIAction, UIMenu };
