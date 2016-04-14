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

editorModule.controller("editGraphicalCoreController", ["$scope", "$http", "$interval", "$timeout","ProjectService", "NodeConfigurationService", "Node", "WebSocketService",
    function ($scope, $http, $interval, $timeout, ProjectService, NodeConfigurationService, Node, WebSocketService) {
        pageTitle("Edit", "Add and modify chapters");
        breadcrumb([{title:"Edit Story Graph", url:"#/editGraphical"}, {title:"Chapters", url:""}]);

        $scope.project = ProjectService;
        $scope.nodes = {};
        $scope.nodelist = [];
        $scope.node = null;

        // Boostrap hacks: enable tabs, prevent active links on disabled tabs
        $(".edittab").click(function (e) {
            e.preventDefault();
            $(this).tab("show");
        });

        $scope.$watch("project.data.id", function() {
            if ($scope.project.data.id) {
                console.log("Loading editor framework for project " + $scope.project.data.id);
                $scope.refreshNodeList();
            }
        });

        // initialize json editor
        $("#stationDataEditor-graph").jsoneditor({
            schema: stationconfigSchema,
            theme: "bootstrap3",
            iconlib: "bootstrap3",
            disable_collapse: true
        }).on("ready", function() {
            $scope.jsonEditor = $(this);
        }).on('change',function() {
            var currentEditorModel = $scope.getEditorModel();
            if ($scope.node) {
                for (var i=0; i<propertiesAvailableInConfigEditor.length;i++)
                    $scope.node[propertiesAvailableInConfigEditor[i]] = currentEditorModel[propertiesAvailableInConfigEditor[i]]
                $scope.nodeChanged($scope.node);
                $scope.refreshNodeList();
            }
        });

        $scope.filterCopyConfigEditorProperties = function(jsObj) {
            var result = {};
            for (var i=0; i<propertiesAvailableInConfigEditor.length;i++)
                result[propertiesAvailableInConfigEditor[i]] = jsObj[propertiesAvailableInConfigEditor[i]]
            return result;
        };

        $scope.setContentEditorEnabled = function(enabled) {
            $scope.contentEditorEnabled = enabled;
        };

        $scope.setConfigurationEditorEnabled = function(enabled) {
            $scope.configurationEditorEnabled = enabled;
        };

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

        $scope.editNode = function(nodeId){
            Node.get({ projectId: $scope.project.data.id, nodeIdOrType: nodeId}, function(node) {
                // on enter/exit data
                $scope.node = node;
                $scope.editorNodeColor = $scope.node.nodeColor;
                // load configuration into json editor
                $scope.setEditorModel($scope.filterCopyConfigEditorProperties(node));
                // only enable configuration editor by default, all unknown node types only get configurations
                $scope.setContentEditorEnabled(false);
                $scope.setConfigurationEditorEnabled(true);
                WebSocketService.loadNodeInPreview($scope.node);
                // finally, open modal dialog
                $("#modalContent-graph").modal();
            });
        };

        $scope.getEditorModel = function() {
            return $scope.jsonEditor.jsoneditor('value');
        };

        $scope.setEditorModel = function(jsObj) {
            if ($scope.jsonEditor)
                $scope.jsonEditor.jsoneditor('value', jsObj);
        };

        $scope.deleteNode = function() {
            $("#modalContent-graph").modal("hide");
            modalYesNo("Delete Node", "You are deleting node \"" + $scope.node.title + "\" (" + $scope.node.id + "). This operation can not be undone. Are you sure?", function(result) {
                if (result)
                    Node.delete({ projectId: $scope.project.data.id, nodeIdOrType: $scope.node.id}, function() {
                        $scope.refreshNodeList();
                    }, function(error) {
                        modalError("Error while deleting node: " + error.data);
                    });
            });
        };

        $scope.nodeChanged = function(node){
            $scope.savequeue[node.id] = JSON.parse(JSON.stringify(node));
        };

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

        // refresh graph when the modal is closed
        $("#modalContent-graph").on('hidden.bs.modal', function () {
            $scope.refreshNodeList();
        });

        $scope.saveNode = function(node) {
            console.log("Storing node info on server for node " + node.id);
            $http.post("/api/node/" + $scope.project.data.id + "/" + node.id, node)
                .success(function(data, status, headers, config) {
                    console.log("Finished storing node info for node " + node.id);
                    if (Object.keys($scope.savequeue).length==0)
                        $scope.editorSynced();
                })
                .error(function(data, status, headers, config) {
                    modalError("Error storing data on server. Please try again. (" + status + ")");
                    if (Object.keys($scope.savequeue).length==0)
                        $scope.editorSynced();
                });
        };

        // toggles the save indicator
        $scope.editorSyncing = function() {
            $scope.editorSyncReady = false;
        };

        // toggles the save indicator
        $scope.editorSynced = function() {
            $scope.editorSyncReady = true;
        };

        //////////////////////////////////////////////////////////////
        // GRAPH DISPLAY STUFF FOLLOWS - KEEP CLEAR

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

        /* Group selection and node moving start */

        var pointerIsDown = false;
        var originalPos = { x:0, y:0 };
        paper.on('cell:pointerdown', function(cellView, evt, x, y) {
            pointerIsDown = true;
            originalPos.x = cellView.model.get('position').x;
            originalPos.y = cellView.model.get('position').y;
        });

        paper.on('cell:pointermove', function(cellView, evt, x, y) {
            if (pointerIsDown) {
                // calculate delta
                var deltaX = originalPos.x - cellView.model.get('position').x;
                var deltaY = originalPos.y - cellView.model.get('position').y;
                // recorn new orig position
                originalPos.x = cellView.model.get('position').x;
                originalPos.y = cellView.model.get('position').y;
                // drag cell around detected, move all marked cells
                for (var i=0; i<markedNodes.length; i++) {
                    if (cellView.model.id != markedNodes[i].model.id) {
                        var position = markedNodes[i].model.get('position');
                        markedNodes[i].model.set('position', {x: position.x - deltaX, y: position.y - deltaY});
                    }
                }
            }
        });

         var markedNodes = [];
         paper.on('cell:pointerclick', function(cellView, evt, x, y) {
             if (!evt.shiftKey) {
               for (var i=0; i<markedNodes.length; i++) {
                   console.log("Setting color for " + markedNodes[i]);
                   markedNodes[i].model.attr('.body/stroke', 'darkgrey');
                   markedNodes[i].model.attr('.header/stroke', 'darkgrey');
                }
                markedNodes = [ ];
             }
             markedNodes.push(cellView);
             cellView.model.attr('.body/stroke', 'red');
             cellView.model.attr('.header/stroke', 'red');
         });

        paper.on('cell:pointerup', function(cellView, evt, x, y) {
            pointerIsDown = false;
            if (markedNodes.length>0)
                // selection in progress
                for (var i=0; i<markedNodes.length; i++) {
                    // wrapping the call in a function to capture the context. JavaScript sucks sometimes.
                    (function() {
                        var thisNode = markedNodes[i];
                        Node.get({ projectId: $scope.project.data.id, nodeIdOrType: thisNode.model.get('sqId')}, function(node) {
                            node.x = thisNode.model.get('position').x;
                            node.y = thisNode.model.get('position').y;
                            $scope.nodeChanged(node);
                        });
                    })();
                }
            else {
                // only the local node, no selection
                Node.get({ projectId: $scope.project.data.id, nodeIdOrType: cellView.model.get('sqId')}, function(node) {
                    node.x = cellView.model.get('position').x;
                    node.y = cellView.model.get('position').y;
                    $scope.nodeChanged(node);
                });
            }
        });

        /* Group selection and node moving end */

        paper.on('cell:pointerdblclick',
             function(cellView, evt, x, y) {
                 $scope.editNode(cellView.model.get('sqId'));
             }
         );
        
        // DRAG PAPER START

        paper.on('blank:pointerdown',
            function(event, x, y) {
                $scope.originDelta = { x: paper.options.origin.x, y: paper.options.origin.y };
                $scope.scale = V(paper.viewport).scale();
                $scope.dragStartPosition = { x: x * $scope.scale.sx, y: y * $scope.scale.sy};
            }
        );

        $("#diagram")
            .mousemove(function(event) {
                if ($scope.dragStartPosition) {
                    $scope.dragStartPosition.currentX = event.offsetX;
                    $scope.dragStartPosition.currentY = event.offsetY;
                    $scope.dragStartPosition.deltaX = event.offsetX - $scope.dragStartPosition.x;
                    $scope.dragStartPosition.deltaY = event.offsetY - $scope.dragStartPosition.y;
                    paper.setOrigin((event.offsetX - $scope.dragStartPosition.x), (event.offsetY - $scope.dragStartPosition.y));
                }
            });

        paper.on('cell:pointerup blank:pointerup', function(cellView, x, y) {
            if ($scope.dragStartPosition) {
                $scope.originDelta = { x: (paper.options.origin.x - $scope.originDelta.x), y: (paper.options.origin.y - $scope.originDelta.y) };
                $(".joint-html-element").each(function() {
                    var newLeft = parseInt($(this).css("left")) + $scope.originDelta.x;
                    var newTop = parseInt($(this).css("top")) + $scope.originDelta.y;
                    $(this).css({top: newTop, left: newLeft });
                });
                delete $scope.dragStartPosition;
            }
        });

        // DRAG PAPER END

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
                    node.text[0].text += "\n{link(" + targetId + "):Link to Chapter " + targetId + "}\n";
                    $scope.saveNode(node);
                });
             }
         });

        $scope.onDropComplete=function(nodetype, event) {
            Node.create({ projectId: $scope.project.data.id, nodeIdOrType: nodetype }, function(node) {
                node.color = "#666";
                node.x = (event.x - paper.options.origin.x - $('#diagram').offset().left - 50) / scale;
                node.y = (event.y - paper.options.origin.y - $('#diagram').offset().top - 50) / scale;
                var nodeJoint = $scope.buildNode(node);
                graph.addCells([nodeJoint]);
            }, function(error) {
                modalError("Error while creating new chapter. Please try again. (" + error.data + ")");
            });
        };

        $scope.refreshNodeList = function() {
            if ($scope.project.data && $scope.project.data.id){
                $http({method: "GET", url: "/api/nodetree/" + $scope.project.data.id}).
                    success(function(nodeTree, status, headers, config) {
                        // remove all content of graph and build a new graph
                        $("div[data-id]").remove();
                        $("g[model-id]").remove();
                        $scope.buildNodes(nodeTree);
                    }).
                    error(function(data, status, headers, config) {
                        modalError("Fehler " + status + " beim Lesen von Daten. Bitte noch einmal versuchen.");
                    });
            }
        };

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
        };

        $scope.buildNode  = function(node){
           return joint.shapes.storyquest.createNode(
                    node.type,
                    node.id,
                    node.title,
                    node.color,
                    node.x,
                    node.y);
        };

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
        };

        scale = 1;
        paper.scale(1);
        $('#diagram').on('mousewheel', function(event) {
            event.preventDefault();
            var deltay = (event.originalEvent.detail < 0 || event.originalEvent.wheelDelta > 0) ? 1 : -1;
            scale = scale + deltay * 0.1;
            paper.scale(scale);
        });
    }]
);