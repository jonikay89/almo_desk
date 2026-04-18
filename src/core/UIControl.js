import UIView from './UIView.js';
import { Optional, Result } from './Generics.js';
import { WeakRef } from './WeakReference.js';
import { kp, getProperty, updateProperty } from './Foundation.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch, ifLet, guardLet } from './PatternMatching.js';
import { CALayer, CAShapeLayer, CGPath } from './CALayer.js';
import UIColor from './UIColor.js';
import { getRenderer } from './render/index.js';

class UIControl extends UIView {
    constructor() {
        super();
        this.enabled = true;
        this.selected = false;
        this.highlighted = false;
        this.contentVerticalAlignment = 'center';
        this.contentHorizontalAlignment = 'center';
        this._targetActions = [];
        this._accessibilityTraits = ['button'];
        this._controlLayer = null;
        this._borderLayer = null;
        this._backgroundLayer = null;
    }

    get description() {
        return `UIControl(enabled: ${this.enabled}, selected: ${this.selected}, highlighted: ${this.highlighted})`;
    }

    get enabled() {
        return this._enabled;
    }

    set enabled(value) {
        this._enabled = value;
        this._layer.setCustomState('disabled', !value);
        this._layer.setCustomState('cursor', value ? 'pointer' : 'default');
        getRenderer().scheduleUpdate(this._layer);
        this._accessibilityState = this._accessibilityState || {};
        this._accessibilityState.disabled = !value;
        this._updateAccessibilityAttributes();
    }

    get selected() {
        return this._selected;
    }

    set selected(value) {
        this._selected = value;
        this._layer.setCustomState('selected', value);
        getRenderer().scheduleUpdate(this._layer);
        this._accessibilityState = this._accessibilityState || {};
        this._accessibilityState.selected = value;
        this._updateAccessibilityAttributes();
    }

    get highlighted() {
        return this._highlighted;
    }

    set highlighted(value) {
        this._highlighted = value;
        this._layer.setCustomState('highlighted', value);
        getRenderer().scheduleUpdate(this._layer);
        this._accessibilityState = this._accessibilityState || {};
        this._accessibilityState.pressed = value;
        this._updateAccessibilityAttributes();
    }

    init() {
        super.init();
        this._layer.cssClass = 'ui-control';
        this.#setupControlLayers();
        return this;
    }

    #setupControlLayers() {
        this._controlLayer = CALayer.layer();
        this._controlLayer.name = 'controlLayer';
        this._controlLayer.frame = { x: 0, y: 0, width: 0, height: 0 };
        this._layer.addSublayer(this._controlLayer);
    }

    deinit() {
        this._targetActions = [];
        this._controlLayer = null;
        this._borderLayer = null;
        this._backgroundLayer = null;
        super.deinit();
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        return this;
    }

    setSelected(selected) {
        this.selected = selected;
        return this;
    }

    setHighlighted(highlighted) {
        this.highlighted = highlighted;
        return this;
    }

    setAccessibilityTraits(traits) {
        this._accessibilityTraits = Array.isArray(traits) ? traits : [traits];
        this._updateAccessibilityAttributes();
        return this;
    }

    addTrait(trait) {
        if (!this._accessibilityTraits.includes(trait)) {
            this._accessibilityTraits.push(trait);
            this._updateAccessibilityAttributes();
        }
        return this;
    }

    removeTrait(trait) {
        this._accessibilityTraits = this._accessibilityTraits.filter(t => t !== trait);
        this._updateAccessibilityAttributes();
        return this;
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
        return this;
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

    setContentVerticalAlignment(alignment) {
        this.contentVerticalAlignment = alignment;
        return this;
    }

    setContentHorizontalAlignment(alignment) {
        this.contentHorizontalAlignment = alignment;
        return this;
    }

    withEnabled(enabled) {
        return this.setEnabled(enabled);
    }

    withSelected(selected) {
        return this.setSelected(selected);
    }

    withHighlighted(highlighted) {
        return this.setHighlighted(highlighted);
    }

    withContentVerticalAlignment(alignment) {
        return this.setContentVerticalAlignment(alignment);
    }

    withContentHorizontalAlignment(alignment) {
        return this.setContentHorizontalAlignment(alignment);
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
        if (this._controlLayer) {
            this._controlLayer.frame = this._bounds;
        }
        if (this._borderLayer) {
            this._borderLayer.frame = this._bounds;
        }
        if (this._backgroundLayer) {
            this._backgroundLayer.frame = this._bounds;
        }
    }

    withBorder(color, width, radius) {
        if (this._layer) {
            if (!this._borderLayer) {
                this._borderLayer = CAShapeLayer.layer();
                this._borderLayer.name = 'borderLayer';
                this._layer.addSublayer(this._borderLayer);
            }
            this._borderLayer.path = CGPath.CreateRect(0, 0, this._bounds.width, this._bounds.height);
            this._borderLayer.fillColor = null;
            this._borderLayer.strokeColor = color;
            this._borderLayer.lineWidth = width;
            if (radius !== undefined) {
                this._borderLayer.cornerRadius = radius;
            }
            this.#renderControlLayers();
        }
        return this;
    }

    withCornerRadius(radius) {
        this.cornerRadius = radius;
        if (this._borderLayer) {
            this._borderLayer.cornerRadius = radius;
        }
        return this;
    }

    withShadow(color, opacity = 0.5, offset = { width: 0, height: 2 }, radius = 4) {
        if (this._controlLayer) {
            this._controlLayer.shadowColor = color;
            this._controlLayer.shadowOpacity = opacity;
            this._controlLayer.shadowOffset = offset;
            this._controlLayer.shadowRadius = radius;
        }
        return this;
    }

    withBackgroundLayer(color) {
        if (this._layer) {
            if (!this._backgroundLayer) {
                this._backgroundLayer = CALayer.layer();
                this._backgroundLayer.name = 'backgroundLayer';
                this._layer.insertSublayerAtIndex(this._backgroundLayer, 0);
            }
            this._backgroundLayer.frame = this._bounds;
            this._backgroundLayer.backgroundColor = color;
            this.#renderControlLayers();
        }
        return this;
    }

    #renderControlLayers() {
        if (this._backgroundLayer) {
            getRenderer().scheduleUpdate(this._backgroundLayer);
        }
        if (this._borderLayer) {
            getRenderer().scheduleUpdate(this._borderLayer);
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

    ifCase(pattern, handler) {
        return ifCase(pattern)(this).then(handler);
    }

    guardCase(pattern) {
        return guardCase(pattern)(this);
    }

    static forCase(collection, pattern, handler) {
        for (const item of collection) {
            const result = forCase(pattern)(item);
            if (result !== undefined) {
                handler(result);
            }
        }
    }

    static whileCase(iterator, pattern) {
        return whileCase(pattern)(iterator);
    }

    matchOperator(pattern) {
        return patternMatch(pattern, this);
    }

    ifLet(pattern) {
        return ifLet(this, pattern);
    }

    guardLet(pattern) {
        return guardLet(this, pattern);
    }

    matchControl(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        return Switch(predicate)
            .case({ enabled: true }, () => this.enabled === true)
            .case({ enabled: false }, () => this.enabled === false)
            .case({ selected: true }, () => this.selected === true)
            .case({ selected: false }, () => this.selected === false)
            .case({ highlighted: true }, () => this.highlighted === true)
            .case({ highlighted: false }, () => this.highlighted === false)
            .default(() => false)
            .evaluate();
    }

    switch() {
        return Switch(this);
    }

    patternMatch(predicate) {
        return this.matchControl(predicate);
    }
}

export default UIControl;