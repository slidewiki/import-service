/*
Handles the requests by executing stuff and replying to the client. Uses promises to get stuff done.
*/

'use strict';
let fs = require('fs');
let he = require('he');
let rp = require('request-promise-native');

const Microservices = require('../configs/microservices');
let Convertor = require('../PPTX2HTML/js/convertor.js');

//const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
  //slideDB = require('../database/slideDatabase'), //Database functions specific for slides
  //co = require('../common');
//pptx2html =
//require('../PPTX2HTML/js/pptx2html');

//import pptx2html from '../PPTX2HTML/js/pptx2html';

module.exports = {
  //Import uploaded PPTX and transform to HTML via PPTX2HTML  or return ERROR
  //TODO: can I run client-side non ES6 javascript in node.js?
  //pptx2html/js/pptx2html.js uses document.ready / Jquery
  //TODO: find out how use of reveal.js in PPTX2HTML works together with our use of
  // reveal.js in slidewiki-platform frontend work by Huw on slide viewer.
  importPPTX: function(request, reply) {
    //request.log('ImportPPTX', 'ImportPPTX service called');
    //TODO: call PPTX2HTML - test with PTTX2HTML/files/test.pptx
    //pptx2html
    //reply(request.payload.file);
    //request.log('ImportPPTX', 'ImportPPTX service called' + request.payload.file);
    //console.log('ImportPPTX data' + request.payload.file);

//see https://github.com/risis-eu/risis-datasets/blob/master/plugins/upload/handleUpload.js#L99
// for example of reading a superagent request
    //!!!request.body!!!
    //console.log('file sent to service: ' + request.payload.file);
    //console.log('file sent to service: ' + request.body);
    //console.log('file sent to service: ' + request.data);
    //console.log('file sent to service: ' + request.content);
    //console.log('file sent to service: ' + request.content.file);
    //evt.target.files[0]

    //console.log(request.payload.file); //<Buffer 50 4b 03 04
    //console.log(request.payload); //{ file: <Buffer 50 4b 0
    // console.log(request.params); // {}
    //console.log('file sent to service: request.payload' + request.payload); [object object]
    //console.log('file sent to service: request.params' + request.params);
    //console.log('file sent to service: request.file' + request.file);

    //we should be abe to read request.files.file.data
    //TODO: try multipart multipart/form-data?
    // SEE RISIS SERVER.JS FOR EXAMPLE
    //console.log('file sent to service: request.files.file.size' + request.files.file.data);
    //console.log('file sent to service: request.params.files.file.size' + request.files.file.size);
    //console.log(util.inspect(request.params, {showHidden: true, depth: 100}));
    // console.log(util.inspect(request.payload.file.data, {showHidden: true, depth: 100})); //undefined
    // console.log(util.inspect(request.payload.file, {showHidden: true, depth: 100})); ////<Buffer 50 4b 03 04
    // console.log(util.inspect(request.payload, {showHidden: true, depth: 100}));//{ file: <Buffer 50 4b 0

    //req.params.name
    //console.log('file sent to service: request.payload.size: ' + request.payload.size);
    //console.log('file sent to service: request.payload.files.file.size' + request.payload.files.file.size);
    //console.log('file sent to service: request.payload.files.file.data' + request.payload.files.file.data);
    //console.log('file sent to service: request.files.file.size' + request.files.file.size);
    //console.log('file sent to service: request.files.file.data' + request.files.file.data);
    //console.log('file sent to service: request.payload[0]' + request.payload[0]);
    //console.log('file sent to service: request.payload.files[0]' + request.payload.files[0]);
    //console.log('file sent to service request.payload.form: ' + request.payload.form);
    //console.log('file sent to service request.payload.data: ' + request.payload.data);
    //console.log('file sent to service request.payload.file: ' + request.payload.file);
    //console.log('file sent to service request.payload.file.data: ' + request.payload.file.data);
        //console.log('file sent to service request.payload.file: ' + request.payload.file);
    //console.log('file sent to service request.payload.File: ' + request.payload.File);
    //console.log('file sent to service request.payload.filename: ' + request.payload.filename);
    //console.log(util.inspect(request.payload, {showHidden: true, depth: 100}));
    //console.log(util.inspect(request.payload.file, {showHidden: true, depth: 100}));
    //console.log(util.inspect(request.payload.files, {showHidden: true, depth: 100}));
    //reply('request.payload: ' + request.payload);
    //console.log('file sent to service: ' + request.payload.file);
    //console.log('file sent to service: ' + request.payload.body);
    //console.log('file sent to service: ' + request.payload.data);
    //console.log('file sent to service: ' + request.payload.content);
    //pptx2html.convert(request.payload.file);
    //let result = pptx2html.convert(request.params);
    //let file = evt.target.files[0];
    //this.props.ImportStore.file = file;

    //let result = pptx2html.convert(request.payload.file);
    //let result = pptx2html.convert(request.body);
    //let result = pptx2html.convert(request.data);
    //let result = pptx2html.convert(request.content);
    //let result = pptx2html.convert(request.payload[0]);
    //console.log(pptx2html.convert(result));
    //console.log(pptx2html.convert(request.payload.file.data));
    //console.log(pptx2html.convert(request.payload.data)); // Uncaught error: cannot read as File: undefined
    //console.log(pptx2html.convert(request.payload)); // Error: Uncaught error: cannot read as File: {"file":{"type":"Buffer","data":[8
    //request.payload.file.data
    //console.log(
    //console.log(fs.readFile(request.payload.file));
    //let test = request.payload.file;
    //console.log(pptx2html.convert(test)); //Error: Uncaught error: cannot read as File: {"type":"Buffer","data":[80,75,3,4,20,0,6,0,8,

    //console.log(pptx2html.convert(request.payload.file[0])); // Uncaught error: cannot read as File: 80
    //console.log(pptx2html.convert(request.payload.files[0])); Cannot read property '0' of undefined
    //console.log(pptx2html.convert(request.payload.file.files[0])); Uncaught error: Cannot read property '0' of undefined
    //console.log(pptx2html.convert(request.payload.files.files)); Cannot read property 'files' of undefined

    const user = request.payload.user;
    let language = request.payload.language;
    if (language === undefined || language === null || language === '') {
      language = 'en_GB';
    }
    const license = request.payload.license;
    const fileName = he.encode(request.payload.filename, {allowUnsafeSymbols: true});//encode special characters
    const fileNameSplit = fileName.split('.');
    const deckName = fileNameSplit[0];
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

      let request1 = form.submit({
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

        res.on('data', function(chunk){
          data += chunk;
        });

        res.on('end', function(){
          createDeckFromPPTX(new Buffer(data, 'binary'), user, language, license, deckName, request, reply);
        });
        // console.log('result of call to unoconv service', res.headers, res.statusCode);
      });
    } else {
      createDeckFromPPTX(buffer, user, language, license, deckName, request, reply);
    }
  },

  importImage: function(request, reply) { // Klaas added this to test image upload
    //console.log('request.params.CKEditorFuncNum' + request.params.CKEditorFuncNum); // {}
    //console.log('request.query.CKEditorFuncNum' +request.query.CKEditorFuncNum);

    //console.log('file sent to service: request.files.file.size' + request.files.file.data);
    //console.log('file sent to service: request.params.files.file.size' + request.files.file.size);
    //console.log(util.inspect(request.params, {showHidden: true, depth: 100}));
    //console.log(util.inspect(request.payload.file.data, {showHidden: true, depth: 100})); //undefined
    //console.log(util.inspect(request.payload.file, {showHidden: true, depth: 100})); ////<Buffer 50 4b 03 04
    //console.log(util.inspect(request.payload, {showHidden: true, depth: 100}));//{ file: <Buffer 50 4b 0
    //console.log(util.inspect(request.payload.filename, {showHidden: true, depth: 100}));//{ file: <Buffer 50 4b 0
//http://stackoverflow.com/questions/4295782/how-do-you-extract-post-data-in-node-js --> does not seem to work
//https://github.com/expressjs/node-multiparty

//http://stackoverflow.com/questions/21823379/how-to-upload-files-using-nodejs-and-hapi#24521136

    //TODO use multer?
    //https://www.npmjs.com/package/multer

    //req.params.name
    //console.log('file sent to service: request.payload.size: ' + request.payload.size);
    //console.log('file sent to service: request.payload.files.file.size' + request.payload.files.file.size);
    //const user = request.payload.user;
    //const license = request.payload.license;
    //const fileName = request.payload.filename;
    //console.log('filename: '+ request.payload.filename);
    /*
    const fileName = request.payload.filename;
    let saveTo = './' + fileName;
    let fileStream = fs.createWriteStream(saveTo);
    ////fileStream.write(request.payload.file.data);
    //fileStream.write(request.payload.file, 'binary');
    //fileStream.write(request.payload["upload"], 'binary');
    fileStream.write(request.payload.upload);
    fileStream.end();
    fileStream.on('error', (err) => {
      reply('error in upload!');
      console.log('error', err);
    });
    fileStream.on('finish', (res) => {
      // reply('upload completed!');
      console.log('upload completed');
    });
    */

    //const fileName = request.payload.filename;
    //let saveTo = './' + fileName;
    //let saveTo = './' + request.payload.filename;
    //let saveTo = './uploaded/' + fileName;
    //console.log('saved to:' + saveTo);
    //console.log('request.params.filename'+  request.params.filename);
    //console.log('request.query.filename'+  request.query.filename);
    //console.log('request.payload["filename"]'+  request.payload["filename"]);
    //request.payload["upload"].pipe(fs.createWriteStream("./uploaded/test.png")); //this already works.
    //request.payload["upload"].pipe(fs.createWriteStream('temp.data')); //this already works.
    //request.payload["upload"].pipe(fs.createWriteStream(saveTo));

    //console.log('request.payload[upload]' + request.payload['upload']);
    //console.log('request.payload.upload' + request.payload.upload);
    //console.log(util.inspect(request.payload.upload, {showHidden: true, depth: 100})); //undefined
    //console.log(util.inspect(request.payload['upload'], {showHidden: true, depth: 100})); //undefined

    //console.log(util.inspect(request.payload.upload.data, {showHidden: true, depth: 100})); //undefined
    //console.log(util.inspect(request.payload.upload._data, {showHidden: true, depth: 100})); //undefined
    //console.log(util.inspect(request.payload.upload.hapi.filename, {showHidden: true, depth: 100})); //undefined
    //let fileStream = fs.createWriteStream(saveTo);
    ////fileStream.write(request.payload.file.data);
    //fileStream.write(request.payload.file, 'binary');
    //fileStream.end();
    //fileStream.on('error', (err) => {
    /*
    request.payload["upload"].on('error', (err) => {
      reply('error in upload!');
      console.log('error', err);
    });
    //fileStream.on('finish', (res) => {
    request.payload["upload"].on('finish', (res) => {
      // reply('upload completed!');
      console.log('upload completed');
    });
    */



    // //TODO - create unique filename
    // //let saveTo = './' + request.payload.filename;
    // let saveTo = './uploaded/' + request.payload.upload.hapi.filename;
    // let fileStream = fs.createWriteStream(saveTo);
    // //fileStream.write(request.payload.file.data);
    // //fileStream.write(request.payload.file, 'binary');
    // fileStream.write(request.payload.upload._data); //this saves to file 'undefined'
    // fileStream.end();
    // fileStream.on('error', (err) => {
    //   reply('error in upload!');
    //   console.log('error', err);
    // });
    // fileStream.on('finish', (res) => {
    //     console.log('upload completed');
    //   });


      //Use saveImageToFile function

    const filename = request.payload.upload.hapi.filename;
    const userid = request.params.userid;
    const filePath = saveImageToFile(filename, request.payload.upload._data, userid);


        ///JSON ONLY FOR DRAGGING and dropping
      //let response;
      //response.writeHead(200, {'Content-Type': 'application/json'});
      //let json = JSON.stringify({
        //'uploaded': 1,
        //'fileName': 'logo_full.png',
        //'url': 'http://platform.manfredfris.ch/assets/images/logo_full.png'
      //});
      //response.end(json);
      //console.log(json);
      //reply (json);
      // JSON ONLY FOR DRAGGING and dropping  - http://stackoverflow.com/questions/33197058/ckeditor-can-not-parse-json-response
      //reply ({
        //'uploaded': '1',
        //'fileName': 'logo_full.png',
        //'url': 'http://platform.manfredfris.ch/assets/images/logo_full.png'
        //});

    let content = '<script type="text/javascript">\n';
        //content += "window.parent.CKEDITOR.tools.callFunction(1, 'http://platform.manfredfris.ch/assets/images/logo_full.png', '' );\n";
        //content += "window.opener.CKEDITOR.tools.callFunction(1, 'http://platform.manfredfris.ch/assets/images/logo_full.png', '' );\n";
        //content += "CKEDITOR.instances.inlineContent.tools.callFunction(1, 'http://platform.manfredfris.ch/assets/images/logo_full.png', '' );\n";
        //content += "window.parent.CKEDITOR.instances.inlineContent.tools.callFunction(1, 'http://platform.manfredfris.ch/assets/images/logo_full.png', '' );\n";
        //window.parent.CKEDITOR

        //       Save problem with Same-origin_policy when CKeditor image upload script is returned
        //       https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy
    content += 'document.domain = "slidewiki.org";\n';

        //content += request.params.CKEditor + ".tools.callFunction("+ request.params.CKEditorFuncNum + " , 'http://platform.manfredfris.ch/assets/images/logo_full.png', '' );\n";
        //content += "window.parent.CKEDITOR.tools.callFunction("+ request.query.CKEditorFuncNum + " , 'http://platform.manfredfris.ch/assets/images/logo_full.png', '' );\n";
        // content += 'window.parent.CKEDITOR.tools.callFunction('+ request.query.CKEditorFuncNum + ' , "http://platform.manfredfris.ch/assets/images/logo_full.png", "" );\n';
    content += 'window.parent.CKEDITOR.tools.callFunction('+ request.query.CKEditorFuncNum + ' , "' + filePath + '", "" );\n';

        //CKEDITOR.instances.inlineContent
        //content += "alert('test');\n"; //WORKS!

        //SEARCH FOR ALTERNATIVES!!

    content += '</script>';
        //reply('<script type="text/javascript">window.parent.CKEDITOR.tools.callFunction(1, "http://platform.manfredfris.ch/assets/images/logo_full.png", "");</script>);');
    reply(content);

        //TODO check if image file is uploaded.
        //TODO send call to media service + user service to store media data of uploaded image file
      // reply('upload completed!');
      //reply(response);
      //reply (pptx2html.convert(request.payload.file));

      //SEE http://docs.ckeditor.com/#!/guide/dev_file_browser_api
      //console.log('upload completed');
    //});

  },
  importImagePaste: function(request, reply) { // Klaas - SWIK-1132 - for image paste in CKeditor
    const filename = request.payload.upload.hapi.filename;
    const userid = request.params.userid;
    const filePath = saveImageToFile(filename, request.payload.upload._data, userid);

    /*let content = '<script type="text/javascript">\n';
    content += 'document.domain = "slidewiki.org";\n';
    content += 'window.parent.CKEDITOR.tools.callFunction('+ request.query.CKEditorFuncNum + ' , "' + filePath + '", "" );\n';
    content += '</script>';*/

    content = '{ "uploaded": 1, "fileName": "'+filename+'", "url": "'+filePath+'" }';
        //reply('<script type="text/javascript">window.parent.CKEDITOR.tools.callFunction(1, "http://platform.manfredfris.ch/assets/images/logo_full.png", "");</script>);');
    reply(content);

  }
};

