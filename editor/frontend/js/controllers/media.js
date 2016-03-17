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

editorModule.controller("mediaCoreController", ["$scope", "Upload", "ProjectService",
    function ($scope, Upload, ProjectService) {
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
        $scope.uploadFiles = function() {
            if ($scope.files)
                Upload.upload({
                    method: "PUT",
                    url: "/api/media/" + $scope.project.data.id,
                    data: {
                        file: $scope.files
                    }
                }).then(function (resp) {
                    $scope.loadMediaList();
                }, function (resp) {
                    modalError("Error uploading key. Please try again.");
                }, function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    Pace.restart();
                });
        };

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
            $.ajax({
                url: "/api/media/" + $scope.project.data.id + "/" + mediaId,
                type: "DELETE"
            }).done(function() {
                $scope.loadMediaList($scope.project.data.id);
            });
        };
    }]);
