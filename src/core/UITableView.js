import UIScrollView from './UIScrollView.js';
import UIColor from './UIColor.js';
import { Optional, Result } from './Generics.js';
import { WeakRef } from './WeakReference.js';
import { NSValue, kp, getProperty, updateProperty, compareBy, compareByDescending } from './Foundation.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch, ifLet, guardLet } from './PatternMatching.js';
import { defineTypeAlias } from './Protocol.js';
import {
    TableViewDelegate,
    TableViewDataSource
} from './TypeAliases.js';

defineTypeAlias('TableViewDelegateBundle', TableViewDelegate, TableViewDataSource);

const VIRTUAL_SCROLL_BUFFER = 5;

class TableViewCellPool {
    constructor() {
        this._pools = new Map();
    }

    registerClassForCellReuseIdentifier(cellClass, identifier) {
        this._pools.set(identifier, { cellClass, pool: [] });
    }

    dequeueReusableCellWithIdentifier(identifier) {
        const pool = this._pools.get(identifier);
        if (!pool) return null;
        if (pool.pool.length > 0) {
            return pool.pool.pop();
        }
        return null;
    }

    returnCellToPool(cell, identifier) {
        const pool = this._pools.get(identifier);
        if (pool) {
            if (cell.prepareForReuse) {
                cell.prepareForReuse();
            }
            pool.pool.push(cell);
        }
    }

    getPoolInfo(identifier) {
        const pool = this._pools.get(identifier);
        return pool ? { registered: true, available: pool.pool.length } : { registered: false, available: 0 };
    }

    clearAllPools() {
        for (const pool of this._pools.values()) {
            pool.pool = [];
        }
    }
}

class DiffResult {
    constructor() {
        this.updates = [];
        this.insertions = [];
        this.deletions = [];
        this.moves = [];
    }

    get hasChanges() {
        return this.updates.length > 0 || this.insertions.length > 0 || this.deletions.length > 0 || this.moves.length > 0;
    }
}

