'use strict';

const co = require('../common');

module.exports = {
  'deck': {
    uri: (!co.isEmpty(process.env.SERVICE_URL_DECK)) ? process.env.SERVICE_URL_DECK : 'https://deckservice.experimental.slidewiki.org'
  },
  'file': {
    uri: (!co.isEmpty(process.env.SERVICE_URL_FILE)) ? process.env.SERVICE_URL_FILE : 'https://fileservice.experimental.slidewiki.org',
    shareVolume: '/data/files'
  }  ,
  'unoconv': {
    uri: (!co.isEmpty(process.env.SERVICE_URL_UNOCONV)) ? process.env.SERVICE_URL_UNOCONV : 'https://unoconvservice.experimental.slidewiki.org',
    protocol: 'https:',
    host: (!co.isEmpty(process.env.SERVICE_HOST_UNOCONV)) ? process.env.SERVICE_HOST_UNOCONV : 'unoconvservice',
    path: '/unoconv/pptx',
    port: 443
  }
};
