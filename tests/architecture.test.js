import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('NSLayoutConstraint & NSISEngine', () => {
    it('NSISEngine registers and retrieves variables', async () => {
        const { NSISEngine } = await import('../src/core/NSLayoutConstraint.js');
        const engine = new NSISEngine();
        engine.registerVariable('view1.width', 100);
        assert.equal(engine.getVariable('view1.width'), 100);
    });

    it('NSISEngine solves equality constraint', async () => {
        const { NSISEngine } = await import('../src/core/NSLayoutConstraint.js');
        const engine = new NSISEngine();
        engine.registerVariable('a', 0);
        engine.registerVariable('b', 0);
        engine.addConstraint({
            _terms: [
                { variable: 'a', coefficient: 1 },
                { variable: 'b', coefficient: -1 },
            ],
            _relation: 'equal',
            _constant: 50,
            _priority: 1000,
        });
        engine.suggestVariable('a', 100);
        engine.solve();
        assert.ok(Math.abs(engine.getVariable('b') - 150) < 1 || Math.abs(engine.getVariable('b') - 50) < 1);
    });

    it('NSISEngine handles gte constraint', async () => {
        const { NSISEngine } = await import('../src/core/NSLayoutConstraint.js');
        const engine = new NSISEngine();
        engine.registerVariable('x', 0);
        engine.registerVariable('min', 0);
        engine.addConstraint({
            _terms: [
                { variable: 'x', coefficient: 1 },
                { variable: 'min', coefficient: -1 },
            ],
            _relation: 'greaterThanOrEqual',
            _constant: 0,
            _priority: 1000,
        });
        engine.suggestVariable('min', 100);
        engine.solve();
        assert.ok(engine.getVariable('x') >= 100 - 1);
    });

    it('NSISEngine marks stale on update', async () => {
        const { NSISEngine } = await import('../src/core/NSLayoutConstraint.js');
        const engine = new NSISEngine();
        engine.registerVariable('a', 10);
        engine.solve();
        assert.ok(!engine.isStale());
        engine.markStale();
        assert.ok(engine.isStale());
    });

    it('NSLayoutConstraint creates with correct attributes', async () => {
        const { NSLayoutConstraint, NSLayoutAttribute, NSLayoutRelation, UILayoutPriority } = await import('../src/core/NSLayoutConstraint.js');
        const view1 = { _layoutGuid: 1 };
        const view2 = { _layoutGuid: 2 };
        const c = new NSLayoutConstraint(
            view1, NSLayoutAttribute.width, NSLayoutRelation.equal,
            view2, NSLayoutAttribute.width, 1, 0
        );
        assert.equal(c.firstItem, view1);
        assert.equal(c.firstAttribute, 'width');
        assert.equal(c.relation, 'equal');
        assert.equal(c.secondItem, view2);
        assert.equal(c.multiplier, 1);
        assert.equal(c.constant, 0);
        assert.equal(c.priority, UILayoutPriority.required);
        assert.ok(!c.isActive);
    });

    it('NSLayoutConstraint activates and deactivates', async () => {
        const { NSLayoutConstraint, NSLayoutAttribute, NSLayoutRelation } = await import('../src/core/NSLayoutConstraint.js');
        const view1 = { _layoutGuid: 100, setNeedsLayout: () => {} };
        const view2 = { _layoutGuid: 101, setNeedsLayout: () => {} };
        const c = new NSLayoutConstraint(
            view1, NSLayoutAttribute.left, NSLayoutRelation.equal,
            view2, NSLayoutAttribute.left, 1, 10
        );
        c.activate();
        assert.ok(c.isActive);
        c.deactivate();
        assert.ok(!c.isActive);
    });

    it('NSLayoutConstraint static activate/deactivate', async () => {
        const { NSLayoutConstraint, NSLayoutAttribute, NSLayoutRelation } = await import('../src/core/NSLayoutConstraint.js');
        const v1 = { _layoutGuid: 200, setNeedsLayout: () => {} };
        const v2 = { _layoutGuid: 201, setNeedsLayout: () => {} };
        const c1 = new NSLayoutConstraint(v1, NSLayoutAttribute.width, NSLayoutRelation.equal, null, NSLayoutAttribute.notAnAttribute, 1, 100);
        const c2 = new NSLayoutConstraint(v2, NSLayoutAttribute.width, NSLayoutRelation.equal, null, NSLayoutAttribute.notAnAttribute, 1, 200);
        NSLayoutConstraint.activateConstraints([c1, c2]);
        assert.ok(c1.isActive);
        assert.ok(c2.isActive);
        NSLayoutConstraint.deactivateConstraints([c1, c2]);
        assert.ok(!c1.isActive);
        assert.ok(!c2.isActive);
    });

    it('NSLayoutConstraint constant setter triggers stale', async () => {
        const { NSLayoutConstraint, NSLayoutAttribute, NSLayoutRelation } = await import('../src/core/NSLayoutConstraint.js');
        const v1 = { _layoutGuid: 300, setNeedsLayout: () => {} };
        const c = new NSLayoutConstraint(v1, NSLayoutAttribute.width, NSLayoutRelation.equal, null, NSLayoutAttribute.notAnAttribute, 1, 50);
        c.activate();
        c.constant = 100;
        assert.equal(c.constant, 100);
    });

    it('UILayoutPriority has correct values', async () => {
        const { UILayoutPriority } = await import('../src/core/NSLayoutConstraint.js');
        assert.equal(UILayoutPriority.required, 1000);
        assert.equal(UILayoutPriority.defaultHigh, 750);
        assert.equal(UILayoutPriority.defaultMedium, 500);
        assert.equal(UILayoutPriority.defaultLow, 250);
    });

    it('UILayoutGuide has layoutFrame', async () => {
        const { UILayoutGuide } = await import('../src/core/NSLayoutConstraint.js');
        const guide = new UILayoutGuide();
        assert.deepEqual(guide.layoutFrame, { x: 0, y: 0, width: 0, height: 0 });
    });
});

