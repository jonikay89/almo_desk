class NSISEngine {
    constructor() {
        this._variables = new Map();
        this._constraints = [];
        this._stale = false;
        this._editVariables = new Map();
        this._stayConstraints = new Map();
    }

    registerVariable(name, initialValue = 0) {
        if (!this._variables.has(name)) {
            this._variables.set(name, initialValue);
            this._stayConstraints.set(name, { weight: 1 });
        }
        return this;
    }

    unregisterVariable(name) {
        this._variables.delete(name);
        this._stayConstraints.delete(name);
        this._constraints = this._constraints.filter(c =>
            !c._terms || !c._terms.some(t => t.variable === name)
        );
    }

    getVariable(name) {
        return this._variables.get(name);
    }

    setVariable(name, value) {
        this._variables.set(name, value);
        this._stale = true;
    }

    addConstraint(constraint) {
        for (const term of constraint._terms) {
            this.registerVariable(term.variable);
        }
        this._constraints.push(constraint);
        this._stale = true;
        return constraint;
    }

    removeConstraint(constraint) {
        const idx = this._constraints.indexOf(constraint);
        if (idx !== -1) {
            this._constraints.splice(idx, 1);
            this._stale = true;
        }
    }

    updateConstraintConstant(constraint, newConstant) {
        constraint._constant = newConstant;
        this._stale = true;
    }

    markStale() {
        this._stale = true;
    }

    isStale() {
        return this._stale;
    }

    solve() {
        if (!this._stale && this._constraints.length === 0) return;
        this._stale = false;
        this._solve();
    }

    _solve() {
        const requiredConstraints = this._constraints.filter(c => c._priority >= 1000);
        const optionalConstraints = this._constraints.filter(c => c._priority < 1000)
            .sort((a, b) => b._priority - a._priority);

        const solution = new Map(this._variables);
        this._applyConstraints(requiredConstraints, solution, true);
        optionalConstraints.forEach(constraint => {
            this._tryApplyConstraint(constraint, solution);
        });

        for (const [name, value] of solution) {
            this._variables.set(name, value);
        }
    }

    _applyConstraints(constraints, solution, required) {
        for (const constraint of constraints) {
            this._applySingleConstraint(constraint, solution, required);
        }
    }

    _applySingleConstraint(constraint, solution, required) {
        const { _terms: terms, _relation: relation, _constant: constant } = constraint;
        if (!terms || terms.length === 0) return;

        const values = terms.map(t => ({
            name: t.variable,
            coeff: t.coefficient,
            value: solution.get(t.variable) ?? 0
        }));

        const sum = values.reduce((acc, v) => acc + v.coeff * v.value, 0) + constant;

        if (relation === 'equal') {
            if (Math.abs(sum) > 0.001) {
                const freeVar = values.find(v => !this._editVariables.has(v.name));
                if (freeVar) {
                    const newVal = freeVar.value - sum / freeVar.coeff;
                    solution.set(freeVar.name, newVal);
                } else if (required) {
                    const avg = sum / values.length;
                    values.forEach(v => solution.set(v.name, v.value - avg / v.coeff));
                }
            }
        } else if (relation === 'gte') {
            if (sum < -0.001) {
                const freeVar = values.find(v => !this._editVariables.has(v.name));
                if (freeVar) {
                    solution.set(freeVar.name, freeVar.value + (-sum) / freeVar.coeff);
                }
            }
        } else if (relation === 'lte') {
            if (sum > 0.001) {
                const freeVar = values.find(v => !this._editVariables.has(v.name));
                if (freeVar) {
                    solution.set(freeVar.name, freeVar.value - sum / freeVar.coeff);
                }
            }
        }
    }

    _tryApplyConstraint(constraint, solution) {
        const { _terms: terms, _relation: relation, _constant: constant } = constraint;
        if (!terms || terms.length === 0) return;

        const sum = terms.reduce((acc, t) => acc + t.coefficient * (solution.get(t.variable) ?? 0), 0) + constant;

        if (relation === 'equal' && Math.abs(sum) < 0.001) return;
        if (relation === 'gte' && sum >= -0.001) return;
        if (relation === 'lte' && sum <= 0.001) return;

        this._applySingleConstraint(constraint, solution, false);
    }

    suggestVariable(name, value) {
        if (!this._variables.has(name)) this.registerVariable(name);
        this._editVariables.set(name, true);
        this._variables.set(name, value);
        this._stale = true;
    }

    resolve() {
        this.solve();
    }
}

