import { LayerCSSRenderer, PathSVGRenderer, AnimationCSSRenderer } from '../renderers/index.js';

/**
 * Bridges a single CALayer to a DOM element
 * Handles property synchronization and event propagation
 */
class LayerBridge {
    /**
     * @param {CALayer} layer - The layer to bridge
     * @param {HTMLElement} element - The DOM element (optional, will create if not provided)
     * @param {Object} options - Bridge options
     */
    constructor(layer, element = null, options = {}) {
        this.layer = layer;
        this.element = element;
        this.options = {
            autoSync: true,
            syncInterval: 16, // ~60fps
            useCSSAnimations: true,
            useSVGForShapes: true,
            debug: false,
            ...options
        };
        
        this.cssRenderer = new LayerCSSRenderer(this.options);
        this.svgRenderer = new PathSVGRenderer(this.options);
        this.animationRenderer = new AnimationCSSRenderer(this.options);
        
        this._syncScheduled = false;
        this._isDestroyed = false;
        this._propertyObservers = new Map();
        this._childBridges = new Map();
        this._styleElement = null;
        
        // Bind methods
        this.sync = this.sync.bind(this);
        this.scheduleSync = this.scheduleSync.bind(this);
    }

    /**
     * Initialize the bridge - create DOM element if needed
     * @returns {HTMLElement} The bridged element
     */
    init() {
        if (!this.element) {
            this.element = this.createElement();
        }

        // Initial sync
        this.sync();

        // Set up property observation
        if (this.options.autoSync) {
            this.observeProperties();
        }

        // Bridge child layers
        this.bridgeSublayers();

        if (this.options.debug) {
            console.log(`LayerBridge initialized for layer: ${this.layer.name || 'unnamed'}`);
        }

        return this.element;
    }

    /**
     * Create the appropriate DOM element for this layer
     * @returns {HTMLElement}
     */
    createElement() {
        const { CAShapeLayer, CAGradientLayer, CATextLayer, CAEmitterLayer } = 
            this.getLayerClasses();

        // Create SVG for shape layers
        if (this.options.useSVGForShapes && this.layer instanceof CAShapeLayer) {
            return this.svgRenderer.renderShapeLayer(this.layer) || 
                   this.cssRenderer.createElement(this.layer);
        }

        // Create SVG for gradient layers
        if (this.layer instanceof CAGradientLayer) {
            return this.svgRenderer.renderGradientLayer(this.layer) || 
                   this.cssRenderer.createElement(this.layer);
        }

        // Default: div element with CSS
        return this.cssRenderer.createElement(this.layer);
    }

    /**
     * Sync layer properties to DOM element
     */
    sync() {
        if (this._isDestroyed || !this.element) return;

        // Apply CSS styles
        this.cssRenderer.render(this.layer, this.element);

        // Apply animations if any
        if (this.options.useCSSAnimations && this.layer.animationKeys) {
            this.syncAnimations();
        }

        // Sync child bridges
        this._childBridges.forEach((bridge, layer) => {
            bridge.sync();
        });
    }

    /**
     * Schedule a sync on next frame
     */
    scheduleSync() {
        if (this._syncScheduled || this._isDestroyed) return;
        
        this._syncScheduled = true;
        requestAnimationFrame(() => {
            this._syncScheduled = false;
            this.sync();
        });
    }

    /**
     * Sync layer animations to CSS animations
     */
    syncAnimations() {
        const animationKeys = this.layer.animationKeys ? this.layer.animationKeys() : [];
        
        animationKeys.forEach(key => {
            const animation = this.layer.animationForKey(key);
            if (animation && !this._propertyObservers.has(`anim-${key}`)) {
                this.animationRenderer.render(animation, this.element, key);
                this._propertyObservers.set(`anim-${key}`, true);
            }
        });
    }

    /**
     * Set up property observers for auto-sync
     */
    observeProperties() {
        // Define properties to observe
        const properties = [
            'frame', 'bounds', 'position', 'opacity', 'backgroundColor',
            'borderColor', 'borderWidth', 'cornerRadius', 'transform',
            'shadowColor', 'shadowOpacity', 'shadowOffset', 'shadowRadius',
            'zPosition', 'isHidden', 'masksToBounds'
        ];

        properties.forEach(prop => {
            this.observeProperty(prop);
        });
    }

