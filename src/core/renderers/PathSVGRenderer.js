import { CGPath } from '../CALayer.js';

/**
 * Converts CGPath to SVG path data and renders shape layers as SVG
 */
class PathSVGRenderer {
    constructor(options = {}) {
        this.options = {
            precision: 2,  // Decimal places for coordinates
            useAbsoluteCommands: true,
            ...options
        };
    }

    /**
     * Convert CGPath to SVG path data string
     * @param {CGPath} path
     * @returns {string} SVG path data (e.g., "M 10 10 L 100 100")
     */
    renderToSVG(path) {
        if (!path || !path._elements) return '';

        const commands = [];
        
        for (const element of path._elements) {
            const cmd = this.convertElementToSVG(element);
            if (cmd) {
                commands.push(cmd);
            }
        }

        return commands.join(' ');
    }

    /**
     * Convert a single path element to SVG command
     * @param {Object} element
     * @returns {string|null}
     */
    convertElementToSVG(element) {
        const p = this.options.precision;
        
        switch (element.type) {
            case 'move':
                return `M ${this.format(element.x, p)} ${this.format(element.y, p)}`;
            
            case 'line':
                return `L ${this.format(element.x, p)} ${this.format(element.y, p)}`;
            
            case 'curve':
                return `C ${this.format(element.cp1.x, p)} ${this.format(element.cp1.y, p)} ` +
                       `${this.format(element.cp2.x, p)} ${this.format(element.cp2.y, p)} ` +
                       `${this.format(element.end.x, p)} ${this.format(element.end.y, p)}`;
            
            case 'quadCurve':
                return `Q ${this.format(element.cp.x, p)} ${this.format(element.cp.y, p)} ` +
                       `${this.format(element.end.x, p)} ${this.format(element.end.y, p)}`;
            
            case 'arc':
                // Convert arc to path commands
                return this.arcToSVG(element);
            
            case 'arcTo':
                // ArcTo is more complex, convert to line segments for now
                return null;
            
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
        const p = this.options.precision;
        
        // Calculate start and end points
        const startX = cx + radius * Math.cos(startAngle);
        const startY = cy + radius * Math.sin(startAngle);
        const endX = cx + radius * Math.cos(endAngle);
        const endY = cy + radius * Math.sin(endAngle);
        
        // Determine large arc flag and sweep flag
        let angleDiff = endAngle - startAngle;
        if (clockwise && angleDiff < 0) angleDiff += Math.PI * 2;
        if (!clockwise && angleDiff > 0) angleDiff -= Math.PI * 2;
        
        const largeArcFlag = Math.abs(angleDiff) > Math.PI ? 1 : 0;
        const sweepFlag = clockwise ? 1 : 0;
        
        return `A ${this.format(radius, p)} ${this.format(radius, p)} 0 ${largeArcFlag} ${sweepFlag} ${this.format(endX, p)} ${this.format(endY, p)}`;
    }

    /**
     * Format a number with specified precision
     * @param {number} value
     * @param {number} precision
     * @returns {string}
     */
    format(value, precision) {
        if (precision === null || precision === undefined) {
            return String(value);
        }
        return value.toFixed(precision);
    }

    /**
     * Render a CAShapeLayer to an SVG element
     * @param {CAShapeLayer} shapeLayer
     * @returns {SVGElement}
     */
    renderShapeLayer(shapeLayer) {
        if (!shapeLayer || !shapeLayer.path) return null;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'cas-shape-layer');
        
        // Set viewBox based on path bounds
        const bounds = shapeLayer.path.boundingBox;
        svg.setAttribute('viewBox', `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`);
        svg.style.width = `${bounds.width}px`;
        svg.style.height = `${bounds.height}px`;
        svg.style.position = 'absolute';
        svg.style.left = '0';
        svg.style.top = '0';
        svg.style.pointerEvents = 'none';

        // Create path element
        const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathEl.setAttribute('d', this.renderToSVG(shapeLayer.path));
        
        // Apply fill color
        if (shapeLayer.fillColor) {
            pathEl.setAttribute('fill', this.colorToSVG(shapeLayer.fillColor));
        } else {
            pathEl.setAttribute('fill', 'none');
        }

        // Apply stroke
        if (shapeLayer.strokeColor && shapeLayer.lineWidth > 0) {
            pathEl.setAttribute('stroke', this.colorToSVG(shapeLayer.strokeColor));
            pathEl.setAttribute('stroke-width', shapeLayer.lineWidth);
            
            if (shapeLayer.lineCap) {
                pathEl.setAttribute('stroke-linecap', shapeLayer.lineCap);
            }
            if (shapeLayer.lineJoin) {
                pathEl.setAttribute('stroke-linejoin', shapeLayer.lineJoin);
            }
            if (shapeLayer.lineDashPattern) {
                pathEl.setAttribute('stroke-dasharray', shapeLayer.lineDashPattern.join(' '));
            }
        }

        // Apply opacity
        if (shapeLayer.opacity !== undefined && shapeLayer.opacity !== 1) {
            pathEl.setAttribute('opacity', shapeLayer.opacity);
        }

        svg.appendChild(pathEl);
        return svg;
    }

