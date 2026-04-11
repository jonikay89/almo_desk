import BaseWidget from './BaseWidget.js';
import { sanitizeUrl } from '../utils/index.js';

class WebLinkWidget extends BaseWidget {
    createElement() {
        const container = document.createElement('div');
        container.className = 'widget-weblink';
        
        const url = sanitizeUrl(this.extraData.url);
        
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.className = 'weblink-iframe';
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
        
        const linkContainer = document.createElement('div');
        linkContainer.className = 'weblink-footer';
        
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Open in new tab ↗';
        
        linkContainer.appendChild(link);
        
        container.appendChild(iframe);
        container.appendChild(linkContainer);
        
        return container;
    }
}

export default WebLinkWidget;
