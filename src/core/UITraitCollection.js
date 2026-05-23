class UITraitCollection {
    constructor(traits = {}) {
        this._userInterfaceStyle = traits.userInterfaceStyle || 'unspecified';
        this._userInterfaceIdiom = traits.userInterfaceIdiom || 'unspecified';
        this._horizontalSizeClass = traits.horizontalSizeClass || 'unspecified';
        this._verticalSizeClass = traits.verticalSizeClass || 'unspecified';
        this._displayScale = traits.displayScale || 0;
        this._displayGamut = traits.displayGamut || 'unspecified';
        this._layoutDirection = traits.layoutDirection || 'leftToRight';
        this._preferredContentSizeCategory = traits.preferredContentSizeCategory || 'unspecified';
        this._forceTouchCapability = traits.forceTouchCapability || 'unspecified';
        this._legibilityWeight = traits.legibilityWeight || 'unspecified';
        this._accessibilityContrast = traits.accessibilityContrast || 'unspecified';
    }

    get userInterfaceStyle() { return this._userInterfaceStyle; }
    get userInterfaceIdiom() { return this._userInterfaceIdiom; }
    get horizontalSizeClass() { return this._horizontalSizeClass; }
    get verticalSizeClass() { return this._verticalSizeClass; }
    get displayScale() { return this._displayScale; }
    get displayGamut() { return this._displayGamut; }
    get layoutDirection() { return this._layoutDirection; }
    get preferredContentSizeCategory() { return this._preferredContentSizeCategory; }
    get forceTouchCapability() { return this._forceTouchCapability; }
    get legibilityWeight() { return this._legibilityWeight; }
    get accessibilityContrast() { return this._accessibilityContrast; }

    containsTraitsInCollection(traits) {
        if (!traits) return true;
        if (traits._horizontalSizeClass !== 'unspecified' &&
            this._horizontalSizeClass !== 'unspecified' &&
            traits._horizontalSizeClass !== this._horizontalSizeClass) return false;
        if (traits._verticalSizeClass !== 'unspecified' &&
            this._verticalSizeClass !== 'unspecified' &&
            traits._verticalSizeClass !== this._verticalSizeClass) return false;
        if (traits._userInterfaceStyle !== 'unspecified' &&
            this._userInterfaceStyle !== 'unspecified' &&
            traits._userInterfaceStyle !== this._userInterfaceStyle) return false;
        return true;
    }

    static traitCollectionWithTraitsFromCollections(collections) {
        const merged = {};
        for (const collection of collections) {
            if (!collection) continue;
            if (collection._horizontalSizeClass !== 'unspecified') {
                merged.horizontalSizeClass = collection._horizontalSizeClass;
            }
            if (collection._verticalSizeClass !== 'unspecified') {
                merged.verticalSizeClass = collection._verticalSizeClass;
            }
            if (collection._userInterfaceStyle !== 'unspecified') {
                merged.userInterfaceStyle = collection._userInterfaceStyle;
            }
            if (collection._userInterfaceIdiom !== 'unspecified') {
                merged.userInterfaceIdiom = collection._userInterfaceIdiom;
            }
            if (collection._displayScale > 0) {
                merged.displayScale = collection._displayScale;
            }
            if (collection._layoutDirection !== 'leftToRight') {
                merged.layoutDirection = collection._layoutDirection;
            }
            if (collection._preferredContentSizeCategory !== 'unspecified') {
                merged.preferredContentSizeCategory = collection._preferredContentSizeCategory;
            }
        }
        return new UITraitCollection(merged);
    }

    static traitCollectionWithUserInterfaceStyle(style) {
        return new UITraitCollection({ userInterfaceStyle: style });
    }

    static traitCollectionWithHorizontalSizeClass(sizeClass) {
        return new UITraitCollection({ horizontalSizeClass: sizeClass });
    }

    static traitCollectionWithVerticalSizeClass(sizeClass) {
        return new UITraitCollection({ verticalSizeClass: sizeClass });
    }

    static traitCollectionWithDisplayScale(scale) {
        return new UITraitCollection({ displayScale: scale });
    }

    static traitCollectionWithUserInterfaceIdiom(idiom) {
        return new UITraitCollection({ userInterfaceIdiom: idiom });
    }

    static traitCollectionWithLayoutDirection(direction) {
        return new UITraitCollection({ layoutDirection: direction });
    }

    static traitCollectionWithPreferredContentSizeCategory(category) {
        return new UITraitCollection({ preferredContentSizeCategory: category });
    }

    static get current() {
        return new UITraitCollection({
            userInterfaceStyle: window?.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light',
            displayScale: (typeof window !== 'undefined' && window.devicePixelRatio) || 1,
            horizontalSizeClass: 'regular',
            verticalSizeClass: 'regular',
        });
    }
}

const UIUserInterfaceSizeClass = {
    unspecified: 'unspecified',
    compact: 'compact',
    regular: 'regular',
};

const UIUserInterfaceStyle = {
    unspecified: 'unspecified',
    light: 'light',
    dark: 'dark',
};

const UIUserInterfaceIdiom = {
    unspecified: 'unspecified',
    phone: 'phone',
    pad: 'pad',
    tv: 'tv',
    carPlay: 'carPlay',
    mac: 'mac',
};

const UIDeviceOrientation = {
    unknown: 'unknown',
    portrait: 'portrait',
    portraitUpsideDown: 'portraitUpsideDown',
    landscapeLeft: 'landscapeLeft',
    landscapeRight: 'landscapeRight',
    faceUp: 'faceUp',
    faceDown: 'faceDown',
};

class UITraitEnvironment {
    constructor() {
        this._traitOverrides = {};
        this._cachedTraitCollection = null;
        this._traitChangeRegistrations = [];
    }

    get traitCollection() {
        if (this._cachedTraitCollection) return this._cachedTraitCollection;

        const parentTraits = this._parentTraitCollection || UITraitCollection.current;
        const overrides = this._traitOverrides;

        if (Object.keys(overrides).length === 0) {
            this._cachedTraitCollection = parentTraits;
            return parentTraits;
        }

        this._cachedTraitCollection = UITraitCollection.traitCollectionWithTraitsFromCollections([
            parentTraits,
            new UITraitCollection(overrides),
        ]);
        return this._cachedTraitCollection;
    }

    setTraitOverrides(overrides) {
        this._traitOverrides = { ...overrides };
        this._cachedTraitCollection = null;
    }

    _parentTraitCollectionUpdated(newParentTraits) {
        this._parentTraitCollection = newParentTraits;
        this._cachedTraitCollection = null;
        this.traitCollectionDidChange(this.traitCollection);
        this._notifyTraitChangeRegistrations(this.traitCollection);
    }

    traitCollectionDidChange(previousTraitCollection) {}

    registerForTraitChanges(traits, handler) {
        const registration = { traits, handler, id: Math.random().toString(36).slice(2) };
        this._traitChangeRegistrations.push(registration);
        return registration;
    }

    unregisterForTraitChanges(registration) {
        const idx = this._traitChangeRegistrations.findIndex(r => r.id === registration.id);
        if (idx !== -1) this._traitChangeRegistrations.splice(idx, 1);
    }

    _notifyTraitChangeRegistrations(newTraits) {
        for (const reg of this._traitChangeRegistrations) {
            try { reg.handler(newTraits); } catch (e) { /* swallow */ }
        }
    }
}

export {
    UITraitCollection,
    UITraitEnvironment,
    UIUserInterfaceSizeClass,
    UIUserInterfaceStyle,
    UIUserInterfaceIdiom,
    UIDeviceOrientation,
};
export default UITraitCollection;
