const { 
  Canvas, 
  Image,
  registerFont, 
  createImageData,
  createCanvas
} = require('canvas');
const path                     = require('path');
const fs                       = require('fs');


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


// Image Processor

module.exports.processPicture = async function (imageBuffer, imageType) {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload  = _ => {
            const buffer = _processPicture(image, imageType)
            resolve(buffer); //TODO
        };

        image.onerror = error =>  reject(error);
        image.src     = imageBuffer;
    });
}

function _processPicture(image, imageType) {
    const width  = image.width;
    const height = image.height;

    const canvas  = new Canvas(image.width, image.height, 'image');
    const context = canvas.getContext('2d');
    
    context.drawImage(image, 0, 0);

    context.fillStyle = "red";
    // context.textAlign = "center";
    context.font = '30px Roboto';
    
    context.fillText("TEST TEXT", 50, 100);
    
    return canvas.toBuffer();
}