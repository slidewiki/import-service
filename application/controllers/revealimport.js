'use strict';
let imagehandler = require('./imagehandler.js');
let JSZip = require('../PPTX2HTML/js/jszip.min.js');
//var fs = require("fs");

class RevealConvertor {
    constructor() {
        this.fileName = 'index.html';
    }

    convertHTMLExport(data) {
        let zip = new JSZip(data);
        let textFile = zip.file(this.fileName).asText();
        // test with file reading
        //let textFile = fs.readFileSync(data, 'utf8');

        return this.Reveal2JSON(textFile);
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
            return new Promise((resolve) => { resolve(slide); });
        });
    }

    //Reveal2JSON
    /*
     * TODOs:
     * (1) Translate Markdown to HTML
     * (2) data-autoslide - supported by SlideWiki?
     * (3) videos & data-src within video tag or special source tag
     * (4) internal links
     * (5) fragments - should be already done by copying the section area 
     * (6) code syntax highlighting - should be already done by copying the section area 
     */
    Reveal2JSON(html) {
        // Objective: Output-Format like deckservice.{environment}.slidewiki.org/deck/{id}/slides 
        let JSONdeck = {};

        // Objective: Increment of count of slides in the deck for JSON.deck.slidesCount
        let slideCounter = 0;

        // Objective: auxiliary variable for string positions w.r.t. to start, end, tag (source code between start and end) of e.g. sections
        let start, end, tag;

        // Objective: Check existence of html head section, e.g. for the possibility of extracting title tags, themes, etc.
        /*
         * Extracts source code between of the head section <html>{source_code}</html>
         */
        let htmlHead = '';
        if (html.includes('<head>') && html.includes('</html>')) {
            htmlHead = html.substr(html.indexOf('<head>') + 6, html.indexOf('</head>') - html.indexOf('<head>') - 6);
        }
        //console.log(htmlHead);

        // Objective: extract title from html head section
        /*
         * Default-value: 'title tag missing / incorrect' if head section or title tag doesn't exists.
         * 
         * Extracts title <title>{title}</title>
         */
        JSONdeck.title = 'title tag missing / incorrect';
        if (htmlHead.includes('<title>') && htmlHead.includes('</title>')) {
            //JSONdeck.title = htmlHead.substr(htmlHead.indexOf('<title>') + 7, htmlHead.indexOf('</title>') - htmlHead.indexOf('<title>') - 7);
        }

        // Objective: indexOf for the next occurrence
        let startIndex = 0;
        // Descriminator: link href of stylesheets defines the reveal css theme
        let href;
        // [deprecated: 2018/07/06]while (-1 < htmlHead.indexOf('<link', startIndex)) {
        //while (this.getTag(htmlHead, 'link', startIndex)) {
        // [deprecated: 2018/07/06] start = htmlHead.indexOf('<link', startIndex);
        // [deprecated: 2018/07/06]end = htmlHead.indexOf('>', start);
        // [deprecated: 2018/07/06]tag = htmlHead.substr(start + 5, end - start - 5).trim();
        //console.log(this.getTag(htmlHead,'link', startIndex));
        //tag = this.getTag(htmlHead, 'link', startIndex)
        //console.log(tag);

        // Objetice: Check if the current link tag contains stylesheets and an attribute for an url
        // [deprecated: 2018/07/06] if (tag.includes('rel="stylesheet"') && tag.includes('href="')) {
        //if ('stylesheet' === this.getAttribute(tag, 'rel') && this.getAttribute(tag, 'href')) {
        // Obective: Extracts url for stylesheet file
        //href = this.getAttribute(tag, 'href');

        // theme assignment
        /*
         * Check & Compate current URL with standard themes of reveal
         *
         * (!) reveal default reveal theme is black vs. slide wiki white
         * TODO: check values for themes in the slide wiki plattform
         */
        /*
                switch (href) {
                    case 'css/theme/black.css':
                        JSONdeck.theme = 'black';
                        break;
                    case 'css/theme/white.css':
                        JSONdeck.theme = 'default';
                        break;
                    default:
                        JSONdeck.theme = 'default';
                }
          */
        //console.log(start, end, href);
        //}
        //console.log(JSONdeck.theme);

        // Objective: update startIndex to find the next link tag in the following iteration
        //startIndex = htmlHead.indexOf('<link', startIndex) + 1;
        //}

        // Objective: childen array, cf. deckservice.{environment}.slidewiki.org/deck/{id}/slides
        JSONdeck.children = [];

        // Objective: ...
        html = html.substr(html.indexOf('<section'), html.length - html.indexOf('<section'));

        // Objective: variable for checking if the current section contains nested sections
        let checkNestedSection = false;

        // Objective: each section tag represents an element of children = [] 
        while (html.indexOf('<section') > -1) {
            // let for the children element
            let JSONslide = {};

            // Objective: default value
            /*
             * Idea: check H1, H2, etc. tag for slide title informations
             */
            JSONslide.title = JSONdeck.title+" - "+children.length+1;

            // Position of start and end of the current section
            start = html.indexOf('<section'); // currenlty, not in use
            end = html.indexOf('</section>');

            // Objective: Checking of nested section tags
            /*
             * Vertical slides of reveal.js use nested section tags,
             * so we have to take a look on the different section tags e.g. for over-writing attributes
             * as well as w.r.t. the correct start and end tags of these nested sections
             *
             * (1) Check if the following section area contains another open section tag
             * (2) Increase the start position for the current process to this next section tag
             */
            if (!checkNestedSection && html.substring(html.indexOf('>', start + 1), end).includes('<section')) {
                checkNestedSection = true;
                start = html.indexOf('<section', start + 1);
                html = html.substring(start, html.length);
                start = html.indexOf('<section');
                end = html.indexOf('</section>');
                //console.log(html);
            }

            // Objective: Extract slide background 
            /*
             * (1) Get current <section {data-background-*}> tag
             * (2) Extract data-background-*
             * (3) set backgroundCheck true if there exists data-background-color/image/video or a style attribute
             * 
             * Other data-background-* attributes are secondary
             *
             * Construction of a sorrounding div container for background attributes
             */
            let sectionTag = this.getTag(html, 'section');
            let divContainer = false;
            // reveal.js background attributes
            let backgroundColor = this.getAttribute(sectionTag, 'data-background-color');
            let backgroundImage = this.getAttribute(sectionTag, 'data-background-image');
            let backgroundSize = this.getAttribute(sectionTag, 'data-background-size');
            let backgroundPosition = this.getAttribute(sectionTag, 'data-background-position');
            let backgroundRepeat = this.getAttribute(sectionTag, 'data-background-repeat');
            let backgroundVideo = this.getAttribute(sectionTag, 'data-background-video');
            let backgroundVideoLoop = this.getAttribute(sectionTag, 'data-background-video-loop');
            let backgroundVideoMuted = this.getAttribute(sectionTag, 'data-background-video-muted');
            let backgroundIframe = this.getAttribute(sectionTag, 'data-background-iframe');
            // reveal.js transition attributes
            let transition = this.getAttribute(sectionTag, 'data-transition');
            let transitionSpeed = this.getAttribute(sectionTag, 'data-transition-speed');
            // stylesheet attrbiute 
            let sectionStyle = this.getAttribute(sectionTag, 'style');
            if (backgroundColor != false || backgroundImage != false || backgroundVideo != false || backgroundIframe != false || transition != false || sectionStyle != false) {
                divContainer = true;
            }

            // Objective: extract HTML content for children element
            /*
             * open section tag ends with ">", i.e. we needs the html source code between this element and the section end tag position
             */
            JSONslide.content = html.substr(html.indexOf('>') + 1, end - html.indexOf('>') - 1);
            // Objective: Remove whitespaces at the start / end (TRIM)
            JSONslide.content = JSONslide.content.trim();
            // Objective: Remove line breakes
            JSONslide.content = JSONslide.content.replace(/(\r?\n|\r)/gm, ' ');
            // Objective: Remove (only) doubled whitespaces w.r.t. indents of the source code
            JSONslide.content = JSONslide.content.replace(/\s\s/g, "");
            // Objective: Remove remaining single whitespaces between tags
            JSONslide.content = JSONslide.content.replace(/\>\s/g, ">").replace(/\<\s/g, "<");

            // Objective: extract spreakernotes
            /*
             * Option 1 [done] - extract from attribute: <section data-notes="Something important">
             * 
             * Check occurrence of data-notes="{speaker_notes}" in <section{possible_occurrence}>
             * and extract the string of the attribute value
             */
            JSONslide.speakernotes = '';
            if (html.substr(html.indexOf('<section'), html.indexOf('>')).includes('data-notes="')) {
                JSONslide.speakernotes = html.substr(html.indexOf('data-notes="') + 12, html.indexOf('"', html.indexOf('data-notes="') + 13) - html.indexOf('data-notes="') - 12);
            }
            // Objective: extract spreakernotes
            /*
             * Option 2 [done] - extract from <aside class="notes">{speaker_notes}</aside) within the sections
             * 
             * Check occurrence of <aside class="notes">{speaker_notes}</aside> in <section>{possible_occurrence}</section>
             * and extract the string between the start & end tag
             */
            if (html.substr(html.indexOf('<section'), html.indexOf('</section>')).includes('<aside class="notes">')) {
                if (0 < JSONslide.speakernotes.length) {
                    JSONslide.speakernotes += '<br>';
                }
                JSONslide.speakernotes += html.substr(html.indexOf('<aside class="notes">') + 21, html.indexOf('</aside>') - html.indexOf('<aside class="notes">') - 21);
                // Objective: Remove whitespaces at the start / end (TRIM)
                JSONslide.speakernotes = JSONslide.speakernotes.replace(/(\r?\n|\r)/gm, ' ').replace(/\s\s/g, "").replace(/\>\s/g, ">").replace(/\<\s/g, "<").trim();
                // Objective: Remove line breakes
                JSONslide.speakernotes = JSONslide.speakernotes.replace(/(\r?\n|\r)/gm, ' ');
                // Objective: Remove (only) doubled whitespaces w.r.t. indents of the source code
                JSONslide.speakernotes = JSONslide.speakernotes.replace(/\s\s/g, "");
                // Objective: Remove remaining single whitespaces between tags
                JSONslide.speakernotes = JSONslide.speakernotes.replace(/\>\s/g, ">").replace(/\<\s/g, "<");
            }

            // Obejctive: Extract URLs / PATH / file names of integrated media files
            /*
             * tagStart stores the start position of the current media tag (i.e. "<")
             * tagEnd stores the end position of the current media tag (i.e. ">")
             * srcStart stores the start position of the current data source
             * srcEnd stores the end position of the current data source
             * tagContent stores the content of the current tag
             *
             * 1) indexOf() with current imgIndex+1 to find the next media tag
             */
            let tagStart = 0;
            let tagEnd = 0;
            let srcStart = 0;
            let srcEnd = 0;
            let tagContent = '';
            let replacedTagContent = '';
            let srcContent = '';
            let srcURL = '';
            let regExp;
            let SlideWikiURL = 'https://fileservice.slidewiki.org/{id}/';
            let SlideWikiFilename = '';
            while (JSONslide.content.indexOf('<img', tagStart + 1)) {
                //while (this.getTag(JSONslide.content,tagStart,'img',tagStart+1)) {
                // start position of current <img> tag
                tagStart = JSONslide.content.indexOf('<img', tagStart + 1);

                // break condition: if the slide content doesn't contain another <img> tag 
                if (-1 == tagStart) {
                    break;
                }

                // end position of current img <img>
                tagEnd = JSONslide.content.indexOf('>', tagStart + 1);
                tagContent = JSONslide.content.substr(tagStart, tagEnd - tagStart);

                // Objective: change data-src attribute to src in <img> tags
                /*
                 * (1) Replace occurrence of » src="« in the tag content with blank character
                 * (2) Replace the whole tag content in the slide content
                 * (3) Search the new img tag end
                 */
                replacedTagContent = tagContent.replace(' data-src="', ' src="');
                JSONslide.content = JSONslide.content.replace(tagContent, replacedTagContent);
                tagEnd = JSONslide.content.indexOf('>', tagStart + 1);
                tagContent = replacedTagContent;

                // Objective replace originial URLs with URL with the related SlideWiki Plattform URL
                // TODO: correct url in SlideWiki to set
                JSONslide.content = this.replaceAttributeURL(JSONslide.content, tagContent, 'src', SlideWikiURL + 'images/', SlideWikiFilename);


            }

            // Objective: Creation of a sorrounding div container
            /*
             * (1) Check if div container is needed
             */
            if (divContainer) {
                JSONslide.content = '>' + JSONslide.content;

                if (sectionStyle != false) {
                    JSONslide.content = ' style="' + sectionStyle + '"' + JSONslide.content;
                }

                if (transitionSpeed != false) {
                    JSONslide.content = ' data-transition-speed="' + transitionSpeed + '"' + JSONslide.content;
                }
                if (transition != false) {
                    JSONslide.content = ' data-transition="' + transition + '"' + JSONslide.content;
                }
                if (backgroundIframe != false) {
                    JSONslide.content = ' data-background-iframe="' + backgroundIframe + '"' + JSONslide.content;
                }
                if (backgroundVideoMuted != false) {
                    JSONslide.content = ' data-background-video-muted="' + backgroundVideoMuted + '"' + JSONslide.content;
                }
                if (backgroundVideoLoop != false) {
                    JSONslide.content = ' data-background-video-loop="' + backgroundVideoLoop + '"' + JSONslide.content;
                }
                if (backgroundVideo != false) {
                    JSONslide.content = ' data-background-video="' + backgroundVideo + '"' + JSONslide.content;
                    JSONslide.content = this.replaceAttributeURL(JSONslide.content, JSONslide.content, 'data-background-video', SlideWikiURL + 'video/', SlideWikiFilename);
                }
                if (backgroundRepeat != false) {
                    JSONslide.content = ' data-background-repeat="' + backgroundRepeat + '"' + JSONslide.content;
                }
                if (backgroundPosition != false) {
                    JSONslide.content = ' data-background-position="' + backgroundPosition + '"' + JSONslide.content;
                }
                if (backgroundSize != false) {
                    JSONslide.content = ' data-background-size="' + backgroundSize + '"' + JSONslide.content;
                }
                if (backgroundImage != false) {
                    JSONslide.content = ' data-background-image="' + backgroundImage + '"' + JSONslide.content;
                    JSONslide.content = this.replaceAttributeURL(JSONslide.content, JSONslide.content, 'data-background-image', SlideWikiURL + 'image/', SlideWikiFilename);
                }
                if (backgroundColor != false) {
                    JSONslide.content = ' data-background-color="' + backgroundColor + '"' + JSONslide.content;
                }

                JSONslide.content = '<div' + JSONslide.content;
                JSONslide.content = JSONslide.content + '</div>';
            }

            // Objective: push the final slide element to children[] 
            JSONdeck.children.push(JSONslide);

            // Objective: Checking end of nested section tags w.r.t. vertical slides
            /*
             * (1) Checking if we're actually closing a nested section area
             * (1.1) Checking if we're acutally in a nested section 
             * (1.2) Consider the current html without whitespace / line breaks / tabulators etc.
             * (1.3) Checking if the occurrence of the next closed section tag is similar to position of the next doubled closed section tags in series 
             */
            if (checkNestedSection && html.replace(/\s/g, '').indexOf('</section></section>') == html.replace(/\s/g, '').indexOf('</section>')) {
                checkNestedSection = false;

                // Objective: remove the processed html parts / sections
                html = html.substring(end + 20, html.length);
            } else {
                // Objective: remove the processed html parts / sections
                html = html.substring(end + 10, html.length);
            }


            // Objective: Increment the slide counter for the overall slidesCount of the deck and next slide id
            slideCounter++;
        }

        JSONdeck.slidesCount = slideCounter;

        //console.log(JSONdeck);

        // Objective: Export JSON
        let fileJSON = 'presentationSlidewikiRevealImport.json';
        //writeFile(fileJSON, JSON.stringify(JSONdeck));

        let width = "960";
        let height = "700";
        return { slides: JSONdeck.children, slideSize: { 'width': width, 'height': height } }
    }

    // Function: getTag [Release: 2018/07/06]
    /*
     * (1) Search in html code for a tag
     * (2) Check if it is a regular / usable tag
     * (3.1) Return the tag content OR (3.2) false in the case of an error
     */
    getTag(html, tag, index = 0) {
        let tagStart = 0,
            tagEnd = 0;

        html = html.substring(index, html.length);

        // (1) Search in html code for a tag
        if (html.includes('<' + tag)) {
            tagStart = html.indexOf('<' + tag) + tag.length + 1;

            // (2) Check if it is a regular / usable tag
            if (html.includes('>', tagStart)) {
                tagEnd = html.indexOf('>', tagStart);

                // (3.1) Return the tag content 
                return html.substr(tagStart, tagEnd - tagStart).trim();
            }
        }

        // (3.2) Return false in the case of an error
        return false;
    }

    // Function: getAttribute [Release: 2018/07/06]
    /*
     * (1) Search in a tag for an attribute
     * (2) Check if it is a regular / usable attribute
     * (3.1) Return the attribute content OR (3.2) false in the case of an error
     */
    getAttribute(tag, attribute) {
        let attributeStart = 0,
            attributeEnd = 0;

        // (1) Search in a tag for an attribute
        if (tag.includes(attribute + '="')) {
            attributeStart = tag.indexOf(attribute + '="') + attribute.length + 2;

            // (2) Check if it is a regular / usable attribute
            if (tag.includes('"', attributeStart)) {
                attributeEnd = tag.indexOf('"', attributeStart);

                // (3.1) Return the attribute content 
                return tag.substr(attributeStart, attributeEnd - attributeStart);
            }

        }

        // (3.2) Return false in the case of an error
        return false;
    }

    // Function: getURLinCSS [Release: 2018/07/10]
    /*
     * (1) Search in a stylesheet for an url
     * (2) Check if it is a regular / usable url
     * (3.1) Return the url content OR (3.2) false in the case of an error
     */
    getURLinCSS(stylesheet, index = 0) {
        let urlStart = 0,
            urlEnd = 0;

        stylesheet = stylesheet.substring(index, stylesheet.length);

        // (1) Search in stylesheet for a url
        if (stylesheet.includes('url(')) {
            urlStart = stylesheet.indexOf('url(') + 1;

            // (2) Check if it is a regular / usable tag
            if (stylesheet.includes(')', urlStart)) {
                urlEnd = stylesheet.indexOf(')', urlStart);

                // (3.1) Return the tag content 
                return stylesheet.substr(urlStart, urlEnd - urlStart).trim();
            }
        }

        // (3.2) Return false in the case of an error
        return false;
    }

    // Function: replaceAttributeURL
    /*
     *
     */
    replaceAttributeURL(content, tagContent, attribute, url, filename) {
        return content;

        let srcPath = this.getAttribute(tagContent, attribute);
        let srcURL = '',
            srcFilename = '',
            SlideWikiURL = '',
            SlideWikiFilename = '';

        if (false != srcPath) {
            if (srcPath.includes("/")) {
                srcURL = srcPath.substr(0, srcPath.lastIndexOf('/') + 1);
                srcFilename = srcPath.substr(srcPath.lastIndexOf('/') + 1, srcPath.length - srcPath.lastIndexOf('/') - 1);
            } else {
                srcURL = '';
                srcFilename = srcPath;
            }

            // TODO: FileService
            /*
             * POST / COPY approach for media files
             */
            // TODO: correct url in SlideWiki to set
            SlideWikiURL = url;
            // TODO: correct filename in SlideWiki to set
            //SlideWikiFilename = filename
            SlideWikiFilename = srcFilename;

            // Objective: Replace srcURL/Filename with SlideWikiURL/Filename
            content = content.replace(srcURL + srcFilename, SlideWikiURL + SlideWikiFilename);
        }

        return content;
    }
}

