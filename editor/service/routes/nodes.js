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

var fs = require('fs');
var path = require('path');
var request = require('request');
var lunr = require('lunr');
var tmp = require('tmp');

var nodetypes = require('../logic/nodetypes');
var preview = require('./liveupdateserver');

exports.registerServices = function(config, app) {
    app.get("/api/nodelist/:projectId", authUser, authProject, this.getNodeList);

    app.get("/api/node/:projectId/:id", authUser, authProject, this.getNode);
    app.post("/api/node/:projectId/:id", authProject, authUser, this.storeNode);
    app.put("/api/node", authUser, authProject, this.createNode);
    app.delete("/api/node/:projectId/:id", authUser, authProject, this.deleteNode);

    app.post("/api/geosearch", authUser, this.geosearch);
};

exports.createIndexHTML = function(outputDir, type, nodeId) {
    var html = '<html><head><script> window.location = "station-html/' + type + '.html?station=' + nodeId + '";\n</script></head></html>';
    fs.writeFileSync(outputDir + "/index.html", html);
};

exports.retrieveNodeList = function(projectId) {
    var outputDir = path.join(Utils.getProjectDir(projectId), "stationconfig");
    var files = fs.readdirSync(outputDir);
    var nodeList = [];
    if (files)
        for (var i=0; i<files.length; i++)
            if (files[i].indexOf(".json")!=-1 && files[i].indexOf("~")==-1) {
                var node = JSON.parse(fs.readFileSync(outputDir + "/" + files[i], "utf8"));
                var nodeEntry = {};
                nodeEntry.id = files[i].replace(".json", "");
                nodeEntry.type = node.type;
                nodeEntry.nodeColor = node.nodeColor;
                // TODO: this only works in game books, define general title field!
                if (node.title)
                    nodeEntry.title = node.title;
                else if (node.headerText)
                    nodeEntry.title = node.headerText.de;
                else
                    nodeEntry.title = "Title not defined";
                nodeList.push(nodeEntry);
            }
    return nodeList;
};

exports.getNodeList = function(req, res){
    res.json(exports.retrieveNodeList(req.param("projectId")));
};

exports.getNode = function(req, res){
    var outputDir = path.join(Utils.getProjectDir(req.param("projectId")), "stationconfig");
    var node = JSON.parse(fs.readFileSync(path.join(outputDir, req.param("id") + ".json"), "utf8"));
    if (node.text) {
        var texts = [];
        for (var language in node.text) {
            if (node.text.hasOwnProperty(language)) {
                var text = fs.readFileSync(path.join(outputDir, node.text[language]), "utf8");
                texts.push({ lang: language, text: text });
            }
        }
        node.text = texts;
    }
    res.json(node);
};

exports.storeNode = function(req, res){
    var outputDir = path.join(Utils.getProjectDir(req.param("projectId")), "stationconfig");
    try {
        var node = req.body;

        // update preview
        preview.updateNode(req.param("projectId"), JSON.parse(JSON.stringify(node)));

        // postparsing text nodes, deserializing, writing to disk
        if (node.text) {
            var langTexts = {};
            for (var i=0; i<node.text.length; i++) {
                var thisText = node.text[i];
                var lang = thisText.lang;
                var content = thisText.text;
                var filename = node.id + "_" + lang + ".txt";
                fs.writeFileSync(outputDir + "/" + filename, content);
                langTexts[lang] = filename;
            }
            node.text = langTexts;
        }

        // writing config to disk
        fs.writeFileSync(outputDir + "/" + node.id + ".json", JSON.stringify(node));

        // if startNode, generate index.html
        if (node.isStartNode) {
            // Write index.html
            exports.createIndexHTML(Utils.getProjectDir(req.param("projectId")), node.type, node.id);
        }

        /*
        // FIXME enable this
        // if this is a searchable node, update index
        if (node.searchable && node.searchable=="true") {
            // indexing the asset
            // TODO: only works on german, only the german title field is used.
            var title = "";
            if (req.body.config.headerText && req.body.config.headerText.de)
                title = req.body.config.headerText.de;
            var indexFile = outputDir + "/index.idx";
            var index = null;
            // TODO: add german stemmer using "Utils.stemmer(word);"
            if (fs.existsSync(indexFile)) {
                var indexSerialized = fs.readFileSync(indexFile, "utf8");
                index = lunr.Index.load(JSON.parse(indexSerialized));
            } else {
                index = new lunr.Index;
                index.field("title", {boost: 10});
                index.field("text");
                index.ref("id");
            }
            index.update({
                id: req.body.config.technicalName,
                title: title,
                text: req.body.configAsset
            }, false);
            indexSerialized = JSON.stringify(index.toJSON());
            fs.writeFileSync(indexFile, indexSerialized);
        }
         */

        res.status(200);
        res.json({});
    }
    catch(err) {
        res.status(501);
        res.json(err);
    }
};

