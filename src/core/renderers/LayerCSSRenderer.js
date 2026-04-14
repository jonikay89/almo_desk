import UIColor from '../UIColor.js';

class LayerCSSRenderer {
    constructor(options = {}) {
        this.options = {
            useTransform3D: true,
            useGPUAcceleration: true,
            preserve3D: true,
            ...options
        };
    }

    /**
     * Main render method - converts CALayer properties to CSS
     * @param {CALayer} layer - The layer to render
     * @param {HTMLElement} element - The DOM element to apply styles to
     * @returns {Object} The computed CSS styles
     */
    render(layer, element) {
        if (!layer || !element) return null;

        const styles = this.computeStyles(layer);
        this.applyStyles(element, styles);
        
        return styles;
    }

    /**
     * Compute CSS styles from layer properties
     * @param {CALayer} layer
     * @returns {Object} CSS style object
     */
    computeStyles(layer) {
        const styles = {};

        // Visibility
        if (layer.isHidden) {
            styles.display = 'none';
        }

        // Position and size
        styles.position = 'absolute';
        styles.left = `${layer.frame.x}px`;
        styles.top = `${layer.frame.y}px`;
        styles.width = `${layer.bounds.width}px`;
        styles.height = `${layer.bounds.height}px`;

        // Background
        if (layer.backgroundColor) {
            styles.backgroundColor = this.colorToCSS(layer.backgroundColor);
        }

        // Border
        if (layer.borderWidth > 0) {
            styles.borderWidth = `${layer.borderWidth}px`;
            styles.borderStyle = 'solid';
            styles.borderColor = layer.borderColor ? this.colorToCSS(layer.borderColor) : 'transparent';
        }

        // Corner radius
        if (layer.cornerRadius > 0) {
            styles.borderRadius = `${layer.cornerRadius}px`;
        }

        // Opacity
        if (layer.opacity !== 1) {
            styles.opacity = layer.opacity;
        }

        // Shadow
        const shadowStyle = this.computeShadow(layer);
        if (shadowStyle) {
            styles.boxShadow = shadowStyle;
        }

        // Transform
        const transformStyle = this.computeTransform(layer);
        if (transformStyle) {
            styles.transform = transformStyle;
        }

        // Z-index for layer ordering
        if (layer.zPosition !== 0) {
            styles.zIndex = Math.round(layer.zPosition);
        }

        // Overflow for masksToBounds
        if (layer.masksToBounds) {
            styles.overflow = 'hidden';
        }

        // GPU acceleration hints
        if (this.options.useGPUAcceleration) {
            styles.willChange = 'transform, opacity';
            styles.transformStyle = this.options.preserve3D ? 'preserve-3d' : 'flat';
        }

        return styles;
    }

    /**
     * Apply computed styles to a DOM element
     * @param {HTMLElement} element
     * @param {Object} styles
     */
    applyStyles(element, styles) {
        Object.assign(element.style, styles);
    }

    /**
     * Convert UIColor to CSS color string
     * @param {UIColor} color
     * @returns {string} CSS color
     */
    colorToCSS(color) {
        if (color instanceof UIColor) {
            return color.css || color.toString();
        }
        if (typeof color === 'string') {
            return color;
        }
        return 'transparent';
    }

    /**
     * Compute CSS box-shadow from layer shadow properties
     * @param {CALayer} layer
     * @returns {string|null} CSS box-shadow value
     */
    computeShadow(layer) {
        if (layer.shadowOpacity <= 0 || !layer.shadowColor) {
            return null;
        }

        const color = this.colorToCSS(layer.shadowColor);
        const offsetX = layer.shadowOffset?.width || 0;
        const offsetY = layer.shadowOffset?.height || 0;
        const blurRadius = layer.shadowRadius || 0;
        const opacity = layer.shadowOpacity;

        // Parse color and add opacity
        let shadowColor = color;
        if (color.startsWith('#')) {
            const r = parseInt(color.substr(1, 2), 16);
            const g = parseInt(color.substr(3, 2), 16);
            const b = parseInt(color.substr(5, 2), 16);
            shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        } else if (color.startsWith('rgb(')) {
            shadowColor = color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
        } else if (color.startsWith('rgba(')) {
            // Already has alpha, adjust it
            const parts = color.match(/rgba?\(([^)]+)\)/);
            if (parts) {
                const values = parts[1].split(',').map(v => v.trim());
                if (values.length >= 3) {
                    const existingAlpha = values[3] ? parseFloat(values[3]) : 1;
                    shadowColor = `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${existingAlpha * opacity})`;
                }
            }
        }

        return `${offsetX}px ${offsetY}px ${blurRadius}px ${shadowColor}`;
    }

    /**
     * Compute CSS transform from layer transform
     * @param {CALayer} layer
     * @returns {string|null} CSS transform value
     */
    computeTransform(layer) {
        if (!layer.transform || layer.transform.isIdentity?.()) {
            return null;
        }

        // Use 3D transform if available
        if (this.options.useTransform3D && layer.transform.toCSSTransform) {
            return layer.transform.toCSSTransform();
        }

        // Fallback to 2D transform matrix
        if (layer.transform.toArray) {
            const [a, b, c, d, tx, ty] = layer.transform.toArray();
            return `matrix(${a}, ${b}, ${c}, ${d}, ${tx}, ${ty})`;
        }

        return null;
    }

    /**
     * Create a DOM element that represents the layer
     * @param {CALayer} layer
     * @returns {HTMLElement} Created element
     */
    createElement(layer) {
        const element = document.createElement('div');
        element.className = 'calayer';
        if (layer.name) {
            element.dataset.layerName = layer.name;
        }
        this.render(layer, element);
        return element;
    }

    /**
     * Update an existing element with new layer properties
     * @param {CALayer} layer
     * @param {HTMLElement} element
     */
    update(layer, element) {
        this.render(layer, element);
    }

    /**
     * Batch render multiple layers
     * @param {Array<{layer: CALayer, element: HTMLElement}>} items
     */
    renderBatch(items) {
        items.forEach(({ layer, element }) => {
            this.render(layer, element);
        });
    }

    /**
     * Create a style string for inline styles or CSS rules
     * @param {Object} styles
     * @returns {string} CSS style string
     */
    stylesToString(styles) {
        return Object.entries(styles)
            .map(([key, value]) => {
                // Convert camelCase to kebab-case
                const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                return `${cssKey}: ${value}`;
            })
            .join('; ');
    }
}

export default LayerCSSRenderer;
