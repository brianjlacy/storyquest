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

function NodeTypes() {
    // NOP
}

NodeTypes.prototype.getAvailableNodeTypes = function(context) {
    // FIXME: automate that
    if (context && context==="sqw2014")
        return ["book"];
    else
        return ["barebone", "book", "geo", "web", "youtube", "cutscene", "settings", "quiz"];
}

NodeTypes.prototype.parseNodeConnections = function(configDir, node) {
    var that = this;
    if (node.type=="barebone")
        return that.parseBareboneNodeConnections(configDir, node);
    else if (node.type=="web")
        return that.parseWebNodeConnections(configDir, node);
    else if (node.type=="geo")
        return that.parseGeoNodeConnections(node);
    else if (node.type=="youtube")
        return that.parseYouTubeNodeConnections(node);
    else if (node.type=="book")
        return that.parseBookNodeConnections(configDir, node);
    else if (node.type=="cutscene")
        return that.parseCutsceneNodeConnections(node);
    else if (node.type=="check")
        return that.parseCheckNodeConnections(node);
    else if (node.type=="battle")
        return that.parseBattleNodeConnections(node);
    else if (node.type=="create")
        return that.parseCreateNodeConnections(node);
    else if (node.type=="settings")
        return that.parseSettingsNodeConnections(node);
    else if (node.type=="quiz")
        return that.parseQuizNodeConnections(node);
};

NodeTypes.prototype.parseBareboneNodeConnections = function(configDir, node) {
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
}

NodeTypes.prototype.parseBookNodeConnections = function(configDir, node) {
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
}

NodeTypes.prototype.parseWebNodeConnections = function(configDir, node) {
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
}

NodeTypes.prototype.parseYouTubeNodeConnections = function(node) {
    if (node.videoActionType=="link")
        return [{
            id: node.id + "%" + node.videoAction,
            target: node.videoAction,
            source: node.id
        }]
    else
        return [];
};

NodeTypes.prototype.parseCutsceneNodeConnections = function(node) {
    console.log(node.id + "%" + node.nextStation)
    return [{
        id: node.id + "%" + node.nextStation,
        target: node.nextStation,
        source: node.id
    }];
};

NodeTypes.prototype.parseGeoNodeConnections = function(node) {
     var result = [];
     if(node.geoPOIs){
        for (var i=0; i<node.geoPOIs.length; i++) {
            if(node.geoPOIs[i].poiActionType=="link")
            result.push({
                id: node.id + "%" + node.geoPOIs[i].poiAction,
                target: node.geoPOIs[i].poiAction,
                source: node.id
            });
        }
     }
    return result;
};

NodeTypes.prototype.parseCreateNodeConnections = function(node) {
    return [
        {
            id: node.id + "%" + node.nextStation,
            target: node.nextStation,
            source: node.id
        }
    ];
};

NodeTypes.prototype.parseCheckNodeConnections = function(node) {
    return [
        {
            id: node.id + "%" + node.failTarget,
            target: node.failTarget,
            source: node.id
        },
        {
            id: node.id + "%" + node.successTarget,
            target: node.successTarget,
            source: node.id
        }
    ];
};

NodeTypes.prototype.parseQuizNodeConnections = function(node) {
    return [
        {
            id: node.id + "%" + node.lostTarget,
            target: node.lostTarget,
            source: node.id
        },
        {
            id: node.id + "%" + node.wonTarget,
            target: node.wonTarget,
            source: node.id
        }
    ];
};

NodeTypes.prototype.parseBattleNodeConnections = function(node) {
    return [
        {
            id: node.id + "%" + node.failTarget,
            target: node.failTarget,
            source: node.id
        },
        {
            id: node.id + "%" + node.successTarget,
            target: node.successTarget,
            source: node.id
        }
    ];
};

NodeTypes.prototype.parseSettingsNodeConnections = function(node) {
    return [];
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
    while (newIdStr.length < 4)
        newIdStr = "0" + newIdStr;
    return newIdStr;
}

NodeTypes.prototype.createNode = function(type, configDir) {
    var newId = this.getNewNodeId(configDir);
    var nodeSkeleton = {id: newId, technicalName: newId, type: type};

    if (type=="barebone")
        this.createSkeletonBarebone(nodeSkeleton);
    else if (type=="web")
        this.createSkeletonWeb(nodeSkeleton);
    else if (type=="geo")
        this.createSkeletonGeo(nodeSkeleton);
    else if (type=="youtube")
        this.createSkeletonYouTube(nodeSkeleton);
    else if (type=="book")
        this.createSkeletonBook(nodeSkeleton);
    else if (type=="cutscene")
        this.createSkeletonCutscene(nodeSkeleton);
    else if (type=="check")
        this.createSkeletonCheck(nodeSkeleton);
    else if (type=="battle")
        this.createSkeletonBattle(nodeSkeleton);
    else if (type=="create")
        this.createSkeletonCreate(nodeSkeleton);
    else if (type=="settings")
        this.createSkeletonSettings(nodeSkeleton);
    else if (type=="quiz")
        this.createSkeletonQuiz(nodeSkeleton);

    fs.writeFileSync(configDir + "/" + newId + ".json", JSON.stringify(nodeSkeleton));
    if (type=="barebone" || type=="book" || type=="web")
        fs.writeFileSync(configDir + "/" + nodeSkeleton.text.de, "Chapter Text starts here...");
    return nodeSkeleton;
};

