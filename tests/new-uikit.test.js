import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

const UIFont = (await import('../src/core/UIFont.js')).default;
const UISwipeGestureRecognizer = (await import('../src/core/UISwipeGestureRecognizer.js')).default;
const { default: UIToolbar, UIBarButtonItem } = await import('../src/core/UIToolbar.js');
const UINavigationController = (await import('../src/core/UINavigationController.js')).default;
const UIViewController = (await import('../src/core/UIViewController.js')).default;
const UITabBarController = (await import('../src/core/UITabBarController.js')).default;
const { default: UISearchController, UISearchBar: UISearchBarNew } = await import('../src/core/UISearchController.js');
const { default: UIVisualEffectView, UIVisualEffect, UIBlurEffect, UIVibrancyEffect } = await import('../src/core/UIVisualEffectView.js');
const UICollectionReusableView = (await import('../src/core/UICollectionReusableView.js')).default;
const { default: UIContextMenuInteraction, UIMenuElement, UIAction, UIMenu } = await import('../src/core/UIContextMenuInteraction.js');
const UIPasteboard = (await import('../src/core/UIPasteboard.js')).default;

describe('UIFont', () => {
    it('should create font with constructor', () => {
        const font = new UIFont('Helvetica', 14, 'bold');
        assert.strictEqual(font.familyName, 'Helvetica');
        assert.strictEqual(font.size, 14);
        assert.strictEqual(font.weight, 'bold');
    });

    it('should create system font', () => {
        const font = UIFont.systemFont(17);
        assert.strictEqual(font.size, 17);
        assert.strictEqual(font.weight, 'normal');
    });

    it('should create bold system font', () => {
        const font = UIFont.boldSystemFont(20);
        assert.strictEqual(font.size, 20);
        assert.strictEqual(font.weight, 'bold');
    });

    it('should create italic system font', () => {
        const font = UIFont.italicSystemFont(16);
        assert.strictEqual(font.style, 'italic');
    });

    it('should create monospaced system font', () => {
        const font = UIFont.monospacedSystemFont(12);
        assert.ok(font.familyName.includes('monospace'));
    });

    it('should create font with name and size', () => {
        const font = UIFont.fontWithName('Georgia', 18);
        assert.strictEqual(font.familyName, 'Georgia');
        assert.strictEqual(font.size, 18);
    });

    it('should derive font with new size', () => {
        const font = UIFont.systemFont(14);
        const derived = font.withSize(20);
        assert.strictEqual(derived.size, 20);
        assert.strictEqual(derived.familyName, font.familyName);
    });

    it('should derive font with new weight', () => {
        const font = UIFont.systemFont(14);
        const derived = font.withWeight('bold');
        assert.strictEqual(derived.weight, 'bold');
        assert.strictEqual(derived.size, 14);
    });

    it('should generate CSS string', () => {
        const font = UIFont.systemFont(16, 'bold');
        const css = font.toCSS();
        assert.ok(css.includes('16px'));
        assert.ok(css.includes('bold'));
    });

    it('should compute metrics', () => {
        const font = UIFont.systemFont(20);
        assert.strictEqual(font.pointSize, 20);
        assert.ok(font.lineHeight > 0);
        assert.ok(font.ascender > 0);
        assert.ok(font.descender < 0);
        assert.ok(font.capHeight > 0);
        assert.ok(font.xHeight > 0);
    });

    it('should check equality', () => {
        const a = UIFont.systemFont(14, 'bold');
        const b = UIFont.systemFont(14, 'bold');
        const c = UIFont.systemFont(16);
        assert.ok(a.isEqual(b));
        assert.ok(!a.isEqual(c));
    });

    it('should have description', () => {
        const font = UIFont.systemFont(14);
        assert.ok(font.description.includes('14'));
    });

    it('should have fontName', () => {
        const font = new UIFont('Helvetica', 14, 'bold');
        assert.strictEqual(font.fontName, 'Helvetica-bold');
    });
});

