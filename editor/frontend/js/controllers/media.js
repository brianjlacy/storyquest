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

editorModule.controller("mediaCoreController", ["$scope", "$upload", "ProjectService",
    function ($scope, $upload, ProjectService) {
        pageTitle("Media", "Manage your multimedia content");
        breadcrumb([{title:"Media", url:"/media"}, {title:"Library", url:""}]);

        $scope.project = ProjectService;

        // edit current project
        $scope.$watch("project.data.id", function() {
            if ($scope.project.data.id) {
                $scope.loadMediaList($scope.project.id);
            }
        });

        // initialize asset upload
        $scope.$watch("files", function() {
            if ($scope.files)
                $scope.upload = $upload.upload({
                    method: "PUT",
                    url: "/api/media/" + $scope.project.data.id,
                    data: {},
                    file: $scope.files
                }).progress(function(evt) {
                    // TODO: report proper progress with pace: parseInt(100.0 * evt.loaded / evt.total)
                    Pace.restart();
                }).success(function(data, status, headers, config) {
                    $scope.loadMediaList();
                });
        });

        $scope.loadMediaList = function() {
            $.ajax({
                url: "/api/media/" + $scope.project.data.id
            }).done(function(list) {
                $scope.$apply(function () {
                    $scope.assets = list;
              });
            });
        };

        $scope.deleteMedia = function(basename) {
            var mediaId = basename.replace(/.*\//, "");
            console.log("DELETE " + basename);
            console.log("mediaId " + mediaId);
            $.ajax({
                url: "/api/media/" + $scope.project.data.id + "/" + mediaId,
                type: "DELETE"
            }).done(function() {
                $scope.loadMediaList($scope.project.data.id);
            });
        };
    }]);
