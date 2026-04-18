/**
 * CALayerRenderer - The sole renderer that converts CALayer data to DOM/CSS output
 * 
 * Architecture:
 * CALayer (data/preparation) → CALayerRenderer (output) → DOM (final result)
 * 
 * Responsibilities:
 * - Create DOM elements from CALayer data
 * - Apply CSS styles computed from layer properties
 * - Handle layer tree → DOM tree mapping
 * - Update elements when layers change
 * - Apply animations via CSS
 */

import UIColor from '../UIColor.js';

class CALayerRenderer {
    constructor() {
        this._elementRegistry = new WeakMap();
        this._layerToParentMap = new WeakMap();
        this._updateQueue = new Set();
        this._isProcessing = false;
        this._animationRenderer = null;
    }

    static getShared() {
        if (!CALayerRenderer._shared) {
            CALayerRenderer._shared = new CALayerRenderer();
        }
        return CALayerRenderer._shared;
    }

    /**
     * Render a CALayer to a DOM container
     * @param {CALayer} layer
     * @param {HTMLElement} container
     * @param {HTMLElement} existingElement - Optional existing element to use instead of creating new
     * @returns {HTMLElement}
     */
    render(layer, container, existingElement = null) {
        let element = existingElement;
        
        if (!element) {
            element = this.createElementForLayer(layer);
        } else {
            this.applyStyles(layer, element);
        }
        
        container.appendChild(element);
        this._elementRegistry.set(layer, element);
        this._layerToParentMap.set(layer, container);
        
        this._updateQueue.delete(layer);
        
        layer._sublayers?.forEach(sublayer => {
            if (!this._elementRegistry.has(sublayer)) {
                this.render(sublayer, element);
            }
        });
        
        return element;
    }

    /**
     * Create DOM element for a CALayer
     * @param {CALayer} layer
     * @returns {HTMLElement}
     */
    createElementForLayer(layer) {
        const layerType = this.getLayerType(layer);
        
        switch (layerType) {
            case 'gradient':
                return this.createGradientElement(layer);
            case 'shape':
                return this.createShapeElement(layer);
            case 'text':
                return this.createTextElement(layer);
            case 'emitter':
                return this.createEmitterElement(layer);
            default:
                return this.createDivElement(layer);
        }
    }

    /**
     * Determine the type of layer for rendering strategy
     * @param {CALayer} layer
     * @returns {string}
     */
    getLayerType(layer) {
        if (layer._colors && layer._colors.length > 0) return 'gradient';
        if (layer._path) return 'shape';
        if (layer._string !== undefined) return 'text';
        if (layer._particles) return 'emitter';
        return 'default';
    }

    /**
     * Create a div element with CSS styles from layer
     * @param {CALayer} layer
     * @returns {HTMLElement}
     */
    createDivElement(layer) {
        const element = document.createElement('div');
        this.applyStyles(layer, element);
        return element;
    }

