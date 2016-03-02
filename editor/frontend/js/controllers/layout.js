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
        return $resource("/api/frame/:projectId/:type", {}, {
            get: {method:"GET", isArray:false},
            update: {method:"POST"}
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
                $scope.refreshTypelist();
            }
        });

        // build typelist
        $scope.refreshTypelist = function() {
            var html = "";
            for (var i=0; i<$scope.project.data.nodetypes.length; i++) {
                var thisType = $scope.project.data.nodetypes[i];
                var active = "";
                var activeType = null;
                if (i==$scope.project.data.nodetypes.length-1) {
                    active = "active";
                    activeType = thisType;
                }
                var glyph = TypeIcons.getByType(thisType);
                html="<a data-type='" + thisType + "' class='list-group-item " + active + "'>"
                + "<span class='glyphicon " + glyph + "' style='font-weight:bold'></span>&nbsp;&nbsp;&nbsp;<span style='text-transform:capitalize'>"
                + thisType
                + "</span></a>"
                + html;
                $("#frametypelist").html(html);
                $("#frametypelist .list-group-item")
                    .on("click", function(e) {
                        var previous = $(this).closest(".list-group").children(".active");
                        previous.removeClass("active"); // previous list-item
                        $(e.target).addClass("active"); // activated list-item
                        $scope.loadFrame($(this).attr("data-type"));
                    });
                if (activeType!=null)
                    $scope.loadFrame(activeType);
            }
        };

        $scope.aceHTMLLoaded = function(editor) {
            $scope.framehtmleditor = editor;
            editor.setFontSize(20);
            editor.setShowPrintMargin(false);
            editor.getSession().setMode("ace/mode/html");
            editor.getSession().setUseWrapMode(false);
        };

        $scope.aceCSSLoaded = function(editor) {
            $scope.framecsseditor = editor;
            editor.setFontSize(20);
            editor.setShowPrintMargin(false);
            editor.getSession().setMode("ace/mode/css");
            editor.getSession().setUseWrapMode(false);
        };

        $scope.aceJSLoaded = function(editor) {
            $scope.framejseditor = editor;
            editor.setFontSize(20);
            editor.setShowPrintMargin(false);
            editor.getSession().setMode("ace/mode/javascript");
            editor.getSession().setUseWrapMode(false);
        };

        $scope.aceGlobalJSLoaded = function(editor) {
            $scope.frameglobaljseditor = editor;
            editor.setFontSize(20);
            editor.setShowPrintMargin(false);
            editor.getSession().setMode("ace/mode/javascript");
            editor.getSession().setUseWrapMode(false);
        };

        $scope.aceFrameChanged = function(e) {
            // $save touches the model frame, which ace does not like, make copy here
            var frameCopy = new Frame();
            frameCopy.type = $scope.frame.type;
            frameCopy.html = $scope.frame.html;
            frameCopy.css = $scope.frame.css;
            frameCopy.js = $scope.frame.js;
            frameCopy.globaljs = $scope.frame.globaljs;
            $scope.framesavequeue[frameCopy.type] = frameCopy;
        };

        $scope.loadFrame = function(type) {
            // TODO: disable editors here
            Frame.get({projectId: $scope.project.data.id, type: type}, function (frame) {
                $scope.frame = frame;
                // TODO: enable editors here
            });
        };

        $scope.saveFrame = function(frame) {
            console.log("Storing frame info on server for type " + frame.type);
            frame.$save({ projectId: $scope.project.data.id, type: frame.type},
                function(obj, responseHeaders) {
                    console.log("Finished storing frame info.");
                    if (Object.keys($scope.framesavequeue).length==0)
                        $scope.editorSynced();
                }, function(err) {
                    modalError("Error storing data on server. Please try again. (" + err.data + ")");
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