describe('UISwipeGestureRecognizer', () => {
    it('should create with default direction right', () => {
        const swipe = new UISwipeGestureRecognizer();
        assert.strictEqual(swipe.direction, 'right');
    });

    it('should set direction', () => {
        const swipe = new UISwipeGestureRecognizer();
        swipe.direction = 'left';
        assert.strictEqual(swipe.direction, 'left');
    });

    it('should expose Direction constants', () => {
        assert.strictEqual(UISwipeGestureRecognizer.Direction.right, 'right');
        assert.strictEqual(UISwipeGestureRecognizer.Direction.left, 'left');
        assert.strictEqual(UISwipeGestureRecognizer.Direction.up, 'up');
        assert.strictEqual(UISwipeGestureRecognizer.Direction.down, 'down');
    });

    it('should set numberOfTouchesRequired', () => {
        const swipe = new UISwipeGestureRecognizer();
        swipe.numberOfTouchesRequired = 2;
        assert.strictEqual(swipe.numberOfTouchesRequired, 2);
    });

    it('should detect right swipe', () => {
        const results = [];
        const swipe = new UISwipeGestureRecognizer({}, function() {
            results.push('swiped');
        });
        swipe.direction = 'right';
        swipe._handleTouchBegan({ clientX: 100, clientY: 200, identifier: 0 }, null);
        swipe._handleTouchMoved({ clientX: 200, clientY: 200, identifier: 0 }, null);
        swipe._handleTouchEnded({ clientX: 200, clientY: 200, identifier: 0 }, null);
        assert.deepStrictEqual(results, ['swiped']);
    });

    it('should detect left swipe', () => {
        const results = [];
        const swipe = new UISwipeGestureRecognizer({}, function() {
            results.push('swiped');
        });
        swipe.direction = 'left';
        swipe._handleTouchBegan({ clientX: 200, clientY: 200, identifier: 0 }, null);
        swipe._handleTouchMoved({ clientX: 100, clientY: 200, identifier: 0 }, null);
        swipe._handleTouchEnded({ clientX: 100, clientY: 200, identifier: 0 }, null);
        assert.deepStrictEqual(results, ['swiped']);
    });

    it('should fail for wrong direction', () => {
        const results = [];
        const swipe = new UISwipeGestureRecognizer({}, function() {
            results.push('swiped');
        });
        swipe.direction = 'left';
        swipe._handleTouchBegan({ clientX: 100, clientY: 200, identifier: 0 }, null);
        swipe._handleTouchMoved({ clientX: 200, clientY: 200, identifier: 0 }, null);
        swipe._handleTouchEnded({ clientX: 200, clientY: 200, identifier: 0 }, null);
        assert.deepStrictEqual(results, []);
    });
});

describe('UIBarButtonItem', () => {
    it('should create with title', () => {
        const item = new UIBarButtonItem('Edit');
        assert.strictEqual(item.title, 'Edit');
        assert.strictEqual(item.style, 'plain');
    });

    it('should create with style, target, action', () => {
        const action = () => {};
        const item = new UIBarButtonItem('Done', 'done', {}, action);
        assert.strictEqual(item.title, 'Done');
        assert.strictEqual(item.style, 'done');
        assert.strictEqual(typeof item.action, 'function');
    });

    it('should create system item', () => {
        const action = () => {};
        const item = UIBarButtonItem.barButtonSystemItem('done', {}, action);
        assert.strictEqual(item.style, 'done');
        assert.strictEqual(item._systemItem, 'done');
    });

    it('should set properties', () => {
        const item = new UIBarButtonItem('Test');
        item.isEnabled = false;
        item.tintColor = '#ff0000';
        item.width = 100;
        assert.strictEqual(item.isEnabled, false);
        assert.strictEqual(item.tintColor, '#ff0000');
        assert.strictEqual(item.width, 100);
    });
});

describe('UIToolbar', () => {
    it('should create toolbar', () => {
        const toolbar = new UIToolbar();
        assert.deepStrictEqual(toolbar.items, []);
    });

    it('should set items', () => {
        const toolbar = new UIToolbar();
        const items = [new UIBarButtonItem('A'), new UIBarButtonItem('B')];
        toolbar.items = items;
        assert.strictEqual(toolbar.items.length, 2);
    });

    it('should set items with animation flag', () => {
        const toolbar = new UIToolbar();
        toolbar.setItems([new UIBarButtonItem('X')], true);
        assert.strictEqual(toolbar.items.length, 1);
    });

    it('should set bar tint color', () => {
        const toolbar = new UIToolbar();
        toolbar.barTintColor = '#fff';
        assert.strictEqual(toolbar.barTintColor, '#fff');
    });

    it('should be translucent by default', () => {
        const toolbar = new UIToolbar();
        assert.strictEqual(toolbar.isTranslucent, true);
    });
});

