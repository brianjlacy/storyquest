/*
 * StoryQuest 2
 *
 * Copyright (c) 2014 Questor GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var fs = require("fs");
var path = require("path");

exports = module.exports = new NodeTypes();

var nodeSkeletons = {
    default: {
        "id": "001",
        "type": "default",
        "title": "Internal Editor Title",
        "style": "fullwidth",
        "isStartNode": false,
        "backgroundImage": "background.jpg",
        "backgroundColor": "#efefef",
        "paddingTop": "100%",
        "accentColor": "#766278",
        "boxBackgroundColor": "white",
        "choiceEnabledGradientStartColor": "#3498db",
        "choiceEnabledGradientEndColor": "#2980b9",
        "choiceDisabledGradientStartColor": "#3498db",
        "choiceDisabledGradientEndColor": "#2980b9",
        "choiceTextColor": "white",
        "text": {
            "de": "001_de.txt"
        }
    }
};

function NodeTypes() {
    // NOP
};

NodeTypes.prototype.getAvailableNodeTypes = function(context) {
    return ["default"];
};

NodeTypes.prototype.parseNodeConnections = function(configDir, node) {
    var that = this;
    if (node.type=="default")
        return that.parseDefaultNodeConnections(configDir, node);
};

NodeTypes.prototype.parseDefaultNodeConnections = function(configDir, node) {
    var result = [];
    // FIXME: works only for DE lang text
    var text = fs.readFileSync(path.join(configDir, node.text.de), "utf8");
    var matches = text.match(/\[l[^\\\]]*\]/g);
    if (matches)
        for (var i=0; i<matches.length; i++) {
            var tokens = matches[i].split("|");
            var targetId = tokens[1];
            result.push({
                id: node.id + "%" + targetId,
                target: targetId,
                source: node.id
            });
        }
    return result;
};

NodeTypes.prototype.getNewNodeId = function(configDir) {
    var current = 0;
    var files = fs.readdirSync(configDir);
    if (files)
        for (var i=0; i<files.length; i++)
            if (files[i].indexOf(".json")!=-1 &&
                files[i].indexOf("~")==-1) {
                var thisNodeIdStr = JSON.parse(fs.readFileSync(configDir + "/" + files[i], "utf8")).id;
                var thisNodeId = null;
                try {
                    thisNodeId = parseInt(thisNodeIdStr);
                } catch(err) {
                    // NOP, value was a string
                }
                if (thisNodeId && current<thisNodeId)
                    current = thisNodeId;
            }
    // current now holds the highest numeric nodeId
    // JavaScript is broken beyond repair
    var newIdStr = (current+1) + "";
    while (newIdStr.length < 3)
        newIdStr = "0" + newIdStr;
    return newIdStr;
};

NodeTypes.prototype.createNode = function(type, configDir) {
    var newId = this.getNewNodeId(configDir);
    var nodeSkeleton = this.createSkeleton(type);
    if (nodeSkeleton!=null) {
        nodeSkeleton.id = newId;
        nodeSkeleton.type = type;
        fs.writeFileSync(configDir + "/" + newId + ".json", JSON.stringify(nodeSkeleton));
        if (type=="default") {
            nodeSkeleton.text.de = newId + "_de.txt";
            fs.writeFileSync(configDir + "/" + nodeSkeleton.text.de, "Chapter Text starts here...");
        }
        return nodeSkeleton;
    } else
        return null;
};

NodeTypes.prototype.createSkeleton = function(type) {
    try {
        return nodeSkeletons[type];
    } catch (err) {
        console.log(err);
        return null;
    }
};
