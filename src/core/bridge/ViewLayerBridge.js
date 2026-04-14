import LayerBridge from './LayerBridge.js';

/**
 * Bridges a UIView to the DOM using CALayer CSS rendering
 * Manages the layer tree hierarchy and UIView lifecycle integration
 */
class ViewLayerBridge {
    /**
     * @param {UIView} view - The view to bridge
     * @param {Object} options - Bridge options
     */
    constructor(view, options = {}) {
        this.view = view;
        this.options = {
            renderingMode: 'css', // 'css', 'canvas', 'hybrid', 'auto'
            autoSync: true,
            debug: false,
            ...options
        };
        
        this.layerBridge = null;
        this._isDestroyed = false;
        this._syncFrameScheduled = false;
        this._originalRenderMethod = null;
        
        // Bind methods
        this.syncFrame = this.syncFrame.bind(this);
        this.onViewLayout = this.onViewLayout.bind(this);
    }

    /**
     * Initialize the bridge
     * @returns {HTMLElement} The view's element
     */
    init() {
        if (!this.view) {
            throw new Error('ViewLayerBridge: No view provided');
        }

        // Ensure view has an element
        if (!this.view.element) {
            if (this.options.debug) {
                console.log('ViewLayerBridge: View has no element, initialization deferred');
            }
            return null;
        }

        // Get or create the view's layer
        const layer = this.view.layer;
        if (!layer) {
            if (this.options.debug) {
                console.log('ViewLayerBridge: View has no layer');
            }
            return this.view.element;
        }

        // Create layer bridge
        this.layerBridge = new LayerBridge(
            layer, 
            this.view.element, 
            {
                autoSync: this.options.autoSync,
                debug: this.options.debug
            }
        );

        // Initialize layer bridge
        this.layerBridge.init();

        // Set up view lifecycle hooks
        this.hookViewLifecycle();

        // Initial frame sync
        this.syncFrame();

        if (this.options.debug) {
            console.log(`ViewLayerBridge initialized for view: ${this.view.constructor.name}`);
        }

        return this.view.element;
    }

    /**
     * Hook into view lifecycle methods for automatic syncing
     */
    hookViewLifecycle() {
        if (!this.view) return;

        // Hook layoutSubviews
        const originalLayoutSubviews = this.view.layoutSubviews;
        this.view.layoutSubviews = function() {
            originalLayoutSubviews.call(this.view);
            this.onViewLayout();
        }.bind(this);

        // Hook setNeedsDisplay
        const originalSetNeedsDisplay = this.view.setNeedsDisplay;
        this.view.setNeedsDisplay = function() {
            originalSetNeedsDisplay.call(this.view);
            this.scheduleSync();
        }.bind(this);
    }

    /**
     * Called when view lays out subviews
     */
    onViewLayout() {
        this.scheduleFrameSync();
    }

    /**
     * Sync view frame/bounds to layer and DOM
     */
    syncFrame() {
        if (this._isDestroyed || !this.view || !this.view.layer) return;

        // Sync view frame to layer
        const frame = this.view.frame;
        const bounds = this.view.bounds;

        this.view.layer.frame = frame;
        this.view.layer.bounds = bounds;

        // Sync to DOM element
        if (this.view.element) {
            this.view.element.style.left = `${frame.x}px`;
            this.view.element.style.top = `${frame.y}px`;
            this.view.element.style.width = `${frame.width}px`;
            this.view.element.style.height = `${frame.height}px`;
        }

        // Sync layer bridge
        if (this.layerBridge) {
            this.layerBridge.sync();
        }
    }

    /**
     * Schedule frame sync on next animation frame
     */
    scheduleFrameSync() {
        if (this._syncFrameScheduled) return;
        
        this._syncFrameScheduled = true;
        requestAnimationFrame(() => {
            this._syncFrameScheduled = false;
            this.syncFrame();
        });
    }

