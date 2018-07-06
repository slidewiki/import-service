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



    let slide = null;
    let currentIndex = 0;
    do {
      let sectionStart1 = textFile.indexOf('<section', currentIndex);
      console.log(sectionStart1);




      if (sectionStart1 > -1) {

        let sectionStart2 = textFile.indexOf('>', sectionStart1);
        console.log(sectionStart2);
        let sectionEnd = textFile.indexOf('</section>', sectionStart2);
        console.log(sectionEnd);

        let contentAndSpeakerNotes = textFile.substring(sectionStart2 + 1, sectionEnd);
        let content = contentAndSpeakerNotes;

        let speakerNotes = '';
        let asideStart1 = contentAndSpeakerNotes.indexOf('<aside class="notes"', sectionStart2);
        if (asideStart1 > -1) {
          let asideStart2 = contentAndSpeakerNotes.indexOf('>', asideStart1);
          let asideEnd = contentAndSpeakerNotes.indexOf('</aside>', asideStart2);
          content = contentAndSpeakerNotes.substring(sectionStart2 + 1, asideStart2);
          speakerNotes = contentAndSpeakerNotes.substring(asideStart2 + 1, asideEnd);

          slide = {content: content, speakernotes: speakerNotes};
          this.slides.push(slide);
          currentIndex = sectionEnd;
        } else {
          slide = null;
        }

        console.log('content:', content);
        console.log('notes', speakerNotes);


      }

    } while (slide !== null);


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
