import { forCase, guardCase, guardLet, ifCase, ifLet, patternMatch, whileCase } from './PatternMatching.js';
import Switch from './Switch.js';
import UIControl from './UIControl.js';

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
        
        this._accessibilityTraits = ['adjustable'];
    }

    get description() {
        return `UIDatePicker(date: ${this._date.toISOString()}, mode: ${this.datePickerMode})`;
    }

    get date() {
        return this._date;
    }

    set date(value) {
        if (value instanceof Date) {
            this._date = value;
            this._accessibilityValue = value.toLocaleDateString();
            this.#updateDisplay();
            this._updateAccessibilityAttributes();
        }
    }

    get minimumDate() {
        return this._minimumDate;
    }

    get maximumDate() {
        return this._maximumDate;
    }

    dateValue() {
        return this._date;
    }

    init() {
        super.init();
        this._layer.cssClass = 'ui-datepicker';

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
        picker.style.position = 'absolute';
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
        return this;
    }

    setMinimumDate(date) {
        this._minimumDate = date instanceof Date ? date : null;
        return this;
    }

    setMaximumDate(date) {
        this._maximumDate = date instanceof Date ? date : null;
        return this;
    }

    setDatePickerMode(mode) {
        this.datePickerMode = mode;
        this.#createWheelsView();
        return this;
    }

    setPreferredDatePickerStyle(style) {
        this.preferredDatePickerStyle = style;
        this.#createWheelsView();
        return this;
    }

    setMinuteInterval(interval) {
        this.minuteInterval = Math.max(1, Math.min(60, interval));
        return this;
    }

    withDate(date) {
        return this.setDate(date);
    }

    withMinimumDate(date) {
        return this.setMinimumDate(date);
    }

    withMaximumDate(date) {
        return this.setMaximumDate(date);
    }

    withDatePickerMode(mode) {
        return this.setDatePickerMode(mode);
    }

    withPreferredDatePickerStyle(style) {
        return this.setPreferredDatePickerStyle(style);
    }

    withMinuteInterval(interval) {
        return this.setMinuteInterval(interval);
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
            date: this._date.toISOString(),
            minimumDate: this._minimumDate?.toISOString() || null,
            maximumDate: this._maximumDate?.toISOString() || null,
            datePickerMode: this.datePickerMode,
            minuteInterval: this.minuteInterval
        };
    }

    static decode(data) {
        const picker = new UIDatePicker();
        picker._date = data.date ? new Date(data.date) : new Date();
        picker._minimumDate = data.minimumDate ? new Date(data.minimumDate) : null;
        picker._maximumDate = data.maximumDate ? new Date(data.maximumDate) : null;
        picker.datePickerMode = data.datePickerMode || 'date';
        picker.minuteInterval = data.minuteInterval || 1;
        return picker;
    }

    static datePattern(date, pattern) {
        return Switch(pattern)
            .case('year', () => date.getFullYear())
            .case('month', () => date.getMonth() + 1)
            .case('day', () => date.getDate())
            .case('hours', () => date.getHours())
            .case('minutes', () => date.getMinutes())
            .case('seconds', () => date.getSeconds())
            .case('milliseconds', () => date.getMilliseconds())
            .case('dayOfWeek', () => date.getDay())
            .case('iso', () => date.toISOString())
            .case('dateString', () => date.toDateString())
            .case('timeString', () => date.toTimeString())
            .default(() => date.toISOString())
            .evaluate();
    }

    matchDate(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this._date);
        }
        if (typeof predicate === 'string') {
            return Switch(predicate)
                .case('past', () => this._date < new Date())
                .case('future', () => this._date > new Date())
                .case('today', () => this._date.toDateString() === new Date().toDateString())
                .case('tomorrow', () => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return this._date.toDateString() === tomorrow.toDateString();
                })
                .case('yesterday', () => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    return this._date.toDateString() === yesterday.toDateString();
                })
                .case(Switch.let('year'), (y) => this._date.getFullYear() === y)
                .case(Switch.let('month'), (m) => this._date.getMonth() + 1 === m)
                .case(Switch.tuple(Switch.let('year'), Switch.let('month')), 
                      (y, m) => this._date.getFullYear() === y && this._date.getMonth() + 1 === m)
                .default(() => false)
                .evaluate();
        }
        return false;
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

export default UIDatePicker;