/*
Handles the requests by executing stuff and replying to the client. Uses promises to get stuff done.
*/

'use strict';
let fs = require('fs');
let rp = require('request-promise-native');

const boom = require('boom');
const config = require('../configuration');
const Microservices = require('../configs/microservices');
let Convertor = require('../PPTX2HTML/js/convertor.js');
let SWHTMLExportConvertor = require('./swhtmlexportconvertor.js');
let pick = require('lodash/pick');

module.exports = {
  //Import uploaded PPTX and transform to HTML via PPTX2HTML  or return ERROR
  //TODO: can I run client-side non ES6 javascript in node.js?
  //pptx2html/js/pptx2html.js uses document.ready / Jquery
  //TODO: find out how use of reveal.js in PPTX2HTML works together with our use of
  // reveal.js in slidewiki-platform frontend work by Huw on slide viewer.
  importPPTX: function(request, reply) {
    const jwt = request.auth.token;
    const user = request.auth.credentials.userid;

    let language = request.payload.language;
    if (language === undefined || language === null || language === '') {
      language = 'en_GB';
    }
    const license = request.payload.license;
    const title = (request.payload.title !== undefined) ? request.payload.title : '';
    const description = request.payload.description;
    const tags = (request.payload.tags !== undefined) ? JSON.parse(request.payload.tags) : [];
    const theme = (request.payload.theme !== undefined) ? request.payload.theme : '';
    const fileName = request.payload.filename;
    const fileNameSplit = fileName.split('.');
    const deckName = (title !== '') ? title : fileNameSplit[0];
    const fileType = fileNameSplit[fileNameSplit.length - 1];

    let data_url = request.payload.file;
    let buffer = new Buffer(data_url.split(',')[1], 'base64');

    if (fileType.toLowerCase() === 'odp' ) {
      //SEND TO docker-unoconv-webservice, to convert it to pptx
      let formdata = require('form-data');
      let form = new formdata();
      form.append('file', buffer, {
        filename: fileName,
        contentType: 'application/vnd.oasis.opendocument.presentation'
      });
      form.append('contentType', 'application/vnd.oasis.opendocument.presentation');

      form.submit({
        port: Microservices.unoconv.port,
        host: Microservices.unoconv.host,
        path: Microservices.unoconv.path,
        protocol: Microservices.unoconv.protocol,
        timeout: 20 * 1000
      }, (err, res) => {
        if (err) {
          console.error(err);
        }
        let data = '';
        res.setEncoding('binary');

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          createDeckFromPPTX(new Buffer(data, 'binary'), user, jwt, language, license, deckName, description, tags, theme, request, reply);
        });
      });
    } else if (fileType.toLowerCase() === 'zip' ) {
      createDeckFromSWHTMLExport(buffer, user, jwt, language, license, deckName, description, tags, theme, request, reply);
    } else {// pptx
      createDeckFromPPTX(buffer, user, jwt, language, license, deckName, description, tags, theme, request, reply);
    }
  },

  importImage: function(request, reply) {
    const filename = request.payload.upload.hapi.filename;
    const userid = request.params.jwt;// changed userid to jwt in routes - testing here for backward compatibility (when platform sends userid)
    // prevent problems with Cross Origin Resource Sharing when import service returns script
    // set document domain to a suffix of the current domain
    // see https://stackoverflow.com/questions/3076414/ways-to-circumvent-the-same-origin-policy
    // TODO: use Cross-Origin Resource Sharing method, e.g., using https://dev.ckeditor.com/ticket/13475
    let domain = Microservices.import.uri.substring(Microservices.import.uri.indexOf('.')+1);
    // image upload expects that fileservice runs on same domain,
    // otherwise Cross-Origin Resource Sharing method is necessary

    if (String(userid).length < 10) {// old way of managing images - save to shared folder
      const filePath = saveImageToFile(filename, request.payload.upload._data, userid);
      let content = '<script type="text/javascript">\n';
          //       Save problem with Same-origin_policy when CKeditor image upload script is returned
          //       https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy
      content += 'document.domain = "'+ domain +'";\n';
      content += 'window.parent.CKEDITOR.tools.callFunction('+ request.query.CKEditorFuncNum + ' , "' + filePath + '", "" );\n';
      content += '</script>';
      reply(content);
    } else {// new way - use the file-service API
      const jwt = request.params.jwt;
      sendImageToFileService(filename, request.payload.upload._data, jwt).then((filePath) => {

        let content = '<script type="text/javascript">\n';
        content += 'document.domain = "'+ domain +'";\n';
        content += 'window.parent.CKEDITOR.tools.callFunction('+ request.query.CKEditorFuncNum + ' , "' + filePath + '", "" );\n';
        content += '</script>';
        reply(content);
      }).catch((err) => {
        request.log('error', err);
        reply(boom.badImplementation());
      });
    }
  },
  importImagePaste: function(request, reply) { // Klaas - SWIK-1132 - for image paste in CKeditor
    const filename = request.payload.upload.hapi.filename;
    const userid = request.params.jwt;// changed userid to jwt in routes- testing here for backward compatibility (when platform sends userid)
    if (String(userid).length < 10) {// old way of managing images - save to shared folder
      const filePath = saveImageToFile(filename, request.payload.upload._data, userid);
      let content = '{ "uploaded": 1, "fileName": "'+filename+'", "url": "'+filePath+'" }';
      reply(content);
    } else {// new way - use the file-service API
      const jwt = request.params.jwt;
      sendImageToFileService(filename, request.payload.upload._data, jwt).then((filePath) => {
        let content = '{ "uploaded": 1, "fileName": "'+filename+'", "url": "'+filePath+'" }';
        reply(content);
      }).catch((err) => {
        request.log('error', err);
        reply(boom.badImplementation());
      });
    }
  }
};

