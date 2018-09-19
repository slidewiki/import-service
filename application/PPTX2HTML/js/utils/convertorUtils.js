class ConvertorUtils {

    constructor(){

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
}

module.exports = {
    ConvertorUtils
}