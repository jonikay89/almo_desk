/**
 * CALayer to DOM Bridge
 * 
 * Provides bidirectional synchronization between Core Animation layers and DOM elements
 */

export { default as LayerBridge } from './LayerBridge.js';
export { default as ViewLayerBridge } from './ViewLayerBridge.js';

/**
 * Factory function to create appropriate bridge
 * @param {CALayer|UIView} target
 * @param {Object} options
 * @returns {LayerBridge|ViewLayerBridge}
 */
export function createBridge(target, options = {}) {
    // Check if target is a UIView (has element and layer properties)
    if (target.element && target.layer && typeof target.layoutSubviews === 'function') {
        return new ViewLayerBridge(target, options);
    }
    
    // Otherwise assume it's a CALayer
    return new LayerBridge(target, null, options);
}

/**
 * Bridge a layer tree to a DOM container
 * @param {CALayer} rootLayer
 * @param {HTMLElement} container
 * @param {Object} options
 * @returns {LayerBridge}
 */
export function bridgeLayerTree(rootLayer, container, options = {}) {
    const bridge = new LayerBridge(rootLayer, null, options);
    const element = bridge.init();
    
    if (container && element) {
        container.appendChild(element);
    }
    
    return bridge;
}

/**
 * Bridge a UIView to CSS rendering
 * @param {UIView} view
 * @param {Object} options
 * @returns {ViewLayerBridge}
 */
export function bridgeView(view, options = {}) {
    const bridge = new ViewLayerBridge(view, options);
    bridge.init();
    return bridge;
}

/**
 * Batch bridge multiple views
 * @param {Array<UIView>} views
 * @param {Object} options
 * @returns {Array<ViewLayerBridge>}
 */
export function bridgeViews(views, options = {}) {
    return views.map(view => bridgeView(view, options));
}

/**
 * Global bridge manager for tracking active bridges
 */
export class BridgeManager {
    constructor() {
        this.bridges = new Set();
        this.autoSyncEnabled = true;
        this.syncInterval = null;
    }

    /**
     * Register a bridge
     * @param {LayerBridge|ViewLayerBridge} bridge
     */
    register(bridge) {
        this.bridges.add(bridge);
    }

    /**
     * Unregister a bridge
     * @param {LayerBridge|ViewLayerBridge} bridge
     */
    unregister(bridge) {
        this.bridges.delete(bridge);
    }

    /**
     * Enable auto-sync for all bridges
     */
    enableAutoSync() {
        if (this.syncInterval) return;
        
        this.autoSyncEnabled = true;
        this.syncInterval = setInterval(() => {
            this.syncAll();
        }, 16); // ~60fps
    }

    /**
     * Disable auto-sync
     */
    disableAutoSync() {
        this.autoSyncEnabled = false;
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    /**
     * Sync all registered bridges
     */
    syncAll() {
        this.bridges.forEach(bridge => {
            if (bridge.sync) {
                bridge.sync();
            }
        });
    }

    /**
     * Destroy all bridges
     */
    destroyAll() {
        this.bridges.forEach(bridge => {
            if (bridge.destroy) {
                bridge.destroy();
            }
        });
        this.bridges.clear();
        this.disableAutoSync();
    }

    /**
     * Get count of active bridges
     * @returns {number}
     */
    getCount() {
        return this.bridges.size;
    }
}

// Global instance
export const bridgeManager = new BridgeManager();