exports.createNode = function(req, res){
    var outputDir = path.join(Utils.getProjectDir(req.param("projectId")), "stationconfig");
    var newNodeSkeleton = null;
    try {
        // FIXME: check if the type is contained in the project's types
        newNodeSkeleton = nodetypes.createNode(req.param("nodeIdOrType"), outputDir);
        if (exports.retrieveNodeList(req.param("projectId")).length==1) {
            // this is the first created node, make it the start node
            newNodeSkeleton.isStartNode = true;
            fs.writeFileSync(outputDir + "/" + newNodeSkeleton.id + ".json", JSON.stringify(newNodeSkeleton));
            exports.createIndexHTML(Utils.getProjectDir(req.param("projectId")), newNodeSkeleton.type, newNodeSkeleton.id);
        };
        // store new node id in sequence
        var sequence = [];
        var sequenceFile = path.join(Utils.getProjectDir(req.param("projectId")), "sequence.json");
        if (fs.existsSync(sequenceFile)) {
            sequence = JSON.parse(fs.readFileSync(sequenceFile, "utf8"));
            sequence.push(newNodeSkeleton.id);
        }
        else {
            var nList = exports.retrieveNodeList(req.param("projectId"));
            for (var i=0; i<nList.length; i++)
                sequence.push(nList[i].id);
        }
        fs.writeFileSync(sequenceFile, JSON.stringify(sequence));
        res.json(newNodeSkeleton);
    } catch(err) {
        console.log(err);
        res.status(501);
        res.json(err);
    }
};

exports.deleteNode = function(req, res) {
    var outputDir = path.join(Utils.getProjectDir(req.param("projectId")), "stationconfig");
    var nodeId = req.param("id");
    try {
        var node = JSON.parse(fs.readFileSync(path.join(outputDir, nodeId + ".json"), "utf8"));
        if (node.isStartNode)
            return res.json(500, {type:"REQUEST_FAILED", "message":"You can't delete the start node."});
        else {
            fs.unlinkSync(outputDir + "/" + req.param("id") + ".json");
            if (fs.existsSync(outputDir + "/" + req.param("id") + ".txt"))
                fs.unlinkSync(outputDir + "/" + req.param("id") + ".txt");
            // remove node from sequence
            var sequence = [];
            var sequenceFile = path.join(Utils.getProjectDir(req.param("projectId")), "sequence.json");
            if (fs.existsSync(sequenceFile))
                sequence = JSON.parse(fs.readFileSync(sequenceFile, "utf8"));
            var seqPos = sequence.indexOf(nodeId);
            if (seqPos > -1)
                sequence.splice(seqPos, 1);
            fs.writeFileSync(sequenceFile, JSON.stringify(sequence));
            return res.json(200, {});
        }
    }
    catch (err) {
        return res.json(500, {type:"REQUEST_FAILED", "message":err});
    }
};

exports.geosearch = function(req, res) {
    request.post(
        "http://www.openrouteservice.org/php/OpenLSLUS_Geocode.php",
        { form: { FreeFormAdress: req.param("query"), MaxResponse: "1" } },
        function (error, response, body) {
            res.status(response.statusCode);
            if (!error && response.statusCode == 200) {
                res.writeHead( 200, {'Content-Type': 'text/xml'} );
                return res.end(body);
            } else
                return res.json(200, {});
        }
    );
};
