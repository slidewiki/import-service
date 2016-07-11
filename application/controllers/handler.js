/*
Handles the requests by executing stuff and replying to the client. Uses promises to get stuff done.
*/

'use strict';

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
    request.log('ImportPPTX', 'ImportPPTX service called' + request.payload.file);
    console.log('ImportPPTX data' + request.payload.file);
    //pptx2html.convert(request.payload.file);
    //let file = evt.target.files[0];
    //this.props.ImportStore.file = file;
    let result = pptx2html.convert(request.payload.file);
    console.log(pptx2html.convert(request.payload.file));

    //TODO: give HTML ouput of PPTX2HTML
    //reply('importservice result = HTML from PPTX import');
    reply(result);
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
