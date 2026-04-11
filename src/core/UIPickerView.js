import UIView from './UIView.js';
import UIColor from './UIColor.js';
import { WeakRef } from './WeakReference.js';

class UIPickerView extends UIView {
    constructor() {
        super();
        this._delegate = null;
        this._dataSource = null;
        this.numberOfComponents = 1;
        this.selectedRow = 0;
        this.pickers = [];
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
    }

    deinit() {
        this.pickers = [];
        this._delegate = null;
        this._dataSource = null;
        super.deinit();
    }
}

export default UIPickerView;