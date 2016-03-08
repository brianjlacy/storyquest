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

editorModule.factory("Frame", ["$resource",
    function($resource){
        return $resource("/api/frame/:projectId/:id", {}, {
            get: { method:"GET", isArray:false },
            update: { method:"POST" },
            resourceList: { method:"GET", url:"/api/frame/:projectId", isArray:true }
        });
    }]
);

editorModule.controller("layoutCoreController", ["$scope", "$http", "$interval", "Frame", "TypeIcons",
    function ($scope, $http, $interval, Frame, TypeIcons) {
        pageTitle("Layout", "Change the appearance of your book");
        breadcrumb([{title:"Layout", url:"/layout"}, {title:"Layouts", url:""}]);

        // enable tabs
        $(".edittab").click(function (e) {
            e.preventDefault();
            $(this).tab("show");
        });

        // enable save queue
        $scope.framesavequeue = {};
        var frameSyncDebounce = function() {
            if (Object.keys($scope.framesavequeue).length>0) {
                $scope.editorSyncing();
                for (var entry in $scope.framesavequeue) {
                    if ($scope.framesavequeue.hasOwnProperty(entry) && $scope.framesavequeue[entry]) {
                        var thisFrame = $scope.framesavequeue[entry];
                        delete $scope.framesavequeue[entry];
                        $scope.saveFrame(thisFrame);
                    }
                }
            }
        };
        $interval(frameSyncDebounce, 1000);

        // refresh typelist when available
        $scope.$watch("project.data.id", function() {
            if ($scope.project.data.id) {
                $scope.refreshResourceList();
            }
        });

        // build resource list
        $scope.refreshResourceList = function() {
            Frame.resourceList({projectId: $scope.project.data.id}, function (resourceList) {
                var html = "";
                for (var i=0; i<resourceList.length; i++) {
                    var thisResource = resourceList[i];
                    var glyph = TypeIcons.getByType(thisResource.type);
                    var active = (i==0?"active":"");
                    html = "<a data-id='" + thisResource.id + "' class='list-group-item " + active + "'>"
                        + "<span class='glyphicon " + glyph + "' style='font-weight:bold' align='middle'></span>&nbsp;&nbsp;&nbsp;<span>"
                        + thisResource.title + "<br>" + thisResource.description
                        + "</span></a>"
                        + html;
                    if (i==0)
                        $scope.loadFrame(thisResource.id);
                }
                $("#frametypelist").html(html);
                $("#frametypelist .list-group-item")
                    .on("click", function(e) {
                        var previous = $(this).closest(".list-group").children(".active");
                        previous.removeClass("active"); // previous list-item
                        $(e.target).addClass("active"); // activated list-item
                        $scope.loadFrame($(this).attr("data-id"));
                    });
            });
        };

        $scope.loadFrame = function(id) {
            Frame.get({projectId: $scope.project.data.id, id: id}, function (frameResource) {
                $scope.frameResource = frameResource;
                $("a.edittab").html($scope.frameResource.type.toUpperCase());
                $scope.frameResourceEditor.setFontSize(20);
                $scope.frameResourceEditor.setShowPrintMargin(false);
                $scope.frameResourceEditor.getSession().setMode("ace/mode/" + $scope.frameResource.type);
                $scope.frameResourceEditor.getSession().setUseWrapMode(false);
            });
        };

        $scope.aceFrameLoaded = function(editor) {
            $scope.frameResourceEditor = editor;
        };

        $scope.aceFrameChanged = function(e) {
            // $save touches the model frame, which ace does not like, make copy here
            // add only necessary data to the copy (id, data)
            var frameCopy = new Frame();
            frameCopy.id = $scope.frameResource.id;
            frameCopy.data = $scope.frameResource.data;
            $scope.framesavequeue[frameCopy.id] = frameCopy;
        };

        $scope.saveFrame = function(frameResource) {
            console.log("Storing frame resource on server for id " + frameResource.id);
            frameResource.$save({ projectId: $scope.project.data.id, id: frameResource.id},
                function(obj, responseHeaders) {
                    console.log("Finished storing frame resource.");
                    if (Object.keys($scope.framesavequeue).length==0)
                        $scope.editorSynced();
                }, function(err) {
                    modalError("Error storing frame resource on server. Please try again. (" + err.data + ")");
                    if (Object.keys($scope.framesavequeue).length==0)
                        $scope.editorSynced();
                }
            );
        };

        // toggles the save indicator
        $scope.editorSyncing = function() {
            $scope.editorSyncReady = false;
        };

        // toggles the save indicator
        $scope.editorSynced = function() {
            $scope.editorSyncReady = true;
        };
    }
]);
