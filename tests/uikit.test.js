import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

const UIResponder = (await import('../src/core/UIResponder.js')).default;
const UIView = (await import('../src/core/UIView.js')).default;
const UIViewController = (await import('../src/core/UIViewController.js')).default;
const UIWindow = (await import('../src/core/UIWindow.js')).default;
const { CALayer } = await import('../src/core/CALayer.js');

describe('UIResponder', () => {
    let responder;

    beforeEach(() => {
        responder = new UIResponder();
    });

    it('should create UIResponder instance', () => {
        assert.ok(responder instanceof UIResponder);
        assert.strictEqual(responder.nextResponder, null);
        assert.strictEqual(responder.isFirstResponder, false);
    });

    it('should become and resign first responder', () => {
        assert.strictEqual(responder.becomeFirstResponder(), true);
        assert.strictEqual(responder.isFirstResponder, true);
        assert.strictEqual(responder.resignFirstResponder(), true);
        assert.strictEqual(responder.isFirstResponder, false);
    });

    it('should handle touch events without error', () => {
        responder.touchesBegan([], null);
        responder.touchesMoved([], null);
        responder.touchesEnded([], null);
        responder.touchesCancelled([], null);
    });

    it('should handle motion events without error', () => {
        responder.motionBegan('shake', null);
        responder.motionEnded('shake', null);
        responder.motionCancelled('shake', null);
    });

    it('should handle press events without error', () => {
        responder.pressesBegan([], null);
        responder.pressesChanged([], null);
        responder.pressesEnded([], null);
        responder.pressesCancelled([], null);
    });

    it('should handle keyboard notifications without error', () => {
        responder.keyboardWillShow({});
        responder.keyboardWillHide({});
        responder.keyboardDidShow({});
        responder.keyboardDidHide({});
    });

    it('should add and remove gesture recognizers', () => {
        const gesture = {
            _view: null,
            _target: null
        };
        responder.addGestureRecognizer(gesture);
        assert.strictEqual(responder.gestureRecognizers().length, 1);
        assert.strictEqual(gesture._view, responder);
        responder.removeGestureRecognizer(gesture);
        assert.strictEqual(responder.gestureRecognizers().length, 0);
        assert.strictEqual(gesture._view, null);
    });

    it('should chain next responder', () => {
        const child = new UIResponder();
        responder._nextResponder = child;
        assert.strictEqual(responder.nextResponder, child);
    });
});