const UILayoutPriority = {
    required: 1000,
    defaultHigh: 750,
    defaultHighConstraint: 750,
    defaultMedium: 500,
    defaultLow: 250,
    defaultLowConstraint: 250,
    fittingSizeLevel: 50,
};

const NSLayoutAttribute = {
    left: 'left',
    right: 'right',
    top: 'top',
    bottom: 'bottom',
    leading: 'leading',
    trailing: 'trailing',
    width: 'width',
    height: 'height',
    centerX: 'centerX',
    centerY: 'centerY',
    firstBaseline: 'firstBaseline',
    lastBaseline: 'lastBaseline',
    notAnAttribute: 'notAnAttribute',
};

const NSLayoutRelation = {
    equal: 'equal',
    greaterThanOrEqual: 'gte',
    lessThanOrEqual: 'lte',
};

class NSLayoutConstraint {
    constructor(item1, attr1, relation, item2, attr2, multiplier, constant) {
        this._firstItem = item1;
        this._firstAttribute = attr1;
        this._relation = relation;
        this._secondItem = item2;
        this._secondAttribute = attr2;
        this._multiplier = multiplier ?? 1;
        this._constant = constant ?? 0;
        this._priority = UILayoutPriority.required;
        this._isActive = false;
        this._identifier = '';
        this._terms = this._buildTerms();
    }

    _buildTerms() {
        const terms = [];
        if (this._firstItem && this._firstAttribute !== NSLayoutAttribute.notAnAttribute) {
            const v1 = this._variableName(this._firstItem, this._firstAttribute);
            terms.push({ variable: v1, coefficient: 1 });
        }
        if (this._secondItem && this._secondAttribute !== NSLayoutAttribute.notAnAttribute) {
            const v2 = this._variableName(this._secondItem, this._secondAttribute);
            terms.push({ variable: v2, coefficient: -this._multiplier });
        }
        return terms;
    }

    _variableName(item, attribute) {
        const uid = item._layoutGuid || (item._layoutGuid = NSLayoutConstraint._nextGuid++);
        return `${uid}.${attribute}`;
    }

    get firstItem() { return this._firstItem; }
    get firstAttribute() { return this._firstAttribute; }
    get relation() { return this._relation; }
    get secondItem() { return this._secondItem; }
    get secondAttribute() { return this._secondAttribute; }
    get multiplier() { return this._multiplier; }

    get constant() { return this._constant; }
    set constant(value) {
        if (this._constant !== value) {
            this._constant = value;
            this._terms = this._buildTerms();
            if (this._isActive && this._engine) {
                this._engine.updateConstraintConstant(this, value);
                this._notifyViews();
            }
        }
    }

    get priority() { return this._priority; }
    set priority(value) {
        if (value > UILayoutPriority.required) value = UILayoutPriority.required;
        if (this._isActive && this._priority !== value) {
            this._priority = value;
            if (this._engine) {
                this._engine.markStale();
                this._notifyViews();
            }
        }
        this._priority = value;
    }

    get isActive() { return this._isActive; }
    get identifier() { return this._identifier; }
    set identifier(value) { this._identifier = value; }

    activate() {
        if (this._isActive) return;
        this._isActive = true;
        this._terms = this._buildTerms();
        const engine = this._getEngine();
        if (engine) {
            engine.addConstraint(this);
            this._notifyViews();
        }
    }

    deactivate() {
        if (!this._isActive) return;
        this._isActive = false;
        if (this._engine) {
            this._engine.removeConstraint(this);
            this._engine = null;
            this._notifyViews();
        }
    }

    _getEngine() {
        const view = this._firstItem || this._secondItem;
        if (view) {
            const root = this._findRootView(view);
            if (root) {
                if (!root._layoutEngine) {
                    root._layoutEngine = new NSISEngine();
                }
                this._engine = root._layoutEngine;
                return this._engine;
            }
        }
        return null;
    }

    _findRootView(view) {
        let current = view;
        while (current._superview) {
            current = current._superview;
        }
        return current;
    }

    _notifyViews() {
        const views = new Set();
        if (this._firstItem) views.add(this._firstItem);
        if (this._secondItem) views.add(this._secondItem);
        for (const view of views) {
            if (view && view.setNeedsLayout) {
                view.setNeedsLayout();
            }
        }
    }

    static activateConstraints(constraints) {
        for (const c of constraints) c.activate();
    }

    static deactivateConstraints(constraints) {
        for (const c of constraints) c.deactivate();
    }