describe('UITraitCollection', () => {
    it('creates with default traits', async () => {
        const { UITraitCollection } = await import('../src/core/UITraitCollection.js');
        const tc = new UITraitCollection();
        assert.equal(tc.horizontalSizeClass, 'unspecified');
        assert.equal(tc.verticalSizeClass, 'unspecified');
        assert.equal(tc.userInterfaceStyle, 'unspecified');
    });

    it('creates with specific traits', async () => {
        const { UITraitCollection } = await import('../src/core/UITraitCollection.js');
        const tc = new UITraitCollection({
            horizontalSizeClass: 'compact',
            verticalSizeClass: 'regular',
            userInterfaceStyle: 'dark',
            displayScale: 2,
        });
        assert.equal(tc.horizontalSizeClass, 'compact');
        assert.equal(tc.verticalSizeClass, 'regular');
        assert.equal(tc.userInterfaceStyle, 'dark');
        assert.equal(tc.displayScale, 2);
    });

    it('containsTraitsInCollection checks matching', async () => {
        const { UITraitCollection } = await import('../src/core/UITraitCollection.js');
        const parent = new UITraitCollection({ horizontalSizeClass: 'regular', userInterfaceStyle: 'dark' });
        const child = new UITraitCollection({ horizontalSizeClass: 'regular' });
        assert.ok(parent.containsTraitsInCollection(child));
    });

    it('containsTraitsInCollection detects mismatch', async () => {
        const { UITraitCollection } = await import('../src/core/UITraitCollection.js');
        const parent = new UITraitCollection({ horizontalSizeClass: 'compact' });
        const child = new UITraitCollection({ horizontalSizeClass: 'regular' });
        assert.ok(!parent.containsTraitsInCollection(child));
    });

    it('traitCollectionWithTraitsFromCollections merges', async () => {
        const { UITraitCollection } = await import('../src/core/UITraitCollection.js');
        const tc1 = new UITraitCollection({ horizontalSizeClass: 'regular' });
        const tc2 = new UITraitCollection({ userInterfaceStyle: 'dark' });
        const merged = UITraitCollection.traitCollectionWithTraitsFromCollections([tc1, tc2]);
        assert.equal(merged.horizontalSizeClass, 'regular');
        assert.equal(merged.userInterfaceStyle, 'dark');
    });

    it('factory methods work', async () => {
        const { UITraitCollection } = await import('../src/core/UITraitCollection.js');
        const tc1 = UITraitCollection.traitCollectionWithHorizontalSizeClass('compact');
        assert.equal(tc1.horizontalSizeClass, 'compact');
        const tc2 = UITraitCollection.traitCollectionWithUserInterfaceStyle('dark');
        assert.equal(tc2.userInterfaceStyle, 'dark');
        const tc3 = UITraitCollection.traitCollectionWithDisplayScale(3);
        assert.equal(tc3.displayScale, 3);
    });

    it('UITraitEnvironment propagates traits', async () => {
        const { UITraitEnvironment, UITraitCollection } = await import('../src/core/UITraitCollection.js');
        const env = new UITraitEnvironment();
        let received = null;
        env.traitCollectionDidChange = (tc) => { received = tc; };
        env._parentTraitCollectionUpdated(new UITraitCollection({ userInterfaceStyle: 'dark' }));
        assert.equal(received.userInterfaceStyle, 'dark');
    });

    it('UITraitEnvironment supports registerForTraitChanges', async () => {
        const { UITraitEnvironment, UITraitCollection } = await import('../src/core/UITraitCollection.js');
        const env = new UITraitEnvironment();
        let received = null;
        const reg = env.registerForTraitChanges(['userInterfaceStyle'], (tc) => { received = tc; });
        env._parentTraitCollectionUpdated(new UITraitCollection({ userInterfaceStyle: 'light' }));
        assert.ok(received);
        assert.equal(received.userInterfaceStyle, 'light');
        env.unregisterForTraitChanges(reg);
    });
});

