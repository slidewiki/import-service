"use strict";
//'use strict';
//jszip = require('./jszip.min.js');
let JSZip = require('./jszip.min.js');
const util = require('util');
//import JSZip from './jszip.min';

let highlight = require('./highlight.min.js');
let colz = require('./colz.class.min.js');
let tXml = require('./tXml.js');
let functions = require('./functions.js');

// import tXml from './tXml.js';

//TODO INCLUDE THESE SCRIPTS
//importScripts(
//	'./jszip.min.js',
//	'./highlight.min.js',
//	'./colz.class.min.js',
//	'./highlight.min.js',
//	'./tXml.js',
//	'./functions.js'
//);


//class Worker {

//TODO - check if functionality from processSingleMsg (after processmsgqueue below) in pptx2html.js is missing..
/*
onmessage = function(e) {

	switch (e.data.type) {
		case "processPPTX":
			processPPTX(e.data.data);
			break;
		case "getMsgQueue":
			self.postMessage({
				"type": "processMsgQueue",
				"data": MsgQueue
			});
			break;
		default:
	}

}
*/
//let self = module.exports = {
class Convertor {
    //constructor(data)
    constructor()
    {

        this.chartID = 0;

        this.titleFontSize = 42;
        this.bodyFontSize = 20;
        this.otherFontSize = 16;

        this.filesInfo; //= this.getContentTypes(zip);
        this.slideSize; //= this.getSlideSize(zip);
        this.themeContent; //= this.loadTheme(zip);

    //alert(this.themeContent);
        this.slideHtml;
        this.totalHtmlResult;

        this.eachElement;

        this.slides = [];

        this.currentSlide = {
          title: '',
          ctrTitle: '',
          subTitle: '',
          content: '',
          notes: ''
        };
        //return this.processPPTX(data);

        this.user = '';
    }

    convertFirstSlide(data) {
        let zip = new JSZip(data);
        this.filesInfo = this.getContentTypes(zip);
        this.slideSize = this.getSlideSize(zip);
        this.themeContent = this.loadTheme(zip);
        const noOfSlides = this.filesInfo["slides"].length;

        const filename = this.filesInfo["slides"][0];
        this.currentSlide.content = this.processSingleSlide(zip, filename, 0, this.slideSize);
        this.currentSlide.notes = this.processSingleSlideNotes(zip, filename, 0, this.slideSize);//Dejan added this to process notes

        this.slides.push(this.currentSlide);
        this.currentSlide = {
          title: '',
          ctrTitle: '',
          subTitle: '',
          content: '',
          notes: ''
        };

        return {
          firstSlide: this.slides[0],
          noOfSlides: noOfSlides
        }
    }
    //var MsgQueue = new Array();

    //var themeContent = null;

