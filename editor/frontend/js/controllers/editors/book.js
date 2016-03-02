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

editorModule.directive("sqbookeditor", function() {
    return {
        restrict: "E",
        templateUrl: "views/directives/book.html",
        replace: true,
        scope: true,
        controller: "editorBookController"
    };
});

var editorBookModule = angular.module("editorBookModule", [ "ngResource", "ui.ace" ]);

editorBookModule.controller("editorBookController", ["$scope", "$http", "TypeIcons",
    function ($scope, $http, TypeIcons) {

        TypeIcons.registerType("book", "glyphicon-book");

        $scope.$watch("node", function() {
            if ($scope.node && $scope.node.type=="book") {
                console.log("Loading Book node data: " + $scope.node.id);
                $scope.setContentEditorEnabled(true);
                $scope.setConfigurationEditorEnabled(true);
                // get image list from server for image picker
                $http.get("/api/media/" + $scope.project.data.id).
                    success(function(data, status, headers, config) {
                        $scope.imageList = data;
                    }).
                    error(function(data, status, headers, config) {
                        modalError("Error retrieving image list", "Error getting images from server.");
                    });
            }
        });

        $scope.aceLoaded = function(editor) {
            if (editor) {
                $scope.booknodeeditor = editor;
                editor.setFontSize(20);
                editor.setShowPrintMargin(false);
                editor.getSession().setMode("ace/mode/markdown");
                editor.getSession().setUseWrapMode(true);
                editor.setOptions({
                    enableBasicAutocompletion: true,
                    enableSnippets: true
                });
                // this seems to be a bug in angular-ace: aceLoaded gets called twice with editor.completers==undefined first
                // strip all completers besides snippets and our own.
                if (editor.completers)
                    editor.completers = [ $scope.sqCompleter ];
//                    editor.completers = [ editor.completers[0], sqCompleter ];
            }
        };

        $scope.aceChanged = function(e) {
            $scope.nodeChanged($scope.node);
        };

        $scope.showInsertLink = function() {
            $("#modalLink").modal();
        };

        $scope.insertLink = function(nodeId, text) {
            $scope.booknodeeditor.insert("[l|" + nodeId + "|" + text + "]");
            $scope.closeInsertLink();
        };

         $scope.closeInsertLink = function() {
            $("#modalLink").modal("hide");
        };

        $scope.toggleFullscreen = function() {
            $("#fullscreenEditor").toggleClass("fullscreen");
        };

        $scope.showInsertImage = function() {
            $("#modalImage").modal();
            $("#insertImageList").imagepicker();
        };

        $scope.insertImage = function() {
            $scope.booknodeeditor.insert("[i|" + $scope.imageId + "]");
            $scope.closeInsertImage();
        };

        $scope.closeInsertImage = function() {
            $("#modalImage").modal("hide");
        };
    }]
);

