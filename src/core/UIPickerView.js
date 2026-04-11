import UIView from './UIView.js';
import UIColor from './UIColor.js';
import { WeakRef } from './WeakReference.js';
import { NSNumber, kp, getProperty, updateProperty, compareBy, compareByDescending } from './Foundation.js';
import Switch from './Switch.js';
import { ifCase, guardCase, whileCase, forCase, patternMatch } from './PatternMatching.js';
import { defineTypeAlias } from './Protocol.js';
import {
    PickerViewDelegate,
    PickerViewDataSource
} from './TypeAliases.js';

defineTypeAlias('PickerViewDelegateBundle', PickerViewDelegate, PickerViewDataSource);

class UIPickerView extends UIView {
    constructor() {
        super();
        this._delegate = null;
        this._dataSource = null;
        this.numberOfComponents = 1;
        this.selectedRow = 0;
        this.pickers = [];
        this._data = [];
    }

    get description() {
        return `UIPickerView(numberOfComponents: ${this.numberOfComponents}, selectedRow: ${this.selectedRow})`;
    }

    get delegate() {
        return this._delegate ? this._delegate.target : null;
    }

    set delegate(value) {
        this._delegate = value instanceof WeakRef ? value : (value ? new WeakRef(value) : null);
    }

    get dataSource() {
        return this._dataSource ? this._dataSource.target : null;
    }

    set dataSource(value) {
        this._dataSource = value instanceof WeakRef ? value : (value ? new WeakRef(value) : null);
    }

    selectedRowAsNumber() {
        return NSNumber.of(this.selectedRow);
    }

    numberOfComponentsAsNumber() {
        return NSNumber.of(this.numberOfComponents);
    }

    init() {
        this.element = document.createElement('div');
        this.element.className = 'ui-pickerview';
        this.element.style.display = 'flex';
        this.element.style.alignItems = 'center';
        this.element.style.justifyContent = 'center';
        this.element.style.backgroundColor = UIColor.systemBackground().css;
        this.element.style.borderRadius = '8px';
        this.element.style.border = '1px solid #ccc';
        this.element.style.padding = '8px';
        this.element.style.height = '150px';
        this.element.style.maxWidth = '300px';

        return this;
    }

    reloadAllComponents() {
        if (!this.dataSource) return;

        this.element.innerHTML = '';
        this.pickers = [];

        this.numberOfComponents = this.dataSource.numberOfComponentsInPickerView ? 
            this.dataSource.numberOfComponentsInPickerView(this) : 1;

        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.gap = '4px';
        container.style.height = '100%';
        container.style.alignItems = 'center';

        for (let component = 0; component < this.numberOfComponents; component++) {
            const numberOfRows = this.dataSource.pickerView_numberOfRowsInComponent(this, component);
            const picker = this.#createWheelPicker(component, numberOfRows);
            this.pickers.push(picker);
            container.appendChild(picker.container);
        }

        this.element.appendChild(container);
    }

    #createWheelPicker(componentIndex, numberOfRows) {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.height = '100%';

        const picker = document.createElement('div');
        picker.style.position = 'relative';
        picker.style.width = '50px';
        picker.style.height = '120px';
        picker.style.overflow = 'hidden';
        picker.style.backgroundColor = '#fff';
        picker.style.borderRadius = '6px';
        picker.style.border = '1px solid #ddd';

        const scrollArea = document.createElement('div');
        scrollArea.style.position = 'absolute';
        scrollArea.style.left = '0';
        scrollArea.style.right = '0';
        scrollArea.style.top = '0';
        scrollArea.style.bottom = '0';
        scrollArea.style.overflowY = 'scroll';
        scrollArea.style.scrollSnapType = 'y mandatory';
        scrollArea.style.msOverflowStyle = 'none';
        scrollArea.style.scrollbarWidth = 'none';
        scrollArea.style.padding = '40px 0';

        for (let row = 0; row < numberOfRows; row++) {
            const item = document.createElement('div');
            item.style.height = '40px';
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.justifyContent = 'center';
            item.style.fontSize = '14px';
            item.style.color = '#333';
            item.style.scrollSnapAlign = 'center';
            item.dataset.row = row;
            item.dataset.component = componentIndex;

            if (this.delegate && typeof this.delegate.pickerView_titleForRow_forComponent === 'function') {
                item.textContent = this.delegate.pickerView_titleForRow_forComponent(this, row, componentIndex);
            } else {
                item.textContent = `Item ${row + 1}`;
            }

            scrollArea.appendChild(item);
        }

        const indicator = document.createElement('div');
        indicator.style.position = 'absolute';
        indicator.style.left = '2px';
        indicator.style.right = '2px';
        indicator.style.top = '40px';
        indicator.style.height = '40px';
        indicator.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
        indicator.style.pointerEvents = 'none';
        indicator.style.borderRadius = '4px';
        indicator.style.border = '1px solid rgba(0, 122, 255, 0.3)';

        picker.appendChild(scrollArea);
        picker.appendChild(indicator);
        container.appendChild(picker);

        const updateSelection = () => {
            const scrollTop = scrollArea.scrollTop;
            const index = Math.round(scrollTop / 40);
            const rows = scrollArea.querySelectorAll('div[data-row]');
            rows.forEach((item, i) => {
                item.style.color = i === index ? '#007aff' : '#333';
                item.style.fontWeight = i === index ? 'bold' : 'normal';
            });
        };

