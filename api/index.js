const express = require('express');
const path    = require('path');
const multer  = require('multer');
const {
  ImageProcessor,
  ImageProcessorErrorMask,
  ImageProcessorParams,
  ImageProcessorTextWatermarkDescription,
  ImageProcessorPictureWatermarkDescription,
  ImageProcessorError
} = require('./picture-processor');
const { MulterError } = require('multer');

// TODO: Implement error handling.

const app = express();

app.use(express.static(path.resolve(__dirname, '../client/build')));

const supportedMimetypes = [
  'image/png',
  'image/jpeg',
  'image/png',
  'image/svg+xml'
];

class ApiError {
  
  #code;

  constructor(code) {
    this.#code = code
  }

  getCode() {
    return this.#code;
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits : {
    fieldNameSize: 100,
    fieldSize    : 10 * 1024,
    fields       : 50,
    fileSize     : 5 * 1024 * 1024,
    files        : 2,
    parts        : Infinity,
    headerPairs  : 2000
  }
});

const uploadFields = [
  { name: 'picture',   maxCount: 1 },
  { name: 'watermark', maxCount: 1 }
];

app.post('/api/watermark', upload.fields(uploadFields), async (req, res, next) => {
  try {
    let pictureFile = req.files["picture"];

    if (pictureFile === undefined || pictureFile === null || pictureFile.length == 0) {
      throw new ApiError(API_ERROR_CODE_NO_PICTURE_PROVIDED);
    }

    pictureFile = pictureFile[0];

    let   customWatermark = req.files["watermark"];
    const watermarkText   = req.body ["text"     ];

    if (customWatermark !== undefined && customWatermark !== null && customWatermark.length !== 0) {
      customWatermark = customWatermark[0];

      const watermarkDescription = new ImageProcessorPictureWatermarkDescription({
        buffer       : customWatermark.buffer,
        mimeType     : customWatermark.mimetype,
        opacity      : parseFloat(req.body["opacity"       ]),
        rotationAngle: parseInt  (req.body["rotation_angle"]),
        densityLevel : parseInt  (req.body["density_level" ])
      });

      const imageProcessorParams = new ImageProcessorParams(pictureFile.buffer, pictureFile.mimetype, watermarkDescription);

      const buffer = await new ImageProcessor().processPicture(imageProcessorParams);

      res.setHeader('Content-Type', pictureFile.mimetype);
      res.setHeader('Content-Disposition', `attachment; filename=${pictureFile.originalname}`);
      res.status   (200);
      res.send     (buffer);
    }
    else if (watermarkText !== undefined && watermarkText !== null) {
      const watermarkDescription = new ImageProcessorTextWatermarkDescription({
        text            :            req.body["text"              ],
        fontFamily      :            req.body["font_family"       ],
        fontSize        : parseInt  (req.body["font_size"         ]),
        fontItalic      :            req.body["font_italic"       ] === "true",
        fontDecorations :            req.body["font_decorations"  ],
        fontWeight      : parseInt  (req.body["font_weight"       ]),
        color           :            req.body["color"             ],
        opacity         : parseFloat(req.body["opacity"           ]),
        strokeColor     :            req.body["stroke_color"      ],
        strokeOpacity   : parseFloat(req.body["stroke_opacity"    ]),
        shadowOffsetX   : parseInt  (req.body["shadow_offset_x"   ]),
        shadowOffsetY   : parseInt  (req.body["shadow_offset_y"   ]),
        shadowBlurRadius: parseInt  (req.body["shadow_blur_radius"]),
        shadowColor     :            req.body["shadow_color"      ],
        shadowOpactity  : parseFloat(req.body["shadow_opacity"    ]),
        rotationAngle   : parseInt  (req.body["rotation_angle"    ]),
        densityLevel    : parseInt  (req.body["density_level"     ])
      });

      const imageProcessorParams = new ImageProcessorParams(pictureFile.buffer, pictureFile.mimetype, watermarkDescription);

      const buffer = await new ImageProcessor().processPicture(imageProcessorParams);

      res.setHeader('Content-Type', pictureFile.mimetype);
      res.setHeader('Content-Disposition', `attachment; filename=${pictureFile.originalname}`);
      res.status   (200);
      res.send     (buffer);
    }
    else {
      throw new ApiError(API_ERROR_CODE_NO_WATERMARK_DATA_PROVIDED);
    }
  }
  catch (e) {
    next(e);
  }
});


// Client

app.get('*', (req, res) => {
  res.send("No GUI available :(");
});


// API Error Codes

const API_ERROR_CODE_GENERIC                        = 1;
const API_ERROR_CODE_INVALID_WATERMARK_TEXT         = 2;
const API_ERROR_CODE_INVALID_IMAGE_BUFFER           = 3;
const API_ERROR_CODE_INVALID_WATERMARK_IMAGE_BUFFER = 4;
const API_ERROR_CODE_TOO_MANY_FIELDS                = 5;
const API_ERROR_CODE_TOO_MANY_FILES                 = 6;
const API_ERROR_CODE_FILE_TOO_LARGE                 = 7;
const API_ERROR_CODE_FIELD_NAME_TOO_LONG            = 8;
const API_ERROR_CODE_FIELD_TOO_LONG                 = 9;
const API_ERROR_CODE_INVALID_FILE_TYPE              = 10;
const API_ERROR_CODE_NO_PICTURE_PROVIDED            = 11;
const API_ERROR_CODE_NO_WATERMARK_DATA_PROVIDED     = 12;


