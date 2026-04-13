import UIScrollView from './UIScrollView.js';
import UIColor from './UIColor.js';
import { CGPath, CAGradientLayer, CAShapeLayer } from './CALayer.js';
import { Optional, Result } from './Generics.js';
import { WeakRef } from './WeakReference.js';
import { NSValue, kp, getProperty, updateProperty, compareBy, compareByDescending } from './Foundation.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch, ifLet, guardLet } from './PatternMatching.js';
import { defineTypeAlias } from './Protocol.js';
import {
    CollectionViewDelegate,
    CollectionViewDataSource
} from './TypeAliases.js';

defineTypeAlias('CollectionViewDelegateBundle', CollectionViewDelegate, CollectionViewDataSource);

class UICollectionView extends UIScrollView {
    constructor(frame, collectionViewLayout) {
        super();
        this.collectionViewLayout = collectionViewLayout || new UICollectionViewFlowLayout();
        this._delegate = null;
        this._dataSource = null;
        this.allowsSelection = true;
        this.allowsMultipleSelection = false;
        this.backgroundView = null;
        this._data = [];
        this._sections = [];
        this.reusableCells = {};
        this.itemSize = { width: 100, height: 100 };
    }

    get description() {
        return `UICollectionView(layout: ${this.collectionViewLayout?.constructor?.name || 'unknown'}, allowsSelection: ${this.allowsSelection})`;
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
        return Optional.of(this.dataSource?.numberOfSectionsInCollectionView)
            .flatMap(fn => Optional.fromNullable(fn(this)))
            .getOrElse(this._sections.length || 1);
    }

    numberOfItemsInSection(section) {
        return Optional.of(this.dataSource?.numberOfItemsInCollectionView)
            .flatMap(fn => Optional.fromNullable(fn(this, section)))
            .getOrElse(0);
    }

    visibleCells() {
        const cells = this.contentElement?.querySelectorAll('.ui-collectionview-cell') || [];
        return Array.from(cells);
    }

    indexPathsForVisibleItems() {
        const cells = this.contentElement?.querySelectorAll('.ui-collectionview-cell') || [];
        return Array.from(cells).map((cell, index) => ({ item: index, section: 0 }));
    }

    layoutAttributesForItemAtIndexPath(indexPath) {
        const layout = this.collectionViewLayout;
        const itemWidth = layout.itemSize?.width || 100;
        const itemHeight = layout.itemSize?.height || 100;
        const spacing = layout.minimumInteritemSpacing || 10;
        const lineSpacing = layout.minimumLineSpacing || 10;
        const sectionInset = layout.sectionInset || { top: 10, right: 10, bottom: 10, left: 10 };
        
        const maxWidth = this.frame.width || 300;
        const itemsPerRow = Math.floor((maxWidth - sectionInset.left - sectionInset.right + spacing) / (itemWidth + spacing));
        const row = Math.floor(indexPath.item / itemsPerRow);
        const col = indexPath.item % itemsPerRow;
        
        const x = sectionInset.left + col * (itemWidth + spacing);
        const y = sectionInset.top + row * (itemHeight + lineSpacing);
        
        return NSValue.valueWithRect({ x, y, width: itemWidth, height: itemHeight });
    }

    init() {
        super.init();
        this.element = document.createElement('div');
        this.element.className = 'ui-collectionview';
        this.element.style.position = 'relative';
        this.element.style.overflow = 'auto';

        this.contentElement = document.createElement('div');
        this.contentElement.className = 'ui-collectionview-content';
        this.contentElement.style.position = 'relative';
        this.contentElement.style.minWidth = '100%';
        this.contentElement.style.minHeight = '100%';

        this.element.appendChild(this.contentElement);

        return this;
    }

