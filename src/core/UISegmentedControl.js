import { NSNumber } from './Foundation.js';
import { forCase, guardCase, guardLet, ifCase, ifLet, patternMatch, whileCase } from './PatternMatching.js';
import Switch from './Switch.js';
import UIColor from './UIColor.js';
import UIControl from './UIControl.js';

class UISegmentedControl extends UIControl {
    constructor(items = []) {
        super();
        this.segments = items.map((item, index) => ({
            title: typeof item === 'string' ? item : '',
            image: typeof item === 'string' ? null : item,
            enabled: true
        }));
        this._selectedSegmentIndex = 0;
        this.tintColor = UIColor.systemBlue();
        this.selectedSegmentTintColor = null;
        this.apportionsSegmentWidthsByContent = false;
        
        this._accessibilityTraits = ['tabBar'];
    }

    get description() {
        const titles = this.segments.map(s => `"${s.title}"`).join(', ');
        return `UISegmentedControl(selectedIndex: ${this._selectedSegmentIndex}, segments: [${titles}])`;
    }

    get selectedSegmentIndex() {
        return this._selectedSegmentIndex;
    }

    set selectedSegmentIndex(index) {
        this._selectedSegmentIndex = index;
        this._accessibilityValue = this.segments[index]?.title || String(index);
        this._accessibilityState = this._accessibilityState || {};
        this._accessibilityState.selected = true;
        this.#updateAppearance();
        this._updateAccessibilityAttributes();
    }

    selectedSegmentIndexAsNumber() {
        return NSNumber.of(this._selectedSegmentIndex);
    }

    numberOfSegmentsAsNumber() {
        return NSNumber.of(this.segments.length);
    }

    segmentTitlesAsArray() {
        return this.segments.map(s => s.title);
    }

    init() {
        super.init();
        this._layer.cssClass = 'ui-segmented-control';

        this.segmentElements = [];

        this.segments.forEach((segment, index) => {
            const segmentEl = this.#createSegmentElement(segment, index);
            this.segmentElements.push(segmentEl);
            this.element.appendChild(segmentEl);
        });

        this.#updateAppearance();
        return this;
    }

    #createSegmentElement(segment, index) {
        const el = document.createElement('div');
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.padding = '8px 16px';
        el.style.flex = '1';
        el.style.transition = 'all 0.2s ease';
        el.style.cursor = 'pointer';
        el.style.userSelect = 'none';
        el.style.whiteSpace = 'nowrap';

        if (segment.title) {
            el.textContent = segment.title;
        } else if (segment.image) {
            el.innerHTML = segment.image;
        }

        el.setAttribute('data-index', index);
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', segment.enabled ? '0' : '-1');
        el.setAttribute('aria-selected', index === this._selectedSegmentIndex);

        el.addEventListener('click', (e) => {
            e.stopPropagation();
            if (segment.enabled && index !== this._selectedSegmentIndex) {
                this.setSelectedSegmentIndex(index, true);
                this.sendAction('valueChanged', 'click');
            }
        });

