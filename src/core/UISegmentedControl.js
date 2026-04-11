import UIControl from './UIControl.js';
import UIColor from './UIColor.js';
import { NSNumber } from './Foundation.js';

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
        this.#updateAppearance();
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
        this.element.className = 'ui-segmented-control';
        this.element.style.position = 'relative';
        this.element.style.display = 'inline-flex';
        this.element.style.flexDirection = 'row';
        this.element.style.alignItems = 'center';
        this.element.style.cursor = 'pointer';
        this.element.style.userSelect = 'none';
        this.element.style.backgroundColor = '#f0f0f0';
        this.element.style.borderRadius = '6px';
        this.element.style.padding = '2px';
        this.element.style.border = '1px solid #ccc';
        this.element.style.overflow = 'hidden';

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
            
            if (!segment.enabled) {
                el.style.opacity = '0.5';
                el.style.cursor = 'default';
            } else {
                el.style.opacity = '1';
                el.style.cursor = 'pointer';
            }

            if (index === this._selectedSegmentIndex) {
                el.style.backgroundColor = this.selectedSegmentTintColor 
                    ? this.selectedSegmentTintColor.css 
                    : this.tintColor.css;
                el.style.color = '#ffffff';
                el.style.fontWeight = '600';
                el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                el.setAttribute('aria-selected', 'true');
            } else {
                el.style.backgroundColor = 'transparent';
                el.style.color = '#333';
                el.style.fontWeight = 'normal';
                el.style.boxShadow = 'none';
                el.setAttribute('aria-selected', 'false');
            }

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
        if (index < 0 || index >= this.segments.length) return;
        
        if (animated) {
            this.segmentElements.forEach(el => {
                el.style.transition = 'all 0.2s ease';
            });
        }

        this._selectedSegmentIndex = index;
        this.#updateAppearance();
    }

    setTitle(title, index) {
        if (index < 0 || index >= this.segments.length) return;
        this.segments[index].title = title;
        this.segments[index].image = null;
        
        if (this.segmentElements[index]) {
            this.segmentElements[index].textContent = title;
        }
    }

    setImage(image, index) {
        if (index < 0 || index >= this.segments.length) return;
        this.segments[index].image = image;
        this.segments[index].title = '';
        
        if (this.segmentElements[index]) {
            this.segmentElements[index].innerHTML = image;
        }
    }

    setEnabled(enabled, index) {
        if (index < 0 || index >= this.segments.length) return;
        this.segments[index].enabled = enabled;
        this.#updateAppearance();
    }

    setTintColor(color) {
        if (color instanceof UIColor) {
            this.tintColor = color;
        } else if (typeof color === 'string') {
            this.tintColor = UIColor.colorWithHex(color);
        }
        this.#updateAppearance();
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
    }

    setApportionsSegmentWidthsByContent(apportions) {
        this.apportionsSegmentWidthsByContent = apportions;
        this.segmentElements.forEach(el => {
            el.style.flex = apportions ? '0 auto' : '1';
        });
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
}

export default UISegmentedControl;