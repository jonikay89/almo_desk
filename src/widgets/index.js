import ClockWidget from './ClockWidget.js';
import NotesWidget from './NotesWidget.js';
import CodeEditorWidget from './CodeEditorWidget.js';
import WebLinkWidget from './WebLinkWidget.js';
import CustomHtmlWidget from './CustomHtmlWidget.js';

const WIDGETS = {
    clock: ClockWidget,
    notes: NotesWidget,
    codeEditor: CodeEditorWidget,
    webLink: WebLinkWidget,
    customHtml: CustomHtmlWidget,
};

class WidgetRegistry {
    static create(type, extraData, os) {
        const WidgetClass = WIDGETS[type];
        if (!WidgetClass) {
            return new CustomHtmlWidget(os, { htmlContent: `<p>Unknown widget: ${type}</p>` }).createElement();
        }
        return new WidgetClass(os, extraData).createElement();
    }
    
    static getAvailableTypes() {
        return Object.keys(WIDGETS);
    }
}

export default WidgetRegistry;
