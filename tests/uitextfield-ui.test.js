/**
 * UITextField UI Test Suite
 * Tests for UITextField visual and layout behavior
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

const mockDocument = {
    createElement: (tag) => {
        const listeners = {};
        const element = {
            tagName: tag.toUpperCase(),
            style: { position: 'absolute' },
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
                const focusEvent = { type: 'focus' };
                element.dispatchEvent(focusEvent);
            },
            blur: () => {
                const blurEvent = { type: 'blur' };
                element.dispatchEvent(blurEvent);
            }
        };
        return element;
    }
};

global.document = mockDocument;

class UIColor {
    constructor(r = 0, g = 0, b = 0, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    static white() { return new UIColor(1, 1, 1, 1); }
    static black() { return new UIColor(0, 0, 0, 1); }
    static red() { return new UIColor(1, 0, 0, 1); }
    static blue() { return new UIColor(0, 0, 1, 1); }
    static green() { return new UIColor(0, 1, 0, 1); }
    static gray() { return new UIColor(0.5, 0.5, 0.5, 1); }
    static colorWithRedGreenBlueAlpha(r, g, b, a) {
        return new UIColor(r, g, b, a);
    }
    static colorWithHex(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? new UIColor(
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255,
            1
        ) : new UIColor(0, 0, 0, 1);
    }
    static systemBlue() { return new UIColor(0, 122/255, 1, 1); }
}

class CALayer {
    constructor() {
        this._bounds = { x: 0, y: 0, width: 0, height: 0 };
        this._delegate = null;
    }
    get bounds() { return this._bounds; }
    set bounds(v) { this._bounds = v; }
    get delegate() { return this._delegate; }
    set delegate(v) { this._delegate = v; }
    addSublayer(layer) {}
    removeSublayer(layer) {}
}

class UIView {
    constructor() {
        this.superview = null;
        this.window = null;
        this._frame = { x: 0, y: 0, width: 0, height: 0 };
        this._bounds = { x: 0, y: 0, width: 0, height: 0 };
        this._center = { x: 0, y: 0 };
        this._hidden = false;
        this._alpha = 1;
        this._clipsToBounds = false;
        this.tag = 0;
        this.subviews = [];
        this.element = document.createElement('div');
        this.element.style.position = 'absolute';
        this.zIndex = 0;
        this.translatesAutoresizingMaskIntoConstraints = true;
        this._backgroundColor = null;
        this._cornerRadius = 0;
        this._layer = new CALayer();
        this._layer.delegate = this;
    }

    get frame() { return this._frame; }
    set frame(value) {
        this._frame = { ...value };
        this._bounds = { x: 0, y: 0, width: value.width, height: value.height };
        this._center = { x: value.x + value.width / 2, y: value.y + value.height / 2 };
        this.layoutSubviews();
    }

    get bounds() { return this._bounds; }
    set bounds(value) { this._bounds = { ...value }; }

    get center() { return this._center; }
    set center(value) { this._center = { ...value }; }

    get backgroundColor() { return this._backgroundColor; }
    set backgroundColor(value) { this._backgroundColor = value; }

    get layer() { return this._layer; }

    setFrame(x, y, width, height) {
        this.frame = { x, y, width, height };
        return this;
    }

    layoutSubviews() {
        if (this.element) {
            this.element.style.left = `${this.frame.x}px`;
            this.element.style.top = `${this.frame.y}px`;
            this.element.style.width = `${this.frame.width}px`;
            this.element.style.height = `${this.frame.height}px`;
        }
    }

    addSubview(view) {
        if (view.removeFromSuperview) {
            view.removeFromSuperview();
        }
        view.superview = this;
        this.subviews.push(view);
        if (this.element && view.element) {
            this.element.appendChild(view.element);
        }
        if (view.didMoveToSuperview) {
            view.didMoveToSuperview();
        }
    }

    removeFromSuperview() {
        if (this.superview) {
            this.superview.subviews = this.superview.subviews.filter(v => v !== this);
            if (this.element && this.superview.element) {
                this.superview.element.removeChild(this.element);
            }
            this.superview = null;
        }
    }

    removeSubview(view) {
        const index = this.subviews.indexOf(view);
        if (index !== -1) {
            this.subviews.splice(index, 1);
            if (view.element && view.element.parentNode === this.element) {
                this.element.removeChild(view.element);
            }
            view.superview = null;
        }
    }

    setHidden(hidden) {
        this._hidden = hidden;
        if (this.element) {
            this.element.style.display = hidden ? 'none' : '';
        }
    }

    setAlpha(alpha) {
        this._alpha = alpha;
        if (this.element) {
            this.element.style.opacity = alpha;
        }
    }

    withBackgroundColor(color) {
        this.backgroundColor = color;
        return this;
    }

    withCornerRadius(radius) {
        this._cornerRadius = radius;
        if (this.element) {
            this.element.style.borderRadius = `${radius}px`;
        }
        return this;
    }

    didMoveToSuperview() {}
    willMoveToWindow(window) {}
    didMoveToWindow() {}

    init() {
        return this;
    }

    deinit() {
        for (const subview of this.subviews) {
            subview.deinit();
        }
        this.subviews = [];
        this.superview = null;
    }
}

class UILabel extends UIView {
    constructor(text = '') {
        super();
        this._text = text;
        this._fontSize = 14;
        this._fontWeight = 'normal';
        this._textColor = UIColor.black();
        this._numberOfLines = 1;
        this._textAlignment = 'left';
    }

    get text() { return this._text; }
    set text(value) { this._text = value; }

    get fontSize() { return this._fontSize; }
    set fontSize(value) { this._fontSize = value; }

    get fontWeight() { return this._fontWeight; }
    set fontWeight(value) { this._fontWeight = value; }

    get textColor() { return this._textColor; }
    set textColor(value) { this._textColor = value; }

    get numberOfLines() { return this._numberOfLines; }
    set numberOfLines(value) { this._numberOfLines = value; }

    get textAlignment() { return this._textAlignment; }
    set textAlignment(value) { this._textAlignment = value; }

    init() {
        super.init();
        this.element.className = 'ui-label';
        return this;
    }
}

class UITextField extends UIView {
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
        this._targetActions = [];
    }

    get textColor() { return this._textColor; }
    set textColor(color) { this._textColor = color; }

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
        this.applyBorderStyle();
        this.setupEventListeners();
        return this;
    }

    applyBorderStyle() {
        const styles = {
            rounded: { border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' },
            square: { border: '1px solid #ccc', borderRadius: '0', boxSizing: 'border-box' },
            line: { border: 'none', borderBottom: '1px solid #ccc', borderRadius: '0', boxSizing: 'border-box' },
            none: { border: 'none', boxSizing: 'border-box' }
        };
        const style = styles[this.borderStyle] || styles.rounded;
        Object.assign(this.element.style, style);
    }

    setupEventListeners() {
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

    setBorderStyle(style) {
        this.borderStyle = style;
        this.applyBorderStyle();
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

    clear() {
        this.setText('');
        return this;
    }
}

class UIButton extends UIView {
    constructor(title = '') {
        super();
        this.title = title;
        this._titleColor = UIColor.black();
        this.backgroundColor = UIColor.colorWithRedGreenBlueAlpha(240/255, 240/255, 240/255, 1);
        this.fontSize = 14;
        this._targetActions = [];
    }

    get titleColor() { return this._titleColor; }
    set titleColor(color) { this._titleColor = color; }

    init() {
        super.init();
        this.element.className = 'ui-button';
        return this;
    }

    setTitle(title) {
        this.title = title;
        return this;
    }

    setTitleColor(color) {
        this._titleColor = color;
        return this;
    }

    setBackgroundColor(color) {
        this.backgroundColor = color;
        return this;
    }

    addTarget(target, action, event) {
        this._targetActions.push({ target, action, event });
    }
}

class UISwitch extends UIView {
    constructor() {
        super();
        this._isOn = false;
        this._thumbTintColor = UIColor.white();
        this._onTintColor = UIColor.systemBlue();
    }

    get isOn() { return this._isOn; }
    set isOn(value) { this._isOn = value; }

    init() {
        super.init();
        this.element.className = 'ui-switch';
        return this;
    }

    setOn(on) {
        this._isOn = on;
        return this;
    }
}

class UISegmentedControl extends UIView {
    constructor(segments = []) {
        super();
        this._segments = segments;
        this._selectedIndex = 0;
    }

    get selectedSegmentIndex() { return this._selectedIndex; }
    set selectedSegmentIndex(value) { this._selectedIndex = value; }

    init() {
        super.init();
        this.element.className = 'ui-segmented-control';
        return this;
    }
}

describe('UITextField UI Positioning', () => {
    describe('Frame Positioning', () => {
        it('should position text fields at correct Y offsets', () => {
            const container = new UIView();
            container.init();
            container.setFrame(0, 0, 300, 200);

            const tf1 = new UITextField('Field 1');
            tf1.init();
            tf1.setFrame(0, 0, 260, 36);
            container.addSubview(tf1);

            const tf2 = new UITextField('Field 2');
            tf2.init();
            tf2.setFrame(0, 44, 260, 36);
            container.addSubview(tf2);

            const tf3 = new UITextField('Field 3');
            tf3.init();
            tf3.setFrame(0, 88, 260, 36);
            container.addSubview(tf3);

            assert.strictEqual(tf1.frame.y, 0);
            assert.strictEqual(tf2.frame.y, 44);
            assert.strictEqual(tf3.frame.y, 88);
        });

        it('should calculate gap correctly between fields', () => {
            const tf1 = new UITextField('Field 1');
            tf1.init();
            tf1.setFrame(0, 0, 260, 36);

            const tf2 = new UITextField('Field 2');
            tf2.init();
            tf2.setFrame(0, 44, 260, 36);

            const gap = tf2.frame.y - (tf1.frame.y + tf1.frame.height);
            assert.strictEqual(gap, 8);
        });

        it('should stack three fields with proper spacing', () => {
            const fields = [];

            for (let i = 0; i < 3; i++) {
                const tf = new UITextField(`Field ${i}`);
                tf.init();
                const yOffset = i * 44;
                tf.setFrame(0, yOffset, 260, 36);
                fields.push(tf);
            }

            assert.strictEqual(fields[0].frame.y, 0);
            assert.strictEqual(fields[1].frame.y, 44);
            assert.strictEqual(fields[2].frame.y, 88);

            assert.strictEqual(fields[1].frame.y - fields[0].frame.y, 44);
            assert.strictEqual(fields[2].frame.y - fields[1].frame.y, 44);
        });

        it('should handle zero Y position', () => {
            const tf = new UITextField('Field');
            tf.init();
            tf.setFrame(0, 0, 260, 36);
            assert.strictEqual(tf.frame.y, 0);
        });

        it('should handle negative Y position', () => {
            const tf = new UITextField('Field');
            tf.init();
            tf.setFrame(0, -20, 260, 36);
            assert.strictEqual(tf.frame.y, -20);
        });
    });

    describe('Frame Dimensions', () => {
        it('should set correct width', () => {
            const tf = new UITextField('Test');
            tf.init();
            tf.setFrame(0, 0, 200, 36);
            assert.strictEqual(tf.frame.width, 200);
        });

        it('should set correct height', () => {
            const tf = new UITextField('Test');
            tf.init();
            tf.setFrame(0, 0, 260, 44);
            assert.strictEqual(tf.frame.height, 44);
        });

        it('should set correct bounds from frame', () => {
            const tf = new UITextField('Test');
            tf.init();
            tf.setFrame(10, 20, 200, 44);
            assert.strictEqual(tf.bounds.width, 200);
            assert.strictEqual(tf.bounds.height, 44);
        });
    });

    describe('Element Styles', () => {
        it('should apply top style from frame', () => {
            const tf = new UITextField('Test');
            tf.init();
            tf.setFrame(0, 50, 260, 36);
            assert.strictEqual(tf.element.style.top, '50px');
        });

        it('should apply width style from frame', () => {
            const tf = new UITextField('Test');
            tf.init();
            tf.setFrame(0, 0, 300, 36);
            assert.strictEqual(tf.element.style.width, '300px');
        });

        it('should apply height style from frame', () => {
            const tf = new UITextField('Test');
            tf.init();
            tf.setFrame(0, 0, 260, 48);
            assert.strictEqual(tf.element.style.height, '48px');
        });

        it('should have absolute position', () => {
            const tf = new UITextField('Test');
            tf.init();
            assert.strictEqual(tf.element.style.position, 'absolute');
        });
    });

    describe('Container Layout', () => {
        it('should add multiple subviews correctly', () => {
            const container = new UIView();
            container.init();
            container.setFrame(0, 0, 300, 200);

            const tf1 = new UITextField('Field 1');
            tf1.init();
            tf1.setFrame(0, 0, 260, 36);

            const tf2 = new UITextField('Field 2');
            tf2.init();
            tf2.setFrame(0, 44, 260, 36);

            container.addSubview(tf1);
            container.addSubview(tf2);

            assert.strictEqual(container.subviews.length, 2);
            assert.strictEqual(tf1.superview, container);
            assert.strictEqual(tf2.superview, container);
        });

        it('should calculate container content height', () => {
            const container = new UIView();
            container.init();
            container.setFrame(0, 0, 300, 500);

            const heights = [36, 36, 44, 44];
            let yOffset = 0;
            const gap = 8;

            for (let i = 0; i < heights.length; i++) {
                const tf = new UITextField(`Field ${i}`);
                tf.init();
                tf.setFrame(0, yOffset, 260, heights[i]);
                container.addSubview(tf);
                yOffset += heights[i] + gap;
            }

            const lastSubview = container.subviews[container.subviews.length - 1];
            const contentHeight = lastSubview.frame.y + lastSubview.frame.height;
            assert.strictEqual(contentHeight, 184);
        });
    });
});

describe('UITextField Form Layout', () => {
    it('should layout login form correctly', () => {
        const formContainer = new UIView();
        formContainer.init();
        formContainer.setFrame(0, 0, 300, 250);

        const usernameField = new UITextField('Username');
        usernameField.init();
        usernameField.setFrame(20, 20, 260, 44);
        formContainer.addSubview(usernameField);

        const passwordField = new UITextField('Password');
        passwordField.init();
        passwordField.setFrame(20, 76, 260, 44);
        formContainer.addSubview(passwordField);

        const loginButton = new UIButton('Login');
        loginButton.init();
        loginButton.setFrame(20, 132, 260, 44);
        formContainer.addSubview(loginButton);

        assert.strictEqual(usernameField.frame.y, 20);
        assert.strictEqual(passwordField.frame.y, 76);
        assert.strictEqual(loginButton.frame.y, 132);

        assert.strictEqual(passwordField.frame.y - usernameField.frame.y, 56);
        assert.strictEqual(loginButton.frame.y - passwordField.frame.y, 56);
    });

    it('should layout contact form correctly', () => {
        const formContainer = new UIView();
        formContainer.init();
        formContainer.setFrame(0, 0, 300, 400);

        const fields = [
            { placeholder: 'First Name', y: 0 },
            { placeholder: 'Last Name', y: 52 },
            { placeholder: 'Email', y: 104 },
            { placeholder: 'Phone', y: 156 },
            { placeholder: 'Address', y: 208 }
        ];

        fields.forEach((fieldData) => {
            const tf = new UITextField(fieldData.placeholder);
            tf.init();
            tf.setFrame(0, fieldData.y, 280, 44);
            formContainer.addSubview(tf);
        });

        assert.strictEqual(formContainer.subviews.length, 5);

        for (let i = 1; i < fields.length; i++) {
            const current = formContainer.subviews[i];
            const previous = formContainer.subviews[i - 1];
            const expectedGap = current.frame.y - (previous.frame.y + previous.frame.height);
            assert.strictEqual(expectedGap, 8);
        }
    });

    it('should handle inline fields side by side', () => {
        const container = new UIView();
        container.init();
        container.setFrame(0, 0, 300, 44);

        const leftField = new UITextField('Left');
        leftField.init();
        leftField.setFrame(0, 0, 140, 36);
        container.addSubview(leftField);

        const rightField = new UITextField('Right');
        rightField.init();
        rightField.setFrame(148, 0, 140, 36);
        container.addSubview(rightField);

        assert.strictEqual(leftField.frame.width, 140);
        assert.strictEqual(rightField.frame.width, 140);
        assert.strictEqual(rightField.frame.x - leftField.frame.x, 148);
    });
});

describe('UITextField State', () => {
    it('should track text changes', () => {
        const tf = new UITextField('Test');
        tf.init();
        tf.setFrame(0, 0, 260, 36);

        tf.setText('Hello');
        assert.strictEqual(tf.getText(), 'Hello');

        tf.setText('World');
        assert.strictEqual(tf.getText(), 'World');
    });

    it('should clear text', () => {
        const tf = new UITextField('Test');
        tf.init();
        tf.setFrame(0, 0, 260, 36);

        tf.setText('Some text');
        tf.clear();
        assert.strictEqual(tf.getText(), '');
    });

    it('should track editing state', () => {
        const tf = new UITextField('Test');
        tf.init();
        tf.setFrame(0, 0, 260, 36);

        assert.strictEqual(tf.isEditing, false);
    });

    it('should handle placeholder', () => {
        const tf = new UITextField('Enter name');
        tf.init();
        tf.setFrame(0, 0, 260, 36);

        assert.strictEqual(tf.placeholder, 'Enter name');
    });
});

describe('UIView Hierarchy', () => {
    it('should maintain view hierarchy', () => {
        const root = new UIView();
        root.init();
        root.setFrame(0, 0, 300, 400);

        const child1 = new UITextField('Field 1');
        child1.init();
        child1.setFrame(0, 0, 260, 36);

        const child2 = new UITextField('Field 2');
        child2.init();
        child2.setFrame(0, 44, 260, 36);

        root.addSubview(child1);
        root.addSubview(child2);

        assert.strictEqual(child1.superview, root);
        assert.strictEqual(child2.superview, root);
        assert.strictEqual(root.subviews.length, 2);
    });

    it('should remove subview from hierarchy', () => {
        const root = new UIView();
        root.init();
        root.setFrame(0, 0, 300, 400);

        const child = new UITextField('Field');
        child.init();
        child.setFrame(0, 0, 260, 36);

        root.addSubview(child);
        assert.strictEqual(root.subviews.length, 1);

        root.removeSubview(child);
        assert.strictEqual(root.subviews.length, 0);
        assert.strictEqual(child.superview, null);
    });

    it('should handle nested containers', () => {
        const root = new UIView();
        root.init();
        root.setFrame(0, 0, 300, 400);

        const section = new UIView();
        section.init();
        section.setFrame(0, 0, 300, 200);
        root.addSubview(section);

        const field = new UITextField('Field');
        field.init();
        field.setFrame(0, 0, 260, 36);
        section.addSubview(field);

        assert.strictEqual(field.superview, section);
        assert.strictEqual(section.superview, root);
        assert.strictEqual(root.subviews.length, 1);
        assert.strictEqual(section.subviews.length, 1);
    });
});

describe('UITextField Sizing', () => {
    it('should respect small height', () => {
        const tf = new UITextField('Test');
        tf.init();
        tf.setFrame(0, 0, 260, 24);
        assert.strictEqual(tf.frame.height, 24);
        assert.strictEqual(tf.element.style.height, '24px');
    });

    it('should respect large height', () => {
        const tf = new UITextField('Test');
        tf.init();
        tf.setFrame(0, 0, 260, 60);
        assert.strictEqual(tf.frame.height, 60);
        assert.strictEqual(tf.element.style.height, '60px');
    });

    it('should handle full width field', () => {
        const container = new UIView();
        container.init();
        container.setFrame(0, 0, 375, 44);

        const tf = new UITextField('Full Width');
        tf.init();
        tf.setFrame(0, 0, container.frame.width - 40, 36);
        container.addSubview(tf);

        assert.strictEqual(tf.frame.width, 335);
    });
});

describe('UILabel UI', () => {
    it('should position labels correctly', () => {
        const container = new UIView();
        container.init();
        container.setFrame(0, 0, 300, 200);

        const titleLabel = new UILabel('Title');
        titleLabel.init();
        titleLabel.setFrame(0, 0, 100, 24);
        container.addSubview(titleLabel);

        const subtitleLabel = new UILabel('Subtitle');
        subtitleLabel.init();
        subtitleLabel.setFrame(0, 32, 100, 18);
        container.addSubview(subtitleLabel);

        assert.strictEqual(titleLabel.frame.y, 0);
        assert.strictEqual(subtitleLabel.frame.y, 32);
        assert.strictEqual(subtitleLabel.frame.y - titleLabel.frame.y, 32);
    });
});

describe('UIButton UI', () => {
    it('should position button correctly', () => {
        const container = new UIView();
        container.init();
        container.setFrame(0, 0, 300, 100);

        const button = new UIButton('Click Me');
        button.init();
        button.setFrame(0, 0, 200, 44);
        container.addSubview(button);

        assert.strictEqual(button.frame.x, 0);
        assert.strictEqual(button.frame.y, 0);
        assert.strictEqual(button.frame.width, 200);
        assert.strictEqual(button.frame.height, 44);
    });

    it('should stack buttons vertically', () => {
        const container = new UIView();
        container.init();
        container.setFrame(0, 0, 300, 200);

        const btn1 = new UIButton('Button 1');
        btn1.init();
        btn1.setFrame(0, 0, 260, 44);

        const btn2 = new UIButton('Button 2');
        btn2.init();
        btn2.setFrame(0, 52, 260, 44);

        container.addSubview(btn1);
        container.addSubview(btn2);

        assert.strictEqual(btn2.frame.y - btn1.frame.y, 52);
    });
});
