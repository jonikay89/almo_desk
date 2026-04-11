import UIScrollView from './UIScrollView.js';
import UIColor from './UIColor.js';
import { Optional, Result } from './Generics.js';
import { WeakRef } from './WeakReference.js';
import { NSValue } from './Foundation.js';
import Switch from './Switch.js';

class UITableView extends UIScrollView {
    constructor(style = 'plain') {
        super();
        this.style = style;
        this._delegate = null;
        this._dataSource = null;
        this.rowHeight = 44;
        this.sectionHeaderHeight = 30;
        this.sectionFooterHeight = 0;
        this.separatorStyle = 'singleLine';
        this.separatorColor = UIColor.lightGray();
        this.separatorInset = { top: 0, right: 0, bottom: 0, left: 0 };
        this.allowsSelection = true;
        this.allowsMultipleSelection = false;
        this.editing = false;
        this._data = [];
        this.reusableCells = {};
    }

    get description() {
        return `UITableView(style: ${this.style}, rowHeight: ${this.rowHeight}, dataSource: ${this._dataSource ? 'set' : 'nil'})`;
    }

    get delegate() {
        return this._delegate ? this._delegate.target : null;
    }

    set delegate(value) {
        this._delegate = value instanceof WeakRef ? value : (value ? new WeakRef(value) : null);
    }

    get dataSource() {
        return this._dataSource ? this._dataSource.target : null;
    }

    set dataSource(value) {
        this._dataSource = value instanceof WeakRef ? value : (value ? new WeakRef(value) : null);
    }

    numberOfSections() {
        return Optional.of(this.dataSource?.numberOfSectionsInTableView)
            .flatMap(fn => Optional.fromNullable(fn(this)))
            .getOrElse(1);
    }

    numberOfRowsInSection(section) {
        return Optional.of(this.dataSource?.tableView_numberOfRowsInSection)
            .flatMap(fn => Optional.fromNullable(fn(this, section)))
            .getOrElse(0);
    }

    visibleCells() {
        const cells = this.contentElement?.querySelectorAll('.ui-tableview-cell') || [];
        return Array.from(cells);
    }

    indexPathsForVisibleRows() {
        const cells = this.contentElement?.querySelectorAll('.ui-tableview-cell') || [];
        return Array.from(cells).map(cell => ({
            row: parseInt(cell.dataset.index, 10),
            section: parseInt(cell.dataset.section, 10) || 0
        }));
    }

    rectForRowAtIndexPath(indexPath) {
        return {
            x: 0,
            y: indexPath.row * this.rowHeight,
            width: this.frame.width,
            height: this.rowHeight
        };
    }

    rectForSection(section) {
        const numberOfRows = this.numberOfRowsInSection(section);
        return {
            x: 0,
            y: section * (numberOfRows * this.rowHeight + this.sectionHeaderHeight),
            width: this.frame.width,
            height: numberOfRows * this.rowHeight + this.sectionHeaderHeight
        };
    }

    init() {
        this.element = document.createElement('div');
        this.element.className = 'ui-tableview';
        this.element.style.position = 'relative';
        this.element.style.overflow = 'auto';

        this.contentElement = document.createElement('div');
        this.contentElement.style.position = 'relative';
        this.contentElement.style.minWidth = '100%';
        this.contentElement.style.minHeight = '100%';

        this.element.appendChild(this.contentElement);

        this.#setupEventListeners();

        return this;
    }

