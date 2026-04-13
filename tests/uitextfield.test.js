/**
 * UITextField Test Suite
 * Tests for the UITextField class
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

const mockDocument = {
    createElement: (tag) => {
        const listeners = {};
        const element = {
            tagName: tag.toUpperCase(),
            style: {},
            className: '',
            placeholder: '',
            value: '',
            type: 'text',
            disabled: false,
            children: [],
            parentNode: null,
            appendChild: (child) => {
                element.children.push(child);
                child.parentNode = element;
            },
            removeChild: (child) => {
                const idx = element.children.indexOf(child);
                if (idx >= 0) element.children.splice(idx, 1);
            },
            contains: (el) => element.children.includes(el),
            addEventListener: (event, callback) => {
                if (!listeners[event]) listeners[event] = [];
                listeners[event].push(callback);
            },
            removeEventListener: (event, callback) => {
                if (listeners[event]) {
                    const idx = listeners[event].indexOf(callback);
                    if (idx >= 0) listeners[event].splice(idx, 1);
                }
            },
            dispatchEvent: (event) => {
                const callbacks = listeners[event.type] || [];
                callbacks.forEach(cb => cb(event));
                return true;
            },
            getAttribute: () => null,
            setAttribute: () => {},
            focus: () => {
                const focusEvent = new MockFocusEvent('focus');
                element.dispatchEvent(focusEvent);
            },
            blur: () => {
                const blurEvent = new MockFocusEvent('blur');
                element.dispatchEvent(blurEvent);
            },
            focusEvent: null,
            blurEvent: null
        };
        return element;
    }
};

global.document = mockDocument;
global.HTMLElement = class HTMLElement {};

class MockEvent {
    constructor(type) {
        this.type = type;
    }
}

class MockFocusEvent extends MockEvent {
    constructor(type) {
        super(type);
    }
}

class MockKeyboardEvent extends MockEvent {
    constructor(type, options = {}) {
        super(type);
        this.key = options.key || '';
    }
}

global.Event = MockEvent;
global.FocusEvent = MockFocusEvent;
global.KeyboardEvent = MockKeyboardEvent;

class UIColor {
    constructor(r = 0, g = 0, b = 0, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    static white() { return new UIColor(1, 1, 1, 1); }
    static black() { return new UIColor(0, 0, 0, 1); }
}

class CALayer {
    constructor() {
        this._bounds = { x: 0, y: 0, width: 0, height: 0 };
    }
    get bounds() { return this._bounds; }
    set bounds(v) { this._bounds = v; }
    get delegate() { return this._delegate; }
    set delegate(v) { this._delegate = v; }
    addSublayer(layer) {}
    removeSublayer(layer) {}
}

class UIControl {
    constructor() {
        this.enabled = true;
        this.selected = false;
        this.highlighted = false;
        this.element = null;
        this._targetActions = [];
    }

    init() {
        if (!this.element) {
            this.element = document.createElement('div');
        }
        this.element.className = 'ui-control';
        return this;
    }

    addTarget(target, action, event) {
        this._targetActions.push({ target, action, event });
    }

    removeTarget(target, action, event) {
        this._targetActions = this._targetActions.filter(
            ta => !(ta.target === target && ta.action === action && ta.event === event)
        );
    }

    sendAction(action, event) {
        this._targetActions
            .filter(ta => ta.event === event || ta.event === 'all')
            .forEach(ta => {
                if (typeof ta.action === 'function') {
                    ta.action.call(ta.target, this);
                } else if (typeof ta.action === 'string') {
                    ta.target[ta.action].call(ta.target, this);
                }
            });
    }
}

class UITextField extends UIControl {
    constructor(placeholder = '') {
        super();
        this.placeholder = placeholder;
        this.text = '';
        this._textColor = UIColor.black();
        this.fontSize = 14;
        this.fontFamily = 'system-ui, sans-serif';
        this.textAlignment = 'left';
        this.isSecureTextEntry = false;
        this.keyboardType = 'default';
        this.isEditing = false;
        this.clearButtonMode = 'never';
        this.borderStyle = 'rounded';
        this._borderLayer = null;
        this._selectionLayer = null;
        this._cursorLayer = null;
        this._accessibilityTraits = ['textField'];
    }

    get textColor() {
        return this._textColor;
    }

    set textColor(color) {
        this._textColor = color;
    }

    init() {
        super.init();
        this.element.className = 'ui-textfield';
        this.element.style.boxSizing = 'border-box';
        this.element.style.display = 'block';
        this.element.style.padding = '0';
        this.element.style.margin = '0';

        this.inputElement = document.createElement('input');
        this.inputElement.type = this.isSecureTextEntry ? 'password' : 'text';
        this.inputElement.placeholder = this.placeholder;
        this.inputElement.style.boxSizing = 'border-box';
        this.inputElement.style.width = '100%';
        this.inputElement.style.height = '100%';
        this.inputElement.style.margin = '0';
        this.inputElement.style.padding = '0 12px';
        this.inputElement.style.border = 'none';
        this.inputElement.style.outline = 'none';
        this.inputElement.style.background = 'transparent';
        this.inputElement.style.lineHeight = 'normal';
        this.inputElement.style.verticalAlign = 'middle';
        this.inputElement.style.minHeight = '0';
        this.inputElement.style.minWidth = '0';
        this.inputElement.style.fontSize = `${this.fontSize}px`;
        this.inputElement.style.fontFamily = this.fontFamily;
        this.inputElement.style.color = '#000';

        this.element.appendChild(this.inputElement);

        this.#applyBorderStyle();
        this.#setupEventListeners();

        return this;
    }

    #applyBorderStyle() {
        const styles = {
            rounded: 'border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box;',
            square: 'border: 1px solid #ccc; border-radius: 0; box-sizing: border-box;',
            line: 'border: none; border-bottom: 1px solid #ccc; border-radius: 0; box-sizing: border-box;',
            none: 'border: none; box-sizing: border-box;'
        };
        const style = styles[this.borderStyle] || styles.rounded;
        this.element.style.cssText += ';' + style;
    }

    #setupEventListeners() {
        this.inputElement.addEventListener('focus', () => {
            this.isEditing = true;
            this.sendAction('editingDidBegin', 'focus');
        });

        this.inputElement.addEventListener('blur', () => {
            this.isEditing = false;
            this.sendAction('editingDidEnd', 'blur');
        });

        this.inputElement.addEventListener('input', () => {
            this.text = this.inputElement.value;
            this.sendAction('editingChanged', 'input');
        });

        this.inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.sendAction('editingDidEndOnExit', 'keydown');
            }
        });
    }

    setText(text) {
        this.text = text;
        if (this.inputElement) {
            this.inputElement.value = text;
        }
        return this;
    }

    getText() {
        return this.inputElement ? this.inputElement.value : this.text;
    }

    setPlaceholder(text) {
        this.placeholder = text;
        if (this.inputElement) {
            this.inputElement.placeholder = text;
        }
        return this;
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (this.inputElement) {
            this.inputElement.disabled = !enabled;
        }
        return this;
    }

    setTextColor(color) {
        this.textColor = color;
        if (this.inputElement) {
            this.inputElement.style.color = '#000';
        }
        return this;
    }

    setFontSize(size) {
        this.fontSize = size;
        if (this.inputElement) {
            this.inputElement.style.fontSize = `${size}px`;
        }
        return this;
    }

    setBorderStyle(style) {
        this.borderStyle = style;
        this.#applyBorderStyle();
        return this;
    }

    setKeyboardType(type) {
        this.keyboardType = type;
        return this;
    }

    setSecureTextEntry(secure) {
        this.isSecureTextEntry = secure;
        if (this.inputElement) {
            this.inputElement.type = secure ? 'password' : 'text';
        }
        return this;
    }

    setClearButtonMode(mode) {
        this.clearButtonMode = mode;
        return this;
    }

    clear() {
        this.setText('');
        return this;
    }

    becomeFirstResponder() {
        if (this.inputElement) {
            this.inputElement.focus();
        }
        return true;
    }

    resignFirstResponder() {
        if (this.inputElement) {
            this.inputElement.blur();
        }
        return true;
    }

    setFrame(x, y, width, height) {
        this._frame = { x, y, width, height };
        this._bounds = { x: 0, y: 0, width, height };
        if (this.element) {
            this.element.style.left = `${x}px`;
            this.element.style.top = `${y}px`;
            this.element.style.width = `${width}px`;
            this.element.style.height = `${height}px`;
        }
        return this;
    }

    get frame() {
        return this._frame || { x: 0, y: 0, width: 0, height: 0 };
    }

    get bounds() {
        return this._bounds || { x: 0, y: 0, width: 0, height: 0 };
    }
}

describe('UITextField', () => {
    let textField;

    beforeEach(() => {
        textField = new UITextField('Enter name');
    });

    describe('Initialization', () => {
        it('should initialize with placeholder', () => {
            assert.strictEqual(textField.placeholder, 'Enter name');
        });

        it('should initialize with empty text', () => {
            assert.strictEqual(textField.text, '');
        });

        it('should initialize with default values', () => {
            assert.strictEqual(textField.fontSize, 14);
            assert.strictEqual(textField.fontFamily, 'system-ui, sans-serif');
            assert.strictEqual(textField.textAlignment, 'left');
            assert.strictEqual(textField.isSecureTextEntry, false);
            assert.strictEqual(textField.keyboardType, 'default');
            assert.strictEqual(textField.isEditing, false);
            assert.strictEqual(textField.borderStyle, 'rounded');
            assert.strictEqual(textField.clearButtonMode, 'never');
        });

        it('should initialize without placeholder', () => {
            const tf = new UITextField();
            assert.strictEqual(tf.placeholder, '');
        });

        it('should init and create input element', () => {
            textField.init();
            assert.ok(textField.element !== null);
            assert.ok(textField.element !== undefined);
            assert.ok(textField.inputElement !== null);
            assert.ok(textField.inputElement !== undefined);
        });
    });

    describe('Text Operations', () => {
        it('should set text', () => {
            textField.init();
            textField.setText('Hello');
            assert.strictEqual(textField.getText(), 'Hello');
        });

        it('should get text from input', () => {
            textField.init();
            textField.inputElement.value = 'World';
            assert.strictEqual(textField.getText(), 'World');
        });

        it('should clear text', () => {
            textField.init();
            textField.setText('Hello');
            textField.clear();
            assert.strictEqual(textField.getText(), '');
        });

        it('should set placeholder', () => {
            textField.init();
            textField.setPlaceholder('New placeholder');
            assert.strictEqual(textField.placeholder, 'New placeholder');
            assert.strictEqual(textField.inputElement.placeholder, 'New placeholder');
        });

        it('should update text via input event', () => {
            textField.init();
            textField.inputElement.value = 'Input text';
            textField.inputElement.dispatchEvent(new Event('input'));
            assert.strictEqual(textField.text, 'Input text');
        });
    });

    describe('Styling', () => {
        it('should set text color', () => {
            textField.init();
            textField.setTextColor(UIColor.white());
            assert.strictEqual(textField.textColor instanceof UIColor, true);
        });

        it('should set font size', () => {
            textField.init();
            textField.setFontSize(18);
            assert.strictEqual(textField.fontSize, 18);
            assert.strictEqual(textField.inputElement.style.fontSize, '18px');
        });

        it('should set border style', () => {
            textField.init();
            textField.setBorderStyle('line');
            assert.strictEqual(textField.borderStyle, 'line');
        });

        it('should chain setTextColor', () => {
            textField.init();
            const result = textField.setTextColor(UIColor.white());
            assert.strictEqual(result, textField);
        });

        it('should chain setFontSize', () => {
            textField.init();
            const result = textField.setFontSize(16);
            assert.strictEqual(result, textField);
        });

        it('should chain setBorderStyle', () => {
            textField.init();
            const result = textField.setBorderStyle('square');
            assert.strictEqual(result, textField);
        });
    });

    describe('Security', () => {
        it('should set secure text entry', () => {
            textField.init();
            textField.setSecureTextEntry(true);
            assert.strictEqual(textField.isSecureTextEntry, true);
            assert.strictEqual(textField.inputElement.type, 'password');
        });

        it('should disable secure text entry', () => {
            textField.init();
            textField.setSecureTextEntry(false);
            assert.strictEqual(textField.isSecureTextEntry, false);
            assert.strictEqual(textField.inputElement.type, 'text');
        });

        it('should set secure text entry on init', () => {
            const secureField = new UITextField('Password');
            secureField.isSecureTextEntry = true;
            secureField.init();
            assert.strictEqual(secureField.inputElement.type, 'password');
        });
    });

    describe('Keyboard', () => {
        it('should set keyboard type', () => {
            textField.setKeyboardType('emailAddress');
            assert.strictEqual(textField.keyboardType, 'emailAddress');
        });

        it('should set numeric keyboard', () => {
            textField.setKeyboardType('numberPad');
            assert.strictEqual(textField.keyboardType, 'numberPad');
        });
    });

    describe('Enabled State', () => {
        it('should set enabled state', () => {
            textField.init();
            textField.setEnabled(false);
            assert.strictEqual(textField.enabled, false);
            assert.strictEqual(textField.inputElement.disabled, true);
        });

        it('should set enabled true', () => {
            textField.init();
            textField.setEnabled(true);
            assert.strictEqual(textField.enabled, true);
            assert.strictEqual(textField.inputElement.disabled, false);
        });

        it('should chain setEnabled', () => {
            textField.init();
            const result = textField.setEnabled(false);
            assert.strictEqual(result, textField);
        });
    });

    describe('Clear Button', () => {
        it('should set clear button mode', () => {
            textField.setClearButtonMode('whileEditing');
            assert.strictEqual(textField.clearButtonMode, 'whileEditing');
        });

        it('should set clear button mode to never', () => {
            textField.setClearButtonMode('never');
            assert.strictEqual(textField.clearButtonMode, 'never');
        });
    });

    describe('Focus Management', () => {
        it('should become first responder', () => {
            textField.init();
            const result = textField.becomeFirstResponder();
            assert.strictEqual(result, true);
        });

        it('should resign first responder', () => {
            textField.init();
            const result = textField.resignFirstResponder();
            assert.strictEqual(result, true);
        });

        it('should track editing state on focus', () => {
            textField.init();
            textField.inputElement.dispatchEvent(new FocusEvent('focus'));
            assert.strictEqual(textField.isEditing, true);
        });

        it('should track editing state on blur', () => {
            textField.init();
            textField.isEditing = true;
            textField.inputElement.dispatchEvent(new FocusEvent('blur'));
            assert.strictEqual(textField.isEditing, false);
        });
    });

    describe('Frame and Bounds', () => {
        it('should set frame', () => {
            textField.init();
            textField.setFrame(10, 20, 200, 40);
            assert.strictEqual(textField.frame.x, 10);
            assert.strictEqual(textField.frame.y, 20);
            assert.strictEqual(textField.frame.width, 200);
            assert.strictEqual(textField.frame.height, 40);
        });

        it('should update element styles when frame changes', () => {
            textField.init();
            textField.setFrame(10, 20, 200, 40);
            assert.strictEqual(textField.element.style.left, '10px');
            assert.strictEqual(textField.element.style.top, '20px');
            assert.strictEqual(textField.element.style.width, '200px');
            assert.strictEqual(textField.element.style.height, '40px');
        });

        it('should get default frame', () => {
            textField.init();
            assert.deepStrictEqual(textField.frame, { x: 0, y: 0, width: 0, height: 0 });
        });

        it('should set bounds from frame', () => {
            textField.init();
            textField.setFrame(10, 20, 200, 40);
            assert.strictEqual(textField.bounds.width, 200);
            assert.strictEqual(textField.bounds.height, 40);
        });
    });

    describe('Target Action', () => {
        it('should send action on editing begin', () => {
            textField.init();
            let didBegin = false;
            textField.addTarget({
                handleAction: () => { didBegin = true; }
            }, 'handleAction', 'focus');
            textField.inputElement.focus();
            assert.strictEqual(didBegin, true);
        });

        it('should send action on editing end', () => {
            textField.init();
            let didEnd = false;
            textField.addTarget({
                handleAction: () => { didEnd = true; }
            }, 'handleAction', 'blur');
            textField.inputElement.blur();
            assert.strictEqual(didEnd, true);
        });

        it('should send action on text change', () => {
            textField.init();
            let didChange = false;
            textField.addTarget({
                handleAction: () => { didChange = true; }
            }, 'handleAction', 'input');
            textField.inputElement.value = 'changed';
            textField.inputElement.dispatchEvent(new Event('input'));
            assert.strictEqual(didChange, true);
        });

        it('should send action on return key', () => {
            textField.init();
            let didReturn = false;
            textField.addTarget({
                handleAction: () => { didReturn = true; }
            }, 'handleAction', 'keydown');
            textField.inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            assert.strictEqual(didReturn, true);
        });

        it('should remove target', () => {
            textField.init();
            let called = false;
            const target = { handleAction: () => { called = true; } };
            textField.addTarget(target, 'handleAction', 'focus');
            textField.removeTarget(target, 'handleAction', 'focus');
            textField.inputElement.focus();
            assert.strictEqual(called, false);
        });
    });

    describe('Chaining', () => {
        it('should chain multiple operations', () => {
            textField.init();
            const result = textField
                .setText('Chained')
                .setTextColor(UIColor.white())
                .setFontSize(16)
                .setBorderStyle('line')
                .setEnabled(true);
            assert.strictEqual(result, textField);
        });
    });

    describe('Element Structure', () => {
        it('should have correct container styles', () => {
            textField.init();
            assert.strictEqual(textField.element.className, 'ui-textfield');
        });

        it('should have input element inside container', () => {
            textField.init();
            assert.ok(textField.element.contains(textField.inputElement));
        });

        it('should have input with correct type', () => {
            textField.init();
            assert.strictEqual(textField.inputElement.type, 'text');
        });

        it('should have input with placeholder', () => {
            textField.init();
            assert.strictEqual(textField.inputElement.placeholder, 'Enter name');
        });
    });
});

describe('UITextField Frame Positioning', () => {
    it('should position text fields at correct Y offsets', () => {
        const container = { subviews: [] };
        const textFields = [];

        for (let i = 0; i < 3; i++) {
            const tf = new UITextField(`Field ${i}`);
            tf.init();
            tf.setFrame(0, i * 44, 260, 36);
            textFields.push(tf);
        }

        assert.strictEqual(textFields[0].frame.y, 0);
        assert.strictEqual(textFields[1].frame.y, 44);
        assert.strictEqual(textFields[2].frame.y, 88);
    });

    it('should calculate correct spacing with gaps', () => {
        const tf1 = new UITextField('First');
        tf1.init();
        tf1.setFrame(0, 0, 260, 36);

        const tf2 = new UITextField('Second');
        tf2.init();
        tf2.setFrame(0, 36 + 8, 260, 36); // 8px gap

        assert.strictEqual(tf2.frame.y, 44);
    });

    it('should fill container width', () => {
        const tf = new UITextField('Test');
        tf.init();
        tf.setFrame(10, 0, 280, 36);

        assert.strictEqual(tf.frame.width, 280);
        assert.strictEqual(tf.inputElement.style.width, '100%');
    });
});

describe('UITextField Border Styles', () => {
    it('should apply rounded border style', () => {
        const tf = new UITextField('Test');
        tf.init();
        tf.setBorderStyle('rounded');
        assert.ok(tf.element.style.cssText.includes('border-radius: 6px'));
    });

    it('should apply square border style', () => {
        const tf = new UITextField('Test');
        tf.init();
        tf.setBorderStyle('square');
        assert.ok(tf.element.style.cssText.includes('border-radius: 0'));
    });

    it('should apply line border style', () => {
        const tf = new UITextField('Test');
        tf.init();
        tf.setBorderStyle('line');
        assert.ok(tf.element.style.cssText.includes('border-bottom'));
    });

    it('should apply none border style', () => {
        const tf = new UITextField('Test');
        tf.init();
        tf.setBorderStyle('none');
        assert.ok(tf.element.style.cssText.includes('border: none'));
    });
});