module.exports = {
    RevealConvertor
};


/*
 * Test: Class RevealConvertor local by file reading
 */
/*
let testInstance = new RevealConvertor();

let test = 'TestZip/index.html';
//let test = 'RevealExamples/Operating-Systems-00-Motivation.html';
//let test = 'RevealExamples/Operating-Systems-01-Introduction.html';
//let test = 'RevealExamples/Operating-Systems-02-Interrupts.html';
//let test = 'RevealExamples/Operating-Systems-03-Threads.html';
//let test = 'RevealExamples/Operating-Systems-04-Scheduling.html';
//let test = 'RevealExamples/Operating-Systems-05-MX.html';
//let test = 'RevealExamples/Operating-Systems-06-MX-Java.html';
//let test = 'RevealExamples/Operating-Systems-07-MX-Challenges.html';
//let test = 'RevealExamples/Operating-Systems-08-Memory-I.html';
//let test = 'RevealExamples/Operating-Systems-09-Memory-II.html';
//let test = 'RevealExamples/Operating-Systems-10-Processes.html';
//let test = 'RevealExamples/Operating-Systems-11-Security.html';
//let test = 'RevealExamples/Operating-Systems-00-JiTT.html';

let finalDeck = testInstance.convertHTMLExport(test);

writeFile('output.json', JSON.stringify(finalDeck));
*/

