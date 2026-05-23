class AnyCancellable {
    constructor(cancelAction) {
        this._cancelAction = cancelAction;
        this._isCancelled = false;
    }

    cancel() {
        if (this._isCancelled) return;
        this._isCancelled = true;
        if (this._cancelAction) {
            this._cancelAction();
            this._cancelAction = null;
        }
    }

    get isCancelled() {
        return this._isCancelled;
    }

    storeIn(set) {
        set.add(this);
        return this;
    }
}

class CurrentValueSubject {
    constructor(value) {
        this._value = value;
        this._subscribers = [];
        this._changeHistory = [];
        this._maxHistoryLength = 50;
    }

    get value() {
        return this._value;
    }

    set value(newValue) {
        this.send(newValue);
    }

    send(newValue) {
        const oldValue = this._value;
        if (oldValue === newValue) return;
        if (this._areEqual(oldValue, newValue)) return;
        this._willChangeValue(oldValue, newValue);
        this._value = newValue;
        this._notifySubscribers(newValue, oldValue);
        this._didChangeValue(oldValue, newValue);
    }

    _areEqual(a, b) {
        if (a === b) return true;
        if (a && b && typeof a.isEqual === 'function') {
            return a.isEqual(b);
        }
        return false;
    }

    _willChangeValue(oldValue, newValue) {}
    _didChangeValue(oldValue, newValue) {}

    _notifySubscribers(newValue, oldValue) {
        const change = {
            newValue,
            oldValue,
            timestamp: Date.now()
        };
        this._changeHistory.push(change);
        if (this._changeHistory.length > this._maxHistoryLength) {
            this._changeHistory.shift();
        }
        for (const subscriber of this._subscribers) {
            if (subscriber.disposed) continue;
            try {
                subscriber.callback(this._value, oldValue);
            } catch (error) {
                console.error('CurrentValueSubject subscriber error:', error);
            }
        }
    }

    sink(receiveValue) {
        const subscriber = {
            callback: receiveValue,
            id: null,
            disposed: false
        };
        this._subscribers.push(subscriber);
        try {
            receiveValue(this._value, undefined);
        } catch (error) {
            console.error('CurrentValueSubject sink error:', error);
        }
        return new AnyCancellable(() => this.unsubscribe(subscriber));
    }

    subscribe(callback, options = {}) {
        const { immediately = false, id = null } = options;
        const subscriber = {
            callback,
            id,
            disposed: false
        };
        this._subscribers.push(subscriber);
        if (immediately) {
            try {
                callback(this._value, { type: 'initial', index: -1, oldValue: undefined, newValue: this._value });
            } catch (error) {
                console.error('CurrentValueSubject immediate notification error:', error);
            }
        }
        return () => this.unsubscribe(subscriber);
    }

    unsubscribe(subscriber) {
        const index = this._subscribers.indexOf(subscriber);
        if (index !== -1) {
            subscriber.disposed = true;
            this._subscribers.splice(index, 1);
        }
    }

    removeAllSubscribers() {
        this._subscribers = [];
    }

    bindTo(otherObservable, options = {}) {
        const { twoWay = true, transformTo = null, transformFrom = null } = options;
        const binding = new Binding(this, otherObservable, { twoWay, transformTo, transformFrom });
        return binding;
    }

    map(transform) {
        const mapped = new CurrentValueSubject(transform(this._value));
        this.subscribe((newValue) => {
            mapped.value = transform(newValue);
        });
        return mapped;
    }

    filter(predicate) {
        const filtered = new CurrentValueSubject(this._value);
        this.subscribe((newValue) => {
            if (predicate(newValue)) {
                filtered.value = newValue;
            }
        });
        return filtered;
    }

    debounce(delay) {
        const debounced = new CurrentValueSubject(this._value);
        let timeoutId = null;
        this.subscribe((newValue) => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                debounced.value = newValue;
            }, delay);
        });
        return debounced;
    }

    throttle(delay) {
        const throttled = new CurrentValueSubject(this._value);
        let lastUpdate = 0;
        this.subscribe((newValue) => {
            const now = Date.now();
            if (now - lastUpdate >= delay) {
                lastUpdate = now;
                throttled.value = newValue;
            }
        });
        return throttled;
    }

    get changeHistory() {
        return [...this._changeHistory];
    }

    clearHistory() {
        this._changeHistory = [];
    }

    get subscriberCount() {
        return this._subscribers.length;
    }
}

class Binding {
    constructor(source, target, options = {}) {
        const { twoWay = true, transformTo = null, transformFrom = null } = options;
        this._source = source;
        this._target = target;
        this._twoWay = twoWay;
        this._transformTo = transformTo;
        this._transformFrom = transformFrom;
        this._isActive = false;
        this._sourceDispose = null;
        this._targetDispose = null;
    }

    _transformSourceToTarget(value) {
        return this._transformTo ? this._transformTo(value) : value;
    }

    _transformTargetToSource(value) {
        return this._transformFrom ? this._transformFrom(value) : value;
    }

