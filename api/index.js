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

  fileFilter: (req, file, callback) => {
    // if (supportedMimetypes.includes(file.mimetype)) {
      callback(null, true);
    // }
    // else {
    //   callback(new Error(`Unsupported image mimetype: supported mimetypes are ${supportedMimetypes.join(', ')}.`));
    // }
  }

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
      res.contentType(r.mimeType);
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


// Listen to port

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Listening to port: ${PORT}`);
});