describe('UINavigationController', () => {
    let nav;
    let vc1, vc2, vc3;

    beforeEach(() => {
        vc1 = new UIViewController();
        vc2 = new UIViewController();
        vc3 = new UIViewController();
        nav = new UINavigationController(vc1);
    });

    it('should set root view controller', () => {
        assert.strictEqual(nav.viewControllers.length, 1);
        assert.strictEqual(nav.topViewController, vc1);
    });

    it('should push view controller', () => {
        nav.pushViewController(vc2);
        assert.strictEqual(nav.viewControllers.length, 2);
        assert.strictEqual(nav.topViewController, vc2);
        assert.strictEqual(vc2.navigationController, nav);
    });

    it('should pop view controller', () => {
        nav.pushViewController(vc2);
        const popped = nav.popViewController();
        assert.strictEqual(popped, vc2);
        assert.strictEqual(nav.topViewController, vc1);
        assert.strictEqual(popped.navigationController, null);
    });

    it('should return null when popping root', () => {
        const popped = nav.popViewController();
        assert.strictEqual(popped, null);
        assert.strictEqual(nav.viewControllers.length, 1);
    });

    it('should pop to root', () => {
        nav.pushViewController(vc2);
        nav.pushViewController(vc3);
        const popped = nav.popToRootViewController();
        assert.strictEqual(popped.length, 2);
        assert.strictEqual(nav.viewControllers.length, 1);
        assert.strictEqual(nav.topViewController, vc1);
    });

    it('should pop to specific view controller', () => {
        nav.pushViewController(vc2);
        nav.pushViewController(vc3);
        const popped = nav.popToViewController(vc2);
        assert.strictEqual(popped.length, 1);
        assert.strictEqual(nav.topViewController, vc2);
    });

    it('should set view controllers', () => {
        nav.setViewControllers([vc2, vc3]);
        assert.strictEqual(nav.viewControllers.length, 2);
        assert.strictEqual(nav.topViewController, vc3);
    });

    it('should expose visible view controller', () => {
        nav.pushViewController(vc2);
        assert.strictEqual(nav.visibleViewController, vc2);
    });

    it('should call delegate on push', () => {
        const delegateCalls = [];
        nav.delegate = {
            navigationController_didShow(navigationController, viewController) {
                delegateCalls.push(viewController);
            }
        };
        nav.pushViewController(vc2);
        assert.strictEqual(delegateCalls.length, 1);
        assert.strictEqual(delegateCalls[0], vc2);
    });
});

describe('UITabBarController', () => {
    let tab;
    let vc1, vc2, vc3;

    beforeEach(() => {
        vc1 = new UIViewController();
        vc2 = new UIViewController();
        vc3 = new UIViewController();
        tab = new UITabBarController();
    });

    it('should set view controllers', () => {
        tab.viewControllers = [vc1, vc2, vc3];
        assert.strictEqual(tab.viewControllers.length, 3);
        assert.strictEqual(vc1.tabBarController, tab);
    });

    it('should select by index', () => {
        tab.viewControllers = [vc1, vc2, vc3];
        tab.selectedIndex = 1;
        assert.strictEqual(tab.selectedIndex, 1);
        assert.strictEqual(tab.selectedViewController, vc2);
    });

    it('should select by view controller', () => {
        tab.viewControllers = [vc1, vc2, vc3];
        tab.selectedViewController = vc3;
        assert.strictEqual(tab.selectedIndex, 2);
    });

    it('should ignore invalid index', () => {
        tab.viewControllers = [vc1, vc2];
        tab.selectedIndex = 5;
        assert.strictEqual(tab.selectedIndex, 0);
    });

    it('should clamp index when setting fewer controllers', () => {
        tab.viewControllers = [vc1, vc2, vc3];
        tab.selectedIndex = 2;
        tab.viewControllers = [vc1];
        assert.strictEqual(tab.selectedIndex, 0);
    });

    it('should call delegate on select', () => {
        const selections = [];
        tab.delegate = {
            tabBarController_didSelect(tabBar, viewController) {
                selections.push(viewController);
            }
        };
        tab.viewControllers = [vc1, vc2];
        tab.selectedIndex = 1;
        assert.strictEqual(selections.length, 1);
        assert.strictEqual(selections[0], vc2);
    });
});

