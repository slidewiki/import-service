/*
Handles the requests by executing stuff and replying to the client. Uses promises to get stuff done.
*/

'use strict';
let util = require('util');
let fs = require('fs');

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
    const license = request.payload.license;
    const fileName = request.payload.filename;
    const deckName = fileName.split('.')[0];




    //
    // let saveTo = './' + fileName;
    // let fileStream = fs.createWriteStream(saveTo);
    // //fileStream.write(request.payload.file.data);
    // fileStream.write(request.payload.file, 'binary');
    // fileStream.end();
    // fileStream.on('error', (err) => {
    //   reply('error in upload!');
    //   console.log('error', err);
    // });
    // fileStream.on('finish', (res) => {
    //   // reply('upload completed!');
    //   console.log('upload completed');
    // });


    // let pptx2html = require('../PPTX2HTML/js/pptx2html');

    return createDeck(user, license, deckName).then((deck) => {

      let data_url = request.payload.file;
      let buffer = new Buffer(data_url.split(',')[1], 'base64');
      let convertor = new Convertor.Convertor();
      let noOfSlides = convertor.getNoOfSlides(buffer);
      reply('import completed').header('deckId', deck.id).header('noOfSlides', noOfSlides);

      //Save file
      // fs.writeFile('./' + fileName, buffer, (err) => {
      //   if (err) {
      //     reply('error in upload!');
      //     console.log('error', err);
      //   } else {
      //     console.log('upload completed');
      //   }
      // });

      let slides = convertor.processPPTX(buffer);

      //update the first slide which was created with new deck
      updateFirstSlideOfADeck(user, license, deck.id, slides[0]).then((slideId) => {
        // let previousSlideId = slideId;
        // for (let i = 1; i < slides.length; i++) {
        //
        //   createDeckTreeNode(selector, nodeSpec, user).then((node) => {
        //     console.log(node);
        //     updateSlide(node.id, user, license, deck.id, slides[i]);
        //     previousSlideId = node.id;
        //   });
        //
        // }
        if (slides.length > 1) {
          //create and update the rest of slides
          createNodesRecursive(user, license, deck.id, slideId, slides, 1);
        }

      }).catch((error) => {
        request.log('error', error);
        reply(boom.badImplementation());
      });
    }).catch((error) => {
      request.log('error', error);
      reply(boom.badImplementation());
    });



    //console.log(result);


    //console.log(pptx2html.convert(request.params));

    //TODO: give HTML ouput of PPTX2HTML
    //reply('importservice result = HTML from PPTX import');
    //reply(result);

    //slideDB.get(encodeURIComponent(request.params.id)).then((slide) => {
    //  if (co.isEmpty(slide))
    //    reply(boom.notFound());
    //  else
    //    reply(co.rewriteID(slide));
    //}).catch((error) => {
    //  request.log('error', error);
    //  reply(boom.badImplementation());
    //});
  }
  /*
  //Get Slide from database or return NOT FOUND
  getSlide: function(request, reply) {
    slideDB.get(encodeURIComponent(request.params.id)).then((slide) => {
      if (co.isEmpty(slide))
        reply(boom.notFound());
      else
        reply(co.rewriteID(slide));
    }).catch((error) => {
      request.log('error', error);
      reply(boom.badImplementation());
    });
  },

  //Create Slide with new id and payload or return INTERNAL_SERVER_ERROR
  newSlide: function(request, reply) {
    slideDB.insert(request.payload).then((inserted) => {
      if (co.isEmpty(inserted.ops[0]))
        throw inserted;
      else
        reply(co.rewriteID(inserted.ops[0]));
    }).catch((error) => {
      request.log('error', error);
      reply(boom.badImplementation());
    });
  },

  //Update Slide with id id and payload or return INTERNAL_SERVER_ERROR
  replaceSlide: function(request, reply) {
    slideDB.replace(encodeURIComponent(request.params.id), request.payload).then((replaced) => {
      if (co.isEmpty(replaced.value))
        throw replaced;
      else
        reply(replaced.value);
    }).catch((error) => {
      request.log('error', error);
      reply(boom.badImplementation());
    });
  },
  */


  ,testPPTX2HTML: function(request, reply) {// Dejan added this to test pptx2html
    if (!request.payload) {
      let file = './PPTX2HTML/pptx samples/simple slide - notes - p1,3.pptx';
      fs.readFile(file, (err, data) => {
        if (err) throw err;
        pptx2html.convert(data);
      });
    }
    reply('test completed, look at the console');
  }
};

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

  createDeckTreeNode(selector, nodeSpec, user).then((node) => {
    updateSlide(node.id, user, license, deckId, slides[index]);

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


//Send a request to insert new deck
function createDeck(user, license, deckName) {
  // console.log('deck', user, license, deckName);
  let myPromise = new Promise((resolve, reject) => {
    let http = require('http');

    let data = JSON.stringify({
      user: user,
      license: license,
      title: deckName
    });

    let options = {
      host: Microservices.deck.uri,
      port: Microservices.deck.port,
      path: '/deck/new',
      method: 'POST',
      headers : {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Content-Length': data.length
      }
    };

    let req = http.request(options, (res) => {
      // console.log('STATUS: ' + res.statusCode);
      // console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        // console.log('Response: ', chunk);
        let newDeck = JSON.parse(chunk);

        resolve(newDeck);
      });
    });
    req.on('error', (e) => {
      console.log('problem with request: ' + e.message);
      reject(e);
    });
    req.write(data);
    req.end();
  });

  return myPromise;
}

