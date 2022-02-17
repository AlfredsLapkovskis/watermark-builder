const express = require('express');
const path    = require('path');
const multer  = require('multer');
const {
  SUPPORTED_MIME_TYPES,
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

const regularUpload = multer({

  storage: multer.memoryStorage(),

  limits : {
    fieldNameSize: 100,
    fieldSize    : 10 * 1024,        // 10Kb
    fields       : 50,
    fileSize     : 10 * 1024 * 1024, // 10Mb
    files        : 10,               // 10 images
    parts        : Infinity,
    headerPairs  : 2000
  },

  fileFilter: (_, file, callback) => callback(null, SUPPORTED_MIME_TYPES.includes(file.mimetype))

});

const customUpload = multer({

  storage: multer.memoryStorage(),

  limits : {
    fieldNameSize: 100,
    fieldSize    : 10 * 1024,        // 10Kb
    fields       : 50,
    fileSize     : 10 * 1024 * 1024, // 10Mb
    files        : 11,               // 10 images + 1 custom watermark
    parts        : Infinity,
    headerPairs  : 2000
  },

  fileFilter: (req, file, callback) => {
    if (supportedMimetypes.includes(file.mimetype)) {
      callback(null, true);
    }
    else {
      callback(new Error(`Unsupported image mimetype: supported mimetypes are ${supportedMimetypes.join(', ')}.`));
    }
  }

});

app.post('/api/watermark', regularUpload.fields([{ name: 'picture', maxCount: 10 }]), async (req, res) => {
  // // console.log();
  // res.contentType('image/png');
  // res.send(req.files['picture'][0]); return;
  // // return;Buffer()
  // return;

  let response = [];

  const imageProcessor = new ImageProcessor();

  for (const file of req.files["picture"]) {
    const originalBuffer = file.buffer;
    const mimeType       = file.mimetype;
    console.log("MIMETYPE", mimeType);
    const watermarkDescription = new ImageProcessorTextWatermarkDescription({ text: "SomeText", fontSize: 50 });

    try {
      const buffer = await imageProcessor.processPicture(new ImageProcessorParams(originalBuffer, mimeType, watermarkDescription));
      response.push({ buffer, mimeType });
      console.log("PROCESSED");
    }
    catch (e) {
      console.log(`ERROR ${e.getMask()}`);
    }
    console.log(`sending response 0${response}`);
  }

  // const buffer = await imageProcessor.processPicture(req.files['picture'][0].buffer, "png");
  
  
  if (response.length > 0) {
    response.forEach(r => {
      res.setHeader('Content-Type', r.mimeType);
      res.setHeader('Content-Disposition', 'attachment; filename=image.png');
      // res.contentType(r.mimeType);
      res.send       (r.buffer);
    });
  }
  else {
    res.status(200); // TODO
  }

  

  // res.contentType('image/png');
  // res.send(buffer);
  // res.send();
});







app.post('/api/watermark/custom', customUpload.fields([{ name: 'picture', maxCount: 10 }, { name: 'watermark', maxCount: 1 }]), (req, res) => {

});


// Client

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});


// API Error Codes

const API_ERROR_CODE_GENERIC                        = 1;
const API_ERROR_CODE_INVALID_WATERMARK_TEXT         = 2;
const API_ERROR_CODE_INVALID_IMAGE_BUFFER           = 3;
const API_ERROR_CODE_INVALID_WATERMARK_IMAGE_BUFFER = 4;
const API_ERROR_CODE_TOO_MANY_FIELDS                = 5;
const API_ERROR_CODE_TOO_MANY_FILES                 = 6;
const API_ERROR_CODE_FILE_TOO_LARGE                 = 7;
const API_ERROR_CODE_TOO_MANY_FILES                 = 8;
const API_ERROR_CODE_FIELD_NAME_TOO_LONG            = 9;
const API_ERROR_CODE_FIELD_TOO_LONG                 = 10;
const API_ERROR_CODE_TOO_MANY_FIELDS                = 11;
const API_ERROR_CODE_INVALID_FILE_TYPE              = 12;


// Error Handling

app.use((err, req, res, next) => {

  let errorCodes = [];
  let status     = 500; // Internal Server Error

  if (err instanceof MulterError) {

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

    if (mask & watermarkTextErrors != 0) {
      errorCodes.push({ code: API_ERROR_CODE_INVALID_WATERMARK_TEXT });
      status = 400; // Bad Request
    }
    if (mask & imageBufferErrors != 0) {
      errorCodes.push({ code: API_ERROR_CODE_INVALID_IMAGE_BUFFER });
      status = 400; // Bad Request
    }
    if (mask & watermarkImageErrors != 0) {
      errorCodes.push({ code: API_ERROR_CODE_INVALID_WATERMARK_IMAGE_BUFFER });
      status = 400; // Bad Request
    }

  }

  res.status     (status);
  res.contentType('application/json');

  if (errors.length > 0) {
    res.send(JSON.stringify({ errorCodes }));
  }
  else {
    res.send(JSON.stringify({ errorCodes: [ API_ERROR_CODE_GENERIC ] }));
  }

});


// Listen to port

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Listening to port: ${PORT}`));