    static constraintWithItem(item1, attr1, relation, item2, attr2, multiplier, constant) {
        return new NSLayoutConstraint(item1, attr1, relation, item2, attr2, multiplier, constant);
    }
}
NSLayoutConstraint._nextGuid = 1;

class UILayoutGuide {
    constructor() {
        this._layoutGuid = NSLayoutConstraint._nextGuid++;
        this._owningView = null;
        this._constraints = [];
        this._identifier = '';
        this._anchorCache = {};
    }

    get owningView() { return this._owningView; }
    get identifier() { return this._identifier; }
    set identifier(value) { this._identifier = value; }

    _attributeValue(attr) {
        const frame = this.layoutFrame;
        switch (attr) {
            case NSLayoutAttribute.left:
            case NSLayoutAttribute.leading: return frame.x;
            case NSLayoutAttribute.right:
            case NSLayoutAttribute.trailing: return frame.x + frame.width;
            case NSLayoutAttribute.top: return frame.y;
            case NSLayoutAttribute.bottom: return frame.y + frame.height;
            case NSLayoutAttribute.width: return frame.width;
            case NSLayoutAttribute.height: return frame.height;
            case NSLayoutAttribute.centerX: return frame.x + frame.width / 2;
            case NSLayoutAttribute.centerY: return frame.y + frame.height / 2;
            default: return 0;
        }
    }

    get layoutFrame() {
        if (!this._owningView) return { x: 0, y: 0, width: 0, height: 0 };
        const owner = this._owningView;
        const safe = owner.safeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 };
        return {
            x: safe.left,
            y: safe.top,
            width: owner._bounds.width - safe.left - safe.right,
            height: owner._bounds.height - safe.top - safe.bottom,
        };
    }

    _getAnchor(attr) {
        if (!this._anchorCache[attr]) {
            this._anchorCache[attr] = new NSLayoutAnchor(this, attr);
        }
        return this._anchorCache[attr];
    }

    get leadingAnchor() { return this._getAnchor('leading'); }
    get trailingAnchor() { return this._getAnchor('trailing'); }
    get leftAnchor() { return this._getAnchor('left'); }
    get rightAnchor() { return this._getAnchor('right'); }
    get topAnchor() { return this._getAnchor('top'); }
    get bottomAnchor() { return this._getAnchor('bottom'); }
    get widthAnchor() { return this._getAnchor('width'); }
    get heightAnchor() { return this._getAnchor('height'); }
    get centerXAnchor() { return this._getAnchor('centerX'); }
    get centerYAnchor() { return this._getAnchor('centerY'); }
}

class NSLayoutAnchor {
    constructor(item, attribute) {
        this._item = item;
        this._attribute = attribute;
    }

    get item() { return this._item; }
    get attribute() { return this._attribute; }

    constraintEqualToAnchor(anchor, constant = 0) {
        return new NSLayoutConstraint(
            this._item, this._attribute, NSLayoutRelation.equal,
            anchor._item, anchor._attribute, 1, constant
        );
    }

    constraintGreaterThanOrEqualToAnchor(anchor, constant = 0) {
        return new NSLayoutConstraint(
            this._item, this._attribute, NSLayoutRelation.greaterThanOrEqual,
            anchor._item, anchor._attribute, 1, constant
        );
    }

    constraintLessThanOrEqualToAnchor(anchor, constant = 0) {
        return new NSLayoutConstraint(
            this._item, this._attribute, NSLayoutRelation.lessThanOrEqual,
            anchor._item, anchor._attribute, 1, constant
        );
    }

    constraintEqualToConstant(constant) {
        return new NSLayoutConstraint(
            this._item, this._attribute, NSLayoutRelation.equal,
            null, NSLayoutAttribute.notAnAttribute, 1, constant
        );
    }

    constraintGreaterThanOrEqualToConstant(constant) {
        return new NSLayoutConstraint(
            this._item, this._attribute, NSLayoutRelation.greaterThanOrEqual,
            null, NSLayoutAttribute.notAnAttribute, 1, constant
        );
    }

    constraintLessThanOrEqualToConstant(constant) {
        return new NSLayoutConstraint(
            this._item, this._attribute, NSLayoutRelation.lessThanOrEqual,
            null, NSLayoutAttribute.notAnAttribute, 1, constant
        );
    }
}

export {
    NSISEngine,
    UILayoutPriority,
    NSLayoutAttribute,
    NSLayoutRelation,
    NSLayoutConstraint,
    UILayoutGuide,
    NSLayoutAnchor,
};
export default NSLayoutConstraint;