describe('UIView', () => {
    let view;

    beforeEach(() => {
        view = new UIView({ x: 0, y: 0, width: 100, height: 100 });
    });

    it('should create UIView instance with frame', () => {
        assert.ok(view instanceof UIView);
        assert.ok(view instanceof UIResponder);
        assert.deepStrictEqual(view.frame, { x: 0, y: 0, width: 100, height: 100 });
    });

    it('should have a CALayer instance', () => {
        assert.ok(view.layer instanceof CALayer);
        assert.deepStrictEqual(view.layer.frame, { x: 0, y: 0, width: 100, height: 100 });
    });

    it('should sync frame to layer', () => {
        view.frame = { x: 10, y: 20, width: 200, height: 150 };
        assert.deepStrictEqual(view.frame, { x: 10, y: 20, width: 200, height: 150 });
        assert.deepStrictEqual(view.layer.frame, { x: 10, y: 20, width: 200, height: 150 });
    });

    it('should update bounds and center when frame changes', () => {
        view.frame = { x: 50, y: 60, width: 200, height: 150 };
        assert.deepStrictEqual(view.bounds, { x: 0, y: 0, width: 200, height: 150 });
        assert.deepStrictEqual(view.center, { x: 150, y: 135 });
    });

    it('should add and remove subviews', () => {
        const child1 = new UIView({ x: 0, y: 0, width: 50, height: 50 });
        const child2 = new UIView({ x: 0, y: 0, width: 50, height: 50 });

        view.addSubview(child1);
        assert.strictEqual(child1.superview, view);
        assert.strictEqual(view.subviews.length, 1);

        view.addSubview(child2);
        assert.strictEqual(view.subviews.length, 2);

        view.removeSubview(child1);
        assert.strictEqual(child1.superview, null);
        assert.strictEqual(view.subviews.length, 1);
    });

    it('should remove from superview', () => {
        const child = new UIView({ x: 0, y: 0, width: 50, height: 50 });
        view.addSubview(child);
        child.removeFromSuperview();
        assert.strictEqual(child.superview, null);
        assert.strictEqual(view.subviews.length, 0);
    });

    it('should set alpha and hidden properties', () => {
        view.alpha = 0.5;
        assert.strictEqual(view.alpha, 0.5);
        assert.strictEqual(view.layer.opacity, 0.5);

        view.isHidden = true;
        assert.strictEqual(view.isHidden, true);
        assert.strictEqual(view.layer.isHidden, true);
    });

    it('should set clipsToBounds', () => {
        view.clipsToBounds = true;
        assert.strictEqual(view.clipsToBounds, true);
        assert.strictEqual(view.layer.masksToBounds, true);
    });

    it('should use shorthand property accessors', () => {
        view.x = 50;
        view.y = 60;
        view.width = 200;
        view.height = 150;

        assert.strictEqual(view.frame.x, 50);
        assert.strictEqual(view.frame.y, 60);
        assert.strictEqual(view.frame.width, 200);
        assert.strictEqual(view.frame.height, 150);
    });

    it('should schedule layout', () => {
        view.setNeedsLayout();
        assert.strictEqual(view._needsLayout, true);
    });

    it('should bring subview to front', () => {
        const child1 = new UIView({ x: 0, y: 0, width: 50, height: 50 });
        const child2 = new UIView({ x: 0, y: 0, width: 50, height: 50 });
        view.addSubview(child1);
        view.addSubview(child2);
        view.bringSubviewToFront(child1);
        assert.strictEqual(view.subviews[view.subviews.length - 1], child1);
    });

    it('should send subview to back', () => {
        const child1 = new UIView({ x: 0, y: 0, width: 50, height: 50 });
        const child2 = new UIView({ x: 0, y: 0, width: 50, height: 50 });
        view.addSubview(child1);
        view.addSubview(child2);
        view.sendSubviewToBack(child2);
        assert.strictEqual(view.subviews[0], child2);
    });

    it('should convert points', () => {
        const child = new UIView({ x: 20, y: 30, width: 100, height: 100 });
        view.addSubview(child);
        const point = { x: 10, y: 10 };
        const windowPoint = view.convertPointToWindow(point);
        assert.strictEqual(windowPoint.x, 10);
        assert.strictEqual(windowPoint.y, 10);
    });

    it('should hit test', () => {
        const child = new UIView({ x: 0, y: 0, width: 50, height: 50 });
        view.addSubview(child);
        const hit = view.hitTest({ x: 25, y: 25 }, null);
        assert.strictEqual(hit, child);
    });

    it('should return false for hit test when hidden', () => {
        view.isHidden = true;
        const hit = view.hitTest({ x: 50, y: 50 }, null);
        assert.strictEqual(hit, null);
    });

    it('should manage gesture recognizers', () => {
        const gesture = { _view: null };
        view.addGestureRecognizer(gesture);
        assert.strictEqual(gesture._view, view);
        assert.strictEqual(view.gestureRecognizers().length, 1);
    });

    it('should add and remove animations', () => {
        const animation = {
            _duration: 0.3,
            _timingFunction: 'ease-in-out'
        };
        view.addAnimation(animation, 'testKey');
        view.removeAnimation('testKey');
    });

    it('should size to fit', () => {
        view.sizeThatFits = () => ({ width: 75, height: 75 });
        view.sizeToFit();
        assert.strictEqual(view.width, 75);
        assert.strictEqual(view.height, 75);
    });

    it('should set accessibility properties', () => {
        view.setAccessibilityLabel('Test Label');
        view.setAccessibilityHint('Test Hint');
        assert.strictEqual(view._accessibilityLabel, 'Test Label');
        assert.strictEqual(view._accessibilityHint, 'Test Hint');
    });

    it('should add and remove constraints', () => {
        const constraint = { _view: null };
        view.addConstraint(constraint);
        assert.strictEqual(constraint._view, view);
        assert.strictEqual(view.constraints().length, 1);
        view.removeConstraint(constraint);
        assert.strictEqual(constraint._view, null);
    });
});

