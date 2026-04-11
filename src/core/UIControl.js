import UIView from './UIView.js';
import { Optional, Result } from './Generics.js';
import { WeakRef } from './WeakReference.js';

class UIControl extends UIView {
    constructor() {
        super();
        this.enabled = true;
        this.selected = false;
        this.highlighted = false;
        this.contentVerticalAlignment = 'center';
        this.contentHorizontalAlignment = 'center';
        this._targetActions = [];
    }

    get description() {
        return `UIControl(enabled: ${this.enabled}, selected: ${this.selected}, highlighted: ${this.highlighted})`;
    }

    init() {
        this.element = document.createElement('div');
        this.element.className = 'ui-control';
        this.element.style.userSelect = 'none';
        this.element.style.cursor = this.enabled ? 'pointer' : 'default';
        return this;
    }

    deinit() {
        this._targetActions = [];
        this.element = null;
    }

    addTarget(target, action, eventType) {
        const weakRef = target instanceof WeakRef ? target : new WeakRef(target);
        this._targetActions.push({ targetRef: weakRef, action, eventType });
        
        if (this.element) {
            const eventHandler = (e) => {
                if (this.enabled) {
                    const target = weakRef.target;
                    if (target) {
                        const result = target[action]?.(e);
                        if (result instanceof Result) {
                            result.isSuccess ? this.handleSuccess(result) : this.handleFailure(result);
                        }
                    }
                }
            };
            this.element.addEventListener(eventType, eventHandler);
        }
        return this;
    }

    removeTarget(target, action, eventType) {
        this._targetActions = this._targetActions.filter(
            ta => {
                const t = ta.targetRef.target;
                return !(t === target && ta.action === action && ta.eventType === eventType);
            }
        );
    }

    allTargets() {
        const targets = this._targetActions
            .map(ta => ta.targetRef.target)
            .filter(t => t !== null && t !== undefined);
        return Optional.of(targets);
    }

    actionsForTarget(target, eventType) {
        const actions = this._targetActions
            .filter(ta => {
                const t = ta.targetRef.target;
                return t === target && (eventType === null || ta.eventType === eventType);
            })
            .map(ta => ta.action);
        return Optional.of(actions.length > 0 ? actions : null);
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (this.element) {
            this.element.style.cursor = enabled ? 'pointer' : 'default';
            this.element.style.opacity = enabled ? '1' : '0.5';
        }
    }

    setSelected(selected) {
        this.selected = selected;
        if (this.element) {
            this.element.classList.toggle('selected', selected);
        }
    }

    setHighlighted(highlighted) {
        this.highlighted = highlighted;
        if (this.element) {
            this.element.classList.toggle('highlighted', highlighted);
        }
    }

    sendAction(action, eventType) {
        const matchingTargets = this._targetActions.filter(ta => ta.eventType === eventType);
        const results = [];
        
        for (const ta of matchingTargets) {
            if (this.enabled) {
                const target = ta.targetRef.target;
                if (target) {
                    try {
                        const result = target[ta.action]?.({ type: eventType, currentTarget: this });
                        results.push(Result.success(result));
                    } catch (error) {
                        results.push(Result.failure(error));
                    }
                }
            }
        }
        
        return results.length > 0 ? results[results.length - 1] : Result.failure(new Error('No action sent'));
    }

    handleSuccess(result) {
        return result;
    }

    handleFailure(result) {
        console.error('Action failed:', result.error);
        return result;
    }

    layoutSubviews() {
        super.layoutSubviews();
        if (this.element) {
            this.element.style.width = `${this.frame.width}px`;
            this.element.style.height = `${this.frame.height}px`;
        }
    }

    encode() {
        return {
            enabled: this.enabled,
            selected: this.selected,
            highlighted: this.highlighted,
            contentVerticalAlignment: this.contentVerticalAlignment,
            contentHorizontalAlignment: this.contentHorizontalAlignment
        };
    }

    static decode(data) {
        const control = new UIControl();
        control.enabled = data.enabled !== false;
        control.selected = data.selected || false;
        control.highlighted = data.highlighted || false;
        control.contentVerticalAlignment = data.contentVerticalAlignment || 'center';
        control.contentHorizontalAlignment = data.contentHorizontalAlignment || 'center';
        return control;
    }
}

export default UIControl;