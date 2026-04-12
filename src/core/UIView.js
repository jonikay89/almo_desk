import UIColor from './UIColor.js';
import UIResponder from './UIResponder.js';
import { NSValue, kp, getProperty, updateProperty } from './Foundation.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch, ifLet, guardLet } from './PatternMatching.js';
import { CALayer, CAGradientLayer, CAShapeLayer, CATextLayer, CAEmitterLayer, CATransform3D, CGPath } from './CALayer.js';

class UIView extends UIResponder {
    constructor() {
        super();
        this.superview = null;
        this.window = null;
        this._frame = { x: 0, y: 0, width: 0, height: 0 };
        this._bounds = { x: 0, y: 0, width: 0, height: 0 };
        this._center = { x: 0, y: 0 };
        this._hidden = false;
        this._alpha = 1;
        this._clipsToBounds = false;
        this.tag = 0;
        this.subviews = [];
        this.element = document.createElement('div');
        this.zIndex = 0;
        this.translatesAutoresizingMaskIntoConstraints = true;
        this._backgroundColor = null;
        this._borderColor = null;
        this._borderWidth = 0;
        this._cornerRadius = 0;
        this._layer = CALayer.layer();
        this._layer.delegate = this;
        this._gradientLayer = null;
        this._shapeLayers = [];
        this._textLayers = [];
        this._emitterLayer = null;
        this._shadowLayer = null;
        this._transform3D = CATransform3D.identity();
        this._perspective = false;
        this._perspectiveM34 = -1 / 1000;
        this._customDrawHandler = null;
        this._layerContents = null;
        this._useLayerCanvas = true;
        
        this._isAccessibilityElement = false;
        this._accessibilityLabel = '';
        this._accessibilityHint = '';
        this._accessibilityValue = '';
        this._accessibilityTraits = [];
        this._accessibilityIdentifier = '';
        this._accessibilityElements = [];
        this._accessibilityContainerType = 'none';
        this._accessibilityRole = '';
        this._accessibilityState = {};
        this._accessibilityActions = [];
        this._notifiesAccessibilityWhenMoved = false;
        this._shouldGroupAccessibilityChildren = false;
    }

    get frame() {
        return this._frame;
    }

    set frame(value) {
        this._frame = { x: value.x, y: value.y, width: value.width, height: value.height };
        this._bounds = { x: 0, y: 0, width: value.width, height: value.height };
        this._center = { x: value.x + value.width / 2, y: value.y + value.height / 2 };
        this.layoutSubviews();
    }

    get bounds() {
        return this._bounds;
    }

    set bounds(value) {
        this._bounds = value;
    }

    get center() {
        return this._center;
    }

    set center(value) {
        this._center = value;
    }

    get hidden() {
        return this._hidden;
    }

    set hidden(value) {
        this._hidden = value;
        if (this.element) {
            this.element.style.display = value ? 'none' : '';
        }
    }

    get alpha() {
        return this._alpha;
    }

    set alpha(value) {
        this._alpha = value;
        if (this.element) {
            this.element.style.opacity = value;
        }
    }

    get backgroundColor() {
        return this._backgroundColor;
    }

    set backgroundColor(color) {
        if (color instanceof UIColor) {
            this._backgroundColor = color;
        } else if (typeof color === 'string') {
            this._backgroundColor = UIColor.colorWithHex(color);
        } else {
            this._backgroundColor = null;
        }
        if (this.element) {
            this.element.style.backgroundColor = this._backgroundColor ? this._backgroundColor.css : '';
        }
    }

    get cornerRadius() {
        return this._cornerRadius;
    }

    set cornerRadius(radius) {
        this._cornerRadius = radius;
        if (this.element) {
            this.element.style.borderRadius = `${radius}px`;
        }
    }

    get borderWidth() {
        return this._borderWidth;
    }

    set borderWidth(width) {
        this._borderWidth = width;
        if (this.element) {
            this.element.style.borderWidth = `${width}px`;
            this.element.style.borderStyle = width > 0 ? 'solid' : 'none';
        }
    }

    get borderColor() {
        return this._borderColor;
    }

    set borderColor(color) {
        if (color instanceof UIColor) {
            this._borderColor = color;
        } else if (typeof color === 'string') {
            this._borderColor = UIColor.colorWithHex(color);
        } else {
            this._borderColor = null;
        }
        if (this.element) {
            this.element.style.borderColor = this._borderColor ? this._borderColor.css : '';
        }
    }

    get isAccessibilityElement() {
        return this._isAccessibilityElement;
    }

