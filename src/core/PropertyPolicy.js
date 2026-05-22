class PropertyPolicy {
    static let(target, key, value) {
        Object.defineProperty(target, key, {
            value,
            writable: false,
            enumerable: true,
            configurable: false
        });
        return target;
    }

    static variable(target, key, value, onChange) {
        if (onChange) {
            let currentValue = value;
            Object.defineProperty(target, key, {
                get() { return currentValue; },
                set(newValue) {
                    const oldValue = currentValue;
                    currentValue = newValue;
                    onChange(newValue, oldValue);
                },
                enumerable: true,
                configurable: true
            });
        } else {
            Object.defineProperty(target, key, {
                value,
                writable: true,
                enumerable: true,
                configurable: true
            });
        }
        return target;
    }
}

export default PropertyPolicy;
export { PropertyPolicy };
