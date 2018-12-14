'use strict';

const co = require('../common');
const URI = require('url');

// prepare unoconv service config
let unoconvURI = (!co.isEmpty(process.env.SERVICE_URL_UNOCONV)) ? process.env.SERVICE_URL_UNOCONV : 'http://unoconvservice';
// parse it
let unoconv = URI.parse(unoconvURI);

module.exports = {
  'deck': {
    uri: (!co.isEmpty(process.env.SERVICE_URL_DECK)) ? process.env.SERVICE_URL_DECK : 'http://deckservice'
  },
  'file': {
    uri: (!co.isEmpty(process.env.SERVICE_URL_FILE)) ? process.env.SERVICE_URL_FILE : 'http://fileservice',
    shareVolume: '/data/files'
  }  ,
  'unoconv': {
    uri: unoconvURI,
    host: unoconv.hostname,
    protocol: unoconv.protocol,
    port: unoconv.port || (unoconv.protocol === 'https:' ? 443 : 80),
    path: (!co.isEmpty(process.env.SERVICE_PATH_UNOCONV)) ? process.env.SERVICE_PATH_UNOCONV : '/unoconv/pptx',
  },
  'import': {
    //necessary for document.domain image upload script sent to platform
    //from line 96- 107 in /application/controllers/handler.js
    uri: (!co.isEmpty(process.env.VIRTUAL_HOST)) ? process.env.VIRTUAL_HOST : 'importservice.experimental.slidewiki.org'
  },
  'tag': {
    uri: (!co.isEmpty(process.env.SERVICE_URL_TAG)) ? process.env.SERVICE_URL_TAG : 'http://tagservice'
  },

};
