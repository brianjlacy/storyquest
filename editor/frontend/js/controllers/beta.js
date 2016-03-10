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

editorModule.controller("betaCoreController", ["$scope", "$http", "$compile", "UserService", "ProjectService",
    function ($scope, $http, $compile, UserService, ProjectService) {
        pageTitle("Betatest", "Invite external readers to try and comment your book");
        breadcrumb([{title:"Beta", url:"/beta"}, {title:"Test", url:""}]);

        $scope.user = UserService;
        $scope.project = ProjectService;

        // edit current project
        $scope.$watch("project.data.id", function() {
            if ($scope.project.data.id)
                $scope.initialize();
        });

        $scope.toggleBetaActive = function() {
            $scope.project.data.betaActive=!$scope.project.data.betaActive;
            $scope.project.save(function() {
            }, function(err) {
                modalError("Error storing data on server. Please try again.")
            });
        };

        $scope.initialize = function() {
            var port = (document.location.port == "") ? "443" : document.location.port;
            $scope.betaUrl = document.location.protocol + "//" + document.location.hostname + ":" + port + "/beta.html#?testKey=" + $scope.project.data.testKey;
            $http({method: "GET", url: "/api/feedback/" + $scope.project.data.id}).
                success(function (feedback, status, headers, config) {
                    $scope.feedback = feedback;
                    if (feedback && feedback.length>0) {
                        $(".nofeedback").hide();
                        $(".messagecontainer").show();
                    } else {
                        $(".nofeedback").show();
                        $(".messagecontainer").hide();
                    }
                }).
                error(function (data, status, headers, config) {
                    modalError("Error retrieving feedback data. Please try again.")
                });
        };

        $scope.uuid = function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + s4() + s4();
        };

        $scope.changeTestKey = function() {
            $scope.project.data.testKey = uuid();
            $scope.betaUrl = document.location.protocol + "://" + document.location.hostname + ":" + port + "/beta.html#?testKey=" + $scope.project.data.testKey;
        }

    }]);

