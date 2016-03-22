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

editorModule.run(function(editableOptions) {
    editableOptions.theme = "bs3";
});

editorModule.factory("Node", ["$resource",
    function($resource){
        return $resource("api/node/:projectId/:nodeIdOrType", {}, {
            get: {method:"GET", isArray:false},
            update: {method:"POST"},
            delete: {method:"DELETE"},
            create: {method:"PUT"}
        });
    }]
);

editorModule.controller("editCoreController", ["$scope", "$http", "$timeout", "$interval", "Node", "UserService", "ProjectService", "TypeIcons", "WebSocketService",
    function ($scope, $http, $timeout, $interval, Node, UserService, ProjectService, TypeIcons, WebSocketService) {
        pageTitle("Edit", "Add and modify chapters");
        breadcrumb([{title:"Edit", url:"/edit"}, {title:"Chapters", url:""}]);

        $scope.user = UserService;
        $scope.project = ProjectService;

        // Boostrap hacks: enable tabs, prevent active links on disabled tabs
        $(".edittab").click(function (e) {
            e.preventDefault();
            $(this).tab("show");
        });
        $(".nav-tabs a[data-toggle=tab]").on("click", function(e) {
            if ($(this).hasClass("disabled")) {
                e.preventDefault();
                return false;
            }
        });

        // edit current project
        $scope.$watch("project.data.id", function() {
            if ($scope.project.data.id) {
                $scope.editorSynced();
                console.log("Loading editor framework for project " + $scope.project.data.id);
                $scope.refreshNodeList();
            }
        });

        // options for the list sortable
        $scope.sortableOptions = {
            update: function(e, ui) {
                var sequence = [];
                $("#nodelist > span").each(function(idx) {
                    var id = $(this).attr("data-id");
                    if (id)
                        sequence.push(id);
                });
                $http.post("/api/sequence/" + $scope.project.data.id, sequence)
                    .success(function(data, status, headers, config) {
                        console.log("Finished storing sequence info.");
                    })
                    .error(function(data, status, headers, config) {
                        modalError("Error storing data on server. Please try again. (" + status + ")");
                    });
                $scope.$apply();
            },
            axis: "y"
        };

        // watch for changes to the node color, save them
        $scope.$watch("editorNodeColor", function() {
            if ($scope.node && $scope.node.id && $scope.editorNodeColor && $scope.node.nodeColor!=$scope.editorNodeColor) {
                console.log("Saving node color for node " + $scope.node.id + " , color " + $scope.editorNodeColor);
                $scope.node.nodeColor = $scope.editorNodeColor;
                $scope.nodeChanged($scope.node);
            }
        });

        // on enter/exit editors
        $scope.aceOnEnterLoaded = function(editor) {
            editor.$blockScrolling = Infinity;
            editor.setFontSize(20);
            editor.setShowPrintMargin(false);
            editor.getSession().setMode("ace/mode/javascript");
            editor.getSession().setUseWrapMode(false);
        };
        $scope.aceOnEnterChanged = function(e) {
            $scope.nodeChanged($scope.node);
        };
        $scope.aceOnExitLoaded = function(editor) {
            editor.$blockScrolling = Infinity;
            editor.setFontSize(20);
            editor.setShowPrintMargin(false);
            editor.getSession().setMode("ace/mode/javascript");
            editor.getSession().setUseWrapMode(false);
        };
        $scope.aceOnExitChanged = function(e) {
            $scope.nodeChanged($scope.savequeue, $scope.node);
        };

        // enable auto saving of node content
        $scope.savequeue = {};
        var editorSyncDebounce = function() {
            if (Object.keys($scope.savequeue).length>0) {
                $scope.editorSyncing();
                for (var entry in $scope.savequeue) {
                    if ($scope.savequeue.hasOwnProperty(entry) && $scope.savequeue[entry]) {
                        var thisNode = $scope.savequeue[entry];
                        if (thisNode.text)
                            $scope.postParseNewNodeEntries(thisNode, function(err) {
                                delete $scope.savequeue[entry];
                                $scope.saveNode(thisNode);
                            });
                        else {
                            delete $scope.savequeue[entry];
                            $scope.saveNode(thisNode);
                        }
                    }
                }
            }
        };
        $interval(editorSyncDebounce, 1000);

        // initializing ace completer for markdown
        // note: completers are global for all ace instances
        $scope.aceLangTools = ace.require("ace/ext/language_tools");
        $scope.aceLangTools.addCompleter($scope.sqCompleter);
        ace.config.set("basePath", "js/");

        // initialize json editor
        $("#stationDataEditor").jsoneditor({
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
            }
        });

        $scope.filterCopyConfigEditorProperties = function(jsObj) {
            var result = {};
            for (var i=0; i<propertiesAvailableInConfigEditor.length;i++)
                result[propertiesAvailableInConfigEditor[i]] = jsObj[propertiesAvailableInConfigEditor[i]]
            return result;
        };

        // refresh node list
        $scope.refreshNodeList = function() {
            if ($scope.project.data && $scope.project.data.id)
                $http({method: "GET", url: "/api/sequence/" + $scope.project.data.id}).
                    success(function(sequence, status, headers, config) {
                        $http({method: "GET", url: "/api/nodelist/" + $scope.project.data.id}).
                            success(function(nodes, status, headers, config) {
                                $scope.nodelist = [];
                                if (sequence.length==0)
                                    $scope.nodelist=nodes;
                                else
                                    for (var i=0; i<sequence.length; i++)
                                        for (var j=0; j<nodes.length; j++)
                                            if (nodes[j].id===sequence[i])
                                                $scope.nodelist.push(nodes[j]);
                                if ($scope.nodelist.length>0)
                                    $scope.loadNode(nodes[nodes.length-1].id);
                            }).
                            error(function(data, status, headers, config) {
                                modalError("Error " + status + " when reading data. Please try again.");
                            });
                    }).
                    error(function(data, status, headers, config) {
                        modalError("Error " + status + " when reading data. Please try again.");
                    });
        };

        // load a node into the editor(s)
        $scope.loadNode = function(nodeId) {
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
            });
        };

        $scope.getEditorModel = function() {
            return $scope.jsonEditor.jsoneditor('value');
        };

        $scope.setEditorModel = function(jsObj) {
            if ($scope.jsonEditor)
                $scope.jsonEditor.jsoneditor('value', jsObj);
        };

        $scope.setContentEditorEnabled = function(enabled) {
            $scope.contentEditorEnabled = enabled;
        };

        $scope.setConfigurationEditorEnabled = function(enabled) {
            $scope.configurationEditorEnabled = enabled;
        };

        // delete nod on server
        $scope.deleteNode = function(nodeId) {
            var node = $scope.findNode($scope.nodelist, nodeId);
            modalYesNo("Delete Node", "You are deleting node \"" + node.title + "\" (" + node.id + "). This operation can not be undone. Are you sure?", function(result) {
                if (result)
                    Node.delete({ projectId: $scope.project.data.id, nodeIdOrType: nodeId}, function() {
                        $scope.refreshNodeList();
                    }, function(error) {
                            modalError("Error while deleting node: " + error.data);
                       });
            });
        };

        // create a new node on server
        $scope.createNode = function(type) {
            Node.create({ projectId: $scope.project.data.id, nodeIdOrType: type }, function(node) {
                $scope.refreshNodeList();
            }, function(error) {
                modalError("Error while creating new chapter. Please try again. (" + error.data + ")");
            });
        };

        // save node title to server, used for editing in list sortable
        $scope.saveNodeTitle = function(nodeListEntry, $data) {
            Node.get({ projectId: $scope.project.data.id, nodeIdOrType: nodeListEntry.id}, function(node) {
                node.title = $data;
                console.log("Storing node title on server for node " + node.id);
                $scope.saveNode(node);
            });
        };

        // save node content to server
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

        // find node in list
        $scope.findNode = function(nodelist, nodeId) {
            if (!nodelist)
                return null;
            for (var i=0; i<nodelist.length; i++)
                if (nodelist[i].id===nodeId)
                    return nodelist[i];
            return null;
        };

        // post parsing text of text nodes, adding new nodes if a certain string is found
        // TODO: this seems to be flaky, remove that feature
        $scope.postParseNewNodeEntries = function(node, callback) {
            for (var i=0; i<node.text.length; i++) {
                if (node.text[i].text.match(/\|NEW\|/g)) {
                    // create new node
                    Node.create({ projectId: $scope.project.data.id, nodeIdOrType: node.type }, function(newNode) {
                        $scope.refreshNodeList();
                        for (var j=0; j<node.text.length; j++)
                            node.text[j].text = node.text[j].text.replace(/\|NEW\|/g, "|" + newNode.id + "|");
                        callback(null);
                    }, function(error) {
                        modalError("Error while creating new chapter. Please try again. (" + error + ")");
                        callback(error);
                    });
                } else
                    callback(null);
            }
        };

        // event triggered when ace is initialized
        $scope.sqAceLoaded = function(editor) {
            if (editor) {
                editor.renderer.setShowGutter(false);
                editor.$blockScrolling = Infinity;
            }
        };

        // node changed, add it to savequeue
        $scope.nodeChanged = function(node) {
            $scope.savequeue[node.id]=JSON.parse(JSON.stringify(node));
        };

        // toggles the save indicator
        $scope.editorSyncing = function() {
            $scope.editorSyncReady = false;
        };

        // toggles the save indicator
        $scope.editorSynced = function() {
            $scope.editorSyncReady = true;
        };

        // autocompleter configuration
        $scope.sqCompleter = {
            getCompletions: function(editor, session, pos, prefix, callback) {
                var row = pos.row;
                var col = pos.column;
                var line = session.getLine(row);
                var outer = false;
                var statementStart = col;
                while (line.charAt(statementStart)!="[" && statementStart>=0)
                    statementStart--;
                if (line.charAt(statementStart)!="[")
                    outer = true;
                var statementEnd = col;
                while (line.charAt(statementEnd)!="]" && line.charAt(statementEnd)!="[" && statementEnd<line.length)
                    statementEnd++;
                if (line.charAt(statementEnd)!="]")
                    outer = true;
                // we only support one line statements right now
                if (statementStart==-1 || statementEnd==-1 || outer) { callback(null, []); return }
                // token position
                var tokenCol = 0;
                for (var i=statementStart; i<col; i++)
                    if (line.charAt(i)=="|")
                        tokenCol++;
                // nominal statement
                var statement = line.substring(statementStart+1, statementEnd);
                // calculate position in tokens
                var tokens = statement.split("|");
                // retrieve autocompletion list
                if (tokenCol==0)
                    // command type alignment
                    callback(null, [
                        {name: "l", value: "l", score: 10000, meta: "Node Link"},
                        {name: "i", value: "i", score: 10000, meta: "Image Block"},
                        {name: "b", value: "b", score: 10000, meta: "Text Block"},
                        {name: "v", value: "v", score: 10000, meta: "Video Block"}
                    ]);
                else if (tokens[0]=="i") {
                    if (tokenCol==1) {
                        $.ajax({
                            url: "/media"
                        }).done(function (list) {
                            var completions = [];
                            if (list)
                                for (var i = 0; i < list.length; i++)
                                    completions.push({name: list[i].replace(/.*\//, ""), value: list[i].replace(/.*\//, ""), score: 10000, meta: "Media Asset"});
                            callback(null, completions);
                        });
                    }
                } else if (tokens[0]=="j") {
                    if (tokenCol==1)
                    // image alignment
                        callback(null, [
                            {name: "left", value: "left", score: 10000, meta: "Align Left"},
                            {name: "full", value: "full", score: 10000, meta: "Full Width"},
                            {name: "right", value: "right", score: 10000, meta: "Align Right"}
                        ]);
                    else if (tokenCol==2) {
                        $.ajax({
                            url: "/media"
                        }).done(function(list) {
                            var completions = [];
                            if (list)
                                for (var i=0; i<list.length; i++)
                                    completions.push({name: list[i].replace(/.*\//,""), value: list[i].replace(/.*\//,""), score: 10000, meta: "Media Asset"});
                            callback(null, completions);
                        });
                    }
                } else if (tokens[0]=="l") {
                    if (tokenCol==1) {
                        // target node list
                        var completions = [];
                        completions.push({name: "NEW", value: "NEW", score: 90000, meta: "Create new chapter"});
                        $.ajax({
                            url: "/nodelist"
                        }).done(function(list) {
                            if (list)
                                for (var i=0; i<list.length; i++)
                                    completions.push({name: list[i].id, value: list[i].id, score: 10000, meta: list[i].title});
                            callback(null, completions);
                        });
                    }
                } else
                    callback(null, []);
            }
        };
    }]
);

editorModule.filter("nodeActive", function() {
    return function(currentNode, activeNode) {
        if (currentNode && currentNode.id && activeNode && activeNode.id && activeNode.id===currentNode.id)
            return "active";
        else
            return "";
    };
});

editorModule.filter("typeIconClass", [ "TypeIcons",
    function(TypeIcons) {
        return TypeIcons.getByType;
    }
]);

editorModule.directive("showonhoverparent", function() {
    return {
        link : function(scope, element, attrs) {
            element.parent().bind("mouseenter", function() {
                element.show();
            });
            element.parent().bind("mouseleave", function() {
                element.hide();
            });
        }
    };
});

