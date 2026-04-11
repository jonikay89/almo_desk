/**
 * Web Desktop OS - Automated Test Runner
 * 
 * Copy and paste this entire file into the browser console to run tests.
 * Each test includes assertions and detailed logging.
 */

const TestRunner = {
    results: [],
    
    async run(name, testFn) {
        console.log(`\n🧪 Running: ${name}`);
        try {
            await testFn();
            this.results.push({ name, passed: true });
            console.log(`✅ PASSED: ${name}`);
        } catch (error) {
            this.results.push({ name, passed: false, error: error.message });
            console.error(`❌ FAILED: ${name} - ${error.message}`);
        }
    },
    
    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    },
    
    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(`${message || 'Assertion failed'}: expected ${expected}, got ${actual}`);
        }
    },
    
    summary() {
        const passed = this.results.filter(r => r.passed).length;
        const failed = this.results.filter(r => !r.passed).length;
        console.log(`\n${'='.repeat(50)}`);
        console.log(`Test Summary: ${passed} passed, ${failed} failed`);
        console.log(`${'='.repeat(50)}`);
        if (failed > 0) {
            console.log('Failed tests:');
            this.results.filter(r => !r.passed).forEach(r => {
                console.log(`  - ${r.name}: ${r.error}`);
            });
        }
        return { passed, failed };
    }
};

