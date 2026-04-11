import BaseWidget from './BaseWidget.js';

class CustomHtmlWidget extends BaseWidget {
    createElement() {
        const container = document.createElement('div');
        container.className = 'widget-custom-html';
        
        const editor = document.createElement('textarea');
        editor.className = 'html-editor';
        editor.value = this.extraData.htmlContent || '<h3>Custom Widget</h3><p>Your HTML here</p>';
        
        const preview = document.createElement('div');
        preview.className = 'html-preview';
        
        const updatePreview = () => {
            this.extraData.htmlContent = editor.value;
            preview.innerHTML = editor.value;
            this.os.saveDebounced();
        };
        
        editor.addEventListener('input', updatePreview);
        updatePreview();
        
        container.appendChild(editor);
        container.appendChild(preview);
        
        return container;
    }
}

export default CustomHtmlWidget;