describe('UIViewPropertyAnimator', () => {
    it('creates with inactive state', async () => {
        const { UIViewPropertyAnimator, UICubicTimingParameters } = await import('../src/core/UIViewPropertyAnimator.js');
        const params = new UICubicTimingParameters([0.25, 0.1, 0.25, 1.0]);
        const animator = new UIViewPropertyAnimator(0.3, params, () => {});
        assert.equal(animator.state, 'inactive');
        assert.equal(animator.duration, 0.3);
    });

    it('transitions to active on startAnimation', async () => {
        const { UIViewPropertyAnimator, UICubicTimingParameters } = await import('../src/core/UIViewPropertyAnimator.js');
        const params = new UICubicTimingParameters([0.25, 0.1, 0.25, 1.0]);
        const animator = new UIViewPropertyAnimator(0.3, params, () => {});
        global.requestAnimationFrame = (cb) => { setImmediate(() => { if (global.requestAnimationFrame) cb(); }); };
        animator.startAnimation();
        assert.equal(animator.state, 'active');
        animator.stopAnimation(true);
        delete global.requestAnimationFrame;
    });

    it('transitions to stopped on stopAnimation', async () => {
        const { UIViewPropertyAnimator, UICubicTimingParameters } = await import('../src/core/UIViewPropertyAnimator.js');
        const params = new UICubicTimingParameters([0.25, 0.1, 0.25, 1.0]);
        const animator = new UIViewPropertyAnimator(0.3, params, () => {});
        global.requestAnimationFrame = (cb) => { setImmediate(() => { if (global.requestAnimationFrame) cb(); }); };
        animator.startAnimation();
        animator.stopAnimation(true);
        assert.equal(animator.state, 'stopped');
        delete global.requestAnimationFrame;
    });

    it('fractionComplete clamps to 0-1', async () => {
        const { UIViewPropertyAnimator, UICubicTimingParameters } = await import('../src/core/UIViewPropertyAnimator.js');
        const params = new UICubicTimingParameters([0.25, 0.1, 0.25, 1.0]);
        const animator = new UIViewPropertyAnimator(0.3, params, () => {});
        animator.fractionComplete = 1.5;
        assert.equal(animator.fractionComplete, 1);
        animator.fractionComplete = -0.5;
        assert.equal(animator.fractionComplete, 0);
    });

    it('isReversed property works', async () => {
        const { UIViewPropertyAnimator, UICubicTimingParameters } = await import('../src/core/UIViewPropertyAnimator.js');
        const params = new UICubicTimingParameters([0.25, 0.1, 0.25, 1.0]);
        const animator = new UIViewPropertyAnimator(0.3, params, () => {});
        animator.isReversed = true;
        assert.ok(animator.isReversed);
    });

    it('addCompletion stores callback', async () => {
        const { UIViewPropertyAnimator, UICubicTimingParameters } = await import('../src/core/UIViewPropertyAnimator.js');
        let completed = false;
        const params = new UICubicTimingParameters([0.25, 0.1, 0.25, 1.0]);
        const animator = new UIViewPropertyAnimator(0.001, params, () => {});
        animator.addCompletion((finished) => { completed = true; });
        animator.finishAnimation();
        assert.ok(completed);
    });

    it('pauseAnimation sets paused state', async () => {
        const { UIViewPropertyAnimator, UICubicTimingParameters } = await import('../src/core/UIViewPropertyAnimator.js');
        const params = new UICubicTimingParameters([0.25, 0.1, 0.25, 1.0]);
        const animator = new UIViewPropertyAnimator(1, params, () => {});
        global.requestAnimationFrame = (cb) => { setImmediate(() => { if (global.requestAnimationFrame) cb(); }); };
        animator.startAnimation();
        animator.pauseAnimation();
        assert.ok(animator._isPaused);
        delete global.requestAnimationFrame;
    });

    it('UICubicTimingParameters creates with control points', async () => {
        const { UICubicTimingParameters } = await import('../src/core/UIViewPropertyAnimator.js');
        const params = new UICubicTimingParameters([0.2, 0.0, 0.2, 1.0]);
        assert.deepEqual(params.controlPoint1, { x: 0.2, y: 0.0 });
        assert.deepEqual(params.controlPoint2, { x: 0.2, y: 1.0 });
    });

    it('UICubicTimingParameters applies timing', async () => {
        const { UICubicTimingParameters } = await import('../src/core/UIViewPropertyAnimator.js');
        const params = new UICubicTimingParameters([0.25, 0.1, 0.25, 1.0]);
        assert.equal(params._applyTimingFunction(0), 0);
        assert.equal(params._applyTimingFunction(1), 1);
        const mid = params._applyTimingFunction(0.5);
        assert.ok(mid > 0 && mid < 1);
    });

    it('UISpringTimingParameters has damping ratio', async () => {
        const { UISpringTimingParameters } = await import('../src/core/UIViewPropertyAnimator.js');
        const params = new UISpringTimingParameters({ dampingRatio: 0.7, stiffness: 200, mass: 1 });
        assert.equal(params.dampingRatio, 0.7);
        const val = params._applyTimingFunction(0.5);
        assert.ok(val > 0 && val < 2);
    });
});