describe('UIViewController', () => {
    let viewController;

    beforeEach(() => {
        viewController = new UIViewController();
    });

    it('should create UIViewController instance', () => {
        assert.ok(viewController instanceof UIViewController);
        assert.ok(viewController instanceof UIResponder);
        assert.strictEqual(viewController.title, '');
        assert.strictEqual(viewController.isViewLoaded, false);
    });

    it('should load view on access', () => {
        const v = viewController.view;
        assert.ok(v instanceof UIView);
        assert.strictEqual(viewController.isViewLoaded, true);
        assert.strictEqual(v._nextResponder, viewController);
    });

    it('should set and get title', () => {
        viewController.title = 'Test Title';
        assert.strictEqual(viewController.title, 'Test Title');
    });

    it('should add and remove child view controllers', () => {
        const child = new UIViewController();
        viewController.addChildViewController(child);
        assert.strictEqual(child.parentViewController, viewController);
        assert.strictEqual(viewController.childViewControllers.length, 1);
        child.removeFromParentViewController();
        assert.strictEqual(child.parentViewController, null);
    });

    it('should present and dismiss view controller', async () => {
        const presented = new UIViewController();
        await viewController.presentViewController(presented, false, null);
        assert.strictEqual(viewController.modalViewController, presented);
        assert.strictEqual(presented.presentingViewController, viewController);
        await viewController.dismissViewController(false, null);
        assert.strictEqual(viewController.modalViewController, null);
    });

    it('should set toolbar items', () => {
        const items = [{ title: 'Item 1' }, { title: 'Item 2' }];
        viewController.toolbarItems = items;
        assert.strictEqual(viewController.toolbarItems.length, 2);
    });

    it('should check status bar preferences', () => {
        assert.strictEqual(viewController.prefersStatusBarHidden(), false);
        assert.strictEqual(viewController.preferredStatusBarStyle(), 'default');
        assert.strictEqual(viewController.prefersHomeIndicatorAutoHidden(), false);
    });

    it('should load view only once', () => {
        const v1 = viewController.view;
        const v2 = viewController.view;
        assert.strictEqual(v1, v2);
    });

    it('should call lifecycle methods without error', () => {
        viewController.viewWillAppear();
        viewController.viewDidAppear();
        viewController.viewWillDisappear();
        viewController.viewDidDisappear();
        viewController.viewWillLayout();
        viewController.viewDidLayout();
        viewController.viewDidLoad();
    });
});

describe('UIWindow', () => {
    let window;

    beforeEach(() => {
        window = new UIWindow({ x: 0, y: 0, width: 800, height: 600 });
    });

    afterEach(() => {
        window.destroy();
    });

    it('should create UIWindow instance', () => {
        assert.ok(window instanceof UIWindow);
        assert.ok(window instanceof UIView);
        assert.deepStrictEqual(window.frame, { x: 0, y: 0, width: 800, height: 600 });
        assert.strictEqual(window.rootViewController, null);
        assert.strictEqual(window.windowLevel, 0);
        assert.strictEqual(window.isKeyWindow, false);
        assert.strictEqual(window.isVisible, false);
    });

    it('should set and get root view controller', () => {
        const vc = new UIViewController();
        window.rootViewController = vc;
        assert.strictEqual(window.rootViewController, vc);
        assert.strictEqual(vc.view._window, window);
    });

    it('should setup root view when view controller is set', () => {
        const vc = new UIViewController();
        const view = vc.view;
        window.rootViewController = vc;
        assert.strictEqual(window._rootView, view);
    });

    it('should make and resign key window', () => {
        window.makeKeyWindow();
        assert.strictEqual(window.isKeyWindow, true);
        window.resignKeyWindow();
        assert.strictEqual(window.isKeyWindow, false);
    });

    it('should make key and visible', () => {
        window.makeKeyAndVisible();
        assert.strictEqual(window.isKeyWindow, true);
        assert.strictEqual(window.isVisible, true);
    });

    it('should hide and show', () => {
        window.hide();
        assert.strictEqual(window.isVisible, false);
        window.show();
        assert.strictEqual(window.isVisible, true);
    });

    it('should set window level', () => {
        window.windowLevel = 100;
        assert.strictEqual(window.windowLevel, 100);
    });

    it('should manage subwindows', () => {
        const subwindow = new UIWindow({ x: 0, y: 0, width: 400, height: 300 });
        window.addSubwindow(subwindow);
        assert.strictEqual(window._subwindowStorage.length, 1);
        assert.strictEqual(subwindow._window, window);
        window.removeSubwindow(subwindow);
        assert.strictEqual(window._subwindowStorage.length, 0);
        assert.strictEqual(subwindow._window, null);
    });

    it('should close window', () => {
        window.makeKeyAndVisible();
        window.close();
        assert.strictEqual(window.isVisible, false);
    });

    it('should track all windows', () => {
        const allWindows = UIWindow.allWindows();
        assert.ok(Array.isArray(allWindows));
    });

    it('should find key window', () => {
        const keyWindow = UIWindow.keyWindow();
        assert.ok(keyWindow === null || keyWindow instanceof UIWindow);
    });

    it('should sync frame when setFrame is called', () => {
        window.setFrame({ x: 0, y: 0, width: 1024, height: 768 });
        assert.strictEqual(window.frame.width, 1024);
        assert.strictEqual(window.frame.height, 768);
    });

    it('should layout subviews with root view', () => {
        const vc = new UIViewController();
        window.rootViewController = vc;
        window.layoutSubviews();
        assert.strictEqual(window._rootView._bounds.width, 800);
        assert.strictEqual(window._rootView._bounds.height, 600);
    });
});