    /**
     * Observe a specific property
     * @param {string} property
     */
    observeProperty(property) {
        // Store original setter
        const originalSetter = Object.getOwnPropertyDescriptor(
            Object.getPrototypeOf(this.layer) || this.layer, 
            property
        )?.set;

        if (!originalSetter) return;

        // Create wrapped setter that schedules sync
        const wrappedSetter = function(value) {
            originalSetter.call(this.layer, value);
            this.scheduleSync();
        }.bind(this);

        // Replace setter
        Object.defineProperty(this.layer, property, {
            set: wrappedSetter,
            get: Object.getOwnPropertyDescriptor(
                Object.getPrototypeOf(this.layer) || this.layer, 
                property
            )?.get,
            configurable: true
        });

        this._propertyObservers.set(property, { originalSetter });
    }

    /**
     * Bridge all sublayers
     */
    bridgeSublayers() {
        if (!this.layer.sublayers) return;

        this.layer.sublayers.forEach(sublayer => {
            this.addSublayerBridge(sublayer);
        });
    }

    /**
     * Add a bridge for a sublayer
     * @param {CALayer} sublayer
     * @returns {LayerBridge}
     */
    addSublayerBridge(sublayer) {
        if (this._childBridges.has(sublayer)) {
            return this._childBridges.get(sublayer);
        }

        const bridge = new LayerBridge(sublayer, null, this.options);
        bridge.init();

        if (this.element) {
            this.element.appendChild(bridge.element);
        }

        this._childBridges.set(sublayer, bridge);
        return bridge;
    }

    /**
     * Remove a sublayer bridge
     * @param {CALayer} sublayer
     */
    removeSublayerBridge(sublayer) {
        const bridge = this._childBridges.get(sublayer);
        if (bridge) {
            bridge.destroy();
            this._childBridges.delete(sublayer);
        }
    }

    /**
     * Update the element to match current layer state
     */
    update() {
        this.sync();
    }

    /**
     * Apply a transform to the element
     * @param {CATransform3D} transform
     */
    applyTransform(transform) {
        if (!this.element || !transform) return;

        if (transform.toCSSTransform) {
            this.element.style.transform = transform.toCSSTransform();
        }
    }

    /**
     * Add an animation via the bridge
     * @param {CAAnimation} animation
     * @param {string} key
     */
    addAnimation(animation, key) {
        this.layer.addAnimation?.(animation, key);
        if (this.options.useCSSAnimations) {
            this.animationRenderer.render(animation, this.element, key);
        }
    }

    /**
     * Remove an animation
     * @param {string} key
     */
    removeAnimation(key) {
        this.layer.removeAnimation?.(key);
        this.animationRenderer.cancel(this.element);
    }

    /**
     * Pause all animations
     */
    pauseAnimations() {
        this.animationRenderer.pause(this.element);
    }

    /**
     * Resume all animations
     */
    resumeAnimations() {
        this.animationRenderer.resume(this.element);
    }

    /**
     * Get the bridged element
     * @returns {HTMLElement}
     */
    getElement() {
        return this.element;
    }

    /**
     * Get all child bridges
     * @returns {Map<CALayer, LayerBridge>}
     */
    getChildBridges() {
        return this._childBridges;
    }

    /**
     * Clean up and destroy the bridge
     */
    destroy() {
        this._isDestroyed = true;

        // Restore original setters
        this._propertyObservers.forEach((observer, property) => {
            if (observer.originalSetter) {
                Object.defineProperty(this.layer, property, {
                    set: observer.originalSetter,
                    configurable: true
                });
            }
        });

        // Destroy child bridges
        this._childBridges.forEach(bridge => bridge.destroy());
        this._childBridges.clear();

        // Clean up animation styles
        this.animationRenderer.cleanup();

        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }

        this.element = null;
        this.layer = null;
    }

    /**
     * Lazy load layer classes
     */
    async getLayerClasses() {
        const module = await import('../CALayer.js');
        return {
            CAShapeLayer: module.CAShapeLayer,
            CAGradientLayer: module.CAGradientLayer,
            CATextLayer: module.CATextLayer,
            CAEmitterLayer: module.CAEmitterLayer
        };
    }
}

export default LayerBridge;
