'use strict';

const co = require('../common');

module.exports = {
  'deck': {
    uri: (!co.isEmpty(process.env.SERVICE_URL_DECK)) ? process.env.SERVICE_URL_DECK : 'http://deckservice'
  },
  'file': {
    uri: (!co.isEmpty(process.env.SERVICE_URL_FILE)) ? process.env.SERVICE_URL_FILE : 'http://fileservice',
    shareVolume: '/data/files'
  }  ,
  'unoconv': {
    uri: (!co.isEmpty(process.env.SERVICE_URL_UNOCONV)) ? process.env.SERVICE_URL_UNOCONV : 'http://unoconvservice',
    protocol: 'https:',
    host: (!co.isEmpty(process.env.SERVICE_HOST_UNOCONV)) ? process.env.SERVICE_HOST_UNOCONV : 'unoconvservice',
    path: '/unoconv/pptx',
    port: 443
}
};
