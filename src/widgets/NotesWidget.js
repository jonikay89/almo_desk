import WidgetView from './WidgetView.js';

class NotesWidget extends WidgetView {
    constructor(extraData, windowController) {
        super(extraData);
        this.windowController = windowController;
        this.textareaElement = null;
    }

    createView() {
        const container = document.createElement('div');
        container.className = 'widget-notes';
        
        this.textareaElement = document.createElement('textarea');
        this.textareaElement.className = 'notes-textarea';
        this.textareaElement.rows = 10;
        this.textareaElement.placeholder = 'Write your notes here...';
        this.textareaElement.value = this.extraData.notesText || '';
        
        this.textareaElement.addEventListener('input', (e) => {
            this.extraData.notesText = e.target.value;
            this.windowController?.os?.saveDebounced();
        });
        
        container.appendChild(this.textareaElement);
        
        return container;
    }

    layoutSubviews() {
        super.layoutSubviews();
        if (this.textareaElement) {
            this.textareaElement.style.width = '100%';
            this.textareaElement.style.height = '100%';
        }
    }
}

export default NotesWidget;