        el.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && index > 0) {
                e.preventDefault();
                this.setSelectedSegmentIndex(index - 1, true);
                this.sendAction('valueChanged', 'keydown');
            } else if (e.key === 'ArrowRight' && index < this.segments.length - 1) {
                e.preventDefault();
                this.setSelectedSegmentIndex(index + 1, true);
                this.sendAction('valueChanged', 'keydown');
            }
        });

        return el;
    }

    #updateAppearance() {
        if (!this.segmentElements.length) return;

        this.segmentElements.forEach((el, index) => {
            const segment = this.segments[index];
            const isSelected = index === this._selectedSegmentIndex;
            
            const { opacity, cursor } = Switch({ enabled: segment.enabled })
                .case({ enabled: false }, () => ({ opacity: '0.5', cursor: 'default' }))
                .default(() => ({ opacity: '1', cursor: 'pointer' }))
                .evaluate();
            el.style.opacity = opacity;
            el.style.cursor = cursor;

            const selectedState = Switch({ isSelected, enabled: segment.enabled })
                .case({ isSelected: true, enabled: true }, () => ({
                    backgroundColor: this.selectedSegmentTintColor?.css || this.tintColor.css,
                    color: '#ffffff',
                    fontWeight: '600',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    ariaSelected: 'true'
                }))
                .case({ isSelected: false, enabled: true }, () => ({
                    backgroundColor: 'transparent',
                    color: '#333',
                    fontWeight: 'normal',
                    boxShadow: 'none',
                    ariaSelected: 'false'
                }))
                .default(() => ({
                    backgroundColor: 'transparent',
                    color: '#333',
                    fontWeight: 'normal',
                    boxShadow: 'none',
                    ariaSelected: 'false'
                }))
                .evaluate();

            el.style.backgroundColor = selectedState.backgroundColor;
            el.style.color = selectedState.color;
            el.style.fontWeight = selectedState.fontWeight;
            el.style.boxShadow = selectedState.boxShadow;
            el.setAttribute('aria-selected', selectedState.ariaSelected);
            el.setAttribute('tabindex', segment.enabled ? '0' : '-1');
        });
    }

    insertSegment(title, index, animated = false) {
        const newSegment = {
            title: typeof title === 'string' ? title : '',
            image: typeof title === 'string' ? null : title,
            enabled: true
        };

        index = Math.max(0, Math.min(index, this.segments.length));
        this.segments.splice(index, 0, newSegment);

        const segmentEl = this.#createSegmentElement(newSegment, index);
        
        if (animated) {
            segmentEl.style.opacity = '0';
            segmentEl.style.transform = 'scale(0.9)';
        }

        if (index < this.segmentElements.length) {
            this.element.insertBefore(segmentEl, this.segmentElements[index]);
            this.segmentElements.splice(index, 0, segmentEl);
        } else {
            this.element.appendChild(segmentEl);
            this.segmentElements.push(segmentEl);
        }

        if (animated) {
            requestAnimationFrame(() => {
                segmentEl.style.transition = 'all 0.2s ease';
                segmentEl.style.opacity = '1';
                segmentEl.style.transform = 'scale(1)';
            });
        }

        this.#reindexSegments();
        
        if (this._selectedSegmentIndex >= index) {
            this._selectedSegmentIndex++;
        }
    }

    removeSegment(index) {
        if (index < 0 || index >= this.segments.length) return;

        this.segments.splice(index, 1);
        
        const removedEl = this.segmentElements[index];
        if (removedEl) {
            removedEl.remove();
        }
        this.segmentElements.splice(index, 1);

        this.#reindexSegments();

        if (this._selectedSegmentIndex >= this.segments.length) {
            this._selectedSegmentIndex = this.segments.length - 1;
        }
        this.#updateAppearance();
    }

    #reindexSegments() {
        this.segmentElements.forEach((el, index) => {
            el.setAttribute('data-index', index);
        });
    }

    setSelectedSegmentIndex(index, animated = false) {
        if (index < 0 || index >= this.segments.length) return this;
        
        if (animated) {
            this.segmentElements.forEach(el => {
                el.style.transition = 'all 0.2s ease';
            });
        }

        this._selectedSegmentIndex = index;
        this.#updateAppearance();
        return this;
    }

    setTitle(title, index) {
        if (index < 0 || index >= this.segments.length) return this;
        this.segments[index].title = title;
        this.segments[index].image = null;
        
        if (this.segmentElements[index]) {
            this.segmentElements[index].textContent = title;
        }
        return this;
    }

    setImage(image, index) {
        if (index < 0 || index >= this.segments.length) return this;
        this.segments[index].image = image;
        this.segments[index].title = '';
        
        if (this.segmentElements[index]) {
            this.segmentElements[index].innerHTML = image;
        }
        return this;
    }

    setEnabled(enabled, index) {
        if (index < 0 || index >= this.segments.length) return this;
        this.segments[index].enabled = enabled;
        this.#updateAppearance();
        return this;
    }

    setTintColor(color) {
        if (color instanceof UIColor) {
            this.tintColor = color;
        } else if (typeof color === 'string') {
            this.tintColor = UIColor.colorWithHex(color);
        }
        this.#updateAppearance();
        return this;
    }

    setSelectedSegmentTintColor(color) {
        if (color instanceof UIColor) {
            this.selectedSegmentTintColor = color;
        } else if (typeof color === 'string') {
            this.selectedSegmentTintColor = UIColor.colorWithHex(color);
        } else {
            this.selectedSegmentTintColor = null;
        }
        this.#updateAppearance();
        return this;
    }

    setApportionsSegmentWidthsByContent(apportions) {
        this.apportionsSegmentWidthsByContent = apportions;
        this.segmentElements.forEach(el => {
            el.style.flex = apportions ? '0 auto' : '1';
        });
        return this;
    }

    withSelectedSegmentIndex(index, animated) {
        return this.setSelectedSegmentIndex(index, animated);
    }

    withTitle(title, index) {
        return this.setTitle(title, index);
    }

    withImage(image, index) {
        return this.setImage(image, index);
    }

    withEnabled(enabled, index) {
        return this.setEnabled(enabled, index);
    }

    withTintColor(color) {
        return this.setTintColor(color);
    }

    withSelectedSegmentTintColor(color) {
        return this.setSelectedSegmentTintColor(color);
    }

    withApportionsSegmentWidthsByContent(apportions) {
        return this.setApportionsSegmentWidthsByContent(apportions);
    }

    numberOfSegments() {
        return this.segments.length;
    }

    titleForSegment(index) {
        if (index < 0 || index >= this.segments.length) return null;
        return this.segments[index].title;
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
            selectedSegmentIndex: this._selectedSegmentIndex,
            segments: this.segments.map(s => ({ title: s.title, enabled: s.enabled })),
            tintColor: this.tintColor?.hex
        };
    }

    static decode(data) {
        const titles = (data.segments || []).map(s => s.title || '');
        const control = new UISegmentedControl(titles);
        control._selectedSegmentIndex = data.selectedSegmentIndex || 0;
        if (data.tintColor) {
            control.tintColor = UIColor.colorWithHex(data.tintColor);
        }
        return control;
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

    ifLet(pattern) {
        return ifLet(this, pattern);
    }

    guardLet(pattern) {
        return guardLet(this, pattern);
    }

    switch() {
        return Switch(this);
    }
}

export default UISegmentedControl;