import BaseWidget from './BaseWidget.js';

class NotesWidget extends BaseWidget {
    createElement() {
        const container = document.createElement('div');
        container.className = 'widget-notes';
        
        const textarea = document.createElement('textarea');
        textarea.className = 'notes-textarea';
        textarea.rows = 10;
        textarea.placeholder = 'Write your notes here...';
        textarea.value = this.extraData.notesText || '';
        
        textarea.addEventListener('input', (e) => {
            this.extraData.notesText = e.target.value;
            this.os.saveDebounced();
        });
        
        container.appendChild(textarea);
        return container;
    }
}

export default NotesWidget;
