import { 
    CABasicAnimation, 
    CAKeyframeAnimation, 
    CAAnimationGroup,
    CASpringAnimation 
} from '../CALayer.js';

/**
 * Converts Core Animation animations to CSS animations
 */
class AnimationCSSRenderer {
    constructor(options = {}) {
        this.options = {
            generateKeyframes: true,
            injectStyles: true,
            prefix: 'cas-anim-',
            ...options
        };
        this.styleElement = null;
        this.injectedKeyframes = new Set();
    }

    /**
     * Main render method - converts animation to CSS
     * @param {CABasicAnimation|CAKeyframeAnimation|CAAnimationGroup} animation
     * @param {HTMLElement} element - Target DOM element
     * @param {string} key - Unique identifier for this animation instance
     * @returns {Object} Animation configuration
     */
    render(animation, element, key) {
        if (!animation || !element) return null;

        const config = this.convertAnimation(animation, key);
        
        if (this.options.injectStyles && config.keyframes) {
            this.injectKeyframes(config.keyframes, config.name);
        }

        if (config.style) {
            Object.assign(element.style, config.style);
        }

        return config;
    }

    /**
     * Convert CA animation to CSS animation configuration
     * @param {CABasicAnimation|CAKeyframeAnimation|CAAnimationGroup} animation
     * @param {string} key
     * @returns {Object}
     */
    convertAnimation(animation, key) {
        if (animation instanceof CAAnimationGroup) {
            return this.convertAnimationGroup(animation, key);
        } else if (animation instanceof CAKeyframeAnimation) {
            return this.convertKeyframeAnimation(animation, key);
        } else if (animation instanceof CASpringAnimation) {
            return this.convertSpringAnimation(animation, key);
        } else {
            return this.convertBasicAnimation(animation, key);
        }
    }

    /**
     * Convert CABasicAnimation to CSS
     * @param {CABasicAnimation} animation
     * @param {string} key
     * @returns {Object}
     */
    convertBasicAnimation(animation, key) {
        const animationName = `${this.options.prefix}${key}`;
        const duration = animation.duration || 0.25;
        const timingFunction = this.convertTimingFunction(animation.timingFunction);
        const delay = animation.beginTime || 0;
        const iterations = animation.repeatCount === Infinity ? 'infinite' : (animation.repeatCount || 1);
        const direction = animation.autoreverses ? 'alternate' : 'normal';
        const fillMode = this.convertFillMode(animation.fillMode);

        // Create keyframes
        const keyframes = this.createKeyframes(animation);

        return {
            name: animationName,
            keyframes: {
                name: animationName,
                rules: keyframes
            },
            style: {
                animationName: animationName,
                animationDuration: `${duration}s`,
                animationTimingFunction: timingFunction,
                animationDelay: `${delay}s`,
                animationIterationCount: iterations,
                animationDirection: direction,
                animationFillMode: fillMode,
                animationPlayState: 'running'
            }
        };
    }

    /**
     * Convert CAKeyframeAnimation to CSS
     * @param {CAKeyframeAnimation} animation
     * @param {string} key
     * @returns {Object}
     */
    convertKeyframeAnimation(animation, key) {
        const animationName = `${this.options.prefix}${key}`;
        const duration = animation.duration || 0.25;
        const timingFunction = this.convertTimingFunction(animation.timingFunction);
        const delay = animation.beginTime || 0;
        const iterations = animation.repeatCount === Infinity ? 'infinite' : (animation.repeatCount || 1);
        const direction = animation.autoreverses ? 'alternate' : 'normal';
        const fillMode = this.convertFillMode(animation.fillMode);

        // Convert keyframe values to CSS
        const keyframes = this.convertKeyframeValues(animation);

        return {
            name: animationName,
            keyframes: {
                name: animationName,
                rules: keyframes
            },
            style: {
                animationName: animationName,
                animationDuration: `${duration}s`,
                animationTimingFunction: timingFunction,
                animationDelay: `${delay}s`,
                animationIterationCount: iterations,
                animationDirection: direction,
                animationFillMode: fillMode,
                animationPlayState: 'running'
            }
        };
    }

    /**
     * Convert CASpringAnimation to CSS with cubic-bezier approximation
     * @param {CASpringAnimation} animation
     * @param {string} key
     * @returns {Object}
     */
    convertSpringAnimation(animation, key) {
        const animationName = `${this.options.prefix}${key}`;
        const duration = animation.getSettlingDuration ? animation.getSettlingDuration() : animation.duration;
        const delay = animation.beginTime || 0;
        const iterations = animation.repeatCount === Infinity ? 'infinite' : (animation.repeatCount || 1);
        const direction = animation.autoreverses ? 'alternate' : 'normal';
        const fillMode = this.convertFillMode(animation.fillMode);

        // Convert spring physics to cubic-bezier
        const bezier = this.springToCubicBezier(animation);

        // Create keyframes
        const keyframes = this.createKeyframes(animation);

        return {
            name: animationName,
            keyframes: {
                name: animationName,
                rules: keyframes
            },
            style: {
                animationName: animationName,
                animationDuration: `${duration}s`,
                animationTimingFunction: `cubic-bezier(${bezier.join(', ')})`,
                animationDelay: `${delay}s`,
                animationIterationCount: iterations,
                animationDirection: direction,
                animationFillMode: fillMode,
                animationPlayState: 'running'
            }
        };
    }

