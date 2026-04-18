import { CATextLayer } from './CALayer.js';
import { forCase, guardCase, ifCase, whileCase } from './PatternMatching.js';
import Switch from './Switch.js';
import { AttributedString, TextStorage } from './TextStorage.js';
import UIColor from './UIColor.js';
import UIView from './UIView.js';

class UILabel extends UIView {
    constructor(text = '') {
        super();
        this._text = text;
        this._textColor = UIColor.black();
        this._shadowColor = null;
        this._shadowOffset = { width: 0, height: 0 };
        this._lineHeight = null;
        this._textStorage = TextStorage.Create();
        this._textStorage.string = text;
        this._textStorage.defaultAttributes = {
            font: { size: 14, family: 'system-ui', weight: 'normal' },
            textColor: UIColor.black(),
            backgroundColor: null,
            underline: false,
            strikethrough: false,
            link: null,
            baselineOffset: 0
        };
        this.fontSize = 14;
        this.fontFamily = 'system-ui, sans-serif';
        this.textAlignment = 'left';
        this.numberOfLines = 1;
        this.lineBreakMode = 'ellipsis';
        this.adjustsFontSizeToFitWidth = false;
        this.minimumScaleFactor = 0.5;
        this.fontWeight = 'normal';
        this.isEnabled = true;
        this._textLayer = null;
        this._useLayerRendering = true;
        this._layerContents = null;
        this._preferredMaxLayoutWidth = 0;
        this._baselineAlignment = 'first';
        
        this._isAccessibilityElement = true;
        this._accessibilityTraits = ['staticText'];
    }

    get description() {
        return `UILabel(text: "${this._text}")`;
    }

    get text() {
        return this._text;
    }

    set text(value) {
        this._text = value || '';
        this._textStorage.string = this._text;
        this._accessibilityValue = this._text;
        this.#updateTextLayer();
        this.#updateStyle();
        this._updateAccessibilityAttributes();
    }

    get attributedText() {
        return this._textStorage;
    }

    set attributedText(value) {
        if (value instanceof TextStorage) {
            this._textStorage = value;
            this._text = value.string;
            this.#updateTextLayer();
            this.#updateStyle();
        }
    }

    get textColor() {
        return this._textColor;
    }

    set textColor(color) {
        if (color instanceof UIColor) {
            this._textColor = color;
        } else if (typeof color === 'string') {
            this._textColor = UIColor.colorWithHex(color);
        } else {
            this._textColor = UIColor.black();
        }
        this._textStorage.defaultAttributes.textColor = this._textColor;
        this.#updateStyle();
    }

    get color() {
        return this._textColor;
    }

    set color(c) {
        this.textColor = c;
    }

    get font() {
        return { size: this.fontSize, family: this.fontFamily, weight: this.fontWeight };
    }

    set font(f) {
        if (typeof f === 'object') {
            if (f.size) this.fontSize = f.size;
            if (f.family) this.fontFamily = f.family;
            if (f.weight) this.fontWeight = f.weight;
        }
        this._textStorage.defaultAttributes.font = {
            size: this.fontSize,
            family: this.fontFamily,
            weight: this.fontWeight
        };
        this.#updateStyle();
    }

    get fontSize() {
        return this._fontSize || 14;
    }

    set fontSize(size) {
        this._fontSize = size;
        this._textStorage.defaultAttributes.font.size = size;
        this.#updateStyle();
    }

    get textAlignment() {
        return this._textAlignment;
    }

    set textAlignment(alignment) {
        this._textAlignment = alignment;
        this.#updateTextLayer();
        this.#updateStyle();
    }

    get lineHeight() {
        return this._lineHeight || this.fontSize * 1.4;
    }

    set lineHeight(height) {
        this._lineHeight = height;
        this.#updateStyle();
    }

    get textStorage() {
        return this._textStorage;
    }

    set textStorage(value) {
        if (value instanceof TextStorage) {
            this._textStorage = value;
            this._text = value.string;
            this.#updateTextLayer();
        }
    }

