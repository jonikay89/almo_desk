import WidgetView from './WidgetView.js';

class CustomHtmlWidget extends WidgetView {
    constructor(extraData, windowController) {
        super(extraData);
        this.windowController = windowController;
        this.editorElement = null;
        this.previewElement = null;
    }

    createView() {
        const container = document.createElement('div');
        container.className = 'widget-custom-html';
        
        this.editorElement = document.createElement('textarea');
        this.editorElement.className = 'html-editor';
        this.editorElement.value = this.extraData.htmlContent || '<h3>Custom Widget</h3><p>Your HTML here</p>';
        
        this.previewElement = document.createElement('div');
        this.previewElement.className = 'html-preview';
        
        this.editorElement.addEventListener('input', () => {
            this.extraData.htmlContent = this.editorElement.value;
            this.previewElement.innerHTML = this.editorElement.value;
            this.windowController?.os?.saveDebounced();
        });
        
        this.previewElement.innerHTML = this.editorElement.value;
        
        container.appendChild(this.editorElement);
        container.appendChild(this.previewElement);
        
        return container;
    }

    layoutSubviews() {
        super.layoutSubviews();
    }
}

export default CustomHtmlWidget;