function createDeckTreeNode(selector, nodeSpec, user) {
  let myPromise = new Promise((resolve, reject) => {
    let http = require('http');

    let data = JSON.stringify({
      selector: selector,
      nodeSpec: nodeSpec,
      user: String(user)
    });

    let options = {
      host: Microservices.deck.uri,
      port: Microservices.deck.port,
      path: '/decktree/node/create',
      method: 'POST',
      headers : {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Content-Length': data.length
      }
    };

    let req = http.request(options, (res) => {
      // console.log('STATUS: ' + res.statusCode);
      // console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        // console.log('Response: ', chunk);
        let newDeckTreeNode = JSON.parse(chunk);

        resolve(newDeckTreeNode);
      });
    });
    req.on('error', (e) => {
      console.log('problem with request: ' + e.message);
      reject(e);
    });
    req.write(data);
    req.end();
  });

  return myPromise;
}

function updateFirstSlideOfADeck(user, license, deckId, slide) {
  //Find the id of the first slidedata
  let myPromise = new Promise((resolve, reject) => {
    let http = require('http');

    let options = {
      host: Microservices.deck.uri,
      port: Microservices.deck.port,
      path: '/decktree/' + deckId
    };

    let req = http.get(options, (res) => {
      // console.log('STATUS: ' + res.statusCode);
      // console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      let body = '';
      res.on('data', (chunk) => {
        // console.log('Response: ', chunk);
        body += chunk;
      });
      res.on('end', () => {
        let parsed = JSON.parse(body);
        let slideId = parsed.children[0].id;
        updateSlide(slideId, user, license, deckId, slide);
        resolve(slideId);
      });
    });
    req.on('error', (e) => {
      console.log('problem with request: ' + e.message);
      reject(e);
    });

  });

  return myPromise;
}

function updateSlide(slideId, user, license, deckId, slide) {
  let http = require('http');
  let he = require('he');

  let slideTitle = replaceSpecialSymbols(slide.title);//deck tree does not display some encoded symbols properly
  slideTitle = he.encode(slideTitle, {allowUnsafeSymbols: true});//encode some symbols which were not replaced
  //Encode special characters (e.g. bullets)
  let encodedContent = he.encode(slide.content, {allowUnsafeSymbols: true});
  let encodedNotes = he.encode(slide.notes, {allowUnsafeSymbols: true});

  let jsonData = {
    title: (slideTitle !== '') ? slideTitle : 'New slide',//It is not allowed to be empty
    content: encodedContent,
    speakernotes:encodedNotes,
    user: String(user),
    root_deck: String(deckId),
    parent_deck: {
      id: String(deckId),
      revision: '1'
    },
    license: license
  };

  if (slide.notes === '') {//It is not allowed for speakernotes to be empty
    delete jsonData.speakernotes;
  }
  let data = JSON.stringify(jsonData);

  let options = {
    host: Microservices.deck.uri,
    port: Microservices.deck.port,
    path: '/slide/' + slideId,
    method: 'PUT',
    headers : {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Content-Length': data.length
    }
  };

  let req = http.request(options, (res) => {
    // console.log('STATUS: ' + res.statusCode);
    // console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      // console.log('Response: ', chunk);

    });
  });
  req.on('error', (e) => {
    console.log('problem with request: ' + e.message);
  });
  req.write(data);
  req.end();
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

//Send a request to insert new slide
// function createSlide(user, license, deckId, slide) {
//   let http = require('http');
//   let he = require('he');
//
//   //Encode special characters (e.g. bullets)
//   let encodedContent = he.encode(slide.content, {allowUnsafeSymbols: true});
//   let encodedNotes = he.encode(slide.notes, {allowUnsafeSymbols: true});
//
//   let jsonData = {
//     title: (slide.title !== '') ? slide.title : 'New slide',//It is not allowed to be empty
//     content: encodedContent,
//     speakernotes:encodedNotes,
//     user: user,
//     root_deck: String(deckId),
//     parent_deck: {
//       id: String(deckId),
//       revision: '1'
//     },
//     license: license
//   };
//
//   if (slide.notes === '') {//It is not allowed for speakernotes to be empty
//     delete jsonData.speakernotes;
//   }
//   let data = JSON.stringify(jsonData);
//   let options = {
//     host: Microservices.deck.uri,
//     port: Microservices.deck.port,
//     path: '/slide/new',
//     method: 'POST',
//     headers : {
//       'Content-Type': 'application/json',
//       'Cache-Control': 'no-cache',
//       'Content-Length': data.length
//     }
//   };
//
//   let req = http.request(options, (res) => {
//     // console.log('STATUS: ' + res.statusCode);
//     // console.log('HEADERS: ' + JSON.stringify(res.headers));
//     res.setEncoding('utf8');
//     res.on('data', (chunk) => {
//       // console.log('Response: ', chunk);
//
//     });
//   });
//   req.on('error', (e) => {
//     console.log('problem with request: ' + e.message);
//   });
//   req.write(data);
//   req.end();
// }
