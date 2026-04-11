import UIControl from './UIControl.js';
import UIColor from './UIColor.js';

class UIDatePicker extends UIControl {
    constructor() {
        super();
        this._date = new Date();
        this._minimumDate = null;
        this._maximumDate = null;
        this.datePickerMode = 'date';
        this.preferredDatePickerStyle = 'wheels';
        this.minuteInterval = 1;
        this.timeZone = null;
        this.pickers = {};
    }

    get date() {
        return this._date;
    }

    set date(value) {
        if (value instanceof Date) {
            this._date = value;
            this.#updateDisplay();
        }
    }

    get minimumDate() {
        return this._minimumDate;
    }

    get maximumDate() {
        return this._maximumDate;
    }

    init() {
        super.init();
        this.element.className = 'ui-datepicker';
        this.element.style.position = 'relative';
        this.element.style.display = 'inline-block';
        this.element.style.cursor = 'pointer';
        this.element.style.userSelect = 'none';

        this.#createWheelsView();

        return this;
    }

    #createWheelsView() {
        this.element.innerHTML = '';
        this.element.style.backgroundColor = '#f8f8f8';
        this.element.style.borderRadius = '8px';
        this.element.style.border = '1px solid #ccc';
        this.element.style.padding = '10px';
        this.element.style.display = 'flex';
        this.element.style.justifyContent = 'center';

        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.gap = '4px';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';

        this.pickers = {};

