/**
 * CALayer to CSS/HTML/JavaScript Renderers
 * 
 * Provides rendering bridges between Core Animation layers and DOM/CSS:
 * - LayerCSSRenderer: Converts CALayer properties to CSS
 * - PathSVGRenderer: Converts CGPath to SVG elements
 * - AnimationCSSRenderer: Converts CAAnimation to CSS animations
 */

export { default as LayerCSSRenderer } from './LayerCSSRenderer.js';
export { default as PathSVGRenderer } from './PathSVGRenderer.js';
export { default as AnimationCSSRenderer } from './AnimationCSSRenderer.js';

/**
 * Factory function to create appropriate renderer for a layer type
 * @param {CALayer} layer
 * @param {Object} options
 * @returns {LayerCSSRenderer|PathSVGRenderer|AnimationCSSRenderer}
 */
export async function createRenderer(layer, options = {}) {
    const { CABasicAnimation } = await import('../CALayer.js');
    
    if (layer instanceof CABasicAnimation) {
        const { default: AnimationCSSRenderer } = await import('./AnimationCSSRenderer.js');
        return new AnimationCSSRenderer(options);
    }
    
    // Default to CSS renderer for basic layers
    const { default: LayerCSSRenderer } = await import('./LayerCSSRenderer.js');
    return new LayerCSSRenderer(options);
}

/**
 * Render a layer tree to DOM elements
 * @param {CALayer} rootLayer
 * @param {HTMLElement} container
 * @param {Object} options
 */
export async function renderLayerTree(rootLayer, container, options = {}) {
    const { default: LayerCSSRenderer } = await import('./LayerCSSRenderer.js');
    const renderer = new LayerCSSRenderer(options);
    
    function renderRecursive(layer, parent) {
        const element = renderer.createElement(layer);
        parent.appendChild(element);
        
        if (layer.sublayers) {
            layer.sublayers.forEach(sublayer => {
                renderRecursive(sublayer, element);
            });
        }
        
        return element;
    }
    
    return renderRecursive(rootLayer, container);
}

/**
 * Hybrid renderer that uses CSS for simple layers and Canvas for complex ones
 */
export class HybridRenderer {
    constructor(options = {}) {
        this.options = {
            useCSSFor: ['background', 'border', 'shadow', 'opacity', 'transform'],
            useCanvasFor: ['customDrawing', 'particles', 'complexShapes'],
            ...options
        };
        this.cssRenderer = null;
        this.svgRenderer = null;
    }

    async init() {
        const [{ default: LayerCSSRenderer }, { default: PathSVGRenderer }] = await Promise.all([
            import('./LayerCSSRenderer.js'),
            import('./PathSVGRenderer.js')
        ]);
        this.cssRenderer = new LayerCSSRenderer(this.options);
        this.svgRenderer = new PathSVGRenderer(this.options);
    }

    /**
     * Determine if layer can be rendered with CSS
     * @param {CALayer} layer
     * @returns {boolean}
     */
    canUseCSS(layer) {
        // Cannot use CSS for custom drawing or particle emitters
        if (layer._customDrawContext) return false;
        if (layer._emitterLayer) return false;
        
        // Check if all sublayers can use CSS
        if (layer.sublayers) {
            return layer.sublayers.every(sublayer => this.canUseCSS(sublayer));
        }
        
        return true;
    }

    /**
     * Render layer using best method
     * @param {CALayer} layer
     * @param {HTMLElement} container
     */
    render(layer, container) {
        if (this.canUseCSS(layer)) {
            return this.cssRenderer.createElement(layer);
        } else {
            // Fall back to canvas or SVG
            return this.svgRenderer.renderShapeLayer(layer) || 
                   this.cssRenderer.createElement(layer);
        }
    }
}
