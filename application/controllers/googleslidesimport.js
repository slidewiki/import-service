'use strict';
//let imagehandler = require('./imagehandler.js');

/* GoogleSlides API constants */
const fs = require("fs");
const readline = require('readline');
const { google } = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/presentations.readonly'];
const TOKEN_PATH = 'token.json';
const request = require('request');
const imageDownloadPath = 'download/'

class GoogleSlidesConvertor {
    constructor() {}

    convertHTMLExport(data) {
        return this.JSONcreateDeck(data);
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

    JSONcreateDeck(presentation) {
        var JSONdeck = {
            //title: presentation.title,
            //id: "95843",
            //gogleId: presentation.presentationId,
            //type: "deck",
            //user: "4327",
            //theme: "undefined",
            children: []
        };

        if (typeof presentation.pageSize !== 'undefined') {
            JSONdeck.width = this.scaledEMU2PX(presentation.pageSize.width.magnitude, 1);
            JSONdeck.height = this.scaledEMU2PX(presentation.pageSize.height.magnitude, 1);
        }

        var JSONslide = {};
        var SlideWikiSlide;
        if (typeof presentation.slides != 'undefined') {
            for (var i = 0; i < presentation.slides.length; i++) {
                // 
                JSONslide = this.JSONcreateSlide(presentation.slides[i]);
                JSONslide = this.JSONcompleteLayout(presentation.layouts, JSONslide);
                SlideWikiSlide = { content: JSONslide.content, notes: JSONslide.speakernotes, title: JSONslide.title }
                JSONdeck.children.push(SlideWikiSlide);
            }
        }

        return { slides: JSONdeck.children, slideSize: { 'width': JSONdeck.width, 'height': JSONdeck.height } }
    }

    JSONcompleteLayout(layouts, JSONslide) {
        var JSONgoogleLayout = {};
        var JSONgoogleObjectLayout = {};

        for (var i = 0; i < layouts.length; i++) {
            if (layouts[i].objectId == JSONslide.LayoutObjId) {
                JSONgoogleLayout = layouts[i];
                break;
            }
        }

        if (JSONgoogleLayout != {}) {
            for (var j = 0; j < JSONslide.slideElements.length; j++) {
                if (typeof JSONslide.slideElements[j].content == 'undefined') {
                    continue;
                }
                for (var k = 0; k < JSONslide.slideElements[j].content.length; k++) {
                    for (var l = 0; l < JSONgoogleLayout.pageElements.length; l++) {
                        if (JSONslide.slideElements[j].content[k].parentObjectId == JSONgoogleLayout.pageElements[l].objectId) {
                            JSONgoogleObjectLayout = JSONgoogleLayout.pageElements[l];
                            break;
                        }
                        if (JSONgoogleObjectLayout != {}) {
                            break;
                        }
                    }
                    if (JSONgoogleObjectLayout != {}) {
                        break;
                    }
                }
                if (JSONgoogleObjectLayout != {}) {
                    break;
                }
            }
        }

        if (typeof JSONgoogleObjectLayout.shape == 'undefined') {
            return JSONslide;
        }

        var relatedContent = false;
        if (typeof JSONgoogleObjectLayout.shape.shapeProperties.contentAlignment != 'undefined') {
            for (var m = 0; m < JSONslide.slideElements.length; m++) {
                if (typeof JSONslide.slideElements[m].content != 'undefined') {
                    for (var n = 0; n < JSONslide.slideElements[m].content.length; n++) {
                        if (JSONslide.slideElements[m].content[n].parentObjectId == JSONgoogleObjectLayout.objectId) {
                            relatedContent = true;
                            break;
                        }
                    }
                }
                if (relatedContent) {
                    break;
                }
            }
        }

        if (!relatedContent) {
            return JSONslide;
        }

        JSONslide.slideElements[m].layout = {};

        if (typeof JSONgoogleObjectLayout.shape.shapeProperties.contentAlignment != 'undefined') {
            JSONslide.slideElements[m].layout.verticalAlign = JSONgoogleObjectLayout.shape.shapeProperties.contentAlignment;
        }

        if (typeof JSONgoogleObjectLayout.shape.text != 'undefined') {
            for (var o = 0; o < JSONgoogleObjectLayout.shape.text.textElements.length; o++) {
                if (typeof JSONgoogleObjectLayout.shape.text.textElements[o].textRun != 'undefined') {
                    if (typeof JSONgoogleObjectLayout.shape.text.textElements[o].textRun.style.fontSize != 'undefined') {
                        //console.log(JSONgoogleObjectLayout.shape.text.textElements[o].textRun.style.fontSize);

                        JSONslide.slideElements[m].layout.fontSize = JSONgoogleObjectLayout.shape.text.textElements[o].textRun.style.fontSize.magnitude + JSONgoogleObjectLayout.shape.text.textElements[o].textRun.style.fontSize.unit.toLowerCase();

                        break;
                    }
                }

            }
        }



        return JSONslide;
    }

    JSONcreateSlide(slide) {
        var JSONslides = {
            title: "New slide",
            content: "",
            speakernotes: "",
            user: "4327",
            id: "1337",
            type: "slide",
            GoogleObjId: slide.objectId,
            LayoutObjId: slide.slideProperties.layoutObjectId,
            slideElements: []
        };

        if (typeof slide.pageElements != 'undefined') {
            for (var i = 0; i < slide.pageElements.length; i++) {
                JSONslides.slideElements.push(this.JSONcreateSlideElement(slide.pageElements[i]));
                JSONslides.content += this.HTMLcreateSlideElement(JSONslides.slideElements[i]);
            }
        }


        return JSONslides;
    }

    JSONcreateSlideElement(element) {
        var JSONelement = {
            googleId: element.objectId,
            width: false,
            height: false
        };

        if (typeof element.size != 'undefined') {
            JSONelement.width = this.scaledEMU2PX(element.size.width.magnitude, element.transform.scaleX);
            JSONelement.height = this.scaledEMU2PX(element.size.height.magnitude, element.transform.scaleY);
        }

        if (typeof element.transform.translateX != 'undefined') {
            JSONelement.x = this.scaledEMU2PX(element.transform.translateX, 1)
        } else {
            JSONelement.x = 0;
        }

        if (typeof element.transform.translateY != 'undefined') {
            JSONelement.y = this.scaledEMU2PX(element.transform.translateY, 1)
        } else {
            JSONelement.y = 0;
        }

        if (typeof element.transform.shearX != 'undefined') {
            JSONelement.shearX = this.scaledEMU2PX(element.transform.shearX, 1);
        } else {
            JSONelement.shearX = 0;
        }

        if (typeof element.transform.shearY != 'undefined') {
            JSONelement.shearY = this.scaledEMU2PX(element.transform.shearY, 1);
        } else {
            JSONelement.shearY = 0;
        }


        if (typeof element.shape !== 'undefined' && typeof element.shape.placeholder !== 'undefined' && typeof element.shape.placeholder.type !== 'undefined') {
            JSONelement.contentType = element.shape.placeholder.type;
        } else if (typeof element.shape !== 'undefined' && typeof element.shape.shapeType !== 'undefined') {
            JSONelement.contentType = element.shape.shapeType;
        } else if (typeof element.table !== 'undefined') {
            JSONelement.contentType = 'TABLE';
        } else {
            JSONelement.contentType = 'NONE';
        }

        if (typeof element.shape !== 'undefined') {
            JSONelement.content = this.JSONcreateShape(element.shape, JSONelement.contentType);
        }

        if (typeof element.image !== 'undefined') {
            var imageTitle = '';

            if (typeof element.description != 'undefined') {
                imageTitle = element.description.replace(' ', '_');
            }

            JSONelement.image = this.JSONcreateImage(element.image, element.objectId, imageTitle);
            JSONelement.contentType = 'IMAGE';
        }

        if (typeof element.sheetsChart !== 'undefined') {
            var imageTitle = '';

            if (typeof element.title != 'undefined') {
                imageTitle = element.title.replace(' ', '_');
            }


            JSONelement.image = this.JSONcreateImage(element.sheetsChart, element.objectId, imageTitle);
            JSONelement.contentType = 'IMAGE';
        }

        if (typeof element.table !== 'undefined') {
            JSONelement.table = this.JSONcreateTable(element.table);
        }

        return JSONelement;
    };

    scaledEMU2PX(emu, scale) {
        return Math.round(emu / 12700 * scale * 1.33333333333333);
    };

    JSONcreateShape(shape, contentType) {
        var JSONcontent = {};

        if (shape.shapeType == 'TEXT_BOX' && typeof shape.text !== 'undefined' && typeof shape.text.textElements !== 'undefined') {
            JSONcontent = this.JSONcreateTextBox(shape.text, contentType, shape.placeholder);
        }

        return JSONcontent;
    }

    JSONcreateTextBox(text, contentType, placeholder) {
        var JSONcontent = [];
        var JSONtextElement = { "textType": "", "text": "", "html": "", "parentObjectId": "", "stylesheet": [] };

        if (typeof placeholder != 'undefined' && typeof placeholder.parentObjectId != 'undefined') {
            JSONtextElement.parentObjectId = placeholder.parentObjectId;
        }

        var listId = '';
        var nestingLevel = 0;

        var paragraphMarker = '';

        for (var i = 0; i < text.textElements.length; i++) {

            if (typeof text.textElements[i].textRun != 'undefined') {}

            if (typeof text.textElements[i] !== 'undefined' && typeof text.textElements[i].paragraphMarker !== 'undefined') {
                if (typeof text.textElements[i].paragraphMarker.bullet !== 'undefined' && text.textElements[i].paragraphMarker.bullet.listId !== 'undefined') {
                    listId = text.textElements[i].paragraphMarker.bullet.listId;
                    if (typeof text.textElements[i].paragraphMarker.bullet.nestingLevel !== 'undefined') {
                        nestingLevel = text.textElements[i].paragraphMarker.bullet.nestingLevel;
                    } else {
                        nestingLevel = 0;
                    }

                    paragraphMarker = 'listItem';
                } else {
                    paragraphMarker = 'paragraph';
                }

                if (i != 0) {
                    JSONcontent.push(JSONtextElement);
                    JSONtextElement = { "textType": "", "text": "", "html": "", "stylesheet": [] };
                }

                continue;
            }

            if (listId !== '') {
                JSONtextElement['textType'] = paragraphMarker;
                JSONtextElement['listId'] = listId;
                JSONtextElement['nestingLevel'] = nestingLevel;
                JSONtextElement['text'] += text.textElements[i].textRun.content.replace(/\n/, '').replace(/\u000b/, '\n');


                listId = '';
            } else if (typeof text.textElements[i].textRun !== 'undefined') {
                JSONtextElement['textType'] = paragraphMarker;
                JSONtextElement['text'] += text.textElements[i].textRun.content.replace(/\n/, '').replace(/\u000b/, '\n');

                if (typeof text.textElements[i].textRun.style !== 'undefined') {
                    var JSONstylesheet = {};

                    if (0 == JSONtextElement.stylesheet.length) {
                        JSONstylesheet.startChar = 0;
                    } else {
                        JSONstylesheet.startChar = JSONtextElement.stylesheet[JSONtextElement.stylesheet.length - 1].endChar + 1;
                    }

                    JSONstylesheet.endChar = text.textElements[i].endIndex - 1;
    

                    if (JSONstylesheet.startChar > JSONstylesheet.endChar) {
                        JSONstylesheet.endChar = JSONstylesheet.startChar;
                    }

                    if (typeof text.textElements[i].textRun.style.bold !== 'undefined' && text.textElements[i].textRun.style.bold) {
                        JSONstylesheet.bold = true;
                    } else {
                        JSONstylesheet.bold = false;
                    }

                    if (typeof text.textElements[i].textRun.style.italic !== 'undefined' && text.textElements[i].textRun.style.italic) {
                        JSONstylesheet.italic = true;
                    } else {
                        JSONstylesheet.italic = false;
                    }

                    if (typeof text.textElements[i].textRun.style.fontSize !== 'undefined') {
                        JSONstylesheet.fontSize = text.textElements[i].textRun.style.fontSize.magnitude;
                        JSONstylesheet.fontSize += text.textElements[i].textRun.style.fontSize.unit.toLowerCase();
                    } else {
                        JSONstylesheet.fontSize = false;
                    }

                    if (typeof text.textElements[i].textRun.style.link !== 'undefined') {
                        JSONstylesheet.link = text.textElements[i].textRun.style.link.url;
                    }

                    JSONtextElement.stylesheet.push(JSONstylesheet);
                }


                if ('TITLE' == contentType) {
                    JSONtextElement['textType'] = 'heading3';
                }

            }

            if (JSONtextElement.stylesheet.length == 0 && (listId !== '' || typeof text.textElements[i].textRun !== 'undefined')) {
                //console.log('Zweite:'+text.textElements[i].endIndex);
                if (typeof text.textElements[i].textRun.style !== 'undefined') {
                    var JSONstylesheet = {};
                    if (0 == JSONtextElement.stylesheet.length) {
                        JSONstylesheet.startChar = 0;
                        JSONstylesheet.endChar = text.textElements[i].textRun.content.length - 1;
                    } else {
                        JSONstylesheet.startChar = JSONtextElement.stylesheet[JSONtextElement.stylesheet.length - 1].endChar + 1;
                        JSONstylesheet.endChar = JSONtextElement.text.length - 1;
                    }

                    if (JSONstylesheet.startChar > JSONstylesheet.endChar) {
                        JSONstylesheet.endChar = JSONstylesheet.startChar;
                    }


                    if (typeof text.textElements[i].textRun.style.bold !== 'undefined' && text.textElements[i].textRun.style.bold == true) {
                        JSONstylesheet.bold = true;
                    } else {
                        JSONstylesheet.bold = false;
                    }

                    if (typeof text.textElements[i].textRun.style.italic !== 'undefined' && text.textElements[i].textRun.style.italic) {
                        JSONstylesheet.italic = true;
                    } else {
                        JSONstylesheet.italic = false;
                    }

                    if (typeof text.textElements[i].textRun.style.link !== 'undefined') {
                        JSONstylesheet.link = text.textElements[i].textRun.style.link.url;
                    }

                    if (JSONstylesheet.startChar != null) {
                        JSONtextElement.stylesheet.push(JSONstylesheet);
                    }

                }
            }
        }

        JSONcontent.push(JSONtextElement);

        for (var n = 0; n < JSONcontent.length; n++) {
            if (typeof JSONcontent[n].stylesheet != 'undefined' && JSONcontent[n].stylesheet.length > 0) {

                var charDiff = JSONcontent[n].text.length;

                for (var m = JSONcontent[n].stylesheet.length - 1; m >= 0; m--) {
                    if (m == JSONcontent[n].stylesheet.length - 1) {
                        charDiff = (parseInt(JSONcontent[n].stylesheet[m].endChar) - JSONcontent[n].text.length);
                    }

                    if (parseInt(JSONcontent[n].stylesheet[m].endChar) - charDiff < 0) {

                    }
                    if (m == 0) {
                        JSONcontent[n].stylesheet[m].endChar = parseInt(JSONcontent[n].stylesheet[m].endChar) - charDiff;
                    } else {
                        JSONcontent[n].stylesheet[m].startChar = parseInt(JSONcontent[n].stylesheet[m].startChar) - charDiff;
                        JSONcontent[n].stylesheet[m].endChar = parseInt(JSONcontent[n].stylesheet[m].endChar) - charDiff;
                    }
                }

            }
        }

        for (var k = 0; k < JSONcontent.length; k++) {
            var checkBold = false;
            var checkItalic = false;
            var checkLink = false;
            var checkLastLink = false;
            for (var j = 0; j < JSONcontent[k].stylesheet.length; j++) {
                if (JSONcontent[k].stylesheet[j].bold && checkBold == false) {
                    checkBold = true;
                    JSONcontent[k].html += '<b>';
                } else if (typeof JSONtextElement.stylesheet[j] != 'undefined' && JSONtextElement.stylesheet[j].bold == false && checkBold == true) {
                    checkBold = false;
                    JSONcontent[k].html += '</b>';
                }

                if (j + 1 == JSONcontent[k].stylesheet.length && true === checkBold) {
                    JSONcontent[k].html += '</b>';
                }

                if (JSONcontent[k].stylesheet[j].italic && checkItalic == false) {
                    checkItalic = true;
                    JSONcontent[k].html += '<i>';
                } else if (JSONcontent[k].stylesheet[j].italic == false && checkItalic == true) {
                    checkItalic = false;
                    JSONcontent[k].html += '</i>';
                }

                if (j + 1 == JSONcontent[k].stylesheet.length && true === checkItalic) {
                    JSONcontent[k].html += '</i>';
                }

                if (true === checkLink && (typeof JSONcontent[k].stylesheet[j].link == 'undefined' || (typeof JSONcontent[k].stylesheet[j].link != 'undefined' && JSONcontent[k].stylesheet[j].link != checkLastLink))) {
                    checkLink = false;
                    checkLastLink = false;
                    JSONcontent[k].html += '</a>';
                }

                if (typeof JSONcontent[k].stylesheet[j].link != 'undefined' && JSONcontent[k].stylesheet[j].link != checkLastLink) {
                    checkLink = true;
                    checkLastLink = JSONcontent[k].stylesheet[j].link;
                    JSONcontent[k].html += '<a href="' + JSONcontent[k].stylesheet[j].link + '">';
                }

                JSONcontent[k].html += JSONcontent[k].text.substr(JSONcontent[k].stylesheet[j].startChar, JSONcontent[k].stylesheet[j].endChar - JSONcontent[k].stylesheet[j].startChar + 1);
            }
        }

        return JSONcontent;
    }

    JSONcreateImage(image, objectId, imageTitle) {
        var JSONimage = {
            title: imageTitle,
            url: '' + objectId + '_' + imageTitle
        };

        try {
            request(image.contentUrl).pipe(fs.createWriteStream(imageDownloadPath + objectId + '_' + imageTitle.replace(/[^a-zA-Z0-9_-]/g, ''))).on('close', function(err, res, body) {
            });
        } catch (err) {
            console.log(err);
        }

        return JSONimage;
    }

    JSONcreateTable(table) {
        var JSONtable = {
            rows: []
        };

        JSONtable.columns = table.columns;

        for (var i = 0; i < table.tableRows.length; i++) {
            JSONtable.rows.push(this.JSONcreateTableRow(table.tableRows[i]));
        }


        return JSONtable;
    }

    JSONcreateTableRow(row) {
        var JSONtableRow = {
            cells: []
        };

        for (var i = 0; i < row.tableCells.length; i++) {
            JSONtableRow.cells.push(this.JSONcreateTableCell(row.tableCells[i]));
        }

        return JSONtableRow;
    }

    JSONcreateTableCell(cell) {
        var JSONtableCell = {
            texts: []
        };

        if (typeof cell.text != 'undefined') {
            for (var i = 0; i < cell.text.textElements.length; i++) {
                if (typeof cell.text.textElements[i].textRun !== 'undefined') {
                    JSONtableCell.texts.push(this.JSONcreateTextElement('TABLE', undefined, cell.text.textElements[i]));
                }
            }
        }
        return JSONtableCell;
    }

    JSONcreateTextElement(shapeType, listType, textElement) {
        var JSONtextElement = {};

        var shapeText;

        if (typeof textElement.textRun !== 'undefined') {
            shapeText = htmlspecialchars(textElement.textRun.content);
            shapeText = shapeText.replace(/\n/, '').replace(/\u000b/, '\n');
        }

        if ('CENTERED_TITLE' == shapeType) {
            JSONtextElement.deckTitle = shapeText;
        }

        if ('SUBTITLE' == shapeType) {
            JSONtextElement.subtitle = shapeText;
        }

        if ('TITLE' == shapeType) {
            JSONtextElement.title = shapeText;
        }

        if ('BODY' == shapeType && listType === undefined) {
            JSONtextElement.paragraph = shapeText;
        }

        if ('BODY' == shapeType && listType == 'bulleted') {
            JSONtextElement.listElement = shapeText;
        }

        if ('NONE' == shapeType && listType === undefined) {
            JSONtextElement.paragraph = shapeText;
        }

        if ('TABLE' == shapeType) {
            JSONtextElement.text = htmlspecialchars(shapeText);
        }

        return JSONtextElement;
    }

    HTMLcreateDeck(deck) {
        var content = '';

        content += this.HTMLcreateHeader(deck.title, deck.width, deck.height);

        for (var i = 0; i < deck.children.length; i++) {
            content += this.HTMLcreateSlide(deck.children[i], deck.width, deck.height);
        }

        content += this.HTMLcreateFooter();

        return content;
    }

    HTMLcreateSlide(slide, width, height) {
        var content = '';

        content += '<section style="width: ' + width + 'px; height: ' + height + 'px; font-size: 20pt; text-align: left;">';

        for (var i = 0; i < slide.slideElements.length; i++) {
            content += this.HTMLcreateSlideElement(slide.slideElements[i]);
        }

        content += '</section>';

        return content;
    }

    HTMLcreateSlideElement(slideElement) {
        var content = '';

        var stylesheet = 'position: absolute; ' +
            'width: ' + slideElement.width + 'px; ' +
            'height: ' + slideElement.height + 'px; ' +
            'top: ' + slideElement.y + 'px; ' +
            'left: ' + slideElement.x + 'px; ' +
            '';



        if (typeof slideElement.contentType !== 'undefined' && slideElement.contentType == 'TABLE') {
            var stylesheet = 'position: absolute; ' +
                'width: ' + slideElement.width * slideElement.table.columns + 'px; ' +
                'height: ' + slideElement.height + 'px; ' +
                'top: ' + slideElement.y + 'px; ' +
                'left: ' + slideElement.x + 'px; ' +
                'font-size: 16pt';
        }

        if (typeof slideElement.layout != 'undefined' && typeof slideElement.layout.verticalAlign != 'undefined' && 'BOTTOM' == slideElement.layout.verticalAlign) {
            if (typeof slideElement.layout != 'undefined' && typeof slideElement.layout.fontSize != 'undefined' && false !== slideElement.layout.fontSize) {
                stylesheet += "margin-top: " + (slideElement.height - (parseInt(slideElement.layout.fontSize) * 1.3333)) + "px;";

            }

        }


        var stylesheetLayout = 'position: absolute; ' +
            'width: ' + slideElement.width + 'px; ' +
            'height: ' + slideElement.height + 'px; ' +
            'top: ' + slideElement.y + 'px; ' +
            'left: ' + slideElement.x + 'px; ' +
            '';

        if (typeof slideElement.contentType == 'undefined') {
            return '<h1>Fehler - Kein ContentType feststellbar!</h1>';
        }

        if (slideElement.contentType == 'CENTERED_TITLE') {
            content += '<div class="deck_title" style="' + stylesheet + '">';

            for (var i = 0; i < slideElement.content.length; i++) {
                var fontSize = '';
                if (typeof slideElement.content[i].stylesheet !== 'undefined' && slideElement.content[i].stylesheet.length > 0 && typeof slideElement.content[i].stylesheet[0].fontSize != 'undefined' && false !== slideElement.content[i].stylesheet[0].fontSize) {
                    fontSize = 'font-size: ' + slideElement.content[i].stylesheet[0].fontSize + '; ';
                } else if (typeof slideElement.layout != 'undefined' && typeof slideElement.layout.fontSize != 'undefined' && false !== slideElement.layout.fontSize) {
                    fontSize = 'font-size: ' + slideElement.layout.fontSize + '; ';
                } else {
                    fontSize = 'font-size: 32pt; ';
                }

                var textAlign = 'text-align: center;'

                content += '<h1 style="' + fontSize + textAlign + '">' + slideElement.content[i].text + '</h1>';
            }

            content += '</div>';
        }

        if (slideElement.contentType == 'SUBTITLE') {
            content += '<div class="deck_subtitle" style="' + stylesheet + '">';

            for (var i = 0; i < slideElement.content.length; i++) {
                var fontSize = '';
                if (typeof slideElement.content[i].stylesheet !== 'undefined' && slideElement.content[i].stylesheet.length > 0 && typeof slideElement.content[i].stylesheet[0].fontSize != 'undefined' && false !== typeof slideElement.content[i].stylesheet[0].fontSize) {
                    fontSize = 'font-size: ' + slideElement.content[i].stylesheet[0].fontSize + '; ';
                }
                content += '<h' + (i + 2) + ' style="' + fontSize + '">' + slideElement.content[i].text + '</h' + (i + 2) + '>';
            }

            content += '</div>';
        }

        if (slideElement.contentType == 'TITLE') {
            content += '<div class="slide_title" style="' + stylesheetLayout + '">';

            for (var i = 0; i < slideElement.content.length; i++) {
                if (typeof slideElement.content[i].stylesheet[0].fontSize !== 'undefined' && slideElement.content[i].stylesheet[0].fontSize !== false) {
                    content += '<h' + (i + 3) + ' style="font-size: ' + slideElement.content[i].stylesheet[0].fontSize + ';">' + slideElement.content[i].text + '</h' + (i + 3) + '>';
                } else {
                    content += '<h' + (i + 3) + ' style="font-size: ' + (28 - 2 * i) + 'pt;">' + slideElement.content[i].text + '</h' + (i + 3) + '>';
                }
            }

            content += '</div>';
        }

        if (slideElement.contentType == 'BODY' || slideElement.contentType == 'TEXT_BOX') {
            if ('BODY' == slideElement.contentType) {
                var stylesheet = 'position: absolute; width: ' + slideElement.width + 'px; ' +
                    'height: ' + slideElement.height + 'px; ' +
                    'top: ' + slideElement.y + 'px; ' +
                    'left: ' + slideElement.x + 'px; ' +
                    '';

                content += '<div class="text_box" style="' + stylesheet + '">';
            } else if ('TEXT_BOX' == slideElement.contentType) {
                var stylesheet = 'position: absolute; ' +
                    'width: ' + slideElement.width + 'px; ' +
                    'height: ' + slideElement.height + 'px; ' +
                    'top: ' + slideElement.y + 'px; ' +
                    'left: ' + slideElement.x + 'px; ' +
                    '';

                content += '<div class="text_box" style="' + stylesheet + '">';
            }

            var listId = '';
            var listCounter = 0;
            var nestingLevel = 0;

            for (var i = 0; i < slideElement.content.length; i++) {
                if (slideElement.content[i].textType == 'listItem') {

                    if (listId != slideElement.content[i].listId) {
                        listId = slideElement.content[i].listId;
                        content += '<ul>';
                        listCounter = 0;
                    }

                    if (slideElement.content[i].nestingLevel > nestingLevel) {
                        content += '<ul>';
                        nestingLevel = slideElement.content[i].nestingLevel;
                        listCounter = 0;
                    } else if (slideElement.content[i].nestingLevel < nestingLevel) {
                        for (var k = 0; k < (nestingLevel - slideElement.content[i].nestingLevel); k++) {
                            content += '</li></ul></li>';
                        }
                        nestingLevel = slideElement.content[i].nestingLevel;
                        listCounter = 0;
                    }

                    if (listCounter != 0) {
                        content += '</li>';
                    }
                    listCounter++;

                    content += '<li>' + slideElement.content[i].html + '';
                }

                if (slideElement.content[i].textType != 'listItem' && listId != '') {
                    for (var j = 0; j < nestingLevel; j++) {
                        content += '</li></ul>';
                    }
                    nestingLevel = 0;

                    content += '</li></ul>';
                    listId = '';
                }

                if (slideElement.content[i].textType == 'paragraph') {
                    var stylesheetParagraph = '';

                    if (typeof slideElement.content[i].stylesheet !== 'undefined' && slideElement.content[i].stylesheet.length > 0 && typeof slideElement.content[i].stylesheet[0].fontSize !== 'undefined' && slideElement.content[i].stylesheet[0].fontSize !== false) {
                        var stylesheetParagraph = 'font-size: ' + slideElement.content[i].stylesheet[0].fontSize + ';';
                    }

                    content += '<p style="' + stylesheetParagraph + '">' + slideElement.content[i].html + '</p>';
                }

            }

            for (var j = 0; j < nestingLevel; j++) {
                content += '</li></ul>';
            }

            if (listId != '') {
                content += '</li></ul>';
            }

            content += '</div>'
        }

        if (slideElement.contentType == 'TABLE') {
            content += '<div style="' + stylesheet + '"><table style="width: 80%; margin-left: 0;">';
            for (var k = 0; k < slideElement.table.rows.length; k++) {
                content += '<tr>';

                for (var l = 0; l < slideElement.table.rows[k].cells.length; l++) {
                    for (var m = 0; m < slideElement.table.rows[k].cells[l].texts.length; m++) {
                        content += '<td>' + slideElement.table.rows[k].cells[l].texts[m].text + '</td>';
                    }
                }

                content += '</tr>';
            }
            content += '</table></div>'
        }

        if (slideElement.contentType == 'IMAGE') {
            var imageTitle = slideElement.image.title;

            var stylesheet = 'position: absolute; ' +
                'margin-top: 0px; ' +
                'margin-right: 0px; ' +
                'margin-bottom: 0px; ' +
                'margin-left: 0px; ' +
                'border: 0px;';

            var stylesheetBox = 'position: absolute; ' +
                'overflow: hidden;' +
                'width: ' + slideElement.width + 'px; ' +
                'height: ' + slideElement.height + 'px; ' +
                'top: ' + slideElement.y + 'px; ' +
                'left: ' + slideElement.x + 'px; ';

            content += '<div style="' + stylesheetBox + '"><img src="' +
                imageDownloadPath + slideElement.image.url.replace(/[^a-zA-Z0-9_-]/g, '') + '" title="' + slideElement.image.title + '" alt="' + slideElement.image.title + '"  style="' + stylesheet + '"></div>';
        }

        return content;
    };

    HTMLcreateShape(shape) {
        var content = '';

        var shapeType;
        if (typeof shape.placeholder !== 'undefined') {
            if (typeof shape.placeholder.type !== 'undefined') {
                shapeType = shape.placeholder.type;
            }
        } else if (typeof shape.table != 'undefined') {
            shapeType = 'TABLE';

        } else {
            shapeType = 'NONE';
        }

        if (typeof shape.text !== 'undefined') {
            var listType = undefined;
            var nestingLevel = 0;
            var nestingLevelNew = 0;

            if (typeof shape.text.lists !== 'undefined') {
                listType = 'bulleted';
                content += '<ul>';
            }

            for (var i = 0; i < shape.text.textElements.length; i++) {
                if (listType == 'bulleted') {
                    if (typeof shape.text.textElements[i].paragraphMarker !== 'undefined') {
                        if (typeof shape.text.textElements[i].paragraphMarker.bullet !== 'undefined') {
                            if (typeof shape.text.textElements[i].paragraphMarker.bullet.nestingLevel !== 'undefined') {
                                nestingLevelNew = shape.text.textElements[i].paragraphMarker.bullet.nestingLevel;
                            } else {
                                nestingLevelNew = 0;
                            }
                        }
                    }
                }

                if (typeof shape.text.textElements[i].paragraphMarker !== 'undefined' && nestingLevel < nestingLevelNew) {
                    content = content.substr(0, content.lastIndexOf('</li>'));
                    content += '<ul>';
                }
                content += this.HTMLcreateTextElement(shapeType, listType, shape.text.textElements[i]);

                if (typeof shape.text.textElements[i].paragraphMarker !== 'undefined' && nestingLevel > nestingLevelNew) {
                    content += '</ul></li>';
                }
                nestingLevel = nestingLevelNew;
            }

            for (var i = 0; i < nestingLevel; i++) {
                content += '</ul></li>';
            }

            if (listType == 'bulleted') {
                content += '</ul>';
            }
        }

        return content;
    }

    HTMLcreateTextElement(shapeType, listType, textElement) {
        var content = '';

        var shapeText;

        if (typeof textElement.textRun !== 'undefined') {
            shapeText = htmlspecialchars(textElement.textRun.content);
            shapeText = shapeText.replace(/\n/, '');
        } else {
            return '';
        }

        if ('CENTERED_TITLE' == shapeType) {
            content += '<h1 style="font-size: 32pt;">' + shapeText + '</h1>';
        }

        if ('SUBTITLE' == shapeType) {
            content += '<h2 style="font-size: 30pt;">' + shapeText + '</h2>';
        }

        if ('TITLE' == shapeType) {
            content += '<h3 style="font-size: 28pt;">' + shapeText + '</h3>';
        }

        if ('BODY' == shapeType && listType === undefined) {
            content += '<p>' + shapeText + '</p>';
        }

        if ('BODY' == shapeType && listType == 'bulleted') {
            content += '<li>' + shapeText + '</li>';
        }

        if ('NONE' == shapeType && listType === undefined) {
            content += '<p>' + shapeText + '</p>';
        }

        if ('TABLE' == shapeType) {
            content += shapeText
        }

        return content;
    }

    HTMLcreateImage(image, filename) {
        var self = this;

        var content = '';
        var fileType = '';

        try {
            request(image.contentUrl).pipe(fs.createWriteStream(imageDownloadPath + filename.replace(/[^a-zA-Z0-9_-]/g, ''))).on('close', function(err, res, body) {
            });
        } catch (err) {
            console.log(err);
        }

        content = '<div><img style="border: 0px;" src="' +
            imageDownloadPath + filename + '"></div>';

        return content;
    }

    HTMLcreateTable(table) {
        var content = '';

        content += '<table border="1" cellpadding="1" cellspacing="1">';
        for (var i = 0; i < table.tableRows.length; i++) {
            content += this.HTMLcreateTableRow(table.tableRows[i]);
        }

        content += '</table>';

        return content;
    }

    HTMLcreateTableRow(row) {
        var content = '';

        content += '<tr>';

        for (var i = 0; i < row.tableCells.length; i++) {
            content += this.HTMLcreateTableCell(row.tableCells[i]);
        }

        content += '</tr>';

        return content;
    }

    HTMLcreateTableCell(cell) {
        var content = '';

        content += '<td>';

        for (var i = 0; i < cell.text.textElements.length; i++) {

            content += this.HTMLcreateTextElement('TABLE', undefined, cell.text.textElements[i]);
        }

        content += '</td>';

        return content;
    }
}

module.exports = {
    GoogleSlidesConvertor
};


/*
 * Test: Class RevealConvertor local by file reading
 */

let googleSlidesConvertor = new GoogleSlidesConvertor();

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Slides API.
    authorize(JSON.parse(content), listSlides);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Prints the number of slides and elements in a sample presentation:
 * https://docs.google.com/presentation/d/1EAYk18WDjIG-zp_0vLm3CsfQh_i8eXc67Jo2O9C6Vuc/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listSlides(auth) {
    const slides = google.slides({ version: 'v1', auth });
    slides.presentations.get({
        presentationId: '1YgZz4MhnnqkYwUsnT_YFf3ToO-RSorkd35IQM6boXbc',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        let test = googleSlidesConvertor.convertHTMLExport(res.data);
        console.log(test);
    });
}