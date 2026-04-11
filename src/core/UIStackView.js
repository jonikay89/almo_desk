import UIView from './UIView.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';

class UIStackView extends UIView {
    constructor(arrangedSubviews = []) {
        super();
        this._arrangedSubviews = [];
        this._axis = 'horizontal';
        this._distribution = 'fill';
        this._alignment = 'center';
        this._spacing = 0;
        this._isLayoutFlipped = false;
        this.element = document.createElement('div');
        this.element.className = 'ui-stackview';
        
        arrangedSubviews.forEach(view => this.addArrangedSubview(view));
    }

    get description() {
        const viewDescs = this._arrangedSubviews.map(v => v.description || 'UIView').join(', ');
        return `UIStackView(axis: ${this._axis}, arrangedSubviews: [${viewDescs}])`;
    }

    get axis() {
        return this._axis;
    }

    set axis(value) {
        this._axis = value;
        this.#updateLayout();
    }

    get distribution() {
        return this._distribution;
    }

    set distribution(value) {
        this._distribution = value;
        this.#updateLayout();
    }

    get alignment() {
        return this._alignment;
    }

    set alignment(value) {
        this._alignment = value;
        this.#updateLayout();
    }

    get spacing() {
        return this._spacing;
    }

    set spacing(value) {
        this._spacing = value;
        this.#updateLayout();
    }

    get arrangedSubviews() {
        return this._arrangedSubviews;
    }

    arrangedSubviewsAsArray() {
        return [...this._arrangedSubviews];
    }

    init() {
        this.element.style.display = 'flex';
        this.#updateLayout();
        return this;
    }

    #updateLayout() {
        if (!this.element) return;

        const axisMap = {
            'horizontal': 'row',
            'vertical': 'column'
        };
        this.element.style.flexDirection = axisMap[this._axis] || 'row';

        const alignMap = {
            'fill': 'stretch',
            'leading': 'flex-start',
            'trailing': 'flex-end',
            'center': 'center',
            'firstBaseline': 'baseline',
            'lastBaseline': 'last baseline'
        };
        this.element.style.alignItems = alignMap[this._alignment] || 'center';

        const distribMap = {
            'fill': 'flex-grow',
            'fillEqually': 'space-between',
            'fillProportionally': 'flex-grow',
            'equalSpacing': 'space-between',
            'equalCentering': 'space-around'
        };

        this.element.style.justifyContent = distribMap[this._distribution] || 'flex-start';
        this.element.style.gap = `${this._spacing}px`;

        this._arrangedSubviews.forEach(view => {
            if (view.element) {
                if (this._distribution === 'fillEqually') {
                    view.element.style.flex = '1';
                } else if (this._distribution === 'fillProportionally') {
                    view.element.style.flexGrow = '1';
                }
            }
        });
    }

    addArrangedSubview(view) {
        if (!view) return;
        
        this._arrangedSubviews.push(view);
        view.removeFromSuperview();
        view.superview = this;
        
        if (this.element && view.element) {
            this.element.appendChild(view.element);
        }
        
        this.#updateLayout();
    }

    removeArrangedSubview(view) {
        if (!view) return;
        
        const index = this._arrangedSubviews.indexOf(view);
        if (index > -1) {
            this._arrangedSubviews.splice(index, 1);
        }
        
        if (view.element && this.element) {
            this.element.removeChild(view.element);
        }
        
        view.superview = null;
        this.#updateLayout();
    }

    insertArrangedSubview(view, index) {
        if (!view) return;
        
        view.removeFromSuperview();
        view.superview = this;
        
        if (index >= this._arrangedSubviews.length) {
            this._arrangedSubviews.push(view);
        } else {
            this._arrangedSubviews.splice(index, 0, view);
        }
        
        if (this.element && view.element) {
            const children = Array.from(this.element.children);
            if (index < children.length) {
                this.element.insertBefore(view.element, children[index]);
            } else {
                this.element.appendChild(view.element);
            }
        }
        
        this.#updateLayout();
    }

    setAxis(axis) {
        this.axis = axis;
    }

    setDistribution(dist) {
        this.distribution = dist;
    }

    setAlignment(align) {
        this.alignment = align;
    }

    setSpacing(spacing) {
        this.spacing = spacing;
    }

    layoutSubviews() {
        super.layoutSubviews();
        if (this.element) {
            this.element.style.width = `${this.frame.width}px`;
            this.element.style.height = `${this.frame.height}px`;
        }
    }

    encode() {
        return {
            axis: this._axis,
            distribution: this._distribution,
            alignment: this._alignment,
            spacing: this._spacing
        };
    }

    static decode(data) {
        const stackView = new UIStackView();
        stackView._axis = data.axis || 'horizontal';
        stackView._distribution = data.distribution || 'fill';
        stackView._alignment = data.alignment || 'center';
        stackView._spacing = data.spacing || 0;
        return stackView;
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

    switch() {
        return Switch(this);
    }
}

export default UIStackView;