    reloadData() {
        if (!this.dataSource) return Result.failure(new Error('No dataSource'));

        this.contentElement.innerHTML = '';

        const layout = this.collectionViewLayout;
        const numberOfItems = Optional.of(this.dataSource.numberOfItemsInCollectionView)
            .flatMap(fn => Optional.fromNullable(fn(this)))
            .getOrElse(0);

        let currentX = 0;
        let currentY = 0;
        let itemsInRow = 0;
        const maxWidth = this.frame.width || 300;
        const itemWidth = layout.itemSize?.width || 100;
        const itemHeight = layout.itemSize?.height || 100;
        const spacing = layout.minimumInteritemSpacing || 10;
        const lineSpacing = layout.minimumLineSpacing || 10;
        const sectionInset = layout.sectionInset || { top: 10, right: 10, bottom: 10, left: 10 };

        currentX = sectionInset.left;
        const results = [];

        for (let item = 0; item < numberOfItems; item++) {
            if (currentX + itemWidth > maxWidth - sectionInset.right && itemsInRow > 0) {
                currentX = sectionInset.left;
                currentY += lineSpacing + itemHeight;
                itemsInRow = 0;
            }

            const cellResult = Optional.of(this.dataSource?.collectionView_cellForItemAt)
                .flatMap(fn => Optional.fromNullable(fn(this, item)));

            if (cellResult.isPresent) {
                const cell = cellResult.value;
                cell.init();
                cell.frame = { x: currentX, y: currentY, width: itemWidth, height: itemHeight };
                cell.element.classList.add('ui-collectionview-cell');
                this.contentElement.appendChild(cell.element);
                results.push(Result.success(cell));
            } else {
                results.push(Result.failure(new Error(`Failed to create cell at index ${item}`)));
            }

            currentX += itemWidth + spacing;
            itemsInRow++;
        }

        const totalHeight = currentY + itemHeight + sectionInset.bottom;
        this.setContentSize(maxWidth, totalHeight);
        return results.every(r => r.isSuccess) ? Result.success(true) : Result.failure(new Error('Some cells failed'));
    }

    dequeueReusableCellWithReuseIdentifier(identifier, index) {
        return Optional.empty();
    }

    cellForItemAt(index) {
        const cells = this.contentElement.querySelectorAll('.ui-collectionview-cell');
        return Optional.fromNullable(cells[index]);
    }

    selectItemAtIndexPath(index, animated, scrollPosition) {
        const cells = this.contentElement.querySelectorAll('.ui-collectionview-cell');
        const targetCell = cells[index];
        if (targetCell) {
            targetCell.classList.add('selected');
            return Result.success(targetCell);
        }
        return Result.failure(new Error('Cell not found'));
    }

    deselectItemAtIndexPath(index, animated) {
        const cells = this.contentElement.querySelectorAll('.ui-collectionview-cell');
        const targetCell = cells[index];
        if (targetCell) {
            targetCell.classList.remove('selected');
            return Result.success(true);
        }
        return Result.failure(new Error('Cell not found'));
    }

    supplementaryViewForKind(elementKind, atIndex) {
        return Optional.empty();
    }

    indexPathForItemAt(point) {
        return Optional.empty();
    }

    layoutSubviews() {
        super.layoutSubviews();
        if (this.contentElement) {
            this.contentElement.style.width = `${this.frame.width}px`;
        }
        if (this._gradientLayer || this._shapeLayers?.length > 0) {
            this.#renderLayers();
        }
    }

