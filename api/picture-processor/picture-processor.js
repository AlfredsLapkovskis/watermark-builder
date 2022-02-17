const { 
  Canvas, 
  Image,
  registerFont, 
  createImageData,
  createCanvas
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

    const robotoBlack       = path.resolve(robotoDir, 'Roboto-Black.ttf');
    const robotoBlackItalic = path.resolve(robotoDir, 'Roboto-BlackItalic.ttf');


    // Register fonts


    registerFont(robotoBlack,       { family: 'Roboto', weight: '900', style: 'normal' });
    registerFont(robotoBlackItalic, { family: 'Roboto', weight: '900', style: 'italic' });

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

    static constants = Object.freeze({
        defaultFontFamily     : "Roboto",
        defaultFontSize       : 24,
        defaultFontStyle      : "normal",// TODO
        defaultFontDecorations: "", // TODO
        defaultColor          : 0xFFFFFF,
        defaultOpacity        : 1.0,
        defaultShadow         : undefined, // TODO
        defaultRotationAngle  : 0,
        defaultFrequencyLevel : 3,
        minFrequencyLevel     : 1,
        maxFrequencyLevel     : 5
    });

    constructor({
      text, 
      fontFamily, 
      fontSize, 
      fontStyle, 
      fontDecorations, 
      color, 
      opacity, 
      shadow, 
      rotationAngle, 
      frequencyLevel
    }) {
        this.text            = text;            // string
        this.fontFamily      = fontFamily;      // string (e.g., "Roboto", ...)
        this.fontSize        = fontSize;        // number (pixels)
        this.fontStyle       = fontStyle;       // string
        this.fontDecorations = fontDecorations; // string (underline, overline, ...)
        this.color           = color;           // number, RGB (e.g., 0x1A5F6C)
        this.opacity         = opacity;         // float, 0.0 ... 1.0
        this.shadow          = shadow;          // TODO
        this.rotationAngle   = rotationAngle;   // float, radians
        this.frequencyLevel  = frequencyLevel;  // number, 1 ... 5
    }

    get textOrDefault() {
        return (typeof this.text === "string") ? this.text : "";
    }

    get fontFamilyOrDefault() {
        return (typeof this.fontFamily === "string" && this.fontFamily.length > 0) 
            ? fontFamily 
            : ImageProcessorTextWatermarkDescription.constants.defaultFontFamily; // TODO: Add dictionary with all supported font families, and check it.
    }

    get fontSizeOrDefault() {
        return (typeof this.fontSize === "number" && this.fontSize > 0) 
            ? Math.round(this.fontSize) 
            : ImageProcessorTextWatermarkDescription.constants.defaultFontSize;
    }

    get fontStyleOrDefault() {
        return (typeof this.fontStyle === "string" && this.fontStyle.length > 0) 
            ? this.fontStyle 
            : ImageProcessorTextWatermarkDescription.constants.defaultFontStyle; // TODO: Add dictionary with all supported font styles, and check it.
    }

    get fontDecorationsOrDefault() {
        return (typeof this.fontDecorations === "string" && this.fontDecorations.length > 0) 
            ? this.fontDecorations 
            : ImageProcessorTextWatermarkDescription.constants.defaultFontDecorations; // TODO: Add dictionary with all supported font styles, and check it.
    }

    get colorOrDefault() {
        return (typeof this.color === "number" && color >= 0) 
            ? Math.round(this.color) 
            : ImageProcessorTextWatermarkDescription.constants.defaultColor;
    }

    get opacityOrDefault() {
        return (typeof this.opacity === "number" && this.opacity >= 0.0 && this.opacity <= 1.0) 
            ? this.opacity 
            : ImageProcessorTextWatermarkDescription.constants.defaultOpacity;
    }

    get shadowOrDefault() {
        return shadow; // TODO
    }

    get rotationAngleOrDefault() {
        return (typeof this.rotationAngle === "number") 
            ? Math.round(this.rotationAngle) 
            : ImageProcessorTextWatermarkDescription.constants.defaultRotationAngle;
    }

    get frequencyLevelOrDefault() {
        return (typeof this.frequencyLevel === "number" && this.frequencyLevel >= minFrequenceLevel && this.frequencyLevel <= maxFrequencyLevel) 
            ? Math.round(this.frequencyLevel) 
            : ImageProcessorTextWatermarkDescription.constants.defaultFrequencyLevel;
    }
}

