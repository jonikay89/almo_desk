import UIView from './UIView.js';

class UICollectionView extends UIView {
    constructor() {
        super();
    }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('div');
            this._element.style.position = 'absolute';
        }
        return this._element;
    }
}

class UICollectionViewFlowLayout extends UIView {
    constructor() {
        super();
        this._itemSize = { width: 50, height: 50 };
        this._minimumInteritemSpacing = 10;
        this._minimumLineSpacing = 10;
        this._scrollDirection = 'vertical';
    }

    get itemSize() { return this._itemSize; }
    set itemSize(value) { this._itemSize = value; }

    get minimumInteritemSpacing() { return this._minimumInteritemSpacing; }
    get minimumLineSpacing() { return this._minimumLineSpacing; }
    get scrollDirection() { return this._scrollDirection; }
}

export default UICollectionView;
export { UICollectionViewFlowLayout };