    /**
     * Create SVG element for gradient layers
     * @param {CAGradientLayer} layer
     * @returns {HTMLElement}
     */
    createGradientElement(layer) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'ca-gradient-layer');
        
        const width = layer._frame?.width || 100;
        const height = layer._frame?.height || 100;
        
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.style.position = 'absolute';
        svg.style.left = '0';
        svg.style.top = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradientId = `gradient_${this.generateId()}`;
        
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', gradientId);
        
        const startX = (layer._startPoint?.x || 0.5) * 100;
        const startY = (layer._startPoint?.y || 0) * 100;
        const endX = (layer._endPoint?.x || 0.5) * 100;
        const endY = (layer._endPoint?.y || 1) * 100;
        
        gradient.setAttribute('x1', `${startX}%`);
        gradient.setAttribute('y1', `${startY}%`);
        gradient.setAttribute('x2', `${endX}%`);
        gradient.setAttribute('y2', `${endY}%`);

        const colors = layer._colors || [];
        const locations = layer._locations || colors.map((_, i) => i / (colors.length - 1 || 1));
        
        colors.forEach((color, index) => {
            const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            const location = locations[index] ?? (index / (colors.length - 1 || 1));
            stop.setAttribute('offset', `${location * 100}%`);
            stop.setAttribute('stop-color', this.colorToCSS(color));
            gradient.appendChild(stop);
        });

        defs.appendChild(gradient);
        svg.appendChild(defs);

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        rect.setAttribute('fill', `url(#${gradientId})`);
        
        if (layer._cornerRadius > 0) {
            rect.setAttribute('rx', layer._cornerRadius);
            rect.setAttribute('ry', layer._cornerRadius);
        }

        svg.appendChild(rect);
        return svg;
    }

    /**
     * Create SVG element for shape layers
     * @param {CAShapeLayer} layer
     * @returns {HTMLElement}
     */
    createShapeElement(layer) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'ca-shape-layer');
        
        const bounds = layer._path?.boundingBox || { x: 0, y: 0, width: 100, height: 100 };
        svg.setAttribute('viewBox', `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`);
        svg.style.position = 'absolute';
        svg.style.left = '0';
        svg.style.top = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', this.pathToSVGData(layer._path));
        
        if (layer._fillColor) {
            path.setAttribute('fill', this.colorToCSS(layer._fillColor));
        } else {
            path.setAttribute('fill', 'none');
        }

        if (layer._strokeColor && layer._lineWidth > 0) {
            path.setAttribute('stroke', this.colorToCSS(layer._strokeColor));
            path.setAttribute('stroke-width', layer._lineWidth);
            
            if (layer._lineCap) path.setAttribute('stroke-linecap', layer._lineCap);
            if (layer._lineJoin) path.setAttribute('stroke-linejoin', layer._lineJoin);
            if (layer._lineDashPattern?.length > 0) {
                path.setAttribute('stroke-dasharray', layer._lineDashPattern.join(' '));
            }
        }

        svg.appendChild(path);
        return svg;
    }

    /**
     * Create element for text layers
     * @param {CATextLayer} layer
     * @returns {HTMLElement}
     */
    createTextElement(layer) {
        const element = document.createElement('div');
        element.className = 'ca-text-layer';
        element.textContent = layer._string || '';
        
        if (layer._font) {
            element.style.font = layer._font;
        } else {
            element.style.font = `${layer._fontSize || 14}px system-ui`;
        }
        
        if (layer._textColor) {
            element.style.color = this.colorToCSS(layer._textColor);
        }
        
        if (layer._textAlignment) {
            element.style.textAlign = layer._textAlignment;
        }
        
        element.style.whiteSpace = 'pre-wrap';
        element.style.overflow = 'hidden';
        
        return element;
    }

    /**
     * Create canvas element for emitter layers (particles)
     * @param {CAEmitterLayer} layer
     * @returns {HTMLElement}
     */
    createEmitterElement(layer) {
        const canvas = document.createElement('canvas');
        canvas.className = 'ca-emitter-layer';
        canvas.style.position = 'absolute';
        canvas.style.left = '0';
        canvas.style.top = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        
        const width = layer._frame?.width || 100;
        const height = layer._frame?.height || 100;
        canvas.width = width * 2;
        canvas.height = height * 2;
        
        return canvas;
    }

    /**
     * Apply computed styles from layer to element
     * @param {CALayer} layer
     * @param {HTMLElement} element
     */
    applyStyles(layer, element) {
        const styles = this.computeStyles(layer);
        
        if (layer._customState) {
            this.applyCustomState(layer._customState, element);
        }
        
        if (layer._cssClass) {
            element.className = layer._cssClass;
        }
        
        Object.assign(element.style, styles);
        
        if (layer.positioning === 'relative') {
            element.style.position = 'relative';
        }
    }

    /**
     * Compute CSS styles from layer properties
     * @param {CALayer} layer
     * @returns {Object}
     */
    computeStyles(layer) {
        const styles = {};

        styles.position = 'absolute';
        styles.left = `${layer._frame?.x || 0}px`;
        styles.top = `${layer._frame?.y || 0}px`;
        styles.width = `${layer._frame?.width || 0}px`;
        styles.height = `${layer._frame?.height || 0}px`;
        styles.boxSizing = 'border-box';
        styles.margin = '0';
        styles.padding = '0';

        if (layer._backgroundColor) {
            styles.backgroundColor = this.colorToCSS(layer._backgroundColor);
        }

        if (layer._borderWidth > 0) {
            styles.borderWidth = `${layer._borderWidth}px`;
            styles.borderStyle = 'solid';
            styles.borderColor = layer._borderColor ? this.colorToCSS(layer._borderColor) : 'transparent';
        }

        if (layer._cornerRadius > 0) {
            styles.borderRadius = `${layer._cornerRadius}px`;
        }

        if (layer._opacity !== undefined && layer._opacity !== 1) {
            styles.opacity = layer._opacity;
        }

        const shadow = this.computeShadow(layer);
        if (shadow) {
            styles.boxShadow = shadow;
        }

        if (layer._transform && !this.isIdentityTransform(layer._transform)) {
            styles.transform = this.transformToCSS(layer._transform);
            const anchorX = layer._anchorPoint?.x ?? 0.5;
            const anchorY = layer._anchorPoint?.y ?? 0.5;
            styles.transformOrigin = `${anchorX * (layer._frame?.width || 100)}px ${anchorY * (layer._frame?.height || 100)}px`;
        }

        if (layer._isHidden) {
            styles.display = 'none';
        }

        if (layer._masksToBounds) {
            styles.overflow = 'hidden';
        }

        if (layer._zPosition !== undefined && layer._zPosition !== 0) {
            styles.zIndex = Math.round(layer._zPosition);
        }

        return styles;
    }

    /**
     * Compute box-shadow CSS from layer shadow properties
     * @param {CALayer} layer
     * @returns {string|null}
     */
    computeShadow(layer) {
        if (!layer._shadowColor || layer._shadowOpacity <= 0) {
            return null;
        }

        const color = layer._shadowColor;
        const opacity = layer._shadowOpacity;
        const offsetX = layer._shadowOffset?.width || 0;
        const offsetY = layer._shadowOffset?.height || 0;
        const radius = layer._shadowRadius || 0;

        let colorStr;
        if (typeof color === 'string') {
            colorStr = color;
        } else if (color instanceof UIColor) {
            colorStr = color.css || `rgba(0,0,0,${opacity})`;
        } else {
            colorStr = `rgba(0,0,0,${opacity})`;
        }

        return `${offsetX}px ${offsetY}px ${radius}px ${colorStr}`;
    }

    /**
     * Convert CATransform3D to CSS transform string
     * @param {CATransform3D} transform
     * @returns {string}
     */
    transformToCSS(transform) {
        if (!transform) return '';
        
        if (typeof transform.toCSSTransform === 'function') {
            return transform.toCSSTransform();
        }
        
        if (transform.toArray) {
            const [a, b, c, d, tx, ty] = transform.toArray();
            return `matrix(${a}, ${b}, ${c}, ${d}, ${tx}, ${ty})`;
        }
        
        return '';
    }

    /**
     * Check if transform is identity
     * @param {CATransform3D} transform
     * @returns {boolean}
     */
    isIdentityTransform(transform) {
        if (!transform) return true;
        if (typeof transform.isIdentity === 'function') return transform.isIdentity();
        return false;
    }

    /**
     * Apply custom state styles (for UIControl states)
     * @param {Object} state
     * @param {HTMLElement} element
     */
    applyCustomState(state, element) {
        if (state.disabled) {
            element.style.pointerEvents = 'none';
        }
        if (state.selected) {
            element.style.filter = 'brightness(1.1)';
        }
        if (state.highlighted) {
            element.style.filter = 'brightness(0.9)';
        }
    }

    /**
     * Convert CGPath to SVG path data string
     * @param {CGPath} path
     * @returns {string}
     */
    pathToSVGData(path) {
        if (!path || !path._elements) return '';

        const commands = [];
        
        for (const element of path._elements) {
            const cmd = this.pathElementToSVG(element);
            if (cmd) commands.push(cmd);
        }

        return commands.join(' ');
    }

    /**
     * Convert a single path element to SVG command
     * @param {Object} element
     * @returns {string|null}
     */
    pathElementToSVG(element) {
        switch (element.type) {
            case 'move':
                return `M ${element.x} ${element.y}`;
            case 'line':
                return `L ${element.x} ${element.y}`;
            case 'curve':
                return `C ${element.cp1.x} ${element.cp1.y} ${element.cp2.x} ${element.cp2.y} ${element.end.x} ${element.end.y}`;
            case 'quadCurve':
                return `Q ${element.cp.x} ${element.cp.y} ${element.end.x} ${element.end.y}`;
            case 'arc':
                return this.arcToSVG(element);
            case 'close':
                return 'Z';
            default:
                return null;
        }
    }

    /**
     * Convert arc element to SVG arc command
     * @param {Object} element
     * @returns {string}
     */
    arcToSVG(element) {
        const { cx, cy, radius, startAngle, endAngle, clockwise } = element;
        
        const startX = cx + radius * Math.cos(startAngle);
        const startY = cy + radius * Math.sin(startAngle);
        const endX = cx + radius * Math.cos(endAngle);
        const endY = cy + radius * Math.sin(endAngle);
        
        let angleDiff = endAngle - startAngle;
        if (clockwise && angleDiff < 0) angleDiff += Math.PI * 2;
        if (!clockwise && angleDiff > 0) angleDiff -= Math.PI * 2;
        
        const largeArcFlag = Math.abs(angleDiff) > Math.PI ? 1 : 0;
        const sweepFlag = clockwise ? 1 : 0;
        
        return `A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${endX} ${endY}`;
    }

    /**
     * Convert color to CSS string
     * @param {UIColor|string} color
     * @returns {string}
     */
    colorToCSS(color) {
        if (!color) return 'transparent';
        if (typeof color === 'string') return color;
        if (color instanceof UIColor) {
            return color.css || color.toString?.() || 'transparent';
        }
        if (color.css) return color.css;
        return 'transparent';
    }

    /**
     * Update element when layer changes
     * @param {CALayer} layer
     */
    update(layer) {
        const element = this._elementRegistry.get(layer);
        if (!element) return;

        this.applyStyles(layer, element);
        
        if (element.tagName === 'SVG') {
            this.updateSVGElement(layer, element);
        }
    }

    /**
     * Update SVG element when gradient/shape changes
     * @param {CALayer} layer
     * @param {HTMLElement} svg
     */
    updateSVGElement(layer, element) {
        if (layer._colors) {
            const rect = element.querySelector('rect');
            if (rect) {
                const gradient = element.querySelector('linearGradient');
                if (gradient) {
                    const stops = gradient.querySelectorAll('stop');
                    const colors = layer._colors;
                    const locations = layer._locations || colors.map((_, i) => i / (colors.length - 1 || 1));
                    
                    stops.forEach((stop, i) => {
                        if (colors[i]) {
                            stop.setAttribute('stop-color', this.colorToCSS(colors[i]));
                        }
                        if (locations[i] !== undefined) {
                            stop.setAttribute('offset', `${locations[i] * 100}%`);
                        }
                    });
                }
            }
        }
    }

    /**
     * Queue an update for next frame
     * @param {CALayer} layer
     */
    scheduleUpdate(layer) {
        this._updateQueue.add(layer);
        
        if (!this._isProcessing) {
            this._isProcessing = true;
            requestAnimationFrame(() => this.flushUpdates());
        }
    }

    /**
     * Flush all queued updates
     */
    flushUpdates() {
        this._updateQueue.forEach(layer => {
            this.update(layer);
        });
        this._updateQueue.clear();
        this._isProcessing = false;
    }

    /**
     * Remove layer from DOM
     * @param {CALayer} layer
     */
    remove(layer) {
        const element = this._elementRegistry.get(layer);
        if (element) {
            element.remove();
            this._elementRegistry.delete(layer);
        }
        
        layer._sublayers?.forEach(sublayer => {
            this.remove(sublayer);
        });
    }

    /**
     * Get element for layer
     * @param {CALayer} layer
     * @returns {HTMLElement|null}
     */
    getElement(layer) {
        return this._elementRegistry.get(layer);
    }

    /**
     * Generate unique ID
     * @returns {string}
     */
    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Clear all cached elements (for testing)
     */
    reset() {
        this._elementRegistry = new WeakMap();
        this._layerToParentMap = new WeakMap();
        this._updateQueue.clear();
    }
}

CALayerRenderer._shared = null;

export default CALayerRenderer;
