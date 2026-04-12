import UIColor from './UIColor.js';

const AttributedStringKey = {
    font: 'font',
    textColor: 'textColor',
    backgroundColor: 'backgroundColor',
    underline: 'underline',
    strikethrough: 'strikethrough',
    link: 'link',
    baselineOffset: 'baselineOffset',
    kern: 'kern',
    letterSpacing: 'letterSpacing',
    paragraphStyle: 'paragraphStyle',
    shadow: 'shadow',
    strokeColor: 'strokeColor',
    strokeWidth: 'strokeWidth',
    expansion: 'expansion',
    verticalGlyphForm: 'verticalGlyphForm'
};

class TextStorage {
    constructor() {
        this._string = '';
        this._attributes = [];
        this._defaultAttributes = {
            font: { size: 14, family: 'system-ui', weight: 'normal' },
            textColor: UIColor.black(),
            backgroundColor: null,
            underline: false,
            strikethrough: false,
            link: null,
            baselineOffset: 0,
            kern: 0,
            letterSpacing: 0
        };
        this._editable = true;
        this._delegate = null;
    }

    static Create() {
        return new TextStorage();
    }

    get string() {
        return this._string;
    }

    set string(value) {
        this._string = value;
        this._notifyDelegate('didProcessEditing');
    }

    get length() {
        return this._string.length;
    }

    get defaultAttributes() {
        return { ...this._defaultAttributes };
    }

    set defaultAttributes(attrs) {
        this._defaultAttributes = { ...this._defaultAttributes, ...attrs };
    }

    setDelegate(delegate) {
        this._delegate = delegate;
    }

    _notifyDelegate(action) {
        if (this._delegate && typeof this._delegate[action] === 'function') {
            this._delegate[action](this);
        }
    }

    processEditing() {
        if (this._delegate && typeof this._delegate.textStorageDidProcessEditing === 'function') {
            this._delegate.textStorageDidProcessEditing(this);
        }
    }

    appendString(str, attributes = null) {
        const startIndex = this._string.length;
        this._string += str;
        
        if (attributes) {
            this._attributes.push({
                range: { start: startIndex, end: this._string.length },
                attributes: { ...this._defaultAttributes, ...attributes }
            });
        }
        
        this._notifyDelegate('didProcessEditing');
        return this;
    }

    insertString(str, atIndex, attributes = null) {
        if (atIndex < 0 || atIndex > this._string.length) return this;
        
        this._string = this._string.slice(0, atIndex) + str + this._string.slice(atIndex);
        
        if (attributes) {
            this._attributes.push({
                range: { start: atIndex, end: atIndex + str.length },
                attributes: { ...this._defaultAttributes, ...attributes }
            });
        }
        
        this._notifyDelegate('didProcessEditing');
        return this;
    }

    deleteCharactersInRange(range) {
        const start = Math.max(0, range.start || 0);
        const end = Math.min(this._string.length, range.end || range.start || 0);
        
        if (start >= end) return this;
        
        this._string = this._string.slice(0, start) + this._string.slice(end);
        
        this._attributes = this._attributes.filter(attr => {
            const attrStart = attr.range.start;
            const attrEnd = attr.range.end;
            return attrEnd <= start || attrStart >= end;
        }).map(attr => {
            if (attr.range.start >= end) {
                return {
                    ...attr,
                    range: { start: attr.range.start - (end - start), end: attr.range.end - (end - start) }
                };
            }
            return attr;
        });
        
        this._notifyDelegate('didProcessEditing');
        return this;
    }

    setAttributes(attributes, range = null) {
        if (range) {
            const start = range.start || 0;
            const end = range.end || this._string.length;
            
            this._attributes = this._attributes.filter(attr => {
                return attr.range.end <= start || attr.range.start >= end;
            });
            
            this._attributes.push({
                range: { start, end },
                attributes: { ...this._defaultAttributes, ...attributes }
            });
        } else {
            this._defaultAttributes = { ...this._defaultAttributes, ...attributes };
        }
        
        this._notifyDelegate('didProcessEditing');
        return this;
    }

