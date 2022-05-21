const { 
  Canvas, 
  Image,
  registerFont,
} = require('canvas');
const path = require('path');


// Font registration;

let areFontsRegistered = false;

function ensureFontsRegistered() {
    if (areFontsRegistered) {
        return;
    }

    // Font dir

    const fontDir = path.resolve(__dirname, './fonts');


    // Font family dirs

    const robotoDir = path.resolve(fontDir, 'Roboto');


    // Font files

    const robotoThin          = path.resolve(robotoDir, 'Roboto-Thin.ttf');
    const robotoThinItalic    = path.resolve(robotoDir, 'Roboto-ThinItalic.ttf'  );
    const robotoLight         = path.resolve(robotoDir, 'Roboto-Light.ttf'       );
    const robotoLightItalic   = path.resolve(robotoDir, 'Roboto-LightItalic.ttf' );
    const robotoRegular       = path.resolve(robotoDir, 'Roboto-Regular.ttf'     );
    const robotoItalic        = path.resolve(robotoDir, 'Roboto-Italic.ttf'      );
    const robotoMedium        = path.resolve(robotoDir, 'Roboto-Medium.ttf'      );
    const robotoMediumItalic  = path.resolve(robotoDir, 'Roboto-MediumItalic.ttf');
    const robotoBold          = path.resolve(robotoDir, 'Roboto-Bold.ttf'        );
    const robotoBoldItalic    = path.resolve(robotoDir, 'Roboto-BoldItalic.ttf'  );
    const robotoBlack         = path.resolve(robotoDir, 'Roboto-Black.ttf'       );
    const robotoBlackItalic   = path.resolve(robotoDir, 'Roboto-BlackItalic.ttf' );


    // Register fonts

    registerFont(robotoThin,         { family: 'Roboto', weight: '100', style: 'normal' });
    registerFont(robotoThinItalic,   { family: 'Roboto', weight: '100', style: 'italic' });
    registerFont(robotoLight,        { family: 'Roboto', weight: '300', style: 'normal' });
    registerFont(robotoLightItalic,  { family: 'Roboto', weight: '300', style: 'italic' });
    registerFont(robotoRegular,      { family: 'Roboto', weight: '400', style: 'normal' });
    registerFont(robotoItalic,       { family: 'Roboto', weight: '400', style: 'italic' });
    registerFont(robotoMedium,       { family: 'Roboto', weight: '500', style: 'normal' });
    registerFont(robotoMediumItalic, { family: 'Roboto', weight: '500', style: 'italic' });
    registerFont(robotoBold,         { family: 'Roboto', weight: '700', style: 'normal' });
    registerFont(robotoBoldItalic,   { family: 'Roboto', weight: '700', style: 'italic' });
    registerFont(robotoBlack,        { family: 'Roboto', weight: '900', style: 'normal' });
    registerFont(robotoBlackItalic,  { family: 'Roboto', weight: '900', style: 'italic' });

    areFontsRegistered = true;
}


// Mime types

const IMAGE_MIME_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg'
];

const SVG_MIME_TYPES = [
    'image/svg+xml'
];

const SUPPORTED_MIME_TYPES = [
    ...IMAGE_MIME_TYPES,
    ...SVG_MIME_TYPES
];


// Error masks

const IMAGE_PROCESSOR_ERROR_INVALID_PARAMS_TYPE                        = 1 << 0;
const IMAGE_PROCESSOR_ERROR_UNSUPPORTED_MIME_TYPE                      = 1 << 1;
const IMAGE_PROCESSOR_ERROR_INVALID_MIME_TYPE_TYPE                     = 1 << 2;
const IMAGE_PROCESSOR_ERROR_INVALID_BUFFER_TYPE                        = 1 << 3;
const IMAGE_PROCESSOR_ERROR_INVALID_WATERMARK_DESCRIPTION_TYPE         = 1 << 4;
const IMAGE_PROCESSOR_ERROR_INVALID_WATERMARK_DESCRIPTION_TEXT_TYPE    = 1 << 5;
const IMAGE_PROCESSOR_ERROR_WATERMARK_DESCRIPTION_TEXT_EMPTY           = 1 << 6;
const IMAGE_PROCESSOR_ERROR_INVALID_WATERMARK_MIME_TYPE_TYPE           = 1 << 7;
const IMAGE_PROCESSOR_ERROR_UNSUPPORTED_WATERMARK_MIME_TYPE            = 1 << 8;
const IMAGE_PROCESSOR_ERROR_INVALID_WATERMARK_BUFFER_TYPE              = 1 << 9;
const IMAGE_PROCESSOR_ERROR_FAILED_LOADING_IMAGE_FROM_BUFFER           = 1 << 10;
const IMAGE_PROCESSOR_ERROR_FAILED_LOADING_WATERMARK_IMAGE_FROM_BUFFER = 1 << 11;


