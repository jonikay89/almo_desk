function lazyVar(obj, name, initializer) {
    Object.defineProperty(obj, name, {
        get() {
            const value = initializer.call(this);
            Object.defineProperty(obj, name, { value, writable: true, enumerable: true, configurable: true });
            return value;
        },
        enumerable: true,
        configurable: true,
    });
}

export { lazyVar };
export default lazyVar;
