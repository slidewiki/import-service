/*
Handles the requests by executing stuff and replying to the client. Uses promises to get stuff done.
*/

'use strict';

const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
  slideDB = require('../database/slideDatabase'), //Database functions specific for slides
  co = require('../common');


module.exports = {




  //Import uploaded PPTX and transform to HTML via PPTX2HTML  or return ERROR
  //TODO: can I run client-side non ES6 javascript in node.js?
  //pptx2html/js/pptx2html.js uses document.ready / Jquery
  //TODO: find out how use of reveal.js in PPTX2HTML works together with our use of
  // reveal.js in slidewiki-platform frontend work by Huw on slide viewer.
  importPPTX: function(request, reply) {
    request.log('test', 'test');
    //slideDB.get(encodeURIComponent(request.params.id)).then((slide) => {
    //  if (co.isEmpty(slide))
    //    reply(boom.notFound());
    //  else
    //    reply(co.rewriteID(slide));
    //}).catch((error) => {
    //  request.log('error', error);
    //  reply(boom.badImplementation());
    //});
  },
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