    /**
     * Convert CAAnimationGroup to CSS animation-delay chain
     * @param {CAAnimationGroup} group
     * @param {string} key
     * @returns {Object}
     */
    convertAnimationGroup(group, key) {
        const configs = [];
        let currentDelay = group.beginTime || 0;

        group.animations.forEach((anim, index) => {
            const animKey = `${key}-group-${index}`;
            const config = this.convertAnimation(anim, animKey);
            
            if (config.style) {
                config.style.animationDelay = `${currentDelay}s`;
            }
            
            configs.push(config);
            currentDelay += (anim.duration || 0.25) * (anim.repeatCount || 1);
        });

        return {
            name: `${this.options.prefix}${key}`,
            group: configs,
            style: this.mergeGroupStyles(configs)
        };
    }

    /**
     * Create @keyframes rules from animation
     * @param {CABasicAnimation} animation
     * @returns {Array}
     */
    createKeyframes(animation) {
        const keyPath = animation.keyPath;
        const fromValue = animation.fromValue;
        const toValue = animation.toValue;

        const fromStyle = this.valueToCSS(keyPath, fromValue);
        const toStyle = this.valueToCSS(keyPath, toValue);

        return [
            { offset: 0, style: fromStyle },
            { offset: 1, style: toStyle }
        ];
    }

    /**
     * Convert keyframe animation values to CSS keyframes
     * @param {CAKeyframeAnimation} animation
     * @returns {Array}
     */
    convertKeyframeValues(animation) {
        const keyPath = animation.keyPath;
        const values = animation.values || [];
        const keyTimes = animation.keyTimes || values.map((_, i) => i / (values.length - 1 || 1));

        return values.map((value, index) => ({
            offset: keyTimes[index] || 0,
            style: this.valueToCSS(keyPath, value)
        }));
    }

    /**
     * Convert animation value to CSS property
     * @param {string} keyPath - Property path (e.g., 'position.x', 'opacity')
     * @param {*} value
     * @returns {Object}
     */
    valueToCSS(keyPath, value) {
        if (!keyPath || value === null || value === undefined) {
            return {};
        }

        const style = {};

        // Handle nested properties like 'position.x'
        if (keyPath.includes('.')) {
            const [parent, child] = keyPath.split('.');
            
            if (parent === 'position') {
                if (child === 'x') style.left = `${value}px`;
                if (child === 'y') style.top = `${value}px`;
            } else if (parent === 'bounds') {
                if (child === 'width') style.width = `${value}px`;
                if (child === 'height') style.height = `${value}px`;
            } else if (parent === 'transform') {
                style.transform = this.transformValueToCSS(child, value);
            }
        } else {
            // Direct properties
            switch (keyPath) {
                case 'opacity':
                    style.opacity = value;
                    break;
                case 'backgroundColor':
                    style.backgroundColor = this.colorToCSS(value);
                    break;
                case 'cornerRadius':
                    style.borderRadius = `${value}px`;
                    break;
                case 'borderWidth':
                    style.borderWidth = `${value}px`;
                    break;
                case 'transform':
                    if (value.toCSSTransform) {
                        style.transform = value.toCSSTransform();
                    }
                    break;
                case 'position':
                    if (typeof value === 'object') {
                        style.left = `${value.x}px`;
                        style.top = `${value.y}px`;
                    }
                    break;
                case 'bounds':
                    if (typeof value === 'object') {
                        style.width = `${value.width}px`;
                        style.height = `${value.height}px`;
                    }
                    break;
                default:
                    // Try to map unknown properties
                    style[keyPath] = value;
            }
        }

        return style;
    }

    /**
     * Convert transform value to CSS
     * @param {string} type
     * @param {number|Object} value
     * @returns {string}
     */
    transformValueToCSS(type, value) {
        switch (type) {
            case 'rotation':
                return `rotate(${value}rad)`;
            case 'scale':
                return `scale(${value})`;
            case 'scaleX':
                return `scaleX(${value})`;
            case 'scaleY':
                return `scaleY(${value})`;
            case 'translation':
                return `translate(${value.x}px, ${value.y}px)`;
            default:
                return '';
        }
    }

