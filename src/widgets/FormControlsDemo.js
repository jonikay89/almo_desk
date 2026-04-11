import WidgetView from './WidgetView.js';
import { UITextField, UITextView, UISwitch, UISlider, UIStepper, UISegmentedControl, UIDatePicker, UIColor, UILabel, UIStackView, UIButton } from '../core/index.js';

class FormControlsDemo extends WidgetView {
    constructor(extraData, windowController) {
        super(extraData);
        this.windowController = windowController;
        this.controls = {};
    }

    createView() {
        const container = document.createElement('div');
        container.className = 'form-controls-demo';
        container.style.padding = '16px';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '20px';
        container.style.overflowY = 'auto';
        container.style.height = '100%';
        container.style.boxSizing = 'border-box';
        container.style.backgroundColor = 'rgba(255,255,255,0.95)';
        container.style.borderRadius = '8px';

        const title = document.createElement('h2');
        title.textContent = 'Form Controls Demo';
        title.style.margin = '0 0 8px 0';
        title.style.fontSize = '18px';
        title.style.color = '#333';
        container.appendChild(title);

        const segmentedSection = this.#createSegmentedSection();
        container.appendChild(segmentedSection);

        const textFieldSection = this.#createTextFieldSection();
        container.appendChild(textFieldSection);

        const textViewSection = this.#createTextViewSection();
        container.appendChild(textViewSection);

        const sliderSection = this.#createSliderSection();
        container.appendChild(sliderSection);

        const stepperSection = this.#createStepperSection();
        container.appendChild(stepperSection);

        const switchSection = this.#createSwitchSection();
        container.appendChild(switchSection);

        const datePickerSection = this.#createDatePickerSection();
        container.appendChild(datePickerSection);

        const resultSection = this.#createResultSection();
        container.appendChild(resultSection);

        return container;
    }

    #createSectionHeader(titleText) {
        const header = document.createElement('div');
        header.style.marginBottom = '8px';
        
        const label = document.createElement('span');
        label.textContent = titleText;
        label.style.fontSize = '13px';
        label.style.fontWeight = '600';
        label.style.color = '#666';
        header.appendChild(label);
        
