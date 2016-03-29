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

var nodetypes = require("../logic/nodetypes");

exports.registerServices = function(config, app) {
    app.get("/api/nodetree/:projectId", authUser, authProject, this.renderNodeTree);
};

exports.renderNodeTree = function(req, res){
    var projectId = req.param("projectId");
    var isWindow = req.param("window")==="true";
    var configDir = path.join(Utils.getProjectDir(projectId), "stationconfig");

    var tree = {
        "nodes": [],
        "edges": []
    };

    fs.readdir(configDir, function (err, list) {
        var nodeIdList = [];

        // pass 1: parse nodes
        list.forEach(function (file) {
            if (file.indexOf(".json")!=-1) {
                var node = JSON.parse(fs.readFileSync(path.join(configDir, file)));
                // parse node
                var thisNode = {
                    id: node.id,
                    title: node.title,
                    x: node.x || Math.random(),
                    y: node.y || Math.random(),
                    size: 1,
                    linkVertices: node.linkVertices,
                    color: node.nodeColor || "#666",
                    type: node.type,
                    image: {
                        url: "/images/icons/" + node.type + ".png",
                        scale: 0.8,
                        clip: 0.85
                    }
                };
                tree.nodes.push(thisNode);
                nodeIdList.push(thisNode.id);
            }
        });

        // pass 2: parse edges, has to be done after indexing all node id's above
        list.forEach(function (file) {
            if (file.indexOf(".json")!=-1) {
                var node = JSON.parse(fs.readFileSync(path.join(configDir, file)));
                // parse edges
                var edges = nodetypes.parseNodeConnections(configDir, node);
                if (edges) {
                    for (var i=0; i < edges.length; i++) {
                        var thisEdge = edges[i];
                        // only add the edge if the target node actually exists
                        if (nodeIdList.indexOf(thisEdge.target)!=-1) {
                            thisEdge.size = 1;
                            thisEdge.color = "#ccc";
                            thisEdge.type = "curvedArrow";
                            tree.edges.push(thisEdge);
                        }
                    }
                }
            }
        });

        res.json(tree);
    });
};

