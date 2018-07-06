'use strict';
let JSZip = require('../PPTX2HTML/js/jszip.min.js');


let highlight = require('../PPTX2HTML/js/highlight.min.js');
let colz = require('../PPTX2HTML/js/colz.class.min.js');
let tXml = require('../PPTX2HTML/js/tXml.js');
let functions = require('../PPTX2HTML/js/functions.js');

class SWHTMLExportConvertor {
  constructor() {

    this.slides = [];

    this.user = '';
    this.jwt = '';

  }

  convertHTMLExport(data) {
    let zip = new JSZip(data);

    // var contentJson = this.readXmlFile(zip, 'index.html');
    this.parseHTMLFile(zip, 'index.html');




  }

  parseHTMLFile(zip, filename) {
    let textFile = zip.file(filename).asText();
    let sectionStart1 = textFile.indexOf('<section');
    console.log(sectionStart1);

    let sectionStart2 = textFile.indexOf('>', sectionStart1);
    console.log(sectionStart2);

    let sectionEnd = textFile.indexOf('</section>', sectionStart2);
    console.log(sectionEnd);

    let slide = textFile.substring(sectionStart2 + 1, sectionEnd);
    console.log(slide);

    let asideStart1 = textFile.indexOf('<aside class="notes"', sectionStart2);
    let asideStart2 = textFile.indexOf('>', asideStart1);
    let asideEnd = textFile.indexOf('</aside>', asideStart2);
    let speakerNotes = textFile.substring(asideStart2 + 1, asideEnd);
    console.log(speakerNotes);



  }

  readXmlFile(zip, filename) {

    // textFile = textFile.replace(/\n/g, '');


    // let x = new tXml(textFile);
    // try {
    //   console.log( x.parseChildren(zip.file(filename).asText()));
    // } catch (e) {
    //   console.log(e);
    // }
  }


}

module.exports = {
  SWHTMLExportConvertor
};
