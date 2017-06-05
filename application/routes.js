/*
These are routes as defined in https://docs.google.com/document/d/1337m6i7Y0GPULKLsKpyHR4NRzRwhoxJnAZNnDFCigkc/edit#
Each route implementes a basic parameter/payload validation and a swagger API documentation description
*/
'use strict';

const Joi = require('joi'),
  handlers = require('./controllers/handler');

const MAX_FILESIZE_MB = 300;
const MAX_FILESIZE = MAX_FILESIZE_MB * 1024 * 1024;

module.exports = function(server) {

    //TODO: try multipart multipart/form-data?
    // SEE RISIS SERVER.JS FOR EXAMPLE
  //TODO figure out how I can send file as parameter - maybe filestream? should be POST!!!
  //Upload a PPTX powerpoint presentation which is converted to HTML
  server.route({
    //will be POST
    method: 'POST',
    path: '/importPPTX',
    handler: handlers.importPPTX,
    config: {
      cors: true,
      payload: {
        maxBytes: MAX_FILESIZE,
        parse: true,
        //allow: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' - works!
        //allow: 'application/x-www-form-urlencoded'
        allow: 'multipart/form-data'
      },
      //validate: {
    //    params: {
    //      payload: Joi.object().keys({
    //        file: Joi.string()
    //      }).requiredKeys('file')
    //    },
     // },
      tags: ['api'],
      description: 'Import PPTX presentation file to SlideWiki'
    }
  });

  server.route({
    //will be POST
    method: 'POST',
    path: '/importImage/{userid}',

    handler: handlers.importImage,
    config: {
      cors: true,
      validate: {
        params: {
          userid: Joi.string()
        },
      },
      payload: {
        parse: true,
        //allow: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' - works!
        //allow: 'application/x-www-form-urlencoded'
        //allow: 'multipart/form-data'
        maxBytes: 209715200,
        output:'stream',
      },
      //validate: {
    //    params: {
    //      payload: Joi.object().keys({
    //        file: Joi.string()
    //      }).requiredKeys('file')
    //    },
     // },
      tags: ['api'],
      description: 'Import image file to SlideWiki'
    }
  });

  server.route({
    //will be POST
    method: 'POST',
    path: '/importImagePaste/{userid}',

    handler: handlers.importImagePaste,
    config: {
      cors: true,
      validate: {
        params: {
          userid: Joi.string()
        },
      },
      payload: {
        parse: true,
        //allow: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' - works!
        //allow: 'application/x-www-form-urlencoded'
        //allow: 'multipart/form-data'
        maxBytes: 209715200,
        output:'stream',
      },
      //validate: {
    //    params: {
    //      payload: Joi.object().keys({
    //        file: Joi.string()
    //      }).requiredKeys('file')
    //    },
     // },
      tags: ['api'],
      description: 'Import image file, pasted in CKeditor in slide edit view, to SlideWiki'
    }
  });

  // server.route({// Dejan added this to test pptx2html in the microservice
  //   //will be POST
  //   method: 'POST',
  //   path: '/testPPTX2HTML',
  //   handler: handlers.testPPTX2HTML,
  //   config: {
  //     cors: true,
  //     payload: {
  //
  //     },
  //     //validate: {
  //   //    params: {
  //   //      payload: Joi.object().keys({
  //   //        file: Joi.string()
  //   //      }).requiredKeys('file')
  //   //    },
  //    // },
  //     tags: ['api'],
  //     description: 'Test PPTX2HTML library (read some local pptx file)'
  //   }
  // });

  /*
  //Get slide with id id from database and return it (when not available, return NOT FOUND). Validate id
  server.route({
    method: 'GET',
    path: '/slide/{id}',
    handler: handlers.getSlide,
    config: {
      validate: {
        params: {
          id: Joi.string().alphanum().lowercase()
        },
      },
      tags: ['api'],
      description: 'Get a slide'
    }
  });

  //Create new slide (by payload) and return it (...). Validate payload
  server.route({
    method: 'POST',
    path: '/slide/new',
    handler: handlers.newSlide,
    config: {
      validate: {
        payload: Joi.object().keys({
          title: Joi.string(),
          body: Joi.string(),
          user_id: Joi.string().alphanum().lowercase(),
          root_deck_id: Joi.string().alphanum().lowercase(),
          parent_deck_id: Joi.string().alphanum().lowercase(),
          no_new_revision: Joi.boolean(),
          position: Joi.number().integer().min(0),
          language: Joi.string()
        }).requiredKeys('title', 'body'),
      },
      tags: ['api'],
      description: 'Create a new slide'
    }
  });

  //Update slide with id id (by payload) and return it (...). Validate payload
  server.route({
    method: 'PUT',
    path: '/slide/{id}',
    handler: handlers.replaceSlide,
    config: {
      validate: {
        params: {
          id: Joi.string().alphanum().lowercase()
        },
        payload: Joi.object().keys({
          title: Joi.string(),
          body: Joi.string(),
          user_id: Joi.string().alphanum().lowercase(),
          root_deck_id: Joi.string().alphanum().lowercase(),
          parent_deck_id: Joi.string().alphanum().lowercase(),
          no_new_revision: Joi.boolean(),
          position: Joi.number().integer().min(0),
          language: Joi.string()
        }).requiredKeys('title', 'body'),
      },
      tags: ['api'],
      description: 'Replace a slide'
    }
  });
  */
};
