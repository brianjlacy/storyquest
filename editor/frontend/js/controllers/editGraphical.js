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

editorModule.controller("editGraphicalCoreController", ["$scope", "$http", "$interval", "$timeout","ProjectService", "NodeConfigurationService", "Node",
    function ($scope, $http, $interval, $timeout, ProjectService, NodeConfigurationService, Node) {
        pageTitle("Edit", "Add and modify chapters");
        breadcrumb([{title:"Edit Graphical", url:"#/editGraphical"}, {title:"Chapters", url:""}]);

        $scope.project = ProjectService;
        $scope.nodes = {};
        $scope.nodelist = [];
        $scope.node;
        var graph = new joint.dia.Graph;

        var paper = new joint.dia.Paper({
            el: $('#diagram'),
            width: $(window).width(),
            height: $(document).height(),
            model: graph,
            gridSize: 1,
            defaultLink: new joint.dia.Link({
                attrs: { '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' } }
            }),
            validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
                // Prevent linking from input ports.
                if (magnetS && magnetS.getAttribute('type') === 'input') return false;
                // Prevent linking from output ports to input ports within one element.
                if (cellViewS === cellViewT) return false;
                // Prevent linking to input ports.
                return magnetT && magnetT.getAttribute('type') === 'input';
            },
            validateMagnet: function(cellView, magnet) {
                // Note that this is the default behaviour. Just showing it here for reference.
                // Disable linking interaction for magnets marked as passive (see below `.inPorts circle`).
                return magnet.getAttribute('magnet') !== 'passive';
            },
            // Enable link snapping within 75px lookup radius
            snapLinks: { radius: 75 }
        });

        paper.on('cell:pointerup', function(cellView, evt, x, y) {
            Node.get({ projectId: $scope.project.data.id, nodeIdOrType: cellView.model.get('sqId')}, function(node) {
                node.x = cellView.model.get('position').x;
                node.y = cellView.model.get('position').y;
                $scope.nodeChanged(node);
            });
        });

        paper.on('cell:pointerdblclick',
             function(cellView, evt, x, y) {
                 $scope.editNode(cellView.model.get('sqId'));
             }
         );

         graph.on('change:source change:target', function(link) {
             var linkSourceId = link.get('source').id;
             var linkTargetId = link.get('target').id;

             if(linkSourceId && linkTargetId){
                var targetId;
                var sourceId;
                Object.keys($scope.nodes).forEach(function (key) {
                    if($scope.nodes[key].id == linkSourceId){
                        sourceId = key;
                    }
                    if($scope.nodes[key].id == linkTargetId){
                        targetId = key;
                    }
                });
                Node.get({ projectId: $scope.project.data.id, nodeIdOrType: sourceId}, function(node) {
                    node.text[0].text += "[l|"+targetId+"| New Link]"
                    $scope.saveNode(node);
                });
             };
         });

        $scope.$watch("project.data.id", function() {
            if ($scope.project.data.id) {
                console.log("Loading editor framework for project " + $scope.project.data.id);
                $scope.refreshNodeList();
            }
        });

        // on enter/exit editors
        $scope.aceOnEnterLoaded = function(editor) {
            editor.setFontSize(20);
            editor.setShowPrintMargin(false);
            editor.getSession().setMode("ace/mode/javascript");
            editor.getSession().setUseWrapMode(false);
        };

        $scope.aceOnEnterChanged = function(e) {
            $scope.saveNode($scope.node);
        };

        $scope.aceOnExitLoaded = function(editor) {
            editor.setFontSize(20);
            editor.setShowPrintMargin(false);
            editor.getSession().setMode("ace/mode/javascript");
            editor.getSession().setUseWrapMode(false);
        };

        $scope.aceOnExitChanged = function(e) {
            $scope.saveNode($scope.node);
        };

        $scope.onDropComplete=function(nodetype, event) {
            Node.create({ projectId: $scope.project.data.id, nodeIdOrType: nodetype }, function(node) {
                node.color = "#666";
                var nodeJoint = $scope.buildNode(node);
                graph.addCells([nodeJoint]);
            }, function(error) {
                modalError("Error while creating new chapter. Please try again. (" + error.data + ")");
            });
        }

        $scope.refreshNodeList = function() {
            if ($scope.project.data && $scope.project.data.id){
                $http({method: "GET", url: "/api/nodetree/" + $scope.project.data.id}).
                    success(function(nodeTree, status, headers, config) {
                        $scope.buildNodes(nodeTree);
                    }).
                    error(function(data, status, headers, config) {
                        modalError("Fehler " + status + " beim Lesen von Daten. Bitte noch einmal versuchen.");
                    });
            }
        }

        $scope.buildNodes = function(nodeTree) {
            var nodes = nodeTree.nodes;
            var linkVertices = {};
            for (var key in nodes) {
                var node  = nodes[key];
                var nodeJoint = $scope.buildNode(node);
                $scope.nodelist.push(node);
                $scope.nodes[node.id] = nodeJoint;
                graph.addCells([nodeJoint]);
                if(node.linkVertices){
                    linkVertices[node.id] = node.linkVertices;
                }
            }
            $scope.addLinks(nodeTree.edges, linkVertices);
        }

        $scope.buildNode  = function(node){
           return joint.shapes.storyquest.createNode(
                    node.type,
                    node.id,
                    node.title,
                    node.color,
                    node.x,
                    node.y);
        }

        $scope.addLinks = function(edges, linkVertices) {
            for (var key in edges) {
                if(edges[key].source && edges[key].target ){
                    var link = joint.shapes.storyquest.createLink(
                                edges[key].id,
                                "",
                                $scope.nodes[edges[key].source],
                                $scope.nodes[edges[key].target]);
                    if(linkVertices && linkVertices[edges[key].source]){
                        link.set('vertices', linkVertices[edges[key].source][edges[key].target]);
                    }
                    link.on('change:vertices', function() {
                        var sourceId = link.get("source").id.get("sqId");
                        var targetId = link.get("target").id.get("sqId");
                        Node.get({ projectId: $scope.project.data.id, nodeIdOrType: sourceId}, function(node) {
                            if(!node.linkVertices){
                                node.linkVertices = {};
                            }
                            node.linkVertices[targetId] = link.get("vertices");
                             $scope.nodeChanged(node);
                        });
                    });
                    graph.addCells([link]);
                }
            }
        }

        // filter properties for JSON settings editor
        $scope.registerFilterPropertyKeys = function(entries){
            $scope.filterPropertyKeys = NodeConfigurationService.registerFilterPropertyKeys(entries);
        }

        $scope.filterPropertyKeys = NodeConfigurationService.registerFilterPropertyKeys([
                    "$promise",
                    "$resolved",
                    "type",
                    "text",
                    "_id",
                    "_revision",
                    "onEnter",
                    "onExit",
                    "technicalName",
                    "id",
                    "x",
                    "y",
                    "nodeColor"
                ]);

        $scope.configureNode = function(nodeId){
            Node.get({ projectId: $scope.project.data.id, nodeIdOrType: nodeId}, function(node) {
                $scope.node = node;
                // JSON editor
                var schema = stationconfigSchemaV1[node.type];
                var options = { schema: schema, data: NodeConfigurationService.filtercopyNodeConfiguration(node, $scope.filterPropertyKeys), callbacks: {
                    change: function(e, changes) {
                        $scope.configurationChanged(treema, node)
                    }
                }};
                // treema is non-angular
                var el = $("#treemajson");
                var treema = el.treema(options);
                treema.build();

                $("#modalConfiguration").modal();
            });
        }

        $scope.onExitNode = function(nodeId){
            Node.get({ projectId: $scope.project.data.id, nodeIdOrType: nodeId}, function(node) {
               $scope.node = node;
               $("#modalEditOnExit").modal();
           });
        }

        $scope.onEnterNode = function(nodeId){
            Node.get({ projectId: $scope.project.data.id, nodeIdOrType: nodeId}, function(node) {
                $scope.node = node;
                $("#modalEditOnEnter").modal();
            });
        }

        $scope.editNode = function(nodeId){
            Node.get({ projectId: $scope.project.data.id, nodeIdOrType: nodeId}, function(node) {
                if(!(node.type == "cutscene" ||
                    node.type == "settings" ||
                    node.type == "quiz")) {
                        $scope.node = node;
                        $("#modalContent").modal();
                }
            });
        }

        $scope.deleteNode = function(nodeId) {
            Node.delete({ projectId: $scope.project.data.id, nodeIdOrType: nodeId}, function() {
                }, function(error) {
                    modalError("Error while deleting node: " + error.data.message);
                });
        }

        $scope.configurationChanged = function(treema, node){
            for (var entry in treema.data){
                if (treema.data.hasOwnProperty(entry) &&
                        NodeConfigurationService.filterProperties(entry, $scope.filterPropertyKeys)) {
                    node[entry] = treema.data[entry];
                 }
            }
            $scope.nodes[$scope.node.id].attr({
                '.label': { text: node.title }
            });
            $scope.saveNode(node, function(){
                 console.log("Finished storing node info for node " + node.id);
                 $("div[data-id]").remove();
                 $("g[model-id]").remove();
                 $scope.refreshNodeList();
            });
        }

        $scope.changeNodeColor = function(color){
            if($scope.node) {
                $scope.node.nodeColor = color;
                $scope.saveNode($scope.node);
                if($scope.nodes[$scope.node.id]) {
                    $scope.nodes[$scope.node.id].attr({
                        '.header': { fill: color }
                    });
                }
            }
        }

        $scope.setContentEditorEnabled = function(enabled){}
        $scope.setConfigurationEditorEnabled = function(enabled){}

        $scope.nodeChanged = function(node){
            $scope.savequeue[node.id] = JSON.parse(JSON.stringify(node));
        }

        // enable auto saving of node content
        $scope.savequeue = {};
        var editorSyncDebounce = function() {
            if (Object.keys($scope.savequeue).length > 0) {
                for (var entry in $scope.savequeue) {
                    if ($scope.savequeue.hasOwnProperty(entry) && $scope.savequeue[entry]) {
                        var thisNode = $scope.savequeue[entry];
                        delete $scope.savequeue[entry];
                        $scope.saveNode(thisNode);
                    }
                }
            }
        };
        $interval(editorSyncDebounce, 1000);

        $scope.saveNode = function(node, callback) {
            if($scope.project.data.id && node.id){
                if(!callback){
                    callback = function(){
                         console.log("Finished storing node info for node " + node.id);
                    }
                }
                console.log("Storing node info on server for node " + node.id);
                $http.post("/api/node/" + $scope.project.data.id + "/" + node.id, node).
                    success(callback).
                    error(function(data, status, headers, config) {
                        modalError("Error storing data on server. Please try again. (" + status + ")");
                    });
            }
        };

        scale = 1;
        paper.scale(1);
        $('#diagram').on('mousewheel', function(event) {
            var deltay = (event.originalEvent.detail < 0 || event.originalEvent.wheelDelta > 0) ? 1 : -1;
            scale = scale + deltay * 0.1;
            paper.scale(scale);
            for (var index = 0; index < joint.shapes.storyquest.nodes.length; ++index) {
                joint.shapes.storyquest.nodes[index].updateBox();
            }
        });
    }]
);