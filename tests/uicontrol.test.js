/**
 * UIControl Test Suite
 * Tests for the UIControl class
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

class UIControl {
    constructor() {
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

    addTarget(target, action, eventType) {
        this.targetActions.push({ target, action, eventType });
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
    }

    setHighlighted(highlighted) {
        this.highlighted = highlighted;
    }
}

describe('UIControl', () => {
    let control;

    beforeEach(() => {
        control = new UIControl();
    });

    it('should initialize with default values', () => {
        assert.strictEqual(control.enabled, true);
        assert.strictEqual(control.selected, false);
        assert.strictEqual(control.highlighted, false);
        assert.strictEqual(control.contentVerticalAlignment, 'center');
        assert.strictEqual(control.contentHorizontalAlignment, 'center');
        assert.deepStrictEqual(control.targetActions, []);
    });

    it('should set enabled state', () => {
        control.element = { style: {} };
        control.setEnabled(false);
        assert.strictEqual(control.enabled, false);
        assert.strictEqual(control.element.style.opacity, '0.5');
    });

    it('should set selected state', () => {
        control.setSelected(true);
        assert.strictEqual(control.selected, true);
    });

    it('should set highlighted state', () => {
        control.setHighlighted(true);
        assert.strictEqual(control.highlighted, true);
    });

    it('should add target action', () => {
        const target = { callback: () => {} };
        control.addTarget(target, 'callback', 'click');
        assert.strictEqual(control.targetActions.length, 1);
        assert.strictEqual(control.targetActions[0].target, target);
        assert.strictEqual(control.targetActions[0].action, 'callback');
        assert.strictEqual(control.targetActions[0].eventType, 'click');
    });

    it('should remove target action', () => {
        const target = { callback: () => {} };
        control.addTarget(target, 'callback', 'click');
        control.removeTarget(target, 'callback', 'click');
        assert.strictEqual(control.targetActions.length, 0);
    });

    it('should have init method', () => {
        assert.strictEqual(typeof control.init, 'function');
    });
});
