import UIViewController from './UIViewController.js';
import UIView from './UIView.js';
import UILabel from './UILabel.js';
import UIButton from './UIButton.js';
import UIColor from './UIColor.js';
import { NSNumber, kp, getProperty, updateProperty } from './Foundation.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';
import { invokeProtocolMethod } from './Protocol.js';
import { AlertDelegate, AlertDelegate as AlertDelegateProtocol } from './TypeAliases.js';

class UIAlertController extends UIViewController {
    constructor(title, message, preferredStyle = 'alert') {
        super();
        this.title = title;
        this.message = message;
        this.preferredStyle = preferredStyle;
        this.actions = [];
        this.textFields = [];
        this.alertView = null;
        this.delegate = null;
        this._actionKeyPaths = [];
    }

    init() {
        this.view = new UIView();
        this.view.init();
        this.view.element.className = 'ui-alert-controller';

        this.overlay = document.createElement('div');
        this.overlay.className = 'alert-overlay';
        this.overlay.style.position = 'fixed';
        this.overlay.style.top = '0';
        this.overlay.style.left = '0';
        this.overlay.style.right = '0';
        this.overlay.style.bottom = '0';
        this.overlay.style.backgroundColor = 'rgba(0,0,0,0.4)';
        this.overlay.style.display = 'flex';
        this.overlay.style.alignItems = 'center';
        this.overlay.style.justifyContent = 'center';
        this.overlay.style.zIndex = '10000';

        this.alertView = document.createElement('div');
        this.alertView.className = 'alert-content';
        this.alertView.style.backgroundColor = UIColor.white().css;
        this.alertView.style.borderRadius = '14px';
        this.alertView.style.minWidth = '270px';
        this.alertView.style.maxWidth = '400px';
        this.alertView.style.overflow = 'hidden';
        this.alertView.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';

        this.overlay.appendChild(this.alertView);
        document.body.appendChild(this.overlay);

        this.#buildContent();

        return this;
    }

    #buildContent() {
        this.alertView.innerHTML = '';

        const headerContainer = document.createElement('div');
        headerContainer.style.padding = '16px 16px 8px 16px';
        headerContainer.style.textAlign = 'center';

        if (this.title) {
            const titleLabel = document.createElement('div');
            titleLabel.textContent = this.title;
            titleLabel.style.fontSize = '17px';
            titleLabel.style.fontWeight = '600';
            titleLabel.style.color = '#000';
            titleLabel.style.marginBottom = '4px';
            headerContainer.appendChild(titleLabel);
        }

        if (this.message) {
            const messageLabel = document.createElement('div');
            messageLabel.textContent = this.message;
            messageLabel.style.fontSize = '13px';
            messageLabel.style.color = '#666';
            messageLabel.style.lineHeight = '1.4';
            messageLabel.style.textAlign = this.title ? 'center' : 'left';
            headerContainer.appendChild(messageLabel);
        }

        this.alertView.appendChild(headerContainer);

        if (this.textFields.length > 0) {
            const textFieldsContainer = document.createElement('div');
            textFieldsContainer.style.padding = '8px 16px 16px 16px';
            
            this.textFields.forEach(textFieldConfig => {
                const textField = document.createElement('input');
                textField.type = textFieldConfig.type || 'text';
                textField.placeholder = textFieldConfig.placeholder || '';
                textField.style.width = '100%';
                textField.style.height = '36px';
                textField.style.padding = '0 12px';
                textField.style.border = '1px solid #ddd';
                textField.style.borderRadius = '6px';
                textField.style.fontSize = '14px';
                textField.style.marginTop = '8px';
                textField.style.boxSizing = 'border-box';
                textFieldsContainer.appendChild(textField);
            });

            this.alertView.appendChild(textFieldsContainer);
        }

        const actionsContainer = document.createElement('div');
        actionsContainer.style.display = 'flex';
        actionsContainer.style.flexDirection = this.actions.length > 2 ? 'column' : 'row';
        actionsContainer.style.borderTop = '1px solid #ddd';
        actionsContainer.style.padding = '8px';

        if (this.actions.length === 0) {
            const defaultAction = this.addAction('OK', 'default');
        }

        this.actions.forEach((action, index) => {
            const button = document.createElement('button');
            button.textContent = action.title;
            button.style.flex = '1';
            button.style.height = '44px';
            button.style.border = 'none';
            button.style.borderRadius = this.actions.length > 2 ? '0' : (index === 0 ? '8px 0 0 8px' : '0 8px 8px 0');
            button.style.fontSize = '17px';
            button.style.fontWeight = action.style === 'cancel' ? '600' : '400';
            button.style.cursor = 'pointer';
            button.style.backgroundColor = '#fff';
            button.style.color = action.style === 'destructive' ? UIColor.systemRed().css : UIColor.systemBlue().css;

            if (this.actions.length > 2) {
                button.style.borderRadius = '0';
                if (index === 0) {
                    button.style.borderRadius = '0';
                }
                if (index === this.actions.length - 1) {
                    button.style.borderRadius = '0 0 14px 14px';
                }
            }

            button.addEventListener('click', () => {
                this.#dismissWithAction(action);
            });

            actionsContainer.appendChild(button);

            if (index < this.actions.length - 1 && this.actions.length <= 2) {
                const separator = document.createElement('div');
                separator.style.width = '1px';
                separator.style.backgroundColor = '#ddd';
                actionsContainer.appendChild(separator);
            }
        });

