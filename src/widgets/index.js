import ClockWidget from './ClockWidget.js';
import NotesWidget from './NotesWidget.js';
import CodeEditorWidget from './CodeEditorWidget.js';
import WebLinkWidget from './WebLinkWidget.js';
import CustomHtmlWidget from './CustomHtmlWidget.js';
import FormControlsDemo from './FormControlsDemo.js';

const WIDGET_CLASSES = {
    clock: ClockWidget,
    notes: NotesWidget,
    codeEditor: CodeEditorWidget,
    webLink: WebLinkWidget,
    customHtml: CustomHtmlWidget,
    formControlsDemo: FormControlsDemo,
};

class WidgetRegistry {
    static create(type, extraData, windowController) {
        const WidgetClass = WIDGET_CLASSES[type];
        if (!WidgetClass) {
            return new CustomHtmlWidget({ htmlContent: `<p>Unknown widget: ${type}</p>` }, windowController);
        }
        return new WidgetClass(extraData, windowController);
    }
    
    static getAvailableTypes() {
        return Object.keys(WIDGET_CLASSES);
    }
}

export default WidgetRegistry;