describe('UISearchController', () => {
    it('should create with search results controller', () => {
        const results = new UIViewController();
        const sc = new UISearchController(results);
        assert.strictEqual(sc.searchResultsController, results);
        assert.ok(sc.searchBar);
    });

    it('should toggle active', () => {
        const sc = new UISearchController();
        assert.strictEqual(sc.isActive, false);
        sc.isActive = true;
        assert.strictEqual(sc.isActive, true);
    });

    it('should set properties', () => {
        const sc = new UISearchController();
        sc.obscuresBackgroundDuringPresentation = false;
        sc.hidesNavigationBarDuringPresentation = false;
        assert.strictEqual(sc.obscuresBackgroundDuringPresentation, false);
        assert.strictEqual(sc.hidesNavigationBarDuringPresentation, false);
    });

    it('should set search results updater', () => {
        const updater = () => {};
        const sc = new UISearchController();
        sc.searchResultsUpdater = updater;
        assert.strictEqual(sc.searchResultsUpdater, updater);
    });
});

describe('UIBlurEffect', () => {
    it('should create with style', () => {
        const effect = UIBlurEffect.withStyle('dark');
        assert.strictEqual(effect.style, 'dark');
    });

    it('should default to systemMaterial', () => {
        const effect = new UIBlurEffect();
        assert.strictEqual(effect.style, 'systemMaterial');
    });

    it('should generate CSS filter', () => {
        const effect = UIBlurEffect.withStyle('light');
        assert.ok(effect.cssFilter.includes('blur'));
    });
});

describe('UIVibrancyEffect', () => {
    it('should create from blur effect', () => {
        const blur = UIBlurEffect.withStyle('dark');
        const vibrancy = UIVibrancyEffect.blurEffect(blur);
        assert.strictEqual(vibrancy.blurEffect, blur);
        assert.ok(vibrancy.cssFilter.includes('saturate'));
    });
});

describe('UIVisualEffectView', () => {
    it('should create with blur effect', () => {
        const effect = UIBlurEffect.withStyle('light');
        const view = new UIVisualEffectView(effect);
        assert.strictEqual(view.effect, effect);
        assert.ok(view.contentView);
    });

    it('should allow changing effect', () => {
        const view = new UIVisualEffectView();
        assert.strictEqual(view.effect, null);
        view.effect = UIBlurEffect.withStyle('dark');
        assert.ok(view.effect instanceof UIBlurEffect);
    });

    it('should have content view', () => {
        const view = new UIVisualEffectView(UIBlurEffect.withStyle('light'));
        assert.ok(view.contentView);
    });
});

describe('UICollectionReusableView', () => {
    it('should create with null reuse identifier', () => {
        const view = new UICollectionReusableView();
        assert.strictEqual(view.reuseIdentifier, null);
    });

    it('should call prepareForReuse without error', () => {
        const view = new UICollectionReusableView();
        assert.doesNotThrow(() => view.prepareForReuse());
    });

    it('should apply layout attributes', () => {
        const view = new UICollectionReusableView();
        view.apply({ frame: { x: 10, y: 20, width: 100, height: 50 }, alpha: 0.5 });
        assert.strictEqual(view.frame.x, 10);
        assert.strictEqual(view.alpha, 0.5);
    });

    it('should return preferred attributes unchanged', () => {
        const view = new UICollectionReusableView();
        const attrs = { frame: { x: 0, y: 0, width: 100, height: 100 } };
        assert.strictEqual(view.preferredLayoutAttributesFittingAttributes(attrs), attrs);
    });
});

