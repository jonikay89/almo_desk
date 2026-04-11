import BaseWidget from './BaseWidget.js';

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

class CodeEditorWidget extends BaseWidget {
    createElement() {
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
        
        const textarea = document.createElement('textarea');
        textarea.className = 'code-input';
        textarea.spellcheck = false;
        textarea.value = this.extraData.codeContent || DEFAULT_CODE;
        
        const previewArea = document.createElement('div');
        previewArea.className = 'preview-area';
        
        const iframe = document.createElement('iframe');
        iframe.className = 'preview-frame';
        iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-modals');
        
        previewArea.appendChild(iframe);
        
        container.appendChild(toolbar);
        container.appendChild(textarea);
        container.appendChild(previewArea);
        
        const updatePreview = () => {
            this.extraData.codeContent = textarea.value;
            this.updateIframe(iframe, textarea.value);
            this.os.saveDebounced();
        };
        
        this.updateIframe(iframe, textarea.value);
        textarea.addEventListener('input', updatePreview);
        
        return container;
    }
    
    updateIframe(iframe, code) {
        try {
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            doc.open();
            doc.write(code);
            doc.close();
        } catch {}
    }
}

export default CodeEditorWidget;
