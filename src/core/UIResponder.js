import NSObject from './NSObject.js';

class UIResponder extends NSObject {
    constructor() {
        super();
        this._nextResponder = null;
        this._isFirstResponder = false;
        this._touches = {};
        this._gestureRecognizers = [];
        this._isAccessibilityElement = false;
        this._accessibilityLabel = '';
        this._accessibilityHint = '';
        this._accessibilityValue = '';
        this._accessibilityTraits = 0;
        this._isAccessibilityEnabled = true;
        this._accessibilityElements = null;
    }

    get nextResponder() {
        return this._nextResponder;
    }

    set nextResponder(value) {
        this._nextResponder = value;
    }

    get isFirstResponder() {
        return this._isFirstResponder;
    }

    becomeFirstResponder() {
        if (this._isFirstResponder) return true;
        this._isFirstResponder = true;
        return true;
    }

    resignFirstResponder() {
        if (!this._isFirstResponder) return true;
        this._isFirstResponder = false;
        return true;
    }

    touchesBegan(touches, event) {
        return;
    }

    touchesMoved(touches, event) {
        return;
    }

    touchesEnded(touches, event) {
        return;
    }

    touchesCancelled(touches, event) {
        return;
    }

    motionBegan(motion, event) {
        return;
    }

    motionEnded(motion, event) {
        return;
    }

    motionCancelled(motion, event) {
        return;
    }

    pressesBegan(presses, event) {
        return;
    }

    pressesChanged(presses, event) {
        return;
    }

    pressesEnded(presses, event) {
        return;
    }

    pressesCancelled(presses, event) {
        return;
    }

    keyboardWillShow(notification) {
        return;
    }

    keyboardWillHide(notification) {
        return;
    }

    keyboardDidShow(notification) {
        return;
    }

    keyboardDidHide(notification) {
        return;
    }

    addGestureRecognizer(gestureRecognizer) {
        if (!gestureRecognizer) return;
        this._gestureRecognizers.push(gestureRecognizer);
        gestureRecognizer._view = this;
    }

    removeGestureRecognizer(gestureRecognizer) {
        if (!gestureRecognizer) return;
        const index = this._gestureRecognizers.indexOf(gestureRecognizer);
        if (index !== -1) {
            this._gestureRecognizers.splice(index, 1);
            gestureRecognizer._view = null;
        }
    }

    gestureRecognizers() {
        return [...this._gestureRecognizers];
    }

    _handleGestureRecognizerTouchBegan(touch, event) {
        for (const gesture of this._gestureRecognizers) {
            if (gesture._handleTouchBegan(touch, event)) {
                return true;
            }
        }
        return false;
    }

    _handleGestureRecognizerTouchMoved(touch, event) {
        for (const gesture of this._gestureRecognizers) {
            if (gesture._handleTouchMoved(touch, event)) {
                return true;
            }
        }
        return false;
    }

    _handleGestureRecognizerTouchEnded(touch, event) {
        for (const gesture of this._gestureRecognizers) {
            if (gesture._handleTouchEnded(touch, event)) {
                return true;
            }
        }
        return false;
    }

    _handleGestureRecognizerTouchCancelled(touch, event) {
        for (const gesture of this._gestureRecognizers) {
            if (gesture._handleTouchCancelled(touch, event)) {
                return true;
            }
        }
        return false;
    }

    _gestureRecognizerForTouch(touch) {
        for (const gesture of this._gestureRecognizers) {
            if (gesture._touches.has(touch.identifier || 0)) {
                return gesture;
            }
        }
        return null;
    }

    get isAccessibilityElement() {
        return this._isAccessibilityElement;
    }

    set isAccessibilityElement(value) {
        this._isAccessibilityElement = value;
    }

    get accessibilityLabel() {
        return this._accessibilityLabel;
    }

    set accessibilityLabel(value) {
        this._accessibilityLabel = value;
        this._updateAccessibilityAttributes();
    }

    get accessibilityHint() {
        return this._accessibilityHint;
    }

    set accessibilityHint(value) {
        this._accessibilityHint = value;
        this._updateAccessibilityAttributes();
    }

    get accessibilityValue() {
        return this._accessibilityValue;
    }

    set accessibilityValue(value) {
        this._accessibilityValue = value;
        this._updateAccessibilityAttributes();
    }

    get accessibilityTraits() {
        return this._accessibilityTraits;
    }

    set accessibilityTraits(value) {
        this._accessibilityTraits = value;
        this._updateAccessibilityAttributes();
    }

    get isAccessibilityEnabled() {
        return this._isAccessibilityEnabled;
    }

    set isAccessibilityEnabled(value) {
        this._isAccessibilityEnabled = value;
        this._updateAccessibilityAttributes();
    }

    get accessibilityElements() {
        return this._accessibilityElements || null;
    }

    set accessibilityElements(value) {
        this._accessibilityElements = value;
    }

    _updateAccessibilityAttributes() {
        if (typeof document !== 'undefined' && this._element) {
            this._element.setAttribute('role', this._getAccessibilityRole());
            if (this._accessibilityLabel) {
                this._element.setAttribute('aria-label', this._accessibilityLabel);
            }
            if (this._accessibilityHint) {
                this._element.setAttribute('aria-description', this._accessibilityHint);
            }
            if (this._accessibilityValue) {
                this._element.setAttribute('aria-value', this._accessibilityValue);
            }
            if (!this._isAccessibilityEnabled) {
                this._element.setAttribute('aria-disabled', 'true');
            }
        }
    }

    _getAccessibilityRole() {
        const traits = this._accessibilityTraits;
        if (traits & 0x1) return 'button';
        if (traits & 0x2) return 'link';
        if (traits & 0x4) return 'header';
        if (traits & 0x8) return 'search';
        if (traits & 0x10) return 'img';
        if (traits & 0x20) return 'checkbox';
        if (traits & 0x40) return 'keyboard';
        if (traits & 0x80) return 'text';
        return 'group';
    }

    setAccessibilityElement(isElement, label, hint, value, traits) {
        this._isAccessibilityElement = isElement;
        this._accessibilityLabel = label || '';
        this._accessibilityHint = hint || '';
        this._accessibilityValue = value || '';
        this._accessibilityTraits = traits || 0;
        this._updateAccessibilityAttributes();
    }

    accessibilityActivate() {
        return true;
    }

    accessibilityScreenReaderDidElideContent() {
        return;
    }

    accessibilityScreenReaderDidSpeakContent() {
        return;
    }

    accessibilityScreenReaderDidMoveToNextColumn() {
        return;
    }

    accessibilityScreenReaderDidMoveToPreviousColumn() {
        return;
    }

    accessibilityScreenReaderDidNavigateToColumn() {
        return;
    }

    accessibilityScreenReaderNumberedItemCount() {
        return 0;
    }

    accessibilityScreenReaderItemAtIndex(index) {
        return null;
    }

    accessibilityScreenReaderFocusedItem() {
        return null;
    }

    announceForAccessibility(message) {
        if (typeof document !== 'undefined') {
            const announcement = document.createElement('div');
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.style.position = 'absolute';
            announcement.style.left = '-9999px';
            announcement.style.width = '1px';
            announcement.style.height = '1px';
            announcement.textContent = message;
            document.body.appendChild(announcement);
            setTimeout(() => announcement.remove(), 1000);
        }
    }
}

export default UIResponder;
