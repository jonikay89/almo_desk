import UIViewController from './UIViewController.js';
import UIView from './UIView.js';
import UIColor from './UIColor.js';

const UISplitViewControllerColumn = {
    primary: 'primary',
    supplementary: 'supplementary',
    secondary: 'secondary',
    compact: 'compact',
};

const UISplitViewControllerDisplayMode = {
    automatic: 'automatic',
    secondaryOnly: 'secondaryOnly',
    oneBesideSecondary: 'oneBesideSecondary',
    oneOverSecondary: 'oneOverSecondary',
    twoBesideSecondary: 'twoBesideSecondary',
    twoOverSecondary: 'twoOverSecondary',
    twoDisplaceSecondary: 'twoDisplaceSecondary',
    tripleColumn: 'tripleColumn',
};

const UISplitViewControllerStyle = {
    tripleColumn: 'tripleColumn',
    doubleColumn: 'doubleColumn',
    unspecified: 'unspecified',
};

class UISplitViewController extends UIViewController {
    constructor(style) {
        super();
        this._style = style || UISplitViewControllerStyle.doubleColumn;
        this._viewControllers = [];
        this._displayMode = UISplitViewControllerDisplayMode.automatic;
        this._preferredDisplayMode = UISplitViewControllerDisplayMode.automatic;
        this._preferredSplitBehavior = 'automatic';
        this._primaryEdge = 'leading';
        this._presentsWithGesture = true;
        this._isCollapsed = false;
        this._showsSecondaryOnlyButton = false;
        this._primaryBackgroundStyle = 'none';
        this._delegate = null;

        this._columnWidths = {
            primary: 320,
            supplementary: 320,
            secondary: 0,
        };

        this._minimumColumnWidths = {
            primary: 280,
            supplementary: 280,
        };

        this._maximumColumnWidths = {
            primary: 400,
            supplementary: 400,
        };

        this._primaryViewController = null;
        this._supplementaryViewController = null;
        this._secondaryViewController = null;
        this._compactViewController = null;

        this._separatorColor = UIColor.colorWithRedGreenBlueAlpha(0, 0, 0, 0.12);
        this._separatorElements = [];
    }

    get style() { return this._style; }
    get displayMode() { return this._displayMode; }
    get preferredDisplayMode() { return this._preferredDisplayMode; }
    set preferredDisplayMode(value) {
        this._preferredDisplayMode = value;
        this._layoutColumns();
    }
    get delegate() { return this._delegate; }
    set delegate(value) { this._delegate = value; }
    get isCollapsed() { return this._isCollapsed; }
    get presentsWithGesture() { return this._presentsWithGesture; }
    set presentsWithGesture(value) { this._presentsWithGesture = value; }
    get primaryEdge() { return this._primaryEdge; }
    get primaryBackgroundStyle() { return this._primaryBackgroundStyle; }

    get viewControllers() { return [...this._viewControllers]; }
    set viewControllers(vcs) {
        this._viewControllers = vcs ? [...vcs] : [];
        this._assignViewControllersToColumns();
        this._updateChildViewControllers();
        this._layoutColumns();
    }

    get primaryViewController() { return this._primaryViewController; }
    get secondaryViewController() { return this._secondaryViewController; }
    get supplementaryViewController() { return this._supplementaryViewController; }

    setViewController(vc, forColumn) {
        switch (forColumn) {
            case UISplitViewControllerColumn.primary:
                this._primaryViewController = vc;
                break;
            case UISplitViewControllerColumn.supplementary:
                this._supplementaryViewController = vc;
                break;
            case UISplitViewControllerColumn.secondary:
                this._secondaryViewController = vc;
                break;
        }
        this._updateChildViewControllers();
        this._layoutColumns();
    }

    viewController(forColumn) {
        switch (forColumn) {
            case UISplitViewControllerColumn.primary: return this._primaryViewController;
            case UISplitViewControllerColumn.supplementary: return this._supplementaryViewController;
            case UISplitViewControllerColumn.secondary: return this._secondaryViewController;
            default: return null;
        }
    }