class ImageProcessorPictureWatermarkDescription {

    constructor({
        buffer,
        mimeType,
        opacity,
        shadow,
        rotationAngle,
        frequencyLevel
    }) {
        this.buffer         = buffer;         // Buffer
        this.mimeType       = mimeType;       // string
        this.opacity        = opacity;        // float, 0.0 ... 1.0
        this.shadow         = shadow;         // TODO
        this.rotationAngle  = rotationAngle;  // float, radians
        this.frequencyLevel = frequencyLevel; // number, 1 ... 5
    }
}


// ImageProcessor

class ImageProcessor {

    constructor() {
        ensureFontsRegistered();
    }

    async processPicture(params) {
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

            this.#drawWatermark(context, image, watermarkDescription);

            resolve(canvas.toBuffer()); // TODO here
        });
    }

    #drawWatermark(context, image, watermarkDescription) {
        const width  = image.width;
        const height = image.height;

        context.drawImage(image, 0, 0);

        if (watermarkDescription instanceof ImageProcessorTextWatermarkDescription) {
            const text           = watermarkDescription.textOrDefault;
            const fontFamily     = watermarkDescription.fontFamilyOrDefault;
            const fontSize       = watermarkDescription.fontSizeOrDefault;
            const fontStyle      = watermarkDescription.fontStyleOrDefault;
            const color          = watermarkDescription.colorOrDefault;
            const opacity        = watermarkDescription.opacityOrDefault;
            const frequencyLevel = watermarkDescription.frequencyLevelOrDefault;

            context.fillStyle = ImageProcessorUtils.hexToRgba         (color, opacity);
            context.font      = ImageProcessorUtils.fontFromComponents(fontFamily, fontSize, fontStyle);

            const textMetrics              = context.measureText(text);
            const textWidth                = textMetrics.width;
            const textHeight               = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
            const horizontalCapacity       = width  / textWidth;
            const verticalCapacity         = height / textHeight;
            const frequency                = frequencyLevel / ImageProcessorTextWatermarkDescription.constants.maxFrequencyLevel;
            const horizontalItemCount      = Math.round(horizontalCapacity * 0.4 + 0.4 * frequency);
            const verticalItemCount        = Math.round(verticalCapacity * 0.3 + 0.3 * frequency);
            const horizontalRemainingSpace = width - horizontalItemCount * textWidth;
            const verticalRemainingSpace   = height - verticalItemCount * textHeight;
            const horizontalBetweenSpace   = horizontalRemainingSpace / horizontalItemCount;
            const horizontalLeadingSpace   = horizontalBetweenSpace / 2;
            const verticalBetweenSpace     = verticalRemainingSpace / verticalItemCount;
            const verticalLeadingSpace     = textHeight + verticalBetweenSpace / 2;

            console.log(`image sizes={${width}, ${height}}; textSizes={${textWidth}, ${textHeight}}`);

            for (let v = 0; v < verticalItemCount; v++) {
                for (let h = 0; h < horizontalItemCount; h++) {
                    // console.log(`drawing text ${v} ${h}`);
                    const xOffset = horizontalLeadingSpace + h * (textWidth + horizontalBetweenSpace);
                    const yOffset = verticalLeadingSpace   + v * (textHeight  + verticalBetweenSpace);

                    context.fillText(text, xOffset, yOffset);
                }
            }
        }
        else if (watermarkDescription instanceof ImageProcessorPictureWatermarkDescription) {

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
        const red   = ((hex >> 16) & 0xFF) / 0xFF;
        const green = ((hex >>  8) & 0xFF) / 0xFF;
        const blue  = ((hex >>  0) & 0xFF) / 0xFF;
        
        return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
    }

    static fontFromComponents(family, size, style) {
        return `${size}px "${family.replace(/\b[a-z]/g, (char) => char.toUpperCase())}"`;
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
