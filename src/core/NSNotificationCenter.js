import NSObject from './NSObject.js';
import NSNotification from './NSNotification.js';

class NSNotificationCenter extends NSObject {
    constructor() {
        super();
        this._observers = new Map();
    }

    static defaultCenter() {
        if (!NSNotificationCenter._defaultCenter) {
            NSNotificationCenter._defaultCenter = new NSNotificationCenter();
        }
        return NSNotificationCenter._defaultCenter;
    }

    addObserver(observer, selector, name, object = null) {
        if (!name) {
            console.warn('NSNotificationCenter: addObserver requires a notification name');
            return;
        }

        if (!this._observers.has(name)) {
            this._observers.set(name, []);
        }

        const entry = {
            observer,
            selector,
            name,
            object,
            callback: null
        };

        this._observers.get(name).push(entry);
    }

    addObserverForName(name, object, queue, callback) {
        if (!name) {
            console.warn('NSNotificationCenter: addObserverForName requires a notification name');
            return null;
        }

        const observer = {
            name,
            object,
            queue,
            callback,
            isBlockBased: true
        };

        if (!this._observers.has(name)) {
            this._observers.set(name, []);
        }

        this._observers.get(name).push(observer);
        return observer;
    }

    removeObserver(observer, name = null, object = null) {
        if (!name) {
            for (const [notificationName, observers] of this._observers) {
                this._observers.set(notificationName, 
                    observers.filter(entry => entry.observer !== observer)
                );
            }
            return;
        }

        if (!this._observers.has(name)) return;

        this._observers.set(name,
            this._observers.get(name).filter(entry => {
                if (entry.observer !== observer) return true;
                if (object !== null && entry.object !== object) return true;
                return false;
            })
        );
    }

    removeAllObservers() {
        this._observers.clear();
    }

    postNotification(notification) {
        if (!notification || !notification.name) return;

        const name = notification.name;
        if (!this._observers.has(name)) return;

        const observers = this._observers.get(name);
        for (const entry of observers) {
            if (entry.object !== null && entry.object !== notification.object) continue;

            if (entry.isBlockBased) {
                if (entry.queue === null) {
                    entry.callback(notification);
                } else {
                    entry.queue.push(() => entry.callback(notification));
                }
            } else {
                if (entry.observer && entry.selector) {
                    entry.observer[entry.selector](notification);
                }
            }
        }
    }

    postNotificationName(name, object = null, userInfo = null) {
        const notification = new NSNotification(name, object, userInfo);
        this.postNotification(notification);
    }

    notificationWithName(name, object, userInfo) {
        return new NSNotification(name, object, userInfo);
    }
}

NSNotificationCenter._defaultCenter = null;

export default NSNotificationCenter;