    #renderLayers() {
        if (!this.element) return;
        const existingCanvas = this.element.querySelector('.layer-canvas');
        if (existingCanvas) existingCanvas.remove();
        if (this._layer?._sublayers?.length === 0) return;
        const canvas = document.createElement('canvas');
        canvas.className = 'layer-canvas';
        canvas.style.position = 'absolute';
        canvas.style.left = '0';
        canvas.style.top = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.width = this._bounds.width * 2;
        canvas.height = this._bounds.height * 2;
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);
        for (const sublayer of this._layer._sublayers) {
            sublayer.renderToContext(ctx);
        }
        this.element.style.position = 'relative';
        this.element.insertBefore(canvas, this.element.firstChild);
    }

    setItemSize(width, height) {
        this.itemSize = { width, height };
        return this;
    }

    withItemSize(width, height) {
        return this.setItemSize(width, height);
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

    withBackgroundLayer(gradient) {
        if (gradient && this._layer) {
            this._layer.addSublayer(gradient);
            this.#renderLayers();
        }
        return this;
    }

    withShadow(color, opacity, offset, radius) {
        this.setShadow?.(color, opacity, offset, radius);
        return this;
    }

    withGradient(colors, locations, startPoint, endPoint) {
        if (this._layer) {
            const gradient = CAGradientLayer.layer();
            gradient.colors = colors;
            gradient.frame = { x: 0, y: 0, width: this._bounds.width, height: this._bounds.height };
            if (locations) gradient.locations = locations;
            if (startPoint) gradient.startPoint = startPoint;
            if (endPoint) gradient.endPoint = endPoint;
            gradient.name = 'collectionGradientLayer';
            this._layer.addSublayer(gradient);
            this.#renderLayers();
        }
        return this;
    }

    withBorder(color, width, radius) {
        if (this._layer) {
            const shapeLayer = CAShapeLayer.layer();
            shapeLayer.frame = this._bounds;
            shapeLayer.path = CGPath.CreateRect(0, 0, this._bounds.width, this._bounds.height);
            shapeLayer.fillColor = null;
            shapeLayer.strokeColor = color;
            shapeLayer.lineWidth = width;
            if (radius) shapeLayer.cornerRadius = radius;
            this._layer.addSublayer(shapeLayer);
            this.#renderLayers();
        }
        return this;
    }

    withCornerRadius(radius) {
        if (this.element) {
            this.element.style.borderRadius = `${radius}px`;
        }
        return this;
    }

    withBackgroundColor(color) {
        if (color instanceof UIColor) {
            this.element.style.backgroundColor = color.css;
        } else if (typeof color === 'string') {
            this.element.style.backgroundColor = color;
        }
        return this;
    }

    encode() {
        return {
            allowsSelection: this.allowsSelection,
            allowsMultipleSelection: this.allowsMultipleSelection
        };
    }

    static decode(data) {
        const collectionView = new UICollectionView({}, new UICollectionViewFlowLayout());
        collectionView.allowsSelection = data.allowsSelection !== false;
        collectionView.allowsMultipleSelection = data.allowsMultipleSelection || false;
        return collectionView;
    }

    matchSelection(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        return Switch(predicate)
            .case({ allowsSelection: true }, () => this.allowsSelection === true)
            .case({ allowsSelection: false }, () => this.allowsSelection === false)
            .case({ allowsMultipleSelection: true }, () => this.allowsMultipleSelection === true)
            .case({ allowsMultipleSelection: false }, () => this.allowsMultipleSelection === false)
            .case({ empty: true }, () => this._data.length === 0)
            .case({ empty: false }, () => this._data.length > 0)
            .default(() => false)
            .evaluate();
    }

    matchItem(atIndexPath, predicate) {
        const { item, section } = atIndexPath;
        const state = {
            item,
            section,
            isFirst: item === 0,
            isLast: item === this.numberOfItemsInSection(section) - 1,
            isEven: item % 2 === 0,
            isOdd: item % 2 !== 0
        };
        if (typeof predicate === 'function') {
            return predicate(state);
        }
        return Switch(predicate)
            .case({ first: true }, () => state.isFirst)
            .case({ last: true }, () => state.isLast)
            .case({ even: true }, () => state.isEven)
            .case({ odd: true }, () => state.isOdd)
            .case({ at: Switch.let('i'), section: Switch.let('s') }, 
                  (m) => state.item === m.i && state.section === m.s)
            .case({ item: Switch.let('i') }, (m) => state.item === m.i)
            .case({ section: Switch.let('s') }, (m) => state.section === m.s)
            .default(() => false)
            .evaluate();
    }
}