describe('UIView hierarchy', () => {
    it('should traverse subview hierarchy recursively', () => {
        const root = new UIView({ x: 0, y: 0, width: 100, height: 100 });
        const child1 = new UIView({ x: 0, y: 0, width: 50, height: 50 });
        const child2 = new UIView({ x: 0, y: 0, width: 25, height: 25 });

        root.addSubview(child1);
        child1.addSubview(child2);

        const allSubviews = root.allSubviews();
        assert.strictEqual(allSubviews.length, 2);
        assert.ok(allSubviews.includes(child1));
        assert.ok(allSubviews.includes(child2));
    });

    it('should propagate window reference to subviews', () => {
        const root = new UIView({ x: 0, y: 0, width: 100, height: 100 });
        const child = new UIView({ x: 0, y: 0, width: 50, height: 50 });
        const grandchild = new UIView({ x: 0, y: 0, width: 25, height: 25 });

        root.addSubview(child);
        child.addSubview(grandchild);

        const window = new UIWindow({ x: 0, y: 0, width: 100, height: 100 });
        window.addSubview(root);

        assert.strictEqual(child._window, window);
        assert.strictEqual(grandchild._window, window);
    });
});

describe('CALayer integration with UIView', () => {
    it('should use custom layer class when specified', () => {
        class CustomLayer extends CALayer {}
        class CustomView extends UIView {
            static get layerClass() {
                return CustomLayer;
            }
        }
        const view = new CustomView({ x: 0, y: 0, width: 100, height: 100 });
        assert.ok(view.layer instanceof CustomLayer);
    });

    it('should add sublayers', () => {
        const view = new UIView({ x: 0, y: 0, width: 100, height: 100 });
        const sublayer = new CALayer();
        view.insertSublayer(sublayer, 0);
        assert.strictEqual(view._sublayers.length, 1);
    });
});

describe('UIGestureRecognizer', () => {
    let UIGestureRecognizer, UITapGestureRecognizer, UIPanGestureRecognizer;
    
    beforeEach(async () => {
        const mod = await import('../src/core/UIGestureRecognizer.js');
        UIGestureRecognizer = mod.default;
        const tapMod = await import('../src/core/UITapGestureRecognizer.js');
        UITapGestureRecognizer = tapMod.default;
        const panMod = await import('../src/core/UIPanGestureRecognizer.js');
        UIPanGestureRecognizer = panMod.default;
    });

    it('should create UIGestureRecognizer', () => {
        const recognizer = new UIGestureRecognizer(null, null);
        assert.strictEqual(recognizer.state, 'possible');
        assert.strictEqual(recognizer.isEnabled, true);
        assert.strictEqual(recognizer.view, null);
    });

    it('should set state', () => {
        const recognizer = new UIGestureRecognizer(null, null);
        recognizer.state = 'began';
        assert.strictEqual(recognizer.state, 'began');
    });

    it('should handle touch events', () => {
        const recognizer = new UIGestureRecognizer(null, null);
        const touch = { identifier: 0, clientX: 50, clientY: 50 };
        const handled = recognizer._handleTouchBegan(touch, null);
        assert.strictEqual(handled, true);
        assert.strictEqual(recognizer.state, 'began');
    });

    it('should reset state', () => {
        const recognizer = new UIGestureRecognizer(null, null);
        recognizer.state = 'ended';
        recognizer.reset();
        assert.strictEqual(recognizer.state, 'possible');
        assert.strictEqual(recognizer._touches.size, 0);
    });
});