NodeTypes.prototype.createSkeletonBarebone = function(node) {
    node.backgroundColor = "#ffffff";
    node.textColor = "#000000";
    node.title = "New " + node.type;
    node.isStartNode = false;
    node.text = {};
    node.text.de = node.id + "_de.txt";
    node.headerText = {};
    node.headerText.de = "Change me";
    return node;
};

NodeTypes.prototype.createSkeletonBook = function(node) {
    node.backgroundColor = "#ffffff";
    node.textColor = "#000000";
    node.title = "New " + node.type;
    node.headerText = {};
    node.headerText.de = "";
    node.headerText.en = "";
    node.isStartNode = false;
    node.backgroundImage = "";
    node.text = {};
    node.text.de = node.id + "_de.txt";
    return node;
};

NodeTypes.prototype.createSkeletonWeb = function(node) {
    node.backgroundColor = "#ffffff";
    node.textColor = "#000000";
    node.title = "New " + node.type;
    node.headerText = {};
    node.headerText.de = "Change me";
    node.headerText.en = "Change me";
    node.isStartNode = false;
    node.backgroundImage = "";
    node.text = {};
    node.text.de = node.id + "_de.txt";
    return node;
};

NodeTypes.prototype.createSkeletonGeo = function(node) {
    node.isStartNode = false;
    node.title = "New " + node.type;
    node.initialZoom = 10;
    node.headerText = {};
    node.headerText.de = "Change me";
    node.headerText.en = "Change me";
    node.footerText = {};
    node.footerText.de = "Change me";
    node.footerText.en = "Change me";
    return node;
};

NodeTypes.prototype.createSkeletonYouTube = function(node) {
    node.isStartNode = false;
    node.title = "New " + node.type;
    node.youTubeURL = "";
    node.videoActionType = "link";
    node.videoAction = "";
    return node;
};

NodeTypes.prototype.createSkeletonCheck = function(node) {
    node.isStartNode = false;
    node.title = "New " + node.type;
    node.backgroundImage = "";
    node.alternateBackgroundImage = "";
    node.textLost = "Text Lost";
    node.textWon = "Text Won";
    node.titleWon = "Title Won";
    node.titleLost = "Title Lost";
    node.probes = [
        {
            attribute: "xx",
            value: 0
        },
        {
            attribute: "xx",
            value: 0
        }
    ];
    node.wonTarget = "";
    node.lostTarget = "";
    return node;
};

NodeTypes.prototype.createSkeletonQuiz = function(node) {
    node.isStartNode = false;
    node.title = "New " + node.type;
    node.backgroundImage = "";
    node.textLost = "Text wrong answer";
    node.textWon = "Text correct answer";
    node.titleWon = "Title wrong answer";
    node.titleLost = "Title correct answer";
    node.question = "Question text";
    node.questionType = "multiple";
    node.textAnswer = "Correct answer for text question type.";
    node.choices = [
        {
            choiceText: "Choice text 1",
            isCorrect: true
        },
        {
            choiceText: "Choice text 2",
            isCorrect: false
        }
    ];
    node.wonTarget = "";
    node.lostTarget = "";
    return node;
};

NodeTypes.prototype.createSkeletonBattle = function(node) {
    node.isStartNode = false;
    node.title = "New " + node.type;
    node.backgroundImage = "";
    node.alternateBackgroundImage = "";
    node.textLost = "Text Lost";
    node.textWon = "Text Won";
    node.titleWon = "Title Won";
    node.titleLost = "Title Lost";
    node.monster = {
        name: "Monster Name",
        power: 0,
        life: 0,
        icon: ""
    };
    node.wonTarget = "";
    node.lostTarget = "";
    return node;
};

NodeTypes.prototype.createSkeletonCreate = function(node) {
    node.isStartNode = false;
    node.title = "New " + node.type;
    node.nextStation = "";
    return node;
};

NodeTypes.prototype.createSkeletonSettings = function(node) {
    node.isStartNode = false;
    node.title = "New " + node.type;
    return node;
};

NodeTypes.prototype.createSkeletonCutscene = function(node) {
    node.isStartNode = false;
    node.title = "New " + node.type;
    node.nextStation = "";
    node.frames = [
        {
            layers: [
                {
                    type: "text",
                    className: "text",
                    text: "Change me",
                    startPosX: "0%",
                    startPosY: "0%",
                    duration: "1000",
                    easing: "ease",
                    delay: "0",
                    animations: [
                        {
                            type: "fadeIn"
                        }
                    ]
                }
            ]
        }
    ];
    return node;
};
