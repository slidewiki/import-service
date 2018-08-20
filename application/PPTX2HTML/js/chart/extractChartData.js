let ConvertorUtils = require('../utils/convertorUtils');

function extractChartData(plotArea, chartID){

    var chartData = null;
    var chartType = null;

    for (var key in plotArea) {
        switch (key) {
            case "c:area3DChart":
                chartType = 'area3DChart';
                chartData = {
                    "type": "createChart",
                    "data": {
                        "chartID": "chart" + chartID,
                        "chartType": "area3DChart",
                        "chartData": getData(plotArea[key]["c:ser"], chartType)
                    }
                };
                break;
            case "c:areaChart":
                chartType = 'stackedAreaChart';
                chartData = {
                    "type": "createChart",
                    "data": {
                        "chartID": "chart" + chartID,
                        "chartType": "areaChart",
                        "chartData": getData(plotArea[key]["c:ser"], chartType)
                    }
                };
                break;
            case "c:bar3DChart":
                chartType = 'bar3DChart';
                chartData = {
                    "type": "createChart",
                    "data": {
                        "chartID": "chart" + chartID,
                        "chartType": "bar3DChart",
                        "chartData": getData(plotArea[key]["c:ser"], chartType)
                    }
                };
                break;
            case "c:barChart":
                chartType = 'multiBarChart';
                chartData = {
                    "type": "createChart",
                    "data": {
                        "chartID": "chart" + chartID,
                        "chartType": "barChart",
                        "chartData": getData(plotArea[key]["c:ser"], chartType)
                    }
                };
                break;
            case "c:doughnutChart":
                chartType = 'doughnutChart';
                chartData = {
                    "type": "createChart",
                    "data": {
                        "chartID": "chart" + chartID,
                        "chartType": "doughnutChart",
                        "chartData": getData(plotArea[key]["c:ser"], chartType)
                    }
                };
                break;
            case "c:line3DChart":
                chartType = 'line3DChart';
                chartData = {
                    "type": "createChart",
                    "data": {
                        "chartID": "chart" + chartID,
                        "chartType": "line3DChart",
                        "chartData": getData(plotArea[key]["c:ser"], chartType)
                    }
                };
                break;
            case "c:lineChart":
                chartType = 'lineChart';
                chartData = {
                    "type": "createChart",
                    "data": {
                        "chartID": "chart" + chartID,
                        "chartType": "lineChart",
                        "chartData": getData(plotArea[key]["c:ser"], chartType)
                    }
                };
                break;
            case "c:ofPieChart":
                chartType = 'ofPieChart';
                chartData = {
                    "type": "createChart",
                    "data": {
                        "chartID": "chart" + chartID,
                        "chartType": "ofPieChart",
                        "chartData": getData(plotArea[key]["c:ser"], chartType)
                    }
                };
                break;
            case "c:pie3DChart":
                chartType = 'pieChart';
                chartData = {
                    "type": "createChart",
                    "data": {
                        "chartID": "chart" + chartID,
                        "chartType": "pie3DChart",
                        "chartData": getData(plotArea[key]["c:ser"], chartType)
                    }
                };
                break;
            case "c:pieChart":
                chartType = 'pieChart';
                chartData = {
                    "type": "createChart",
                    "data": {
                        "chartID": "chart" + chartID,
                        "chartType": "pieChart",
                        "chartData": getData(plotArea[key]["c:ser"], chartType)
                    }
                };
                break;
            case "c:radarChart":
                chartType = 'radarChart';
                chartData = {
                    "type": "createChart",
                    "data": {
                        "chartID": "chart" + chartID,
                        "chartType": "radarChart",
                        "chartData": getData(plotArea[key]["c:ser"], chartType)
                    }
                };
                break;
            case "c:scatterChart":
                chartType = 'scatterChart';
                chartData = {
                    "type": "createChart",
                    "data": {
                        "chartID": "chart" + chartID,
                        "chartType": "scatterChart",
                        "chartData": getData(plotArea[key]["c:ser"], chartType)
                    }
                };
                break;
            case "c:surface3DChart":
                chartType = 'surface3DChart';
                chartData = {
                    "type": "createChart",
                    "data": {
                        "chartID": "chart" + chartID,
                        "chartType": "surface3DChart",
                        "chartData": getData(plotArea[key]["c:ser"], chartType)
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

    return chartData;
}

function getData(serNode, chartType){

    let convertorUtils = new ConvertorUtils.ConvertorUtils();
    var dataMat = new Array();

    if (serNode === undefined) {
        return dataMat;
    }

    // let that = this; //Klaas - FIXED
    if (serNode["c:xVal"] !== undefined || serNode["cft"] !== undefined) {
        var dataRow = new Array();
        if (serNode["c:xVal"] !== undefined) { // Scatter case (with only one Y set of values)
            // Label
            var colName = convertorUtils.getTextByPathList(serNode, ["c:tx", "c:strRef", "c:strCache", "c:pt", "c:v"])[0] || index;
            for (var i = 0; i < serNode["c:xVal"]["c:numRef"]["c:numCache"]["c:pt"].length; i++) {
                var x1 = parseFloat(serNode["c:xVal"]["c:numRef"]["c:numCache"]["c:pt"][i]["c:v"][0]);
                var x2 = parseFloat(serNode["c:yVal"]["c:numRef"]["c:numCache"]["c:pt"][i]["c:v"][0]);
                dataRow.push({x: x1, y: x2});
            }
            dataMat.push({key: colName, values: dataRow});
        } else { // Pie Chart case
            convertorUtils.eachElement(serNode["c:val"]["c:numRef"]["c:numCache"]["c:pt"], function(innerNode, index) {
                dataRow.push(parseFloat(innerNode["c:v"]));
                return "";
            });
        }

    } else {

        convertorUtils.eachElement(serNode, function(innerNode, index) {
            var dataRow = new Array();
            //Klaas: TypeerrorconvertorUtils.js:1538 Uncaught TypeError: Cannot read property 'getTextByPathList' of undefined
            //Klaas: is problem with scoping? it should work, unless there is recursion. then we need
            //Klaas: ES7 => fat arrow, .bind(this) or that = this to keep track of lexical/dynamic scope
            //var colName = convertorUtils.getTextByPathList(innerNode, ["c:tx", "c:strRef", "c:strCache", "c:pt", "c:v"]) || index;

            var colName = null;
            if (convertorUtils.getTextByPathList(innerNode, ["c:tx", "c:strRef", "c:strCache", "c:pt", "c:v"])) {
                colName = convertorUtils.getTextByPathList(innerNode, ["c:tx", "c:strRef", "c:strCache", "c:pt", "c:v"])[0];
            } else {
                colName= index;
            }

            // Category (string or number)
            var rowNames = {};
            if (convertorUtils.getTextByPathList(innerNode, ["c:cat", "c:strRef", "c:strCache", "c:pt"]) !== undefined) {
                convertorUtils.eachElement(innerNode["c:cat"]["c:strRef"]["c:strCache"]["c:pt"], function(innerNode, index) {
                    rowNames[innerNode["attrs"]["idx"]] = innerNode["c:v"];
                    return "";
                });
            } else if (convertorUtils.getTextByPathList(innerNode, ["c:cat", "c:numRef", "c:numCache", "c:pt"]) !== undefined) {
                convertorUtils.eachElement(innerNode["c:cat"]["c:numRef"]["c:numCache"]["c:pt"], function(innerNode, index) {
                    rowNames[innerNode["attrs"]["idx"]] = innerNode["c:v"];
                    return "";
                });
            }

            // Value
            if (convertorUtils.getTextByPathList(innerNode, ["c:val", "c:numRef", "c:numCache", "c:pt"]) !== undefined) {
                convertorUtils.eachElement(innerNode["c:val"]["c:numRef"]["c:numCache"]["c:pt"], function(innerNode, index) {
                    dataRow.push({x: innerNode["attrs"]["idx"], y: parseFloat(innerNode["c:v"])});
                    return "";
                });
            } else if (convertorUtils.getTextByPathList(innerNode, ["c:xVal", "c:numRef", "c:numCache", "c:pt"]) !== undefined) {
                for (var i = 0; i < innerNode["c:xVal"]["c:numRef"]["c:numCache"]["c:pt"].length; i++) {
                    var x1 = parseFloat(innerNode["c:xVal"]["c:numRef"]["c:numCache"]["c:pt"][i]["c:v"][0]);
                    var x2 = parseFloat(innerNode["c:yVal"]["c:numRef"]["c:numCache"]["c:pt"][i]["c:v"][0]);
                    dataRow.push({x: x1, y: x2});
                }
            }

            dataMat.push({key: colName, values: dataRow, xlabels: rowNames});
            return "";
        });

    }

    return dataMat;
}

module.exports = extractChartData;