    addAttribute(name, value, range = null) {
        const start = range ? (range.start || 0) : 0;
        const end = range ? (range.end || this._string.length) : this._string.length;
        
        const existingIndex = this._attributes.findIndex(attr => 
            attr.range.start === start && attr.range.end === end
        );
        
        if (existingIndex >= 0) {
            this._attributes[existingIndex].attributes[name] = value;
        } else {
            this._attributes.push({
                range: { start, end },
                attributes: { ...this._defaultAttributes, [name]: value }
            });
        }
        
        this._notifyDelegate('didProcessEditing');
        return this;
    }

    removeAttribute(name, range = null) {
        if (range) {
            const start = range.start || 0;
            const end = range.end || this._string.length;
            
            this._attributes.forEach(attr => {
                if (attr.range.start >= start && attr.range.end <= end) {
                    delete attr.attributes[name];
                }
            });
        } else {
            delete this._defaultAttributes[name];
        }
        
        this._notifyDelegate('didProcessEditing');
        return this;
    }

    attributeAtIndex(index, attributeName) {
        for (let i = this._attributes.length - 1; i >= 0; i--) {
            const attr = this._attributes[i];
            if (index >= attr.range.start && index < attr.range.end) {
                return attr.attributes[attributeName] || this._defaultAttributes[attributeName];
            }
        }
        return this._defaultAttributes[attributeName];
    }

    attributesAtIndex(index) {
        const defaults = { ...this._defaultAttributes };
        
        for (let i = this._attributes.length - 1; i >= 0; i--) {
            const attr = this._attributes[i];
            if (index >= attr.range.start && index < attr.range.end) {
                return { ...defaults, ...attr.attributes };
            }
        }
        
        return defaults;
    }

    enumerateAttributesInRange(range, callback) {
        const start = range ? (range.start || 0) : 0;
        const end = range ? (range.end || this._string.length) : this._string.length;
        
        const sortedAttrs = [...this._attributes]
            .filter(attr => attr.range.end > start && attr.range.start < end)
            .sort((a, b) => a.range.start - b.range.start);
        
        let currentIndex = start;
        
        for (const attr of sortedAttrs) {
            if (attr.range.start > currentIndex) {
                callback({ ...this._defaultAttributes }, { start: currentIndex, end: attr.range.start });
            }
            callback({ ...this._defaultAttributes, ...attr.attributes }, attr.range);
            currentIndex = attr.range.end;
        }
        
        if (currentIndex < end) {
            callback({ ...this._defaultAttributes }, { start: currentIndex, end });
        }
    }

    replaceCharactersInRange(range, withString) {
        this.deleteCharactersInRange(range);
        this.insertString(withString, range.start || 0);
        return this;
    }

    appendAttributedString(attributedString) {
        const startIndex = this._string.length;
        this._string += attributedString._string;
        
        for (const attr of attributedString._attributes) {
            this._attributes.push({
                range: {
                    start: attr.range.start + startIndex,
                    end: attr.range.end + startIndex
                },
                attributes: { ...attr.attributes }
            });
        }
        
        this._notifyDelegate('didProcessEditing');
        return this;
    }

    insertAttributedString(attributedString, atIndex) {
        this.insertString(attributedString._string, atIndex);
        
        const offset = attributedString._string.length;
        for (const attr of attributedString._attributes) {
            this._attributes.push({
                range: {
                    start: attr.range.start + atIndex,
                    end: attr.range.end + atIndex
                },
                attributes: { ...attr.attributes }
            });
        }
        
        this._notifyDelegate('didProcessEditing');
        return this;
    }

    mutableCopy() {
        const copy = new TextStorage();
        copy._string = this._string;
        copy._attributes = this._attributes.map(a => ({
            range: { ...a.range },
            attributes: { ...a.attributes }
        }));
        copy._defaultAttributes = { ...this._defaultAttributes };
        copy._editable = this._editable;
        return copy;
    }

