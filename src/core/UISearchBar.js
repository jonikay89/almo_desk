import UIView from './UIView.js';
import UIColor from './UIColor.js';
import { NSNumber, Scanner } from './Foundation.js';

class UISearchBar extends UIView {
    constructor(placeholder = 'Search') {
        super();
        this.placeholder = placeholder;
        this.text = '';
        this._isFirstResponder = false;
        this.showsCancelButton = false;
        this.showsScopeBar = false;
        this.scopeButtonTitles = [];
        this.selectedScopeButtonIndex = 0;
        this.delegate = null;
    }

    init() {
        this.element = document.createElement('div');
        this.element.className = 'ui-searchbar';
        this.element.style.display = 'flex';
        this.element.style.alignItems = 'center';
        this.element.style.height = '44px';
        this.element.style.backgroundColor = UIColor.systemBackground().css;
        this.element.style.padding = '0 8px';
        this.element.style.borderBottom = '1px solid #ddd';

        this.searchContainer = document.createElement('div');
        this.searchContainer.style.display = 'flex';
        this.searchContainer.style.alignItems = 'center';
        this.searchContainer.style.flex = '1';
        this.searchContainer.style.backgroundColor = '#eee';
        this.searchContainer.style.borderRadius = '10px';
        this.searchContainer.style.padding = '0 10px';
        this.searchContainer.style.height = '36px';

        const searchIcon = document.createElement('span');
        searchIcon.textContent = '🔍';
        searchIcon.style.fontSize = '14px';
        searchIcon.style.marginRight = '6px';
        searchIcon.style.opacity = '0.6';
        this.searchContainer.appendChild(searchIcon);

        this.inputElement = document.createElement('input');
        this.inputElement.type = 'text';
        this.inputElement.placeholder = this.placeholder;
        this.inputElement.style.flex = '1';
        this.inputElement.style.border = 'none';
        this.inputElement.style.background = 'transparent';
        this.inputElement.style.outline = 'none';
        this.inputElement.style.fontSize = '16px';
        this.inputElement.style.padding = '0';
        this.searchContainer.appendChild(this.inputElement);

        this.clearButton = document.createElement('button');
        this.clearButton.textContent = '✕';
        this.clearButton.style.display = 'none';
        this.clearButton.style.background = 'none';
        this.clearButton.style.border = 'none';
        this.clearButton.style.fontSize = '14px';
        this.clearButton.style.color = '#888';
        this.clearButton.style.cursor = 'pointer';
        this.clearButton.style.padding = '4px';
        this.clearButton.addEventListener('click', () => {
            this.text = '';
            this.inputElement.value = '';
            this.clearButton.style.display = 'none';
            if (this.delegate && typeof this.delegate.searchBar_textDidChange === 'function') {
                this.delegate.searchBar_textDidChange(this, '');
            }
        });
        this.searchContainer.appendChild(this.clearButton);

        this.element.appendChild(this.searchContainer);

        this.cancelButton = document.createElement('button');
        this.cancelButton.textContent = 'Cancel';
        this.cancelButton.style.display = 'none';
        this.cancelButton.style.background = 'none';
        this.cancelButton.style.border = 'none';
        this.cancelButton.style.color = UIColor.systemBlue().css;
        this.cancelButton.style.fontSize = '16px';
        this.cancelButton.style.cursor = 'pointer';
        this.cancelButton.style.padding = '8px';
        this.cancelButton.addEventListener('click', () => {
            this.resignFirstResponder();
        });
        this.element.appendChild(this.cancelButton);

        this.#setupEventListeners();

        return this;
    }

    #setupEventListeners() {
        this.inputElement.addEventListener('focus', () => {
            this._isFirstResponder = true;
            if (this.showsCancelButton) {
                this.cancelButton.style.display = 'block';
            }
            if (this.delegate && typeof this.delegate.searchBarTextDidBeginEditing === 'function') {
                this.delegate.searchBarTextDidBeginEditing(this);
            }
        });

        this.inputElement.addEventListener('blur', () => {
            this._isFirstResponder = false;
            if (this.delegate && typeof this.delegate.searchBarTextDidEndEditing === 'function') {
                this.delegate.searchBarTextDidEndEditing(this);
            }
        });

        this.inputElement.addEventListener('input', () => {
            this.text = this.inputElement.value;
            this.clearButton.style.display = this.text.length > 0 ? 'block' : 'none';
            if (this.delegate && typeof this.delegate.searchBar_textDidChange === 'function') {
                this.delegate.searchBar_textDidChange(this, this.text);
            }
        });

        this.inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (this.delegate && typeof this.delegate.searchBarSearchButtonClicked === 'function') {
                    this.delegate.searchBarSearchButtonClicked(this);
                }
            }
        });
    }

    setText(text) {
        this.text = text;
        if (this.inputElement) {
            this.inputElement.value = text;
            this.clearButton.style.display = text.length > 0 ? 'block' : 'none';
        }
    }

    setPlaceholder(placeholder) {
        this.placeholder = placeholder;
        if (this.inputElement) {
            this.inputElement.placeholder = placeholder;
        }
    }

    setShowsCancelButton(show, animated = true) {
        this.showsCancelButton = show;
        if (animated) {
            this.cancelButton.style.transition = 'display 0.2s ease';
        }
        this.cancelButton.style.display = show && this._isFirstResponder ? 'block' : 'none';
    }

    setShowsScopeBar(show) {
        this.showsScopeBar = show;
    }

    setScopeButtonTitles(titles) {
        this.scopeButtonTitles = titles;
    }

    setSelectedScopeButtonIndex(index) {
        this.selectedScopeButtonIndex = index;
    }

    becomeFirstResponder() {
        if (this.inputElement) {
            this.inputElement.focus();
            return true;
        }
        return false;
    }

    resignFirstResponder() {
        if (this.inputElement) {
            this.inputElement.blur();
            this.cancelButton.style.display = 'none';
            return true;
        }
        return false;
    }

    layoutSubviews() {
        super.layoutSubviews();
    }

    get description() {
        return `UISearchBar(text: "${this.text}", placeholder: "${this.placeholder}", selectedScopeButtonIndex: ${this.selectedScopeButtonIndex})`;
    }

    scanner() {
        return new Scanner(this.text);
    }

    textAsNumber() {
        const num = parseFloat(this.text);
        return isNaN(num) ? null : NSNumber.of(num);
    }

    selectedScopeButtonIndexAsNumber() {
        return NSNumber.of(this.selectedScopeButtonIndex);
    }

    encode() {
        return {
            text: this.text,
            placeholder: this.placeholder,
            selectedScopeButtonIndex: this.selectedScopeButtonIndex,
            showsCancelButton: this.showsCancelButton,
            showsScopeBar: this.showsScopeBar,
            scopeButtonTitles: [...this.scopeButtonTitles]
        };
    }

    static decode(data) {
        const searchBar = new UISearchBar(data.placeholder);
        searchBar.text = data.text;
        searchBar.selectedScopeButtonIndex = data.selectedScopeButtonIndex;
        searchBar.showsCancelButton = data.showsCancelButton;
        searchBar.showsScopeBar = data.showsScopeBar;
        searchBar.scopeButtonTitles = [...data.scopeButtonTitles];
        return searchBar;
    }
}

export default UISearchBar;