// ImageProcessorParams

class ImageProcessorParams {

    constructor(buffer, mimeType, watermarkDescription) {
        this.buffer               = buffer;               // Buffer
        this.mimeType             = mimeType;             // string
        this.watermarkDescription = watermarkDescription; // ImageProcessorTextWatermarkDescription | ImageProcessorPictureWatermarkDescription
    }
}


// Watermark descriptions

class ImageProcessorTextWatermarkDescription {

    #text;
    #fontFamily;
    #fontSize;
    #fontItalic;
    #fontDecorations;
    #fontWeight;
    #color;
    #opacity;
    #strokeColor;
    #strokeOpacity;
    #shadowOffsetX;
    #shadowOffsetY;
    #shadowBlurRadius;
    #shadowColor;
    #shadowOpacity;
    #rotationAngle;
    #densityLevel;

    static constants = Object.freeze({
        defaultFontFamily      : "Roboto",
        defaultFontSize        : 24,
        defaultFontItalic      : false,
        defaultFontUnderline   : false,
        defaultFontLineThrough : false,
        defaultFontWeight      : 400,
        defaultColor           : 0x000000,
        defaultOpacity         : 1.0,
        defaultStrokeColor     : 0x000000,
        defaultStrokeOpacity   : 0,
        defaultShadowOffsetX   : 0,
        defaultShadowOffsetY   : 0,
        defaultShadowBlurRadius: 0,
        defaultShadowColor     : 0x000000,
        defaultShadowOpacity   : 0,
        defaultRotationAngle   : 0,
        defaultDensityLevel    : 3,
        minDensityLevel        : 1,
        maxDensityLevel        : 5,
        maxNumber              : 9999
    });

    constructor({
        text,
        fontFamily,
        fontSize,
        fontItalic,
        fontDecorations,
        fontWeight,
        color,
        opacity,
        strokeColor,
        strokeOpacity,
        shadowOffsetX,
        shadowOffsetY,
        shadowBlurRadius,
        shadowColor,
        shadowOpactity,
        rotationAngle,
        densityLevel
    }) {
        this.#text             = text;
        this.#fontFamily       = fontFamily;
        this.#fontSize         = fontSize;
        this.#fontItalic       = fontItalic;
        this.#fontDecorations  = fontDecorations;
        this.#fontWeight       = fontWeight;
        this.#color            = color;
        this.#opacity          = opacity;
        this.#strokeColor      = strokeColor;
        this.#strokeOpacity    = strokeOpacity;
        this.#shadowOffsetX    = shadowOffsetX;
        this.#shadowOffsetY    = shadowOffsetY;
        this.#shadowBlurRadius = shadowBlurRadius;
        this.#shadowColor      = shadowColor;
        this.#shadowOpacity    = shadowOpactity;
        this.#rotationAngle    = rotationAngle;
        this.#densityLevel     = densityLevel;
    }

    get text() {
        return this.#text;
    }