    encode() {
        return {
            string: this._string,
            attributes: this._attributes,
            defaultAttributes: this._defaultAttributes,
            editable: this._editable
        };
    }

    static decode(data) {
        const storage = new TextStorage();
        storage._string = data.string || '';
        storage._attributes = data.attributes || [];
        storage._defaultAttributes = data.defaultAttributes || storage._defaultAttributes;
        storage._editable = data.editable !== false;
        return storage;
    }
}

class AttributedString {
    constructor(string = '', attributes = null) {
        this._string = string;
        this._attributes = [];
        
        if (attributes) {
            this._attributes.push({
                range: { start: 0, end: string.length },
                attributes: { ...attributes }
            });
        }
    }

    static Create(string = '', attributes = null) {
        return new AttributedString(string, attributes);
    }

    get string() {
        return this._string;
    }

    get length() {
        return this._string.length;
    }

    getAttributesAtIndex(index) {
        for (let i = this._attributes.length - 1; i >= 0; i--) {
            const attr = this._attributes[i];
            if (index >= attr.range.start && index < attr.range.end) {
                return { ...attr.attributes };
            }
        }
        return {};
    }

    withFont(font) {
        const attrs = this._attributes[0] || { range: { start: 0, end: this._string.length }, attributes: {} };
        attrs.attributes.font = font;
        return this;
    }

    withTextColor(color) {
        const attrs = this._attributes[0] || { range: { start: 0, end: this._string.length }, attributes: {} };
        attrs.attributes.textColor = color;
        return this;
    }

    withBackgroundColor(color) {
        const attrs = this._attributes[0] || { range: { start: 0, end: this._string.length }, attributes: {} };
        attrs.attributes.backgroundColor = color;
        return this;
    }

    withUnderline(underline = true) {
        const attrs = this._attributes[0] || { range: { start: 0, end: this._string.length }, attributes: {} };
        attrs.attributes.underline = underline;
        return this;
    }

    withStrikethrough(strikethrough = true) {
        const attrs = this._attributes[0] || { range: { start: 0, end: this._string.length }, attributes: {} };
        attrs.attributes.strikethrough = strikethrough;
        return this;
    }

    withLink(url) {
        const attrs = this._attributes[0] || { range: { start: 0, end: this._string.length }, attributes: {} };
        attrs.attributes.link = url;
        return this;
    }

    withBaselineOffset(offset) {
        const attrs = this._attributes[0] || { range: { start: 0, end: this._string.length }, attributes: {} };
        attrs.attributes.baselineOffset = offset;
        return this;
    }

    withKern(kern) {
        const attrs = this._attributes[0] || { range: { start: 0, end: this._string.length }, attributes: {} };
        attrs.attributes.kern = kern;
        return this;
    }

    withParagraphStyle(style) {
        const attrs = this._attributes[0] || { range: { start: 0, end: this._string.length }, attributes: {} };
        attrs.attributes.paragraphStyle = style;
        return this;
    }

    withShadow(color, offset = { width: 0, height: 1 }, radius = 1) {
        const attrs = this._attributes[0] || { range: { start: 0, end: this._string.length }, attributes: {} };
        attrs.attributes.shadow = { color, offset, radius };
        return this;
    }

    withStrokeColor(color, width = 0) {
        const attrs = this._attributes[0] || { range: { start: 0, end: this._string.length }, attributes: {} };
        attrs.attributes.strokeColor = color;
        attrs.attributes.strokeWidth = width;
        return this;
    }

    withExpansion(expansion) {
        const attrs = this._attributes[0] || { range: { start: 0, end: this._string.length }, attributes: {} };
        attrs.attributes.expansion = expansion;
        return this;
    }

    withKerning(kern) {
        const attrs = this._attributes[0] || { range: { start: 0, end: this._string.length }, attributes: {} };
        attrs.attributes.kern = kern;
        return this;
    }

    withLetterSpacing(spacing) {
        const attrs = this._attributes[0] || { range: { start: 0, end: this._string.length }, attributes: {} };
        attrs.attributes.letterSpacing = spacing;
        return this;
    }

