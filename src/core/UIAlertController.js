import UIViewController from './UIViewController.js';
import UIView from './UIView.js';
import UIColor from './UIColor.js';

const UIAlertControllerStyle = {
    actionSheet: 'actionSheet',
    alert: 'alert',
};

const UIAlertActionStyle = {
    default: 'default',
    cancel: 'cancel',
    destructive: 'destructive',
};

class UIAlertAction {
    constructor(title, style, handler) {
        this._title = title;
        this._style = style;
        this._handler = handler;
        this._isEnabled = true;
    }

    get title() { return this._title; }
    get style() { return this._style; }
    get isEnabled() { return this._isEnabled; }
    set isEnabled(value) { this._isEnabled = value; }

    static actionWithTitle(title, style, handler) {
        return new UIAlertAction(title, style, handler);
    }

    static defaultAction(title, handler) {
        return new UIAlertAction(title, UIAlertActionStyle.default, handler);
    }

    static cancelAction(title, handler) {
        return new UIAlertAction(title, UIAlertActionStyle.cancel, handler);
    }

    static destructiveAction(title, handler) {
        return new UIAlertAction(title, UIAlertActionStyle.destructive, handler);
    }
}

class UIAlertController extends UIViewController {
    constructor(title, message, preferredStyle) {
        super();
        this._alertTitle = title || '';
        this._message = message || '';
        this._preferredStyle = preferredStyle || UIAlertControllerStyle.alert;
        this._actions = [];
        this._preferredAction = null;
        this._textFields = [];
        this._alertElement = null;
    }

    get title() { return this._alertTitle; }
    set title(value) { this._alertTitle = value; }
    get message() { return this._message; }
    set message(value) { this._message = value; }
    get preferredStyle() { return this._preferredStyle; }
    get actions() { return [...this._actions]; }
    get textFields() { return [...this._textFields]; }
    get preferredAction() { return this._preferredAction; }
    set preferredAction(value) { this._preferredAction = value; }

    addAction(action) {
        this._actions.push(action);
    }

    addTextField(configurationHandler) {
        const textField = {
            text: '',
            placeholder: '',
            _element: null,
        };
        if (configurationHandler) {
            configurationHandler(textField);
        }
        this._textFields.push(textField);
    }

    static alertControllerWithTitle(title, message, preferredStyle) {
        return new UIAlertController(title, message, preferredStyle);
    }

    loadView() {
        this._view = new UIView();
        this._view.init();
    }

    viewDidLoad() {
        this._buildAlertUI();
    }

