class UIResponder {
    constructor() {
        this._nextResponder = null;
        this._userInteractionEnabled = true;
    }

    get nextResponder() {
        return this._nextResponder;
    }

    set nextResponder(responder) {
        this._nextResponder = responder;
    }

    get userInteractionEnabled() {
        return this._userInteractionEnabled;
    }

    set userInteractionEnabled(enabled) {
        this._userInteractionEnabled = enabled;
    }

    touchesBegan(touches, event) {}

    touchesMoved(touches, event) {}

    touchesEnded(touches, event) {}

    touchesCancelled(touches, event) {}

    isFirstResponder() {
        return false;
    }

    becomeFirstResponder() {
        return false;
    }

    resignFirstResponder() {
        return false;
    }
}

export default UIResponder;
