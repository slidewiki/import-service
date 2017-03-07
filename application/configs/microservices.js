'use strict';

const co = require('../common');

module.exports = {
  'deck': {
    uri: (!co.isEmpty(process.env.SERVICE_URL_DECK)) ? process.env.SERVICE_URL_DECK : 'http://deckservice'
  },
  'file': {
    uri: (!co.isEmpty(process.env.SERVICE_URL_FILE)) ? process.env.SERVICE_URL_FILE : 'http://fileservice'
  }
};
