import NSObject from './NSObject.js';
import { Optional } from './Generics.js';

class NSNotification extends NSObject {
    constructor(name, object = null, userInfo = null) {
        super();
        this._name = name;
        this._object = object;
        this._userInfo = userInfo;
    }

    get name() {
        return this._name;
    }

    get object() {
        return Optional.fromNullable(this._object);
    }

    get userInfo() {
        return Optional.fromNullable(this._userInfo);
    }

    static notificationWithName(name, object, userInfo) {
        return new NSNotification(name, object, userInfo);
    }
}

export default NSNotification;
