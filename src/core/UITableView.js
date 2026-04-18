import UIScrollView from './UIScrollView.js';

class UITableView extends UIScrollView {
    constructor() {
        super();
        this._dataSource = null;
        this._delegate = null;
        this._numberOfRowsInSection = 0;
        this._sections = 1;
    }

    get dataSource() { return this._dataSource; }
    set dataSource(value) { this._dataSource = value; }

    get delegate() { return this._delegate; }
    set delegate(value) { this._delegate = value; }

    reloadData() {
        if (this._element && this._dataSource) {
            this._element.innerHTML = '';
            for (let i = 0; i < this._numberOfRowsInSection; i++) {
                const row = document.createElement('div');
                row.style.cssText = 'padding:12px;border-bottom:1px solid #eee;cursor:pointer;';
                row.textContent = `Row ${i + 1}`;
                if (this._dataSource.cellForRowAtIndexPath) {
                    // Use delegate method if available
                }
                this._element.appendChild(row);
            }
        }
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('div');
            this._element.style.cssText = 'position:absolute;overflow:auto;';
            this._numberOfRowsInSection = this._dataSource?.numberOfRowsInSection?.() || 5;
            this.reloadData();
        }
        return this._element;
    }
}

export default UITableView;