    loadView() {
        this._view = new UIView();
        this._view.init();
        if (this._view._element) {
            this._view._element.style.overflow = 'hidden';
        }
    }

    viewDidLoad() {
        this._updateChildViewControllers();
        this._layoutColumns();

        if (typeof window !== 'undefined') {
            this._resizeObserver = () => this._handleResize();
            window.addEventListener('resize', this._resizeObserver);
        }
    }

    _assignViewControllersToColumns() {
        const vcs = this._viewControllers;
        if (this._style === UISplitViewControllerStyle.doubleColumn) {
            this._primaryViewController = vcs[0] || null;
            this._secondaryViewController = vcs[1] || null;
            this._supplementaryViewController = null;
        } else {
            this._primaryViewController = vcs[0] || null;
            this._supplementaryViewController = vcs[1] || null;
            this._secondaryViewController = vcs[2] || null;
        }
    }

    _updateChildViewControllers() {
        const columns = [this._primaryViewController, this._supplementaryViewController, this._secondaryViewController].filter(Boolean);
        this._childViewControllers = columns;
        for (const vc of columns) {
            vc._splitViewController = this;
            vc._parentViewController = this;
        }
    }

    _handleResize() {
        const wasCollapsed = this._isCollapsed;
        this._evaluateCollapsedState();
        if (wasCollapsed !== this._isCollapsed) {
            this._transitionBetweenStates(wasCollapsed);
        }
        this._layoutColumns();
    }

    _evaluateCollapsedState() {
        if (!this._view) return;
        const width = this._view._bounds.width;

        if (this._delegate && this._delegate.splitViewController_collapseSecondary) {
            this._isCollapsed = width < 600;
        } else {
            this._isCollapsed = width < 600;
        }

        if (this._preferredDisplayMode !== UISplitViewControllerDisplayMode.automatic) {
            this._isCollapsed = false;
        }
    }

    _transitionBetweenState(fromCollapsed) {
        if (this._delegate) {
            if (!fromCollapsed && this._isCollapsed) {
                if (this._delegate.splitViewController_collapseSecondary) {
                    this._compactViewController = this._delegate.splitViewController_collapseSecondary(
                        this, this._secondaryViewController, this._primaryViewController
                    );
                }
            } else if (fromCollapsed && !this._isCollapsed) {
                if (this._delegate.splitViewController_separateSecondaryFrom) {
                    const result = this._delegate.splitViewController_separateSecondaryFrom(this, this._primaryViewController);
                    if (result) {
                        this._secondaryViewController = result;
                    }
                }
            }
        }
    }

    _layoutColumns() {
        if (!this._view?._element) return;
        const container = this._view._element;
        const width = this._view._bounds.width;
        const height = this._view._bounds.height;

        this._clearSeparators();

        if (this._isCollapsed) {
            this._layoutCollapsed(container, width, height);
        } else {
            this._layoutExpanded(container, width, height);
        }
    }

    _layoutCollapsed(container, width, height) {
        this._hideAllColumnViews();
        let compactVC = this._compactViewController || this._primaryViewController;
        if (!compactVC) return;
        const view = compactVC.view;
        if (view?._element) {
            view._element.style.cssText = `
                position: absolute; left: 0; top: 0;
                width: ${width}px; height: ${height}px;
            `;
            if (container.contains && !container.contains(view._element)) {
                container.appendChild(view._element);
            }
        }
    }

    _layoutExpanded(container, width, height) {
        if (this._style === UISplitViewControllerStyle.doubleColumn) {
            this._layoutDoubleColumn(container, width, height);
        } else {
            this._layoutTripleColumn(container, width, height);
        }
    }