    get fontFamily() {
        return (typeof this.#fontFamily === "string" && this.#fontFamily.length > 0)
            ? this.#fontFamily
            : ImageProcessorTextWatermarkDescription.constants.defaultFontFamily;
    }

    get fontSize() {
        return (
            typeof this.#fontSize === "number" 
                && !isNaN(this.#fontSize)
                && this.#fontSize >= 0
                && this.#fontSize <= ImageProcessorTextWatermarkDescription.constants.maxNumber
        )
            ? Math.round(this.#fontSize)
            : ImageProcessorTextWatermarkDescription.constants.defaultFontSize;
    }

    get fontItalic() {
        return typeof this.#fontItalic === "boolean"
            ? this.#fontItalic
            : ImageProcessorTextWatermarkDescription.constants.defaultFontItalic;
    }

    get fontUnderline() {
        return typeof this.#fontDecorations === "string"
            ? this.#fontDecorations.includes("u")
            : ImageProcessorTextWatermarkDescription.constants.defaultFontUnderline;
    }

    get fontLineThrough() {
        return typeof this.#fontDecorations === "string"
            ? this.#fontDecorations.includes("t")
            : ImageProcessorTextWatermarkDescription.constants.defaultFontLineThrough;
    }

    get fontWeight() {
        return (
            typeof this.#fontWeight === "number"
                && !isNaN(this.#fontWeight)
                && this.#fontWeight % 100 === 0
                && this.#fontWeight >= 100
                && this.#fontWeight <= 900
        )
            ? this.#fontWeight
            : ImageProcessorTextWatermarkDescription.constants.defaultFontWeight;
    }

    get color() {
        if (typeof this.#color === "string" && this.#color.length == 6) {
            const color = parseInt(this.#color, 16);

            if (!isNaN(color)) {
                return color;
            }
        }

        return ImageProcessorTextWatermarkDescription.constants.defaultColor;
    }

    get opacity() {
        return (
            typeof this.#opacity === "number"
                && this.#opacity >= 0.0
                && this.#opacity <= 1.0
        )
            ? this.#opacity
            : ImageProcessorTextWatermarkDescription.constants.defaultOpacity;  
    }

    get strokeColor() {
        if (typeof this.#strokeColor === "string" && this.#strokeColor.length == 6) {
            const strokeColor = parseInt(this.#strokeColor, 16);

            if (!isNaN(strokeColor)) {
                return strokeColor;
            }
        }

        return ImageProcessorTextWatermarkDescription.constants.defaultStrokeColor;
    }

    get strokeOpacity() {
        return (
            typeof this.#strokeOpacity === "number"
                && this.#strokeOpacity >= 0.0
                && this.#strokeOpacity <= 1.0
        )
            ? this.#strokeOpacity
            : ImageProcessorTextWatermarkDescription.constants.defaultStrokeOpacity;  
    }

    get shadowOffsetX() {
        return (
            typeof this.#shadowOffsetX === "number"
                && !isNaN(this.#shadowOffsetX)
                && Math.abs(this.#shadowOffsetX) <= ImageProcessorTextWatermarkDescription.constants.maxNumber
        )
            ? Math.round(this.#shadowOffsetX)
            : ImageProcessorTextWatermarkDescription.constants.defaultShadowOffsetX;
    }

    get shadowOffsetY() {
        return (
            typeof this.#shadowOffsetY === "number"
                && !isNaN(this.#shadowOffsetY)
                && Math.abs(this.#shadowOffsetY) <= ImageProcessorTextWatermarkDescription.constants.maxNumber
        )
            ? Math.round(this.#shadowOffsetY)
            : ImageProcessorTextWatermarkDescription.constants.defaultShadowOffsetY;
    }

    get shadowBlurRadius() {
        return (
            typeof this.#shadowBlurRadius === "number"
                && !isNaN(this.#shadowBlurRadius)
                && Math.abs(this.#shadowBlurRadius) <= ImageProcessorTextWatermarkDescription.constants.maxNumber
        )
            ? Math.round(this.#shadowBlurRadius)
            : ImageProcessorTextWatermarkDescription.constants.defaultShadowBlurRadius;
    }

    get shadowColor() {
        if (typeof this.#shadowColor === "string" && this.#shadowColor.length == 6) {
            const shadowColor = parseInt(this.#shadowColor, 16);

            if (!isNaN(shadowColor)) {
                return shadowColor;
            }
        }

        return ImageProcessorTextWatermarkDescription.constants.defaultShadowColor;
    }

    get shadowOpacity() {
        return (
            typeof this.#shadowOpacity === "number"
                && !isNaN(this.#shadowOpacity)
                && this.#shadowOpacity >= 0.0
                && this.#shadowOpacity <= 1.0
        )
            ? this.#shadowOpacity
            : ImageProcessorTextWatermarkDescription.constants.defaultShadowOpacity;  
    }

    get rotationAngle() {
        return (typeof this.#rotationAngle === "number" && !isNaN(this.#rotationAngle))
            ? Math.round(this.#rotationAngle)
            : ImageProcessorTextWatermarkDescription.constants.defaultRotationAngle;
    }

    get densityLevel() {
        return (
            typeof this.#densityLevel === "number" 
                && !isNaN(this.#densityLevel)
                && this.#densityLevel >= ImageProcessorTextWatermarkDescription.constants.minDensityLevel 
                && this.#densityLevel <= ImageProcessorTextWatermarkDescription.constants.maxDensityLevel
        )
            ? Math.round(this.#densityLevel)
            : ImageProcessorTextWatermarkDescription.constants.defaultDensityLevel;
    }
}

class ImageProcessorPictureWatermarkDescription {

    #buffer;
    #mimeType;
    #opacity;
    #rotationAngle;
    #densityLevel;

    static constants = Object.freeze({
        defaultRotationAngle: 0,
        defaultDensityLevel : 3,
        defaultOpacity      : 1,
        minDensityLevel     : 1,
        maxDensityLevel     : 5
    });

    constructor({
        buffer,
        mimeType,
        opacity,
        rotationAngle,
        densityLevel
    }) {
        this.#buffer        = buffer;
        this.#mimeType      = mimeType;
        this.#opacity       = opacity;
        this.#rotationAngle = rotationAngle;
        this.#densityLevel  = densityLevel;
    }

    get buffer() {
        return this.#buffer;
    }

    get mimeType() {
        return this.#mimeType;
    }

    get opacity() {
        return (
            typeof this.#opacity === "number"
                && this.#opacity >= 0.0
                && this.#opacity <= 1.0
        )
            ? this.#opacity
            : ImageProcessorTextWatermarkDescription.constants.defaultOpacity;  
    }

    get rotationAngle() {
        return (typeof this.#rotationAngle === "number" && !isNaN(this.#rotationAngle))
            ? Math.round(this.#rotationAngle)
            : ImageProcessorPictureWatermarkDescription.constants.defaultRotationAngle;
    }

    get densityLevel() {
        return (
            typeof this.#densityLevel === "number"
                && !isNaN(this.#densityLevel)
                && this.#densityLevel >= ImageProcessorPictureWatermarkDescription.constants.minDensityLevel 
                && this.#densityLevel <= ImageProcessorPictureWatermarkDescription.constants.maxDensityLevel
        )
            ? Math.round(this.#densityLevel)
            : ImageProcessorPictureWatermarkDescription.constants.defaultDensityLevel;
    }
}


// ImageProcessor

class ImageProcessor {

    constructor() {
        ensureFontsRegistered();
    }

    async processImage(params) {
        return new Promise(async (resolve, reject) => {
            const error = ImageProcessorValidator.validateParams(params);

            if (error != null) {
                reject(error);
                return;
            }

            const mimeType             = params.mimeType;
            const buffer               = params.buffer;
            const watermarkDescription = params.watermarkDescription;

            let image;

            try {
                image = await this.#createImageObject(buffer);
            }
            catch (_) {
                reject(new ImageProcessorError(IMAGE_PROCESSOR_ERROR_FAILED_LOADING_IMAGE_FROM_BUFFER));
                return;
            }

            const canvas  = this.#createCanvasObject (image, mimeType);
            const context = this.#createContextObject(canvas);

            try {
                await this.#drawWatermark(context, image, watermarkDescription);
            }
            catch (e) {
                reject(e);
            }

            resolve(canvas.toBuffer());
        });
    }

    async #drawWatermark(context, image, watermarkDescription) {
        const imageWidth  = image.width;
        const imageHeight = image.height;

        context.drawImage(image, 0, 0);

        if (watermarkDescription instanceof ImageProcessorTextWatermarkDescription) {
            const text             = watermarkDescription.text;
            const fontFamily       = watermarkDescription.fontFamily;
            const fontSize         = watermarkDescription.fontSize;
            const fontItalic       = watermarkDescription.fontItalic;
            const fontWeight       = watermarkDescription.fontWeight;
            const fontUnderline    = watermarkDescription.fontUnderline;
            const fontLineThrough  = watermarkDescription.fontLineThrough;
            const color            = watermarkDescription.color;
            const opacity          = watermarkDescription.opacity;
            const strokeColor      = watermarkDescription.strokeColor;
            const strokeOpacity    = watermarkDescription.strokeOpacity;
            const densityLevel     = watermarkDescription.densityLevel;
            const rotationAngle    = watermarkDescription.rotationAngle;
            const shadowOffsetX    = watermarkDescription.shadowOffsetX;
            const shadowOffsetY    = watermarkDescription.shadowOffsetY;
            const shadowBlurRadius = watermarkDescription.shadowBlurRadius;
            const shadowColor      = watermarkDescription.shadowColor;
            const shadowOpacity    = watermarkDescription.shadowOpacity;

            const rotationAngleInRad = ImageProcessorUtils.degreesToRadians(rotationAngle);
            const sinAngle           = Math.abs(Math.sin(rotationAngleInRad));
            const cosAngle           = Math.abs(Math.cos(rotationAngleInRad));

            const width  = imageWidth  * cosAngle + imageHeight * sinAngle;
            const height = imageHeight * cosAngle + imageWidth  * sinAngle;

            context.fillStyle     = ImageProcessorUtils.hexToRgba(color, opacity);
            context.font          = ImageProcessorUtils.fontFromComponents(fontFamily, fontSize, fontItalic, fontWeight);
            context.strokeStyle   = ImageProcessorUtils.hexToRgba(strokeColor, strokeOpacity);         
            context.shadowColor   = ImageProcessorUtils.hexToRgba(shadowColor, shadowOpacity);
            context.shadowOffsetX = shadowOffsetX;
            context.shadowOffsetY = shadowOffsetY;
            context.shadowBlur    = shadowBlurRadius;
            
            context.translate(imageWidth / 2, imageHeight / 2);
            context.rotate   (rotationAngleInRad);
            context.translate(-width / 2, -height / 2);

            const textMetrics              = context.measureText(text);
            const textWidth                = textMetrics.width;
            const textHeight               = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
            const horizontalCapacity       = width  / textWidth;
            const verticalCapacity         = height / textHeight;
            const density                  = densityLevel / ImageProcessorTextWatermarkDescription.constants.maxDensityLevel;
            const horizontalItemCount      = Math.max(1, Math.round(horizontalCapacity * 0.2 + horizontalCapacity * 0.6 * density));
            const verticalItemCount        = Math.max(1, Math.round(verticalCapacity * 0.1 + verticalCapacity * 0.3 * density));
            const horizontalRemainingSpace = width - horizontalItemCount * textWidth;
            const verticalRemainingSpace   = height - verticalItemCount * textHeight;
            const horizontalBetweenSpace   = horizontalRemainingSpace / horizontalItemCount;
            const horizontalLeadingSpace   = horizontalBetweenSpace / 2;
            const verticalBetweenSpace     = verticalRemainingSpace / verticalItemCount;
            const verticalLeadingSpace     = textHeight + verticalBetweenSpace / 2;
            const decorationLineHeight     = textHeight / 10;

            for (let v = 0; v < verticalItemCount; v++) {
                for (let h = 0; h < horizontalItemCount; h++) {
                    const xOffset = horizontalLeadingSpace + h * (textWidth + horizontalBetweenSpace);
                    const yOffset = verticalLeadingSpace   + v * (textHeight  + verticalBetweenSpace);
                    
                    context.fillText  (text, xOffset, yOffset);
                    context.strokeText(text, xOffset, yOffset);

                    if (fontUnderline) {
                        context.fillRect(xOffset, yOffset + decorationLineHeight, textWidth, decorationLineHeight);
                    }
                    if (fontLineThrough) {
                        context.fillRect(xOffset, yOffset - textHeight / 2, textWidth, decorationLineHeight);
                    }
                }
            }
        }
        else if (watermarkDescription instanceof ImageProcessorPictureWatermarkDescription) {
            const buffer        = watermarkDescription.buffer;
            const opacity       = watermarkDescription.opacity;
            const densityLevel  = watermarkDescription.densityLevel;
            const rotationAngle = watermarkDescription.rotationAngle;

            let watermarkImage;

            try {
                watermarkImage = await this.#createImageObject(buffer);
            }
            catch (_) {
                throw new ImageProcessorError(IMAGE_PROCESSOR_ERROR_FAILED_LOADING_WATERMARK_IMAGE_FROM_BUFFER);
            }

            const rotationAngleInRad = ImageProcessorUtils.degreesToRadians(rotationAngle);
            const sinAngle           = Math.abs(Math.sin(rotationAngleInRad));
            const cosAngle           = Math.abs(Math.cos(rotationAngleInRad));

            const width  = imageWidth  * cosAngle + imageHeight * sinAngle;
            const height = imageHeight * cosAngle + imageWidth  * sinAngle;

            context.globalAlpha = opacity;
            context.translate(imageWidth / 2, imageHeight / 2);
            context.rotate   (rotationAngleInRad);
            context.translate(-width / 2, -height / 2);

            const watermarkWidth           = watermarkImage.width;
            const watermarkHeight          = watermarkImage.height;
            const horizontalCapacity       = width / watermarkWidth;
            const verticalCapacity         = height / watermarkHeight;
            const density                  = densityLevel / ImageProcessorPictureWatermarkDescription.constants.maxDensityLevel;
            const horizontalItemCount      = Math.max(1, Math.round(horizontalCapacity * 0.2 + horizontalCapacity * 0.6 * density));
            const verticalItemCount        = Math.max(1, Math.round(verticalCapacity * 0.1 + verticalCapacity * 0.3 * density));
            const horizontalRemainingSpace = width - horizontalItemCount * watermarkWidth;
            const verticalRemainingSpace   = height - verticalItemCount * watermarkHeight;
            const horizontalBetweenSpace   = horizontalRemainingSpace / horizontalItemCount;
            const horizontalLeadingSpace   = horizontalBetweenSpace / 2;
            const verticalBetweenSpace     = verticalRemainingSpace / verticalItemCount;
            const verticalLeadingSpace     = verticalBetweenSpace / 2;
            
            for (let v = 0; v < verticalItemCount; v++) {
                for (let h = 0; h < horizontalItemCount; h++) {
                    const xOffset = horizontalLeadingSpace + h * (watermarkWidth + horizontalBetweenSpace);
                    const yOffset = verticalLeadingSpace   + v * (watermarkHeight  + verticalBetweenSpace);

                    context.drawImage(watermarkImage, xOffset, yOffset);
                }
            }
        }
    }

    async #createImageObject(buffer) {
        return new Promise((resolve, reject) => {
            const image   = new Image();
            image.onload  = _ => resolve(image);
            image.onerror = _ => reject ();
            image.src     = buffer;
        });
    }

    #createCanvasObject(image, mimeType) {
        return new Canvas(image.width, image.height, this.#mimeTypeToCanvasType(mimeType));
    }

    #createContextObject(canvas) {
        return canvas.getContext('2d');
    }

    #mimeTypeToCanvasType(mimeType) {
        return IMAGE_MIME_TYPES.includes(mimeType)
            ? 'image'
            : SVG_MIME_TYPES.includes(mimeType)
                ? 'svg'
                : '';
    }
}


// ImageProcessorValidator

class ImageProcessorValidator {

    /**
     * 
     * @param   {ImageProcessorParams | any } params
     * @returns {ImageProcessorError  | null}
     */
    static validateParams(params) {
        if (params instanceof ImageProcessorParams) {
            let errorMask = 0;

            errorMask |= this.#validateImageMimeType       (params.mimeType);
            errorMask |= this.#validateImageBuffer         (params.buffer);
            errorMask |= this.#validateWatermarkDescription(params.watermarkDescription);
    
            return errorMask != 0
                ? new ImageProcessorError(errorMask)
                : null;
        }

        return new ImageProcessorError(IMAGE_PROCESSOR_ERROR_INVALID_PARAMS_TYPE);
    }

    static #validateWatermarkDescription(description) {
        if (description instanceof ImageProcessorTextWatermarkDescription) {
            if (!(typeof description.text === "string")) {
                return IMAGE_PROCESSOR_ERROR_INVALID_WATERMARK_DESCRIPTION_TEXT_TYPE;
            }
            else if (description.text.length == 0) {
                return IMAGE_PROCESSOR_ERROR_WATERMARK_DESCRIPTION_TEXT_EMPTY;
            }
        }
        else if (description instanceof ImageProcessorPictureWatermarkDescription) {
            let errorMask = 0;

            errorMask |= this.#validateWatermarkMimeType(description.mimeType);
            errorMask |= this.#validateWatermarkBuffer  (description.buffer);

            return errorMask;
        }
        else {
            return IMAGE_PROCESSOR_ERROR_INVALID_WATERMARK_DESCRIPTION_TYPE;
        }

        return 0;
    }

    static #validateImageMimeType(mimeType) {
        return this.#validateMimeType(mimeType, IMAGE_PROCESSOR_ERROR_INVALID_MIME_TYPE_TYPE, IMAGE_PROCESSOR_ERROR_UNSUPPORTED_MIME_TYPE);
    }

    static #validateImageBuffer(buffer) {
        return this.#validateBuffer(buffer, IMAGE_PROCESSOR_ERROR_INVALID_BUFFER_TYPE);
    }

    static #validateWatermarkMimeType(mimeType) {
        return this.#validateMimeType(mimeType, IMAGE_PROCESSOR_ERROR_INVALID_WATERMARK_MIME_TYPE_TYPE, IMAGE_PROCESSOR_ERROR_UNSUPPORTED_WATERMARK_MIME_TYPE);
    }

    static #validateWatermarkBuffer(buffer) {
        return this.#validateBuffer(buffer, IMAGE_PROCESSOR_ERROR_INVALID_WATERMARK_BUFFER_TYPE);
    }

    static #validateMimeType(mimeType, typeErrorMask, supportErrorMask) {
        if (!(typeof mimeType === "string")) {
            return typeErrorMask;
        }
        else if (!SUPPORTED_MIME_TYPES.includes(mimeType)) {
            return supportErrorMask;
        }

        return 0;
    }

    static #validateBuffer(buffer, typeErrorMask) {
        if (!(buffer instanceof Buffer)) {
            return typeErrorMask;
        }

        return 0;
    }
}


// ImageProcessorUtils

class ImageProcessorUtils {

    static hexToRgba(hex, opacity) {
        const red   = (hex >> 16) & 0xFF;
        const green = (hex >>  8) & 0xFF;
        const blue  = (hex >>  0) & 0xFF;
        
        return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
    }

    static degreesToRadians(degrees) {
        let normalizedDegrees = degrees % 360;
        normalizedDegrees = normalizedDegrees < 0 ? 360 + normalizedDegrees : normalizedDegrees;
        return normalizedDegrees * (Math.PI / 180);
    }

    static fontFromComponents(family, size, italic, weight) {
        return `${italic ? "italic" : ""} ${weight !== null && weight !== undefined ? weight : ""} ${size}px "${family.replace(/\b[a-z]/g, (char) => char.toUpperCase())}"`;
    }
}


// ImageProcessorError

class ImageProcessorError {

    #mask;

    constructor(mask) {
        this.#mask = mask;
    }

    getMask() {
        return this.#mask;
    }
}


// Exports

module.exports = Object.freeze({
    SUPPORTED_MIME_TYPES,
    ImageProcessorErrorMask: {
        IMAGE_PROCESSOR_ERROR_INVALID_PARAMS_TYPE,                    
        IMAGE_PROCESSOR_ERROR_UNSUPPORTED_MIME_TYPE,                  
        IMAGE_PROCESSOR_ERROR_INVALID_MIME_TYPE_TYPE,                 
        IMAGE_PROCESSOR_ERROR_INVALID_BUFFER_TYPE,                    
        IMAGE_PROCESSOR_ERROR_INVALID_WATERMARK_DESCRIPTION_TYPE,     
        IMAGE_PROCESSOR_ERROR_INVALID_WATERMARK_DESCRIPTION_TEXT_TYPE,
        IMAGE_PROCESSOR_ERROR_WATERMARK_DESCRIPTION_TEXT_EMPTY,       
        IMAGE_PROCESSOR_ERROR_INVALID_WATERMARK_MIME_TYPE_TYPE,       
        IMAGE_PROCESSOR_ERROR_UNSUPPORTED_WATERMARK_MIME_TYPE,
        IMAGE_PROCESSOR_ERROR_INVALID_WATERMARK_BUFFER_TYPE,       
        IMAGE_PROCESSOR_ERROR_FAILED_LOADING_IMAGE_FROM_BUFFER,
        IMAGE_PROCESSOR_ERROR_FAILED_LOADING_WATERMARK_IMAGE_FROM_BUFFER
    },
    ImageProcessor,
    ImageProcessorParams,
    ImageProcessorTextWatermarkDescription,
    ImageProcessorPictureWatermarkDescription,
    ImageProcessorError
});
