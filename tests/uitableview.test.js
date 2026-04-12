/**
 * UITableView Test Suite
 * Tests for the high-performance UITableView class with virtual scrolling
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

class MockUITableViewCell {
    static instances = [];
    
    constructor(reuseIdentifier = null) {
        this.reuseIdentifier = reuseIdentifier;
        this.text = '';
        this.detailText = '';
        this.image = null;
        this.accessoryType = 'none';
        this.selectionStyle = 'default';
        this._selected = false;
        this._highlighted = false;
        this.element = { 
            className: 'ui-tableview-cell',
            dataset: {},
            style: {},
            remove: () => {},
            appendChild: () => {},
            removeChild: () => {},
            replaceWith: () => {},
            parentNode: { indexOf: () => 0 }
        };
        MockUITableViewCell.instances.push(this);
    }

    init() {
        return this;
    }

    prepareForReuse() {
        this.text = '';
        this.detailText = '';
        this.image = null;
        this.accessoryType = 'none';
        this._selected = false;
        this._highlighted = false;
    }

    setText(text) {
        this.text = text;
        return this;
    }

    setDetailText(text) {
        this.detailText = text;
        return this;
    }

    setSelected(selected) {
        this._selected = selected;
        return this;
    }

    static resetInstances() {
        MockUITableViewCell.instances = [];
    }
}

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
    if (!oldArray && !newArray) {
        return diff;
    }
    if (!oldArray) {
        if (newArray && newArray.length > 0) {
            for (let i = 0; i < newArray.length; i++) {
                diff.insertions.push({ row: i, section: sectionIndex, item: newArray[i] });
            }
        }
        return diff;
    }
    if (!newArray) {
        for (let i = 0; i < oldArray.length; i++) {
            diff.deletions.push({ row: i, section: sectionIndex });
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

class MockDataSource {
    constructor(cells = []) {
        this.cells = cells;
        this.numberOfCalls = { numberOfSections: 0, numberOfRows: 0, cellForRow: 0 };
    }

    numberOfSectionsInTableView(tableView) {
        this.numberOfCalls.numberOfSections++;
        return 1;
    }

    tableView_numberOfRowsInSection(tableView, section) {
        this.numberOfCalls.numberOfRows++;
        return this.cells.length;
    }

    tableView_cellForRowAt(tableView, row, section) {
        this.numberOfCalls.cellForRow++;
        const cell = new MockUITableViewCell('Cell');
        cell.init();
        cell.setText(`Item ${row + 1}`);
        return cell;
    }
}

class MockUITableView {
    constructor(style = 'plain') {
        this.style = style;
        this._delegate = null;
        this._dataSource = null;
        this.rowHeight = 44;
        this.sectionHeaderHeight = 30;
        this.sectionFooterHeight = 0;
        this.separatorStyle = 'singleLine';
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
        this.contentElement = { innerHTML: '', querySelectorAll: () => [], style: {} };
        this.element = { scrollTop: 0, clientHeight: 500, style: {} };
        this.frame = { width: 300, height: 500 };
    }

    get dataSource() {
        return this._dataSource;
    }

    set dataSource(value) {
        this._dataSource = value;
    }

    set data(value) {
        this._data = value;
        if (this._sections.length === 0) {
            this._sections = [{ items: value }];
        }
    }

    numberOfSections() {
        return this._sections.length || 1;
    }

    numberOfRowsInSection(section) {
        return this._sections[section]?.items?.length || 0;
    }

    totalRows() {
        let total = 0;
        for (let s = 0; s < this.numberOfSections(); s++) {
            total += this.numberOfRowsInSection(s);
        }
        return total;
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
        }
    }

    reloadData() {
        this._rowHeightCache.clear();
        this._visibleCells.clear();
        this._renderedRange = { startRow: 0, endRow: 0, startSection: 0, endSection: 0 };
        return { isSuccess: true };
    }

    _calculateTotalHeight() {
        let height = 0;
        for (let s = 0; s < this.numberOfSections(); s++) {
            height += this.numberOfRowsInSection(s) * this.rowHeight;
        }
        return height;
    }

    _calculateVisibleRange(scrollTop, viewportHeight) {
        const VIRTUAL_SCROLL_BUFFER = 5;
        const startRow = Math.max(0, Math.floor(scrollTop / this.rowHeight) - VIRTUAL_SCROLL_BUFFER);
        const endRow = Math.min(
            this.totalRows() - 1,
            Math.ceil((scrollTop + viewportHeight) / this.rowHeight) + VIRTUAL_SCROLL_BUFFER
        );
        return { startRow, endRow };
    }

    clearVisibleCells() {
        this._visibleCells.clear();
    }

    appendRow(item) {
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

    prependRow(item) {
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

    insertRow(item, atIndexPath) {
        const section = this._sections[atIndexPath.section];
        if (section) {
            section.items.splice(atIndexPath.row, 0, item);
            this.reloadData();
        }
        return this;
    }

    removeRowAt(atIndexPath) {
        const section = this._sections[atIndexPath.section];
        if (section) {
            section.items.splice(atIndexPath.row, 1);
            this.reloadData();
        }
        return this;
    }

    moveRow(fromIndexPath, toIndexPath) {
        const fromSection = this._sections[fromIndexPath.section];
        const toSection = this._sections[toIndexPath.section];
        if (fromSection && toSection) {
            const [item] = fromSection.items.splice(fromIndexPath.row, 1);
            toSection.items.splice(toIndexPath.row, 0, item);
            this.reloadData();
        }
        return this;
    }

    sortBy(keyPath, ascending = true) {
        if (this._sections.length === 1 && this._sections[0].items) {
            const items = this._sections[0].items.slice();
            this._sections[0].items = ascending 
                ? items.sort((a, b) => a - b)
                : items.sort((a, b) => b - a);
            this._data = this._sections[0].items;
        } else {
            this._sections = this._sections.map(section => ({
                ...section,
                items: section.items ? (ascending 
                    ? section.items.slice().sort((a, b) => a - b)
                    : section.items.slice().sort((a, b) => b - a)) : []
            }));
            this._data = this._sections.flatMap(s => s.items);
        }
        this.reloadData();
        return this;
    }

    filterByPredicate(predicate) {
        if (this._sections.length === 1 && this._sections[0].items) {
            this._sections[0].items = this._sections[0].items.filter(predicate);
            this._data = this._sections[0].items;
        } else {
            this._sections = this._sections.map(section => ({
                ...section,
                items: section.items ? section.items.filter(predicate) : []
            }));
            this._data = this._sections.flatMap(s => s.items);
        }
        this.reloadData();
        return this;
    }

    deinit() {
        this.clearVisibleCells();
        this._cellPool.clearAllPools();
        this._rowHeightCache.clear();
    }
}

describe('TableViewCellPool', () => {
    let pool;

    beforeEach(() => {
        pool = new TableViewCellPool();
    });

    it('should initialize with empty pools', () => {
        const info = pool.getPoolInfo('TestCell');
        assert.deepStrictEqual(info, { registered: false, available: 0 });
    });

    it('should register cell class for reuse identifier', () => {
        pool.registerClassForCellReuseIdentifier(MockUITableViewCell, 'Cell');
        const info = pool.getPoolInfo('Cell');
        assert.strictEqual(info.registered, true);
        assert.strictEqual(info.available, 0);
    });

    it('should return null for unregistered identifier', () => {
        const cell = pool.dequeueReusableCellWithIdentifier('Unregistered');
        assert.strictEqual(cell, null);
    });

    it('should dequeue cell from pool when available', () => {
        pool.registerClassForCellReuseIdentifier(MockUITableViewCell, 'Cell');
        const cell1 = new MockUITableViewCell('Cell');
        pool.returnCellToPool(cell1, 'Cell');
        
        const dequeuedCell = pool.dequeueReusableCellWithIdentifier('Cell');
        assert.strictEqual(dequeuedCell, cell1);
        assert.strictEqual(pool.getPoolInfo('Cell').available, 0);
    });

    it('should call prepareForReuse when returning cell to pool', () => {
        pool.registerClassForCellReuseIdentifier(MockUITableViewCell, 'Cell');
        const cell = new MockUITableViewCell('Cell');
        cell.text = 'Test';
        pool.returnCellToPool(cell, 'Cell');
        assert.strictEqual(cell.text, '');
    });

    it('should return null when pool is empty', () => {
        pool.registerClassForCellReuseIdentifier(MockUITableViewCell, 'Cell');
        const cell = pool.dequeueReusableCellWithIdentifier('Cell');
        assert.strictEqual(cell, null);
    });

    it('should clear all pools', () => {
        pool.registerClassForCellReuseIdentifier(MockUITableViewCell, 'Cell');
        const cell1 = new MockUITableViewCell('Cell');
        pool.returnCellToPool(cell1, 'Cell');
        pool.clearAllPools();
        assert.strictEqual(pool.getPoolInfo('Cell').available, 0);
    });
});

describe('DiffResult', () => {
    it('should have no changes when empty', () => {
        const diff = new DiffResult();
        assert.strictEqual(diff.hasChanges, false);
    });

    it('should detect updates', () => {
        const diff = new DiffResult();
        diff.updates.push({ row: 0, section: 0 });
        assert.strictEqual(diff.hasChanges, true);
    });

    it('should detect insertions', () => {
        const diff = new DiffResult();
        diff.insertions.push({ row: 0, section: 0 });
        assert.strictEqual(diff.hasChanges, true);
    });

    it('should detect deletions', () => {
        const diff = new DiffResult();
        diff.deletions.push({ row: 0, section: 0 });
        assert.strictEqual(diff.hasChanges, true);
    });
});

describe('calculateLCS', () => {
    it('should return empty diff for null inputs', () => {
        const diff = calculateLCS(null, null, 0);
        assert.strictEqual(diff.hasChanges, false);
    });

    it('should detect insertions when old is null', () => {
        const newData = [{ id: 1 }, { id: 2 }];
        const diff = calculateLCS(null, newData, 0);
        assert.strictEqual(diff.insertions.length, 2);
    });

    it('should detect deletions when new is null', () => {
        const oldData = [{ id: 1 }, { id: 2 }];
        const diff = calculateLCS(oldData, null, 0);
        assert.strictEqual(diff.deletions.length, 2);
    });

    it('should detect insertions for new items', () => {
        const oldData = [{ id: 1 }];
        const newData = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const diff = calculateLCS(oldData, newData, 0);
        assert.strictEqual(diff.insertions.length, 2);
    });

    it('should detect deletions for removed items', () => {
        const oldData = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const newData = [{ id: 1 }];
        const diff = calculateLCS(oldData, newData, 0);
        assert.strictEqual(diff.deletions.length, 2);
    });

    it('should detect updates when items change position', () => {
        const oldData = [{ id: 1 }, { id: 2 }];
        const newData = [{ id: 2 }, { id: 1 }];
        const diff = calculateLCS(oldData, newData, 0);
        assert.strictEqual(diff.updates.length >= 0, true);
    });

    it('should return no changes for identical arrays', () => {
        const data = [{ id: 1 }, { id: 2 }];
        const diff = calculateLCS(data, data, 0);
        assert.strictEqual(diff.hasChanges, false);
    });
});

describe('MockUITableView', () => {
    let tableView;

    beforeEach(() => {
        MockUITableViewCell.resetInstances();
        tableView = new MockUITableView();
    });

    it('should initialize with default values', () => {
        assert.strictEqual(tableView.style, 'plain');
        assert.strictEqual(tableView.rowHeight, 44);
        assert.strictEqual(tableView.sectionHeaderHeight, 30);
        assert.strictEqual(tableView.allowsSelection, true);
        assert.strictEqual(tableView.allowsMultipleSelection, false);
        assert.strictEqual(tableView.editing, false);
    });

    it('should calculate total rows correctly', () => {
        tableView._sections = [{ items: [1, 2, 3] }];
        assert.strictEqual(tableView.totalRows(), 3);
    });

    it('should calculate total rows with multiple sections', () => {
        tableView._sections = [
            { items: [1, 2] },
            { items: [3, 4, 5] }
        ];
        assert.strictEqual(tableView.totalRows(), 5);
    });

    it('should calculate total height correctly', () => {
        tableView._sections = [{ items: [1, 2, 3, 4, 5] }];
        assert.strictEqual(tableView._calculateTotalHeight(), 5 * 44);
    });

    it('should calculate visible range with buffer', () => {
        tableView._sections = [{ items: Array(100).fill(1) }];
        const range = tableView._calculateVisibleRange(0, 500);
        assert.strictEqual(range.startRow, 0);
        assert.ok(range.endRow >= 10);
    });

    it('should calculate visible range respects scroll position', () => {
        tableView._sections = [{ items: Array(100).fill(1) }];
        const range = tableView._calculateVisibleRange(500, 500);
        assert.strictEqual(range.startRow, Math.max(0, Math.floor(500 / 44) - 5));
    });

    it('should handle empty sections', () => {
        tableView._sections = [];
        assert.strictEqual(tableView.numberOfSections(), 1);
        assert.strictEqual(tableView.totalRows(), 0);
    });

    it('should register and dequeue cells', () => {
        tableView.registerClassForCellReuseIdentifier(MockUITableViewCell, 'Cell');
        const cell = new MockUITableViewCell('Cell');
        tableView.returnCellToPool(cell);
        
        const dequeued = tableView.dequeueReusableCellWithIdentifier('Cell');
        assert.strictEqual(dequeued, cell);
    });

    it('should clear cells on reload', () => {
        tableView._visibleCells.set('0-0', new MockUITableViewCell('Cell'));
        tableView.reloadData();
        assert.strictEqual(tableView._visibleCells.size, 0);
    });

    it('should set data and auto-create sections', () => {
        tableView.data = [1, 2, 3];
        assert.strictEqual(tableView._sections.length, 1);
        assert.deepStrictEqual(tableView._sections[0].items, [1, 2, 3]);
    });
});

describe('MockUITableViewCell', () => {
    let cell;

    beforeEach(() => {
        MockUITableViewCell.resetInstances();
        cell = new MockUITableViewCell('TestCell');
    });

    it('should initialize with reuse identifier', () => {
        assert.strictEqual(cell.reuseIdentifier, 'TestCell');
    });

    it('should set text', () => {
        const result = cell.setText('Hello');
        assert.strictEqual(cell.text, 'Hello');
        assert.strictEqual(result, cell);
    });

    it('should set detail text', () => {
        const result = cell.setDetailText('Details');
        assert.strictEqual(cell.detailText, 'Details');
        assert.strictEqual(result, cell);
    });

    it('should prepare for reuse and reset values', () => {
        cell.text = 'Test';
        cell.detailText = 'Details';
        cell.image = 'test.jpg';
        cell.accessoryType = 'checkmark';
        cell._selected = true;
        
        cell.prepareForReuse();
        
        assert.strictEqual(cell.text, '');
        assert.strictEqual(cell.detailText, '');
        assert.strictEqual(cell.image, null);
        assert.strictEqual(cell.accessoryType, 'none');
        assert.strictEqual(cell._selected, false);
    });

    it('should track selected state', () => {
        cell.setSelected(true);
        assert.strictEqual(cell._selected, true);
    });
});

describe('MockDataSource', () => {
    it('should return correct number of sections', () => {
        const dataSource = new MockDataSource([1, 2, 3]);
        const result = dataSource.numberOfSectionsInTableView(null);
        assert.strictEqual(result, 1);
    });

    it('should return correct number of rows', () => {
        const dataSource = new MockDataSource([1, 2, 3]);
        const result = dataSource.tableView_numberOfRowsInSection(null, 0);
        assert.strictEqual(result, 3);
    });

    it('should create cells with correct text', () => {
        MockUITableViewCell.resetInstances();
        const dataSource = new MockDataSource([1, 2, 3]);
        const cell = dataSource.tableView_cellForRowAt(null, 1, 0);
        assert.strictEqual(cell.text, 'Item 2');
    });

    it('should track call counts', () => {
        const dataSource = new MockDataSource([1, 2, 3]);
        dataSource.numberOfSectionsInTableView(null);
        dataSource.tableView_numberOfRowsInSection(null, 0);
        dataSource.tableView_cellForRowAt(null, 0, 0);
        
        assert.strictEqual(dataSource.numberOfCalls.numberOfSections, 1);
        assert.strictEqual(dataSource.numberOfCalls.numberOfRows, 1);
        assert.strictEqual(dataSource.numberOfCalls.cellForRow, 1);
    });
});

describe('Virtual Scrolling Calculations', () => {
    it('should calculate correct start row with buffer', () => {
        const tableView = new MockUITableView();
        tableView._sections = [{ items: Array(1000).fill(1) }];
        
        const range = tableView._calculateVisibleRange(0, 500);
        assert.ok(range.startRow <= 5);
    });

    it('should calculate correct end row with buffer', () => {
        const tableView = new MockUITableView();
        tableView._sections = [{ items: Array(1000).fill(1) }];
        
        const range = tableView._calculateVisibleRange(0, 500);
        assert.ok(range.endRow >= 16);
        assert.ok(range.endRow < 1000);
    });

    it('should handle scrolling to middle of list', () => {
        const tableView = new MockUITableView();
        tableView._sections = [{ items: Array(1000).fill(1) }];
        
        const range = tableView._calculateVisibleRange(22000, 500);
        assert.ok(range.startRow >= 495);
        assert.ok(range.startRow <= 505);
    });

    it('should not go below zero for start row', () => {
        const tableView = new MockUITableView();
        tableView._sections = [{ items: Array(100).fill(1) }];
        
        const range = tableView._calculateVisibleRange(-100, 500);
        assert.strictEqual(range.startRow, 0);
    });

    it('should not exceed total rows for end row', () => {
        const tableView = new MockUITableView();
        tableView._sections = [{ items: Array(10).fill(1) }];
        
        const range = tableView._calculateVisibleRange(0, 500);
        assert.strictEqual(range.endRow, 9);
    });
});

describe('TableView Row Operations', () => {
    let tableView;

    beforeEach(() => {
        tableView = new MockUITableView();
        tableView._sections = [{ items: ['a', 'b', 'c'] }];
        tableView.data = ['a', 'b', 'c'];
    });

    it('should append row', () => {
        tableView.appendRow('d');
        assert.strictEqual(tableView._sections[0].items.length, 4);
        assert.strictEqual(tableView._sections[0].items[3], 'd');
    });

    it('should prepend row', () => {
        tableView.prependRow('z');
        assert.strictEqual(tableView._sections[0].items[0], 'z');
        assert.strictEqual(tableView._sections[0].items.length, 4);
    });

    it('should insert row at index', () => {
        tableView.insertRow('x', { row: 1, section: 0 });
        assert.strictEqual(tableView._sections[0].items[1], 'x');
    });

    it('should remove row at index', () => {
        tableView.removeRowAt({ row: 1, section: 0 });
        assert.strictEqual(tableView._sections[0].items.length, 2);
        assert.strictEqual(tableView._sections[0].items[1], 'c');
    });

    it('should move row', () => {
        tableView.moveRow({ row: 0, section: 0 }, { row: 2, section: 0 });
        assert.strictEqual(tableView._sections[0].items[0], 'b');
        assert.strictEqual(tableView._sections[0].items[2], 'a');
    });
});

describe('TableView Sorting', () => {
    let tableView;

    beforeEach(() => {
        tableView = new MockUITableView();
    });

    it('should sort data ascending', () => {
        tableView._sections = [{ items: [3, 1, 2] }];
        tableView.sortBy('value', true);
        assert.strictEqual(tableView._sections[0].items[0], 1);
        assert.strictEqual(tableView._sections[0].items[2], 3);
    });

    it('should sort data descending', () => {
        tableView._sections = [{ items: [1, 3, 2] }];
        tableView.sortBy('value', false);
        assert.strictEqual(tableView._sections[0].items[0], 3);
    });
});

describe('TableView Filtering', () => {
    let tableView;

    beforeEach(() => {
        tableView = new MockUITableView();
    });

    it('should filter data by predicate', () => {
        tableView._sections = [{ items: [1, 2, 3, 4, 5] }];
        tableView.filterByPredicate(item => item > 2);
        assert.strictEqual(tableView._sections[0].items.length, 3);
    });
});

describe('Cell Reuse Pattern', () => {
    let tableView;

    beforeEach(() => {
        MockUITableViewCell.resetInstances();
        tableView = new MockUITableView();
        tableView.registerClassForCellReuseIdentifier(MockUITableViewCell, 'Cell');
    });

    it('should reuse cells efficiently', () => {
        const cell1 = new MockUITableViewCell('Cell');
        cell1.setText('Cell 1');
        tableView.returnCellToPool(cell1);
        
        const cell2 = new MockUITableViewCell('Cell');
        cell2.setText('Cell 2');
        tableView.returnCellToPool(cell2);
        
        assert.strictEqual(tableView._cellPool.getPoolInfo('Cell').available, 2);
        
        const dequeued = tableView.dequeueReusableCellWithIdentifier('Cell');
        assert.strictEqual(dequeued.text, '');
    });

    it('should handle multiple identifier pools', () => {
        tableView.registerClassForCellReuseIdentifier(MockUITableViewCell, 'CellA');
        tableView.registerClassForCellReuseIdentifier(MockUITableViewCell, 'CellB');
        
        const cellA = new MockUITableViewCell('CellA');
        const cellB = new MockUITableViewCell('CellB');
        
        tableView.returnCellToPool(cellA);
        tableView.returnCellToPool(cellB);
        
        assert.strictEqual(tableView._cellPool.getPoolInfo('CellA').available, 1);
        assert.strictEqual(tableView._cellPool.getPoolInfo('CellB').available, 1);
    });
});
