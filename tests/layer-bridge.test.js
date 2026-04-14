/**
 * Tests for LayerBridge and ViewLayerBridge
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { CALayer, CAShapeLayer } from '../src/core/CALayer.js';
import { LayerBridge, ViewLayerBridge, bridgeLayerTree, bridgeView } from '../src/core/bridge/index.js';

describe('LayerBridge', () => {
    let layer;
    let bridge;

    beforeEach(() => {
        layer = CALayer.layer();
        layer.frame = { x: 0, y: 0, width: 100, height: 100 };
        bridge = new LayerBridge(layer, null, { autoSync: false });
    });

    it('should initialize with layer', () => {
        assert.strictEqual(bridge.layer, layer);
        assert.ok(bridge.cssRenderer);
        assert.ok(bridge.svgRenderer);
    });

    it('should sync layer properties to styles', () => {
        layer.backgroundColor = { css: 'rgb(255, 0, 0)' };
        layer.opacity = 0.5;
        
        const styles = bridge.cssRenderer.computeStyles(layer);
        
        assert.strictEqual(styles.opacity, 0.5);
    });

    it('should handle layer visibility', () => {
        layer.isHidden = true;
        const styles = bridge.cssRenderer.computeStyles(layer);
        
        assert.strictEqual(styles.display, 'none');
    });
});

describe('ViewLayerBridge', () => {
    it('should create with view-like object', () => {
        const mockView = {
            element: { style: {} },
            layer: CALayer.layer(),
            frame: { x: 0, y: 0, width: 100, height: 100 },
            layoutSubviews: () => {}
        };
        
        const bridge = new ViewLayerBridge(mockView);
        assert.strictEqual(bridge.view, mockView);
    });

    it('should sync frame to layer', () => {
        const mockView = {
            element: { style: {} },
            layer: CALayer.layer(),
            frame: { x: 10, y: 20, width: 200, height: 150 },
            bounds: { x: 0, y: 0, width: 200, height: 150 },
            layoutSubviews: () => {}
        };
        
        const bridge = new ViewLayerBridge(mockView);
        bridge.syncFrame();
        
        assert.strictEqual(mockView.layer.frame.x, 10);
        assert.strictEqual(mockView.layer.frame.y, 20);
        assert.strictEqual(mockView.layer.frame.width, 200);
        assert.strictEqual(mockView.layer.frame.height, 150);
    });

    it('should determine if canvas is needed', () => {
        const mockView = {
            element: { style: {} },
            layer: CALayer.layer(),
            frame: { x: 0, y: 0, width: 100, height: 100 },
            layoutSubviews: () => {}
        };
        
        const bridge = new ViewLayerBridge(mockView);
        
        // Without custom drawing, should not need canvas
        assert.strictEqual(bridge.shouldUseCanvas(), false);
    });
});

describe('Bridge Factory Functions', () => {
    it('should create bridge for layer', () => {
        const layer = CALayer.layer();
        const bridge = new LayerBridge(layer);
        
        assert.ok(bridge instanceof LayerBridge);
    });

    it('should create bridge for view', () => {
        const mockView = {
            element: { style: {} },
            layer: CALayer.layer(),
            frame: { x: 0, y: 0, width: 100, height: 100 },
            layoutSubviews: () => {}
        };
        
        const bridge = new ViewLayerBridge(mockView);
        
        assert.ok(bridge instanceof ViewLayerBridge);
    });
});

describe('BridgeManager', () => {
    it('should track registered bridges', async () => {
        const { bridgeManager } = await import('../src/core/bridge/index.js');
        
        const layer = CALayer.layer();
        const bridge = new LayerBridge(layer);
        
        bridgeManager.register(bridge);
        
        assert.strictEqual(bridgeManager.getCount(), 1);
        
        bridgeManager.unregister(bridge);
        
        assert.strictEqual(bridgeManager.getCount(), 0);
    });
});
