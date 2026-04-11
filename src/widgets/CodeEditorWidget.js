import WidgetView from './WidgetView.js';

const DEFAULT_CODE = `<!DOCTYPE html>
<html>
<head>
<style>
    body { font-family: sans-serif; padding: 20px; background: #eef2ff; }
    button { background: #2273e0; border: none; padding: 10px 24px; border-radius: 8px; color: white; cursor: pointer; font-size: 16px; }
    button:hover { background: #1a5fc7; }
</style>
</head>
<body>
    <h2>JIT Live Editor</h2>
    <p>Edit the code on the left and see changes instantly!</p>
    <button id="btn">Click Me</button>
    <p id="msg"></p>
    <script>
        document.getElementById('btn').addEventListener('click', () => {
            document.getElementById('msg').textContent = 'Updated: ' + new Date().toLocaleTimeString();
        });
    </script>
</body>
</html>`;

class CodeEditorWidget extends WidgetView {
    constructor(extraData, windowController) {
        super(extraData);
        this.windowController = windowController;
        this.codeContent = this.extraData.codeContent || DEFAULT_CODE;
        this.textareaElement = null;
        this.iframeElement = null;
    }

    createView() {
        const container = document.createElement('div');
        container.className = 'widget-code-editor';
        
        const toolbar = document.createElement('div');
        toolbar.className = 'editor-toolbar';
        
        const badge = document.createElement('span');
        badge.className = 'jit-badge';
        badge.textContent = 'JIT LIVE PREVIEW';
        
        const langLabel = document.createElement('span');
        langLabel.textContent = 'HTML / CSS / JS';
        
        toolbar.appendChild(badge);
        toolbar.appendChild(langLabel);
        
        this.textareaElement = document.createElement('textarea');
        this.textareaElement.className = 'code-input';
        this.textareaElement.spellcheck = false;
        this.textareaElement.value = this.codeContent;
        
        const previewArea = document.createElement('div');
        previewArea.className = 'preview-area';
        
        this.iframeElement = document.createElement('iframe');
        this.iframeElement.className = 'preview-frame';
        this.iframeElement.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-modals');
        
        previewArea.appendChild(this.iframeElement);
        
        container.appendChild(toolbar);
        container.appendChild(this.textareaElement);
        container.appendChild(previewArea);
        
        return container;
    }

    viewDidLoad() {
        this.#updatePreview();
        
        this.textareaElement.addEventListener('input', () => {
            this.codeContent = this.textareaElement.value;
            this.extraData.codeContent = this.codeContent;
            this.#updatePreview();
            this.windowController?.os?.saveDebounced();
        });
    }

    #updatePreview() {
        try {
            const doc = this.iframeElement.contentDocument || this.iframeElement.contentWindow.document;
            doc.open();
            doc.write(this.codeContent);
            doc.close();
        } catch {}
    }

    layoutSubviews() {
        super.layoutSubviews();
    }
}

export default CodeEditorWidget;