    _buildAlertUI() {
        if (!this._view?._element) return;
        const el = this._view._element;

        if (this._preferredStyle === UIAlertControllerStyle.alert) {
            el.style.cssText = `
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                display: flex; align-items: center; justify-content: center;
                background: rgba(0,0,0,0.4); z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            `;

            const card = document.createElement('div');
            card.style.cssText = `
                background: rgba(255,255,255,0.95); backdrop-filter: blur(20px);
                border-radius: 14px; min-width: 270px; max-width: 350px;
                padding: 20px 16px 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.2);
                transform: scale(0.9); opacity: 0;
                transition: transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.2s;
            `;

            const titleEl = document.createElement('div');
            titleEl.style.cssText = 'font-size: 17px; font-weight: 600; text-align: center; color: #1d1d1f; margin-bottom: 4px;';
            titleEl.textContent = this._alertTitle;
            card.appendChild(titleEl);

            if (this._message) {
                const msgEl = document.createElement('div');
                msgEl.style.cssText = 'font-size: 13px; text-align: center; color: #3a3a3c; line-height: 1.4; margin-bottom: 16px;';
                msgEl.textContent = this._message;
                card.appendChild(msgEl);
            }

            for (const tf of this._textFields) {
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = tf.placeholder || '';
                input.value = tf.text || '';
                input.style.cssText = `
                    width: 100%; padding: 8px 10px; border: 1px solid #c7c7cc;
                    border-radius: 6px; font-size: 14px; margin-bottom: 8px;
                    box-sizing: border-box; outline: none;
                `;
                input.addEventListener('input', () => { tf.text = input.value; });
                tf._element = input;
                card.appendChild(input);
            }

            const actionsEl = document.createElement('div');
            actionsEl.style.cssText = `display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;`;

            for (const action of this._actions) {
                const btn = document.createElement('button');
                btn.textContent = action.title;
                let color = '#007aff';
                if (action._style === UIAlertActionStyle.cancel) color = '#007aff';
                if (action._style === UIAlertActionStyle.destructive) color = '#ff3b30';

                btn.style.cssText = `
                    flex: 1; min-width: 100px; padding: 11px 12px; border: none;
                    border-radius: 10px; font-size: 17px; font-weight: 600;
                    color: ${color}; cursor: pointer; background: transparent;
                    font-family: inherit;
                `;
                if (action._style === UIAlertActionStyle.cancel) {
                    btn.style.fontWeight = '600';
                }
                btn.addEventListener('click', () => {
                    this._dismiss();
                    if (action._handler) action._handler(this);
                });
                actionsEl.appendChild(btn);
            }
            card.appendChild(actionsEl);
            el.appendChild(card);

            requestAnimationFrame(() => {
                card.style.transform = 'scale(1)';
                card.style.opacity = '1';
            });

        } else if (this._preferredStyle === UIAlertControllerStyle.actionSheet) {
            el.style.cssText = `
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                display: flex; flex-direction: column; justify-content: flex-end;
                background: rgba(0,0,0,0.4); z-index: 10000; padding: 8px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            `;

            const sheet = document.createElement('div');
            sheet.style.cssText = `max-width: 500px; margin: 0 auto; width: 100%;`;

            const card = document.createElement('div');
            card.style.cssText = `
                background: rgba(255,255,255,0.95); backdrop-filter: blur(20px);
                border-radius: 14px; overflow: hidden; margin-bottom: 8px;
                transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1);
            `;

            if (this._alertTitle) {
                const titleEl = document.createElement('div');
                titleEl.style.cssText = 'font-size: 13px; font-weight: 600; text-align: center; color: #8e8e93; padding: 14px 16px 2px;';
                titleEl.textContent = this._alertTitle;
                card.appendChild(titleEl);
            }
            if (this._message) {
                const msgEl = document.createElement('div');
                msgEl.style.cssText = 'font-size: 13px; text-align: center; color: #8e8e93; padding: 2px 16px 10px;';
                msgEl.textContent = this._message;
                card.appendChild(msgEl);
            }

            for (const action of this._actions) {
                const btn = document.createElement('button');
                btn.textContent = action.title;
                let color = '#007aff';
                if (action._style === UIAlertActionStyle.destructive) color = '#ff3b30';

                btn.style.cssText = `
                    width: 100%; padding: 18px 16px; border: none; border-top: 0.5px solid #c6c6c8;
                    font-size: 20px; font-weight: 400; color: ${color}; cursor: pointer;
                    background: transparent; font-family: inherit;
                `;
                if (action._style === UIAlertActionStyle.cancel) {
                    btn.style.fontWeight = '600';
                }
                btn.addEventListener('click', () => {
                    this._dismiss();
                    if (action._handler) action._handler(this);
                });
                card.appendChild(btn);
            }
            sheet.appendChild(card);

            const cancelActions = this._actions.filter(a => a._style === UIAlertActionStyle.cancel);
            for (const action of cancelActions) {
                const cancelBtn = document.createElement('button');
                cancelBtn.textContent = action.title;
                cancelBtn.style.cssText = `
                    width: 100%; padding: 18px 16px; border: none; border-radius: 14px;
                    font-size: 20px; font-weight: 600; color: #007aff; cursor: pointer;
                    background: rgba(255,255,255,0.95); backdrop-filter: blur(20px);
                    font-family: inherit; margin-bottom: 8px;
                `;
                cancelBtn.addEventListener('click', () => {
                    this._dismiss();
                    if (action._handler) action._handler(this);
                });
                sheet.appendChild(cancelBtn);
                const idx = card.querySelector(`button`);
            }

            el.appendChild(sheet);

            requestAnimationFrame(() => {
                card.style.transform = 'translateY(0)';
            });
        }

        this._alertElement = el;
    }

    _dismiss() {
        if (this._alertElement) {
            this._alertElement.style.opacity = '0';
            this._alertElement.style.transition = 'opacity 0.2s';
            setTimeout(() => {
                this._presentingViewController?.dismissViewController(false);
            }, 200);
        } else {
            this._presentingViewController?.dismissViewController(false);
        }
    }
}

export {
    UIAlertController,
    UIAlertControllerStyle,
    UIAlertAction,
    UIAlertActionStyle,
};
export default UIAlertController;
