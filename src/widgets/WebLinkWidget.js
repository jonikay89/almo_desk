import WidgetView from './WidgetView.js';
import { sanitizeUrl } from '../utils/index.js';

class WebLinkWidget extends WidgetView {
    constructor(extraData, windowController) {
        super(extraData);
        this.windowController = windowController;
        this.iframeElement = null;
    }

    createView() {
        const container = document.createElement('div');
        container.className = 'widget-weblink';
        
        const url = sanitizeUrl(this.extraData.url);
        
        this.iframeElement = document.createElement('iframe');
        this.iframeElement.src = url;
        this.iframeElement.className = 'weblink-iframe';
        this.iframeElement.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
        
        const linkContainer = document.createElement('div');
        linkContainer.className = 'weblink-footer';
        
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Open in new tab ↗';
        
        linkContainer.appendChild(link);
        
        container.appendChild(this.iframeElement);
        container.appendChild(linkContainer);
        
        return container;
    }

    layoutSubviews() {
        super.layoutSubviews();
        if (this.iframeElement) {
            this.iframeElement.style.flex = '1';
        }
    }
}

export default WebLinkWidget;
