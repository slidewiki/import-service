'use strict';
let imagehandler = require('./imagehandler.js');
let JSZip = require('../PPTX2HTML/js/jszip.min.js');

class SWHTMLExportConvertor {
  constructor() {
    this.fileName = 'index.html';
  }

  convertHTMLExport(data) {
    let zip = new JSZip(data);
    let textFile = zip.file(this.fileName).asText();

    //extract slide size
    const outerDiv1 = textFile.indexOf('class="pptx2html"', 0);
    const widthStart = textFile.indexOf('width:', outerDiv1);
    const widthEnd = textFile.indexOf('px', widthStart);
    const width = parseInt(textFile.substring(widthStart + 1, widthEnd));
    const heightStart = textFile.indexOf('height:', outerDiv1);
    const heightEnd = textFile.indexOf('px', heightStart);
    const height = parseInt(textFile.substring(heightStart + 1, heightEnd));

    //extract slides
    let slides = [];
    let slide = null;
    let currentIndex = 0;
    do {
      let sectionStart1 = textFile.indexOf('<section', currentIndex);

      if (sectionStart1 > -1) {

        let sectionStart2 = textFile.indexOf('>', sectionStart1);
        let sectionEnd = textFile.indexOf('</section>', sectionStart2);

        let contentAndSpeakerNotes = textFile.substring(sectionStart2 + 1, sectionEnd);
        let content = contentAndSpeakerNotes;

        let speakerNotes = '';
        let asideStart1 = contentAndSpeakerNotes.indexOf('<aside class="notes"', sectionStart2);
        if (asideStart1 > -1) {
          let asideStart2 = contentAndSpeakerNotes.indexOf('>', asideStart1);
          let asideEnd = contentAndSpeakerNotes.indexOf('</aside>', asideStart2);
          content = contentAndSpeakerNotes.substring(sectionStart2 + 1, asideStart2);
          speakerNotes = contentAndSpeakerNotes.substring(asideStart2 + 1, asideEnd);
        }
        slide = {content: content, notes: speakerNotes};
        slides.push(slide);
        currentIndex = sectionEnd;
      } else {
        slide = null;
      }
    } while (slide !== null);

    return {slides: slides, slideSize: {'width': width, 'height': height}};
  }

  extractAndConvertImages(slide, data, jwt) {
    let zip = new JSZip(data);
    let imagePromises = [];
    let imgSources = [];

    let imgSource = null;
    let currentIndex = 0;
    do {
      let imgStart1 = slide.indexOf('<img', currentIndex);
      if (imgStart1 > -1) {
        let imgStart2 = slide.indexOf('src="', imgStart1);
        let imgSrcStart = imgStart2 + 5;
        let imgEnd = slide.indexOf('"', imgSrcStart);

        imgSource = slide.substring(imgSrcStart, imgEnd);
        //check if image is local
        if (imgSource.indexOf('://') < 0) {
          let imagePromise = imagehandler.sendImageToFileService(imgSource, zip, jwt);
          imagePromises.push(imagePromise);
          imgSources.push(imgSource);
        }
        currentIndex = imgEnd;
      } else {
        imgSource = null;
      }

    } while (imgSource !== null);

    return Promise.all(imagePromises).then((data) => {
      let newContent = slide;
      for (let i = 0; i < imgSources.length; i++) {
        //replace img src with new path
        let searchStr = imgSources[i].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        newContent = newContent.replace(new RegExp(searchStr, 'g'), data[i]);
      }

      return newContent;
    }).catch((err) => {
      console.log('Error', err);
      return new Promise((resolve) => {resolve (slide);});
    });
  }
}

module.exports = {
  SWHTMLExportConvertor
};
