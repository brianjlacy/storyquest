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

editorModule.controller("deployCoreController", ["$scope", "$http", "ProjectService", "UserService",
    function ($scope, $http, ProjectService, UserService) {
        pageTitle("Build Apps", "Build and export your book for actual devices");
        breadcrumb([{title:"Deploy", url:"/deploy"}, {title:"Build Apps", url:""}]);

        $scope.project = ProjectService;
        $scope.user = UserService;
        $scope.buildId = null;
        $scope.logWatcher = null;
        $scope.artifacts = [];

        $scope.createWebPath = function(artifactWebPath) {
            var port = (document.location.port=="")?"443":document.location.port;
            return document.location.protocol + "//" + document.location.hostname + ":" + port + artifactWebPath + "?authtoken=" + $scope.user.data.authtoken;
        };

        $scope.openQRDialog = function(url) {
            modalQR($scope.createWebPath(url), $scope.project.data.id);
        };

        $scope.clearConsole = function() {
            $(".console").empty();
        };

        $scope.appendToConsole = function(text) {
            $(".console").text($(".console").text() + text);
        };

        $scope.appendArtifact = function(responseData) {
            $scope.artifacts.push({
                buildId: responseData.buildId,
                type: responseData.type,
                artifactPath: responseData.artifactPath,
                artifactWebPath: responseData.artifactWebPath,
                label: responseData.label,
                versionName: responseData.versionName,
                versionCode: responseData.versionCode
            });
        };

        $scope.buildAndroid = function() {
            if ($scope.buildId!=null) {
                modalError("Build already in progress, please wait until it is finished.");
                return;
            }
            console.log("Starting Android build on server..");
            $(".activityicon").addClass("fa-spin");
            $http.get("/api/deployment/android/" + $scope.project.data.id)
                .then(function successCallback(response) {
                    $scope.buildId = response.data.buildId;
                    console.log("Successfully started Android build on server, buildId " + $scope.buildId);
                    $scope.clearConsole();
                    $scope.logWatcher = setInterval(function() {
                        $http.get("/api/deployment/state/" + $scope.project.data.id + "/" + $scope.buildId)
                            .then(function successCallback(response) {
                                if (response.data.state==="building") {
                                    $scope.appendToConsole(response.data.text);
                                }
                                else if (response.data.state==="finished") {
                                    console.log("Building in finished.");
                                    $scope.appendToConsole(response.data.text);
                                    $scope.buildId = null;
                                    clearInterval($scope.logWatcher);
                                    $scope.appendArtifact(response.data);
                                    $(".activityicon").removeClass("fa-spin");
                                } else {
                                    clearInterval($scope.logWatcher);
                                    $scope.buildId = null;
                                    $(".activityicon").removeClass("fa-spin");
                                    modalError("Error while building on server. Please try again. (" + response.data.exitCode + ")");
                                }
                            }, function errorCallback(response) {
                                clearInterval($scope.logWatcher);
                                $scope.buildId = null;
                                $(".activityicon").removeClass("fa-spin");
                                modalError("Error while building on server. Please try again. (" + response.status + ")");
                            })
                    }, 1000);
                }, function errorCallback(response) {
                    $scope.buildId = null;
                    $(".activityicon").removeClass("fa-spin");
                    modalError("Error launching build on server. Please try again. (" + response.status + ")");
                });
        };

        $scope.buildWeb = function() {
            if ($scope.buildId!=null) {
                modalError("Build already in progress, please wait until it is finished.");
                return;
            }
            console.log("Starting Web build on server..");
            $(".activityicon").addClass("fa-spin");
            $http.get("/api/deployment/web/" + $scope.project.data.id)
                .then(function successCallback(response) {
                    $scope.buildId = response.data.buildId;
                    console.log("Successfully started Web build on server, buildId " + $scope.buildId);
                    $scope.clearConsole();
                    $scope.logWatcher = setInterval(function() {
                        $http.get("/api/deployment/state/" + $scope.project.data.id + "/" + $scope.buildId)
                            .then(function successCallback(response) {
                                if (response.data.state==="building") {
                                    $scope.appendToConsole(response.data.text);
                                }
                                else if (response.data.state==="finished") {
                                    console.log("Building in finished.");
                                    $scope.appendToConsole(response.data.text);
                                    $scope.buildId = null;
                                    clearInterval($scope.logWatcher);
                                    $scope.appendArtifact(response.data);
                                    $(".activityicon").removeClass("fa-spin");
                                } else {
                                    clearInterval($scope.logWatcher);
                                    $scope.buildId = null;
                                    $(".activityicon").removeClass("fa-spin");
                                    modalError("Error while building on server. Please try again. (" + response.data.exitCode + ")");
                                }
                            }, function errorCallback(response) {
                                clearInterval($scope.logWatcher);
                                $scope.buildId = null;
                                $(".activityicon").removeClass("fa-spin");
                                modalError("Error while building on server. Please try again. (" + response.status + ")");
                            })
                    }, 1000);
                }, function errorCallback(response) {
                    $scope.buildId = null;
                    $(".activityicon").removeClass("fa-spin");
                    modalError("Error launching build on server. Please try again. (" + response.status + ")");
                });
        };

        $scope.buildEPub = function() {
            if ($scope.buildId!=null) {
                modalError("Build already in progress, please wait until it is finished.");
                return;
            }
            console.log("Starting EPub build on server..");
            $(".activityicon").addClass("fa-spin");
            $http.get("/api/deployment/epub/" + $scope.project.data.id)
                .then(function successCallback(response) {
                    $scope.buildId = response.data.buildId;
                    console.log("Successfully started EPub build on server, buildId " + $scope.buildId);
                    $scope.clearConsole();
                    $scope.logWatcher = setInterval(function() {
                        $http.get("/api/deployment/state/" + $scope.project.data.id + "/" + $scope.buildId)
                            .then(function successCallback(response) {
                                if (response.data.state==="building") {
                                    $scope.appendToConsole(response.data.text);
                                }
                                else if (response.data.state==="finished") {
                                    console.log("Building in finished.");
                                    $scope.appendToConsole(response.data.text);
                                    $scope.buildId = null;
                                    clearInterval($scope.logWatcher);
                                    $scope.appendArtifact(response.data);
                                    $(".activityicon").removeClass("fa-spin");
                                } else {
                                    clearInterval($scope.logWatcher);
                                    $scope.buildId = null;
                                    $(".activityicon").removeClass("fa-spin");
                                    modalError("Error while building on server. Please try again. (" + response.data.exitCode + ")");
                                }
                            }, function errorCallback(response) {
                                clearInterval($scope.logWatcher);
                                $scope.buildId = null;
                                $(".activityicon").removeClass("fa-spin");
                                modalError("Error while building on server. Please try again. (" + response.status + ")");
                            })
                    }, 1000);
                }, function errorCallback(response) {
                    $scope.buildId = null;
                    $(".activityicon").removeClass("fa-spin");
                    modalError("Error launching build on server. Please try again. (" + response.status + ")");
                });
        };
}]);
