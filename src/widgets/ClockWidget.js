import WidgetView from './WidgetView.js';

class ClockWidget extends WidgetView {
    constructor(extraData, windowController) {
        super(extraData);
        this.windowController = windowController;
        this.timeInterval = null;
        this.timeElement = null;
        this.dateElement = null;
    }

    createView() {
        const container = document.createElement('div');
        container.className = 'widget-clock';
        
        this.timeElement = document.createElement('div');
        this.timeElement.className = 'clock-time';
        
        this.dateElement = document.createElement('div');
        this.dateElement.className = 'clock-date';
        
        container.appendChild(this.timeElement);
        container.appendChild(this.dateElement);
        
        return container;
    }

    viewDidLoad() {
        this.#updateTime();
        this.timeInterval = setInterval(() => this.#updateTime(), 1000);
    }

    viewWillDisappear() {
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
            this.timeInterval = null;
        }
    }

    viewDidDisappear() {
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
            this.timeInterval = null;
        }
    }

    #updateTime() {
        if (this.timeElement && this.dateElement) {
            const now = new Date();
            this.timeElement.textContent = now.toLocaleTimeString([], { 
                hour: '2-digit', minute: '2-digit', second: '2-digit' 
            });
            this.dateElement.textContent = now.toLocaleDateString([], { 
                weekday: 'short', month: 'short', day: 'numeric' 
            });
        }
    }

    layoutSubviews() {
        super.layoutSubviews();
    }
}

export default ClockWidget;