    set isAccessibilityElement(value) {
        this._isAccessibilityElement = value;
        this._updateAccessibilityAttributes();
    }

    get accessibilityLabel() {
        return this._accessibilityLabel;
    }

    set accessibilityLabel(value) {
        this._accessibilityLabel = value || '';
        this._updateAccessibilityAttributes();
    }

    get accessibilityHint() {
        return this._accessibilityHint;
    }

    set accessibilityHint(value) {
        this._accessibilityHint = value || '';
        this._updateAccessibilityAttributes();
    }

    get accessibilityValue() {
        return this._accessibilityValue;
    }

    set accessibilityValue(value) {
        this._accessibilityValue = value || '';
        this._updateAccessibilityAttributes();
    }

    get accessibilityTraits() {
        return this._accessibilityTraits;
    }

    set accessibilityTraits(value) {
        this._accessibilityTraits = Array.isArray(value) ? value : [value];
        this._updateAccessibilityAttributes();
    }

    get accessibilityIdentifier() {
        return this._accessibilityIdentifier;
    }

    set accessibilityIdentifier(value) {
        this._accessibilityIdentifier = value || '';
        this._updateAccessibilityAttributes();
    }

    get accessibilityRole() {
        return this._accessibilityRole;
    }

    set accessibilityRole(value) {
        this._accessibilityRole = value || '';
        this._updateAccessibilityAttributes();
    }

    get accessibilityState() {
        return this._accessibilityState;
    }

    set accessibilityState(value) {
        this._accessibilityState = value || {};
        this._updateAccessibilityAttributes();
    }

    get accessibilityElements() {
        return this._accessibilityElements;
    }

    set accessibilityElements(value) {
        this._accessibilityElements = value || [];
    }

    get accessibilityContainerType() {
        return this._accessibilityContainerType;
    }

    set accessibilityContainerType(value) {
        this._accessibilityContainerType = value;
    }

    get shouldGroupAccessibilityChildren() {
        return this._shouldGroupAccessibilityChildren;
    }

    set shouldGroupAccessibilityChildren(value) {
        this._shouldGroupAccessibilityChildren = value;
    }

    get notifiesAccessibilityWhenMoved() {
        return this._notifiesAccessibilityWhenMoved;
    }

    set notifiesAccessibilityWhenMoved(value) {
        this._notifiesAccessibilityWhenMoved = value;
    }

    _updateAccessibilityAttributes() {
        if (!this.element) return;
        
        const role = this._mapAccessibilityRole();
        if (role) {
            this.element.setAttribute('role', role);
        }
        
        if (this._accessibilityLabel) {
            this.element.setAttribute('aria-label', this._accessibilityLabel);
        }
        
        if (this._accessibilityHint) {
            this.element.setAttribute('aria-describedby', this._accessibilityHint);
        }
        
        if (this._accessibilityValue) {
            this.element.setAttribute('aria-valuetext', this._accessibilityValue);
        }
        
        if (this._accessibilityIdentifier) {
            this.element.setAttribute('data-accessibility-id', this._accessibilityIdentifier);
        }
        
        const expanded = this._accessibilityState?.expanded;
        if (expanded !== undefined) {
            this.element.setAttribute('aria-expanded', String(expanded));
        }
        
        const checked = this._accessibilityState?.checked;
        if (checked !== undefined) {
            this.element.setAttribute('aria-checked', String(checked));
        }
        
        const disabled = this._accessibilityState?.disabled;
        if (disabled !== undefined) {
            this.element.setAttribute('aria-disabled', String(disabled));
        }
        
        const selected = this._accessibilityState?.selected;
        if (selected !== undefined) {
            this.element.setAttribute('aria-selected', String(selected));
        }
        
        const pressed = this._accessibilityState?.pressed;
        if (pressed !== undefined) {
            this.element.setAttribute('aria-pressed', String(pressed));
        }
        
        this.element.setAttribute('tabindex', this._isAccessibilityElement ? '0' : '-1');
    }

