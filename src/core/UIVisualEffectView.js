import UIView from './UIView.js';
import UIColor from './UIColor.js';

class UIVisualEffect {
    constructor() {
        this._cssFilter = 'none';
    }
    get cssFilter() { return this._cssFilter; }
}

class UIBlurEffect extends UIVisualEffect {
    constructor(style = 'systemMaterial') {
        super();
        this._style = style;
        this._cssFilter = this._styleToCSS(style);
    }

    get style() { return this._style; }

    static withStyle(style) {
        return new UIBlurEffect(style);
    }

    _styleToCSS(style) {
        const map = {
            'extraLight': 'blur(20px) brightness(1.15)',
            'light': 'blur(20px) brightness(1.05)',
            'dark': 'blur(20px) brightness(0.85)',
            'extraDark': 'blur(20px) brightness(0.7)',
            'systemUltraThinMaterial': 'blur(10px)',
            'systemThinMaterial': 'blur(20px)',
            'systemMaterial': 'blur(30px)',
            'systemThickMaterial': 'blur(40px)',
            'systemChromeMaterial': 'blur(50px)',
        };
        return map[style] || 'blur(20px)';
    }
}

class UIVibrancyEffect extends UIVisualEffect {
    constructor(blurEffect) {
        super();
        this._blurEffect = blurEffect;
        this._cssFilter = 'blur(0.5px) saturate(1.5)';
    }

    get blurEffect() { return this._blurEffect; }

    static blurEffect(blurEffect) {
        return new UIVibrancyEffect(blurEffect);
    }
}

class UIVisualEffectView extends UIView {
    constructor(effect = null) {
        super();
        this._effect = effect;
        this._contentView = new UIView();
    }

    get effect() { return this._effect; }
    set effect(value) { this._effect = value; }

    get contentView() { return this._contentView; }

    init() {
        if (typeof document !== 'undefined' && !this._element) {
            this._element = document.createElement('div');
            this._element.style.position = 'absolute';
            this._element.style.overflow = 'hidden';

            if (this._effect instanceof UIBlurEffect) {
                this._element.style.backdropFilter = this._effect.cssFilter;
                this._element.style.webkitBackdropFilter = this._effect.cssFilter;
                this._element.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            } else if (this._effect instanceof UIVibrancyEffect) {
                this._element.style.backdropFilter = this._effect.cssFilter;
                this._element.style.webkitBackdropFilter = this._effect.cssFilter;
            }
        }
        return this._element;
    }
}

export default UIVisualEffectView;
export { UIVisualEffect, UIBlurEffect, UIVibrancyEffect };
