import UIView from './UIView.js';

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
                    target[action](e);
                }
            };
            this.element.addEventListener(eventType, eventHandler);
        }
    }

    removeTarget(target, action, eventType) {
        this.targetActions = this.targetActions.filter(
            ta => !(ta.target === target && ta.action === action && ta.eventType === eventType)
        );
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
        for (const ta of matchingTargets) {
            if (this.enabled) {
                ta.target[ta.action]({ type: eventType, currentTarget: this });
            }
        }
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