        scrollArea.addEventListener('scroll', () => {
            updateSelection();
        });

        scrollArea.addEventListener('click', (e) => {
            if (e.target.dataset.row !== undefined) {
                const row = parseInt(e.target.dataset.row);
                scrollArea.scrollTo({
                    top: row * 40,
                    behavior: 'smooth'
                });
                this.selectedRow = row;
                if (this.delegate && typeof this.delegate.pickerView_didSelectRow_inComponent === 'function') {
                    this.delegate.pickerView_didSelectRow_inComponent(this, row, componentIndex);
                }
            }
        });

        setTimeout(() => {
            scrollArea.scrollTop = this.selectedRow * 40;
            updateSelection();
        }, 0);

        return {
            container,
            scrollArea,
            picker,
            componentIndex
        };
    }

    selectRow(row, inComponent, animated = false) {
        this.selectedRow = row;
        if (this.pickers[inComponent]) {
            const scrollArea = this.pickers[inComponent].scrollArea;
            if (animated) {
                scrollArea.scrollTo({
                    top: row * 40,
                    behavior: 'smooth'
                });
            } else {
                scrollArea.scrollTop = row * 40;
            }
        }
        return this;
    }

    withSelectRow(row, inComponent, animated) {
        return this.selectRow(row, inComponent, animated);
    }

    selectedRowInComponent(component) {
        if (this.pickers[component]) {
            const scrollArea = this.pickers[component].scrollArea;
            return Math.round(scrollArea.scrollTop / 40);
        }
        return 0;
    }

    numberOfRowsInComponent(component) {
        if (this.dataSource && typeof this.dataSource.pickerView_numberOfRowsInComponent === 'function') {
            return this.dataSource.pickerView_numberOfRowsInComponent(this, component);
        }
        return 10;
    }

    viewForRow(row, inComponent) {
        if (this.delegate && typeof this.delegate.pickerView_viewForRow_forComponent === 'function') {
            return this.delegate.pickerView_viewForRow_forComponent(this, row, inComponent);
        }
        return null;
    }

    layoutSubviews() {
        super.layoutSubviews();
        if (this._gradientLayer || this._shapeLayers?.length > 0) {
            this.#renderLayers();
        }
    }

    #renderLayers() {
        if (!this.element) return;
        const existingCanvas = this.element.querySelector('.layer-canvas');
        if (existingCanvas) existingCanvas.remove();
        if (this._layer?._sublayers?.length === 0) return;
        const canvas = document.createElement('canvas');
        canvas.className = 'layer-canvas';
        canvas.style.position = 'absolute';
        canvas.style.left = '0';
        canvas.style.top = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.width = this._bounds.width * 2;
        canvas.height = this._bounds.height * 2;
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);
        for (const sublayer of this._layer._sublayers) {
            sublayer.renderToContext(ctx);
        }
        this.element.style.position = 'relative';
        this.element.insertBefore(canvas, this.element.firstChild);
    }

    withShadow(color, opacity, offset, radius) {
        this.setShadow?.(color, opacity, offset, radius);
        return this;
    }

    withCornerRadius(radius) {
        if (this.element) {
            this.element.style.borderRadius = `${radius}px`;
        }
        if (this._layer) {
            this._layer.cornerRadius = radius;
        }
        return this;
    }

    withBackgroundColor(color) {
        if (this.element) {
            this.element.style.backgroundColor = color?.css || color;
        }
        return this;
    }

    withGradient(colors, locations, startPoint, endPoint) {
        if (this._layer) {
            const { CAGradientLayer } = require('./CALayer.js');
            const gradient = CAGradientLayer.layer();
            gradient.colors = colors;
            gradient.frame = { x: 0, y: 0, width: this._bounds.width, height: this._bounds.height };
            if (locations) gradient.locations = locations;
            if (startPoint) gradient.startPoint = startPoint;
            if (endPoint) gradient.endPoint = endPoint;
            gradient.name = 'pickerGradientLayer';
            this._layer.addSublayer(gradient);
            this.#renderLayers();
        }
        return this;
    }

    deinit() {
        this.pickers = [];
        this._delegate = null;
        this._dataSource = null;
        super.deinit();
    }

    encode() {
        return {
            numberOfComponents: this.numberOfComponents,
            selectedRow: this.selectedRow
        };
    }

    static decode(data) {
        const picker = new UIPickerView();
        picker.numberOfComponents = data.numberOfComponents || 1;
        picker.selectedRow = data.selectedRow || 0;
        return picker;
    }

    matchSelection(predicate) {
        if (typeof predicate === 'function') {
            return predicate({ selectedRow: this.selectedRow, numberOfComponents: this.numberOfComponents });
        }
        return Switch(predicate)
            .case({ row: Switch.let('r') }, (m) => this.selectedRow === m.r)
            .case({ component: Switch.let('c') }, (m) => this.numberOfComponents === m.c)
            .case({ row: Switch.let('r'), component: Switch.let('c') }, 
                  (m) => this.selectedRow === m.r && this.numberOfComponents === m.c)
            .case({ first: true }, () => this.selectedRow === 0)
            .case({ last: true }, () => this.selectedRow === this.pickers.length - 1)
            .case({ empty: true }, () => this.numberOfComponents === 0)
            .case({ singleComponent: true }, () => this.numberOfComponents === 1)
            .default(() => false)
            .evaluate();
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

export default UIPickerView;