    /**
     * Render a CAGradientLayer to an SVG gradient
     * @param {CAGradientLayer} gradientLayer
     * @returns {SVGElement}
     */
    renderGradientLayer(gradientLayer) {
        if (!gradientLayer || !gradientLayer.colors) return null;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'cas-gradient-layer');
        
        const width = gradientLayer.frame?.width || 100;
        const height = gradientLayer.frame?.height || 100;
        
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.style.width = `${width}px`;
        svg.style.height = `${height}px`;
        svg.style.position = 'absolute';
        svg.style.left = '0';
        svg.style.top = '0';

        // Define gradient
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradientId = `gradient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', gradientId);
        
        // Set gradient vector based on start/end points
        const x1 = (gradientLayer.startPoint?.x || 0) * 100;
        const y1 = (gradientLayer.startPoint?.y || 0) * 100;
        const x2 = (gradientLayer.endPoint?.x || 0) * 100;
        const y2 = (gradientLayer.endPoint?.y || 1) * 100;
        
        gradient.setAttribute('x1', `${x1}%`);
        gradient.setAttribute('y1', `${y1}%`);
        gradient.setAttribute('x2', `${x2}%`);
        gradient.setAttribute('y2', `${y2}%`);

        // Add color stops
        gradientLayer.colors.forEach((color, index) => {
            const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            const location = gradientLayer.locations?.[index] ?? (index / (gradientLayer.colors.length - 1 || 1));
            stop.setAttribute('offset', `${location * 100}%`);
            stop.setAttribute('stop-color', this.colorToSVG(color));
            gradient.appendChild(stop);
        });

        defs.appendChild(gradient);
        svg.appendChild(defs);

        // Create rect with gradient fill
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        rect.setAttribute('fill', `url(#${gradientId})`);
        
        if (gradientLayer.cornerRadius) {
            rect.setAttribute('rx', gradientLayer.cornerRadius);
            rect.setAttribute('ry', gradientLayer.cornerRadius);
        }

        svg.appendChild(rect);
        return svg;
    }

    /**
     * Convert color to SVG-compatible string
     * @param {UIColor|string} color
     * @returns {string}
     */
    colorToSVG(color) {
        if (typeof color === 'string') {
            return color;
        }
        if (color.css) {
            return color.css;
        }
        if (color.toString) {
            return color.toString();
        }
        return 'black';
    }

    /**
     * Create an SVG mask from a path
     * @param {CGPath} path
     * @param {string} maskId
     * @returns {SVGMaskElement}
     */
    createMask(path, maskId) {
        const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
        mask.setAttribute('id', maskId);
        
        const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathEl.setAttribute('d', this.renderToSVG(path));
        pathEl.setAttribute('fill', 'white');
        
        mask.appendChild(pathEl);
        return mask;
    }

    /**
     * Batch render multiple paths
     * @param {Array<{path: CGPath, container: HTMLElement}>} items
     */
    renderBatch(items) {
        items.forEach(({ path, container }) => {
            if (path && container) {
                const svgPath = this.renderToSVG(path);
                // Create a simple SVG element with the path
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('viewBox', '0 0 100 100');
                svg.style.width = '100%';
                svg.style.height = '100%';
                
                const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                pathEl.setAttribute('d', svgPath);
                pathEl.setAttribute('fill', 'none');
                pathEl.setAttribute('stroke', 'black');
                
                svg.appendChild(pathEl);
                container.appendChild(svg);
            }
        });
    }
}

export default PathSVGRenderer;