function createDeckFromPPTX(buffer, user, jwt, language, license, deckName, description, tags, theme, request, reply) {
  let convertor = new Convertor.Convertor();
  convertor.user = user;
  convertor.jwt = jwt;

  return convertor.convertFirstSlide(buffer).then((result) => {
    const noOfSlides = result.noOfSlides;
    const slideSize = (result.slideSize) ? result.slideSize : {'width': 0, 'height': 0};

    return createDeck({
      user,
      language,
      license,
      deckName,
      description,
      tags,
      theme,
      firstSlide: result,
      authToken: jwt,
      slideDimensions: slideSize
    }).then((deck) => {
      reply('import completed').header('deckId', deck.id).header('noOfSlides', noOfSlides);
      let deckId = String(deck.id) + '-1';
      if (noOfSlides > 1) {
        convertor.processPPTX(buffer).then((result) => {
          let slides = result;
          return findFirstSlideOfADeck(deckId).then((slideId) => {
            //create the rest of slides
            createNodesRecursive(license, deckId, slideId, slides, 1, jwt);
          }).catch((error) => {
            request.log('error', error);
            reply(boom.badImplementation());
          });
        }).catch((err) => {
          console.log('Error processingPPTX: ' + err);
        });
      }
    }).catch((error) => {
      request.log('error', error);
      reply(boom.badImplementation());
    });
  }).catch((err) => {
    console.log('Error /first slide: ' + err);
  });
}

function createDeckFromSWHTMLExport(buffer, user, jwt, language, license, deckName, description, tags, theme, request, reply) {

  let swHTMLExportConvertor = new SWHTMLExportConvertor.SWHTMLExportConvertor();
  swHTMLExportConvertor.user = user;

  let convertResults = swHTMLExportConvertor.convertHTMLExport(buffer);
  let slides = convertResults.slides;
  let firstSlide = slides[0];
  const slideSize = (convertResults.slideSize) ? convertResults.slideSize : {'width': 0, 'height': 0};
  const noOfSlides = slides.length;

  //handle images in the first slide
  swHTMLExportConvertor.extractAndConvertImages(firstSlide.content, buffer, jwt).then((content) => {
    firstSlide.content = content;
    return createDeck({
      user,
      language,
      license,
      deckName,
      description,
      tags,
      theme,
      firstSlide: firstSlide,
      authToken: jwt,
      slideDimensions: slideSize
    }).then((deck) => {
      reply('import completed').header('deckId', deck.id).header('noOfSlides', noOfSlides);
      let deckId = String(deck.id) + '-1';
      if (noOfSlides > 1) {
        return findFirstSlideOfADeck(deckId).then((slideId) => {
          //create the rest of slides
          convertImagesAndCreateNodesRecursive(license, deckId, slideId, slides, 1, jwt, buffer, swHTMLExportConvertor);
        }).catch((error) => {
          request.log('error', error);
          reply(boom.badImplementation());
        });
      }
    }).catch((error) => {
      request.log('error', error);
      reply(boom.badImplementation());
    });
  }).catch((error) => {
    console.log('Error createDeckFromSWHTMLExport extractAndConvertImages: ' + error);
  });

}