    processPPTX(data) {

        let dateBefore = new Date();

        let zip = new JSZip(data);
        let startAtSlide = 1;
        if (this.filesInfo === undefined) {//if convertFirstSlide was not called
            this.filesInfo = this.getContentTypes(zip);
            this.slideSize = this.getSlideSize(zip);
            this.themeContent = this.loadTheme(zip);
            startAtSlide = 0;
        }

        //this.totalHtmlResult = '';

        if (zip.file('docProps/thumbnail.jpeg') !== null) {
            let pptxThumbImg = functions.base64ArrayBuffer(zip.file('docProps/thumbnail.jpeg').asArrayBuffer());
    		//self.postMessage({
    		//	"type": "pptx-thumb",
    		//	"data": pptxThumbImg
    		//});
            //this.totalHtmlResult += pptxThumbImg;
        }



    this.totalHtmlResult += this.filesInfo;
    this.totalHtmlResult += this.slideSize;
    this.totalHtmlResult += this.themeContent;
    //console.log('test' + this.totalHtmlResult);

    this.slideHtml = '';//Dejan uncommented this to remove the first 'undefined'

	var numOfSlides = this.filesInfo["slides"].length;
	for (var i=startAtSlide; i<numOfSlides; i++) {
		var filename = this.filesInfo["slides"][i];

    this.currentSlide.content = this.processSingleSlide(zip, filename, i, this.slideSize);
    this.currentSlide.notes = this.processSingleSlideNotes(zip, filename, i, this.slideSize);//Dejan added this to process notes

    this.slideHtml += this.currentSlide.content +
    "<div class='pptx2html' style='position: relative;left:" + (this.slideSize.width + 5) + "px;top:-" + this.slideSize.height + "px;'>" +
    this.currentSlide.notes +
    "</div>";
		//self.postMessage({
		//	"type": "slide",
		//	"data": slideHtml
		//});
		//self.postMessage({
		//	"type": "progress-update",
		//	"data": (i + 1) * 100 / numOfSlides
		//});

    this.slides.push(this.currentSlide);
    this.currentSlide = {
      title: '',
      ctrTitle: '',
      subTitle: '',
      content: '',
      notes: ''
    };
	}
	var dateAfter = new Date();
	//self.postMessage({
	//	"type": "ExecutionTime",
	//	"data": dateAfter - dateBefore
	//});
    let ExecutionTime = dateAfter - dateBefore;
    console.log('execution time: '+ExecutionTime);
    // console.log('slideHtml', this.slideHtml);

    //console.log('slideHtml'+this.slideHtml);
    //console.log('slideHtml'+slideHtml+'this.totalHtmlResult'+this.totalHtmlResult);
    //this.totalHtmlResult += slideHtml;
    // return this.slideHtml;
    return this.slides;

    /*TODO:
    ALt tags (content placeholders) for images: located in p:sld, p:cSld, p:spTree, p:pic, p:nvPicPr, p:cNvPr, attrs, descr:
    background-color, see step 3 below

    */
}

readXmlFile(zip, filename) {
    let x = new tXml(zip.file(filename).asText());
    //return x.simplify(x.parseChildren());
    return x.parseChildren(zip.file(filename).asText());
    //return x.getXML();
	//return tXml.getXML(zip.file(filename).asText());
    //return tXml(zip.file(filename).asText());
}

getContentTypes(zip) {
	var ContentTypesJson = this.readXmlFile(zip, "[Content_Types].xml");
    //console.log('ContentTypesJson' + ContentTypesJson);
	var subObj = ContentTypesJson["Types"]["Override"];
	var slidesLocArray = [];
	var slideLayoutsLocArray = [];
	for (var i=0; i<subObj.length; i++) {
		switch (subObj[i]["attrs"]["ContentType"]) {
			case "application/vnd.openxmlformats-officedocument.presentationml.slide+xml":
				slidesLocArray.push(subObj[i]["attrs"]["PartName"].substr(1));
				break;
			case "application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml":
				slideLayoutsLocArray.push(subObj[i]["attrs"]["PartName"].substr(1));
				break;
			default:
		}
	}
	return {
		"slides": slidesLocArray,
		"slideLayouts": slideLayoutsLocArray
	};
}

getSlideSize(zip) {
	// Pixel = EMUs * Resolution / 914400;  (Resolution = 96)
	var content = this.readXmlFile(zip, "ppt/presentation.xml");
	var sldSzAttrs = content["p:presentation"]["p:sldSz"]["attrs"]
	return {
		"width": parseInt(sldSzAttrs["cx"]) * 96 / 914400,
		"height": parseInt(sldSzAttrs["cy"]) * 96 / 914400
	};
}

loadTheme(zip) {
	var preResContent = this.readXmlFile(zip, "ppt/_rels/presentation.xml.rels");
	var relationshipArray = preResContent["Relationships"]["Relationship"];
    //console.log(relationshipArray);
	var themeURI = undefined;
	if (relationshipArray.constructor === Array) {
		for (var i=0; i<relationshipArray.length; i++) {
			if (relationshipArray[i]["attrs"]["Type"] === "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme") {
				themeURI = relationshipArray[i]["attrs"]["Target"];
				break;
			}
		}
	} else if (relationshipArray["attrs"]["Type"] === "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme") {
		themeURI = relationshipArray["attrs"]["Target"];
	}

	if (themeURI === undefined) {
		throw Error("Can't open theme file.");
	}

	return this.readXmlFile(zip, "ppt/" + themeURI);
}

processSingleSlide(zip, sldFileName, index, slideSize) {

	//self.postMessage({
	//	"type": "INFO",
	//	"data": "Processing slide" + (index + 1)
	//});

	// =====< Step 1 >=====
	// Read relationship filename of the slide (Get slideLayoutXX.xml)
	// @sldFileName: ppt/slides/slide1.xml
	// @resName: ppt/slides/_rels/slide1.xml.rels
	var resName = sldFileName.replace("slides/slide", "slides/_rels/slide") + ".rels";
	var resContent = this.readXmlFile(zip, resName);
	var RelationshipArray = resContent["Relationships"]["Relationship"];
	var layoutFilename = "";
	var slideResObj = {};
	if (RelationshipArray.constructor === Array) {
		for (var i=0; i<RelationshipArray.length; i++) {
			switch (RelationshipArray[i]["attrs"]["Type"]) {
				case "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout":
					layoutFilename = RelationshipArray[i]["attrs"]["Target"].replace("../", "ppt/");
					break;
				case "http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide":
				case "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image":
				case "http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart":
				case "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink":
				default:
					slideResObj[RelationshipArray[i]["attrs"]["Id"]] = {
						"type": RelationshipArray[i]["attrs"]["Type"].replace("http://schemas.openxmlformats.org/officeDocument/2006/relationships/", ""),
						"target": RelationshipArray[i]["attrs"]["Target"].replace("../", "ppt/")
					};
			}
		}
	} else {
		layoutFilename = RelationshipArray["attrs"]["Target"].replace("../", "ppt/");
	}

	// Open slideLayoutXX.xml
	var slideLayoutContent = this.readXmlFile(zip, layoutFilename);
	var slideLayoutTables = this.indexNodes(slideLayoutContent);
	//debug(slideLayoutTables);

	// =====< Step 2 >=====
	// Read slide master filename of the slidelayout (Get slideMasterXX.xml)
	// @resName: ppt/slideLayouts/slideLayout1.xml
	// @masterName: ppt/slideLayouts/_rels/slideLayout1.xml.rels
	var slideLayoutResFilename = layoutFilename.replace("slideLayouts/slideLayout", "slideLayouts/_rels/slideLayout") + ".rels";
	var slideLayoutResContent = this.readXmlFile(zip, slideLayoutResFilename);
	RelationshipArray = slideLayoutResContent["Relationships"]["Relationship"];
	var masterFilename = "";
	if (RelationshipArray.constructor === Array) {
		for (var i=0; i<RelationshipArray.length; i++) {
			switch (RelationshipArray[i]["attrs"]["Type"]) {
				case "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster":
					masterFilename = RelationshipArray[i]["attrs"]["Target"].replace("../", "ppt/");
					break;
				default:
			}
		}
	} else {
		masterFilename = RelationshipArray["attrs"]["Target"].replace("../", "ppt/");
	}
	// Open slideMasterXX.xml
	var slideMasterContent = this.readXmlFile(zip, masterFilename);
	var slideMasterTextStyles = this.getTextByPathList(slideMasterContent, ["p:sldMaster", "p:txStyles"]);
	var slideMasterTables = this.indexNodes(slideMasterContent);
	//debug(slideMasterTables);


	// =====< Step 3 >=====
	var content = this.readXmlFile(zip, sldFileName);
    //console.log('bgcolor check, content = ' + content+ ', path = ' + ["p:sld", "p:cSld", "p:bg", "p:bgPr", "a:solidFill", "a:srgbClr", "attrs", "val"] );
    //console.log(content);
	var bgColor = this.getTextByPathList(content, ["p:sld", "p:cSld", "p:bg", "p:bgPr", "a:solidFill", "a:srgbClr", "attrs", "val"]);
	if (bgColor === undefined) {
        //klaas: try scheme color == needs convertion to HEX RGB!!! e.g. accent2 is dark-red in default schemeClr
        //this is an improvement over PPTX2HTML, however, the drawback is that the colors can be incorrect if a different scheme is assigned.
        bgColor = this.getTextByPathList(content, ["p:sld", "p:cSld", "p:bg", "p:bgPr", "a:solidFill", "a:schemeClr", "attrs", "val"]);

        //assign default scheme RGB color codes for powerpoint 2016 for mac
        //this does not work well if people change the default color scheme, or if they apply a different theme
        switch(bgColor){
        case 'bg1':
            bgColor = "FFFFFF";
            break;
        case 'tx1':
            bgColor = "000000";
            break;
        case 'bg2':
            bgColor = "E7E6E6";
            break;
        case 'tx2':
            bgColor = "44546A";
            break;
        case 'accent1':
            bgColor = "5B9BD5";
            break;
        case 'accent2':
            bgColor = "ED7D31";
            break;
        case 'accent3':
            bgColor = "A5A5A5";
            break;
        case 'accent4':
            bgColor = "FFC000";
            break;
        case 'accent5':
            bgColor = "4472C4";
            break;
        case 'accent6':
            bgColor = "70AD47";
            break;
        }
        if (bgColor === undefined) {
		    bgColor = "FFFFFF";
        }
	}
	var nodes = content["p:sld"]["p:cSld"]["p:spTree"];
	var warpObj = {
		"zip": zip,
		"slideLayoutTables": slideLayoutTables,
		"slideMasterTables": slideMasterTables,
		"slideResObj": slideResObj,
		"slideMasterTextStyles": slideMasterTextStyles
	};

	//var result = "<section style='position: absolute;width:" + slideSize.width + "px; height:" + slideSize.height + "px; background-color: #" + bgColor + "'>"
    //var result = "<div style='position: absolute;width:" + slideSize.width + "px; height:" + slideSize.height + "px; background-color: #" + bgColor + "'>"
    //var result = "<div style='position: absolute;border-style: dotted; background-color: #" + bgColor + "' >"
    //var result = "<div style='position: absolute;border-style: dotted; background-color: #" + bgColor + "' >"
    var result = "<div class='pptx2html' style='position: relative;width:" + slideSize.width + "px; height:" + slideSize.height + "px; background-color: #" + bgColor + "'>"


	for (var nodeKey in nodes) {
        let that = this;
		if (nodes[nodeKey].constructor === Array) {
			for (var i=0; i<nodes[nodeKey].length; i++) {
                //console.log('nodeinslide' . nodes);
				result += that.processNodesInSlide(nodeKey, nodes[nodeKey][i], warpObj);
			}
		} else {
			result += that.processNodesInSlide(nodeKey, nodes[nodeKey], warpObj);
            //console.log('nodeinslide');
		}
	}

	//return result + "</section>";
    return result + "</div>";
}

processSingleSlideNotes(zip, sldFileName, index, slideSize) {

	var resName = sldFileName.replace("slides/slide", "slides/_rels/slide") + ".rels";
	var resContent = this.readXmlFile(zip, resName);
	var RelationshipArray = resContent["Relationships"]["Relationship"];

  var notesFilename = "";

	if (RelationshipArray.constructor === Array) {
		for (var i=0; i<RelationshipArray.length; i++) {
			switch (RelationshipArray[i]["attrs"]["Type"]) {
				case "http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide":
					notesFilename = RelationshipArray[i]["attrs"]["Target"].replace("../", "ppt/");
					break;
				default:

			}
		}
	}

  var notes = "";
  if (notesFilename !== "") {
    // Open notesSlideXX.xml
    // var notesSlideContent = this.readXmlFile(zip, notesFilename);
    // var notesSlideTables = this.indexNodes(notesSlideContent);

    //THIS IS LIKE STEP 2 FOR NOTES
    // var notesSlideResFilename = notesFilename.replace("notesSlides/notesSlide", "notesSlides/_rels/notesSlide") + ".rels";
  	// var notesSlideResContent = this.readXmlFile(zip, notesSlideResFilename);
  	// RelationshipArray = notesSlideResContent["Relationships"]["Relationship"];


  	// var notesMasterFilename = "";
  	// if (RelationshipArray.constructor === Array) {
  	// 	for (var i=0; i<RelationshipArray.length; i++) {
  	// 		switch (RelationshipArray[i]["attrs"]["Type"]) {
  	// 			case "http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster":
  	// 				notesMasterFilename = RelationshipArray[i]["attrs"]["Target"].replace("../", "ppt/");
  	// 				break;
  	// 			default:
  	// 		}
  	// 	}
  	// } else {
  	// 	notesMasterFilename = RelationshipArray["attrs"]["Target"].replace("../", "ppt/");
  	// }
  	// Open notesMasterXX.xml
  	// var notesMasterContent = this.readXmlFile(zip, notesMasterFilename);
    //THERE ARE NO TXSTYLES IN THE FILE
  	// var notesMasterTextStyles = this.getTextByPathList(notesMasterContent, ["p:sldMaster", "p:txStyles"]);
  	// var notesMasterTables = this.indexNodes(notesMasterContent);

    //THIS IS LIKE STEP 3 FOR NOTES
    var notesContent = this.readXmlFile(zip, notesFilename);
    var notesNodes = notesContent["p:notes"]["p:cSld"]["p:spTree"];
    // console.log(notesNodes);

    var notesWarpObj = {
      "zip": zip//,
      //"slideMasterTables": notesMasterTables// Don't use notes master settings - we probably won't display it as in the PowerPoint Notes Page (with slide image, slide number, date,...)
    };

    for (var nodeKey in notesNodes) {
      let that = this;
      if (notesNodes[nodeKey].constructor === Array) {
        for (var i=0; i<notesNodes[nodeKey].length; i++) {
          // Extract only nodes with notes (disregard Slide Image, Slide Number,... )
        	if (that.isNodeNotesPlaceholder(notesNodes[nodeKey][i])) {
            notes += that.processNodesInSlide(nodeKey, notesNodes[nodeKey][i], notesWarpObj);
          }
        }
      } else {
        if (that.isNodeNotesPlaceholder(notesNodes[nodeKey])) {
          notes += that.processNodesInSlide(nodeKey, notesNodes[nodeKey], notesWarpObj);
        }
      }
    }
  }

  return notes;
}

isNodeNotesPlaceholder(node) {//test if the node is a notes placeholder
  var name;
  if ((node["p:nvSpPr"] !== undefined) &&
    (node["p:nvSpPr"]["p:cNvPr"] !== undefined) &&
    (node["p:nvSpPr"]["p:cNvPr"]["attrs"] !== undefined)) {
      name = node["p:nvSpPr"]["p:cNvPr"]["attrs"]["name"];
  }
  return (name !== undefined && name.startsWith("Notes Placeholder"));
}

indexNodes(content) {

	var keys = Object.keys(content);
	var spTreeNode = content[keys[0]]["p:cSld"]["p:spTree"];

	var idTable = {};
	var idxTable = {};
	var typeTable = {};

	for (var key in spTreeNode) {

		if (key == "p:nvGrpSpPr" || key == "p:grpSpPr") {
			continue;
		}

		var targetNode = spTreeNode[key];

		if (targetNode.constructor === Array) {
            let that = this;
			for (var i=0; i<targetNode.length; i++) {
				var nvSpPrNode = targetNode[i]["p:nvSpPr"];
				var id = that.getTextByPathList(nvSpPrNode, ["p:cNvPr", "attrs", "id"]);
				var idx = that.getTextByPathList(nvSpPrNode, ["p:nvPr", "p:ph", "attrs", "idx"]);
				var type = that.getTextByPathList(nvSpPrNode, ["p:nvPr", "p:ph", "attrs", "type"]);

				if (id !== undefined) {
					idTable[id] = targetNode[i];
				}
				if (idx !== undefined) {
					idxTable[idx] = targetNode[i];
				}
				if (type !== undefined) {
					typeTable[type] = targetNode[i];
				}
			}
		} else {
			var nvSpPrNode = targetNode["p:nvSpPr"];
			var id = this.getTextByPathList(nvSpPrNode, ["p:cNvPr", "attrs", "id"]);
			var idx = this.getTextByPathList(nvSpPrNode, ["p:nvPr", "p:ph", "attrs", "idx"]);
			var type = this.getTextByPathList(nvSpPrNode, ["p:nvPr", "p:ph", "attrs", "type"]);

			if (id !== undefined) {
				idTable[id] = targetNode;
			}
			if (idx !== undefined) {
				idxTable[idx] = targetNode;
			}
			if (type !== undefined) {
				typeTable[type] = targetNode;
			}
		}

	}

	return {"idTable": idTable, "idxTable": idxTable, "typeTable": typeTable};
}

processNodesInSlide(nodeKey, nodeValue, warpObj) {

	var result = "";

	switch (nodeKey) {
		case "p:sp":	// Shape, Text
			result = this.processSpNode(nodeValue, warpObj);
			break;
		case "p:cxnSp":	// Shape, Text (with connection)
			result = this.processCxnSpNode(nodeValue, warpObj);
			break;
		case "p:pic":	// Picture
			result = this.processPicNode(nodeValue, warpObj);
			break;
		case "p:graphicFrame":	// Chart, Diagram, Table
			result = this.processGraphicFrameNode(nodeValue, warpObj);
			break;
		case "p:grpSp":	// 群組
			result = this.processGroupSpNode(nodeValue, warpObj);
			break;
		default:
	}

	return result;

}

processGroupSpNode(node, warpObj) {

	var factor = 96 / 914400;

	var xfrmNode = node["p:grpSpPr"]["a:xfrm"];
	var x = parseInt(xfrmNode["a:off"]["attrs"]["x"]) * factor;
	var y = parseInt(xfrmNode["a:off"]["attrs"]["y"]) * factor;
	var chx = parseInt(xfrmNode["a:chOff"]["attrs"]["x"]) * factor;
	var chy = parseInt(xfrmNode["a:chOff"]["attrs"]["y"]) * factor;
	var cx = parseInt(xfrmNode["a:ext"]["attrs"]["cx"]) * factor;
	var cy = parseInt(xfrmNode["a:ext"]["attrs"]["cy"]) * factor;
	var chcx = parseInt(xfrmNode["a:chExt"]["attrs"]["cx"]) * factor;
	var chcy = parseInt(xfrmNode["a:chExt"]["attrs"]["cy"]) * factor;

	var order = node["attrs"]["order"];

	var result = "<div class='block group' style='position: absolute;z-index: " + order + "; top: " + (y - chy) + "px; left: " + (x - chx) + "px; width: " + (cx - chcx) + "px; height: " + (cy - chcy) + "px;'>";

	// Procsee all child nodes
	for (var nodeKey in node) {
		if (node[nodeKey].constructor === Array) {
			for (var i=0; i<node[nodeKey].length; i++) {
				result += this.processNodesInSlide(nodeKey, node[nodeKey][i], warpObj);
			}
		} else {
			result += this.processNodesInSlide(nodeKey, node[nodeKey], warpObj);
		}
	}

	result += "</div>";

	return result;
}

processSpNode(node, warpObj) {

	/*
	 *  958	<xsd:complexType name="CT_GvmlShape">
	 *  959   <xsd:sequence>
	 *  960     <xsd:element name="nvSpPr" type="CT_GvmlShapeNonVisual"     minOccurs="1" maxOccurs="1"/>
	 *  961     <xsd:element name="spPr"   type="CT_ShapeProperties"        minOccurs="1" maxOccurs="1"/>
	 *  962     <xsd:element name="txSp"   type="CT_GvmlTextShape"          minOccurs="0" maxOccurs="1"/>
	 *  963     <xsd:element name="style"  type="CT_ShapeStyle"             minOccurs="0" maxOccurs="1"/>
	 *  964     <xsd:element name="extLst" type="CT_OfficeArtExtensionList" minOccurs="0" maxOccurs="1"/>
	 *  965   </xsd:sequence>
	 *  966 </xsd:complexType>
	 */

	var id = node["p:nvSpPr"]["p:cNvPr"]["attrs"]["id"];
	var name = node["p:nvSpPr"]["p:cNvPr"]["attrs"]["name"];
	var idx = (node["p:nvSpPr"]["p:nvPr"]["p:ph"] === undefined) ? undefined : node["p:nvSpPr"]["p:nvPr"]["p:ph"]["attrs"]["idx"];
	var type = (node["p:nvSpPr"]["p:nvPr"]["p:ph"] === undefined) ? undefined : node["p:nvSpPr"]["p:nvPr"]["p:ph"]["attrs"]["type"];
	var order = node["attrs"]["order"];

	var slideLayoutSpNode = undefined;
	var slideMasterSpNode = undefined;

	if (type !== undefined) {
		if (idx !== undefined) {//Dejan thinks there might be something wrong with this below (same assignment in both cases)
      if (warpObj["slideLayoutTables"] !== undefined) {//Dejan added these ifs to enable processing of notes
			  slideLayoutSpNode = warpObj["slideLayoutTables"]["typeTable"][type];
      }
      if (warpObj["slideMasterTables"] !== undefined) {
	      slideMasterSpNode = warpObj["slideMasterTables"]["typeTable"][type];
      }
		} else {
      if (warpObj["slideLayoutTables"] !== undefined) {
			  slideLayoutSpNode = warpObj["slideLayoutTables"]["typeTable"][type];
      }
      if (warpObj["slideMasterTables"] !== undefined) {
        slideMasterSpNode = warpObj["slideMasterTables"]["typeTable"][type];
      }
		}
	} else {
		if (idx !== undefined) {
      if (warpObj["slideLayoutTables"] !== undefined) {
			  slideLayoutSpNode = warpObj["slideLayoutTables"]["idxTable"][idx];
      }
      if (warpObj["slideMasterTables"] !== undefined) {
        slideMasterSpNode = warpObj["slideMasterTables"]["idxTable"][idx];
      }
		} else {
			// Nothing
		}
	}

	if (type === undefined) {
		type = this.getTextByPathList(slideLayoutSpNode, ["p:nvSpPr", "p:nvPr", "p:ph", "attrs", "type"]);
		if (type === undefined) {
			type = this.getTextByPathList(slideMasterSpNode, ["p:nvSpPr", "p:nvPr", "p:ph", "attrs", "type"]);
		}
	}

	this.debug( {"id": id, "name": name, "idx": idx, "type": type, "order": order} );
	//debug( JSON.stringify( node ) );

	return this.genShape(node, slideLayoutSpNode, slideMasterSpNode, id, name, idx, type, order, warpObj);
}

processCxnSpNode(node, warpObj) {

	var id = node["p:nvCxnSpPr"]["p:cNvPr"]["attrs"]["id"];
	var name = node["p:nvCxnSpPr"]["p:cNvPr"]["attrs"]["name"];
	//var idx = (node["p:nvCxnSpPr"]["p:nvPr"]["p:ph"] === undefined) ? undefined : node["p:nvSpPr"]["p:nvPr"]["p:ph"]["attrs"]["idx"];
	//var type = (node["p:nvCxnSpPr"]["p:nvPr"]["p:ph"] === undefined) ? undefined : node["p:nvSpPr"]["p:nvPr"]["p:ph"]["attrs"]["type"];
	//<p:cNvCxnSpPr>(<p:cNvCxnSpPr>, <a:endCxn>)
	var order = node["attrs"]["order"];

	this.debug( {"id": id, "name": name, "order": order} );

	return this.genShape(node, undefined, undefined, id, name, undefined, undefined, order, warpObj);
}

genShape(node, slideLayoutSpNode, slideMasterSpNode, id, name, idx, type, order, warpObj) {

	var xfrmList = ["p:spPr", "a:xfrm"];
	var slideXfrmNode = this.getTextByPathList(node, xfrmList);
	var slideLayoutXfrmNode = this.getTextByPathList(slideLayoutSpNode, xfrmList);
	var slideMasterXfrmNode = this.getTextByPathList(slideMasterSpNode, xfrmList);

	var result = "";
	var shapType = this.getTextByPathList(node, ["p:spPr", "a:prstGeom", "attrs", "prst"]);

	var isFlipV = false;
	if ( this.getTextByPathList(slideXfrmNode, ["attrs", "flipV"]) === "1" || this.getTextByPathList(slideXfrmNode, ["attrs", "flipH"]) === "1") {
		isFlipV = true;
	}

	if (shapType !== undefined) {

		var off = this.getTextByPathList(slideXfrmNode, ["a:off", "attrs"]);
		var x = parseInt(off["x"]) * 96 / 914400;
		var y = parseInt(off["y"]) * 96 / 914400;

		var ext = this.getTextByPathList(slideXfrmNode, ["a:ext", "attrs"]);
		var w = parseInt(ext["cx"]) * 96 / 914400;
		var h = parseInt(ext["cy"]) * 96 / 914400;

		result += "<svg class='drawing' _id='" + id + "' _idx='" + idx + "' _type='" + type + "' _name='" + name +
				"' style='position: absolute;" +
					this.getPosition(slideXfrmNode, undefined, undefined) +
					this.getSize(slideXfrmNode, undefined, undefined) +
					" z-index: " + order + ";" +
				"'>";

		// Fill Color
		var fillColor = this.getFill(node, true);

		// Border Color
		var border = this.getBorder(node, true);

		var headEndNodeAttrs = this.getTextByPathList(node, ["p:spPr", "a:ln", "a:headEnd", "attrs"]);
		var tailEndNodeAttrs = this.getTextByPathList(node, ["p:spPr", "a:ln", "a:tailEnd", "attrs"]);
		// type: none, triangle, stealth, diamond, oval, arrow
		if ( (headEndNodeAttrs !== undefined && (headEndNodeAttrs["type"] === "triangle" || headEndNodeAttrs["type"] === "arrow")) ||
			 (tailEndNodeAttrs !== undefined && (tailEndNodeAttrs["type"] === "triangle" || tailEndNodeAttrs["type"] === "arrow")) ) {
			var triangleMarker = "<defs><marker id=\"markerTriangle\" viewBox=\"0 0 10 10\" refX=\"1\" refY=\"5\" markerWidth=\"5\" markerHeight=\"5\" orient=\"auto-start-reverse\" markerUnits=\"strokeWidth\"><path d=\"M 0 0 L 10 5 L 0 10 z\" /></marker></defs>";
			result += triangleMarker;
		}

		switch (shapType) {
			case "accentBorderCallout1":
			case "accentBorderCallout2":
			case "accentBorderCallout3":
			case "accentCallout1":
			case "accentCallout2":
			case "accentCallout3":
			case "actionButtonBackPrevious":
			case "actionButtonBeginning":
			case "actionButtonBlank":
			case "actionButtonDocument":
			case "actionButtonEnd":
			case "actionButtonForwardNext":
			case "actionButtonHelp":
			case "actionButtonHome":
			case "actionButtonInformation":
			case "actionButtonMovie":
			case "actionButtonReturn":
			case "actionButtonSound":
			case "arc":
			case "bevel":
			case "blockArc":
			case "borderCallout1":
			case "borderCallout2":
			case "borderCallout3":
			case "bracePair":
			case "bracketPair":
			case "callout1":
			case "callout2":
			case "callout3":
			case "can":
			case "chartPlus":
			case "chartStar":
			case "chartX":
			case "chevron":
			case "chord":
			case "cloud":
			case "cloudCallout":
			case "corner":
			case "cornerTabs":
			case "cube":
			case "decagon":
			case "diagStripe":
			case "diamond":
			case "dodecagon":
			case "donut":
			case "doubleWave":
			case "downArrowCallout":
			case "ellipseRibbon":
			case "ellipseRibbon2":
			case "flowChartAlternateProcess":
			case "flowChartCollate":
			case "flowChartConnector":
			case "flowChartDecision":
			case "flowChartDelay":
			case "flowChartDisplay":
			case "flowChartDocument":
			case "flowChartExtract":
			case "flowChartInputOutput":
			case "flowChartInternalStorage":
			case "flowChartMagneticDisk":
			case "flowChartMagneticDrum":
			case "flowChartMagneticTape":
			case "flowChartManualInput":
			case "flowChartManualOperation":
			case "flowChartMerge":
			case "flowChartMultidocument":
			case "flowChartOfflineStorage":
			case "flowChartOffpageConnector":
			case "flowChartOnlineStorage":
			case "flowChartOr":
			case "flowChartPredefinedProcess":
			case "flowChartPreparation":
			case "flowChartProcess":
			case "flowChartPunchedCard":
			case "flowChartPunchedTape":
			case "flowChartSort":
			case "flowChartSummingJunction":
			case "flowChartTerminator":
			case "folderCorner":
			case "frame":
			case "funnel":
			case "gear6":
			case "gear9":
			case "halfFrame":
			case "heart":
			case "heptagon":
			case "hexagon":
			case "homePlate":
			case "horizontalScroll":
			case "irregularSeal1":
			case "irregularSeal2":
			case "leftArrow":
			case "leftArrowCallout":
			case "leftBrace":
			case "leftBracket":
			case "leftRightArrowCallout":
			case "leftRightRibbon":
			case "irregularSeal1":
			case "lightningBolt":
			case "lineInv":
			case "mathDivide":
			case "mathEqual":
			case "mathMinus":
			case "mathMultiply":
			case "mathNotEqual":
			case "mathPlus":
			case "moon":
			case "nonIsoscelesTrapezoid":
			case "noSmoking":
			case "octagon":
			case "parallelogram":
			case "pentagon":
			case "pie":
			case "pieWedge":
			case "plaque":
			case "plaqueTabs":
			case "plus":
			case "quadArrowCallout":
			case "rect":
			case "ribbon":
			case "ribbon2":
			case "rightArrowCallout":
			case "rightBrace":
			case "rightBracket":
			case "round1Rect":
			case "round2DiagRect":
			case "round2SameRect":
			case "rtTriangle":
			case "smileyFace":
			case "snip1Rect":
			case "snip2DiagRect":
			case "snip2SameRect":
			case "snipRoundRect":
			case "squareTabs":
			case "star10":
			case "star12":
			case "star16":
			case "star24":
			case "star32":
			case "star4":
			case "star5":
			case "star6":
			case "star7":
			case "star8":
			case "sun":
			case "teardrop":
			case "trapezoid":
			case "upArrowCallout":
			case "upDownArrowCallout":
			case "verticalScroll":
			case "wave":
			case "wedgeEllipseCallout":
			case "wedgeRectCallout":
			case "wedgeRoundRectCallout":
			case "rect":
				result += "<rect x='0' y='0' width='" + w + "' height='" + h + "' fill='" + fillColor +
							"' stroke='" + border.color + "' stroke-width='" + border.width + "' stroke-dasharray='" + border.strokeDasharray + "' />";
				break;
			case "ellipse":
				result += "<ellipse cx='" + (w / 2) + "' cy='" + (h / 2) + "' rx='" + (w / 2) + "' ry='" + (h / 2) + "' fill='" + fillColor +
							"' stroke='" + border.color + "' stroke-width='" + border.width + "' stroke-dasharray='" + border.strokeDasharray + "' />";
				break;
			case "roundRect":
				result += "<rect x='0' y='0' width='" + w + "' height='" + h + "' rx='7' ry='7' fill='" + fillColor +
							"' stroke='" + border.color + "' stroke-width='" + border.width + "' stroke-dasharray='" + border.strokeDasharray + "' />";
				break;
			case "bentConnector2":	// 直角 (path)
				var d = "";
				if (isFlipV) {
					d = "M 0 " + w + " L " + h + " " + w + " L " + h + " 0";
				} else {
					d = "M " + w + " 0 L " + w + " " + h + " L 0 " + h;
				}
				result += "<path d='" + d + "' stroke='" + border.color +
								"' stroke-width='" + border.width + "' stroke-dasharray='" + border.strokeDasharray + "' fill='none' ";
				if (headEndNodeAttrs !== undefined && (headEndNodeAttrs["type"] === "triangle" || headEndNodeAttrs["type"] === "arrow")) {
					result += "marker-start='url(#markerTriangle)' ";
				}
				if (tailEndNodeAttrs !== undefined && (tailEndNodeAttrs["type"] === "triangle" || tailEndNodeAttrs["type"] === "arrow")) {
					result += "marker-end='url(#markerTriangle)' ";
				}
				result += "/>";
				break;
			case "line":
			case "straightConnector1":
			case "bentConnector3":
			case "bentConnector4":
			case "bentConnector5":
			case "curvedConnector2":
			case "curvedConnector3":
			case "curvedConnector4":
			case "curvedConnector5":
				if (isFlipV) {
					result += "<line x1='" + w + "' y1='0' x2='0' y2='" + h + "' stroke='" + border.color +
								"' stroke-width='" + border.width + "' stroke-dasharray='" + border.strokeDasharray + "' ";
				} else {
					result += "<line x1='0' y1='0' x2='" + w + "' y2='" + h + "' stroke='" + border.color +
								"' stroke-width='" + border.width + "' stroke-dasharray='" + border.strokeDasharray + "' ";
				}
				if (headEndNodeAttrs !== undefined && (headEndNodeAttrs["type"] === "triangle" || headEndNodeAttrs["type"] === "arrow")) {
					result += "marker-start='url(#markerTriangle)' ";
				}
				if (tailEndNodeAttrs !== undefined && (tailEndNodeAttrs["type"] === "triangle" || tailEndNodeAttrs["type"] === "arrow")) {
					result += "marker-end='url(#markerTriangle)' ";
				}
				result += "/>";
				break;
			case "rightArrow":
				result += "<defs><marker id=\"markerTriangle\" viewBox=\"0 0 10 10\" refX=\"1\" refY=\"5\" markerWidth=\"2.5\" markerHeight=\"2.5\" orient=\"auto-start-reverse\" markerUnits=\"strokeWidth\"><path d=\"M 0 0 L 10 5 L 0 10 z\" /></marker></defs>";
				result += "<line x1='0' y1='" + (h/2) + "' x2='" + (w-15) + "' y2='" + (h/2) + "' stroke='" + border.color +
								"' stroke-width='" + (h/2) + "' stroke-dasharray='" + border.strokeDasharray + "' ";
				result += "marker-end='url(#markerTriangle)' />";
				break;
			case "downArrow":
				result += "<defs><marker id=\"markerTriangle\" viewBox=\"0 0 10 10\" refX=\"1\" refY=\"5\" markerWidth=\"2.5\" markerHeight=\"2.5\" orient=\"auto-start-reverse\" markerUnits=\"strokeWidth\"><path d=\"M 0 0 L 10 5 L 0 10 z\" /></marker></defs>";
				result += "<line x1='" + (w/2) + "' y1='0' x2='" + (w/2) + "' y2='" + (h-15) + "' stroke='" + border.color +
								"' stroke-width='" + (w/2) + "' stroke-dasharray='" + border.strokeDasharray + "' ";
				result += "marker-end='url(#markerTriangle)' />";
				break;
			case "bentArrow":
			case "bentUpArrow":
			case "stripedRightArrow":
			case "quadArrow":
			case "circularArrow":
			case "swooshArrow":
			case "leftRightArrow":
			case "leftRightUpArrow":
			case "leftUpArrow":
			case "leftCircularArrow":
			case "notchedRightArrow":
			case "curvedDownArrow":
			case "curvedLeftArrow":
			case "curvedRightArrow":
			case "curvedUpArrow":
			case "upDownArrow":
			case "upArrow":
			case "uturnArrow":
			case "leftRightCircularArrow":
				break;
			case "triangle":
				break;
			case undefined:
			default:
				console.warn("Undefine shape type.");
		}

		result += "</svg>";

		result += "<div class='block content " + this.getVerticalAlign(node, slideLayoutSpNode, slideMasterSpNode, type) +
				"' _id='" + id + "' _idx='" + idx + "' _type='" + type + "' _name='" + name +
				"' style='position: absolute;" +
					this.getPosition(slideXfrmNode, slideLayoutXfrmNode, slideMasterXfrmNode) +
					this.getSize(slideXfrmNode, slideLayoutXfrmNode, slideMasterXfrmNode) +
					" z-index: " + order + ";" +
				"'>";

		// TextBody
		if (node["p:txBody"] !== undefined) {
			result += this.genTextBody(node["p:txBody"], slideLayoutSpNode, slideMasterSpNode, type, warpObj, false);
		}
		result += "</div>";

	} else {

    var textBody = "";
    const createList = (slideLayoutSpNode !== undefined);//notes are not bulleted by default as slides are
    // TextBody
    if (node["p:txBody"] !== undefined) {
      textBody = this.genTextBody(node["p:txBody"], slideLayoutSpNode, slideMasterSpNode, type, warpObj, createList);
    }
    if (textBody !== undefined && textBody !== "") {//Dejan added this to prevent creation of some undefined and empty elements
    		result += "<div class='block content " + this.getVerticalAlign(node, slideLayoutSpNode, slideMasterSpNode, type) +
    				"' _id='" + id + "' _idx='" + idx + "' _type='" + type + "' _name='" + name +
    				"' style='position: absolute;" +
    					this.getPosition(slideXfrmNode, slideLayoutXfrmNode, slideMasterXfrmNode) +
    					this.getSize(slideXfrmNode, slideLayoutXfrmNode, slideMasterXfrmNode) +
    					this.getBorder(node, false) +
    					this.getFill(node, false) +
    					" z-index: " + order + ";" +
    				"'>" +
            textBody +
            "</div>";
    }

	}

	return result;
}

processPicNode(node, warpObj) {

	//debug( JSON.stringify( node ) );

	var order = node["attrs"]["order"];

	var rid = node["p:blipFill"]["a:blip"]["attrs"]["r:embed"];
	var imgName = warpObj["slideResObj"][rid]["target"];
	var imgFileExt = functions.extractFileExtension(imgName).toLowerCase();
	var zip = warpObj["zip"];
	var imgArrayBuffer = zip.file(imgName).asArrayBuffer();
	var mimeType = "";
	var xfrmNode = node["p:spPr"]["a:xfrm"];
	switch (imgFileExt) {
		case "jpg":
		case "jpeg":
			mimeType = "image/jpeg";
			break;
		case "png":
			mimeType = "image/png";
			break;
		case "gif":
			mimeType = "image/gif";
			break;
		case "emf": // Not native support
			mimeType = "image/x-emf";
			break;
		case "wmf": // Not native support
			mimeType = "image/x-wmf";
			break;
		default:
			mimeType = "image/*";
	}

  const imagePath = this.saveImageToFile(imgName, zip);

  //Dejan added this to create the img alt tag
  var descr = node["p:nvPicPr"]["p:cNvPr"]["attrs"]["descr"];
  var altTag = "";
  if (descr !== undefined) {
    altTag = " alt=\"" + descr + "\"";
  }

	return "<div class='block content' style='position: absolute;" + this.getPosition(xfrmNode, undefined, undefined) + this.getSize(xfrmNode, undefined, undefined) +
			" z-index: " + order + ";" +
			// "'><img src=\"data:" + mimeType + ";base64," + functions.base64ArrayBuffer(imgArrayBuffer) + "\" style='position: absolute;width: 100%; height: 100%'" +
      // "'><img src=\"http://" + imagePath + "\" style='position: absolute;width: 100%; height: 100%'" +
      "'><img src=\"http://" + imagePath + "\" style='width: 100%; height: 100%'" +
          altTag +
          "/></div>";
}

saveImageToFile(imgName, zip) {
  let fs = require('fs');
  let Microservices = require('../../configs/microservices');
  //Create UUID
  let uuid = require('node-uuid');
  const uuidValue = uuid.v1();// Generate a v1 (time-based) id
  //Get file extension
  const imgNameArray = imgName.split('.');
  const extension = imgNameArray[imgNameArray.length - 1];

  const imgUserPath = this.user + '/' + uuidValue + '.' + extension;

  // const imgUserPath = this.user + '/' + uuidValue + simpleImgName;
  // const saveTo = '.' + Microservices.file.shareVolume + '/' + imgUserPath;// For localhost testing
  const saveTo = Microservices.file.shareVolume + '/' + imgUserPath;

  //Create the user dir if does not exist
  // const userDir = '.' + Microservices.file.shareVolume + '/' + this.user;// For localhost testing
  const userDir = Microservices.file.shareVolume + '/' + this.user;
  if (!fs.existsSync(userDir)){
    fs.mkdirSync(userDir, 744, function(err) {
      if(err) {
        console.log(err);
      }
    });
  }

  //Save file
  let fileStream = fs.createWriteStream(saveTo);
  fileStream.write(zip.file(imgName).asBinary(), 'binary');
  fileStream.end();
  fileStream.on('error', (err) => {
    console.log('error', err);
  });
  fileStream.on('finish', (res) => {
    // console.log('save completed: ', simpleImgName);
  });

  return Microservices.file.uri + '/' + imgUserPath;
}

processGraphicFrameNode(node, warpObj) {

	var result = "";
	var graphicTypeUri = this.getTextByPathList(node, ["a:graphic", "a:graphicData", "attrs", "uri"]);

	switch (graphicTypeUri) {
		case "http://schemas.openxmlformats.org/drawingml/2006/table":
			result = this.genTable(node, warpObj);
			break;
		case "http://schemas.openxmlformats.org/drawingml/2006/chart":
			result = this.genChart(node, warpObj);
			break;
		case "http://schemas.openxmlformats.org/drawingml/2006/diagram":
			result = this.genDiagram(node, warpObj);
			break;
		default:
	}

	return result;
}

processSpPrNode(node, warpObj) {

	/*
	 * 2241 <xsd:complexType name="CT_ShapeProperties">
	 * 2242   <xsd:sequence>
	 * 2243     <xsd:element name="xfrm" type="CT_Transform2D"  minOccurs="0" maxOccurs="1"/>
	 * 2244     <xsd:group   ref="EG_Geometry"                  minOccurs="0" maxOccurs="1"/>
	 * 2245     <xsd:group   ref="EG_FillProperties"            minOccurs="0" maxOccurs="1"/>
	 * 2246     <xsd:element name="ln" type="CT_LineProperties" minOccurs="0" maxOccurs="1"/>
	 * 2247     <xsd:group   ref="EG_EffectProperties"          minOccurs="0" maxOccurs="1"/>
	 * 2248     <xsd:element name="scene3d" type="CT_Scene3D"   minOccurs="0" maxOccurs="1"/>
	 * 2249     <xsd:element name="sp3d" type="CT_Shape3D"      minOccurs="0" maxOccurs="1"/>
	 * 2250     <xsd:element name="extLst" type="CT_OfficeArtExtensionList" minOccurs="0" maxOccurs="1"/>
	 * 2251   </xsd:sequence>
	 * 2252   <xsd:attribute name="bwMode" type="ST_BlackWhiteMode" use="optional"/>
	 * 2253 </xsd:complexType>
	 */

	// TODO:
}

genTextBody(textBodyNode, slideLayoutSpNode, slideMasterSpNode, type, warpObj, createList) {

	var text = "";
  var slideMasterTextStyles = warpObj["slideMasterTextStyles"];

	if (textBodyNode === undefined) {
		return text;
	}

  const isTitle = (type === 'title');
  const isSubTitle = (type === 'subTitle');
  const isCtrTitle = (type === 'ctrTitle');
  const isSomeKindOfTitle = (isTitle || isSubTitle || isCtrTitle);
  const isSldNum = (type === 'sldNum');
  const layoutType = this.getTextByPathList(slideLayoutSpNode, ["p:nvSpPr", "p:nvPr", "p:ph", "attrs", "type"]);

  let title = '';


	if (textBodyNode["a:p"].constructor === Array) {
		// multi p
    let previousNodeIsListItem = false;
    let previousNodeIsOrderedListItem = false;
    let previousItemLevel = "0";
		for (var i=0; i<textBodyNode["a:p"].length; i++) {


			var pNode = textBodyNode["a:p"][i];
			var rNode = pNode["a:r"];

      let spanElement = "";

			if (rNode === undefined) {
				// without r
				spanElement += this.genSpanElement(pNode, slideLayoutSpNode, slideMasterSpNode, type, warpObj);

        if (isSomeKindOfTitle) {
          const text = this.getText(pNode);
          if (text !== undefined) {
            title += text;
          }
        }
			} else if (rNode.constructor === Array) {
				// with multi r
				for (var j=0; j<rNode.length; j++) {
					spanElement += this.genSpanElement(rNode[j], slideLayoutSpNode, slideMasterSpNode, type, warpObj);

          if (isSomeKindOfTitle) {
            const text = this.getText(rNode[j]);
            if (text !== undefined) {
              title += text;
            }
          }
				}
			} else {
				// with one r
				spanElement += this.genSpanElement(rNode, slideLayoutSpNode, slideMasterSpNode, type, warpObj);

        if (isSomeKindOfTitle) {
          const text = this.getText(rNode);
          if (text !== undefined) {
            title += text;
          }
        }
			}


      const insertListItemTag = (createList && !isSomeKindOfTitle && !isSldNum && (layoutType === undefined) && (pNode["a:pPr"] === undefined || pNode["a:pPr"]["a:buNone"] === undefined));
      const isOrderedList = (pNode["a:pPr"] !== undefined && pNode["a:pPr"]["a:buAutoNum"] !== undefined);
      let itemLevel = "0";
      if (pNode["a:pPr"] !== undefined && pNode["a:pPr"]["attrs"] !== undefined && pNode["a:pPr"]["attrs"]["lvl"] !== undefined) {
        itemLevel = pNode["a:pPr"]["attrs"]["lvl"];
      }

      if (spanElement !== "" && insertListItemTag) {//do not show bullets if the text is empty
        if (isOrderedList) {
          const orderedListStyle = (pNode["a:pPr"]["a:buAutoNum"]["attrs"] !== undefined && pNode["a:pPr"]["a:buAutoNum"]["attrs"]["type"] !== undefined) ? pNode["a:pPr"]["a:buAutoNum"]["attrs"]["type"] : '';
          const orderedListStartAt = (pNode["a:pPr"]["a:buAutoNum"]["attrs"] !== undefined && pNode["a:pPr"]["a:buAutoNum"]["attrs"]["startAt"] !== undefined) ? ' start="' + pNode["a:pPr"]["a:buAutoNum"]["attrs"]["startAt"] + '"' : '';

          text += (previousNodeIsListItem && previousNodeIsOrderedListItem && (itemLevel === previousItemLevel)) ? "" : "<ol " + this.getOrderedListStyle(orderedListStyle, itemLevel) + orderedListStartAt + ">";
        } else {
          text += (previousNodeIsListItem && !previousNodeIsOrderedListItem && (itemLevel === previousItemLevel)) ? "" : "<ul " + this.getUnorderedListStyle(itemLevel) + ">";
        }

        text += "<li>";//add list tag
      }
      previousNodeIsListItem = insertListItemTag;
      previousNodeIsOrderedListItem = isOrderedList;
      previousItemLevel = itemLevel;

      text += "<div class='" + this.getHorizontalAlign(pNode, slideLayoutSpNode, slideMasterSpNode, type, slideMasterTextStyles) + "'>";

      text += this.genBuChar(pNode);

      text += spanElement;

			text += "</div>";

      //see if next node is list item
      let nextNodeIsListItem = false;
      let nextNodeIsOrderedListItem = false;
      let nextItemLevel = "0";
      if (i < textBodyNode["a:p"].length - 1) {//it is not the last node in array
        let pNodeNext = textBodyNode["a:p"][i+1];

        nextNodeIsListItem = (createList && !isSomeKindOfTitle && !isSldNum && (layoutType === undefined) && (pNodeNext["a:pPr"] === undefined || pNodeNext["a:pPr"]["a:buNone"] === undefined));
        nextNodeIsOrderedListItem = (pNodeNext["a:pPr"] !== undefined && pNodeNext["a:pPr"]["a:buAutoNum"] !== undefined);
        if (pNodeNext["a:pPr"] !== undefined && pNodeNext["a:pPr"]["attrs"] !== undefined && pNodeNext["a:pPr"]["attrs"]["lvl"] !== undefined) {
          nextItemLevel = pNodeNext["a:pPr"]["attrs"]["lvl"];
        }
      }

      if (spanElement !== "" && insertListItemTag) {
        text += "</li>";//add list tag

        if (isOrderedList) {
          text += (nextNodeIsListItem && nextNodeIsOrderedListItem && (itemLevel === nextItemLevel)) ? "" : "</ol>";
        } else {
          text += (nextNodeIsListItem && !nextNodeIsOrderedListItem && (itemLevel === nextItemLevel)) ? "" : "</ul>";
        }
      }

      // text += (insertListItemTag) ? ((isOrderedList) ? "</ol>" : "</ul>") : "";
		}
	} else {
		// one p



		var pNode = textBodyNode["a:p"];
		var rNode = pNode["a:r"];

    let spanElement = "";

		if (rNode === undefined) {
			// without r
			spanElement += this.genSpanElement(pNode, slideLayoutSpNode, slideMasterSpNode, type, warpObj);

      if (isSomeKindOfTitle) {
        const text = this.getText(pNode);
        if (text !== undefined) {
          title += text;
        }
      }
		} else if (rNode.constructor === Array) {
			// with multi r
			for (var j=0; j<rNode.length; j++) {
				spanElement += this.genSpanElement(rNode[j], slideLayoutSpNode, slideMasterSpNode, type, warpObj);

        if (isSomeKindOfTitle) {
          const text = this.getText(rNode[j]);
          if (text !== undefined) {
            title += text;
          }
        }
			}
		} else {
			// with one r
			spanElement += this.genSpanElement(rNode, slideLayoutSpNode, slideMasterSpNode, type, warpObj);

      if (isSomeKindOfTitle) {
        const text = this.getText(rNode);
        if (text !== undefined) {
          title += text;
        }
      }
		}



    const insertListItemTag = (createList && !isSomeKindOfTitle && !isSldNum && (layoutType === undefined) && (pNode["a:pPr"] === undefined || pNode["a:pPr"]["a:buNone"] === undefined));
    const isOrderedList = (pNode["a:pPr"] !== undefined && pNode["a:pPr"]["a:buAutoNum"] !== undefined);



    if (spanElement !== "" && insertListItemTag) {
      text += (isOrderedList) ? "<ol>" : "<ul>";
      text += "<li>";//add list tag
    }

    text += "<div class='" + this.getHorizontalAlign(pNode, slideLayoutSpNode, slideMasterSpNode, type, slideMasterTextStyles) + "'>";


    text += this.genBuChar(pNode);

    text += spanElement;

    text += "</div>";
    if (spanElement !== "" && insertListItemTag) {
      text += "</li>";//add list tag
      text += (isOrderedList) ? "</ol>" : "</ul>";
    }

	}

  if (isTitle && this.currentSlide.title === '') {
    this.currentSlide.title = title;
  } else if (isCtrTitle && this.currentSlide.ctrTitle === '') {
    this.currentSlide.ctrTitle = title;
  } else if (isSubTitle && this.currentSlide.subTitle === '') {
    this.currentSlide.subTitle = title;
  }

	return text;
}

getText(node) {//Get raw text from a:r (a:p) node - for the slide title
  let text = node["a:t"];
	if (typeof text !== 'string') {
    text = this.getTextByPathList(node, ["a:t"]);
		if (typeof text !== 'string') {
      if (typeof text !== 'undefined') {
          text = text[0];
      }
		}
	}
  return text;
}

getOrderedListStyle(type, level) {
  const singleIndent = 30;
  let style = '';//arabic is default
  if(type.startsWith('alphaLc')) {
    style = 'type="a"';
  } else if(type.startsWith('alphaUc')) {
    style = 'type="A"';
  } else if(type.startsWith('romanLc')) {
    style = 'type="i"';
  } else if(type.startsWith('romanUc')) {
    style = 'type="I"';
  }

  if (level > 0) {//add indent
    style += ' style="margin-left:' + (singleIndent * level) + 'px;"';
  }
  return style;
}

getUnorderedListStyle(level) {
  const singleIndent = 30;
  let style = '';//disc is default
  if (level === '1' || level === '4') {//set bullet type
    style = 'style="list-style-type:circle;';
  } else if (level === '2' || level === '5') {
    style =  'style="list-style-type:square;';
  }
  if (level > 0) {//add indent
    style += (style === '') ? 'style="' : '';
    style += 'margin-left:' + (singleIndent * level) + 'px;"';
  }

  return style;
}

genBuChar(node) {

	var pPrNode = node["a:pPr"];

	var lvl = parseInt( this.getTextByPathList(pPrNode, ["attrs", "lvl"]) );
	if (isNaN(lvl)) {
		lvl = 0;
	}

	var buChar = this.getTextByPathList(pPrNode, ["a:buChar", "attrs", "char"]);
	if (buChar !== undefined) {
		var buFontAttrs = this.getTextByPathList(pPrNode, ["a:buFont", "attrs"]);
		if (buFontAttrs !== undefined) {
			var marginLeft = parseInt( this.getTextByPathList(pPrNode, ["attrs", "marL"]) ) * 96 / 914400;
			var marginRight = parseInt(buFontAttrs["pitchFamily"]);
			if (isNaN(marginLeft)) {
				marginLeft = 328600 * 96 / 914400;
			}
			if (isNaN(marginRight)) {
				marginRight = 0;
			}
			var typeface = buFontAttrs["typeface"];

			return "<span style='font-family: " + typeface +
					"; margin-left: " + marginLeft * lvl + "px" +
					"; margin-right: " + marginRight + "px" +
					"; font-size: 20pt" +
					"'>" + buChar + "</span>";
		} else {
      marginLeft = 328600 * 96 / 914400 * lvl;
      return "<span style='margin-left: " + marginLeft + "px;'>" + buChar + "</span>";
    }
	} else {
		//buChar = '•';
		return "<span style='margin-left: " + 328600 * 96 / 914400 * lvl + "px" +
					"; margin-right: " + 0 + "px;'></span>";
	}

	return "";
}

genSpanElement(node, slideLayoutSpNode, slideMasterSpNode, type, warpObj) {

  let slideMasterTextStyles = warpObj["slideMasterTextStyles"];
	let text = node["a:t"]; //Klaas: makes object out of text this while it might need to be string...? (since this is about getSpanElement)
    //text = text[0]; //does not always return array
    /*["History of copied items is shared between branches", attrs: Object]
0:"History of copied items is shared between branches"
attrs:Object
length:1
__proto__: Array[0]
*/
    //console.log('genSpanElement() text = ');
//TODO THIS LOG    console.log(text);
    //console.log('genSpanElement() type of text = ' + typeof text);
    //console.log('genSpanElement() node = ');
    ///console.log(node);
	if (typeof text !== 'string') {
        //Klaas: getTextByPathList() gets undefefined node if it contains text...
		//text = this.getTextByPathList(node, ["a:fld", "a:t"]);
    text = this.getTextByPathList(node, ["a:t"]);
        //console.log('genSpanElement() type of text, AFTER = ' + typeof text);

        //if (typeof text !== undefined && typeof text !== 'string') { //klaas test
        //    if (typeof text[0] === 'string') { //klaas test
        //        text = text[0]; //klaas test
        //    } //klaas test
        //} //klaas test
		if (typeof text !== 'string') {
			//text = "&nbsp;";
            if (typeof text !== 'undefined') { //klaas test
                text = text[0]; //klaas test
            } //klaas test
			this.debug("XXX: " + JSON.stringify(node));
		}
	}

  //Dejan added this to handle slide numbers
  if (typeof text !== 'string' && type === 'sldNum') {
    text = this.getTextByPathList(node, ["a:fld", "a:t"]);
    if (typeof text !== 'string') {
			//text = "&nbsp;";
            if (typeof text !== 'undefined') { //klaas test
                text = text[0]; //klaas test
            } //klaas test
			this.debug("XXX: " + JSON.stringify(node));
		}
  }
    //console.log('text = ' + text);
    //Dejan added this to prevent creation of some undefined elements - is this the right way to do it, perhaps sometimes there is some element in this node?
  if (text === undefined) {
    // console.log(node);
    return "";
  }
  let textStyle = "style='color: " + this.getFontColor(node, type, slideMasterTextStyles) +
      				"; font-size: " + this.getFontSize(node, slideLayoutSpNode, slideMasterSpNode, type, slideMasterTextStyles) +
      				"; font-family: " + this.getFontType(node, type, slideMasterTextStyles) +
      				"; font-weight: " + this.getFontBold(node, type, slideMasterTextStyles) +
      				"; font-style: " + this.getFontItalic(node, type, slideMasterTextStyles) +
      				"; text-decoration: " + this.getFontDecoration(node, type, slideMasterTextStyles) +
      				"; vertical-align: " + this.getTextVerticalAlign(node, type, slideMasterTextStyles) +
                      ";'";

    let linkID = this.getTextByPathList(node, ["a:rPr", "a:hlinkClick", "attrs", "r:id"]);

    if (linkID !== undefined) {
      let linkURL = warpObj["slideResObj"][linkID]["target"];
      return "<span class='text-block " + textStyle + "'><a href='" + linkURL + "' target='_blank'>" + text.replace(/\s/i, "&nbsp;") + "</a></span>";
  	} else {
  		return "<span class='text-block " + textStyle + "'>" + text.replace(/\s/i, "&nbsp;") + "</span>";
    }
}

genTable(node, warpObj) {

	var order = node["attrs"]["order"];
	var tableNode = this.getTextByPathList(node, ["a:graphic", "a:graphicData", "a:tbl"]);
	var xfrmNode = this.getTextByPathList(node, ["p:xfrm"]);
	var tableHtml = "<table style='position: absolute;" + this.getPosition(xfrmNode, undefined, undefined) + this.getSize(xfrmNode, undefined, undefined) + " z-index: " + order + ";'>";

	var trNodes = tableNode["a:tr"];
	if (trNodes.constructor === Array) {
		for (var i=0; i<trNodes.length; i++) {
			tableHtml += "<tr>";
			var tcNodes = trNodes[i]["a:tc"];

			if (tcNodes.constructor === Array) {
				for (var j=0; j<tcNodes.length; j++) {
					var text = this.genTextBody(tcNodes[j]["a:txBody"], undefined, undefined, undefined, warpObj);
					var rowSpan = this.getTextByPathList(tcNodes[j], ["attrs", "rowSpan"]);
					var colSpan = this.getTextByPathList(tcNodes[j], ["attrs", "gridSpan"]);
					var vMerge = this.getTextByPathList(tcNodes[j], ["attrs", "vMerge"]);
					var hMerge = this.getTextByPathList(tcNodes[j], ["attrs", "hMerge"]);
					if (rowSpan !== undefined) {
						tableHtml += "<td rowspan='" + parseInt(rowSpan) + "'>" + text + "</td>";
					} else if (colSpan !== undefined) {
						tableHtml += "<td colspan='" + parseInt(colSpan) + "'>" + text + "</td>";
					} else if (vMerge === undefined && hMerge === undefined) {
						tableHtml += "<td>" + text + "</td>";
					}
				}
			} else {
				var text = this.genTextBody(tcNodes["a:txBody"]);
				tableHtml += "<td>" + text + "</td>";
			}
			tableHtml += "</tr>";
		}
	} else {
		tableHtml += "<tr>";
		var tcNodes = trNodes["a:tc"];
		if (tcNodes.constructor === Array) {
			for (var j=0; j<tcNodes.length; j++) {
				var text = this.genTextBody(tcNodes[j]["a:txBody"]);
				tableHtml += "<td>" + text + "</td>";
			}
		} else {
			var text = this.genTextBody(tcNodes["a:txBody"]);
			tableHtml += "<td>" + text + "</td>";
		}
		tableHtml += "</tr>";
	}

  tableHtml += "</table>";

	return tableHtml;
}

genChart(node, warpObj) {

	var order = node["attrs"]["order"];
	var xfrmNode = this.getTextByPathList(node, ["p:xfrm"]);
	var result = "<div id='chart" + this.chartID + "' class='block content' style='position: absolute;" +
					this.getPosition(xfrmNode, undefined, undefined) + this.getSize(xfrmNode, undefined, undefined) +
					" z-index: " + order + ";'></div>";

	var rid = node["a:graphic"]["a:graphicData"]["c:chart"]["attrs"]["r:id"];
	var refName = warpObj["slideResObj"][rid]["target"];
	var content = this.readXmlFile(warpObj["zip"], refName);
	var plotArea = this.getTextByPathList(content, ["c:chartSpace", "c:chart", "c:plotArea"]);

	var chartData = null;
	for (var key in plotArea) {
		switch (key) {
			case "c:lineChart":
				chartData = {
					"type": "createChart",
					"data": {
						"this.chartID": "chart" + this.chartID,
						"chartType": "lineChart",
						"chartData": this.extractChartData(plotArea[key]["c:ser"])
					}
				};
				break;
			case "c:barChart":
				chartData = {
					"type": "createChart",
					"data": {
						"this.chartID": "chart" + this.chartID,
						"chartType": "barChart",
						"chartData": this.extractChartData(plotArea[key]["c:ser"])
					}
				};
				break;
			case "c:pieChart":
				chartData = {
					"type": "createChart",
					"data": {
						"this.chartID": "chart" + this.chartID,
						"chartType": "pieChart",
						"chartData": this.extractChartData(plotArea[key]["c:ser"])
					}
				};
				break;
			case "c:pie3DChart":
				chartData = {
					"type": "createChart",
					"data": {
						"this.chartID": "chart" + this.chartID,
						"chartType": "pie3DChart",
						"chartData": this.extractChartData(plotArea[key]["c:ser"])
					}
				};
				break;
			case "c:areaChart":
				chartData = {
					"type": "createChart",
					"data": {
						"this.chartID": "chart" + this.chartID,
						"chartType": "areaChart",
						"chartData": this.extractChartData(plotArea[key]["c:ser"])
					}
				};
				break;
			case "c:scatterChart":
				chartData = {
					"type": "createChart",
					"data": {
						"this.chartID": "chart" + this.chartID,
						"chartType": "scatterChart",
						"chartData": this.extractChartData(plotArea[key]["c:ser"])
					}
				};
				break;
			case "c:catAx":
				break;
			case "c:valAx":
				break;
			default:
		}
	}

	//if (chartData !== null) {
//		MsgQueue.push(chartData);
//	}

	this.chartID++;
	return result;
}

genDiagram(node, warpObj) {
	var order = node["attrs"]["order"];
	var xfrmNode = this.getTextByPathList(node, ["p:xfrm"]);
	return "<div class='block content' style='position: absolute;border: 1px dotted;" +
				this.getPosition(xfrmNode, undefined, undefined) + this.getSize(xfrmNode, undefined, undefined) +
			"'>TODO: diagram</div>";
}

getPosition(slideSpNode, slideLayoutSpNode, slideMasterSpNode) {

	//debug(JSON.stringify(slideLayoutSpNode));
	//debug(JSON.stringify(slideMasterSpNode));

	var off = undefined;
	var x = -1, y = -1;

	if (slideSpNode !== undefined) {
		off = slideSpNode["a:off"]["attrs"];
	} else if (slideLayoutSpNode !== undefined) {
		off = slideLayoutSpNode["a:off"]["attrs"];
	} else if (slideMasterSpNode !== undefined) {
		off = slideMasterSpNode["a:off"]["attrs"];
	}

	if (off === undefined) {
		return "";
	} else {
		x = parseInt(off["x"]) * 96 / 914400;
		y = parseInt(off["y"]) * 96 / 914400;
		return (isNaN(x) || isNaN(y)) ? "" : "top:" + y + "px; left:" + x + "px;";
	}

}

getSize(slideSpNode, slideLayoutSpNode, slideMasterSpNode) {

	//debug(JSON.stringify(slideLayoutSpNode));
	//debug(JSON.stringify(slideMasterSpNode));

	var ext = undefined;
	var w = -1, h = -1;

	if (slideSpNode !== undefined) {
		ext = slideSpNode["a:ext"]["attrs"];
	} else if (slideLayoutSpNode !== undefined) {
		ext = slideLayoutSpNode["a:ext"]["attrs"];
	} else if (slideMasterSpNode !== undefined) {
		ext = slideMasterSpNode["a:ext"]["attrs"];
	}

	if (ext === undefined) {
		return "";
	} else {
		w = parseInt(ext["cx"]) * 96 / 914400;
		h = parseInt(ext["cy"]) * 96 / 914400;
		return (isNaN(w) || isNaN(h)) ? "" : "width:" + w + "px; height:" + h + "px;";
	}

}

getHorizontalAlign(node, slideLayoutSpNode, slideMasterSpNode, type, slideMasterTextStyles) {
	//debug(node);
	var algn = this.getTextByPathList(node, ["a:pPr", "attrs", "algn"]);
	if (algn === undefined) {
		algn = this.getTextByPathList(slideLayoutSpNode, ["p:txBody", "a:p", "a:pPr", "attrs", "algn"]);
		if (algn === undefined) {
			algn = this.getTextByPathList(slideMasterSpNode, ["p:txBody", "a:p", "a:pPr", "attrs", "algn"]);
			if (algn === undefined) {
				switch (type) {
					case "title":
					case "subTitle":
					case "ctrTitle":
						algn = this.getTextByPathList(slideMasterTextStyles, ["p:titleStyle", "a:lvl1pPr", "attrs", "alng"]);
						break;
					default:
						algn = this.getTextByPathList(slideMasterTextStyles, ["p:otherStyle", "a:lvl1pPr", "attrs", "alng"]);
				}
			}
		}
	}
	// TODO:
	if (algn === undefined) {
		if (type == "title" || type == "subTitle" || type == "ctrTitle") {
			return "h-mid";
		} else if (type == "sldNum") {
			return "h-right";
		}
	}
	return algn === "ctr" ? "h-mid" : algn === "r" ? "h-right" : "h-left";
}

getVerticalAlign(node, slideLayoutSpNode, slideMasterSpNode, type, slideMasterTextStyles) {

	// 上中下對齊: X, <a:bodyPr anchor="ctr">, <a:bodyPr anchor="b">
	var anchor = this.getTextByPathList(node, ["p:txBody", "a:bodyPr", "attrs", "anchor"]);
	if (anchor === undefined) {
		anchor = this.getTextByPathList(slideLayoutSpNode, ["p:txBody", "a:bodyPr", "attrs", "anchor"]);
		if (anchor === undefined) {
			anchor = this.getTextByPathList(slideMasterSpNode, ["p:txBody", "a:bodyPr", "attrs", "anchor"]);
		}
	}

	return anchor === "ctr" ? "v-mid" : anchor === "b" ?  "v-down" : "v-up";
}

getFontType(node, type, slideMasterTextStyles) {
	var typeface = this.getTextByPathList(node, ["a:rPr", "a:latin", "attrs", "typeface"]);

	if (typeface === undefined) {
		var fontSchemeNode = this.getTextByPathList(this.themeContent, ["a:theme", "a:themeElements", "a:fontScheme"]);
		if (type == "title" || type == "subTitle" || type == "ctrTitle") {
			typeface = this.getTextByPathList(fontSchemeNode, ["a:majorFont", "a:latin", "attrs", "typeface"]);
		} else if (type == "body") {
			typeface = this.getTextByPathList(fontSchemeNode, ["a:minorFont", "a:latin", "attrs", "typeface"]);
		} else {
			typeface = this.getTextByPathList(fontSchemeNode, ["a:minorFont", "a:latin", "attrs", "typeface"]);
		}
	}

	return (typeface === undefined) ? "inherit" : typeface;
}

getFontColor(node, type, slideMasterTextStyles) {
	var color = this.getTextByPathStr(node, "a:rPr a:solidFill a:srgbClr attrs val");
	return (color === undefined) ? "#000" : "#" + color;
}

getFontSize(node, slideLayoutSpNode, slideMasterSpNode, type, slideMasterTextStyles) {
	var fontSize = undefined;
	if (node["a:rPr"] !== undefined) {
		fontSize = parseInt(node["a:rPr"]["attrs"]["sz"]) / 100;
	}

	if ((isNaN(fontSize) || fontSize === undefined)) {
		var sz = this.getTextByPathList(slideLayoutSpNode, ["p:txBody", "a:lstStyle", "a:lvl1pPr", "a:defRPr", "attrs", "sz"]);
		fontSize = parseInt(sz) / 100;
	}

	if (isNaN(fontSize) || fontSize === undefined) {
		if (type == "title" || type == "subTitle" || type == "ctrTitle") {
			var sz = this.getTextByPathList(slideMasterTextStyles, ["p:titleStyle", "a:lvl1pPr", "a:defRPr", "attrs", "sz"]);
		} else if (type == "body") {
			var sz = this.getTextByPathList(slideMasterTextStyles, ["p:bodyStyle", "a:lvl1pPr", "a:defRPr", "attrs", "sz"]);
		} else if (type == "dt" || type == "sldNum") {
			var sz = "1200";
		} else if (type === undefined) {
			var sz = this.getTextByPathList(slideMasterTextStyles, ["p:otherStyle", "a:lvl1pPr", "a:defRPr", "attrs", "sz"]);
		}
		fontSize = parseInt(sz) / 100;
	}

	var baseline = this.getTextByPathList(node, ["a:rPr", "attrs", "baseline"]);
	if (baseline !== undefined && !isNaN(fontSize)) {
		fontSize -= 10;
	}

	return isNaN(fontSize) ? "inherit" : (fontSize + "pt");
}

getFontBold(node, type, slideMasterTextStyles) {
	return (node["a:rPr"] !== undefined && node["a:rPr"]["attrs"]["b"] === "1") ? "bold" : "initial";
}

getFontItalic(node, type, slideMasterTextStyles) {
	return (node["a:rPr"] !== undefined && node["a:rPr"]["attrs"]["i"] === "1") ? "italic" : "normal";
}

getFontDecoration(node, type, slideMasterTextStyles) {
	return (node["a:rPr"] !== undefined && node["a:rPr"]["attrs"]["u"] === "sng") ? "underline" : "initial";
}

getTextVerticalAlign(node, type, slideMasterTextStyles) {
	var baseline = this.getTextByPathList(node, ["a:rPr", "attrs", "baseline"]);
	if (baseline === undefined) {
		return "";
	} else {
		baseline = parseInt(baseline) / 1000;
		return baseline + "%";
	}
}

getBorder(node, isSvgMode) {

	//debug(JSON.stringify(node));

	var cssText = "border: ";

	// 1. presentationML
	var lineNode = node["p:spPr"]["a:ln"];

	// Border width: 1pt = 12700, default = 0.75pt
	var borderWidth = parseInt(this.getTextByPathList(lineNode, ["attrs", "w"])) / 12700;
	if (isNaN(borderWidth) || borderWidth < 1) {
		cssText += "1pt ";
	} else {
		cssText += borderWidth + "pt ";
	}

	// Border color
	var borderColor = this.getTextByPathList(lineNode, ["a:solidFill", "a:srgbClr", "attrs", "val"]);
	if (borderColor === undefined) {
		var schemeClrNode = this.getTextByPathList(lineNode, ["a:solidFill", "a:schemeClr"]);
		var schemeClr = "a:" + this.getTextByPathList(schemeClrNode, ["attrs", "val"]);
		var borderColor = this.getSchemeColorFromTheme(schemeClr);
	}

	// 2. drawingML namespace
	if (borderColor === undefined) {
		var schemeClrNode = this.getTextByPathList(node, ["p:style", "a:lnRef", "a:schemeClr"]);
		var schemeClr = "a:" + this.getTextByPathList(schemeClrNode, ["attrs", "val"]);
		var borderColor = this.getSchemeColorFromTheme(schemeClr);

		if (borderColor !== undefined) {
			var shade = this.getTextByPathList(schemeClrNode, ["a:shade", "attrs", "val"]);
			if (shade !== undefined) {
				shade = parseInt(shade) / 100000;
				var color = new colz.Color("#" + borderColor);
				color.setLum(color.hsl.l * shade);
				borderColor = color.hex.replace("#", "");
			}
		}

	}

	if (borderColor === undefined) {
		if (isSvgMode) {
			borderColor = "none";
		} else {
			borderColor = "#000";
		}
	} else {
		borderColor = "#" + borderColor;

	}
	cssText += " " + borderColor + " ";

	// Border type
	var borderType = this.getTextByPathList(lineNode, ["a:prstDash", "attrs", "val"]);
	var strokeDasharray = "0";
	switch (borderType) {
		case "solid":
			cssText += "solid";
			strokeDasharray = "0";
			break;
		case "dash":
			cssText += "dashed";
			strokeDasharray = "5";
			break;
		case "dashDot":
			cssText += "dashed";
			strokeDasharray = "5, 5, 1, 5";
			break;
		case "dot":
			cssText += "dotted";
			strokeDasharray = "1, 5";
			break;
		case "lgDash":
			cssText += "dashed";
			strokeDasharray = "10, 5";
			break;
		case "lgDashDotDot":
			cssText += "dashed";
			strokeDasharray = "10, 5, 1, 5, 1, 5";
			break;
		case "sysDash":
			cssText += "dashed";
			strokeDasharray = "5, 2";
			break;
		case "sysDashDot":
			cssText += "dashed";
			strokeDasharray = "5, 2, 1, 5";
			break;
		case "sysDashDotDot":
			cssText += "dashed";
			strokeDasharray = "5, 2, 1, 5, 1, 5";
			break;
		case "sysDot":
			cssText += "dotted";
			strokeDasharray = "2, 5";
			break;
		case undefined:
			//console.log(borderType);
		default:
			//console.warn(borderType);
			//cssText += "#000 solid";
	}

	if (isSvgMode) {
		return {"color": borderColor, "width": borderWidth, "type": borderType, "strokeDasharray": strokeDasharray};
	} else {
		return cssText + ";";
	}
}

getFill(node, isSvgMode) {

	// 1. presentationML
	// p:spPr [a:noFill, solidFill, gradFill, blipFill, pattFill, grpFill]
	// From slide
	if (this.getTextByPathList(node, ["p:spPr", "a:noFill"]) !== undefined) {
		return isSvgMode ? "none" : "background-color: initial;";
	}

	var fillColor = undefined;
	if (fillColor === undefined) {
		fillColor = this.getTextByPathList(node, ["p:spPr", "a:solidFill", "a:srgbClr", "attrs", "val"]);
	}

	// From theme
	if (fillColor === undefined) {
		var schemeClr = "a:" + this.getTextByPathList(node, ["p:spPr", "a:solidFill", "a:schemeClr", "attrs", "val"]);
		fillColor = this.getSchemeColorFromTheme(schemeClr);
	}

	// 2. drawingML namespace
	if (fillColor === undefined) {
		var schemeClr = "a:" + this.getTextByPathList(node, ["p:style", "a:fillRef", "a:schemeClr", "attrs", "val"]);
		fillColor = this.getSchemeColorFromTheme(schemeClr);
	}

	if (fillColor !== undefined) {

		fillColor = "#" + fillColor;

		// Apply shade or tint
		// TODO: 較淺, 較深 80%
		var lumMod = parseInt(this.getTextByPathList(node, ["p:spPr", "a:solidFill", "a:schemeClr", "a:lumMod", "attrs", "val"])) / 100000;
		var lumOff = parseInt(this.getTextByPathList(node, ["p:spPr", "a:solidFill", "a:schemeClr", "a:lumOff", "attrs", "val"])) / 100000;
		if (isNaN(lumMod)) {
			lumMod = 1.0;
		}
		if (isNaN(lumOff)) {
			lumOff = 0;
		}
		//console.log([lumMod, lumOff]);
		fillColor = this.applyLumModify(fillColor, lumMod, lumOff);

		if (isSvgMode) {
			return fillColor;
		} else {
			return "background-color: " + fillColor + ";";
		}
	} else {
		if (isSvgMode) {
			return "none";
		} else {
			return "background-color: " + fillColor + ";";
		}

	}

}

getSchemeColorFromTheme(schemeClr) {
	// TODO: <p:clrMap ...> in slide master
	// e.g. tx2="dk2" bg2="lt2" tx1="dk1" bg1="lt1"
	switch (schemeClr) {
		case "a:tx1": schemeClr = "a:dk1"; break;
		case "a:tx2": schemeClr = "a:dk2"; break;
		case "a:bg1": schemeClr = "a:lt1"; break;
		case "a:bg2": schemeClr = "a:lt2"; break;
	}
	var refNode = this.getTextByPathList(this.themeContent, ["a:theme", "a:themeElements", "a:clrScheme", schemeClr]);
	var color = this.getTextByPathList(refNode, ["a:srgbClr", "attrs", "val"]);
	if (color === undefined) {
		color = this.getTextByPathList(refNode, ["a:sysClr", "attrs", "lastClr"]);
	}
	return color;
}

extractChartData(serNode) {
	var dataMat = new Array();

  if (serNode === undefined) {
		return dataMat;
	}

  let that = this; //Klaas - FIXED
	if (serNode["c:xVal"] !== undefined) {
		var dataRow = new Array();
		this.eachElement(serNode["c:xVal"]["c:numRef"]["c:numCache"]["c:pt"], function(innerNode, index) {
			dataRow.push(parseFloat(innerNode["c:v"]));
			return "";
		});
		dataMat.push(dataRow);
		dataRow = new Array();
		this.eachElement(serNode["c:yVal"]["c:numRef"]["c:numCache"]["c:pt"], function(innerNode, index) {
			dataRow.push(parseFloat(innerNode["c:v"]));
			return "";
		});
		dataMat.push(dataRow);
	} else {

		this.eachElement(serNode, function(innerNode, index) {
			var dataRow = new Array();
      //Klaas: Typeerrorconvertor.js:1538 Uncaught TypeError: Cannot read property 'getTextByPathList' of undefined
      //Klaas: is problem with scoping? it should work, unless there is recursion. then we need
      //Klaas: ES7 => fat arrow, .bind(this) or that = this to keep track of lexical/dynamic scope
			//var colName = this.getTextByPathList(innerNode, ["c:tx", "c:strRef", "c:strCache", "c:pt", "c:v"]) || index;
      var colName = that.getTextByPathList(innerNode, ["c:tx", "c:strRef", "c:strCache", "c:pt", "c:v"]) || index;

			// Category (string or number)
			var rowNames = {};
			if (that.getTextByPathList(innerNode, ["c:cat", "c:strRef", "c:strCache", "c:pt"]) !== undefined) {
				that.eachElement(innerNode["c:cat"]["c:strRef"]["c:strCache"]["c:pt"], function(innerNode, index) {
					rowNames[innerNode["attrs"]["idx"]] = innerNode["c:v"];
					return "";
				});
			} else if (that.getTextByPathList(innerNode, ["c:cat", "c:numRef", "c:numCache", "c:pt"]) !== undefined) {
        that.eachElement(innerNode["c:cat"]["c:numRef"]["c:numCache"]["c:pt"], function(innerNode, index) {
          rowNames[innerNode["attrs"]["idx"]] = innerNode["c:v"];
          return "";
        });
      }

			// Value
      /*
			that.eachElement(innerNode["c:val"]["c:numRef"]["c:numCache"]["c:pt"], function(innerNode, index) {
				dataRow.push({x: innerNode["attrs"]["idx"], y: parseFloat(innerNode["c:v"])});
				return "";
			});
      */
      if (that.getTextByPathList(innerNode, ["c:val", "c:numRef", "c:numCache", "c:pt"]) !== undefined) {
        that.eachElement(innerNode["c:val"]["c:numRef"]["c:numCache"]["c:pt"], function(innerNode, index) {
          dataRow.push({x: innerNode["attrs"]["idx"], y: parseFloat(innerNode["c:v"])});
          return "";
        });
      }

			dataMat.push({key: colName, values: dataRow, xlabels: rowNames});
			return "";
		});

	}

  //console.log("///////////////////////////////////////////////////////");
  //console.log(util.inspect(dataMat, false, null));
  //console.log("///////////////////////////////////////////////////////");
	return dataMat;
}

// ===== Node functions =====
/**
 * getTextByPathStr
 * @param {Object} node
 * @param {string} pathStr
 */
getTextByPathStr(node, pathStr) {
	return this.getTextByPathList(node, pathStr.trim().split(/\s+/));
    //http://www.w3schools.com/jsref/jsref_split.asp
    //return this.getTextByPathList(node, pathStr.trim().split(","));
}

/**
 * getTextByPathList
 * @param {Object} node
 * @param {string Array} path
 */
getTextByPathList(node, path) {

	if (path.constructor !== Array) {
		throw Error("Error of path type! path is not array.");
	}

	if (node === undefined) {
		return undefined;
	}

	var l = path.length;
	for (var i=0; i<l; i++) {
        //klaas: this might be something that goes wrong...
//TODO THIS LOG        console.log('node = ' + node + 'path = ' +  path[i]);
        //console.log('node = ' + node + 'path = ' +  path);
        //console.log('node = ' + node + 'path.lenght = ' +  l);
//TODO THIS LOG        console.log(node);
		node = node[path[i]]; //!!!

		if (node === undefined) {
			return undefined;
		}
	}

	return node;
}

/**
 * eachElement
 * @param {Object} node
 * @param {function} doFunction
 */
eachElement(node, doFunction) {
	if (node === undefined) {
		return;
	}
	var result = "";
	if (node.constructor === Array) {
		var l = node.length;
		for (var i=0; i<l; i++) {
			result += doFunction(node[i], i);
		}
	} else {
		result += doFunction(node, 0);
	}
	return result;
}

// ===== Color functions =====
/**
 * applyShade
 * @param {string} rgbStr
 * @param {number} shadeValue
 */
applyShade(rgbStr, shadeValue) {
	var color = new colz.Color(rgbStr);
	color.setLum(color.hsl.l * shadeValue);
	return color.rgb.toString();
}

/**
 * applyTint
 * @param {string} rgbStr
 * @param {number} tintValue
 */
applyTint(rgbStr, tintValue) {
	var color = new colz.Color(rgbStr);
	color.setLum(color.hsl.l * tintValue + (1 - tintValue));
	return color.rgb.toString();
}

/**
 * applyLumModify
 * @param {string} rgbStr
 * @param {number} factor
 * @param {number} offset
 */
applyLumModify(rgbStr, factor, offset) {
	var color = new colz.Color(rgbStr);
	//color.setLum(color.hsl.l * factor);
	color.setLum(color.hsl.l * (1 + offset));
	return color.rgb.toString();
}

// ===== Debug functions =====
/**
 * debug
 * @param {Object} data
 */
debug(data) {
	//self.postMessage({"type": "DEBUG", "data": data});
    //console.log(data);
}
}
// export default Convertor;
module.exports = {
  Convertor
};