    #setupEventListeners() {
        this.element.addEventListener('click', (e) => {
            const row = e.target.closest('.ui-tableview-cell');
            const delegate = this.delegate;
            if (row && delegate && !this.editing) {
                const index = parseInt(row.dataset.index, 10);
                const section = parseInt(row.dataset.section, 10) || 0;
                
                if (delegate && typeof delegate.tableViewDidSelectRowAt === 'function') {
                    const result = delegate.tableViewDidSelectRowAt(this, index, section);
                    if (result instanceof Result) {
                        result.isFailure ? console.error(result.error) : null;
                    }
                }
            }
        });
    }

    reloadData() {
        if (!this.dataSource) return Result.failure(new Error('No dataSource'));

        this.contentElement.innerHTML = '';

        const numberOfSections = this.numberOfSections();

        let currentY = 0;
        const results = [];

        for (let section = 0; section < numberOfSections; section++) {
            const numberOfRows = this.dataSource.tableView_numberOfRowsInSection(this, section);

            const headerTitle = Optional.of(this.delegate?.tableView_titleForHeaderInSection)
                .flatMap(fn => Optional.fromNullable(fn(this, section)))
                .getOrElse(null);
            
            if (headerTitle) {
                const header = this.#createSectionHeader(headerTitle);
                header.style.top = `${currentY}px`;
                this.contentElement.appendChild(header);
                currentY += this.sectionHeaderHeight;
            }

            for (let row = 0; row < numberOfRows; row++) {
                const cellResult = Optional.of(this.dataSource?.tableView_cellForRowAt)
                    .flatMap(fn => Optional.fromNullable(fn(this, row, section)));
                
                if (cellResult.isPresent) {
                    const cell = cellResult.value;
                    cell.init();
                    cell.frame = { x: 0, y: currentY, width: this.frame.width, height: this.rowHeight };
                    cell.element.dataset.index = row;
                    cell.element.dataset.section = section;
                    cell.element.classList.add('ui-tableview-cell');
                    this.contentElement.appendChild(cell.element);
                    currentY += this.rowHeight;
                    results.push(Result.success(cell));
                } else {
                    results.push(Result.failure(new Error(`Failed to create cell at ${row}, ${section}`)));
                }
            }

            const footerTitle = Optional.of(this.delegate?.tableView_titleForFooterInSection)
                .flatMap(fn => Optional.fromNullable(fn(this, section)))
                .getOrElse(null);
            
            if (footerTitle) {
                const footer = this.#createSectionFooter(footerTitle);
                footer.style.top = `${currentY}px`;
                this.contentElement.appendChild(footer);
                currentY += this.sectionFooterHeight;
            }
        }

        this.setContentSize(this.frame.width, currentY);
        return results.every(r => r.isSuccess) ? Result.success(true) : Result.failure(new Error('Some cells failed'));
    }

    #createSectionHeader(title) {
        const header = document.createElement('div');
        header.className = 'ui-tableview-section-header';
        header.style.position = 'absolute';
        header.style.left = '0';
        header.style.right = '0';
        header.style.height = `${this.sectionHeaderHeight}px`;
        header.style.backgroundColor = UIColor.colorWithWhiteAlpha(0.95, 1).css;
        header.style.borderBottom = '1px solid #ddd';
        header.style.display = 'flex';
        header.style.alignItems = 'center';
        header.style.paddingLeft = '16px';
        header.style.fontSize = '13px';
        header.style.fontWeight = '600';
        header.style.color = '#666';
        header.textContent = title;
        return header;
    }

    #createSectionFooter(title) {
        const footer = document.createElement('div');
        footer.className = 'ui-tableview-section-footer';
        footer.style.position = 'absolute';
        footer.style.left = '0';
        footer.style.right = '0';
        footer.style.height = `${this.sectionFooterHeight}px`;
        footer.style.backgroundColor = UIColor.colorWithWhiteAlpha(0.95, 1).css;
        footer.style.borderTop = '1px solid #ddd';
        footer.style.display = 'flex';
        footer.style.alignItems = 'center';
        footer.style.paddingLeft = '16px';
        footer.style.fontSize = '12px';
        footer.style.color = '#888';
        footer.textContent = title;
        return footer;
    }

    dequeueReusableCellWithIdentifier(identifier) {
        const cached = this.reusableCells?.[identifier];
        return Optional.fromNullable(cached);
    }

    selectRowAtIndexPath(index, animated, scrollPosition) {
        const cells = this.contentElement.querySelectorAll('.ui-tableview-cell');
        const targetCell = cells[index];
        if (targetCell) {
            targetCell.classList.add('selected');
            if (scrollPosition === 'middle') {
                targetCell.scrollIntoView({ block: 'center', behavior: animated ? 'smooth' : 'auto' });
            }
            return Result.success(targetCell);
        }
        return Result.failure(new Error('Cell not found'));
    }

    deselectRowAtIndexPath(index, animated) {
        const cells = this.contentElement.querySelectorAll('.ui-tableview-cell');
        const targetCell = cells[index];
        if (targetCell) {
            targetCell.classList.remove('selected');
            return Result.success(true);
        }
        return Result.failure(new Error('Cell not found'));
    }

    cellForRowAt(index) {
        const cells = this.contentElement.querySelectorAll('.ui-tableview-cell');
        return Optional.fromNullable(cells[index]);
    }

    headerViewForSection(section) {
        return Optional.empty();
    }

    footerViewForSection(section) {
        return Optional.empty();
    }

    layoutSubviews() {
        super.layoutSubviews();
        if (this.contentElement) {
            this.contentElement.style.width = `${this.frame.width}px`;
        }
    }

    encode() {
        return {
            style: this.style,
            rowHeight: this.rowHeight,
            sectionHeaderHeight: this.sectionHeaderHeight,
            sectionFooterHeight: this.sectionFooterHeight,
            separatorStyle: this.separatorStyle,
            allowsSelection: this.allowsSelection,
            allowsMultipleSelection: this.allowsMultipleSelection,
            editing: this.editing
        };
    }

    static decode(data) {
        const tableView = new UITableView(data.style || 'plain');
        tableView.rowHeight = data.rowHeight || 44;
        tableView.sectionHeaderHeight = data.sectionHeaderHeight || 30;
        tableView.sectionFooterHeight = data.sectionFooterHeight || 0;
        tableView.separatorStyle = data.separatorStyle || 'singleLine';
        tableView.allowsSelection = data.allowsSelection !== false;
        tableView.allowsMultipleSelection = data.allowsMultipleSelection || false;
        tableView.editing = data.editing || false;
        return tableView;
    }

    matchSelection(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        return Switch(predicate)
            .case({ style: Switch.let('s') }, (m) => this.style === m.s)
            .case({ editing: true }, () => this.editing === true)
            .case({ editing: false }, () => this.editing === false)
            .case({ allowsSelection: true }, () => this.allowsSelection === true)
            .case({ allowsSelection: false }, () => this.allowsSelection === false)
            .case({ allowsMultipleSelection: true }, () => this.allowsMultipleSelection === true)
            .case({ allowsMultipleSelection: false }, () => this.allowsMultipleSelection === false)
            .case({ empty: true }, () => this._data.length === 0)
            .case({ empty: false }, () => this._data.length > 0)
            .default(() => false)
            .evaluate();
    }

    matchRow(atIndexPath, predicate) {
        const { row, section } = atIndexPath;
        const state = {
            row,
            section,
            isFirst: row === 0,
            isLast: row === this.numberOfRowsInSection(section) - 1,
            isEven: row % 2 === 0,
            isOdd: row % 2 !== 0
        };
        if (typeof predicate === 'function') {
            return predicate(state);
        }
        return Switch(predicate)
            .case({ first: true }, () => state.isFirst)
            .case({ last: true }, () => state.isLast)
            .case({ even: true }, () => state.isEven)
            .case({ odd: true }, () => state.isOdd)
            .case({ at: Switch.let('r'), section: Switch.let('s') }, 
                  (m) => state.row === m.r && state.section === m.s)
            .case({ row: Switch.let('r') }, (m) => state.row === m.r)
            .case({ section: Switch.let('s') }, (m) => state.section === m.s)
            .default(() => false)
            .evaluate();
    }
}

export default UITableView;