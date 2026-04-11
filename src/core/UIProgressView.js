import UIView from './UIView.js';
import UIColor from './UIColor.js';
import { NSNumber } from './Foundation.js';

class UIProgressView extends UIView {
    constructor() {
        super();
        this._progress = 0;
        this.progressTintColor = UIColor.systemBlue();
        this.trackTintColor = UIColor.lightGray();
    }

    get progress() {
        return this._progress;
    }

    set progress(value) {
        this._progress = Math.max(0, Math.min(1, value));
        this.#updateProgress();
    }

    get description() {
        return `UIProgressView(progress: ${(this._progress * 100).toFixed(1)}%)`;
    }

    progressAsNumber() {
        return NSNumber.of(this._progress);
    }

    init() {
        this.element = document.createElement('div');
        this.element.className = 'ui-progressview';
        this.element.style.position = 'relative';
        this.element.style.width = '200px';
        this.element.style.height = '4px';
        this.element.style.borderRadius = '2px';
        this.element.style.backgroundColor = this.trackTintColor.css;
        this.element.style.overflow = 'hidden';

        this.progressElement = document.createElement('div');
        this.progressElement.style.position = 'absolute';
        this.progressElement.style.left = '0';
        this.progressElement.style.top = '0';
        this.progressElement.style.height = '100%';
        this.progressElement.style.borderRadius = '2px';
        this.progressElement.style.backgroundColor = this.progressTintColor.css;
        this.progressElement.style.width = '0%';
        this.progressElement.style.transition = 'width 0.3s ease';

        this.element.appendChild(this.progressElement);

        return this;
    }

    #updateProgress() {
        if (this.progressElement) {
            this.progressElement.style.width = `${this._progress * 100}%`;
        }
    }

    setProgress(value, animated = false) {
        this._progress = Math.max(0, Math.min(1, value));
        
        if (animated) {
            this.progressElement.style.transition = 'width 0.3s ease';
        } else {
            this.progressElement.style.transition = 'none';
        }
        
        this.#updateProgress();
    }

    setProgressTintColor(color) {
        if (color instanceof UIColor) {
            this.progressTintColor = color;
        } else if (typeof color === 'string') {
            this.progressTintColor = UIColor.colorWithHex(color);
        }
        if (this.progressElement) {
            this.progressElement.style.backgroundColor = this.progressTintColor.css;
        }
    }

    setTrackTintColor(color) {
        if (color instanceof UIColor) {
            this.trackTintColor = color;
        } else if (typeof color === 'string') {
            this.trackTintColor = UIColor.colorWithHex(color);
        }
        if (this.element) {
            this.element.style.backgroundColor = this.trackTintColor.css;
        }
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
            progress: this._progress
        };
    }

    static decode(data) {
        const progressView = new UIProgressView();
        progressView._progress = data.progress;
        return progressView;
    }
}

export default UIProgressView;