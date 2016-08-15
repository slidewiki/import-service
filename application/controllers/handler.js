/*
Handles the requests by executing stuff and replying to the client. Uses promises to get stuff done.
*/

'use strict';
let util = require('util');
let fs = require('fs');

//const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
  //slideDB = require('../database/slideDatabase'), //Database functions specific for slides
  //co = require('../common');
//pptx2html =
//require('../PPTX2HTML/js/pptx2html');

let pptx2html = require('../PPTX2HTML/js/pptx2html');
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
    console.log(request.params); // {}
    //console.log('file sent to service: request.payload' + request.payload); [object object]
    //console.log('file sent to service: request.params' + request.params);
    //console.log('file sent to service: request.file' + request.file);

    //we should be abe to read request.files.file.data
    //TODO: try multipart multipart/form-data?
    // SEE RISIS SERVER.JS FOR EXAMPLE
    //console.log('file sent to service: request.files.file.size' + request.files.file.data);
    //console.log('file sent to service: request.params.files.file.size' + request.files.file.size);
    //console.log(util.inspect(request.params, {showHidden: true, depth: 100}));
    console.log(util.inspect(request.payload.file.data, {showHidden: true, depth: 100})); //undefined
    console.log(util.inspect(request.payload.file, {showHidden: true, depth: 100})); ////<Buffer 50 4b 03 04
    console.log(util.inspect(request.payload, {showHidden: true, depth: 100}));//{ file: <Buffer 50 4b 0

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

    let saveTo = './testingtests.pptx';
    let fileStream = fs.createWriteStream(saveTo);
    //fileStream.write(request.payload.file.data);
    fileStream.write(request.payload.file);
    fileStream.end();
    fileStream.on('error', (err) => {
      reply('error in upload!');
      console.log('error', err);
    });
    fileStream.on('finish', (res) => {
      reply('upload completed!');
      console.log('upload completed');
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
};