    /**
     * Convert timing function name to CSS cubic-bezier
     * @param {string} timingFunction
     * @returns {string}
     */
    convertTimingFunction(timingFunction) {
        const presets = {
            'linear': 'linear',
            'easeIn': 'ease-in',
            'easeOut': 'ease-out',
            'easeInOut': 'ease-in-out',
            'default': 'ease',
            'easeInEaseOut': 'ease-in-out',
            'easeInSine': 'cubic-bezier(0.47, 0, 0.745, 0.715)',
            'easeOutSine': 'cubic-bezier(0.39, 0.575, 0.565, 1)',
            'easeInOutSine': 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
            'easeInQuad': 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
            'easeOutQuad': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            'easeInOutQuad': 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
            'easeInCubic': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
            'easeOutCubic': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
            'easeInOutCubic': 'cubic-bezier(0.645, 0.045, 0.355, 1)'
        };

        return presets[timingFunction] || 'ease';
    }

    /**
     * Convert spring physics to cubic-bezier approximation
     * @param {CASpringAnimation} spring
     * @returns {Array} [x1, y1, x2, y2]
     */
    springToCubicBezier(spring) {
        const dampingRatio = spring.damping / (2 * Math.sqrt(spring.stiffness * spring.mass));
        const velocity = spring.initialVelocity || 0;

        // Approximate spring with cubic-bezier
        // This is a simplified approximation - real springs are more complex
        if (dampingRatio < 1) {
            // Under-damped: some overshoot
            const overshoot = Math.max(0, 0.5 - dampingRatio * 0.3);
            return [0.34 + velocity * 0.1, 1.56 + overshoot, 0.64, 1];
        } else if (dampingRatio === 1) {
            // Critically damped
            return [0.25, 0.1, 0.25, 1];
        } else {
            // Over-damped
            return [0.4, 0, 0.2, 1];
        }
    }

    /**
     * Convert fill mode to CSS fill-mode
     * @param {string} fillMode
     * @returns {string}
     */
    convertFillMode(fillMode) {
        const modes = {
            'removed': 'none',
            'forwards': 'forwards',
            'backwards': 'backwards',
            'both': 'both'
        };
        return modes[fillMode] || 'none';
    }

    /**
     * Convert color to CSS string
     * @param {*} color
     * @returns {string}
     */
    colorToCSS(color) {
        if (typeof color === 'string') return color;
        if (color.css) return color.css;
        if (color.toString) return color.toString();
        return color;
    }

    /**
     * Merge styles from animation group
     * @param {Array} configs
     * @returns {Object}
     */
    mergeGroupStyles(configs) {
        const merged = {};
        
        configs.forEach(config => {
            if (config.style) {
                Object.entries(config.style).forEach(([key, value]) => {
                    if (key.startsWith('animation')) {
                        // Handle animation properties specially
                        if (key === 'animationName') {
                            merged.animationName = merged.animationName 
                                ? `${merged.animationName}, ${value}` 
                                : value;
                        } else if (key === 'animationDelay') {
                            merged.animationDelay = merged.animationDelay
                                ? `${merged.animationDelay}, ${value}`
                                : value;
                        } else if (!merged[key]) {
                            merged[key] = value;
                        }
                    } else {
                        merged[key] = value;
                    }
                });
            }
        });

        return merged;
    }

    /**
     * Inject @keyframes into document
     * @param {Object} keyframes
     * @param {string} name
     */
    injectKeyframes(keyframes, name) {
        if (this.injectedKeyframes.has(name)) return;

        if (!this.styleElement) {
            this.styleElement = document.createElement('style');
            this.styleElement.id = 'cas-animations';
            document.head.appendChild(this.styleElement);
        }

        const rules = keyframes.rules.map(rule => {
            const percentage = Math.round(rule.offset * 100);
            const styles = Object.entries(rule.style)
                .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
                .join('; ');
            return `${percentage}% { ${styles} }`;
        }).join('\n  ');

        const cssRule = `@keyframes ${name} {\n  ${rules}\n}`;
        this.styleElement.textContent += '\n' + cssRule;
        this.injectedKeyframes.add(name);
    }

    /**
     * Remove all injected styles
     */
    cleanup() {
        if (this.styleElement) {
            this.styleElement.remove();
            this.styleElement = null;
        }
        this.injectedKeyframes.clear();
    }

    /**
     * Pause animation on element
     * @param {HTMLElement} element
     */
    pause(element) {
        if (element) {
            element.style.animationPlayState = 'paused';
        }
    }

    /**
     * Resume animation on element
     * @param {HTMLElement} element
     */
    resume(element) {
        if (element) {
            element.style.animationPlayState = 'running';
        }
    }

    /**
     * Cancel animation on element
     * @param {HTMLElement} element
     */
    cancel(element) {
        if (element) {
            element.style.animationName = 'none';
        }
    }
}

export default AnimationCSSRenderer;
