/*
These are routes as defined in https://docs.google.com/document/d/1337m6i7Y0GPULKLsKpyHR4NRzRwhoxJnAZNnDFCigkc/edit#
Each route implementes a basic parameter/payload validation and a swagger API documentation description
*/
'use strict';

const Joi = require('joi'),
  handlers = require('./controllers/handler');

module.exports = function(server) {

  //TODO figure out how I can send file as parameter - maybe filestream? should be POST!!!
  //Upload a PPTX powerpoint presentation which is converted to HTML
  server.route({
    //will be POST
    method: 'POST',
    path: '/importPPTX',
    handler: handlers.importPPTX,
    config: {
      validate: {
        params: {
          payload: Joi.object().keys({
            file: Joi.string()
          }).requiredKeys('file')
        },
      },
      tags: ['api'],
      description: 'Import PPTX presentation file to SlideWiki'
    }
  });
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