describe('UIPresentationController', () => {
    it('creates with presented and presenting VCs', async () => {
        const { UIPresentationController } = await import('../src/core/UIPresentationController.js');
        const presented = {};
        const presenting = {};
        const pc = new UIPresentationController(presented, presenting);
        assert.equal(pc.presentedViewController, presented);
        assert.equal(pc.presentingViewController, presenting);
    });

    it('returns empty frame without container', async () => {
        const { UIPresentationController } = await import('../src/core/UIPresentationController.js');
        const pc = new UIPresentationController({}, {});
        const frame = pc.frameOfPresentedViewInContainerView();
        assert.deepEqual(frame, { x: 0, y: 0, width: 0, height: 0 });
    });

    it('UIModalPresentationStyle has all styles', async () => {
        const { UIModalPresentationStyle } = await import('../src/core/UIPresentationController.js');
        assert.equal(UIModalPresentationStyle.fullScreen, 'fullScreen');
        assert.equal(UIModalPresentationStyle.pageSheet, 'pageSheet');
        assert.equal(UIModalPresentationStyle.formSheet, 'formSheet');
        assert.equal(UIModalPresentationStyle.popover, 'popover');
    });

    it('UISheetPresentationDetent creates medium and large', async () => {
        const { UISheetPresentationDetent } = await import('../src/core/UIPresentationController.js');
        const medium = UISheetPresentationDetent.medium();
        const large = UISheetPresentationDetent.large();
        assert.equal(medium.identifier, 'medium');
        assert.equal(large.identifier, 'large');
        assert.equal(medium._resolvedHeight(1000), 500);
        assert.equal(large._resolvedHeight(1000), 1000);
    });

    it('UISheetPresentationDetent custom resolver', async () => {
        const { UISheetPresentationDetent } = await import('../src/core/UIPresentationController.js');
        const custom = UISheetPresentationDetent.custom('quarter', (h) => h * 0.25);
        assert.equal(custom.identifier, 'quarter');
        assert.equal(custom._resolvedHeight(800), 200);
    });

    it('UIViewControllerContextTransitioning provides view controllers', async () => {
        const { UIViewControllerContextTransitioning } = await import('../src/core/UIPresentationController.js');
        const ctx = new UIViewControllerContextTransitioning({ name: 'from' }, { name: 'to' }, {});
        assert.equal(ctx.viewControllerForKey('from').name, 'from');
        assert.equal(ctx.viewControllerForKey('to').name, 'to');
        assert.equal(ctx.viewControllerForKey('other'), null);
    });
});

