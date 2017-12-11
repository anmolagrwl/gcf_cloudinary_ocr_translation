const cloudinary = require('cloudinary');
const Vision = require('@google-cloud/vision');
const Translate = require('@google-cloud/translate');

cloudinary.config({
  cloud_name: '<YOUR-CLOUD-NAME>',
  api_key: '<YOUR-API-KEY>',
  api_secret: '<YOUR-API-SECRET>'
});

// Your Google Cloud Platform project ID
const projectId = '<YOUR-PROJECT-ID>';

// Instantiates a client
const translateClient = Translate({
  projectId: projectId
});

// Instantiates a client
const vision = Vision();

// The target language
const target = 'en';

exports.translateImageText = function(req, res){
	let file = req.body.file;
	let fileName = req.body.filename;
  
  uploadToCloudinary(file, fileName).then((uploadResult) => {
    return detectText(uploadResult);
  }).then((ocrResult) => {
    return translateText(ocrResult);
  }).then((response) => {
    res.send(response[0]);
  }).catch((err) => {
    throw err;
  })
}

let uploadToCloudinary = (file, fileName) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(file)
    .then((result) => {
      console.log(`Image file ${fileName} successfully uploaded`);
      resolve(result);
    }).catch((err) => {
      console.error(`Error in uploading image - ${err}`);
      reject(err)
    });
  })
}

let detectText = (cloudinaryResult) => {
  return new Promise((resolve, reject) => {
    let file = cloudinaryResult.url; 
    vision.textDetection({ source: { imageUri: file } })
    .then((results) => {
      resolve(results);
    }).catch((err) => {
      console.error(`Error in detecting text - ${err}`);
      reject(err)
    });
  })
}

let translateText = (ocrResult) => {
  return new Promise((resolve, reject) => {
    let text = ocrResult[0].textAnnotations[0].description;
    console.log(`Sending text for translation - ${text}`);
    translateClient.translate(text, target)
    .then((results) => {
      console.log(`Translation completed`);
      resolve(results);
    }).catch((err) => {
      console.error(`Error in translating text - ${err}`);
      reject(err)
    });
  })
}