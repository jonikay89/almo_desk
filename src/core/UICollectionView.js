import UIScrollView from './UIScrollView.js';
import UIColor from './UIColor.js';
import { Optional, Result } from './Generics.js';
import { WeakRef } from './WeakReference.js';

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

    init() {
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
}

export default UICollectionView;
export { UICollectionViewFlowLayout };