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

editorModule.controller("previewCoreController", [
    "$scope", "$http", "$interval", "Node", "UserService", "ProjectService", "WebSocketService",
    function ($scope, $http, $interval, Node, UserService, ProjectService, WebSocketService) {
        pageTitle("Debug", "Test and debug your book");
        breadcrumb([{title:"Preview", url:"/preview"}, {title:"Debug", url:""}]);

        $scope.user = UserService;
        $scope.project = ProjectService;

        $scope.defaultModelSchema = {
            "title": "Preview Runtime Data",
            "type": "object",
            "options": {
                "disable_properties": true,
                "disable_collapse": true,
                "disable_edit_json": true
            },
            "properties": {
                "flags": {
                    "type": "object",
                    "title": "Flags and Values",
                    "description": "This section contains flag and value states.",
                    "options": {
                        "collapsed": true,
                        "disable_properties": false,
                        "disable_collapse": false,
                        "disable_edit_json": true
                    },
                    "format": "grid",
                    "patternProperties": {
                        "^.*$": {
                            "type": "string"
                        }
                    }

                },
                "sequences": {
                    "type": "object",
                    "title": "Sequences",
                    "description": "This section contains the sequence states. Each sequence contains a value indicating the current index of the sequence (staring with zero) and a description field. that describes the original sequence the entry refers to. Please note that random sequences are not contained in this section as they do not track state.",
                    "options": {
                        "collapsed": true,
                        "disable_properties": true,
                        "disable_collapse": false,
                        "disable_edit_json": true
                    },
                    "patternProperties": {
                        "^_sequence.*$": {
                            "headerTemplate": "{{ self.description }}",
                            "type": "object",
                            "options": {
                                "collapsed": true,
                                "disable_properties": true,
                                "disable_collapse": false,
                                "disable_edit_json": true
                            },
                            "properties" : {
                                "description": {
                                    "type": "string",
                                    "title": "Original sequence statement",
                                    "options": {
                                        "hidden": true
                                    }
                                },
                                "value": {
                                    "type": "number",
                                    "title": "Current sequence index"
                                }
                            }
                        }
                    }
                }
            },
            "required": ["flags", "sequences"]
        };

        // initialize current project
        $scope.$watch("project.data.id", function() {
            if ($scope.project.data.id) {
                // load nodelist
                $scope.refreshPreviewNodeList();
                // connect to preview via WSS and server
                WebSocketService.connect($scope.user.data.authtoken, $scope.project.data.id,
                    function(message) {
                        if (message.type==="connect") {
                            console.log("Preview connected..");
                            // start the preview update interval
                            // FIXME: stop this job when the beta tab is left
                            $scope.dataRefreshJob = $interval(function() {
                                WebSocketService.getRuntimeData();
                            }, 2000);
                        }
                        else
                            $scope.handlePreviewMessage(message);
                    }
                );
            }
        });

        // FIXME: check why this has to be run explicitly while not needed on the layout module
        _fixContent();

        // enable tabs
        $(".nav-tabs").click(function (e) {
            e.preventDefault();
            $(this).tab("show");
        });

        // initialize json editor
        $("#previewDataEditor").jsoneditor({
            schema: $scope.defaultModelSchema,
            theme: "bootstrap3",
            iconlib: "bootstrap3",
            disable_collapse: true
        }).on("ready", function() {
            $scope.jsonEditor = $(this);
        }).on('change',function() {
            $scope.jsonEditorChanged();
        });

        $scope.getEditorModel = function() {
            return $scope.jsonEditor.jsoneditor('value');
        };

        $scope.setEditorModel = function(jsObj) {
            if ($scope.jsonEditor)
                $scope.jsonEditor.jsoneditor('value', jsObj);
        };

        $scope.refreshPreviewNodeList = function() {
            if ($scope.project.data && $scope.project.data.id)
                $http({method: "GET", url: "/api/nodelist/" + $scope.project.data.id}).
                success(function(nodes, status, headers, config) {
                    $scope.nodelist = nodes;
                    if ($scope.nodelist.length>0)
                        $scope.previewNode(nodes[nodes.length-1].id);
                }).
                error(function(data, status, headers, config) {
                        modalError("Error " + status + " while reading data. Please try again.");
                    }
                );
        };

        $scope.handlePreviewMessage = function(message) {
            if (message.type=="setData") {
                var modelData = message.playerData;
                if ($scope.jsonEditor && modelData && JSON.stringify($scope.getEditorModel())!=JSON.stringify(modelData)) {
                    console.log("Updated model data available from preview, updating editor..");
                    $scope.setEditorModel(modelData);
                }
            } else if (message.type=="log") {
                var div = document.getElementById("previewConsole");
                div.innerHTML = div.innerHTML + message.message + "\n";
            }
        };

        $scope.jsonEditorChanged = function() {
            console.log("Preview data changed, sending to previews.");
            if ($scope.jsonEditor)
                WebSocketService.setRuntimeData($scope.getEditorModel());
        };

        $scope.previewNode = function(nodeId) {
            Node.get({ projectId: $scope.project.data.id, nodeIdOrType: nodeId}, function(node) {
                console.log("Loading station " + nodeId + " in preview..");
                $scope.node = node;
                WebSocketService.loadNodeInPreview($scope.node);
            });
        };
    }
]);