// Error Handling

app.use((err, req, res, next) => {

  let errorCodes = [];
  let status     = 500; // Internal Server Error

  if (err instanceof ApiError) {
    errorCodes.push({ code: err.getCode()});
    status = 400; // Bad request
  }
  else if (err instanceof MulterError) {
    const field = err.field;
    let   errorCode;

    switch (err.code) {
      case 'LIMIT_PART_COUNT':
        // do nothing
        break;
      case 'LIMIT_FILE_SIZE':
        errorCode = API_ERROR_CODE_FILE_TOO_LARGE;
        status    = 413; // Payload Too Large
        break;
      case 'LIMIT_FILE_COUNT':
        errorCode = API_ERROR_CODE_TOO_MANY_FILES;
        status    = 413; // Payload Too Large
        break;
      case 'LIMIT_FIELD_KEY':
        errorCode = API_ERROR_CODE_FIELD_NAME_TOO_LONG;
        status    = 413; // Payload Too Large
        break;
      case 'LIMIT_FIELD_VALUE':
        errorCode = API_ERROR_CODE_FIELD_TOO_LONG;
        status    = 413; // Payload Too Large
        break;
      case 'LIMIT_FIELD_COUNT':
        errorCode = API_ERROR_CODE_TOO_MANY_FIELDS;
        status    = 413; // Payload Too Large
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        errorCode = API_ERROR_CODE_INVALID_FILE_TYPE;
        status    = 415; // Unsupported Media Type
        break;
      default:
        break;
    }

    if (errorCode !== undefined) {
      if (field !== undefined) {
        errorCodes.push({ code: errorCode, data: field });
      }
      else {
        errorCodes.push({ code: errorCode });
      }
    }

  }
  else if (err instanceof ImageProcessorError) {

    const mask                 = err.getMask();
    const watermarkTextErrors  = ImageProcessorErrorMask.IMAGE_PROCESSOR_ERROR_INVALID_WATERMARK_DESCRIPTION_TEXT_TYPE 
                               | ImageProcessorErrorMask.IMAGE_PROCESSOR_ERROR_WATERMARK_DESCRIPTION_TEXT_EMPTY;
    const imageBufferErrors    = ImageProcessorErrorMask.IMAGE_PROCESSOR_ERROR_INVALID_BUFFER_TYPE
                               | ImageProcessorErrorMask.IMAGE_PROCESSOR_ERROR_FAILED_LOADING_IMAGE_FROM_BUFFER;
    const watermarkImageErrors = ImageProcessorErrorMask.IMAGE_PROCESSOR_ERROR_INVALID_WATERMARK_BUFFER_TYPE
                               | ImageProcessorErrorMask.IMAGE_PROCESSOR_ERROR_FAILED_LOADING_WATERMARK_IMAGE_FROM_BUFFER;
    const mimeTypeErrors  = ImageProcessorErrorMask.IMAGE_PROCESSOR_ERROR_INVALID_MIME_TYPE_TYPE
                          | ImageProcessorErrorMask.IMAGE_PROCESSOR_ERROR_UNSUPPORTED_MIME_TYPE
                          | ImageProcessorErrorMask.IMAGE_PROCESSOR_ERROR_INVALID_WATERMARK_MIME_TYPE_TYPE
                          | ImageProcessorErrorMask.IMAGE_PROCESSOR_ERROR_UNSUPPORTED_WATERMARK_MIME_TYPE;

    if ((mask & watermarkTextErrors) != 0) {
      errorCodes.push({ code: API_ERROR_CODE_INVALID_WATERMARK_TEXT });
      status = 400; // Bad Request
    }
    if ((mask & imageBufferErrors) != 0) {
      errorCodes.push({ code: API_ERROR_CODE_INVALID_IMAGE_BUFFER });
      status = 400; // Bad Request
    }
    if ((mask & watermarkImageErrors) != 0) {
      errorCodes.push({ code: API_ERROR_CODE_INVALID_WATERMARK_IMAGE_BUFFER });
      status = 400; // Bad Request
    }
    if ((mask & mimeTypeErrors) != 0) {
      errorCodes.push({ code: API_ERROR_CODE_INVALID_FILE_TYPE });
      status = 415; // Unsupported Media Type
    }

  }

  res.status     (status);
  res.contentType('application/json');
  res.send       (JSON.stringify(errorCodes.length > 0 
    ? { errorCodes } 
    : { errorCodes: [ { code: API_ERROR_CODE_GENERIC } ] }
  ));
});


// Listen to port

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Listening to port: ${PORT}`));
