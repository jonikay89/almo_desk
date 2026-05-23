import UIView from './UIView.js';

class UICollectionReusableView extends UIView {
    constructor() {
        super();
        this._reuseIdentifier = null;
    }

    get reuseIdentifier() { return this._reuseIdentifier; }

    prepareForReuse() {
    }

    apply(layoutAttributes) {
        if (layoutAttributes) {
            if (layoutAttributes.frame) this.frame = layoutAttributes.frame;
            if (layoutAttributes.alpha !== undefined) this.alpha = layoutAttributes.alpha;
            if (layoutAttributes.hidden !== undefined) this.hidden = layoutAttributes.hidden;
            if (layoutAttributes.zIndex !== undefined) this.zIndex = layoutAttributes.zIndex;
        }
    }

    preferredLayoutAttributesFittingAttributes(layoutAttributes) {
        return layoutAttributes;
    }
}

export default UICollectionReusableView;