        if (this.datePickerMode === 'date' || this.datePickerMode === 'dateAndTime') {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            this.pickers.month = this.#createWheelPicker(months, this._date.getMonth());
            container.appendChild(this.pickers.month.container);

            const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
            this.pickers.day = this.#createWheelPicker(days, this._date.getDate() - 1);
            container.appendChild(this.pickers.day.container);

            const years = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - 80 + i));
            this.pickers.year = this.#createWheelPicker(years, 80);
            container.appendChild(this.pickers.year.container);
        }

        if (this.datePickerMode === 'time' || this.datePickerMode === 'dateAndTime') {
            const timeSep = document.createElement('span');
            timeSep.textContent = ':';
            timeSep.style.fontSize = '16px';
            timeSep.style.fontWeight = 'bold';
            timeSep.style.padding = '0 2px';
            container.appendChild(timeSep);

            const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
            this.pickers.hour = this.#createWheelPicker(hours, (this._date.getHours() % 12) || 12 - 1);
            container.appendChild(this.pickers.hour.container);

            const minutes = Array.from({ length: 60 / this.minuteInterval }, (_, i) => String(i * this.minuteInterval).padStart(2, '0'));
            this.pickers.minute = this.#createWheelPicker(minutes, Math.floor(this._date.getMinutes() / this.minuteInterval));
            container.appendChild(this.pickers.minute.container);

            const ampm = ['AM', 'PM'];
            this.pickers.ampm = this.#createWheelPicker(ampm, this._date.getHours() >= 12 ? 1 : 0);
            container.appendChild(this.pickers.ampm.container);
        }

        this.element.appendChild(container);
    }

    #createWheelPicker(values, selectedIndex) {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';

        const picker = document.createElement('div');
        picker.style.position = 'relative';
        picker.style.width = '45px';
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

        const itemsContainer = document.createElement('div');
        itemsContainer.style.padding = '40px 0';
        
        values.forEach((value, index) => {
            const item = document.createElement('div');
            item.style.height = '40px';
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.justifyContent = 'center';
            item.style.fontSize = '14px';
            item.style.color = '#333';
            item.style.scrollSnapAlign = 'center';
            item.textContent = value;
            item.dataset.index = index;
            itemsContainer.appendChild(item);
        });

        scrollArea.appendChild(itemsContainer);

        const indicator = document.createElement('div');
        indicator.style.position = 'absolute';
        indicator.style.left = '0';
        indicator.style.right = '0';
        indicator.style.top = '40px';
        indicator.style.height = '40px';
        indicator.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
        indicator.style.pointerEvents = 'none';
        indicator.style.borderTop = '1px solid rgba(0, 122, 255, 0.3)';
        indicator.style.borderBottom = '1px solid rgba(0, 122, 255, 0.3)';

        picker.appendChild(scrollArea);
        picker.appendChild(indicator);
        container.appendChild(picker);

        const updateSelection = () => {
            const scrollTop = scrollArea.scrollTop;
            const index = Math.round(scrollTop / 40);
            const clampedIndex = Math.max(0, Math.min(values.length - 1, index));
            
            itemsContainer.querySelectorAll('div').forEach((item, i) => {
                item.style.color = i === clampedIndex ? '#007aff' : '#333';
                item.style.fontWeight = i === clampedIndex ? 'bold' : 'normal';
            });
        };

        scrollArea.addEventListener('scroll', () => {
            updateSelection();
            this.#updateDateFromPickers();
        });

        const selectValue = (index, animated = true) => {
            const clampedIndex = Math.max(0, Math.min(values.length - 1, index));
            scrollArea.scrollTo({
                top: clampedIndex * 40,
                behavior: animated ? 'smooth' : 'auto'
            });
        };

        setTimeout(() => {
            scrollArea.scrollTop = selectedIndex * 40;
            updateSelection();
        }, 0);

        return {
            container,
            scrollArea,
            values,
            selectValue,
            getSelectedIndex: () => Math.round(scrollArea.scrollTop / 40)
        };
    }

    #updateDisplay() {
        if (this.pickers.month) {
            this.pickers.month.selectValue(this._date.getMonth(), false);
        }
        if (this.pickers.day) {
            this.pickers.day.selectValue(this._date.getDate() - 1, false);
        }
        if (this.pickers.year) {
            const yearIndex = this.pickers.year.values.indexOf(String(this._date.getFullYear()));
            if (yearIndex >= 0) {
                this.pickers.year.selectValue(yearIndex, false);
            }
        }
        if (this.pickers.hour) {
            const hour = this._date.getHours() % 12 || 12;
            this.pickers.hour.selectValue(hour - 1, false);
        }
        if (this.pickers.minute) {
            this.pickers.minute.selectValue(Math.floor(this._date.getMinutes() / this.minuteInterval), false);
        }
        if (this.pickers.ampm) {
            this.pickers.ampm.selectValue(this._date.getHours() >= 12 ? 1 : 0, false);
        }
    }

    #updateDateFromPickers() {
        let year = this._date.getFullYear();
        let month = this._date.getMonth();
        let day = this._date.getDate();
        let hours = this._date.getHours();
        let minutes = this._date.getMinutes();

        if (this.pickers.month) {
            month = this.pickers.month.getSelectedIndex();
        }
        if (this.pickers.day) {
            day = this.pickers.day.getSelectedIndex() + 1;
        }
        if (this.pickers.year) {
            const yearStr = this.pickers.year.values[this.pickers.year.getSelectedIndex()];
            if (yearStr) year = parseInt(yearStr);
        }
        if (this.pickers.hour) {
            hours = (this.pickers.hour.getSelectedIndex() + 1) % 12;
            if (this.pickers.ampm && this.pickers.ampm.getSelectedIndex() === 1) {
                hours += 12;
            }
        }
        if (this.pickers.minute) {
            minutes = this.pickers.minute.getSelectedIndex() * this.minuteInterval;
        }

        const newDate = new Date(year, month, day, hours, minutes, 0, 0);

        if (this._minimumDate && newDate < this._minimumDate) {
            newDate.setTime(this._minimumDate.getTime());
        }
        if (this._maximumDate && newDate > this._maximumDate) {
            newDate.setTime(this._maximumDate.getTime());
        }

        this._date = newDate;
    }

    setDate(date, animated = false) {
        if (date instanceof Date) {
            this._date = date;
            this.#updateDisplay();
            this.sendAction('valueChanged', 'change');
        }
    }

    setMinimumDate(date) {
        this._minimumDate = date instanceof Date ? date : null;
    }

    setMaximumDate(date) {
        this._maximumDate = date instanceof Date ? date : null;
    }

    setDatePickerMode(mode) {
        this.datePickerMode = mode;
        this.#createWheelsView();
    }

    setPreferredDatePickerStyle(style) {
        this.preferredDatePickerStyle = style;
        this.#createWheelsView();
    }

    setMinuteInterval(interval) {
        this.minuteInterval = Math.max(1, Math.min(60, interval));
    }

    layoutSubviews() {
        super.layoutSubviews();
        if (this.element) {
            this.element.style.width = `${this.frame.width}px`;
            this.element.style.height = `${this.frame.height}px`;
        }
    }
}

export default UIDatePicker;