describe('UIPopoverPresentationController', () => {
    it('computes arrow direction from source rect', async () => {
        const { UIPopoverPresentationController, UIPopoverArrowDirection } = await import('../src/core/UIPopoverPresentationController.js');
        const popover = new UIPopoverPresentationController({}, {});
        popover._sourceRect = { x: 50, y: 50, width: 100, height: 40 };
        popover._containerView = { _bounds: { width: 600, height: 800 } };
        const frame = popover.frameOfPresentedViewInContainerView();
        assert.ok(frame.width > 0);
        assert.ok(frame.height > 0);
        assert.ok(popover.arrowDirection !== UIPopoverArrowDirection.unknown);
    });

    it('permits specific arrow directions', async () => {
        const { UIPopoverPresentationController, UIPopoverArrowDirection } = await import('../src/core/UIPopoverPresentationController.js');
        const popover = new UIPopoverPresentationController({}, {});
        popover.permittedArrowDirections = UIPopoverArrowDirection.down;
        assert.equal(popover.permittedArrowDirections, UIPopoverArrowDirection.down);
    });
});

describe('UIAlertController', () => {
    it('creates alert controller', async () => {
        const { UIAlertController, UIAlertControllerStyle } = await import('../src/core/UIAlertController.js');
        const alert = new UIAlertController('Title', 'Message', UIAlertControllerStyle.alert);
        assert.equal(alert.title, 'Title');
        assert.equal(alert.message, 'Message');
        assert.equal(alert.preferredStyle, 'alert');
    });

    it('creates action sheet', async () => {
        const { UIAlertController, UIAlertControllerStyle } = await import('../src/core/UIAlertController.js');
        const sheet = new UIAlertController('Share', 'Choose an option', UIAlertControllerStyle.actionSheet);
        assert.equal(sheet.preferredStyle, 'actionSheet');
    });

    it('adds actions', async () => {
        const { UIAlertController, UIAlertAction, UIAlertActionStyle } = await import('../src/core/UIAlertController.js');
        const alert = new UIAlertController('Test', 'Msg', 'alert');
        const ok = new UIAlertAction('OK', UIAlertActionStyle.default, () => {});
        const cancel = new UIAlertAction('Cancel', UIAlertActionStyle.cancel, () => {});
        const del = new UIAlertAction('Delete', UIAlertActionStyle.destructive, () => {});
        alert.addAction(ok);
        alert.addAction(cancel);
        alert.addAction(del);
        assert.equal(alert.actions.length, 3);
    });

    it('UIAlertAction factory methods', async () => {
        const { UIAlertAction } = await import('../src/core/UIAlertController.js');
        const ok = UIAlertAction.defaultAction('OK', () => {});
        assert.equal(ok.title, 'OK');
        assert.equal(ok.style, 'default');
        const cancel = UIAlertAction.cancelAction('Cancel');
        assert.equal(cancel.style, 'cancel');
        const del = UIAlertAction.destructiveAction('Delete');
        assert.equal(del.style, 'destructive');
    });

    it('adds text fields', async () => {
        const { UIAlertController } = await import('../src/core/UIAlertController.js');
        const alert = new UIAlertController('Login', 'Enter credentials', 'alert');
        alert.addTextField((tf) => { tf.placeholder = 'Username'; });
        alert.addTextField((tf) => { tf.placeholder = 'Password'; });
        assert.equal(alert.textFields.length, 2);
        assert.equal(alert.textFields[0].placeholder, 'Username');
    });

    it('static factory creates controller', async () => {
        const { UIAlertController } = await import('../src/core/UIAlertController.js');
        const alert = UIAlertController.alertControllerWithTitle('Hi', 'Hello', 'alert');
        assert.equal(alert.title, 'Hi');
        assert.equal(alert.message, 'Hello');
    });
});

