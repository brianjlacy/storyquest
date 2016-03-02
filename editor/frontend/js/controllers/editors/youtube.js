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

editorModule.directive("sqyoutubeeditor", function() {
    return {
        restrict: "E",
        templateUrl: "views/directives/youtube.html",
        replace: true,
        scope: true,
        controller: "editorYouTubeController"
    };
});

var editorYouTubeModule = angular.module("editorYouTubeModule", [ "ngResource" ]);

editorYouTubeModule.controller("editorYouTubeController", ["$scope", "TypeIcons", "ConfigService",
    function ($scope, TypeIcons, ConfigService) {

        TypeIcons.registerType("youtube", "glyphicon-film");

        ConfigService.get("youtubeApiKey", function(key) {
             gapi.client.setApiKey(key);
             gapi.client.load("youtube", "v3");
        })

        $scope.$watch("node", function() {
            if ($scope.node && $scope.node.type == "youtube") {
                $scope.setContentEditorEnabled(true);
                $scope.setConfigurationEditorEnabled(true);
            }
        });

        $scope.urlChanged = function() {
            $scope.nodeChanged($scope.node);
        };

        $scope.actionTypeChanged = function(type) {
            $scope.node.videoActionType=type;
            $scope.nodeChanged($scope.node);
        };

        $scope.youtubeSearch = function() {
            var request = gapi.client.youtube.search.list({
                part: "snippet",
                type: "video",
                q: $scope.youtubeSearchQuery,
                maxResults: 10,
                order: "viewCount",
                time: "this_month"
           });
           // execute the request
           request.execute(function(response) {
                 $scope.videos = response.items;
           });
        };

        $scope.videoactionChanged = function() {
            $scope.nodeChanged($scope.node);
        };

        $scope.selectYouTubeFromList = function(videoId) {
            $scope.node.youTubeURL = "http://www.youtube.com/watch?v=" + videoId;
            $scope.nodeChanged($scope.node);
        };
    }]
);

