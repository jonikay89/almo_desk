import UIScrollView from './UIScrollView.js';
import UIColor from './UIColor.js';

class UICollectionView extends UIScrollView {
    constructor(frame, collectionViewLayout) {
        super();
        this.collectionViewLayout = collectionViewLayout || new UICollectionViewFlowLayout();
        this.delegate = null;
        this.dataSource = null;
        this.allowsSelection = true;
        this.allowsMultipleSelection = false;
        this.backgroundView = null;
        this._data = [];
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
        if (!this.dataSource) return;

        this.contentElement.innerHTML = '';

        const layout = this.collectionViewLayout;
        const numberOfItems = this.dataSource.numberOfItemsInCollectionView ? 
            this.dataSource.numberOfItemsInCollectionView(this) : 0;

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

        for (let item = 0; item < numberOfItems; item++) {
            if (currentX + itemWidth > maxWidth - sectionInset.right && itemsInRow > 0) {
                currentX = sectionInset.left;
                currentY += lineSpacing + itemHeight;
                itemsInRow = 0;
            }

            const cell = this.dataSource.collectionView_cellForItemAt(this, item);
            cell.init();
            cell.setFrame(currentX, currentY, itemWidth, itemHeight);
            cell.element.classList.add('ui-collectionview-cell');
            this.contentElement.appendChild(cell.element);

            currentX += itemWidth + spacing;
            itemsInRow++;
        }

        const totalHeight = currentY + itemHeight + sectionInset.bottom;
        this.setContentSize(maxWidth, totalHeight);
    }

    dequeueReusableCellWithReuseIdentifier(identifier, index) {
        return null;
    }

    selectItemAtIndexPath(index, animated, scrollPosition) {
        const cells = this.contentElement.querySelectorAll('.ui-collectionview-cell');
        const targetCell = cells[index];
        if (targetCell) {
            targetCell.classList.add('selected');
        }
    }

    deselectItemAtIndexPath(index, animated) {
        const cells = this.contentElement.querySelectorAll('.ui-collectionview-cell');
        const targetCell = cells[index];
        if (targetCell) {
            targetCell.classList.remove('selected');
        }
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