    init() {
        super.init();
        this._layer.cssClass = 'ui-label';
        this.element.className = 'ui-label';
        
        this._textLayer = CATextLayer.layer();
        this._textLayer.name = 'textLayer';
        
        this.#createTextLayerContent();
        this.#updateStyle();
        this._accessibilityValue = this._text;
        
        return this;
    }

    deinit() {
        this._text = '';
        this._textLayer = null;
        this._layerContents = null;
        super.deinit();
    }

    #createTextLayerContent() {
        if (!this._textLayer) return;
        
        this._textLayer.bounds = { x: 0, y: 0, width: this._bounds.width || 100, height: this._bounds.height || 20 };
        this._textLayer.string = this._text;
        this._textLayer.fontSize = this.fontSize;
        this._textLayer.textColor = this._textColor;
        this._textLayer.textAlignment = this.textAlignment;
        this._textLayer.fontFamily = this.fontFamily;
        this._textLayer.opacity = this.isEnabled ? 1 : 0.5;
        
        this._layerContents = (ctx, bounds) => {
            this.#renderTextInContext(ctx, bounds);
        };
    }

    #renderTextInContext(ctx, bounds) {
        const text = this._textStorage.string;
        if (!text) return;

        ctx.save();
        
        const attrs = this._textStorage.defaultAttributes;
        const fontSize = attrs.font?.size || this.fontSize;
        const fontFamily = attrs.font?.family || this.fontFamily;
        const fontWeight = attrs.font?.weight || this.fontWeight;
        
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.textBaseline = 'top';
        
        let textX = 0;
        if (this.textAlignment === 'center') {
            ctx.textAlign = 'center';
            textX = bounds.width / 2;
        } else if (this.textAlignment === 'right') {
            ctx.textAlign = 'right';
            textX = bounds.width;
        } else {
            ctx.textAlign = 'left';
            textX = 0;
        }

        const textColor = attrs.textColor || this._textColor;
        ctx.fillStyle = textColor.css;

        if (this.numberOfLines === 1) {
            ctx.fillText(text, textX, 0);
            
            if (attrs.underline) {
                const metrics = ctx.measureText(text);
                const y = fontSize;
                ctx.beginPath();
                ctx.moveTo(textX === 0 ? 0 : textX - metrics.width, y + 2);
                ctx.lineTo(textX === 0 ? metrics.width : textX, y + 2);
                ctx.strokeStyle = textColor.css;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            
            if (attrs.strikethrough) {
                const metrics = ctx.measureText(text);
                const y = fontSize / 2;
                ctx.beginPath();
                ctx.moveTo(textX === 0 ? 0 : textX - metrics.width, y);
                ctx.lineTo(textX === 0 ? metrics.width : textX, y);
                ctx.strokeStyle = textColor.css;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        } else {
            const lines = this.#wrapText(text, bounds.width, ctx);
            const maxLines = this.numberOfLines || lines.length;
            const lineHeight = this.lineHeight;
            
            lines.slice(0, maxLines).forEach((line, index) => {
                ctx.fillText(line, textX, index * lineHeight);
            });
        }
        
        ctx.restore();
    }

    #wrapText(text, maxWidth, ctx) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    }

    #updateTextLayer() {
        if (!this._textLayer) return;
        
        this._textLayer.string = this._text;
        this._textLayer.fontSize = this.fontSize;
        this._textLayer.textColor = this._textColor;
        this._textLayer.textAlignment = this.textAlignment;
        this._textLayer.fontFamily = this.fontFamily;
        this._textLayer.opacity = this.isEnabled ? 1 : 0.5;
        
        this.#renderLayers();
    }

    #updateStyle() {
        if (!this._textLayer) return;
        
        let cssClass = 'ui-label';
        if (this.numberOfLines !== 1) {
            cssClass += ' multiline';
            this._textLayer.maximumNumberOfLines = this.numberOfLines;
        } else {
            this._textLayer.maximumNumberOfLines = 0;
        }
        
        if (this.lineBreakMode === 'ellipsis') {
            cssClass += ' ellipsis';
            this._textLayer.truncationMode = 'end';
        }
        
        if (this.adjustsFontSizeToFitWidth) {
            cssClass += ' word-break';
        }
        
        this._layer.cssClass = cssClass;
        this._textLayer.opacity = this.isEnabled ? 1 : 0.5;
        
        this.#updateTextLayer();
    }

    #renderLayers() {
        if (!this.element || !this._useLayerRendering) return;
        if (!this._bounds.width || !this._bounds.height) return;
        
        const existingCanvas = this.element.querySelector('.layer-canvas');
        if (existingCanvas) existingCanvas.remove();

        const canvas = document.createElement('canvas');
        canvas.className = 'layer-canvas';
        canvas.style.position = 'absolute';
        canvas.style.left = '0';
        canvas.style.top = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.width = (this._bounds.width || 100) * 2;
        canvas.height = (this._bounds.height || 20) * 2;
        
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);
        
        this.#renderTextInContext(ctx, this._bounds);
        
        if (this.element.firstChild !== canvas) {
            this.element.insertBefore(canvas, this.element.firstChild);
        }
    }

    layoutSubviews() {
        super.layoutSubviews();
        if (this._textLayer) {
            this._textLayer.bounds = { 
                x: 0, 
                y: 0, 
                width: this._bounds.width, 
                height: this._bounds.height 
            };
        }
        this.#renderLayers();
    }

    setText(text) {
        this.text = text;
        return this;
    }

    setAttributedText(attributedText) {
        if (attributedText instanceof TextStorage) {
            this._textStorage = attributedText;
            this._text = attributedText.string;
        } else if (attributedText instanceof AttributedString) {
            this._text = attributedText.string;
            this._textStorage.string = this._text;
        }
        this.#updateTextLayer();
        this.#updateStyle();
        return this;
    }

    setTextColor(color) {
        this.textColor = color;
        return this;
    }

    setFontSize(size) {
        this.fontSize = size;
        return this;
    }

    setFontFamily(family) {
        this.fontFamily = family;
        this._textStorage.defaultAttributes.font.family = family;
        this.#updateStyle();
        return this;
    }

    setFontWeight(weight) {
        this.fontWeight = weight;
        this._textStorage.defaultAttributes.font.weight = weight;
        this.#updateStyle();
        return this;
    }

    setTextAlignment(alignment) {
        this.textAlignment = alignment;
        return this;
    }

    setNumberOfLines(lines) {
        this.numberOfLines = lines;
        this.#updateStyle();
        return this;
    }

    setLineBreakMode(mode) {
        this.lineBreakMode = mode;
        this.#updateStyle();
        return this;
    }

    setEnabled(enabled) {
        this.isEnabled = enabled;
        this.#updateStyle();
        return this;
    }

    setLineHeight(height) {
        this.lineHeight = height;
        return this;
    }

    setShadowColor(color) {
        this._shadowColor = color instanceof UIColor ? color : UIColor.colorWithHex(color);
        this.#updateShadow();
        return this;
    }

    setShadowOffset(offset) {
        this._shadowOffset = offset;
        this.#updateShadow();
        return this;
    }

    #updateShadow() {
        if (this._shadowColor) {
            this._layer.setShadowColor(this._shadowColor);
            this._layer.setShadowOpacity(this._shadowOpacity);
            this._layer.setShadowOffset(this._shadowOffset.width, this._shadowOffset.height);
            this._layer.setShadowRadius(this._shadowRadius);
        }
    }

    setAttributedTextAttribute(name, value, range = null) {
        this._textStorage.addAttribute(name, value, range);
        this.#updateTextLayer();
        return this;
    }

    appendAttributedString(attributedString) {
        if (attributedString instanceof AttributedString) {
            this._textStorage.appendString(attributedString.string, attributedString._attributes[0]?.attributes);
        }
        this._text = this._textStorage.string;
        this.#updateTextLayer();
        return this;
    }

    withText(text) {
        return this.setText(text);
    }

    withTextColor(color) {
        return this.setTextColor(color);
    }

    withFontSize(size) {
        return this.setFontSize(size);
    }

    withFontFamily(family) {
        return this.setFontFamily(family);
    }

    withFontWeight(weight) {
        return this.setFontWeight(weight);
    }

    withTextAlignment(alignment) {
        return this.setTextAlignment(alignment);
    }

    withNumberOfLines(lines) {
        return this.setNumberOfLines(lines);
    }

    withLineBreakMode(mode) {
        return this.setLineBreakMode(mode);
    }

    withEnabled(enabled) {
        return this.setEnabled(enabled);
    }

    withLineHeight(height) {
        return this.setLineHeight(height);
    }

    withShadowColor(color) {
        return this.setShadowColor(color);
    }

    withShadowOffset(offset) {
        return this.setShadowOffset(offset);
    }

    withAttributedText(attributedText) {
        return this.setAttributedText(attributedText);
    }

    encode() {
        return {
            text: this._text,
            textColor: this._textColor?.hex,
            fontSize: this.fontSize,
            fontFamily: this.fontFamily,
            fontWeight: this.fontWeight,
            textAlignment: this.textAlignment,
            numberOfLines: this.numberOfLines,
            lineBreakMode: this.lineBreakMode,
            isEnabled: this.isEnabled
        };
    }

    static decode(data) {
        const label = new UILabel(data.text || '');
        if (data.textColor) label.textColor = UIColor.colorWithHex(data.textColor);
        if (data.fontSize) label.fontSize = data.fontSize;
        if (data.fontFamily) label.fontFamily = data.fontFamily;
        if (data.fontWeight) label.fontWeight = data.fontWeight;
        if (data.textAlignment) label.textAlignment = data.textAlignment;
        if (data.numberOfLines !== undefined) label.numberOfLines = data.numberOfLines;
        if (data.lineBreakMode) label.lineBreakMode = data.lineBreakMode;
        if (data.isEnabled !== undefined) label.isEnabled = data.isEnabled;
        return label;
    }

    setAccessibilityLabel(label) {
        this._accessibilityLabel = label;
        this._updateAccessibilityAttributes();
        return this;
    }

    setAccessibilityValue(value) {
        this._accessibilityValue = value;
        this._updateAccessibilityAttributes();
        return this;
    }

    setAccessibilityTraits(traits) {
        this._accessibilityTraits = Array.isArray(traits) ? traits : [traits];
        this._updateAccessibilityAttributes();
        return this;
    }

    withAccessibilityLabel(label) {
        return this.setAccessibilityLabel(label);
    }

    withAccessibilityValue(value) {
        return this.setAccessibilityValue(value);
    }

    withAccessibilityTraits(...traits) {
        return this.setAccessibilityTraits(traits);
    }

    matchLabel(predicate) {
        if (typeof predicate === 'function') {
            return predicate(this);
        }
        return Switch(predicate)
            .case({ empty: true }, () => !this._text || this._text.length === 0)
            .case({ empty: false }, () => this._text && this._text.length > 0)
            .case({ text: Switch.let('t') }, (m) => this._text === m.t)
            .case({ contains: Switch.let('s') }, (m) => this._text?.includes(m.s))
            .case({ startsWith: Switch.let('s') }, (m) => this._text?.startsWith(m.s))
            .case({ endsWith: Switch.let('s') }, (m) => this._text?.endsWith(m.s))
            .case({ aligned: 'center' }, () => this.textAlignment === 'center')
            .case({ aligned: 'left' }, () => this.textAlignment === 'left')
            .case({ aligned: 'right' }, () => this.textAlignment === 'right')
            .case({ multiline: true }, () => this.numberOfLines !== 1)
            .case({ multiline: false }, () => this.numberOfLines === 1)
            .default(() => false)
            .evaluate();
    }

    ifCase(pattern, handler) {
        return ifCase(pattern)(this).then(handler);
    }

    guardCase(pattern) {
        return guardCase(pattern)(this);
    }

    static forCase(collection, pattern, handler) {
        for (const item of collection) {
            const result = forCase(pattern)(item);
            if (result !== undefined) {
                handler(result);
            }
        }
    }

    static whileCase(iterator, pattern) {
        return whileCase(pattern)(iterator);
    }

    switch() {
        return Switch(this);
    }
}

export default UILabel;