    _mapAccessibilityRole() {
        if (this._accessibilityRole) {
            return this._accessibilityRole;
        }
        
        const traits = this._accessibilityTraits;
        if (traits.includes('button')) return 'button';
        if (traits.includes('link')) return 'link';
        if (traits.includes('header')) return 'heading';
        if (traits.includes('searchField')) return 'searchbox';
        if (traits.includes('keyboardKey')) return 'key';
        if (traits.includes('textField')) return 'textbox';
        if (traits.includes('image')) return 'img';
        if (traits.includes('imageButton')) return 'button';
        if (traits.includes('selected')) return 'option';
        if (traits.includes('plays')) return 'button';
        if (traits.includes('startsMediaSession')) return 'button';
        if (traits.includes('adjustable')) return 'slider';
        if (traits.includes('tabBarItem')) return 'tab';
        if (traits.includes('listItem')) return 'listitem';
        if (traits.includes('list')) return 'list';
        if (traits.includes('menuItem')) return 'menuitem';
        if (traits.includes('menu')) return 'menu';
        if (traits.includes('tooltip')) return 'tooltip';
        if (traits.includes('staticText')) return 'note';
        
        return '';
    }

    accessibilityElementAtIndex(index) {
        return this._accessibilityElements[index] || null;
    }

    indexOfAccessibilityElement(element) {
        return this._accessibilityElements.indexOf(element);
    }

    countOfAccessibilityElements() {
        return this._accessibilityElements.length;
    }

    setAccessibilityFocused(animated = false) {
        if (this.element) {
            this.element.focus();
        }
        return this;
    }

    accessibilityActivationPoint() {
        return this._center;
    }

    accessibilityFrame() {
        return this._frame;
    }

    accessibilityPath() {
        return null;
    }

    accessibilityContainer() {
        return this.superview;
    }

    isAccessibilityContainer() {
        return this._accessibilityElements.length > 0 || this._accessibilityContainerType !== 'none';
    }

    addAccessibilityAction(name, handler) {
        this._accessibilityActions.push({ name, handler });
        return this;
    }

    removeAccessibilityAction(name) {
        this._accessibilityActions = this._accessibilityActions.filter(a => a.name !== name);
        return this;
    }

    accessibilityPerformAction(action) {
        const actionHandler = this._accessibilityActions.find(a => a.name === action);
        if (actionHandler) {
            actionHandler.handler();
            return true;
        }
        return false;
    }

    postAccessibilityNotification(notification, userInfo = {}) {
        if (this.element) {
            const event = new CustomEvent(`accessibility:${notification}`, { detail: userInfo });
            this.element.dispatchEvent(event);
        }
        return this;
    }

    setAccessibilityValueByAdding(prefix, suffix) {
        if (prefix) {
            this._accessibilityValue = prefix + this._accessibilityValue;
        }
        if (suffix) {
            this._accessibilityValue = this._accessibilityValue + suffix;
        }
        this._updateAccessibilityAttributes();
        return this;
    }

    setIsAccessibilityElement(enabled) {
        this._isAccessibilityElement = enabled;
        this._updateAccessibilityAttributes();
        return this;
    }

    setAccessibilityLabel(label) {
        this._accessibilityLabel = label;
        this._updateAccessibilityAttributes();
        return this;
    }

    setAccessibilityHint(hint) {
        this._accessibilityHint = hint;
        this._updateAccessibilityAttributes();
        return this;
    }

    setAccessibilityValue(value) {
        this._accessibilityValue = value;
        this._updateAccessibilityAttributes();
        return this;
    }

    setAccessibilityTraits(traits) {
        this._accessibilityTraits = Array.isArray(traits) ? traits : [traits];
        this._updateAccessibilityAttributes();
        return this;
    }

    setAccessibilityIdentifier(identifier) {
        this._accessibilityIdentifier = identifier;
        this._updateAccessibilityAttributes();
        return this;
    }

    setAccessibilityRole(role) {
        this._accessibilityRole = role;
        this._updateAccessibilityAttributes();
        return this;
    }

    setAccessibilityState(state) {
        this._accessibilityState = state;
        this._updateAccessibilityAttributes();
        return this;
    }

    withIsAccessibilityElement(enabled) {
        return this.setIsAccessibilityElement(enabled);
    }

    withAccessibilityLabel(label) {
        return this.setAccessibilityLabel(label);
    }

    withAccessibilityHint(hint) {
        return this.setAccessibilityHint(hint);
    }

    withAccessibilityValue(value) {
        return this.setAccessibilityValue(value);
    }

    withAccessibilityTraits(...traits) {
        return this.setAccessibilityTraits(traits);
    }

    withAccessibilityIdentifier(identifier) {
        return this.setAccessibilityIdentifier(identifier);
    }

    withAccessibilityRole(role) {
        return this.setAccessibilityRole(role);
    }

    withAccessibilityState(state) {
        return this.setAccessibilityState(state);
    }

    withAccessibilityEnabled(enabled) {
        this._accessibilityState = this._accessibilityState || {};
        this._accessibilityState.disabled = !enabled;
        this._updateAccessibilityAttributes();
        return this;
    }