    _sourceChanged(newValue, oldValue) {
        if (!this._isActive) return;
        this._target.value = this._transformSourceToTarget(newValue);
    }

    _targetChanged(newValue, oldValue) {
        if (!this._isActive || !this._twoWay) return;
        this._source.value = this._transformTargetToSource(newValue);
    }

    activate() {
        if (this._isActive) return;
        this._isActive = true;
        this._sourceDispose = this._source.subscribe(
            this._sourceChanged.bind(this),
            { immediately: true }
        );
        if (this._twoWay) {
            this._targetDispose = this._target.subscribe(
                this._targetChanged.bind(this),
                { immediately: false }
            );
        }
    }

    deactivate() {
        if (!this._isActive) return;
        this._isActive = false;
        if (this._sourceDispose) {
            this._sourceDispose();
            this._sourceDispose = null;
        }
        if (this._targetDispose) {
            this._targetDispose();
            this._targetDispose = null;
        }
    }

    get isActive() {
        return this._isActive;
    }

    dispose() {
        this.deactivate();
        this._source = null;
        this._target = null;
    }
}

function observable(initialValue) {
    return new CurrentValueSubject(initialValue);
}

function computed(computeFn, initialValue) {
    const computed = new CurrentValueSubject(initialValue);
    const sources = [];
    let compute = () => {
        try {
            computed.value = computeFn();
        } catch (error) {
            console.error('Computed property error:', error);
        }
    };
    computed._addDependency = (obs) => {
        if (!sources.includes(obs)) {
            sources.push(obs);
            obs.subscribe(compute);
        }
    };
    computed._removeAllDependencies = () => {
        for (const source of sources) {
        }
        sources.length = 0;
    };
    return computed;
}

class ObservableObject {
    constructor() {
        this._observables = {};
        this._bindings = [];
        this._kvoObservers = {};
        this._objectId = ObservableObject._nextObjectId++;
    }

    static _nextObjectId = 0;

    _createObservable(propertyName, initialValue) {
        const obs = new CurrentValueSubject(initialValue);
        this._observables[propertyName] = obs;
        return obs;
    }

    _getObservable(propertyName) {
        return this._observables[propertyName];
    }

    $observe(propertyName, callback, options = {}) {
        let obs = this._observables[propertyName];
        if (!obs) {
            obs = this._createObservable(propertyName, undefined);
        }
        return obs.subscribe(callback, options);
    }

    $set(propertyName, value) {
        let obs = this._observables[propertyName];
        if (!obs) {
            obs = this._createObservable(propertyName, value);
        } else {
            obs.value = value;
        }
    }

    $get(propertyName) {
        const obs = this._observables[propertyName];
        return obs ? obs.value : undefined;
    }

    observe(forKeyPath, handler) {
        if (!this._kvoObservers[forKeyPath]) {
            this._kvoObservers[forKeyPath] = [];
        }
        const observer = {
            keyPath: forKeyPath,
            handler,
            cancelled: false
        };
        this._kvoObservers[forKeyPath].push(observer);

        if (this._observables[forKeyPath]) {
            try {
                handler(this, { kind: 'set', newValue: this._observables[forKeyPath].value, oldValue: undefined });
            } catch (e) {}
        }

        return new AnyCancellable(() => {
            observer.cancelled = true;
            const list = this._kvoObservers[forKeyPath];
            if (list) {
                const idx = list.indexOf(observer);
                if (idx !== -1) list.splice(idx, 1);
            }
        });
    }

    willChangeValue(forKey) {
        const observers = this._kvoObservers[forKey];
        if (observers) {
            const oldValue = this[forKey];
            for (const obs of observers) {
                if (!obs.cancelled) {
                    try { obs.handler(this, { kind: 'setting', oldValue }); } catch (e) {}
                }
            }
        }
    }

    didChangeValue(forKey) {
        const observers = this._kvoObservers[forKey];
        if (observers) {
            const newValue = this[forKey];
            for (const obs of observers) {
                if (!obs.cancelled) {
                    try { obs.handler(this, { kind: 'set', newValue }); } catch (e) {}
                }
            }
        }
    }

    $bind(sourceProperty, targetObject, targetProperty, options = {}) {
        const sourceObs = this._observables[sourceProperty] || this._createObservable(sourceProperty, undefined);
        const targetObs = targetObject._observables[targetProperty] || targetObject._createObservable(targetProperty, undefined);
        const binding = sourceObs.bindTo(targetObs, options);
        binding._sourceObject = this;
        binding._targetObject = targetObject;
        this._bindings.push(binding);
        binding.activate();
        return binding;
    }

    $unbindAll() {
        for (const binding of this._bindings) {
            binding.dispose();
        }
        this._bindings = [];
    }

    $destroy() {
        this.$unbindAll();
        for (const obs of Object.values(this._observables)) {
            obs.removeAllSubscribers();
        }
        this._observables = {};
    }

    get objectId() {
        return this._objectId;
    }
}

const Observable = CurrentValueSubject;

export { CurrentValueSubject, AnyCancellable, Observable, Binding, observable, computed, ObservableObject };
export default CurrentValueSubject;
