import BaseWidget from './BaseWidget.js';

class ClockWidget extends BaseWidget {
    createElement() {
        const container = document.createElement('div');
        container.className = 'widget-clock';
        
        const timeEl = document.createElement('div');
        timeEl.className = 'clock-time';
        
        const dateEl = document.createElement('div');
        dateEl.className = 'clock-date';
        
        container.appendChild(timeEl);
        container.appendChild(dateEl);

        const update = () => {
            const now = new Date();
            timeEl.textContent = now.toLocaleTimeString([], { 
                hour: '2-digit', minute: '2-digit', second: '2-digit' 
            });
            dateEl.textContent = now.toLocaleDateString([], { 
                weekday: 'short', month: 'short', day: 'numeric' 
            });
        };
        
        update();
        this.registerInterval(setInterval(update, 1000));
        
        return container;
    }
}

export default ClockWidget;
