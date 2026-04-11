import UIView from './UIView.js';
import { Optional, Result } from './Generics.js';

class UIControl extends UIView {
    constructor() {
        super();
        this.enabled = true;
        this.selected = false;
        this.highlighted = false;
        this.contentVerticalAlignment = 'center';
        this.contentHorizontalAlignment = 'center';
        this.targetActions = [];
    }

    init() {
        this.element = document.createElement('div');
        this.element.className = 'ui-control';
        this.element.style.userSelect = 'none';
        this.element.style.cursor = this.enabled ? 'pointer' : 'default';
        return this;
    }

    deinit() {
        this.targetActions = [];
        this.element = null;
    }

    addTarget(target, action, eventType) {
        this.targetActions.push({ target, action, eventType });
        
        if (this.element) {
            const eventHandler = (e) => {
                if (this.enabled) {
                    const result = target[action]?.(e);
                    if (result instanceof Result) {
                        result.isSuccess ? this.handleSuccess(result) : this.handleFailure(result);
                    }
                }
            };
            this.element.addEventListener(eventType, eventHandler);
        }
        return this;
    }

    removeTarget(target, action, eventType) {
        this.targetActions = this.targetActions.filter(
            ta => !(ta.target === target && ta.action === action && ta.eventType === eventType)
        );
    }

    allTargets() {
        return Optional.of(this.targetActions.map(ta => ta.target));
    }

    actionsForTarget(target, eventType) {
        const actions = this.targetActions
            .filter(ta => ta.target === target && (eventType === null || ta.eventType === eventType))
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
        const matchingTargets = this.targetActions.filter(ta => ta.eventType === eventType);
        const results = [];
        
        for (const ta of matchingTargets) {
            if (this.enabled) {
                try {
                    const result = ta.target[ta.action]?.({ type: eventType, currentTarget: this });
                    results.push(Result.success(result));
                } catch (error) {
                    results.push(Result.failure(error));
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
}

export default UIControl;
