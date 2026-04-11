import { WeakRef } from './WeakReference.js';

const _typealiases = new Map();
const _protocolExtensions = new Map();
const _conditionalExtensions = [];

class TypeAlias {
    constructor(name, type) {
        this.name = name;
        this.type = type;
        this._isProtocolComposition = Array.isArray(type);
    }

    get isProtocolComposition() {
        return this._isProtocolComposition;
    }

    get protocols() {
        if (this._isProtocolComposition) {
            return this.type.map(t => {
                if (typeof t === 'string') {
                    return _typealiases.get(t)?.type || t;
                }
                return t;
            });
        }
        if (typeof this.type === 'string') {
            return [_typealiases.get(this.type)?.type || this.type];
        }
        return [this.type];
    }

    conformsTo(object) {
        for (const protocol_ of this.protocols) {
            if (protocol_ instanceof Protocol) {
                if (!protocol_.conformsTo(object)) {
                    return false;
                }
            } else if (typeof protocol_ === 'function') {
                if (!(object instanceof protocol_)) {
                    return false;
                }
            }
        }
        return true;
    }
}

function createTypeAlias(name, type) {
    const alias = new TypeAlias(name, type);
    _typealiases.set(name, alias);
    return alias;
}

function getTypeAlias(name) {
    return _typealiases.get(name);
}

function hasTypeAlias(name) {
    return _typealiases.has(name);
}

function resolveTypeAlias(typeOrName) {
    if (typeof typeOrName === 'string') {
        return _typealiases.get(typeOrName) || typeOrName;
    }
    return typeOrName;
}

function composeProtocols(...protocols) {
    return protocols;
}

function defineTypeAlias(name, ...protocols) {
    return createTypeAlias(name, protocols);
}

class Protocol {
    constructor(name, requirements = {}) {
        this.name = name;
        this.requirements = requirements;
        this.extensions = [];
        this._associatedTypes = {};
        this._defaultImplementations = new Map();
    }

    static define(name, definition) {
        const proto = new Protocol(name);
        
        if (definition.properties) {
            proto.requirements.properties = definition.properties;
        }
        if (definition.methods) {
            proto.requirements.methods = definition.methods;
        }
        if (definition.associatedTypes) {
            proto._associatedTypes = definition.associatedTypes;
        }
        
        return proto;
    }

    get properties() {
        return this.requirements.properties || {};
    }

    get methods() {
        return this.requirements.methods || [];
    }

    get associatedTypes() {
        return this._associatedTypes;
    }

    addExtension(extension_) {
        this.extensions.push(extension_);
        return this;
    }

    addDefaultImplementation(methodName, implementation) {
        this._defaultImplementations.set(methodName, implementation);
        return this;
    }

    getDefaultImplementation(methodName) {
        if (this._defaultImplementations.has(methodName)) {
            return this._defaultImplementations.get(methodName);
        }
        for (const ext of this.extensions) {
            if (typeof ext[methodName] === 'function') {
                return ext[methodName];
            }
        }
        return null;
    }

    conformsTo(object) {
        for (const prop of Object.keys(this.properties)) {
            const descriptor = Object.getOwnPropertyDescriptor(object, prop);
            const requirement = this.properties[prop];
            
            if (!descriptor) {
                if (requirement.optional) continue;
                return false;
            }
            
            if (requirement.get && !descriptor.get) {
                if (requirement.optional) continue;
                return false;
            }
        }

        for (const method of this.methods) {
            if (typeof object[method] !== 'function') {
                return false;
            }
        }

        return true;
    }

    checkConformance(object) {
        const missing = { properties: [], methods: [] };
        
        for (const [prop, requirement] of Object.entries(this.properties)) {
            const descriptor = Object.getOwnPropertyDescriptor(object, prop);
            if (!descriptor) {
                if (!requirement.optional) {
                    missing.properties.push(prop);
                }
            } else if (requirement.get && !descriptor.get) {
                if (!requirement.optional) {
                    missing.properties.push(prop);
                }
            }
        }

        for (const method of this.methods) {
            if (typeof object[method] !== 'function') {
                missing.methods.push(method);
            }
        }

        return {
            conforms: missing.properties.length === 0 && missing.methods.length === 0,
            missing
        };
    }
}

class ProtocolExtension {
    constructor(extensionObj) {
        this._methods = {};
        this._properties = {};
        
        for (const [key, value] of Object.entries(extensionObj)) {
            if (typeof value === 'function') {
                this._methods[key] = value;
            } else {
                this._properties[key] = value;
            }
        }
    }

    getMethod(name) {
        return this._methods[name];
    }

    getProperty(name) {
        return this._properties[name];
    }
}

function extendProtocol(protocol_, extensionObj) {
    if (!(protocol_ instanceof Protocol)) {
        throw new Error('First argument must be a Protocol');
    }
    
    _protocolExtensions.set(protocol_, extensionObj);
    
    for (const [key, value] of Object.entries(extensionObj)) {
        if (typeof value === 'function') {
            protocol_.addDefaultImplementation(key, value);
        }
    }
    
    return protocol_;
}

function extendProtocolWhere(protocol_, extensionObj, conditionFn) {
    if (!(protocol_ instanceof Protocol)) {
        throw new Error('First argument must be a Protocol');
    }
    
    _conditionalExtensions.push({
        protocol: protocol_,
        extension: extensionObj,
        condition: conditionFn
    });
    
    return protocol_;
}

function getProtocolExtensionFor(protocol_, instance) {
    const conditionalExt = _conditionalExtensions.find(ext => 
        ext.protocol === protocol_ && ext.condition(instance)
    );
    
    if (conditionalExt) {
        return conditionalExt.extension;
    }
    
    return _protocolExtensions.get(protocol_) || null;
}

