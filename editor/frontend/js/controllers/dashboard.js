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

editorModule.controller("dashboardCoreController", ["$scope", "$http", "UserService", "ProjectService",
    function ($scope, $http, UserService, ProjectService) {
        breadcrumb([{title:"Dashboard", url:"/"}, {title:"Overview", url:""}]);

        $scope.user = UserService;
        $scope.project = ProjectService;
        $scope.quickTour = quickTour();
        $scope.creatingProjects = creatingProjects();
        $scope.creatingChapters = creatingChapters();
        $scope.addingMultimedia = addingMultimedia();

        // update stats
        $scope.$watch("[project.data.id, user.data.username]", function() {
            if ($scope.user.data && !isEmpty($scope.user.data) && $scope.project.data && !isEmpty($scope.project.data)) {
                pageTitle($scope.project.data.name, "Project Overview");
                console.log("Loading project stats for " + $scope.project.data.id);
                $scope.updateStats();
                // load project blog feed
                window.Feed({
                    url: $scope.project.data.blogFeed,
                    number: 3,
                    callback: $scope.feedLoaded
                });

            }
        });

        $scope.updateStats = function() {
            if ($scope.user.data && $scope.project.data)
                $http.get("/api/stats/" + $scope.user.data.username + "/" + $scope.project.data.id)
                    .success(function(data, status) {
                        $scope.stats = data;
                        // FIXME don't get the complete node tree from server just to see how many entries it has!
                        $http({method: "GET", url: "/api/nodelist/" + $scope.project.data.id}).
                            success(function(nodes, status, headers, config) {
                                if (nodes.length>0)
                                    $scope.stats.nodescount = nodes.length;
                                else
                                    $scope.stats.nodescount = 0;
                            }).
                            error(function(data, status, headers, config) {
                                modalError("Error " + status + " while loading project data. Please try again.");
                            });

                    }).error(function(data, status) {
                        $scope.stats = {
                            projects: 0,
                            feedbacks: 0,
                            mediaobjects: 0,
                            nodetypes: 0
                        }
                    });
        };

        // enable blogroll
        $scope.blogPosts = [];
        $scope.feedLoaded = function(posts) {
            for (var i=0; i<posts.feed.entries.length; i++)
                $scope.blogPosts.push(posts.feed.entries[i]);
            $scope.$apply();
        };
    }]);