        return header;
    }

    #createSegmentedSection() {
        const section = document.createElement('div');
        section.appendChild(this.#createSectionHeader('UISegmentedControl'));

        const segmented = new UISegmentedControl(['Option A', 'Option B', 'Option C']);
        segmented.init();
        segmented.setFrame(0, 0, 280, 36);
        segmented.setTintColor(UIColor.systemBlue());
        segmented.setSelectedSegmentTintColor(UIColor.systemBlue());

        segmented.addTarget(this, 'onSegmentChanged', 'click');
        this.controls.segmented = segmented;

        section.appendChild(segmented.element);
        return section;
    }

    #createTextFieldSection() {
        const section = document.createElement('div');
        section.appendChild(this.#createSectionHeader('UITextField'));

        const stack = new UIStackView();
        stack.init();
        stack.setFrame(0, 0, 280, 80);
        stack.axis = 'vertical';
        stack.spacing = 8;

        const nameField = new UITextField('Enter your name');
        nameField.init();
        nameField.setFrame(0, 0, 280, 36);
        nameField.setTextAlignment('left');
        nameField.addTarget(this, 'onNameChanged', 'input');
        this.controls.nameField = nameField;

        const emailField = new UITextField('email@example.com');
        emailField.init();
        emailField.setFrame(0, 0, 280, 36);
        emailField.setKeyboardType('emailAddress');
        emailField.addTarget(this, 'onEmailChanged', 'input');
        this.controls.emailField = emailField;

        stack.addArrangedSubview(nameField);
        stack.addArrangedSubview(emailField);

        section.appendChild(stack.element);
        return section;
    }

    #createTextViewSection() {
        const section = document.createElement('div');
        section.appendChild(this.#createSectionHeader('UITextView'));

        const textView = new UITextView('This is a multi-line text view. You can enter multiple lines of text here.');
        textView.init();
        textView.setFrame(0, 0, 280, 80);
        textView.setEditable(true);
        textView.setTextColor(UIColor.black());
        textView.element.style.fontSize = '14px';
        this.controls.textView = textView;

        section.appendChild(textView.element);
        return section;
    }

    #createSliderSection() {
        const section = document.createElement('div');
        section.appendChild(this.#createSectionHeader('UISlider'));

        const sliderValue = new UILabel('Value: 50%');
        sliderValue.init();
        sliderValue.setFrame(0, 0, 100, 20);
        sliderValue.setFontSize(12);
        sliderValue.setTextColor(UIColor.gray());
        this.controls.sliderLabel = sliderValue;

        const slider = new UISlider();
        slider.init();
        slider.setFrame(0, 0, 260, 30);
        slider.setValue(0.5);
        slider.setMinimumTrackTintColor(UIColor.systemBlue());
        slider.setMaximumTrackTintColor(UIColor.lightGray());
        slider.addTarget(this, 'onSliderChanged', 'input');
        this.controls.slider = slider;

        section.appendChild(sliderValue.element);
        section.appendChild(slider.element);
        return section;
    }

    #createStepperSection() {
        const section = document.createElement('div');
        section.appendChild(this.#createSectionHeader('UIStepper'));

        const stepperRow = document.createElement('div');
        stepperRow.style.display = 'flex';
        stepperRow.style.alignItems = 'center';
        stepperRow.style.gap = '12px';

        const stepperValue = new UILabel('Quantity: 0');
        stepperValue.init();
        stepperValue.setFrame(0, 0, 100, 20);
        stepperValue.setFontSize(12);
        stepperValue.setTextColor(UIColor.gray());
        this.controls.stepperLabel = stepperValue;

        const stepper = new UIStepper();
        stepper.init();
        stepper.setFrame(0, 0, 120, 32);
        stepper.setMinimumValue(0);
        stepper.setMaximumValue(100);
        stepper.setStepValue(1);
        stepper.setValue(0);
        stepper.addTarget(this, 'onStepperChanged', 'click');
        this.controls.stepper = stepper;

        stepperRow.appendChild(stepperValue.element);
        stepperRow.appendChild(stepper.element);
        section.appendChild(stepperRow);
        return section;
    }

    #createSwitchSection() {
        const section = document.createElement('div');
        section.appendChild(this.#createSectionHeader('UISwitch'));

        const switchRow = document.createElement('div');
        switchRow.style.display = 'flex';
        switchRow.style.alignItems = 'center';
        switchRow.style.gap = '12px';

        const notificationsLabel = new UILabel('Enable Notifications');
        notificationsLabel.init();
        notificationsLabel.setFrame(0, 0, 150, 20);
        notificationsLabel.setFontSize(14);
        this.controls.notificationsLabel = notificationsLabel;

        const notificationsSwitch = new UISwitch();
        notificationsSwitch.init();
        notificationsSwitch.setFrame(0, 0, 50, 30);
        notificationsSwitch.setOnTintColor(UIColor.systemGreen());
        notificationsSwitch.addTarget(this, 'onSwitchChanged', 'click');
        this.controls.notificationsSwitch = notificationsSwitch;

        const darkModeLabel = new UILabel('Dark Mode');
        darkModeLabel.init();
        darkModeLabel.setFrame(0, 0, 100, 20);
        darkModeLabel.setFontSize(14);
        this.controls.darkModeLabel = darkModeLabel;

        const darkModeSwitch = new UISwitch();
        darkModeSwitch.init();
        darkModeSwitch.setFrame(0, 0, 50, 30);
        darkModeSwitch.setOnTintColor(UIColor.systemIndigo());
        darkModeSwitch.addTarget(this, 'onSwitchChanged', 'click');
        this.controls.darkModeSwitch = darkModeSwitch;

        switchRow.appendChild(notificationsLabel.element);
        switchRow.appendChild(notificationsSwitch.element);
        switchRow.appendChild(darkModeLabel.element);
        switchRow.appendChild(darkModeSwitch.element);
        section.appendChild(switchRow);
        return section;
    }

    #createDatePickerSection() {
        const section = document.createElement('div');
        section.appendChild(this.#createSectionHeader('UIDatePicker'));

        const datePicker = new UIDatePicker();
        datePicker.init();
        datePicker.setFrame(0, 0, 280, 160);
        datePicker.setDatePickerMode('dateAndTime');
        datePicker.setDate(new Date());
        datePicker.setMinimumDate(new Date(Date.now() - 86400000 * 365 * 10));
        datePicker.setMaximumDate(new Date(Date.now() + 86400000 * 365 * 10));
        this.controls.datePicker = datePicker;

        section.appendChild(datePicker.element);
        return section;
    }

    #createResultSection() {
        const section = document.createElement('div');
        section.style.marginTop = '8px';
        section.style.padding = '12px';
        section.style.backgroundColor = '#f5f5f5';
        section.style.borderRadius = '6px';

        const resultTitle = document.createElement('div');
        resultTitle.textContent = 'Live Values:';
        resultTitle.style.fontSize = '12px';
        resultTitle.style.fontWeight = '600';
        resultTitle.style.color = '#666';
        resultTitle.style.marginBottom = '8px';
        section.appendChild(resultTitle);

        const resultContent = document.createElement('div');
        resultContent.id = 'form-result';
        resultContent.style.fontSize = '11px';
        resultContent.style.fontFamily = 'monospace';
        resultContent.style.color = '#333';
        resultContent.style.whiteSpace = 'pre-wrap';
        section.appendChild(resultContent);

        this.controls.resultDisplay = resultContent;
        this.#updateResult();

        return section;
    }

    #updateResult() {
        if (!this.controls.resultDisplay) return;

        const lines = [
            `Segment: ${this.controls.segmented?.selectedSegmentIndex ?? 'N/A'}`,
            `Name: ${this.controls.nameField?.text || '(empty)'}`,
            `Email: ${this.controls.emailField?.text || '(empty)'}`,
            `TextView: ${(this.controls.textView?.text || '').substring(0, 30)}...`,
            `Slider: ${Math.round((this.controls.slider?.value || 0) * 100)}%`,
            `Stepper: ${this.controls.stepper?.value ?? 0}`,
            `Notifications: ${this.controls.notificationsSwitch?.isOn ? 'ON' : 'OFF'}`,
            `Dark Mode: ${this.controls.darkModeSwitch?.isOn ? 'ON' : 'OFF'}`,
            `Date: ${this.controls.datePicker?.date?.toLocaleString() || 'N/A'}`
        ];

        this.controls.resultDisplay.textContent = lines.join('\n');
    }

    onSegmentChanged(event) {
        if (this.controls.segmented) {
            console.log('Segment changed to:', this.controls.segmented.selectedSegmentIndex);
            this.#updateResult();
        }
    }

    onNameChanged(event) {
        if (this.controls.nameField) {
            console.log('Name changed to:', this.controls.nameField.text);
            this.#updateResult();
        }
    }

    onEmailChanged(event) {
        if (this.controls.emailField) {
            console.log('Email changed to:', this.controls.emailField.text);
            this.#updateResult();
        }
    }

    onSliderChanged(event) {
        if (this.controls.slider && this.controls.sliderLabel) {
            const value = Math.round(this.controls.slider.value * 100);
            this.controls.sliderLabel.setText(`Value: ${value}%`);
            this.#updateResult();
        }
    }

    onStepperChanged(event) {
        if (this.controls.stepper && this.controls.stepperLabel) {
            this.controls.stepperLabel.setText(`Quantity: ${this.controls.stepper.value}`);
            this.#updateResult();
        }
    }

    onSwitchChanged(event) {
        this.#updateResult();
    }

    onDateChanged(event) {
        if (this.controls.datePicker) {
            console.log('Date changed to:', this.controls.datePicker.date);
            this.#updateResult();
        }
    }

    viewDidLoad() {
        this.#updateResult();
    }

    layoutSubviews() {
        super.layoutSubviews();
    }
}

export default FormControlsDemo;