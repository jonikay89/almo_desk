import NSObject from './NSObject.js';

class UIDragItem extends NSObject {
    constructor(itemProvider, localObject = null) {
        super();
        this._itemProvider = itemProvider;
        this._localObject = localObject;
        this._previewProvider = null;
        this._suggestedTitle = '';
        this._allowsText = true;
        this._allowsImages = true;
        this._allowsFiles = true;
    }

    get itemProvider() {
        return this._itemProvider;
    }

    get localObject() {
        return this._localObject;
    }

    set localObject(value) {
        this._localObject = value;
    }

    get previewProvider() {
        return this._previewProvider;
    }

    set previewProvider(value) {
        this._previewProvider = value;
    }

    get suggestedTitle() {
        return this._suggestedTitle;
    }

    set suggestedTitle(value) {
        this._suggestedTitle = value;
    }

    setAllowsText(value) {
        this._allowsText = value;
    }

    setAllowsImages(value) {
        this._allowsImages = value;
    }

    setAllowsFiles(value) {
        this._allowsFiles = value;
    }

    get allowsText() {
        return this._allowsText;
    }

    get allowsImages() {
        return this._allowsImages;
    }

    get allowsFiles() {
        return this._allowsFiles;
    }
}

class UIDragSession extends NSObject {
    constructor(items, sourceView = null) {
        super();
        this._items = items;
        this._sourceView = sourceView;
        this._progress = 0;
        this._isLocal = true;
        this._animating = true;
    }

    get items() {
        return [...this._items];
    }

    get count() {
        return this._items.length;
    }

    get progress() {
        return this._progress;
    }

    set progress(value) {
        this._progress = Math.max(0, Math.min(1, value));
    }

    get isLocal() {
        return this._isLocal;
    }

    get animating() {
        return this._animating;
    }

    set animating(value) {
        this._animating = value;
    }

    get sourceView() {
        return this._sourceView;
    }
}

class UIDragPreview extends NSObject {
    constructor(view, params = {}) {
        super();
        this._view = view;
        this._params = {
            visibleFrame: params.visibleFrame || null,
            isConstrained: params.isConstrained || false,
            cornerRadius: params.cornerRadius || 0,
            shadowMode: params.shadowMode || 'outside'
        };
    }

    get view() {
        return this._view;
    }

    get params() {
        return { ...this._params };
    }
}

class UIDragPreviewParameters extends NSObject {
    constructor() {
        super();
        this._visibleFrame = null;
        this._isConstrained = false;
        this._cornerRadius = 0;
        this._shadowMode = 'outside';
    }

    setVisibleFrame(frame) {
        this._visibleFrame = frame;
    }

    setIsConstrained(value) {
        this._isConstrained = value;
    }

    setCornerRadius(value) {
        this._cornerRadius = value;
    }

    setShadowMode(mode) {
        this._shadowMode = mode;
    }
}

class UIDragInteraction extends NSObject {
    constructor(delegate) {
        super();
        this._delegate = delegate;
        this._isEnabled = true;
        this._minimumPressDuration = 0.3;
        this._allowedTypes = ['text', 'image', 'url', 'file'];
        this._view = null;
        this._isDragging = false;
        this._activeDrag = null;
    }

    get delegate() {
        return this._delegate;
    }

    get isEnabled() {
        return this._isEnabled;
    }

    set isEnabled(value) {
        this._isEnabled = value;
    }

    get minimumPressDuration() {
        return this._minimumPressDuration;
    }

    set minimumPressDuration(value) {
        this._minimumPressDuration = value;
    }

    get allowedTypes() {
        return [...this._allowedTypes];
    }

    addAllowedType(type) {
        if (!this._allowedTypes.includes(type)) {
            this._allowedTypes.push(type);
        }
    }

    removeAllowedType(type) {
        const index = this._allowedTypes.indexOf(type);
        if (index !== -1) {
            this._allowedTypes.splice(index, 1);
        }
    }

    _attachToView(view) {
        this._view = view;
    }

    _detachFromView() {
        this._view = null;
    }

    _canHandleTypes(types) {
        if (!this._isEnabled) return false;
        if (!types || types.length === 0) return true;
        return types.some(type => this._allowedTypes.includes(type));
    }

    _beginDrag(items, point, event) {
        if (!this._view || !this._canHandleTypes(items.map(i => i.itemProvider?.type))) {
            return null;
        }

        this._isDragging = true;
        const dragSession = new UIDragSession(items, this._view);
        dragSession._dragInteraction = this;
        
        if (this._delegate && this._delegate.dragInteractionWillBegin) {
            this._delegate.dragInteractionWillBegin(dragSession);
        }

        const preview = this._createPreviewForItems(items);
        this._activeDrag = {
            session: dragSession,
            preview: preview,
            startPoint: point
        };

        return dragSession;
    }

    _createPreviewForItems(items) {
        const previewItems = [];
        for (const item of items) {
            if (item.previewProvider) {
                previewItems.push(item.previewProvider());
            } else if (item.localObject && item.localObject.view) {
                const params = new UIDragPreviewParameters();
                params.setCornerRadius(item.localObject.view.layer?.cornerRadius || 0);
                previewItems.push(new UIDragPreview(item.localObject.view, params));
            }
        }
        return previewItems;
    }

    _updateDrag(point, event) {
        if (!this._activeDrag) return;
        this._activeDrag.currentPoint = point;
    }

    _endDrag(point, event) {
        if (!this._activeDrag) return null;
        
        const dragSession = this._activeDrag.session;
        this._isDragging = false;
        
        if (this._delegate && this._delegate.dragInteractionDidEnd) {
            this._delegate.dragInteractionDidEnd(dragSession);
        }

        this._activeDrag = null;
        return dragSession;
    }

    _cancelDrag() {
        if (!this._activeDrag) return;
        
        if (this._delegate && this._delegate.dragInteractionDidCancel) {
            this._delegate.dragInteractionDidCancel(this._activeDrag.session);
        }

        this._isDragings = false;
        this._activeDrag = null;
    }

    get isDragging() {
        return this._isDragging;
    }

    get activeDrag() {
        return this._activeDrag?.session || null;
    }
}

export { UIDragItem, UIDragSession, UIDragPreview, UIDragPreviewParameters, UIDragInteraction };
export default UIDragItem;