function invokeProtocolMethod(protocol_, instance, methodName, ...args) {
    const descriptor = Object.getOwnPropertyDescriptor(instance, methodName);
    if (descriptor && typeof descriptor.value === 'function') {
        return instance[methodName](...args);
    }
    
    const defaultImpl = protocol_.getDefaultImplementation(methodName);
    if (defaultImpl) {
        return defaultImpl.call(instance, ...args);
    }
    
    const ext = getProtocolExtensionFor(protocol_, instance);
    if (ext && typeof ext[methodName] === 'function') {
        return ext[methodName].call(instance, ...args);
    }
    
    return null;
}

class DelegationManager {
    constructor() {
        this._delegateRef = null;
        this._delegateProtocol = null;
    }

    setDelegate(delegate, protocol_ = null) {
        if (delegate === null) {
            this._delegateRef = null;
            this._delegateProtocol = null;
            return Result.success(true);
        }
        
        if (protocol_ && protocol_ instanceof Protocol) {
            const result = protocol_.checkConformance(delegate);
            if (!result.conforms) {
                console.warn(`Delegate does not fully conform to protocol ${protocol_.name}`);
            }
            this._delegateProtocol = protocol_;
        }
        
        this._delegateRef = delegate instanceof WeakRef ? delegate : new WeakRef(delegate);
        return Result.success(true);
    }

    getDelegate() {
        if (this._delegateRef) {
            const target = this._delegateRef.target;
            if (target === null || target === undefined) {
                this._delegateRef = null;
                return null;
            }
            return target;
        }
        return null;
    }

    respondsTo(selector) {
        const delegate = this.getDelegate();
        return Optional.of(delegate).map(d => typeof d[selector] === 'function').getOrElse(false);
    }

    invoke(selector, ...args) {
        return Optional.of(this.getDelegate())
            .filter(d => typeof d[selector] === 'function')
            .map(d => d[selector](...args))
            .getOrElse(null);
    }

    invokeIfResponds(selector, ...args) {
        const delegate = this.getDelegate();
        if (delegate && typeof delegate[selector] === 'function') {
            return delegate[selector](...args);
        }
        return null;
    }

    clearDelegate() {
        this._delegateRef = null;
        this._delegateProtocol = null;
        return Result.success(true);
    }

    get delegate() {
        return this.getDelegate();
    }
}

function conformToProtocol(classRef, protocol_) {
    if (!(protocol_ instanceof Protocol)) {
        throw new Error('Second argument must be a Protocol');
    }

    classRef._conformedProtocols = classRef._conformedProtocols || [];
    classRef._conformedProtocols.push(protocol_);

    const prototype = classRef.prototype;
    
    for (const [methodName, implementation] of Object.entries(protocol_.extensions)) {
        if (typeof implementation === 'function' && !prototype[methodName]) {
            prototype[methodName] = implementation;
        }
    }
    
    const defaultImpls = protocol_._defaultImplementations;
    if (defaultImpls) {
        for (const [methodName, fn] of defaultImpls) {
            if (!prototype[methodName]) {
                prototype[methodName] = fn;
            }
        }
    }

    return classRef;
}

function hasProtocol(object, protocol_) {
    if (!object || !protocol_) return false;
    
    if (object._conformedProtocols) {
        return object._conformedProtocols.includes(protocol_);
    }
    
    if (object.constructor && object.constructor._conformedProtocols) {
        return object.constructor._conformedProtocols.includes(protocol_);
    }
    
    return protocol_.conformsTo(object);
}

function AssociatedType(name, constraint = null) {
    return { _associatedTypeMarker: true, name, constraint };
}

const Identifiable = Protocol.define('Identifiable', {
    properties: {
        id: { get: true, required: true }
    },
    methods: ['logId']
});

const Equatable = Protocol.define('Equatable', {
    methods: ['isEqual']
});

const Hashable = Protocol.define('Hashable', {
    methods: ['hash']
});

const Comparable = Protocol.define('Comparable', {
    methods: ['compare']
});

extendProtocol(Identifiable, {
    logId() {
        return `ID: ${this.id}`;
    }
});

function hashObject(obj) {
    if (obj === null || obj === undefined) return 0;
    if (typeof obj.hash === 'function') return obj.hash();
    if (typeof obj.hash === 'number') return obj.hash;
    if (typeof obj === 'string') return hashString(obj);
    if (typeof obj === 'number') return hashNumber(obj);
    if (Array.isArray(obj)) return hashArray(obj);
    if (typeof obj === 'object') return hashValue(obj);
    return 0;
}

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

function hashNumber(num) {
    return num ^ (num >>> 16);
}

function hashArray(arr) {
    let hash = 0;
    for (const item of arr) {
        hash = ((hash << 5) - hash) + hashObject(item);
        hash = hash & hash;
    }
    return hash;
}

function hashValue(obj) {
    if (obj._hash !== undefined) return obj._hash;
    let hash = 0;
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
        hash = ((hash << 5) - hash) + hashObject(obj[key]);
        hash = hash & hash;
    }
    return hash;
}

export {
    Protocol,
    ProtocolExtension,
    DelegationManager,
    conformToProtocol,
    hasProtocol,
    AssociatedType,
    Identifiable,
    Equatable,
    Hashable,
    Comparable,
    hashObject,
    hashString,
    hashNumber,
    hashArray,
    hashValue,
    TypeAlias,
    createTypeAlias,
    getTypeAlias,
    hasTypeAlias,
    resolveTypeAlias,
    composeProtocols,
    defineTypeAlias,
    extendProtocol,
    extendProtocolWhere,
    getProtocolExtensionFor,
    invokeProtocolMethod
};

export default Protocol;