function createDeckFromPPTX(buffer, user, language, license, deckName, request, reply) {
  let convertor = new Convertor.Convertor();
  convertor.user = user;

  let initialResult = convertor.convertFirstSlide(buffer);
  let firstSlide = initialResult.firstSlide;
  const noOfSlides = initialResult.noOfSlides;

  return createDeck(user, language, license, deckName, firstSlide).then((deck) => {
    reply('import completed').header('deckId', deck.id).header('noOfSlides', noOfSlides);

    if (noOfSlides > 1) {
      let slides = convertor.processPPTX(buffer);
      findFirstSlideOfADeck(deck.id).then((slideId) => {
        //create the rest of slides
        createNodesRecursive(user, license, deck.id, slideId, slides, 1);
      }).catch((error) => {
        request.log('error', error);
        reply(boom.badImplementation());
      });
    }
  }).catch((error) => {
    request.log('error', error);
    reply(boom.badImplementation());
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
    fs.mkdirSync(userDir, 744, function(err) {
      if(err) {
        console.log(err);
      }
    });
  }

  //Save file
  let fileStream = fs.createWriteStream(saveTo);

  //fileStream.write(request.payload.file.data);
  fileStream.write(file, 'binary');
  fileStream.end();
  fileStream.on('error', (err) => {
    reply('error in upload!');
    console.log('error', err);
  });
  fileStream.on('finish', (res) => {
    console.log('upload completed');
  });

    //  return 'http://' + Microservices.file.uri + '/' + imgUserPath;
  return Microservices.file.uri + '/' + imgUserPath;
}


function createNodesRecursive(user, license, deckId, previousSlideId, slides, index) {
  let selector = {
    'id': String(deckId) + '-1',
    'spath': String(previousSlideId) + '-1:' + String(index + 1),
    'sid': String(previousSlideId) + '-1',
    'stype': 'slide'
  };
  let nodeSpec = {
    'id': '0',
    'type': 'slide'
  };

  createSlide(selector, nodeSpec, user, slides[index], String(index + 1), license).then((node) => {
    if (index >= slides.length - 1) {//Last one
      return;
    } else {
      createNodesRecursive(user, license, deckId, node.id, slides, (index + 1));
    }
  }).catch((error) => {
    request.log('error', error);
    reply(boom.badImplementation());
  });
}

//Send a request to insert a new deck with the first slide
function createDeck(user, language, license, deckName, firstSlide) {
  let myPromise = new Promise((resolve, reject) => {
    let title = (firstSlide.title !== '') ? firstSlide.title : (firstSlide.ctrTitle !== '') ? firstSlide.ctrTitle : firstSlide.subTitle;
    title = title.trim();
    if (title.length > 100) {
      title = title.substring(0,99) + '...';
    }
    let firstSlideTitle = replaceSpecialSymbols(title);//deck tree does not display some encoded symbols properly
    firstSlideTitle = he.encode(firstSlideTitle, {allowUnsafeSymbols: true});//encode some symbols which were not replaced
    //Encode special characters (e.g. bullets)
    let encodedFirstSlideContent = he.encode(firstSlide.content, {allowUnsafeSymbols: true});
    let encodedFirstSlideNotes = he.encode(firstSlide.notes, {allowUnsafeSymbols: true});

    let jsonData = {
      user: user,
      language: language,
      license: license,
      title: deckName,
      first_slide: {
        content: encodedFirstSlideContent,
        title: (firstSlideTitle !== '') ? firstSlideTitle : 'Slide 1',//It is not allowed to be empty
        speakernotes:encodedFirstSlideNotes
      }
    };

    if (firstSlide.notes === '') {//It is not allowed for speakernotes to be empty
      delete jsonData.speakernotes;
    }

    let data = JSON.stringify(jsonData);
    rp.post({uri: Microservices.deck.uri + '/deck/new', body:data}).then((res) => {

      try {
        let newDeck = JSON.parse(res);
        resolve(newDeck);
      } catch(e) {
        console.log(e);
        reject(e);
      }

    }).catch((err) => {
      console.log('Error', err);
      reject(e);
    });
  });

  return myPromise;
}

function createSlide(selector, nodeSpec, user, slide, slideNo, license) {
  let myPromise = new Promise((resolve, reject) => {
    let title = (slide.title !== '') ? slide.title : (slide.ctrTitle !== '') ? slide.ctrTitle : slide.subTitle;
    title = title.trim();
    if (title.length > 100) {
      title = title.substring(0,99) + '...';
    }
    let slideTitle = replaceSpecialSymbols(title);//deck tree does not display some encoded symbols properly
    slideTitle = he.encode(slideTitle, {allowUnsafeSymbols: true});//encode some symbols which were not replaced
    //Encode special characters (e.g. bullets)
    let encodedContent = he.encode(slide.content, {allowUnsafeSymbols: true});
    let encodedNotes = he.encode(slide.notes, {allowUnsafeSymbols: true});

    let jsonData = {
      selector: selector,
      nodeSpec: nodeSpec,
      user: String(user),
      content: encodedContent,
      title: (slideTitle !== '') ? slideTitle : ('Slide ' + slideNo),//It is not allowed to be empty
      speakernotes:encodedNotes,
      license: license
    };

    if (slide.notes === '') {//It is not allowed for speakernotes to be empty
      delete jsonData.speakernotes;
    }

    let data = JSON.stringify(jsonData);
    rp.post({uri: Microservices.deck.uri + '/decktree/node/create', body:data}).then((res) => {
      try {
        let newDeckTreeNode = JSON.parse(res);
        resolve(newDeckTreeNode);
      } catch(e) {
        console.log(e);
        reject(e);
      }

    }).catch((err) => {
      console.log('Error', err);
      reject(e);
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
      reject(e);
    });
  });

  return myPromise;
}

function replaceSpecialSymbols(string) {
  let newString = string.replace('’', '\'');
  newString = newString.replace('‘', '\'');
  newString = newString.replace('“', '"');
  newString = newString.replace('”', '"');
  newString = newString.replace('„', '"');
  newString = newString.replace('…', '...');
  newString = newString.replace('—', '-');
  newString = newString.replace('–', '-');//not the same as previous
  newString = newString.replace('&amp;', '&');
  return newString;
}