    withAccessibilityBusy(busy) {
        this._accessibilityState = this._accessibilityState || {};
        this._accessibilityState.busy = busy;
        this._updateAccessibilityAttributes();
        return this;
    }

    withAccessibilityExpanded(expanded) {
        this._accessibilityState = this._accessibilityState || {};
        this._accessibilityState.expanded = expanded;
        this._updateAccessibilityAttributes();
        return this;
    }

    withAccessibilitySelected(selected) {
        this._accessibilityState = this._accessibilityState || {};
        this._accessibilityState.selected = selected;
        this._updateAccessibilityAttributes();
        return this;
    }

    withAccessibilityChecked(checked) {
        this._accessibilityState = this._accessibilityState || {};
        this._accessibilityState.checked = checked;
        this._updateAccessibilityAttributes();
        return this;
    }

    get layer() {
        return this._layer;
    }

    get clipsToBounds() {
        return this._clipsToBounds;
    }

    set clipsToBounds(clips) {
        this._clipsToBounds = clips;
        if (this.element) {
            this.element.style.overflow = clips ? 'hidden' : '';
        }
        this._layer.masksToBounds = clips;
    }

    get transform3D() {
        return this._transform3D;
    }

    set transform3D(value) {
        this._transform3D = value;
        this.#updateTransform();
    }

    get perspective() {
        return this._perspective;
    }

    set perspective(value) {
        this._perspective = value;
        this.#updateTransform();
    }

    get anchorPoint() {
        return this._layer.anchorPoint;
    }

    set anchorPoint(value) {
        this._layer.anchorPoint = value;
    }

    get zPosition() {
        return this._layer.zPosition;
    }

    set zPosition(value) {
        this._layer.zPosition = value;
    }

    #updateTransform() {
        if (!this.element) return;
        
        let transform = this._transform3D;
        if (this._perspective) {
            transform = transform.multiply(CATransform3D.MakePerspective(this._perspectiveM34));
        }
        