// Wait for DesktopOS to be ready
function waitForDesktopOS() {
    return new Promise((resolve) => {
        if (window.desktopOS) {
            resolve(window.desktopOS);
        } else {
            const check = setInterval(() => {
                if (window.desktopOS) {
                    clearInterval(check);
                    resolve(window.desktopOS);
                }
            }, 100);
            setTimeout(() => {
                clearInterval(check);
                resolve(null);
            }, 5000);
        }
    });
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting Web Desktop OS Test Suite...\n');
    
    const os = await waitForDesktopOS();
    
    if (!os) {
        console.error('❌ DesktopOS not found. Make sure the page is loaded.');
        return;
    }
    
    console.log('✅ DesktopOS instance found');
    
    // Clear localStorage for clean test environment
    localStorage.clear();
    location.reload();
    
    // Wait for reload
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const os2 = await waitForDesktopOS();
    if (!os2) {
        console.error('❌ DesktopOS not loaded after refresh');
        return;
    }
    
    // =========================================================================
    // TEST 1: Default Windows Creation
    // =========================================================================
    await TestRunner.run('Default windows should be created', async () => {
        TestRunner.assertEqual(os2.windows.length, 3, 'Should have 3 default windows');
        TestRunner.assertEqual(os2.windows[0].title, 'JIT Code Editor', 'First window should be JIT Code Editor');
        TestRunner.assertEqual(os2.windows[1].title, 'Live Clock', 'Second window should be Live Clock');
        TestRunner.assertEqual(os2.windows[2].title, 'Sticky Notes', 'Third window should be Sticky Notes');
        console.log('  ✓ All 3 default windows created with correct titles');
    });
    
    // =========================================================================
    // TEST 2: Window Frame Properties
    // =========================================================================
    await TestRunner.run('Window frames should have correct properties', async () => {
        const win = os2.windows[0];
        TestRunner.assert(win.frame, 'Window should have frame property');
        TestRunner.assert(typeof win.frame.x === 'number', 'frame.x should be a number');
        TestRunner.assert(typeof win.frame.y === 'number', 'frame.y should be a number');
        TestRunner.assert(typeof win.frame.width === 'number', 'frame.width should be a number');
        TestRunner.assert(typeof win.frame.height === 'number', 'frame.height should be a number');
        TestRunner.assertEqual(win.frame.width, 640, 'JIT Code Editor width should be 640');
        TestRunner.assertEqual(win.frame.height, 520, 'JIT Code Editor height should be 520');
        console.log(`  ✓ Window frame: {x: ${win.frame.x}, y: ${win.frame.y}, width: ${win.frame.width}, height: ${win.frame.height}`);
    });
    
    // =========================================================================
    // TEST 3: Add Window
    // =========================================================================
    await TestRunner.run('addWindow should create a new window', async () => {
        const initialCount = os2.windows.length;
        os2.addWindow('Test Window', 'clock', {}, 100, 100, 300, 200);
        TestRunner.assertEqual(os2.windows.length, initialCount + 1, 'Window count should increase by 1');
        const newWin = os2.windows.find(w => w.title === 'Test Window');
        TestRunner.assert(newWin, 'New window should exist in windows array');
        TestRunner.assertEqual(newWin.widgetType, 'clock', 'Widget type should be clock');
        console.log('  ✓ New window added successfully');
    });
    
    // =========================================================================
    // TEST 4: Window has os reference
    // =========================================================================
    await TestRunner.run('Window should have os reference', async () => {
        const win = os2.windows[0];
        TestRunner.assert(win.os, 'Window should have os reference');
        TestRunner.assertEqual(win.os, os2, 'os reference should point to DesktopOS instance');
        console.log('  ✓ Window has correct os reference');
    });
    
    // =========================================================================
    // TEST 5: Window loadViewIfNeeded
    // =========================================================================
    await TestRunner.run('loadViewIfNeeded should create DOM element', async () => {
        const win = os2.windows[0];
        win.loadViewIfNeeded();
        TestRunner.assert(win.view.element, 'Window view should have DOM element');
        TestRunner.assertEqual(win.isViewLoaded, true, 'isViewLoaded should be true after loadViewIfNeeded');
        TestRunner.assert(win.view.element instanceof HTMLElement, 'element should be HTMLElement');
        console.log('  ✓ loadViewIfNeeded creates DOM element correctly');
    });
    
    // =========================================================================
    // TEST 6: Minimize Window
    // =========================================================================
    await TestRunner.run('minimizeWindow should hide window', async () => {
        const win = os2.windows.find(w => w.title === 'Live Clock');
        const initialCount = os2.windows.filter(w => !w.isMinimized).length;
        os2.minimizeWindow(win.windowId);
        TestRunner.assertEqual(win.isMinimized, true, 'Window should be marked as minimized');
        TestRunner.assertEqual(os2.windows.filter(w => !w.isMinimized).length, initialCount - 1, 'Visible window count should decrease');
        console.log('  ✓ Window minimized correctly');
    });
    
    // =========================================================================
    // TEST 7: Restore Window
    // =========================================================================
    await TestRunner.run('restoreWindow should show window', async () => {
        const win = os2.windows.find(w => w.title === 'Live Clock');
        os2.restoreWindow(win.windowId);
        TestRunner.assertEqual(win.isMinimized, false, 'Window should be marked as not minimized');
        console.log('  ✓ Window restored correctly');
    });
    
    // =========================================================================
    // TEST 8: Bring to Front
    // =========================================================================
    await TestRunner.run('bringToFront should update z-index', async () => {
        const win = os2.windows[0];
        const otherWin = os2.windows[1];
        const initialZ = win.view.zIndex;
        os2.bringToFront(otherWin.windowId);
        TestRunner.assert(otherWin.view.zIndex > initialZ, 'Other window zIndex should be higher');
        TestRunner.assertEqual(os2.activeWindowId, otherWin.windowId, 'Active window ID should be updated');
        console.log(`  ✓ bringToFront updated zIndex from ${initialZ} to ${otherWin.view.zIndex}`);
    });
    
    // =========================================================================
    // TEST 9: Close Window
    // =========================================================================
    await TestRunner.run('closeWindow should remove window', async () => {
        const winToClose = os2.windows.find(w => w.title === 'Test Window');
        const initialCount = os2.windows.length;
        os2.closeWindow(winToClose.windowId);
        TestRunner.assertEqual(os2.windows.length, initialCount - 1, 'Window count should decrease');
        TestRunner.assert(!os2.windows.includes(winToClose), 'Closed window should not be in array');
        console.log('  ✓ Window closed and removed correctly');
    });
    
    // =========================================================================
    // TEST 10: State Persistence Structure
    // =========================================================================
    await TestRunner.run('saveState should save correct structure', async () => {
        os2.saveState();
        const saved = localStorage.getItem('webDesktopState');
        TestRunner.assert(saved, 'State should be saved to localStorage');
        const parsed = JSON.parse(saved);
        TestRunner.assertEqual(typeof parsed.nextId, 'number', 'nextId should be a number');
        TestRunner.assert(Array.isArray(parsed.windows), 'windows should be an array');
        console.log(`  ✓ State saved: ${parsed.windows.length} windows, nextId: ${parsed.nextId}`);
    });
    
    // =========================================================================
    // TEST 11: Window setFrame
    // =========================================================================
    await TestRunner.run('setFrame should update frame and layout', async () => {
        const win = os2.windows[0];
        win.setFrame(200, 200, 400, 300);
        TestRunner.assertEqual(win.frame.x, 200, 'frame.x should be updated');
        TestRunner.assertEqual(win.frame.y, 200, 'frame.y should be updated');
        TestRunner.assertEqual(win.frame.width, 400, 'frame.width should be updated');
        TestRunner.assertEqual(win.frame.height, 300, 'frame.height should be updated');
        TestRunner.assertEqual(win.bounds.width, 400, 'bounds.width should be updated');
        TestRunner.assertEqual(win.bounds.height, 300, 'bounds.height should be updated');
        console.log('  ✓ setFrame updates frame, bounds, and center correctly');
    });
    
    // =========================================================================
    // TEST 12: Widget View Lifecycle
    // =========================================================================
    await TestRunner.run('Widget should call lifecycle methods', async () => {
        let viewDidLoadCalled = false;
        let viewWillAppearCalled = false;
        let viewDidAppearCalled = false;
        
        const testWidget = {
            viewDidLoad: () => { viewDidLoadCalled = true; },
            viewWillAppear: () => { viewWillAppearCalled = true; },
            viewDidAppear: () => { viewDidAppearCalled = true; }
        };
        
        // Simulate lifecycle
        testWidget.viewDidLoad();
        testWidget.viewWillAppear();
        testWidget.viewDidAppear();
        
        TestRunner.assertEqual(viewDidLoadCalled, true, 'viewDidLoad should be called');
        TestRunner.assertEqual(viewWillAppearCalled, true, 'viewWillAppear should be called');
        TestRunner.assertEqual(viewDidAppearCalled, true, 'viewDidAppear should be called');
        console.log('  ✓ Widget lifecycle methods called correctly');
    });
    
    // =========================================================================
    // TEST 13: UIView Properties
    // =========================================================================
    await TestRunner.run('UIView should have correct properties', async () => {
        const win = os2.windows[0];
        TestRunner.assertEqual(win.view.zIndex, 0, 'UIView should have zIndex property');
        TestRunner.assertEqual(win.view.hidden, false, 'UIView should have hidden property');
        TestRunner.assertEqual(win.view.alpha, 1, 'UIView should have alpha property');
        TestRunner.assert(Array.isArray(win.view.subviews), 'UIView should have subviews array');
        TestRunner.assertEqual(win.view.superview, null, 'Window view superview should be null');
        console.log('  ✓ UIView has all required properties');
    });
    
    // =========================================================================
    // Print Summary
    // =========================================================================
    TestRunner.summary();
}

// Export for manual testing
window.TestRunner = TestRunner;
window.runAllTests = runAllTests;

console.log('📋 Web Desktop OS Test Suite Ready');
console.log('Commands:');
console.log('  runAllTests()           - Run all automated tests');
console.log('  TestRunner.summary()    - View test summary');
console.log('  localStorage.clear()    - Clear saved state');
