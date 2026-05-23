function lazyVar(obj, name, initializer) {
    const value = initializer.call(obj);
    Object.defineProperty(obj, name, { value, writable: true, enumerable: true, configurable: true });
    return value;
}

export { lazyVar };
export default lazyVar;