describe('UIContextMenuInteraction', () => {
    it('should create with delegate', () => {
        const delegate = {};
        const interaction = new UIContextMenuInteraction(delegate);
        assert.strictEqual(interaction.delegate, delegate);
        assert.strictEqual(interaction.isActive, false);
    });

    it('should present menu via delegate', () => {
        const menu = UIMenu.menuWithTitle('Edit', {
            children: [new UIAction('Copy'), new UIAction('Paste')]
        });
        const interaction = new UIContextMenuInteraction({
            contextMenuInteraction_menuForPoint: () => menu
        });
        const result = interaction.willPresentMenu();
        assert.strictEqual(interaction.isActive, true);
        assert.strictEqual(result, menu);
    });

    it('should end interaction', () => {
        const interaction = new UIContextMenuInteraction();
        interaction.willPresentMenu();
        interaction.willEnd();
        assert.strictEqual(interaction.isActive, false);
    });

    it('should set menu directly', () => {
        const menu = new UIMenu('Test');
        const interaction = new UIContextMenuInteraction();
        interaction.setMenu(menu);
        assert.strictEqual(interaction._menu, menu);
    });
});

describe('UIAction', () => {
    it('should create with title', () => {
        const action = new UIAction('Copy');
        assert.strictEqual(action.title, 'Copy');
    });

    it('should create with handler', () => {
        let called = false;
        const action = new UIAction('Delete', { handler: () => called = true });
        action.handler();
        assert.strictEqual(called, true);
    });

    it('should create with static factory', () => {
        const action = UIAction.actionWithTitle('Cut', null, 'cut', () => {});
        assert.strictEqual(action.title, 'Cut');
        assert.strictEqual(action.identifier, 'cut');
    });
});

describe('UIMenu', () => {
    it('should create with title and children', () => {
        const menu = new UIMenu('File', {
            children: [new UIAction('Open'), new UIAction('Save')]
        });
        assert.strictEqual(menu.title, 'File');
        assert.strictEqual(menu.children.length, 2);
    });

    it('should create with static factory', () => {
        const menu = UIMenu.menuWithTitle('Edit');
        assert.strictEqual(menu.title, 'Edit');
    });
});

describe('UIPasteboard', () => {
    beforeEach(() => {
        UIPasteboard._general = null;
    });

    it('should return general singleton', () => {
        const pb1 = UIPasteboard.general;
        const pb2 = UIPasteboard.general;
        assert.strictEqual(pb1, pb2);
    });

    it('should set and get string', () => {
        const pb = new UIPasteboard();
        pb.string = 'hello';
        assert.strictEqual(pb.string, 'hello');
    });

    it('should set and get url', () => {
        const pb = new UIPasteboard();
        pb.url = 'https://example.com';
        assert.strictEqual(pb.url, 'https://example.com');
    });

    it('should increment changeCount on mutation', () => {
        const pb = new UIPasteboard();
        assert.strictEqual(pb.changeCount, 0);
        pb.string = 'test';
        assert.strictEqual(pb.changeCount, 1);
        pb.string = 'test2';
        assert.strictEqual(pb.changeCount, 2);
    });

    it('should check hasStrings', () => {
        const pb = new UIPasteboard();
        assert.strictEqual(pb.hasStrings(), false);
        pb.string = 'hello';
        assert.strictEqual(pb.hasStrings(), true);
    });

    it('should check hasURLs', () => {
        const pb = new UIPasteboard();
        assert.strictEqual(pb.hasURLs(), false);
        pb.url = 'https://example.com';
        assert.strictEqual(pb.hasURLs(), true);
    });

    it('should clear contents', () => {
        const pb = new UIPasteboard();
        pb.string = 'test';
        pb.clearContents();
        assert.strictEqual(pb.string, null);
    });

    it('should create with objects', () => {
        const pb = UIPasteboard.withObjects(['hello', 'world']);
        assert.strictEqual(pb.items.length, 2);
        assert.strictEqual(pb.string, 'hello');
    });

    it('should add items', () => {
        const pb = new UIPasteboard();
        pb.string = 'first';
        pb.addItems([{ 'public.utf8-plain-text': 'second' }]);
        assert.strictEqual(pb.strings.length, 2);
    });
});