    _layoutDoubleColumn(container, width, height) {
        const primaryWidth = Math.min(
            this._maximumColumnWidths.primary,
            Math.max(this._minimumColumnWidths.primary, this._columnWidths.primary)
        );

        if (this._primaryViewController?.view?._element) {
            const el = this._primaryViewController.view._element;
            el.style.cssText = `
                position: absolute; left: 0; top: 0;
                width: ${primaryWidth}px; height: ${height}px;
                overflow: auto;
            `;
            if (container.contains && !container.contains(el)) container.appendChild(el);
        }

        this._addSeparator(container, primaryWidth, height);

        if (this._secondaryViewController?.view?._element) {
            const el = this._secondaryViewController.view._element;
            el.style.cssText = `
                position: absolute; left: ${primaryWidth + 1}px; top: 0;
                width: ${width - primaryWidth - 1}px; height: ${height}px;
                overflow: auto;
            `;
            if (container.contains && !container.contains(el)) container.appendChild(el);
        }
    }

    _layoutTripleColumn(container, width, height) {
        const primaryWidth = Math.min(
            this._maximumColumnWidths.primary,
            Math.max(this._minimumColumnWidths.primary, this._columnWidths.primary)
        );
        const suppWidth = Math.min(
            this._maximumColumnWidths.supplementary,
            Math.max(this._minimumColumnWidths.supplementary, this._columnWidths.supplementary)
        );

        if (this._primaryViewController?.view?._element) {
            const el = this._primaryViewController.view._element;
            el.style.cssText = `
                position: absolute; left: 0; top: 0;
                width: ${primaryWidth}px; height: ${height}px;
                overflow: auto;
            `;
            if (container.contains && !container.contains(el)) container.appendChild(el);
        }

        this._addSeparator(container, primaryWidth, height);

        if (this._supplementaryViewController?.view?._element) {
            const el = this._supplementaryViewController.view._element;
            el.style.cssText = `
                position: absolute; left: ${primaryWidth + 1}px; top: 0;
                width: ${suppWidth}px; height: ${height}px;
                overflow: auto;
            `;
            if (container.contains && !container.contains(el)) container.appendChild(el);
        }

        this._addSeparator(container, primaryWidth + 1 + suppWidth, height);

        if (this._secondaryViewController?.view?._element) {
            const el = this._secondaryViewController.view._element;
            const secondaryLeft = primaryWidth + 1 + suppWidth + 1;
            el.style.cssText = `
                position: absolute; left: ${secondaryLeft}px; top: 0;
                width: ${width - secondaryLeft}px; height: ${height}px;
                overflow: auto;
            `;
            if (container.contains && !container.contains(el)) container.appendChild(el);
        }
    }

    _hideAllColumnViews() {
        for (const vc of [this._primaryViewController, this._supplementaryViewController, this._secondaryViewController]) {
            if (vc?.view?._element) {
                vc.view._element.style.display = 'none';
            }
        }
    }

    _addSeparator(container, left, height) {
        if (typeof document === 'undefined') return;
        const sep = document.createElement('div');
        sep.style.cssText = `
            position: absolute; left: ${left}px; top: 0;
            width: 1px; height: ${height}px;
            background: rgba(0,0,0,0.12); pointer-events: none;
        `;
        container.appendChild(sep);
        this._separatorElements.push(sep);
    }

    _clearSeparators() {
        for (const sep of this._separatorElements) {
            sep.remove();
        }
        this._separatorElements = [];
    }

    showDetailViewController(vc, sender) {
        if (this._isCollapsed && this._primaryViewController) {
            if (this._primaryViewController.showDetailViewController) {
                this._primaryViewController.showDetailViewController(vc, sender);
            } else if (this._primaryViewController.navigationController) {
                this._primaryViewController.navigationController.pushViewController(vc, true);
            }
        } else {
            this._secondaryViewController = vc;
            this._updateChildViewControllers();
            this._layoutColumns();
        }
    }

    setPreferredColumnWidth(width, forColumn) {
        this._columnWidths[forColumn] = width;
        this._layoutColumns();
    }
}

export {
    UISplitViewController,
    UISplitViewControllerColumn,
    UISplitViewControllerDisplayMode,
    UISplitViewControllerStyle,
};
export default UISplitViewController;
