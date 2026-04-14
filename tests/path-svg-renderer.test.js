/**
 * Tests for PathSVGRenderer
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { CGPath, CAShapeLayer } from '../src/core/CALayer.js';
import { PathSVGRenderer } from '../src/core/renderers/index.js';
import UIColor from '../src/core/UIColor.js';

describe('PathSVGRenderer', () => {
    let renderer;

    beforeEach(() => {
        renderer = new PathSVGRenderer();
    });

    describe('CGPath to SVG Conversion', () => {
        it('should convert move command to SVG M', () => {
            const path = CGPath.Create();
            path.moveToPoint(10, 20);
            const svg = renderer.renderToSVG(path);

            assert.ok(svg.includes('M'));
            assert.ok(svg.includes('10'));
            assert.ok(svg.includes('20'));
        });

        it('should convert line command to SVG L', () => {
            const path = CGPath.Create();
            path.moveToPoint(0, 0);
            path.addLineToPoint(100, 100);
            const svg = renderer.renderToSVG(path);

            assert.ok(svg.includes('M'));
            assert.ok(svg.includes('L'));
        });

        it('should convert close command to SVG Z', () => {
            const path = CGPath.Create();
            path.moveToPoint(0, 0);
            path.addLineToPoint(100, 0);
            path.closeSubpath();
            const svg = renderer.renderToSVG(path);

            assert.ok(svg.includes('Z'));
        });

        it('should convert rect to SVG path', () => {
            const path = CGPath.CreateRect(10, 20, 100, 50);
            const svg = renderer.renderToSVG(path);

            assert.ok(svg.includes('M'));
            assert.ok(svg.includes('L'));
            assert.ok(svg.includes('Z'));
        });

        it('should handle empty path', () => {
            const path = CGPath.Create();
            const svg = renderer.renderToSVG(path);

            assert.strictEqual(svg, '');
        });

        it('should respect precision option', () => {
            renderer = new PathSVGRenderer({ precision: 0 });
            const path = CGPath.Create();
            path.moveToPoint(10.567, 20.123);
            const svg = renderer.renderToSVG(path);

            assert.ok(svg.includes('M 11 20'));
        });
    });

    describe('CAShapeLayer Rendering', () => {
        it('should return null for shape layer without path', () => {
            const shapeLayer = CAShapeLayer.layer();
            const svg = renderer.renderShapeLayer(shapeLayer);

            assert.strictEqual(svg, null);
        });

        it('should convert path to SVG data', () => {
            const shapeLayer = CAShapeLayer.layer();
            shapeLayer.path = CGPath.CreateCircle(50, 50, 25);
            
            const pathData = renderer.renderToSVG(shapeLayer.path);
            assert.ok(pathData.length > 0);
        });
    });

    describe('Utility Methods', () => {
        it('should format numbers with precision', () => {
            assert.strictEqual(renderer.format(10.12345, 2), '10.12');
            assert.strictEqual(renderer.format(10.999, 0), '11');
        });

        it('should handle string colors', () => {
            const svgColor = renderer.colorToSVG('#ff0000');
            assert.strictEqual(svgColor, '#ff0000');
        });
    });
});