        this.alertView.appendChild(actionsContainer);

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay && this.preferredStyle === 'actionSheet') {
                this.#dismiss();
            }
        });
    }

    addAction(title, style = 'default') {
        const action = { title, style, handler: null };
        this.actions.push(action);
        return action;
    }

    addTextField(configurationHandler) {
        const config = { type: 'text', placeholder: '' };
        if (configurationHandler) {
            configurationHandler(config);
        }
        this.textFields.push(config);
        return config;
    }

    #dismissWithAction(action) {
        if (this.delegate) {
            invokeProtocolMethod(AlertDelegateProtocol, this.delegate, 'alertDidDismiss', this, action);
        }
        if (action.handler) {
            action.handler();
        }
        this.#dismiss();
    }

    #dismiss() {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
    }

    present(animated = true, completion = null) {
        if (this.delegate) {
            invokeProtocolMethod(AlertDelegateProtocol, this.delegate, 'alertWillPresent', this);
        }
        
        if (animated) {
            this.alertView.style.opacity = '0';
            this.alertView.style.transform = 'scale(0.9)';
            this.alertView.style.transition = 'all 0.2s ease';
            
            requestAnimationFrame(() => {
                this.alertView.style.opacity = '1';
                this.alertView.style.transform = 'scale(1)';
                if (this.delegate) {
                    invokeProtocolMethod(AlertDelegateProtocol, this.delegate, 'alertDidPresent', this);
                }
            });
        } else {
            if (this.delegate) {
                invokeProtocolMethod(AlertDelegateProtocol, this.delegate, 'alertDidPresent', this);
            }
        }
        
        if (completion) {
            setTimeout(completion, animated ? 200 : 0);
        }
    }

    viewDidLoad() {
        super.viewDidLoad();
    }

    deinit() {
        this.#dismiss();
        super.deinit();
    }

    static alert(title, message, actions = ['OK']) {
        const alert = new UIAlertController(title, message, 'alert');
        actions.forEach(actionTitle => {
            alert.addAction(actionTitle);
        });
        alert.init();
        alert.present();
        return alert;
    }

    static actionSheet(title, message, actions = []) {
        const sheet = new UIAlertController(title, message, 'actionSheet');
        actions.forEach(actionTitle => {
            sheet.addAction(actionTitle);
        });
        sheet.init();
        sheet.present();
        return sheet;
    }

    get description() {
        return `UIAlertController(title: "${this.title}", message: "${this.message}", preferredStyle: "${this.preferredStyle}", actions: ${this.actions.length})`;
    }

    actionsAsArray() {
        return this.actions.map(action => ({ ...action }));
    }

    textFieldsAsArray() {
        return this.textFields.map(field => ({ ...field }));
    }

    encode() {
        return {
            title: this.title,
            message: this.message,
            preferredStyle: this.preferredStyle,
            actions: this.actions.map(a => ({ title: a.title, style: a.style })),
            textFields: this.textFields.map(f => ({ type: f.type, placeholder: f.placeholder }))
        };
    }

    static decode(data) {
        const alert = new UIAlertController(data.title, data.message, data.preferredStyle);
        data.actions.forEach(a => alert.addAction(a.title, a.style));
        data.textFields.forEach(f => alert.addTextField(cfg => {
            cfg.type = f.type;
            cfg.placeholder = f.placeholder;
        }));
        return alert;
    }

    matchAlert(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        return Switch(predicate)
            .case({ title: Switch.let('t') }, (m) => this.title === m.t)
            .case({ message: Switch.let('msg') }, (m) => this.message === m.msg)
            .case({ preferredStyle: 'alert' }, () => this.preferredStyle === 'alert')
            .case({ preferredStyle: 'actionSheet' }, () => this.preferredStyle === 'actionSheet')
            .case({ hasActions: true }, () => this.actions.length > 0)
            .case({ hasActions: false }, () => this.actions.length === 0)
            .case({ actionCount: Switch.let('n') }, (m) => this.actions.length === m.n)
            .case({ hasTextFields: true }, () => this.textFields.length > 0)
            .case({ hasTextFields: false }, () => this.textFields.length === 0)
            .case({ textFieldCount: Switch.let('n') }, (m) => this.textFields.length === m.n)
            .case({ empty: true }, () => !this.title && !this.message && this.actions.length === 0)
            .default(() => false)
            .evaluate();
    }

    matchAction(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        const self = this;
        return Switch(predicate)
            .case({ style: 'default' }, () => self.actions.some(a => a.style === 'default'))
            .case({ style: 'cancel' }, () => self.actions.some(a => a.style === 'cancel'))
            .case({ style: 'destructive' }, () => self.actions.some(a => a.style === 'destructive'))
            .case({ titled: Switch.let('title') }, (m) => self.actions.some(a => a.title === m.title))
            .case({ atIndex: Switch.let('i'), title: Switch.let('t') }, (m) => {
                const idx = typeof m.i === 'number' ? m.i : parseInt(m.i);
                return self.actions[idx] && self.actions[idx].title === m.t;
            })
            .default(() => false)
            .evaluate();
    }

    matchTextField(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        const self = this;
        return Switch(predicate)
            .case({ type: 'text' }, () => self.textFields.some(f => f.type === 'text'))
            .case({ type: 'number' }, () => self.textFields.some(f => f.type === 'number'))
            .case({ type: 'email' }, () => self.textFields.some(f => f.type === 'email'))
            .case({ type: 'password' }, () => self.textFields.some(f => f.type === 'password'))
            .case({ placeholder: Switch.let('p') }, (m) => self.textFields.some(f => f.placeholder === m.p))
            .case({ atIndex: Switch.let('i') }, (m) => {
                const idx = typeof m.i === 'number' ? m.i : parseInt(m.i);
                return idx >= 0 && idx < self.textFields.length;
            })
            .case({ empty: true }, () => self.textFields.length === 0)
            .default(() => false)
            .evaluate();
    }

    switch() {
        return Switch(this);
    }

    patternMatch(predicate) {
        return this.matchAlert(predicate);
    }

    ifCase(pattern, handler) {
        return ifCase(pattern)(this).then(handler);
    }

    guardCase(pattern) {
        return guardCase(pattern)(this);
    }

    static forCase(collection, pattern, handler) {
        for (const item of collection) {
            const result = forCase(pattern)(item);
            if (result !== undefined) {
                handler(result);
            }
        }
    }

    static whileCase(iterator, pattern) {
        return whileCase(pattern)(iterator);
    }

    matchOperator(pattern) {
        return patternMatch(pattern, this);
    }

    ifLet(pattern) {
        return ifLet(this, pattern);
    }

    guardLet(pattern) {
        return guardLet(this, pattern);
    }

    setTitle(newTitle) {
        this.title = newTitle;
        if (this.alertView) {
            const titleEl = this.alertView.querySelector('.alert-title');
            if (titleEl) titleEl.textContent = newTitle;
        }
        return this;
    }

    setMessage(newMessage) {
        this.message = newMessage;
        if (this.alertView) {
            const msgEl = this.alertView.querySelector('.alert-message');
            if (msgEl) msgEl.textContent = newMessage;
        }
        return this;
    }

    findAction(predicate) {
        return this.actions.find(predicate) || null;
    }

    findActionBy(keyPath, value) {
        const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
        return this.actions.find(action => getProperty(action, path) === value) || null;
    }

    filterActions(predicate) {
        this.actions = this.actions.filter(predicate);
        if (this.alertView) {
            this.#buildContent();
        }
        return this;
    }

    filterActionsBy(keyPath, value) {
        const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
        return this.filterActions(action => getProperty(action, path) === value);
    }

    updateAction(action, keyPath, newValue) {
        const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
        updateProperty(action, path, newValue);
        if (this.alertView) {
            this.#buildContent();
        }
        return this;
    }

    getActionValue(action, keyPath) {
        const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
        return getProperty(action, path);
    }

    sortActionsBy(keyPath, ascending = true) {
        const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
        this.actions = ascending 
            ? this.actions.slice().sort((a, b) => {
                const aVal = getProperty(a, path);
                const bVal = getProperty(b, path);
                return aVal < bVal ? -1 : (aVal > bVal ? 1 : 0);
            })
            : this.actions.slice().sort((a, b) => {
                const aVal = getProperty(a, path);
                const bVal = getProperty(b, path);
                return aVal > bVal ? -1 : (aVal < bVal ? 1 : 0);
            });
        if (this.alertView) {
            this.#buildContent();
        }
        return this;
    }

    addActionWith(action) {
        return this.addAction(action.title || '', action.style || 'default');
    }

    removeAction(action) {
        const index = this.actions.indexOf(action);
        if (index > -1) {
            this.actions.splice(index, 1);
            if (this.alertView) {
                this.#buildContent();
            }
        }
        return this;
    }

    getTextFieldValue(index, keyPath) {
        const textField = this.textFields[index];
        if (textField) {
            const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
            return getProperty(textField, path);
        }
        return null;
    }

    setTextFieldValue(index, keyPath, value) {
        const textField = this.textFields[index];
        if (textField) {
            const path = typeof keyPath === 'string' ? kp(keyPath) : keyPath;
            updateProperty(textField, path, value);
        }
        return this;
    }
}

export default UIAlertController;