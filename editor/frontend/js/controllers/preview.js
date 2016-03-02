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
        pageTitle("Preview", "Try your book");
        breadcrumb([{title:"Preview", url:"/preview"}, {title:"Chapters", url:""}]);

        $scope.user = UserService;
        $scope.project = ProjectService;

        // initialize current project
        $scope.$watch("project.data.id", function() {
            if ($scope.project.data.id) {
                // load nodelist
                $scope.refreshPreviewNodeList();

                // show tree
                //$scope.showTree();

                // store if the preview data has initialized
                $scope.previewDataAvailable = false;

                // connect to preview via WSS and server
                WebSocketService.connect($scope.user.data.authtoken, $scope.project.data.id,
                    function(message) {
                        console.log("Received message: " + JSON.stringify(message));
                        if (message.type==="connect")
                            // refresh player data
                            $scope.refreshPreviewData();
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
            // at least in chrome, the tree is not displayed without a forced reload
            // must be an issue with iFrames using display:none initially.
            // Force the reload on tab click
            // FIXME: this should only happen when the tree tab is klicked. Otherwise this results in errors when the tabs are switched fast!
            $scope.showTree($scope, Node);
        });

        $scope.openTreeWindow = function() {
            window.open("/api/nodetree/" + $scope.project.data.id + "?window=true", null, "status=no,toolbar=no,menubar=no,location=no");
        };

        $scope.handlePreviewMessage = function(message) {
            if (message.type=="setData") {
                $scope.resetDataAttributeUI();
                $scope.previewDataAvailable = true;
                $scope.previewData = message;
                $scope.previewData.giveItems = [];
                $scope.previewData.removeItems = [];
                for (var i=0; i<message.playerData.length; i++) {
                    $scope.addDataAttributeToUI(message.playerData[i].displayName, message.playerData[i].key, message.playerData[i].value);
                }
                $scope.refreshItemList(message.items, message.ownedItems);
            }
            console.log("RECEIVED MESSAGE: " + JSON.stringify(message));
        };

        $scope.addDataAttributeToUI = function(name, attribute, value) {
            // FIXME: use angular tempating for this - check also if the nodelists could be made using angular
            $("#dataattributeslist").append("<div class='form-group'>" +
            "<label for='"+ attribute + "'>" + name + "</label>" +
            "<input type='text' class='form-control' id='" + attribute + "' placeholder='Enter Value' value='" + value + "'>" +
            "</div>");
            $("#" + attribute).change(function() {
                for (var i=0; i<$scope.previewData.playerData.length; i++)
                    if ($scope.previewData.playerData[i].key==attribute)
                        $scope.previewData.playerData[i].value = $(this).val();
                $scope.sendPreviewData();
            });
        };

        $scope.resetDataAttributeUI = function() {
            $("#dataattributeslist").empty();
        };

        // giveItems array of ids
        // removeItems array of ids
        // attributeData array of {key, value}
        $scope.sendPreviewData = function() {
            WebSocketService.setRuntimeData($scope.previewData.playerData, $scope.previewData.giveItems, $scope.previewData.removeItems);
        };

        $scope.refreshItemList = function(items, ownedItems) {
            $("#datainventorylist").empty();
            var html = "";
            // FIXME: uses only de lang field!
            for (var i=0; i<items.length; i++) {
                var owned = "";
                for (var j=0; j<ownedItems.length; j++)
                    if (items[i].id==ownedItems[j].id)
                        owned = "<div class='owneditem'>OWNED</div>";
                html="<a data-itemid='" + items[i].id + "' class='list-group-item " + (owned.length>0?"owneditementry":"") + "'>"
                + "<span class='glyphicon glyphicon-tower' style='font-weight:bold'></span>&nbsp;&nbsp;&nbsp;"
                + items[i].name.de
                + " - "
                + items[i].desc.de
                + owned
                + "</a>"
                + html;
            }
            $("#datainventorylist").html(html);
            $("#datainventorylist .list-group-item")
                .on("click", function(e) {
                    var itemId = $(this).attr("data-itemid");
                    for (var i=0; i<$scope.previewData.ownedItems.length; i++)
                        if ($scope.previewData.ownedItems[i].id==itemId && $scope.previewData.removeItems.indexOf(itemId)==-1)
                            $scope.previewData.removeItems.push(itemId);
                        else if ($scope.previewData.giveItems.indexOf(itemId)==-1)
                            $scope.previewData.giveItems.push(itemId);
                    $scope.sendPreviewData();
                });
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

        $scope.showTree = function() {
            // load content
            $("#treeframe").attr("src", "/api/nodetree/" + $scope.project.data.id);

            // register listener with iFrame
            $("#treeframe").load(function () {
                setTimeout(function() {
                    document.getElementById("treeframe").contentWindow.setListener(function(nodeId) {
                        $scope.previewNode(nodeId);
                    });
                }, 1000);
            });
        };

        $scope.refreshPreviewData = function() {
            $interval(function() {
                if (!$scope.previewDataAvailable)
                    WebSocketService.getRuntimeData();
            }, 2000);
        };

        $scope.previewNode = function(nodeId) {
            Node.get({ projectId: $scope.project.data.id, nodeIdOrType: nodeId}, function(node) {
                console.log("LOAD IN PREVIEW: " + nodeId + " / " + node.type);
                $scope.node = node;
                WebSocketService.loadNodeInPreview($scope.node);
            });
        };
    }
]);

