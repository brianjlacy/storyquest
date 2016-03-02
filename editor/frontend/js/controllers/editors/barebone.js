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

editorModule.directive("sqbareboneeditor", function() {
    return {
        restrict: "E",
        templateUrl: "views/directives/barebone.html",
        replace: true,
        scope: true,
        controller: "editorBareboneController"
    };
});

var editorBareboneModule = angular.module("editorBareboneModule", [ "ngResource", "ui.ace" ]);

editorBareboneModule.controller("editorBareboneController", ["$scope", "TypeIcons",
    function ($scope, TypeIcons) {

        // FIXME all this registers are happening only when this controller is called, thus nut available in the preview tab.
        TypeIcons.registerType("barebone", "glyphicon-asterisk");

        $scope.$watch("node", function() {
            if ($scope.node && $scope.node.type=="barebone") {
                console.log("Loading Barebone node data: " + $scope.node.id);
                $scope.setContentEditorEnabled(true);
                $scope.setConfigurationEditorEnabled(true);
            }
        });

        $scope.aceLoaded = function(editor) {
            $scope.barebonenodeeditor = editor;
            editor.setFontSize(20);
            editor.setShowPrintMargin(false);
            editor.getSession().setMode("ace/mode/markdown");
            editor.getSession().setUseWrapMode(true);
        };

        $scope.aceChanged = function(e) {
            $scope.nodeChanged($scope.node);
        };

        $scope.insertLink = function() {
            $scope.barebonenodeeditor.insert("[l|Enter chapter id here| Enter link text here]");
        };

        $scope.insertImage = function() {
            $scope.barebonenodeeditor.insert("[i|Enter alignment here|Enter image name here|Enter caption here]");
        };
    }]
);

