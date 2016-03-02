/*
 * StoryQuest 2
 *
 * Copyright (c) 2015 Questor GmbH
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

StoryQuestEditorApp.controller("coreController", [ "$scope", "$http", "$timeout", "$window", "UserService", "ProjectService",
    function ($scope, $http, $timeout, $window, UserService, ProjectService) {

        $scope.user = UserService;
        $scope.project = ProjectService;

        // get initial data
        $scope.user.load(function(userData) {
            console.log("Load complete for user " + userData.username);
            $.get("https://www.gravatar.com/avatar/", function() {
                $(".img-circle").attr("src", "https://www.gravatar.com/avatar/" + MD5(userData.username));
            });
            $scope.project.load(userData.projects[0],
                function(projectData) {
                    console.log("Load complete for project " + projectData.id);
                }, function(err) {
                    modalError("Failed loading project info: " + err);
                });
        }, function(err) {
            modalError("Failed loading user info: " + err);
        });

        /*
        // enable auto saving
        var projectUserSyncTimeout = null;
        $scope.projectUserSyncDebounce = function(newVal, oldVal) {
            // sync to server always is when a 1000ms user edit gap occurs.
            if (typeof newVal != "undefined" && typeof oldVal != "undefined" && !isEmpty(oldVal) && $scope.project) {
                if (!objectsEqual(oldVal, newVal)) {
                    //console.log("NEW " + JSON.stringify(newVal));
                    //console.log("OLD " + JSON.stringify(oldVal));
                    // update stats
                    $scope.updateStats();
                    if (projectUserSyncTimeout) {
                        $timeout.cancel(projectUserSyncTimeout)
                    }
                    projectUserSyncTimeout = $timeout(function() {
                        console.log("Syncing project and user info to server...");
                        if (oldVal.username)
                            $scope.user.$save({ username: $scope.user.username });
                        else
                            $scope.project.$save({ projectId: $scope.project.id });
                    }, 1000);
                }
            }
        };
        $scope.$watch("user.data", $scope.projectUserSyncDebounce, true);
        $scope.$watch("project.data", $scope.projectUserSyncDebounce, true);
         */

        // enable preview button
        $("#openpreviewbutton").on("click", function(e) {
            window.open("preview.html?projectId=" + $scope.project.data.id + "&authtoken=" + $scope.user.data.authtoken, null, "height=800,width=480,status=no,toolbar=no,menubar=no,location=no");
        });

        // enable preview qr button
        $("#openpreviewqr").on("click", function(e) {
            var port = (document.location.port=="")?"443":document.location.port;
            var qrUrl = document.location.protocol + "//" + document.location.hostname + ":" + port + "/preview.html?projectId=" + $scope.project.data.id + "&headless=true&authtoken=" + $scope.user.data.authtoken;
            modalQR(qrUrl, $scope.project.data.id);
        });

        $scope.loadProject = function(projectId) {
            console.log("Loading project " + projectId);
            $scope.project.load(projectId, function() {
                console.log("Load complete for project " + projectId);
            }, function(err) {
                modalError("Error loading project", "Error loading project data: " + err.data);
            });
        };

        $scope.reloadProject = function(projectId, success, fail) {
            console.log("Reloading project.");
            $scope.project.reload(projectId, success, fail);
        };

        $scope.reloadUser = function(success, fail) {
            console.log("Reloading user.");
            $scope.user.reload(success, fail);
        };

        $scope.logout = function() {
            $http.post('/api/logout').
                success(function(data, status, headers, config) {
                    console.log("User logged out.");
                    $window.location.href = "/login.html";
                }).
                error(function(data, status, headers, config) {
                    modalError("Error logging out", "Error logging user out.");
                });
        };

        $scope.changePassword = function() {
            $http.post('/api/changepassword', { "password" : $scope.newPassword }).
                success(function(data, status, headers, config) {
                    modalOk("Password changed", "Your password was changed. Please sign in again.", function() {
                        $window.location.href = "/login.html";
                    });
                }).
                error(function(data, status, headers, config) {
                    modalError("Error changing password", "Error changing password.");
                });
        };

        $scope.fixContentHeight = function() {
            // fix editor area height
            var contentElem = $("section#content");
            var destinationHeight = $("aside.right-side").outerHeight()-$("section.content-header").outerHeight();
            var contentMargin = contentElem.outerHeight()-contentElem.height();
            var finalHeight = destinationHeight-contentMargin;
            console.log("Setting content height to: " + finalHeight + "px");
            contentElem.height(finalHeight+"px");
        };

        $scope.$on('$viewContentLoaded', function () {
            console.log("New route template loaded, fixing content height.");
            $scope.fixContentHeight();
        });

    }]);