function calculateLCS(oldArray, newArray, sectionIndex) {
    const diff = new DiffResult();
    if (!oldArray || !newArray) {
        if (newArray && newArray.length > 0) {
            for (let i = 0; i < newArray.length; i++) {
                diff.insertions.push({ row: i, section: sectionIndex, item: newArray[i] });
            }
        }
        return diff;
    }

    const oldSet = new Map();
    const newSet = new Map();
    
    for (let i = 0; i < oldArray.length; i++) {
        const key = JSON.stringify(oldArray[i]);
        if (!oldSet.has(key)) oldSet.set(key, []);
        oldSet.get(key).push(i);
    }
    
    for (let i = 0; i < newArray.length; i++) {
        const key = JSON.stringify(newArray[i]);
        if (!newSet.has(key)) newSet.set(key, []);
        newSet.get(key).push(i);
    }

    for (const [key, oldIndices] of oldSet) {
        const newIndices = newSet.get(key);
        if (!newIndices) {
            for (const idx of oldIndices) {
                diff.deletions.push({ row: idx, section: sectionIndex });
            }
        } else {
            const minLen = Math.min(oldIndices.length, newIndices.length);
            for (let i = 0; i < minLen; i++) {
                if (oldIndices[i] !== newIndices[i]) {
                    diff.updates.push({ row: newIndices[i], section: sectionIndex, item: newArray[newIndices[i]] });
                }
            }
            if (oldIndices.length > minLen) {
                for (let i = minLen; i < oldIndices.length; i++) {
                    diff.deletions.push({ row: oldIndices[i], section: sectionIndex });
                }
            }
            if (newIndices.length > minLen) {
                for (let i = minLen; i < newIndices.length; i++) {
                    diff.insertions.push({ row: newIndices[i], section: sectionIndex, item: newArray[newIndices[i]] });
                }
            }
        }
    }

    for (const [key, newIndices] of newSet) {
        if (!oldSet.has(key)) {
            for (const idx of newIndices) {
                diff.insertions.push({ row: idx, section: sectionIndex, item: newArray[idx] });
            }
        }
    }

    return diff;
}

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
        this._sections = [];
        this._cellPool = new TableViewCellPool();
        this._rowHeightCache = new Map();
        this._visibleCells = new Map();
        this._renderedRange = { startRow: 0, endRow: 0, startSection: 0, endSection: 0 };
        this._isRendering = false;
        this._pendingUpdate = null;
        this._estimatedRowHeight = 44;
        this._usesDynamicRowHeights = false;
    }

    get description() {
        return `UITableView(style: ${this.style}, rowHeight: ${this.rowHeight}, visibleCells: ${this._visibleCells.size})`;
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

    get data() {
        return this._data;
    }

    set data(value) {
        this._data = value;
        if (this._sections.length === 0) {
            this._sections = [{ items: value }];
        }
    }

    get sections() {
        return this._sections;
    }

    set sections(value) {
        this._sections = value;
    }

    numberOfSections() {
        return Optional.of(this.dataSource?.numberOfSectionsInTableView)
            .flatMap(fn => Optional.fromNullable(fn(this)))
            .getOrElse(this._sections.length || 1);
    }

    numberOfRowsInSection(section) {
        return Optional.of(this.dataSource?.tableView_numberOfRowsInSection)
            .flatMap(fn => Optional.fromNullable(fn(this, section)))
            .getOrElse(0);
    }

    totalRows() {
        let total = 0;
        for (let s = 0; s < this.numberOfSections(); s++) {
            total += this.numberOfRowsInSection(s);
        }
        return total;
    }

    indexPathForRow(row) {
        let cumulative = 0;
        for (let s = 0; s < this.numberOfSections(); s++) {
            const rowsInSection = this.numberOfRowsInSection(s);
            if (cumulative + rowsInSection > row) {
                return { row: row - cumulative, section: s };
            }
            cumulative += rowsInSection;
        }
        return { row: 0, section: 0 };
    }

    rectForRowAtIndexPath(indexPath) {
        const { row, section } = indexPath;
        let y = 0;
        for (let s = 0; s < section; s++) {
            y += this.numberOfRowsInSection(s) * this.rowHeight;
        }
        const height = this._rowHeightCache.get(`${section}-${row}`) || this.rowHeight;
        return {
            x: 0,
            y: y,
            width: this.frame.width,
            height: height
        };
    }

    indexPathsForVisibleRows() {
        const paths = [];
        for (const [key, cell] of this._visibleCells) {
            if (cell && cell.element) {
                paths.push({
                    row: parseInt(cell.element.dataset.index, 10),
                    section: parseInt(cell.element.dataset.section, 10) || 0
                });
            }
        }
        return paths;
    }

    visibleCells() {
        return Array.from(this._visibleCells.values()).filter(c => c != null);
    }

    registerClassForCellReuseIdentifier(cellClass, identifier) {
        this._cellPool.registerClassForCellReuseIdentifier(cellClass, identifier);
    }

    dequeueReusableCellWithIdentifier(identifier) {
        return this._cellPool.dequeueReusableCellWithIdentifier(identifier);
    }

    returnCellToPool(cell) {
        if (cell && cell.reuseIdentifier) {
            this._cellPool.returnCellToPool(cell, cell.reuseIdentifier);
            this._visibleCells.delete(`${cell.element?.dataset.section}-${cell.element?.dataset.index}`);
        }
    }

    init() {
        super.init();
        this.element = document.createElement('div');
        this.element.className = 'ui-tableview';
        this.element.style.position = 'relative';
        this.element.style.overflow = 'auto';
        this.element.style.willChange = 'transform';

        this.contentElement = document.createElement('div');
        this.contentElement.className = 'ui-tableview-content';
        this.contentElement.style.position = 'absolute';
        this.contentElement.style.minWidth = '100%';
        this.contentElement.style.minHeight = '100%';

        this.element.appendChild(this.contentElement);

        this._setupEventListeners();
        this._setupScrollListener();

        return this;
    }

    _setupEventListeners() {
        this.element.addEventListener('click', (e) => {
            const row = e.target.closest('.ui-tableview-cell');
            if (row && this.delegate && !this.editing) {
                const index = parseInt(row.dataset.index, 10);
                const section = parseInt(row.dataset.section, 10) || 0;
                
                if (typeof this.delegate.tableViewDidSelectRowAt === 'function') {
                    const result = this.delegate.tableViewDidSelectRowAt(this, index, section);
                    if (result instanceof Result) {
                        result.isFailure ? console.error(result.error) : null;
                    }
                }
            }
        });

        this.element.addEventListener('mousedown', (e) => {
            const row = e.target.closest('.ui-tableview-cell');
            if (row) {
                row.classList.add('highlighted');
            }
        });

        this.element.addEventListener('mouseup', (e) => {
            const row = e.target.closest('.ui-tableview-cell');
            if (row) {
                row.classList.remove('highlighted');
            }
        });

        this.element.addEventListener('mouseleave', (e) => {
            const row = e.target.closest('.ui-tableview-cell');
            if (row) {
                row.classList.remove('highlighted');
            }
        });
    }

    _setupScrollListener() {
        let ticking = false;
        this.element.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this._handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    _handleScroll() {
        if (!this.dataSource || !this.contentElement) return;

        const scrollTop = this.element.scrollTop;
        const viewportHeight = this.element.clientHeight;
        const contentHeight = this._calculateTotalHeight();

        this.contentElement.style.height = `${contentHeight}px`;

        const visibleRange = this._calculateVisibleRange(scrollTop, viewportHeight);
        
        if (this._shouldReRender(visibleRange)) {
            this._renderVisibleCells(visibleRange);
        }

        Optional.of(this.delegate?.scrollViewDidScroll)
            .flatMap(fn => Optional.fromNullable(fn(this)))
            .getOrElse(null);
    }

    _calculateTotalHeight() {
        let height = 0;
        for (let s = 0; s < this.numberOfSections(); s++) {
            height += this.numberOfRowsInSection(s) * this.rowHeight;
        }
        return height;
    }

    _calculateVisibleRange(scrollTop, viewportHeight) {
        const startRow = Math.max(0, Math.floor(scrollTop / this.rowHeight) - VIRTUAL_SCROLL_BUFFER);
        const endRow = Math.min(
            this.totalRows() - 1,
            Math.ceil((scrollTop + viewportHeight) / this.rowHeight) + VIRTUAL_SCROLL_BUFFER
        );
        const startIndexPath = this.indexPathForRow(startRow);
        const endIndexPath = this.indexPathForRow(endRow);
        return { startRow, endRow, startIndexPath, endIndexPath };
    }

    _shouldReRender(visibleRange) {
        return (
            visibleRange.startRow !== this._renderedRange.startRow ||
            visibleRange.endRow !== this._renderedRange.endRow
        );
    }

    _renderVisibleCells(visibleRange) {
        if (this._isRendering) {
            this._pendingUpdate = visibleRange;
            return;
        }

        this._isRendering = true;

        const recycledCells = new Map(this._visibleCells);
        this._visibleCells.clear();
        this.contentElement.innerHTML = '';

        let row = visibleRange.startRow;
        let currentY = 0;
        
        for (let s = 0; s < this.numberOfSections(); s++) {
            const rowsInSection = this.numberOfRowsInSection(s);
            for (let r = 0; r < rowsInSection; r++) {
                if (row >= visibleRange.startRow && row <= visibleRange.endRow) {
                    const cellKey = `${s}-${r}`;
                    let cell = recycledCells.get(cellKey);

                    if (!cell) {
                        const cellResult = Optional.of(this.dataSource?.tableView_cellForRowAt)
                            .flatMap(fn => Optional.fromNullable(fn(this, r, s)));
                        
                        if (cellResult.isPresent) {
                            cell = cellResult.value;
                            if (cell.init) cell.init();
                        }
                    } else {
                        recycledCells.delete(cellKey);
                    }

                    if (cell) {
                        const height = this._rowHeightCache.get(`${s}-${r}`) || this.rowHeight;
                        cell.frame = { x: 0, y: currentY, width: this.frame.width, height };
                        cell.element.dataset.index = r;
                        cell.element.dataset.section = s;
                        cell.element.classList.add('ui-tableview-cell');
                        cell.element.classList.remove('recycled');
                        this.contentElement.appendChild(cell.element);
                        this._visibleCells.set(cellKey, cell);
                    }
                }
                currentY += this._rowHeightCache.get(`${s}-${r}`) || this.rowHeight;
                row++;
            }
        }

        for (const [key, cell] of recycledCells) {
            this.returnCellToPool(cell);
        }

        this._renderedRange = {
            startRow: visibleRange.startRow,
            endRow: visibleRange.endRow,
            startSection: visibleRange.startIndexPath.section,
            endSection: visibleRange.endIndexPath.section
        };

        this._isRendering = false;

        if (this._pendingUpdate) {
            const nextUpdate = this._pendingUpdate;
            this._pendingUpdate = null;
            this._renderVisibleCells(nextUpdate);
        }
    }

    reloadData() {
        if (!this.dataSource) return Result.failure(new Error('No dataSource'));

        this._rowHeightCache.clear();
        this._visibleCells.clear();
        
        for (const cell of this.contentElement.querySelectorAll('.ui-tableview-cell')) {
            cell.remove();
        }

        const contentHeight = this._calculateTotalHeight();
        this.setContentSize(this.frame.width, contentHeight);

        this._handleScroll();

        return Result.success(true);
    }

    reloadRowsAtIndexPaths(indexPaths, animation = null) {
        for (const { row, section } of indexPaths) {
            const cellKey = `${section}-${row}`;
            const cell = this._visibleCells.get(cellKey);
            
            if (cell && this.dataSource) {
                const cellResult = Optional.of(this.dataSource?.tableView_cellForRowAt)
                    .flatMap(fn => Optional.fromNullable(fn(this, row, section)));
                
                if (cellResult.isPresent) {
                    const newCell = cellResult.value;
                    if (newCell.init) newCell.init();
                    const index = cell.element.parentNode?.indexOf(cell.element);
                    if (index !== -1) {
                        cell.element.replaceWith(newCell.element);
                    }
                    this._visibleCells.set(cellKey, newCell);
                }
            }
        }
    }

    insertRowsAtIndexPaths(indexPaths, animation = 'automatic') {
        const sortedPaths = indexPaths.sort((a, b) => {
            if (a.section !== b.section) return a.section - b.section;
            return a.row - b.row;
        });

        for (const path of sortedPaths.reverse()) {
            const section = this._sections[path.section];
            if (section) {
                section.items.splice(path.row, 0, null);
            }
        }

        this.reloadData();
    }

    deleteRowsAtIndexPaths(indexPaths, animation = 'automatic') {
        const sortedPaths = indexPaths.sort((a, b) => {
            if (a.section !== b.section) return b.section - a.section;
            return b.row - a.row;
        });

        for (const path of sortedPaths) {
            const section = this._sections[path.section];
            if (section) {
                section.items.splice(path.row, 1);
            }
        }

        this.reloadData();
    }

    moveRowAtIndexPath(fromIndexPath, toIndexPath, animated = true) {
        const fromSection = this._sections[fromIndexPath.section];
        const toSection = this._sections[toIndexPath.section];
        
        if (fromSection && toSection) {
            const [item] = fromSection.items.splice(fromIndexPath.row, 1);
            toSection.items.splice(toIndexPath.row, 0, item);
            this.reloadData();
        }
    }

    selectRowAtIndexPath(index, animated, scrollPosition) {
        const key = `${index.section}-${index.row}`;
        const cell = this._visibleCells.get(key);
        
        if (cell) {
            cell.element.classList.add('selected');
            if (scrollPosition === 'middle') {
                cell.element.scrollIntoView({ block: 'center', behavior: animated ? 'smooth' : 'auto' });
            }
            return Result.success(cell);
        }
        return Result.failure(new Error('Cell not found'));
    }

    deselectRowAtIndexPath(index, animated) {
        const key = `${index.section}-${index.row}`;
        const cell = this._visibleCells.get(key);
        
        if (cell) {
            cell.element.classList.remove('selected');
            return Result.success(true);
        }
        return Result.failure(new Error('Cell not found'));
    }

    cellForRowAt(indexPath) {
        const key = `${indexPath.section}-${indexPath.row}`;
        return this._visibleCells.get(key) || null;
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
        this.reloadData();
    }

    setSeparatorStyle(style) {
        this.separatorStyle = style;
        return this;
    }

    setSeparatorColor(color) {
        this.separatorColor = color;
        return this;
    }

    setSeparatorInset(inset) {
        this.separatorInset = inset;
        return this;
    }

    withSeparatorStyle(style) {
        return this.setSeparatorStyle(style);
    }

    withSeparatorColor(color) {
        return this.setSeparatorColor(color);
    }

    withSeparatorInset(inset) {
        return this.setSeparatorInset(inset);
    }

    setRowHeight(height) {
        this.rowHeight = height;
        return this;
    }

    withRowHeight(height) {
        return this.setRowHeight(height);
    }

    setAllowsSelection(allow) {
        this.allowsSelection = allow;
        return this;
    }

    withAllowsSelection(allow) {
        return this.setAllowsSelection(allow);
    }

    setAllowsMultipleSelection(allow) {
        this.allowsMultipleSelection = allow;
        return this;
    }

    withAllowsMultipleSelection(allow) {
        return this.setAllowsMultipleSelection(allow);
    }

    setEstimatedRowHeight(estimated) {
        this._estimatedRowHeight = estimated;
        return this;
    }

    withEstimatedRowHeight(estimated) {
        return this.setEstimatedRowHeight(estimated);
    }

    withBackgroundLayer(gradient) {
        return this;
    }

    withShadow(color, opacity, offset, radius) {
        return this;
    }

    withGradient(colors, locations, startPoint, endPoint) {
        return this;
    }

    withBorder(color, width, radius) {
        return this;
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

    switch() {
        return Switch(this);
    }

    sortBy(keyPath, ascending = true) {
        const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
        if (this._sections.length === 1) {
            this._data = ascending 
                ? this._data.slice().sort((a, b) => compareBy(a, b, path))
                : this._data.slice().sort((a, b) => compareByDescending(a, b, path));
            this._sections[0].items = this._data;
        } else {
            this._sections = this._sections.map(section => ({
                ...section,
                items: ascending 
                    ? section.items.slice().sort((a, b) => compareBy(a, b, path))
                    : section.items.slice().sort((a, b) => compareByDescending(a, b, path))
            }));
        }
        this.reloadData();
        return this;
    }

    sortByKeyPaths(...keyPaths) {
        const paths = keyPaths.map(kp_ => typeof kp_ === 'string' ? kp(kp_) : kp_);
        if (this._sections.length === 1) {
            this._data = this._data.slice().sort((a, b) => {
                for (const path of paths) {
                    const result = compareBy(a, b, path);
                    if (result !== 0) return result;
                }
                return 0;
            });
            this._sections[0].items = this._data;
        } else {
            this._sections = this._sections.map(section => ({
                ...section,
                items: section.items.slice().sort((a, b) => {
                    for (const path of paths) {
                        const result = compareBy(a, b, path);
                        if (result !== 0) return result;
                    }
                    return 0;
                })
            }));
        }
        this.reloadData();
        return this;
    }

    filterBy(keyPath, value) {
        const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
        if (this._sections.length === 1) {
            this._data = this._data.filter(item => getProperty(item, path) === value);
            this._sections[0].items = this._data;
        } else {
            this._sections = this._sections.map(section => ({
                ...section,
                items: section.items.filter(item => getProperty(item, path) === value)
            }));
            this._data = this._sections.flatMap(s => s.items);
        }
        this.reloadData();
        return this;
    }

    filterByPredicate(predicate) {
        if (this._sections.length === 1) {
            this._data = this._data.filter(predicate);
            this._sections[0].items = this._data;
        } else {
            this._sections = this._sections.map(section => ({
                ...section,
                items: section.items.filter(predicate)
            }));
            this._data = this._sections.flatMap(s => s.items);
        }
        this.reloadData();
        return this;
    }

    updateValueAt(indexPath, keyPath, newValue) {
        const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
        const section = this._sections[indexPath.section];
        if (section && section.items[indexPath.row]) {
            updateProperty(section.items[indexPath.row], path, newValue);
            this.reloadRowsAtIndexPaths([indexPath]);
        }
        return this;
    }

    getValueAt(indexPath, keyPath) {
        const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
        const section = this._sections[indexPath.section];
        if (section && section.items[indexPath.row]) {
            return getProperty(section.items[indexPath.row], path);
        }
        return null;
    }

    insertRow(item, atIndexPath, animated = true) {
        const section = this._sections[atIndexPath.section];
        if (section) {
            section.items.splice(atIndexPath.row, 0, item);
            this.reloadData();
        }
        return this;
    }

    removeRowAt(atIndexPath, animated = true) {
        const section = this._sections[atIndexPath.section];
        if (section) {
            section.items.splice(atIndexPath.row, 1);
            this.reloadData();
        }
        return this;
    }

    moveRow(fromIndexPath, toIndexPath, animated = true) {
        const fromSection = this._sections[fromIndexPath.section];
        const toSection = this._sections[toIndexPath.section];
        if (fromSection && toSection) {
            const [item] = fromSection.items.splice(fromIndexPath.row, 1);
            toSection.items.splice(toIndexPath.row, 0, item);
            this.reloadData();
        }
        return this;
    }

    appendRow(item, animated = true) {
        if (this._sections.length === 0) {
            this._sections = [{ items: [item] }];
            this._data = [item];
        } else {
            this._sections[this._sections.length - 1].items.push(item);
            this._data.push(item);
        }
        this.reloadData();
        return this;
    }

    prependRow(item, animated = true) {
        if (this._sections.length === 0) {
            this._sections = [{ items: [item] }];
            this._data = [item];
        } else {
            this._sections[0].items.unshift(item);
            this._data.unshift(item);
        }
        this.reloadData();
        return this;
    }

    findRow(predicate) {
        for (let s = 0; s < this._sections.length; s++) {
            const section = this._sections[s];
            for (let r = 0; r < section.items.length; r++) {
                if (predicate(section.items[r])) {
                    return { row: r, section: s, item: section.items[r] };
                }
            }
        }
        return null;
    }

    findRowBy(keyPath, value) {
        const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
        return this.findRow(item => getProperty(item, path) === value);
    }

    _performDiff(oldData, newData, sectionIndex) {
        return calculateLCS(oldData, newData, sectionIndex);
    }

    applyDiff(diff) {
        if (!diff.hasChanges) return;

        this.reloadData();
    }

    clearVisibleCells() {
        for (const cell of this._visibleCells.values()) {
            this.returnCellToPool(cell);
        }
        this._visibleCells.clear();
        this.contentElement.innerHTML = '';
    }

    deinit() {
        this.clearVisibleCells();
        this._cellPool.clearAllPools();
        this._rowHeightCache.clear();
        this._dataSource = null;
        this._delegate = null;
        super.deinit();
    }
}

export { UITableView, TableViewCellPool, DiffResult, calculateLCS };
export default UITableView;