        this.element.style.transform = transform.toCSSTransform();
        const originX = this._layer.anchorPoint.x * this._bounds.width;
        const originY = this._layer.anchorPoint.y * this._bounds.height;
        this.element.style.transformOrigin = `${originX}px ${originY}px`;
    }

    get description() {
        return `UIView(frame: {x: ${this._frame.x}, y: ${this._frame.y}, width: ${this._frame.width}, height: ${this._frame.height}})`;
    }

    frameValue() {
        return NSValue.valueWithRect(this._frame);
    }

    boundsValue() {
        return NSValue.valueWithRect(this._bounds);
    }

    centerValue() {
        return NSValue.valueWithPoint(this._center);
    }

    sizeValue() {
        return NSValue.valueWithSize({ width: this._frame.width, height: this._frame.height });
    }

    pointValue() {
        return NSValue.valueWithPoint({ x: this._frame.x, y: this._frame.y });
    }

    init() {
        return this;
    }

    deinit() {
        for (const subview of this.subviews) {
            subview.deinit();
        }
        this.subviews = [];
        this.superview = null;
        this.window = null;
        this.element = null;
    }

    didMoveToSuperview() {}

    willMoveToWindow(window) {}

    didMoveToWindow() {}

    layoutSubviews() {
        if (this.element) {
            this.element.style.left = `${this.frame.x}px`;
            this.element.style.top = `${this.frame.y}px`;
            this.element.style.width = `${this.frame.width}px`;
            this.element.style.height = `${this.frame.height}px`;
        }
        if (this._layer && (this._gradientLayer || this._shapeLayers.length > 0 || this._textLayers.length > 0)) {
            this.#renderLayers();
        }
    }

    setFrame(x, y, width, height) {
        this.frame = { x, y, width, height };
        return this;
    }

    setBackgroundColor(color) {
        this.backgroundColor = color;
        return this;
    }

    setAlpha(alpha) {
        this.alpha = alpha;
        return this;
    }

    setHidden(hidden) {
        this.hidden = hidden;
        return this;
    }

    setCornerRadius(radius) {
        this.cornerRadius = radius;
        return this;
    }

    setBorderColor(color) {
        this.borderColor = color;
        return this;
    }

    setBorderWidth(width) {
        this.borderWidth = width;
        return this;
    }

    setClipsToBounds(clips) {
        this.clipsToBounds = clips;
        return this;
    }

    setTag(tag) {
        this.tag = tag;
        return this;
    }

    setZIndex(zIndex) {
        this.zIndex = zIndex;
        if (this.element) {
            this.element.style.zIndex = zIndex;
        }
        return this;
    }

    withFrame(x, y, width, height) {
        return this.setFrame(x, y, width, height);
    }

    withBackgroundColor(color) {
        return this.setBackgroundColor(color);
    }

    withAlpha(alpha) {
        return this.setAlpha(alpha);
    }

    withHidden(hidden) {
        return this.setHidden(hidden);
    }

    withCornerRadius(radius) {
        return this.setCornerRadius(radius);
    }

    withBorderColor(color) {
        return this.setBorderColor(color);
    }

    withBorderWidth(width) {
        return this.setBorderWidth(width);
    }

    withClipsToBounds(clips) {
        return this.setClipsToBounds(clips);
    }

    withShadow(color, opacity = 0.5, offset = { width: 0, height: 2 }, radius = 4) {
        this.setShadow(color, opacity, offset, radius);
        return this;
    }

    withTag(tag) {
        return this.setTag(tag);
    }

    withZIndex(zIndex) {
        return this.setZIndex(zIndex);
    }

    withTransform3D(transform) {
        this.transform3D = transform;
        return this;
    }

    withPerspective(enabled, m34 = -1 / 1000) {
        this._perspectiveM34 = m34;
        this.perspective = enabled;
        return this;
    }

    withAnchorPoint(x, y) {
        this.anchorPoint = { x, y };
        return this;
    }

    withZPosition(value) {
        this.zPosition = value;
        return this;
    }

    addSublayer(sublayer) {
        this._layer.addSublayer(sublayer);
        this.#renderLayers();
        return this;
    }

    insertSublayerAtIndex(sublayer, index) {
        this._layer.insertSublayer(sublayer, index);
        this.#renderLayers();
        return this;
    }

    removeSublayer(sublayer) {
        this._layer.removeSublayer(sublayer);
        this.#renderLayers();
        return this;
    }

    removeAllSublayers() {
        this._layer._sublayers = [];
        this.#renderLayers();
        return this;
    }

    addGradientLayer(colors, locations = null, startPoint = null, endPoint = null) {
        const gradient = CAGradientLayer.layer();
        gradient.colors = colors;
        gradient.frame = { x: 0, y: 0, width: this._bounds.width, height: this._bounds.height };
        if (locations) gradient.locations = locations;
        if (startPoint) gradient.startPoint = startPoint;
        if (endPoint) gradient.endPoint = endPoint;
        gradient.name = 'gradientLayer';
        this._gradientLayer = gradient;
        this._layer.addSublayer(gradient);
        this.#renderLayers();
        return gradient;
    }

    addShapeLayer(path, fillColor = null, strokeColor = null, lineWidth = 1) {
        const shape = CAShapeLayer.layer();
        shape.path = path;
        shape.fillColor = fillColor;
        shape.strokeColor = strokeColor;
        shape.lineWidth = lineWidth;
        shape.frame = { x: 0, y: 0, width: this._bounds.width, height: this._bounds.height };
        shape.name = 'shapeLayer';
        this._shapeLayers.push(shape);
        this._layer.addSublayer(shape);
        this.#renderLayers();
        return shape;
    }

    addTextLayer(text, fontSize = 14, textColor = null, alignment = 'left') {
        const textLayer = CATextLayer.layer();
        textLayer.string = text;
        textLayer.fontSize = fontSize;
        textLayer.textColor = textColor || UIColor.black();
        textLayer.textAlignment = alignment;
        textLayer.frame = { x: 0, y: 0, width: this._bounds.width, height: this._bounds.height };
        textLayer.name = 'textLayer';
        this._textLayers.push(textLayer);
        this._layer.addSublayer(textLayer);
        this.#renderLayers();
        return textLayer;
    }

    addEmitterLayer(options = {}) {
        const emitter = CAEmitterLayer.layer();
        emitter.emitterPosition = options.position || { x: this._bounds.width / 2, y: this._bounds.height / 2 };
        emitter.emitterSize = options.size || { width: this._bounds.width, height: this._bounds.height };
        emitter.birthRate = options.birthRate || 10;
        emitter.lifetime = options.lifetime || 2;
        emitter.velocity = options.velocity || 50;
        emitter.emissionRange = options.emissionRange || Math.PI * 2;
        emitter.scale = options.scale || 1;
        emitter.color = options.color || UIColor.white();
        emitter.frame = { x: 0, y: 0, width: this._bounds.width, height: this._bounds.height };
        emitter.name = 'emitterLayer';
        this._emitterLayer = emitter;
        this._layer.addSublayer(emitter);
        this.#renderLayers();
        return emitter;
    }

    startEmitterAnimation() {
        if (this._emitterLayer) {
            this._emitterLayer.startEmitting();
        }
        return this;
    }

    stopEmitterAnimation() {
        if (this._emitterLayer) {
            this._emitterLayer.stopEmitting();
        }
        return this;
    }

    setShadow(color, opacity = 0.5, offset = { width: 0, height: 2 }, radius = 4) {
        this._layer.shadowColor = color;
        this._layer.shadowOpacity = opacity;
        this._layer.shadowOffset = offset;
        this._layer.shadowRadius = radius;
        if (this.element) {
            this.element.style.boxShadow = `${offset.width}px ${offset.height}px ${radius}px rgba(${this._getShadowColorComponents(color)}, ${opacity})`;
        }
        return this;
    }

    _getShadowColorComponents(color) {
        if (color instanceof UIColor) {
            const hex = color.hex.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            return `${r}, ${g}, ${b}`;
        }
        return '0, 0, 0';
    }

    #renderLayers() {
        if (!this.element || !this._useLayerCanvas) return;
        
        const existingCanvas = this.element.querySelector('.layer-canvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }

        const hasSublayers = this._layer._sublayers && this._layer._sublayers.length > 0;
        const hasGradient = this._gradientLayer;
        const hasCustomDraw = this._customDrawHandler;
        const hasContents = this._layerContents;

        if (!hasSublayers && !hasGradient && !hasCustomDraw && !hasContents) return;

        const canvas = document.createElement('canvas');
        canvas.className = 'layer-canvas';
        canvas.style.position = 'absolute';
        canvas.style.left = '0';
        canvas.style.top = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.width = this._bounds.width * 2;
        canvas.height = this._bounds.height * 2;
        
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);

        if (this._layer.backgroundColor) {
            ctx.fillStyle = this._layer.backgroundColor.css;
            if (this._layer.cornerRadius > 0) {
                this.#roundRect(ctx, 0, 0, this._bounds.width, this._bounds.height, this._layer.cornerRadius);
                ctx.fill();
            } else {
                ctx.fillRect(0, 0, this._bounds.width, this._bounds.height);
            }
        }

        if (hasGradient && this._gradientLayer) {
            const gradient = ctx.createLinearGradient(
                this._gradientLayer.startPoint.x * this._bounds.width,
                this._gradientLayer.startPoint.y * this._bounds.height,
                this._gradientLayer.endPoint.x * this._bounds.width,
                this._gradientLayer.endPoint.y * this._bounds.height
            );
            this._gradientLayer.colors.forEach((color, index) => {
                const location = this._gradientLayer.locations[index] || (index / (this._gradientLayer.colors.length - 1 || 1));
                gradient.addColorStop(location, color.css);
            });
            if (this._gradientLayer.cornerRadius > 0) {
                this.#roundRect(ctx, 0, 0, this._bounds.width, this._bounds.height, this._gradientLayer.cornerRadius);
                ctx.fillStyle = gradient;
                ctx.fill();
            } else {
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, this._bounds.width, this._bounds.height);
            }
        }

        if (hasContents && this._layerContents) {
            if (typeof this._layerContents === 'function') {
                ctx.save();
                ctx.translate(0, this._bounds.height);
                ctx.scale(1, -1);
                this._layerContents(ctx, this._bounds);
                ctx.restore();
            } else if (typeof this._layerContents === 'string' && this._layerContents.startsWith('data:image')) {
                const img = new Image();
                img.src = this._layerContents;
                ctx.drawImage(img, 0, 0, this._bounds.width, this._bounds.height);
            }
        }

        if (hasCustomDraw && this._customDrawHandler) {
            ctx.save();
            this._customDrawHandler(ctx, this._bounds);
            ctx.restore();
        }

        for (const sublayer of this._layer._sublayers) {
            sublayer.renderToContext(ctx);
        }

        this.element.style.position = 'relative';
        if (this.element.firstChild !== canvas) {
            this.element.insertBefore(canvas, this.element.firstChild);
        }
    }

    #roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    setGradient(colors, locations = null, startPoint = { x: 0.5, y: 0 }, endPoint = { x: 0.5, y: 1 }) {
        if (!this._gradientLayer) {
            this.addGradientLayer(colors, locations, startPoint, endPoint);
        } else {
            this._gradientLayer.colors = colors;
            if (locations) this._gradientLayer.locations = locations;
            this._gradientLayer.startPoint = startPoint;
            this._gradientLayer.endPoint = endPoint;
            this.#renderLayers();
        }
        return this;
    }

    setShapePath(path) {
        if (this._shapeLayers.length > 0) {
            this._shapeLayers[0].path = path;
            this.#renderLayers();
        }
        return this;
    }

    setContents(contents) {
        this._layerContents = contents;
        this.#renderLayers();
        return this;
    }

    setMaskingMask(mask) {
        if (mask && this._layer) {
            this._layer.mask = mask;
        }
        return this;
    }

    drawUsingHandler(handler) {
        this._customDrawHandler = handler;
        this.#renderLayers();
        return this;
    }

    clearDraw() {
        this._customDrawHandler = null;
        this._layerContents = null;
        this.#renderLayers();
        return this;
    }

    setNeedsDisplay() {
        this.#renderLayers();
        return this;
    }

    setNeedsLayout() {
        this.layoutSubviews();
        return this;
    }

    addShape(path, fillColor = null, strokeColor = null, lineWidth = 1) {
        const shapeLayer = CAShapeLayer.layer();
        shapeLayer.path = path;
        shapeLayer.fillColor = fillColor;
        shapeLayer.strokeColor = strokeColor;
        shapeLayer.lineWidth = lineWidth;
        shapeLayer.frame = { x: 0, y: 0, width: this._bounds.width, height: this._bounds.height };
        this._layer.addSublayer(shapeLayer);
        this._shapeLayers.push(shapeLayer);
        this.#renderLayers();
        return shapeLayer;
    }

    addCircle(radius, centerX, centerY, fillColor = null, strokeColor = null) {
        const path = CGPath.CreateCircle(centerX, centerY, radius);
        return this.addShape(path, fillColor, strokeColor);
    }

    addRectangle(x, y, width, height, fillColor = null, strokeColor = null, cornerRadius = 0) {
        let path;
        if (cornerRadius > 0) {
            path = CGPath.CreateRoundedRect(x, y, width, height, cornerRadius);
        } else {
            path = CGPath.CreateRect(x, y, width, height);
        }
        return this.addShape(path, fillColor, strokeColor);
    }

    addStar(centerX, centerY, outerRadius, innerRadius, points = 5, fillColor = null, strokeColor = null) {
        const path = CGPath.CreateStar(centerX, centerY, outerRadius, innerRadius, points);
        return this.addShape(path, fillColor, strokeColor);
    }

    addPolygon(points, fillColor = null, strokeColor = null) {
        const path = CGPath.CreatePolygon(points);
        return this.addShape(path, fillColor, strokeColor);
    }

    withLayerContents(contents) {
        return this.setContents(contents);
    }

    withMaskingMask(mask) {
        return this.setMaskingMask(mask);
    }

    withNeedsDisplay() {
        return this.setNeedsDisplay();
    }

    withNeedsLayout() {
        return this.setNeedsLayout();
    }

    rotate3D(angle, axis = 'z') {
        this._transform3D = this._transform3D.rotated(angle, axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0);
        this.#updateTransform();
        return this;
    }

    scale3D(sx, sy, sz = 1) {
        this._transform3D = this._transform3D.scaled(sx, sy, sz);
        this.#updateTransform();
        return this;
    }

    translate3D(tx, ty, tz = 0) {
        this._transform3D = this._transform3D.translated(tx, ty, tz);
        this.#updateTransform();
        return this;
    }

    applyPerspective(m34 = -1 / 1000) {
        this._perspectiveM34 = m34;
        this._perspective = true;
        this.#updateTransform();
        return this;
    }

    resetTransform3D() {
        this._transform3D = CATransform3D.identity();
        this._perspective = false;
        if (this.element) {
            this.element.style.transform = '';
        }
        return this;
    }

    withRotation3D(angle, axis = 'z') {
        return this.rotate3D(angle, axis);
    }

    withScale3D(sx, sy, sz = 1) {
        return this.scale3D(sx, sy, sz);
    }

    withTranslation3D(tx, ty, tz = 0) {
        return this.translate3D(tx, ty, tz);
    }

    animate(animations, duration = 0.3, callback = null) {
        const keys = Object.keys(animations);
        const initialValues = {};
        
        keys.forEach(key => {
            initialValues[key] = this[key];
        });

        const startTime = performance.now();
        const animateFrame = (currentTime) => {
            const elapsed = (currentTime - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = this.#easeInOut(progress);

            keys.forEach(key => {
                const start = initialValues[key];
                const end = animations[key];
                if (typeof start === 'number' && typeof end === 'number') {
                    this[key] = start + (end - start) * easedProgress;
                }
            });

            if (progress < 1) {
                requestAnimationFrame(animateFrame);
            } else if (callback) {
                callback();
            }
        };

        requestAnimationFrame(animateFrame);
        return this;
    }

    #easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    addPulseAnimation(duration = 0.6, scale = 1.1) {
        if (!this.element) return this;
        
        this.removeAnimations();
        
        const animName = `pulse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.element.style.transformOrigin = 'center center';
        this.element.style.animation = `${animName} ${duration}s ease-in-out infinite alternate`;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ${animName} {
                from { transform: scale(1); }
                to { transform: scale(${scale}); }
            }
        `;
        document.head.appendChild(style);
        
        this._animationStyles = this._animationStyles || [];
        this._animationStyles.push(style);
        
        return this;
    }

    removeAnimations() {
        if (this._animationStyles) {
            this._animationStyles.forEach(style => style.remove());
            this._animationStyles = [];
        }
        if (this.element) {
            this.element.style.animation = '';
        }
        return this;
    }

    addFadeAnimation(duration = 0.3, from = 0, to = 1) {
        if (!this.element) return this;
        
        this.element.style.transition = `opacity ${duration}s ease-in-out`;
        this.element.style.opacity = to;
        
        return this;
    }

    addRotationAnimation(duration = 1, fromAngle = 0, toAngle = Math.PI * 2, repeatCount = Infinity) {
        if (!this.element) return this;
        
        this.removeAnimations();
        
        const startAngle = (fromAngle * 180) / Math.PI;
        const endAngle = (toAngle * 180) / Math.PI;
        let currentAngle = startAngle;
        let count = 0;
        let lastTime = null;
        let animating = true;
        
        this.element.style.transformOrigin = 'center center';
        
        const animate = (timestamp) => {
            if (!animating || !this.element) return;
            
            if (lastTime === null) lastTime = timestamp;
            const delta = (timestamp - lastTime) / 1000;
            lastTime = timestamp;
            
            const steps = delta / (duration / (Math.PI * 2));
            currentAngle += ((endAngle - startAngle) * steps);
            
            if (currentAngle >= endAngle) {
                if (repeatCount !== Infinity && count >= repeatCount - 1) {
                    this.element.style.transform = `rotate(${endAngle}deg)`;
                    return;
                }
                currentAngle = startAngle;
                count++;
            }
            
            this.element.style.transform = `rotate(${currentAngle}deg)`;
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
        
        this._rotationAnimation = { stop: () => { animating = false; } };
        
        return this;
    }

    addSubview(view) {
        view.removeFromSuperview();
        view.superview = this;
        this.subviews.push(view);
        if (this.element && view.element) {
            this.element.appendChild(view.element);
        }
        view.didMoveToSuperview();
    }

    removeFromSuperview() {
        if (this.superview) {
            this.superview.subviews = this.superview.subviews.filter(v => v !== this);
            if (this.element && this.superview.element) {
                this.superview.element.removeChild(this.element);
            }
            this.superview = null;
        }
    }

    encode() {
        return {
            frame: this._frame,
            bounds: this._bounds,
            center: this._center,
            alpha: this._alpha,
            hidden: this._hidden,
            tag: this.tag,
            zIndex: this.zIndex,
            backgroundColor: this._backgroundColor ? this._backgroundColor.hex : null
        };
    }

    static decode(data) {
        const view = new UIView();
        if (data.frame) view.frame = data.frame;
        if (data.alpha !== undefined) view.alpha = data.alpha;
        if (data.hidden !== undefined) view.hidden = data.hidden;
        if (data.tag !== undefined) view.tag = data.tag;
        if (data.zIndex !== undefined) view.zIndex = data.zIndex;
        if (data.backgroundColor) view.backgroundColor = UIColor.colorWithHex(data.backgroundColor);
        return view;
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

    matchView(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        return Switch(predicate)
            .case({ hidden: true }, () => this._hidden === true)
            .case({ hidden: false }, () => this._hidden === false)
            .case({ tagged: Switch.let('t') }, (m) => this.tag === m.t)
            .case({ hasSuperview: true }, () => this.superview !== null)
            .case({ hasSuperview: false }, () => this.superview === null)
            .case({ alpha: Switch.let('a') }, (m) => Math.abs(this._alpha - m.a) < 0.001)
            .default(() => false)
            .evaluate();
    }

    switch() {
        return Switch(this);
    }

    patternMatch(predicate) {
        return this.matchView(predicate);
    }
}

export default UIView;