describe('UITapGestureRecognizer', () => {
    let UITapGestureRecognizer;
    
    beforeEach(async () => {
        const mod = await import('../src/core/UITapGestureRecognizer.js');
        UITapGestureRecognizer = mod.default;
    });

    it('should create UITapGestureRecognizer', () => {
        const recognizer = new UITapGestureRecognizer(null, null);
        assert.strictEqual(recognizer.numberOfTapsRequired, 1);
        assert.strictEqual(recognizer.numberOfTouchesRequired, 1);
    });

    it('should set number of taps required', () => {
        const recognizer = new UITapGestureRecognizer(null, null);
        recognizer.numberOfTapsRequired = 3;
        assert.strictEqual(recognizer.numberOfTapsRequired, 3);
    });
});

describe('UIPanGestureRecognizer', () => {
    let UIPanGestureRecognizer;
    
    beforeEach(async () => {
        const mod = await import('../src/core/UIPanGestureRecognizer.js');
        UIPanGestureRecognizer = mod.default;
    });

    it('should create UIPanGestureRecognizer', () => {
        const recognizer = new UIPanGestureRecognizer(null, null);
        assert.strictEqual(recognizer.minimumNumberOfTouches, 1);
        assert.deepStrictEqual(recognizer.translation, { x: 0, y: 0 });
        assert.deepStrictEqual(recognizer.velocity, { x: 0, y: 0 });
    });

    it('should track translation', () => {
        const recognizer = new UIPanGestureRecognizer(null, null);
        recognizer._translation = { x: 10, y: 20 };
        assert.strictEqual(recognizer.translation.x, 10);
        assert.strictEqual(recognizer.translation.y, 20);
    });
});

describe('Accessibility', () => {
    let view;

    beforeEach(() => {
        view = new UIView({ x: 0, y: 0, width: 100, height: 100 });
    });

    it('should set accessibility properties', () => {
        view.isAccessibilityElement = true;
        view.accessibilityLabel = 'Test Label';
        view.accessibilityHint = 'Test Hint';
        view.accessibilityValue = 'Test Value';
        
        assert.strictEqual(view.isAccessibilityElement, true);
        assert.strictEqual(view.accessibilityLabel, 'Test Label');
        assert.strictEqual(view.accessibilityHint, 'Test Hint');
        assert.strictEqual(view.accessibilityValue, 'Test Value');
    });

    it('should set accessibility traits', () => {
        view.accessibilityTraits = 0x1;
        assert.strictEqual(view.accessibilityTraits, 0x1);
    });

    it('should set accessibility enabled', () => {
        view.isAccessibilityEnabled = false;
        assert.strictEqual(view.isAccessibilityEnabled, false);
    });

    it('should use setAccessibilityElement convenience method', () => {
        view.setAccessibilityElement(true, 'Label', 'Hint', 'Value', 0x1);
        
        assert.strictEqual(view.isAccessibilityElement, true);
        assert.strictEqual(view.accessibilityLabel, 'Label');
        assert.strictEqual(view.accessibilityHint, 'Hint');
        assert.strictEqual(view.accessibilityValue, 'Value');
        assert.strictEqual(view.accessibilityTraits, 0x1);
    });

    it('should announce for accessibility', () => {
        view.announceForAccessibility('Test announcement');
    });
});

describe('UIResponder touch handling', () => {
    it('should route touches to gesture recognizers', () => {
        const responder = new UIResponder();
        let tapCalled = false;
        
        const gesture = {
            _view: responder,
            _handleTouchBegan: () => { tapCalled = true; return true; },
            _touches: new Map()
        };
        
        responder.addGestureRecognizer(gesture);
        responder._handleGestureRecognizerTouchBegan({ identifier: 0 }, null);
        
        assert.strictEqual(tapCalled, true);
    });
});