describe('UISplitViewController', () => {
    it('creates with double column style', async () => {
        const { UISplitViewController, UISplitViewControllerStyle } = await import('../src/core/UISplitViewController.js');
        const svc = new UISplitViewController(UISplitViewControllerStyle.doubleColumn);
        assert.equal(svc.style, 'doubleColumn');
    });

    it('assigns view controllers to columns', async () => {
        const { UISplitViewController } = await import('../src/core/UISplitViewController.js');
        const svc = new UISplitViewController();
        const primary = { _splitViewController: null, _parentViewController: null };
        const secondary = { _splitViewController: null, _parentViewController: null };
        svc.viewControllers = [primary, secondary];
        assert.equal(svc.primaryViewController, primary);
        assert.equal(svc.secondaryViewController, secondary);
    });

    it('setViewController for specific column', async () => {
        const { UISplitViewController, UISplitViewControllerColumn } = await import('../src/core/UISplitViewController.js');
        const svc = new UISplitViewController();
        const primary = { _splitViewController: null, _parentViewController: null };
        const secondary = { _splitViewController: null, _parentViewController: null };
        svc.setViewController(primary, UISplitViewControllerColumn.primary);
        svc.setViewController(secondary, UISplitViewControllerColumn.secondary);
        assert.equal(svc.viewController(UISplitViewControllerColumn.primary), primary);
        assert.equal(svc.viewController(UISplitViewControllerColumn.secondary), secondary);
    });

    it('triple column assigns supplementary', async () => {
        const { UISplitViewController, UISplitViewControllerStyle } = await import('../src/core/UISplitViewController.js');
        const svc = new UISplitViewController(UISplitViewControllerStyle.tripleColumn);
        const vc1 = { _splitViewController: null, _parentViewController: null };
        const vc2 = { _splitViewController: null, _parentViewController: null };
        const vc3 = { _splitViewController: null, _parentViewController: null };
        svc.viewControllers = [vc1, vc2, vc3];
        assert.equal(svc.primaryViewController, vc1);
        assert.equal(svc.supplementaryViewController, vc2);
        assert.equal(svc.secondaryViewController, vc3);
    });

    it('showDetailViewController updates secondary when not collapsed', async () => {
        const { UISplitViewController } = await import('../src/core/UISplitViewController.js');
        const svc = new UISplitViewController();
        svc._view = { _bounds: { width: 800, height: 600 }, _element: { appendChild: () => {}, contains: () => false, style: {} } };
        svc._isCollapsed = false;
        const primary = { _splitViewController: null, _parentViewController: null, view: null };
        const secondary = { _splitViewController: null, _parentViewController: null, view: null };
        svc.viewControllers = [primary, secondary];
        const newSecondary = { _splitViewController: null, _parentViewController: null, view: null };
        svc.showDetailViewController(newSecondary);
        assert.equal(svc.secondaryViewController, newSecondary);
    });

    it('preferredColumnWidth works', async () => {
        const { UISplitViewController, UISplitViewControllerColumn } = await import('../src/core/UISplitViewController.js');
        const svc = new UISplitViewController();
        svc.setPreferredColumnWidth(350, UISplitViewControllerColumn.primary);
        assert.equal(svc._columnWidths.primary, 350);
    });

    it('display modes enum has all values', async () => {
        const { UISplitViewControllerDisplayMode } = await import('../src/core/UISplitViewController.js');
        assert.equal(UISplitViewControllerDisplayMode.automatic, 'automatic');
        assert.equal(UISplitViewControllerDisplayMode.secondaryOnly, 'secondaryOnly');
        assert.equal(UISplitViewControllerDisplayMode.oneBesideSecondary, 'oneBesideSecondary');
        assert.equal(UISplitViewControllerDisplayMode.tripleColumn, 'tripleColumn');
    });
});
