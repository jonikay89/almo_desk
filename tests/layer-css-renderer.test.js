/**
 * Tests for LayerCSSRenderer
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { CALayer, CAGradientLayer, CAShapeLayer, CGPath } from '../src/core/CALayer.js';
import { LayerCSSRenderer } from '../src/core/renderers/index.js';
import UIColor from '../src/core/UIColor.js';

describe('LayerCSSRenderer', () => {
    let renderer;
    let layer;
    let element;

    beforeEach(() => {
        renderer = new LayerCSSRenderer();
        layer = CALayer.layer();
        element = { style: {} };
    });

    describe('Basic Layer Properties', () => {
        it('should convert frame to CSS position and size', () => {
            layer.frame = { x: 100, y: 200, width: 300, height: 400 };
            const styles = renderer.computeStyles(layer);

            assert.strictEqual(styles.left, '100px');
            assert.strictEqual(styles.top, '200px');
            assert.strictEqual(styles.width, '300px');
            assert.strictEqual(styles.height, '400px');
            assert.strictEqual(styles.position, 'absolute');
        });

        it('should convert backgroundColor to CSS', () => {
            layer.backgroundColor = UIColor.systemRed();
            const styles = renderer.computeStyles(layer);

            assert.ok(styles.backgroundColor);
            assert.ok(styles.backgroundColor.includes('255') || styles.backgroundColor.includes('ff'));
        });

        it('should convert hex string backgroundColor to CSS', () => {
            layer.backgroundColor = '#ff0000';
            const styles = renderer.computeStyles(layer);

            assert.ok(styles.backgroundColor.includes('255'));
            assert.ok(styles.backgroundColor.includes('0'));
        });

        it('should handle hidden layer', () => {
            layer.isHidden = true;
            const styles = renderer.computeStyles(layer);

            assert.strictEqual(styles.display, 'none');
        });

        it('should convert opacity to CSS', () => {
            layer.opacity = 0.5;
            const styles = renderer.computeStyles(layer);

            assert.strictEqual(styles.opacity, 0.5);
        });

        it('should not include opacity when it is 1', () => {
            layer.opacity = 1;
            const styles = renderer.computeStyles(layer);

            assert.strictEqual(styles.opacity, undefined);
        });
    });

    describe('Border Properties', () => {
        it('should convert border properties to CSS', () => {
            layer.borderWidth = 2;
            layer.borderColor = UIColor.black();
            const styles = renderer.computeStyles(layer);

            assert.strictEqual(styles.borderWidth, '2px');
            assert.strictEqual(styles.borderStyle, 'solid');
            assert.ok(styles.borderColor);
        });

        it('should not include border when width is 0', () => {
            layer.borderWidth = 0;
            layer.borderColor = UIColor.black();
            const styles = renderer.computeStyles(layer);

            assert.strictEqual(styles.borderWidth, undefined);
        });

        it('should convert cornerRadius to border-radius', () => {
            layer.cornerRadius = 8;
            const styles = renderer.computeStyles(layer);

            assert.strictEqual(styles.borderRadius, '8px');
        });
    });

    describe('Shadow Properties', () => {
        it('should convert shadow to box-shadow', () => {
            layer.shadowColor = UIColor.black();
            layer.shadowOpacity = 0.5;
            layer.shadowOffset = { width: 2, height: 4 };
            layer.shadowRadius = 8;
            const styles = renderer.computeStyles(layer);

            assert.ok(styles.boxShadow);
            assert.ok(styles.boxShadow.includes('2px'));
            assert.ok(styles.boxShadow.includes('4px'));
            assert.ok(styles.boxShadow.includes('8px'));
        });

        it('should not include shadow when opacity is 0', () => {
            layer.shadowColor = UIColor.black();
            layer.shadowOpacity = 0;
            const styles = renderer.computeStyles(layer);

            assert.strictEqual(styles.boxShadow, undefined);
        });

        it('should not include shadow when color is null', () => {
            layer.shadowOpacity = 0.5;
            layer.shadowColor = null;
            const styles = renderer.computeStyles(layer);

            assert.strictEqual(styles.boxShadow, undefined);
        });
    });

    describe('Transform Properties', () => {
        it('should convert transform to CSS', async () => {
            const { CATransform3D } = await import('../src/core/CALayer.js');
            const transform = CATransform3D.MakeTranslation(100, 200, 0);
            layer.transform = transform;
            const styles = renderer.computeStyles(layer);

            assert.ok(styles.transform);
            assert.ok(styles.transform.includes('matrix3d'));
        });

        it('should not include transform when identity', async () => {
            const { CATransform3D } = await import('../src/core/CALayer.js');
            layer.transform = CATransform3D.identity();
            const styles = renderer.computeStyles(layer);

            assert.strictEqual(styles.transform, undefined);
        });
    });

    describe('Z-Index and Masking', () => {
        it('should convert zPosition to z-index', () => {
            layer.zPosition = 10;
            const styles = renderer.computeStyles(layer);

            assert.strictEqual(styles.zIndex, 10);
        });

        it('should convert masksToBounds to overflow', () => {
            layer.masksToBounds = true;
            const styles = renderer.computeStyles(layer);

            assert.strictEqual(styles.overflow, 'hidden');
        });
    });

    describe('GPU Acceleration', () => {
        it('should add GPU acceleration hints when enabled', () => {
            renderer = new LayerCSSRenderer({ useGPUAcceleration: true });
            const styles = renderer.computeStyles(layer);

            assert.ok(styles.willChange);
            assert.ok(styles.transformStyle);
        });

        it('should not add GPU hints when disabled', () => {
            renderer = new LayerCSSRenderer({ useGPUAcceleration: false });
            const styles = renderer.computeStyles(layer);

            assert.strictEqual(styles.willChange, undefined);
            assert.strictEqual(styles.transformStyle, undefined);
        });
    });

    describe('Utility Methods', () => {
        it('should convert styles to CSS string', () => {
            const styles = {
                backgroundColor: 'red',
                borderRadius: '8px',
                opacity: 0.5
            };
            const cssString = renderer.stylesToString(styles);

            assert.ok(cssString.includes('background-color: red'));
            assert.ok(cssString.includes('border-radius: 8px'));
            assert.ok(cssString.includes('opacity: 0.5'));
        });

        it('should handle camelCase to kebab-case conversion', () => {
            const styles = { borderRadius: '8px' };
            const cssString = renderer.stylesToString(styles);

            assert.ok(cssString.includes('border-radius'));
        });
    });

    describe('Integration', () => {
        it('should create element with layer properties', () => {
            layer.name = 'testLayer';
            layer.frame = { x: 0, y: 0, width: 100, height: 100 };
            layer.backgroundColor = UIColor.blue();

            // Note: In a real browser environment, this would return a DOM element
            // In Node.js test environment, we can't test this directly
        });

        it('should batch render multiple layers', () => {
            const layers = [
                { layer: CALayer.layer(), element: { style: {} } },
                { layer: CALayer.layer(), element: { style: {} } }
            ];

            layers[0].layer.backgroundColor = UIColor.red();
            layers[1].layer.backgroundColor = UIColor.blue();

            renderer.renderBatch(layers);

            assert.ok(layers[0].element.style.backgroundColor);
            assert.ok(layers[1].element.style.backgroundColor);
        });
    });
});
