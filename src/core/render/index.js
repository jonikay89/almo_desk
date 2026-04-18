/**
 * CALayer Rendering System
 * 
 * Architecture: CALayer (data) → CALayerRenderer (output) → DOM
 */

export { default as CALayerRenderer } from './CALayerRenderer.js';

import CALayerRenderer from './CALayerRenderer.js';

export function getRenderer() {
    return CALayerRenderer.getShared();
}

export function renderLayer(layer, container) {
    return CALayerRenderer.getShared().render(layer, container);
}

export function updateLayer(layer) {
    return CALayerRenderer.getShared().scheduleUpdate(layer);
}

export function removeLayer(layer) {
    return CALayerRenderer.getShared().remove(layer);
}