    withVerticalGlyphForm(vertical) {
        const attrs = this._attributes[0] || { range: { start: 0, end: this._string.length }, attributes: {} };
        attrs.attributes.verticalGlyphForm = vertical;
        return this;
    }

    withLigatures(enabled) {
        const attrs = this._attributes[0] || { range: { start: 0, end: this._string.length }, attributes: {} };
        attrs.attributes.ligatures = enabled;
        return this;
    }

    append(string) {
        return new AttributedString(this._string + string, this._attributes[0]?.attributes);
    }

    static Localized(string, table = null, bundle = null) {
        return new AttributedString(string);
    }
}

class ParagraphStyle {
    constructor() {
        this.alignment = 'left';
        this.firstLineHeadIndent = 0;
        this.headIndent = 0;
        this.tailIndent = 0;
        this.lineBreakMode = 'wordWrapping';
        this.lineHeightMultiple = 1;
        this.maximumLineHeight = 0;
        this.minimumLineHeight = 0;
        this.paragraphSpacing = 0;
        this.paragraphSpacingBefore = 0;
        this.lineBreakStrategy = 'standard';
        this.baseWritingDirection = 'natural';
        this.hyphenationFactor = 0;
        this.tabStops = [];
        this.defaultTabInterval = 0;
    }

    static Create() {
        return new ParagraphStyle();
    }

    withAlignment(alignment) {
        this.alignment = alignment;
        return this;
    }

    withLineBreakMode(mode) {
        this.lineBreakMode = mode;
        return this;
    }

    withLineHeightMultiple(multiple) {
        this.lineHeightMultiple = multiple;
        return this;
    }

    withFirstLineHeadIndent(amount) {
        this.firstLineHeadIndent = amount;
        return this;
    }

    withHeadIndent(amount) {
        this.headIndent = amount;
        return this;
    }

    withTailIndent(amount) {
        this.tailIndent = amount;
        return this;
    }

    withMaximumLineHeight(height) {
        this.maximumLineHeight = height;
        return this;
    }

    withMinimumLineHeight(height) {
        this.minimumLineHeight = height;
        return this;
    }

    withParagraphSpacing(spacing) {
        this.paragraphSpacing = spacing;
        return this;
    }

    withParagraphSpacingBefore(spacing) {
        this.paragraphSpacingBefore = spacing;
        return this;
    }

    withLineBreakStrategy(strategy) {
        this.lineBreakStrategy = strategy;
        return this;
    }

    withBaseWritingDirection(direction) {
        this.baseWritingDirection = direction;
        return this;
    }

    withTabStops(tabStops) {
        this.tabStops = tabStops;
        return this;
    }

    withDefaultTabInterval(interval) {
        this.defaultTabInterval = interval;
        return this;
    }

    addTabStop(location, alignment = 'left') {
        this.tabStops.push({ location, alignment });
        return this;
    }

    removeTabStop(location) {
        this.tabStops = this.tabStops.filter(tab => tab.location !== location);
        return this;
    }

    copy() {
        const copy = new ParagraphStyle();
        copy.alignment = this.alignment;
        copy.firstLineHeadIndent = this.firstLineHeadIndent;
        copy.headIndent = this.headIndent;
        copy.tailIndent = this.tailIndent;
        copy.lineBreakMode = this.lineBreakMode;
        copy.lineHeightMultiple = this.lineHeightMultiple;
        copy.maximumLineHeight = this.maximumLineHeight;
        copy.minimumLineHeight = this.minimumLineHeight;
        copy.paragraphSpacing = this.paragraphSpacing;
        copy.paragraphSpacingBefore = this.paragraphSpacingBefore;
        copy.lineBreakStrategy = this.lineBreakStrategy;
        copy.baseWritingDirection = this.baseWritingDirection;
        copy.hyphenationFactor = this.hyphenationFactor;
        copy.tabStops = [...this.tabStops];
        copy.defaultTabInterval = this.defaultTabInterval;
        return copy;
    }
}

export { TextStorage, AttributedString, ParagraphStyle, AttributedStringKey };
