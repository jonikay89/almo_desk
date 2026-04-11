architecture:
web_desk/
├── index.html              # Main entry point
├── server.js               # Dev server (node server.js)
├── package.json
├── src/
│   ├── index.js            # Bootstrap
│   ├── core/
│   │   ├── DesktopOS.js    # Main application
│   │   ├── Window.js       # Window class
│   │   └── index.js
│   ├── widgets/
│   │   ├── BaseWidget.js   # Base class
│   │   ├── ClockWidget.js
│   │   ├── NotesWidget.js
│   │   ├── CodeEditorWidget.js
│   │   ├── WebLinkWidget.js
│   │   ├── CustomHtmlWidget.js
│   │   └── index.js        # Registry
│   └── utils/
│       ├── dom.js          # DOM helpers
│       ├── storage.js      # localStorage wrapper
│       ├── sanitizer.js    # HTML/URL sanitization
│       └── index.js
└── styles/
    ├── main.css            # Imports all
    ├── base.css
    ├── desktop.css
    ├── window.css
    ├── taskbar.css
    └── widgets/
        ├── clock.css
        ├── notes.css
        ├── code-editor.css
        ├── weblink.css
        └── custom-html.css



Key improvements:
- Modular architecture - Each widget is its own class with clear separation
- Extensible - Add new widgets by creating a file in widgets/ and registering in index.js
- Clean utilities - Storage, sanitization, and DOM helpers are reusable
- Scoped styles - CSS is organized by component for easier maintenance
- TypeScript-ready - Can easily add .ts files and TypeScript config


how to run it:
npm run dev (or node server.js)

how to close it:
pkill -f "node server.js" 2>/dev/null; echo "done"

list all project files:
-type f \( -name "*.js" -o -name "*. css" -o -name "*.html" -o -name "*.json" \) | head 30

look at the code:
node server.js & sleep 2
curl -s http://localhost:3000 | head -20
example:
🚀 Server running at http://localhost:3000
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Web Desktop OS - JIT Code Studio</title>
    <link rel="stylesheet" href="./styles/main.css">
</head>
<body>
    <div class="web-desktop" id="webDesktop"></div>
    <div class="taskbar" id="taskbar"></div>
    <script type="module" src="./src/index.js"></script>
</body>
</html>




cd /Users/yonik/proj/web_desk && timeout 5 node server.js &
sleep 2
curl -s http://localhost:3000/styles/main.css | head -5
curl -s http://localhost:3000/src/index.js | head -5
pkill -f "node server.js" 2>/dev/null

run tests:
npm test