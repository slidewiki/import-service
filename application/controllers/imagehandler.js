'use strict';

let Microservices = require('../configs/microservices');
let rp = require('request-promise-native');

module.exports = {
  sendImageToFileService: function(imgName, zip, jwt) {
    if (!zip.file(imgName)) {
      return new Promise((resolve) => {resolve ('');});
    }
    try {
      let myPromise = new Promise((resolve, reject) => {
        //Get file extension
        const imgNameArray = imgName.split('.');
        const extension = imgNameArray[imgNameArray.length - 1];
        let imageName = '';

        let contentType = 'image/png';
        switch (extension.toLowerCase()) {
          case 'bmp' :
            contentType = 'image/bmp';
            break;
          case 'tiff' :
            contentType = 'image/tiff';
            break;
          case 'jpg' :
            contentType = 'image/jpeg';
            break;
          case 'jpeg' :
            contentType = 'image/jpeg';
            break;
        }

        var options = {
          method: 'POST',
          uri: Microservices.file.uri + '/v2/picture?license=CC0',
          body: new Buffer(zip.file(imgName).asArrayBuffer(), 'base64'),
          headers: {
            '----jwt----': jwt,
            // '----jwt----': 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjMzLCJ1c2VybmFtZSI6InJtZWlzc24iLCJpYXQiOjE0Nzg2OTI3MDZ9.5h-UKLioMYK9OBfoNQVuQ25DhZCJ5PzUYlDXT6SFfBpaKLhpYVmK8w0xE5dOSNzw58qLmxuQHGba_CVI-rPnNQ',
            'content-type': contentType,
            'Accept':  'application/json'
          }
        };

        rp(options)
          .then( (body) => {
            imageName = JSON.parse(body).fileName;
            resolve(Microservices.file.uri + '/picture/' + imageName);
          })
          .catch( (err) => {
            const errorString = String(err);
            let index1 = errorString.indexOf('File already exists and is stored under ');
            let index2 = errorString.indexOf('\"}"');
            if (index1 > -1 && index2 > -1) {
              imageName = errorString.substring(index1 + 40, index2 - 1);
            }
            if (imageName === '') {
              // console.log('Error while saving image', err);
            }
            resolve(Microservices.file.uri + '/picture/' + imageName);
          });
      });

      return myPromise;
    } catch(e) {
      console.log('Error in sendImageToFileService', e);
      return new Promise((resolve) => {resolve ('');});
    }
  },

};