class UICollectionViewFlowLayout {
    constructor() {
        this.itemSize = { width: 100, height: 100 };
        this.minimumInteritemSpacing = 10;
        this.minimumLineSpacing = 10;
        this.sectionInset = { top: 10, right: 10, bottom: 10, left: 10 };
        this.scrollDirection = 'vertical';
        this.headerReferenceSize = { width: 0, height: 0 };
        this.footerReferenceSize = { width: 0, height: 0 };
    }

    get description() {
        return `UICollectionViewFlowLayout(itemSize: {w: ${this.itemSize.width}, h: ${this.itemSize.height}})`;
    }

    itemSizeValue() {
        return NSValue.valueWithSize(this.itemSize);
    }

    encode() {
        return {
            itemSize: this.itemSize,
            minimumInteritemSpacing: this.minimumInteritemSpacing,
            minimumLineSpacing: this.minimumLineSpacing,
            sectionInset: this.sectionInset,
            scrollDirection: this.scrollDirection
        };
    }

    static decode(data) {
        const layout = new UICollectionViewFlowLayout();
        layout.itemSize = data.itemSize || { width: 100, height: 100 };
        layout.minimumInteritemSpacing = data.minimumInteritemSpacing || 10;
        layout.minimumLineSpacing = data.minimumLineSpacing || 10;
        layout.sectionInset = data.sectionInset || { top: 10, right: 10, bottom: 10, left: 10 };
        layout.scrollDirection = data.scrollDirection || 'vertical';
        return layout;
    }

    matchLayout(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        return Switch(predicate)
            .case({ scrollDirection: 'vertical' }, () => this.scrollDirection === 'vertical')
            .case({ scrollDirection: 'horizontal' }, () => this.scrollDirection === 'horizontal')
            .case({ squareItems: true }, () => this.itemSize.width === this.itemSize.height)
            .case({ wideItems: true }, () => this.itemSize.width > this.itemSize.height)
            .case({ tallItems: true }, () => this.itemSize.height > this.itemSize.width)
            .case({ itemSize: Switch.let('size') }, (m) => 
                   this.itemSize.width === m.size.width && this.itemSize.height === m.size.height)
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
        if (section && section.items[indexPath.item]) {
            updateProperty(section.items[indexPath.item], path, newValue);
            this.reloadItemsAtIndexPaths([indexPath]);
        }
        return this;
    }

    getValueAt(indexPath, keyPath) {
        const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
        const section = this._sections[indexPath.section];
        if (section && section.items[indexPath.item]) {
            return getProperty(section.items[indexPath.item], path);
        }
        return null;
    }

    insertItem(item, atIndexPath, animated = true) {
        const section = this._sections[atIndexPath.section];
        if (section) {
            section.items.splice(atIndexPath.item, 0, item);
            this.reloadData();
        }
        return this;
    }

    removeItemAt(atIndexPath, animated = true) {
        const section = this._sections[atIndexPath.section];
        if (section) {
            section.items.splice(atIndexPath.item, 1);
            this.reloadData();
        }
        return this;
    }

    moveItem(fromIndexPath, toIndexPath, animated = true) {
        const fromSection = this._sections[fromIndexPath.section];
        const toSection = this._sections[toIndexPath.section];
        if (fromSection && toSection) {
            const [item] = fromSection.items.splice(fromIndexPath.item, 1);
            toSection.items.splice(toIndexPath.item, 0, item);
            this.reloadData();
        }
        return this;
    }

    appendItem(item, animated = true) {
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

    prependItem(item, animated = true) {
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

    findItem(predicate) {
        for (let s = 0; s < this._sections.length; s++) {
            const section = this._sections[s];
            for (let i = 0; i < section.items.length; i++) {
                if (predicate(section.items[i])) {
                    return { item: i, section: s, itemData: section.items[i] };
                }
            }
        }
        return null;
    }

    findItemBy(keyPath, value) {
        const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
        return this.findItem(item => getProperty(item, path) === value);
    }

    reloadData() {
        if (this.element) {
            this.#render();
        }
    }

    #render() {
    }
}

export default UICollectionView;
export { UICollectionViewFlowLayout };