/*
 * Way back testsing JSON2REVEAL
 */
/*
writeFile('reveal.js/test.html', HTMLcreateDeck(finalDeck));

function writeFile(file, content) {
    fs.writeFile(file, content, function(err) {
        if (err) {
            return console.log(err);
        }

    });
}

function HTMLcreateDeck(deck) {
    var content = '';

    content += HTMLcreateHeader(deck.title, deck.width, deck.height);

    for (var i = 0; i < deck.slides.length; i++) {
        content += '<section>';
        content += deck.slides[i].content;
        content += '</section>';
    }

    content += HTMLcreateFooter();

    return content;
}

function HTMLcreateHeader(title, width, height) {
    return '<html>' +
        '<head>' +
        '<meta charset="utf-8">' +
        '<title>' + title + '</title>' +
        '<link rel="stylesheet" href="css/reveal.css">' +
        '<link rel="stylesheet" href="css/theme/white.css">' +
        '<link rel="stylesheet" href="../slideWiki.css">' +
        '</head>' +
        '<body>' +
        '<div class="reveal">' +
        '<div class="slides">';

}


function HTMLcreateFooter() {
    return '</div>' +
        '</div>' +
        '<script src="lib/js/head.min.js"></script>' +
        '<script src="js/reveal.js"></script>' +
        '<script>' +
        'Reveal.initialize();' +
        '</script>' +
        '</body>' +
        '</html>'
}
*/