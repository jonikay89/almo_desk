/**
 * UIView Test Suite
 * Tests for the base UIView class
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

class UIColor {
    constructor(r = 0, g = 0, b = 0, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    
    static white() { return new UIColor(1, 1, 1, 1); }
    static black() { return new UIColor(0, 0, 0, 1); }
    static red() { return new UIColor(1, 0, 0, 1); }
    static green() { return new UIColor(0, 1, 0, 1); }
    static blue() { return new UIColor(0, 0, 1, 1); }
}

class CATransform3D {
    constructor() {
        this.m = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    }
    
    static identity() { return new CATransform3D(); }
    static MakePerspective(m34 = -0.001) {
        const t = new CATransform3D();
        t.m[10] = m34;
        return t;
    }
    multiply(other) {
        const result = new CATransform3D();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result.m[i * 4 + j] = 0;
                for (let k = 0; k < 4; k++) {
                    result.m[i * 4 + j] += this.m[i * 4 + k] * other.m[k * 4 + j];
                }
            }
        }
        return result;
    }
    toCSSTransform() {
        return `matrix3d(${this.m.join(',')})`;
    }
}

class CALayer {
    constructor() {
        this._anchorPoint = { x: 0.5, y: 0.5 };
        this._bounds = { x: 0, y: 0, width: 0, height: 0 };
    }
    get anchorPoint() { return this._anchorPoint; }
    set anchorPoint(v) { this._anchorPoint = { ...v }; }
    get bounds() { return this._bounds; }
}

class UIResponder {
    constructor() {
        this.nextResponder = null;
    }
}

class UIView extends UIResponder {
    constructor() {
        super();
        this.superview = null;
        this.window = null;
        this._frame = { x: 0, y: 0, width: 0, height: 0 };
        this._bounds = { x: 0, y: 0, width: 0, height: 0 };
        this._center = { x: 0, y: 0 };
        this.alpha = 1;
        this.hidden = false;
        this.clipsToBounds = false;
        this.userInteractionEnabled = true;
        this.tag = 0;
        this.subviews = [];
        this.element = null;
        this.zIndex = 0;
        this.translatesAutoresizingMaskIntoConstraints = true;
        this._layer = new CALayer();
        this._transform3D = CATransform3D.identity();
        this._perspective = false;
        this._perspectiveM34 = -0.001;
        this._backgroundColor = null;
        this._cornerRadius = 0;
        this._borderWidth = 0;
        this._borderColor = null;
        this._shadowColor = null;
        this._shadowOffset = { width: 0, height: 0 };
        this._shadowRadius = 0;
        this._shadowOpacity = 0;
        this._isFirstResponder = false;
        this._sublayers = [];
    }

    get frame() { return this._frame; }
    set frame(value) {
        this._frame = { ...value };
        this._bounds = { x: 0, y: 0, width: value.width, height: value.height };
        this._center = { x: value.x + value.width / 2, y: value.y + value.height / 2 };
        this._layer._bounds = this._bounds;
    }

    get bounds() { return this._bounds; }
    set bounds(value) {
        this._bounds = { ...value };
    }

    get center() { return this._center; }
    set center(value) {
        this._center = { ...value };
    }

    get backgroundColor() { return this._backgroundColor; }
    set backgroundColor(value) { this._backgroundColor = value; }

    get layer() { return this._layer; }

    setFrame(x, y, width, height) {
        this.frame = { x, y, width, height };
        this.layoutSubviews();
    }

    layoutSubviews() {
        if (this.element) {
            this.element.style.left = `${this._frame.x}px`;
            this.element.style.top = `${this._frame.y}px`;
            this.element.style.width = `${this._frame.width}px`;
            this.element.style.height = `${this._frame.height}px`;
        }
    }

    addSubview(view) {
        view.removeFromSuperview();
        view.superview = this;
        this.subviews.push(view);
        if (this.element && view.element) {
            this.element.appendChild(view.element);
        }
        view.didMoveToSuperview();
    }

    removeFromSuperview() {
        if (this.superview) {
            this.superview.subviews = this.superview.subviews.filter(v => v !== this);
            if (this.element && this.superview.element) {
                this.superview.element.removeChild(this.element);
            }
            this.superview = null;
        }
    }

    removeSubview(view) {
        const index = this.subviews.indexOf(view);
        if (index !== -1) {
            this.subviews.splice(index, 1);
            if (view.element && view.element.parentNode === this.element) {
                this.element.removeChild(view.element);
            }
            view.superview = null;
            view.didMoveToSuperview();
        }
    }

    setHidden(hidden) {
        this.hidden = hidden;
        if (this.element) {
            this.element.style.display = hidden ? 'none' : '';
        }
    }

    setAlpha(alpha) {
        this.alpha = alpha;
        if (this.element) {
            this.element.style.opacity = alpha;
        }
    }

    setBackgroundColor(color) {
        this._backgroundColor = color;
        if (this.element) {
            this.element.style.backgroundColor = color;
        }
    }

    withBackgroundColor(color) {
        this.setBackgroundColor(color);
        return this;
    }

    withCornerRadius(radius) {
        this._cornerRadius = radius;
        if (this.element) {
            this.element.style.borderRadius = `${radius}px`;
        }
        return this;
    }

    withBorder(color, width) {
        this._borderColor = color;
        this._borderWidth = width;
        if (this.element) {
            this.element.style.border = `${width}px solid ${color}`;
        }
        return this;
    }

    withShadow(color, offset, radius, opacity = 0.3) {
        this._shadowColor = color;
        this._shadowOffset = offset;
        this._shadowRadius = radius;
        this._shadowOpacity = opacity;
        if (this.element) {
            this.element.style.boxShadow = `${offset.width}px ${offset.height}px ${radius}px ${opacity} ${color}`;
        }
        return this;
    }

    setClipsToBounds(clip) {
        this.clipsToBounds = clip;
        if (this.element) {
            this.element.style.overflow = clip ? 'hidden' : '';
        }
    }

    setUserInteractionEnabled(enabled) {
        this.userInteractionEnabled = enabled;
        if (this.element) {
            this.element.style.pointerEvents = enabled ? 'auto' : 'none';
        }
    }

    setTag(tag) {
        this.tag = tag;
    }

    setZIndex(z) {
        this.zIndex = z;
        if (this.element) {
            this.element.style.zIndex = z;
        }
    }

    bringSubviewToFront(view) {
        const index = this.subviews.indexOf(view);
        if (index !== -1) {
            this.subviews.splice(index, 1);
            this.subviews.push(view);
        }
    }

    sendSubviewToBack(view) {
        const index = this.subviews.indexOf(view);
        if (index !== -1) {
            this.subviews.splice(index, 1);
            this.subviews.unshift(view);
        }
    }

    insertSubviewAtIndex(view, index) {
        view.removeFromSuperview();
        view.superview = this;
        this.subviews.splice(index, 0, view);
    }

    exchangeSubviewAtIndex(index1, index2) {
        const temp = this.subviews[index1];
        this.subviews[index1] = this.subviews[index2];
        this.subviews[index2] = temp;
    }

    subviewWithTag(tag) {
        return this.subviews.find(v => v.tag === tag);
    }

    didMoveToSuperview() {}
    willMoveToWindow(window) {}
    didMoveToWindow() {}

    isFirstResponder() {
        return this._isFirstResponder;
    }

    canBecomeFirstResponder() {
        return false;
    }

    becomeFirstResponder() {
        if (this.canBecomeFirstResponder()) {
            this._isFirstResponder = true;
            return true;
        }
        return false;
    }

    resignFirstResponder() {
        this._isFirstResponder = false;
        return true;
    }

    init() {
        if (typeof document !== 'undefined') {
            this.element = document.createElement('div');
            this.element.style.position = 'absolute';
        }
        return this;
    }

    deinit() {
        this.element = null;
        this.subviews = [];
        this.superview = null;
    }

    encode() {
        return {
            frame: this._frame,
            bounds: this._bounds,
            center: this._center,
            alpha: this.alpha,
            hidden: this.hidden,
            clipsToBounds: this.clipsToBounds,
            userInteractionEnabled: this.userInteractionEnabled,
            tag: this.tag,
            zIndex: this.zIndex
        };
    }

    static decode(data) {
        const view = new UIView();
        view._frame = data.frame;
        view._bounds = data.bounds;
        view._center = data.center;
        view.alpha = data.alpha;
        view.hidden = data.hidden;
        view.clipsToBounds = data.clipsToBounds;
        view.userInteractionEnabled = data.userInteractionEnabled;
        view.tag = data.tag;
        view.zIndex = data.zIndex;
        return view;
    }
}

describe('UIView', () => {
    let view;

    beforeEach(() => {
        view = new UIView();
    });

    describe('Initialization', () => {
        it('should initialize with default values', () => {
            assert.strictEqual(view.frame.x, 0);
            assert.strictEqual(view.frame.y, 0);
            assert.strictEqual(view.frame.width, 0);
            assert.strictEqual(view.frame.height, 0);
            assert.strictEqual(view.alpha, 1);
            assert.strictEqual(view.hidden, false);
            assert.strictEqual(view.clipsToBounds, false);
            assert.strictEqual(view.userInteractionEnabled, true);
            assert.strictEqual(view.tag, 0);
            assert.strictEqual(view.zIndex, 0);
            assert.strictEqual(view.superview, null);
            assert.deepStrictEqual(view.subviews, []);
        });

        it('should have init method', () => {
            assert.strictEqual(typeof view.init, 'function');
            const result = view.init();
            assert.strictEqual(result, view);
        });

        it('should have layer property', () => {
            assert.strictEqual(view.layer instanceof CALayer, true);
        });
    });

    describe('Frame and Bounds', () => {
        it('should set frame directly', () => {
            view.frame = { x: 10, y: 20, width: 100, height: 200 };
            assert.strictEqual(view._frame.x, 10);
            assert.strictEqual(view._frame.y, 20);
            assert.strictEqual(view._frame.width, 100);
            assert.strictEqual(view._frame.height, 200);
        });

        it('should derive bounds from frame', () => {
            view.frame = { x: 10, y: 20, width: 100, height: 200 };
            assert.strictEqual(view._bounds.x, 0);
            assert.strictEqual(view._bounds.y, 0);
            assert.strictEqual(view._bounds.width, 100);
            assert.strictEqual(view._bounds.height, 200);
        });

        it('should calculate center from frame', () => {
            view.frame = { x: 10, y: 20, width: 100, height: 200 };
            assert.strictEqual(view._center.x, 60);
            assert.strictEqual(view._center.y, 120);
        });

        it('should set frame via setFrame', () => {
            view.setFrame(50, 100, 200, 300);
            assert.strictEqual(view._frame.x, 50);
            assert.strictEqual(view._frame.y, 100);
            assert.strictEqual(view._frame.width, 200);
            assert.strictEqual(view._frame.height, 300);
        });

        it('should set center directly', () => {
            view.center = { x: 100, y: 200 };
            assert.strictEqual(view._center.x, 100);
            assert.strictEqual(view._center.y, 200);
        });

        it('should set bounds directly', () => {
            view.bounds = { x: 0, y: 0, width: 100, height: 200 };
            assert.strictEqual(view._bounds.width, 100);
            assert.strictEqual(view._bounds.height, 200);
        });
    });

    describe('Subview Management', () => {
        it('should add subview correctly', () => {
            const child = new UIView();
            child.element = { appendChild: () => {}, removeChild: () => {} };
            
            view.addSubview(child);
            
            assert.strictEqual(child.superview, view);
            assert.strictEqual(view.subviews.length, 1);
            assert.ok(view.subviews.includes(child));
        });

        it('should remove subview from previous parent', () => {
            const parent1 = new UIView();
            parent1.element = { appendChild: () => {}, removeChild: () => {} };
            const parent2 = new UIView();
            parent2.element = { appendChild: () => {}, removeChild: () => {} };
            const child = new UIView();
            child.element = { appendChild: () => {}, removeChild: () => {} };
            
            parent1.addSubview(child);
            parent2.addSubview(child);
            
            assert.strictEqual(child.superview, parent2);
            assert.strictEqual(parent1.subviews.length, 0);
            assert.strictEqual(parent2.subviews.length, 1);
        });

        it('should remove subview correctly', () => {
            const child = new UIView();
            child.element = { appendChild: () => {}, removeChild: () => {} };
            child.superview = view;
            view.subviews.push(child);

            view.removeSubview(child);

            assert.strictEqual(child.superview, null);
            assert.strictEqual(view.subviews.length, 0);
        });

        it('should remove from superview correctly', () => {
            const child = new UIView();
            child.element = { appendChild: () => {}, removeChild: () => {} };
            child.superview = view;
            view.subviews.push(child);

            child.removeFromSuperview();

            assert.strictEqual(child.superview, null);
            assert.strictEqual(view.subviews.length, 0);
        });

        it('should track multiple subviews', () => {
            const child1 = new UIView();
            const child2 = new UIView();
            const child3 = new UIView();
            
            child1.element = {};
            child2.element = {};
            child3.element = {};
            
            view.addSubview(child1);
            view.addSubview(child2);
            view.addSubview(child3);
            
            assert.strictEqual(view.subviews.length, 3);
        });

        it('should bring subview to front', () => {
            const child1 = new UIView();
            const child2 = new UIView();
            child1.element = {};
            child2.element = {};
            
            view.addSubview(child1);
            view.addSubview(child2);
            view.bringSubviewToFront(child1);
            
            assert.strictEqual(view.subviews[view.subviews.length - 1], child1);
        });

        it('should send subview to back', () => {
            const child1 = new UIView();
            const child2 = new UIView();
            child1.element = {};
            child2.element = {};
            
            view.addSubview(child1);
            view.addSubview(child2);
            view.sendSubviewToBack(child2);
            
            assert.strictEqual(view.subviews[0], child2);
        });

        it('should insert subview at index', () => {
            const child1 = new UIView();
            const child2 = new UIView();
            child1.element = {};
            child2.element = {};
            
            view.addSubview(child1);
            view.insertSubviewAtIndex(child2, 0);
            
            assert.strictEqual(view.subviews[0], child2);
        });

        it('should exchange subviews at index', () => {
            const child1 = new UIView();
            const child2 = new UIView();
            child1.element = {};
            child2.element = {};
            
            view.addSubview(child1);
            view.addSubview(child2);
            view.exchangeSubviewAtIndex(0, 1);
            
            assert.strictEqual(view.subviews[0], child2);
            assert.strictEqual(view.subviews[1], child1);
        });

        it('should find subview by tag', () => {
            const child1 = new UIView();
            const child2 = new UIView();
            child1.element = {};
            child2.element = {};
            child1.tag = 100;
            child2.tag = 200;
            
            view.addSubview(child1);
            view.addSubview(child2);
            
            assert.strictEqual(view.subviewWithTag(200), child2);
            assert.strictEqual(view.subviewWithTag(999), undefined);
        });
    });

    describe('Visibility', () => {
        it('should set hidden state on element', () => {
            view.element = { style: {} };
            
            view.setHidden(true);
            assert.strictEqual(view.hidden, true);
            assert.strictEqual(view.element.style.display, 'none');

            view.setHidden(false);
            assert.strictEqual(view.hidden, false);
            assert.strictEqual(view.element.style.display, '');
        });

        it('should set alpha on element', () => {
            view.element = { style: {} };
            
            view.setAlpha(0.5);
            assert.strictEqual(view.alpha, 0.5);
            assert.strictEqual(view.element.style.opacity, 0.5);
        });

        it('should handle zero alpha', () => {
            view.element = { style: {} };
            view.setAlpha(0);
            assert.strictEqual(view.alpha, 0);
            assert.strictEqual(view.element.style.opacity, 0);
        });
    });

    describe('Layout', () => {
        it('should layout subviews when frame changes', () => {
            view.element = { style: {} };
            
            view.setFrame(50, 100, 200, 300);

            assert.strictEqual(view.element.style.left, '50px');
            assert.strictEqual(view.element.style.top, '100px');
            assert.strictEqual(view.element.style.width, '200px');
            assert.strictEqual(view.element.style.height, '300px');
        });

        it('should update center when frame changes', () => {
            view.setFrame(10, 20, 100, 200);
            
            assert.strictEqual(view.center.x, 60);
            assert.strictEqual(view.center.y, 120);
        });
    });

    describe('Styling', () => {
        it('should set background color', () => {
            view.element = { style: {} };
            const color = new UIColor(1, 0, 0, 1);
            
            view.setBackgroundColor(color);
            
            assert.strictEqual(view._backgroundColor, color);
        });

        it('should chain withBackgroundColor', () => {
            const result = view.withBackgroundColor('red');
            assert.strictEqual(result, view);
        });

        it('should chain withCornerRadius', () => {
            view.element = { style: {} };
            const result = view.withCornerRadius(10);
            assert.strictEqual(result, view);
            assert.strictEqual(view.element.style.borderRadius, '10px');
        });

        it('should chain withBorder', () => {
            view.element = { style: {} };
            const result = view.withBorder('blue', 2);
            assert.strictEqual(result, view);
            assert.strictEqual(view.element.style.border, '2px solid blue');
        });

        it('should chain withShadow', () => {
            view.element = { style: {} };
            const result = view.withShadow('black', { width: 5, height: 5 }, 10, 0.5);
            assert.strictEqual(result, view);
            assert.strictEqual(view.element.style.boxShadow, '5px 5px 10px 0.5 black');
        });
    });

    describe('Clips and Interaction', () => {
        it('should set clipsToBounds', () => {
            view.element = { style: {} };
            
            view.setClipsToBounds(true);
            assert.strictEqual(view.clipsToBounds, true);
            assert.strictEqual(view.element.style.overflow, 'hidden');
        });

        it('should set userInteractionEnabled', () => {
            view.element = { style: {} };
            
            view.setUserInteractionEnabled(false);
            assert.strictEqual(view.userInteractionEnabled, false);
            assert.strictEqual(view.element.style.pointerEvents, 'none');
        });
    });

    describe('Tag and ZIndex', () => {
        it('should set tag', () => {
            view.setTag(123);
            assert.strictEqual(view.tag, 123);
        });

        it('should set zIndex', () => {
            view.element = { style: {} };
            view.setZIndex(50);
            assert.strictEqual(view.zIndex, 50);
            assert.strictEqual(view.element.style.zIndex, 50);
        });
    });

    describe('First Responder', () => {
        it('should report not first responder by default', () => {
            assert.strictEqual(view.isFirstResponder(), false);
        });

        it('should not become first responder if cannot', () => {
            const result = view.becomeFirstResponder();
            assert.strictEqual(result, false);
            assert.strictEqual(view.isFirstResponder(), false);
        });

        it('should resign first responder', () => {
            view._isFirstResponder = true;
            const result = view.resignFirstResponder();
            assert.strictEqual(result, true);
            assert.strictEqual(view.isFirstResponder(), false);
        });
    });

    describe('Lifecycle', () => {
        it('should have lifecycle methods', () => {
            assert.strictEqual(typeof view.didMoveToSuperview, 'function');
            assert.strictEqual(typeof view.willMoveToWindow, 'function');
            assert.strictEqual(typeof view.didMoveToWindow, 'function');
        });

        it('should deinit properly', () => {
            view.element = { something: true };
            view.deinit();
            assert.strictEqual(view.element, null);
            assert.deepStrictEqual(view.subviews, []);
            assert.strictEqual(view.superview, null);
        });
    });

    describe('Encoding and Decoding', () => {
        it('should encode view properties', () => {
            view.frame = { x: 10, y: 20, width: 100, height: 50 };
            view.alpha = 0.8;
            view.hidden = true;
            view.tag = 42;
            
            const encoded = view.encode();
            assert.strictEqual(encoded.frame.x, 10);
            assert.strictEqual(encoded.alpha, 0.8);
            assert.strictEqual(encoded.hidden, true);
            assert.strictEqual(encoded.tag, 42);
        });

        it('should decode view properties', () => {
            const data = {
                frame: { x: 10, y: 20, width: 100, height: 50 },
                bounds: { x: 0, y: 0, width: 100, height: 50 },
                center: { x: 60, y: 45 },
                alpha: 0.5,
                hidden: false,
                clipsToBounds: true,
                userInteractionEnabled: true,
                tag: 99,
                zIndex: 10
            };
            
            const decoded = UIView.decode(data);
            assert.strictEqual(decoded._frame.x, 10);
            assert.strictEqual(decoded.alpha, 0.5);
            assert.strictEqual(decoded.tag, 99);
        });
    });
});

describe('UIView Hierarchy', () => {
    it('should maintain view hierarchy', () => {
        const root = new UIView();
        root.element = { appendChild: () => {}, removeChild: () => {} };
        
        const child1 = new UIView();
        const child2 = new UIView();
        child1.element = {};
        child2.element = {};
        
        root.addSubview(child1);
        root.addSubview(child2);
        
        assert.strictEqual(child1.superview, root);
        assert.strictEqual(child2.superview, root);
        assert.strictEqual(root.subviews.length, 2);
    });

    it('should handle deep hierarchy', () => {
        const root = new UIView();
        root.element = { appendChild: () => {}, removeChild: () => {}, style: {} };
        
        const level1 = new UIView();
        const level2 = new UIView();
        const level3 = new UIView();
        
        level1.element = { appendChild: () => {}, removeChild: () => {}, style: {} };
        level2.element = { appendChild: () => {}, removeChild: () => {}, style: {} };
        level3.element = { appendChild: () => {}, removeChild: () => {}, style: {} };
        
        root.addSubview(level1);
        level1.addSubview(level2);
        level2.addSubview(level3);
        
        assert.strictEqual(level1.superview, root);
        assert.strictEqual(level2.superview, level1);
        assert.strictEqual(level3.superview, level2);
        assert.strictEqual(root.subviews.length, 1);
        assert.strictEqual(level1.subviews.length, 1);
        assert.strictEqual(level2.subviews.length, 1);
    });

    it('should remove view from hierarchy', () => {
        const root = new UIView();
        root.element = { appendChild: () => {}, removeChild: () => {} };
        
        const child = new UIView();
        child.element = {};
        
        root.addSubview(child);
        child.removeFromSuperview();
        
        assert.strictEqual(child.superview, null);
        assert.strictEqual(root.subviews.length, 0);
    });
});

describe('UIView Layout Calculations', () => {
    it('should calculate correct center for various frames', () => {
        const view = new UIView();
        
        view.frame = { x: 0, y: 0, width: 100, height: 100 };
        assert.strictEqual(view.center.x, 50);
        assert.strictEqual(view.center.y, 50);
        
        view.frame = { x: 10, y: 20, width: 100, height: 100 };
        assert.strictEqual(view.center.x, 60);
        assert.strictEqual(view.center.y, 70);
        
        view.frame = { x: -50, y: -50, width: 100, height: 100 };
        assert.strictEqual(view.center.x, 0);
        assert.strictEqual(view.center.y, 0);
    });

    it('should handle zero dimensions', () => {
        const view = new UIView();
        view.frame = { x: 10, y: 20, width: 0, height: 0 };
        
        assert.strictEqual(view.center.x, 10);
        assert.strictEqual(view.center.y, 20);
        assert.strictEqual(view.bounds.width, 0);
        assert.strictEqual(view.bounds.height, 0);
    });

    it('should handle negative dimensions', () => {
        const view = new UIView();
        view.frame = { x: 100, y: 100, width: -50, height: -50 };
        
        assert.strictEqual(view.bounds.width, -50);
        assert.strictEqual(view.bounds.height, -50);
    });
});
