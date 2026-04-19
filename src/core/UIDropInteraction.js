import NSObject from './NSObject.js';

class UIDropProposal extends NSObject {
    constructor(operation = 'copy') {
        super();
        this._operation = operation;
        this._isPrefetchingEnabled = true;
    }

    get operation() {
        return this._operation;
    }

    set operation(value) {
        this._operation = value;
    }

    get isPrefetchingEnabled() {
        return this._isPrefetchingEnabled;
    }

    set isPrefetchingEnabled(value) {
        this._isPrefetchingEnabled = value;
    }
}

UIDropProposal.COPY = 'copy';
UIDropProposal.MOVE = 'move';
UIDropProposal.LINK = 'link';
UIDropProposal.CANCEL = 'cancel';

class UIDropSession extends NSObject {
    constructor(items, sourceApplication = null) {
        super();
        this._items = items;
        this._sourceApplication = sourceApplication;
        this._localDragSession = null;
        this._progress = 0;
        this._isAnimated = true;
        this._dropAnimation = 'default';
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

    get isAnimated() {
        return this._isAnimated;
    }

    set isAnimated(value) {
        this._isAnimated = value;
    }

    get dropAnimation() {
        return this._dropAnimation;
    }

    set dropAnimation(value) {
        this._dropAnimation = value;
    }

    get localDragSession() {
        return this._localDragSession;
    }

    set localDragSession(value) {
        this._localDragSession = value;
    }

    get hasItemsConformingToTypeIdentifiers() {
        return this._items.some(item => item.itemProvider != null);
    }

    canLoadObjectsOfClass(aClass) {
        return this._items.some(item => {
            if (!item.localObject) return false;
            return item.localObject instanceof aClass;
        });
    }

    _getItemProviders() {
        return this._items
            .filter(item => item.itemProvider != null)
            .map(item => item.itemProvider);
    }
}

class UIDropInteractionDelegate {
    dropInteractionCanHandleItems(session) {
        return true;
    }

    dropInteractionsessionWillBegin(session) {
    }

    dropInteractionsessionDidBegin(session) {
    }

    dropInteractionsessionDidUpdate(session, dropProposal) {
        return dropProposal;
    }

    dropInteractionsessionDidEnd(session, operation) {
    }

    dropInteractionsessionDidEnter(session) {
    }

    dropInteractionsessionDidExit(session) {
    }

    dropInteractionsessionWillFit(session, proposal) {
        return proposal;
    }

    dropInteractionsessionDidLoadItems(session) {
    }
}

class UIDropInteraction extends NSObject {
    constructor(delegate) {
        super();
        this._delegate = delegate || new UIDropInteractionDelegate();
        this._isEnabled = true;
        this._allowedTypes = ['text', 'image', 'url', 'file'];
        this._view = null;
        this._isDropping = false;
        this._activeDrop = null;
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

    _performDrop(session) {
        if (!this._view || !this._activeDrop) return;

        const dropCompletion = (operation) => {
            if (this._delegate && this._delegate.dropInteractionsessionDidEnd) {
                this._delegate.dropInteractionsessionDidEnd(this._activeDrop.session, operation);
            }
            this._isDropping = false;
            this._activeDrop = null;
        };

        if (this._delegate && this._delegate.dropInteractionsessionDidUpdate) {
            const proposal = new UIDropProposal(UIDropProposal.COPY);
            const result = this._delegate.dropInteractionsessionDidUpdate(this._activeDrop.session, proposal);
            if (result === false) {
                dropCompletion(UIDropProposal.CANCEL);
                return;
            }
        }

        if (this._delegate && this._delegate.dropInteractionperformDrop) {
            this._delegate.dropInteractionperformDrop(this._activeDrop.session);
        }

        dropCompletion(UIDropProposal.COPY);
    }

    _dragEntered(session, point) {
        if (!this._canHandleTypes(session.items.map(i => i.itemProvider?.type))) {
            return new UIDropProposal(UIDropProposal.CANCEL);
        }

        if (!this._isDropping) {
            this._isDropping = true;
            this._activeDrop = { session, point };
            
            if (this._delegate && this._delegate.dropInteractionsessionWillBegin) {
                this._delegate.dropInteractionsessionWillBegin(session);
            }
            if (this._delegate && this._delegate.dropInteractionsessionDidEnter) {
                this._delegate.dropInteractionsessionDidEnter(session);
            }
        }

        if (this._delegate && this._delegate.dropInteractionsessionDidUpdate) {
            return this._delegate.dropInteractionsessionDidUpdate(session, new UIDropProposal(UIDropProposal.COPY));
        }

        return new UIDropProposal(UIDropProposal.COPY);
    }

    _dragUpdated(session, point) {
        if (!this._activeDrop) return new UIDropProposal(UIDropProposal.CANCEL);
        
        this._activeDrop.point = point;

        if (this._delegate && this._delegate.dropInteractionsessionDidUpdate) {
            return this._delegate.dropInteractionsessionDidUpdate(session, new UIDropProposal(UIDropProposal.COPY));
        }

        return new UIDropProposal(UIDropProposal.COPY);
    }

    _dragExited(session) {
        if (this._delegate && this._delegate.dropInteractionsessionDidExit) {
            this._delegate.dropInteractionsessionDidExit(session);
        }
    }

    _dragEnded(session, operation) {
        if (this._delegate && this._delegate.dropInteractionsessionDidEnd) {
            this._delegate.dropInteractionsessionDidEnd(session, operation);
        }
        this._isDropping = false;
        this._activeDrop = null;
    }

    get isDropping() {
        return this._isDropping;
    }

    get activeDrop() {
        return this._activeDrop?.session || null;
    }
}

export { UIDropProposal, UIDropSession, UIDropInteractionDelegate, UIDropInteraction };
export default UIDropInteraction;