function saveImageToFile(imgName, file, user) {
  //Create UUID
  let uuid = require('node-uuid');
  const uuidValue = uuid.v1();// Generate a v1 (time-based) id

  //Get file extension
  const imgNameArray = imgName.split('.');
  const extension = imgNameArray[imgNameArray.length - 1];

  const imgUserPath = user + '/' + uuidValue + '.' + extension;
  // const saveTo = '.' + Microservices.file.shareVolume + '/' + imgUserPath;// For localhost testing
  const saveTo = Microservices.file.shareVolume + '/' + imgUserPath;

  //Create the user dir if does not exist
  // const userDir = '.' + Microservices.file.shareVolume + '/' + user;// For localhost testing
  const userDir = Microservices.file.shareVolume + '/' + user;
  if (!fs.existsSync(userDir)){
    fs.mkdirSync(userDir, 744, (err) => {
      if(err) {
        console.log(err);
      }
    });
  }

  //Save file
  let fileStream = fs.createWriteStream(saveTo);
  fileStream.write(file, 'binary');
  fileStream.end();
  fileStream.on('error', (err) => {
    console.log('error', err);
  });
  fileStream.on('finish', () => {
    console.log('upload completed');
  });

  return Microservices.file.uri + '/' + imgUserPath;
}

function sendImageToFileService(imgName, data, jwt) {
  let myPromise = new Promise((resolve) => {
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

    let options = {
      method: 'POST',
      uri: Microservices.file.uri + '/picture?license=CC0',
      body: data,
      headers: {
        '----jwt----': jwt,
        // '----jwt----': 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjMzLCJ1c2VybmFtZSI6InJtZWlzc24iLCJpYXQiOjE0Nzg2OTI3MDZ9.5h-UKLioMYK9OBfoNQVuQ25DhZCJ5PzUYlDXT6SFfBpaKLhpYVmK8w0xE5dOSNzw58qLmxuQHGba_CVI-rPnNQ',
        'content-type': contentType,
        'Accept':  'application/json'
      }
    };

    rp(options)
      .then( (body) => {
        console.log('res', body);
        imageName = JSON.parse(body).fileName;
        resolve(Microservices.file.uri + '/picture/' + imageName);
      })
      .catch( (err) => {
        console.log('err', err);
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
}

function createNodesRecursive(license, deckId, previousSlideId, slides, index, authToken) {

  let selector = {
    'id': deckId,
    'spath': previousSlideId + ':' + String(index + 1),
    'sid': previousSlideId,
    'stype': 'slide'
  };
  let nodeSpec = {
    'id': '0',
    'type': 'slide'
  };

  createSlide({
    selector,
    nodeSpec,
    slide: slides[index],
    slideNo: String(index + 1),
    license,
    authToken,
  }).then((node) => {
    if (index >= slides.length - 1) {//Last one
      return;
    } else {
      createNodesRecursive(license, deckId, node.id, slides, (index + 1), authToken);
    }
  }).catch((error) => {
    console.log('Error createNodesRecursive: ' + error);
  });
}

function convertImagesAndCreateNodesRecursive(license, deckId, previousSlideId, slides, index, authToken, buffer, swHTMLExportConvertor) {

  let selector = {
    'id': deckId,
    'spath': previousSlideId + ':' + String(index + 1),
    'sid': previousSlideId,
    'stype': 'slide'
  };
  let nodeSpec = {
    'id': '0',
    'type': 'slide'
  };

  let slide = slides[index];
  swHTMLExportConvertor.extractAndConvertImages(slide.content, buffer, authToken).then((content) => {
    slide.content = content;
    createSlide({
      selector,
      nodeSpec,
      slide: slide,
      slideNo: String(index + 1),
      license,
      authToken,
    }).then((node) => {
      if (index >= slides.length - 1) {//Last one
        return;
      } else {
        convertImagesAndCreateNodesRecursive(license, deckId, node.id, slides, (index + 1), authToken, buffer, swHTMLExportConvertor);
      }
    }).catch((error) => {
      console.log('Error convertImagesAndCreateNodesRecursive create slide: ' + error);
    });
  }).catch((error) => {
    console.log('Error convertImagesAndCreateNodesRecursive extractAndConvertImages: ' + error);
  });
}

//Send a request to insert a new deck with the first slide
function createDeck(options) {
  let {user, language, license, deckName, description, tags, theme, firstSlide, authToken} = options;

  //Send a request to insert a new deck with the first slide
  let myPromise = new Promise((resolve, reject) => {
    let firstSlideTitle = '';
    if (firstSlide.title && firstSlide.title !== ''){
      firstSlideTitle = firstSlide.title;
    } else if (firstSlide.ctrTitle && firstSlide.ctrTitle !== ''){
      firstSlideTitle = firstSlide.ctrTitle;
    } else if (firstSlide.subTitle && firstSlide.subTitle !== ''){
      firstSlideTitle = firstSlide.subTitle;
    }
    firstSlideTitle = firstSlideTitle.trim();
    if (firstSlideTitle.length > 100) {
      firstSlideTitle = firstSlideTitle.substring(0,99) + '...';
    }
    // prepare tag data to send to deck service
    let tagsPromise = Promise.resolve([]);
    if (tags && tags.length) {
      // send tags to tag-service
      tagsPromise = rp.post({
        uri: Microservices.tag.uri + '/tag/upload',
        json: true,
        body: {
          user: user,
          tags: tags,
        }
      }).then((receivedtags) => receivedtags.map((t) => pick(t, 'tagType', 'tagName', 'defaultName')));
      // TODO maybe catch an error here ?
    }

    let jsonData = {
      language: language,
      license: license,
      title: deckName,
      description: description,
      translation: {
        status: 'original'
      },
      tags: [],
      theme: theme,
      first_slide: {
        content: firstSlide.content,
        title: (firstSlideTitle !== '') ? firstSlideTitle : 'Slide 1',//It is not allowed to be empty
        speakernotes: firstSlide.notes
      }
    };

    if (firstSlide.notes === '') {//It is not allowed for speakernotes to be empty
      delete jsonData.speakernotes;
    }

    let headers = {};
    headers[config.JWT.HEADER] = authToken;
    
    tagsPromise.then((receivedtags) => {
      jsonData.tags = receivedtags;
      rp.post({
        uri: Microservices.deck.uri + '/deck/new',
        body: jsonData,
        json: true,
        headers,
      }).then((newDeck) => {
        resolve(newDeck);
      }).catch((err) => {
        console.log('Error', err);
        reject(err);
      });
    }).catch((err) => {
      console.log('Error', err);
      //if tags promisses failed, create a deck without tags
      rp.post({
        uri: Microservices.deck.uri + '/deck/new',
        body: jsonData,
        json: true,
        headers,
      }).then((newDeck) => {
        resolve(newDeck);
      }).catch((err) => {
        console.log('Error', err);
        reject(err);
      });
    });
  });

  return myPromise;
}

function createSlide(options) {
  let {selector, nodeSpec, slide, slideNo, license, authToken} = options;

  let myPromise = new Promise((resolve) => {
    if (slide.content === undefined || slide.content === '') {
      console.log('Error in createSlide - invalid slide', slideNo);
      resolve({id: selector.sid.substring(0, selector.sid.length - 2)});// invalid slide, continue without it
    }
    let title = '';
    if (slide.title && slide.title !== ''){
      title = slide.title;
    } else if (slide.ctrTitle && slide.ctrTitle !== ''){
      title = slide.ctrTitle;
    } else if (slide.subTitle && slide.subTitle !== ''){
      title = slide.subTitle;
    }
    title = title.trim();

    if (title.length > 100) {
      title = title.substring(0,99) + '...';
    }

    let jsonData = {
      selector: selector,
      nodeSpec: nodeSpec,
      content: slide.content,
      title: (title !== '') ? title : ('Slide ' + slideNo),//It is not allowed to be empty
      speakernotes: slide.notes,
      license: license
    };

    if (slide.notes === '') {//It is not allowed for speakernotes to be empty
      delete jsonData.speakernotes;
    }

    let headers = {};
    headers[config.JWT.HEADER] = authToken;

    rp.post({
      uri: Microservices.deck.uri + '/decktree/node/create',
      body: jsonData,
      json: true,
      headers,
    }).then((newDeckTreeNode) => {
      resolve(newDeckTreeNode);
    }).catch((err) => {
      console.log('Error createSlide', err);
      resolve(slide);//skip this slide which has errored and continue import
    });
  });

  return myPromise;
}

function findFirstSlideOfADeck(deckId) {
  //Find the id of the first slidedata
  let myPromise = new Promise((resolve, reject) => {
    rp.get({uri: Microservices.deck.uri + '/decktree/' + deckId}).then((res) => {
      try {
        let parsed = JSON.parse(res);
        let slideId = parsed.children[0].id;

        resolve(slideId);
      } catch(e) {
        console.log(e);
        reject(e);
      }
    }).catch((err) => {
      console.log('Error', err);
      reject(err);
    });
  });

  return myPromise;
}