    /**
     * Schedule a general sync
     */
    scheduleSync() {
        if (this.layerBridge) {
            this.layerBridge.scheduleSync();
        }
    }

    /**
     * Enable CSS rendering mode (disable canvas)
     */
    enableCSSRendering() {
        this.options.renderingMode = 'css';
        
        // Remove existing canvas if present
        if (this.view.element) {
            const canvas = this.view.element.querySelector('.layer-canvas');
            if (canvas) {
                canvas.remove();
            }
        }

        // Sync layer properties to CSS
        this.syncFrame();
    }

    /**
     * Enable canvas rendering mode
     */
    enableCanvasRendering() {
        this.options.renderingMode = 'canvas';
        
        // Trigger canvas render
        if (this.view._renderLayers) {
            this.view._renderLayers();
        }
    }

    /**
     * Enable hybrid mode (CSS for simple, Canvas for complex)
     */
    enableHybridRendering() {
        this.options.renderingMode = 'hybrid';
        
        // Determine based on layer complexity
        if (this.shouldUseCanvas()) {
            this.enableCanvasRendering();
        } else {
            this.enableCSSRendering();
        }
    }

    /**
     * Determine if canvas rendering is needed
     * @returns {boolean}
     */
    shouldUseCanvas() {
        if (!this.view || !this.view.layer) return false;

        const layer = this.view.layer;

        // Use canvas for custom drawing
        if (layer._customDrawContext) return true;

        // Use canvas for emitter layers
        if (layer._emitterLayer) return true;

        // Check sublayers
        if (layer.sublayers) {
            return layer.sublayers.some(sublayer => {
                return sublayer._customDrawContext || sublayer._emitterLayer;
            });
        }

        return false;
    }

    /**
     * Add an animation to the view's layer
     * @param {CAAnimation} animation
     * @param {string} key
     */
    addAnimation(animation, key) {
        if (this.layerBridge) {
            this.layerBridge.addAnimation(animation, key);
        }
    }

    /**
     * Remove an animation
     * @param {string} key
     */
    removeAnimation(key) {
        if (this.layerBridge) {
            this.layerBridge.removeAnimation(key);
        }
    }

    /**
     * Pause all animations
     */
    pauseAnimations() {
        if (this.layerBridge) {
            this.layerBridge.pauseAnimations();
        }
    }

    /**
     * Resume all animations
     */
    resumeAnimations() {
        if (this.layerBridge) {
            this.layerBridge.resumeAnimations();
        }
    }

    /**
     * Get the bridged element
     * @returns {HTMLElement}
     */
    getElement() {
        return this.view?.element;
    }

    /**
     * Get the layer bridge
     * @returns {LayerBridge}
     */
    getLayerBridge() {
        return this.layerBridge;
    }

    /**
     * Force a complete sync
     */
    sync() {
        this.syncFrame();
        if (this.layerBridge) {
            this.layerBridge.sync();
        }
    }

    /**
     * Check if bridge is active
     * @returns {boolean}
     */
    isActive() {
        return !this._isDestroyed && this.layerBridge !== null;
    }

    /**
     * Get current rendering mode
     * @returns {string}
     */
    getRenderingMode() {
        return this.options.renderingMode;
    }

    /**
     * Set rendering mode
     * @param {string} mode - 'css', 'canvas', 'hybrid'
     */
    setRenderingMode(mode) {
        this.options.renderingMode = mode;
        
        switch (mode) {
            case 'css':
                this.enableCSSRendering();
                break;
            case 'canvas':
                this.enableCanvasRendering();
                break;
            case 'hybrid':
                this.enableHybridRendering();
                break;
        }
    }

    /**
     * Destroy the bridge and clean up
     */
    destroy() {
        this._isDestroyed = true;

        if (this.layerBridge) {
            this.layerBridge.destroy();
            this.layerBridge = null;
        }

        this.view = null;
    }
}

export default ViewLayerBridge;
