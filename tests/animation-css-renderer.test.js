/**
 * Tests for AnimationCSSRenderer
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { 
    CABasicAnimation, 
    CAKeyframeAnimation,
    CASpringAnimation 
} from '../src/core/CALayer.js';
import { AnimationCSSRenderer } from '../src/core/renderers/index.js';

describe('AnimationCSSRenderer', () => {
    let renderer;

    beforeEach(() => {
        renderer = new AnimationCSSRenderer({ injectStyles: false });
    });

    describe('CABasicAnimation Conversion', () => {
        it('should convert basic animation config', () => {
            const anim = new CABasicAnimation('opacity', 0, 1);
            anim.duration = 0.5;
            
            const config = renderer.convertBasicAnimation(anim, 'test');

            assert.strictEqual(config.name, 'cas-anim-test');
            assert.strictEqual(config.style.animationDuration, '0.5s');
        });

        it('should convert opacity animation keyframes', () => {
            const anim = new CABasicAnimation('opacity', 0, 1);
            const config = renderer.convertBasicAnimation(anim, 'opacity-test');

            assert.ok(config.keyframes);
            assert.strictEqual(config.keyframes.rules[0].style.opacity, 0);
            assert.strictEqual(config.keyframes.rules[1].style.opacity, 1);
        });

        it('should handle infinite repeat', () => {
            const anim = new CABasicAnimation('opacity', 0, 1);
            anim.repeatCount = Infinity;
            const config = renderer.convertBasicAnimation(anim, 'infinite-test');

            assert.strictEqual(config.style.animationIterationCount, 'infinite');
        });
    });

    describe('Timing Functions', () => {
        it('should convert linear timing', () => {
            const result = renderer.convertTimingFunction('linear');
            assert.strictEqual(result, 'linear');
        });

        it('should convert easeIn timing', () => {
            const result = renderer.convertTimingFunction('easeIn');
            assert.strictEqual(result, 'ease-in');
        });

        it('should convert cubic bezier presets', () => {
            const result = renderer.convertTimingFunction('easeInQuad');
            assert.ok(result.includes('cubic-bezier'));
        });
    });

    describe('Spring Animation', () => {
        it('should convert spring to cubic-bezier', () => {
            const spring = new CASpringAnimation('position.x');
            spring.mass = 1;
            spring.stiffness = 100;
            spring.damping = 10;
            
            const bezier = renderer.springToCubicBezier(spring);
            
            assert.strictEqual(bezier.length, 4);
        });
    });

    describe('Value to CSS Conversion', () => {
        it('should convert position values', () => {
            const style = renderer.valueToCSS('position', { x: 100, y: 200 });
            
            assert.strictEqual(style.left, '100px');
            assert.strictEqual(style.top, '200px');
        });

        it('should convert corner radius', () => {
            const style = renderer.valueToCSS('cornerRadius', 8);
            
            assert.strictEqual(style.borderRadius, '8px');
        });
    });
});
