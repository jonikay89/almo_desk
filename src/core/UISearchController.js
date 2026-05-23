import UIView from './UIView.js';
import UIViewController from './UIViewController.js';

class UISearchController extends UIViewController {
    constructor(searchResultsController = null) {
        super();
        this._searchResultsController = searchResultsController;
        this._searchBar = null;
        this._isActive = false;
        this._obscuresBackgroundDuringPresentation = true;
        this._hidesNavigationBarDuringPresentation = true;
        this._searchResultsUpdater = null;
        this._delegate = null;
        this._searchBar = new UISearchBar();
    }

    get searchBar() { return this._searchBar; }

    get searchResultsController() { return this._searchResultsController; }

    get isActive() { return this._isActive; }
    set isActive(value) {
        this._isActive = value;
        if (this._delegate && this._delegate.presentSearchController) {
            if (value) this._delegate.presentSearchController(this);
        }
        if (!value && this._delegate && this._delegate.dismissSearchController) {
            this._delegate.dismissSearchController(this);
        }
    }

    get obscuresBackgroundDuringPresentation() { return this._obscuresBackgroundDuringPresentation; }
    set obscuresBackgroundDuringPresentation(value) { this._obscuresBackgroundDuringPresentation = value; }

    get hidesNavigationBarDuringPresentation() { return this._hidesNavigationBarDuringPresentation; }
    set hidesNavigationBarDuringPresentation(value) { this._hidesNavigationBarDuringPresentation = value; }

    get searchResultsUpdater() { return this._searchResultsUpdater; }
    set searchResultsUpdater(value) { this._searchResultsUpdater = value; }

    get delegate() { return this._delegate; }
    set delegate(value) { this._delegate = value; }
}

class UISearchBar extends UIView {
    constructor() {
        super();
        this._placeholder = 'Search';
        this._text = '';
        this._prompt = null;
        this._searchBarStyle = 'default';
        this._showsCancelButton = false;
        this._showsSearchResultsButton = false;
        this._showsBookmarkButton = false;
        this._tintColor = null;
        this._barTintColor = null;
        this._delegate = null;
        this._scopeButtonTitles = null;
        this._selectedScopeButtonIndex = 0;
    }

    get placeholder() { return this._placeholder; }
    set placeholder(value) { this._placeholder = value; }

    get text() { return this._text; }
    set text(value) { this._text = value; }

    get prompt() { return this._prompt; }
    set prompt(value) { this._prompt = value; }

    get searchBarStyle() { return this._searchBarStyle; }
    set searchBarStyle(value) { this._searchBarStyle = value; }

    get showsCancelButton() { return this._showsCancelButton; }
    set showsCancelButton(value) { this._showsCancelButton = value; }

    get showsSearchResultsButton() { return this._showsSearchResultsButton; }
    set showsSearchResultsButton(value) { this._showsSearchResultsButton = value; }

    get showsBookmarkButton() { return this._showsBookmarkButton; }
    set showsBookmarkButton(value) { this._showsBookmarkButton = value; }

    get tintColor() { return this._tintColor; }
    set tintColor(value) { this._tintColor = value; }

    get barTintColor() { return this._barTintColor; }
    set barTintColor(value) { this._barTintColor = value; }

    get delegate() { return this._delegate; }
    set delegate(value) { this._delegate = value; }

    get scopeButtonTitles() { return this._scopeButtonTitles; }
    set scopeButtonTitles(value) { this._scopeButtonTitles = value; }

    get selectedScopeButtonIndex() { return this._selectedScopeButtonIndex; }
    set selectedScopeButtonIndex(value) { this._selectedScopeButtonIndex = value; }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('div');
            this._element.style.cssText = 'display:flex;align-items:center;background:#f0f0f0;padding:8px;border-radius:10px;';

            const icon = document.createElement('span');
            icon.textContent = '🔍';
            icon.style.marginRight = '6px';

            const input = document.createElement('input');
            input.type = 'search';
            input.placeholder = this._placeholder;
            input.style.cssText = 'border:none;background:transparent;outline:none;flex:1;font-size:17px;';

            this._element.appendChild(icon);
            this._element.appendChild(input);
        }
        return this._element;
    }
}

export default UISearchController;
export { UISearchBar };
