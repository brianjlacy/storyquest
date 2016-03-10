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

editorModule.controller("projectsCoreController", ["$scope", "$http", "$upload", "Project", "UserService", "ProjectService",
    function ($scope, $http, $upload, Project, UserService, ProjectService) {
        pageTitle("Projects", "View and create projects");
        breadcrumb([{title:"Projects", url:"/projects"}, {title:"Projects Dashboard", url:""}]);

        $scope.user = UserService;
        $scope.project = ProjectService;

        // edit current project
        $scope.$watch("project.data.id", function() {
            if ($scope.project.data.id) {
                $scope.editProject($scope.project.data.id);
            }
        });

        $scope.updateSplashVideoView = function() {
            // update video and resize. the video tag is a pain-in-the-ass
            var video = $(".projectsplashvideo");
            video.empty();
            video.append(
                '<source src="'+ "/api/splashvideo/" + $scope.selectedProject.id + '?' + new Date().getTime() + '">'
            );
            setTimeout(function(){
                $(".novideo").hide();
                video.css("height", $(".videocontainer").height());
                video.css("width", $(".videocontainer").width());
                video.css("left", $(".videocontainer").offset().left);
            }, 1000);
        };

        // initialize icon upload
        $scope.$watch("iconFiles", function() {
            if ($scope.iconFiles)
                $scope.upload = $upload.upload({
                    method: "PUT",
                    url: "/api/iconimage/" + $scope.selectedProject.id,
                    data: {},
                    file: $scope.iconFiles
                }).progress(function(evt) {
                    // TODO: report proper progress with pace: parseInt(100.0 * evt.loaded / evt.total)
                    Pace.restart();
                }).success(function(data, status, headers, config) {
                    $(".projecticon").attr("src", $(".projecticon").attr("src") + "?date=" + new Date().getTime());
                });
        });

        // initialize cover upload
        $scope.$watch("coverFiles", function() {
            if ($scope.coverFiles)
                $scope.upload = $upload.upload({
                    method: "PUT",
                    url: "/api/coverimage/" + $scope.selectedProject.id,
                    data: {},
                    file: $scope.coverFiles
                }).progress(function(evt) {
                    // TODO: report proper progress with pace: parseInt(100.0 * evt.loaded / evt.total)
                    Pace.restart();
                }).success(function(data, status, headers, config) {
                    $(".projectcover").attr("src", $(".projectcover").attr("src") + "?date=" + new Date().getTime());
                });
        });

        // initialize splash image upload
        $scope.$watch("splashImageFiles", function() {
            if ($scope.splashImageFiles)
                $scope.upload = $upload.upload({
                    method: "PUT",
                    url: "/api/splashimage/" + $scope.selectedProject.id,
                    data: {},
                    file: $scope.splashImageFiles
                }).progress(function(evt) {
                    // TODO: report proper progress with pace: parseInt(100.0 * evt.loaded / evt.total)
                    Pace.restart();
                }).success(function(data, status, headers, config) {
                    console.log("REFRESH)");
                    $(".projectsplash").attr("src", $(".projectsplash").attr("src") + "?date=" + new Date().getTime());
                }).error(function() {
                    modalWarning("Error uploading file", "The file could not be saved. Please check if the resolution and format of the file are exactly as required.");
                });
        });

        // initialize splash image upload
        $scope.$watch("splashVideoFiles", function() {
            if ($scope.splashVideoFiles)
                $scope.upload = $upload.upload({
                    method: "PUT",
                    url: "/api/splashvideo/" + $scope.selectedProject.id,
                    data: {},
                    file: $scope.splashVideoFiles
                }).progress(function(evt) {
                    // TODO: report proper progress with pace: parseInt(100.0 * evt.loaded / evt.total)
                    Pace.restart();
                }).success(function(data, status, headers, config) {
                    $scope.updateSplashVideoView();
                });
        });

        $(".setting-tabs a").click(function (e) {
            e.preventDefault();
            $(this).tab('show');
        });

        $(".images-tabs a").click(function (e) {
            e.preventDefault();
            $(this).tab('show');
            $scope.updateSplashVideoView();
        });

        $scope.newProject = function() {
            $("#modalProject").modal();
        };

        $scope.createNewProject = function(name, description, tags) {
            var newProject = new Project();
            newProject.name = name;
            newProject.description = description;
            newProject.tags = tags;
            newProject.$create({}, function(project, getResponseHeaders) {
                modalWarning("Project created", "Project created successfully.");
                $scope.reloadUser();
            });
        };

        $scope.selectRow = function($event, projectId) {
            $($event.target).parent().addClass("active").siblings().removeClass("active");
            $scope.editProject(projectId);
        };

        $scope.editProject = function(projectId) {
            $http({method: "GET", url: "/api/settings/" + projectId}).
                success(function(settings, status, headers, config) {
                    $scope.settings = settings;
                }).
                error(function(data, status, headers, config) {
                    modalError("Error reading data. Please try again.");
                });
            Project.get({projectId: projectId}, function(project) {
                $scope.selectedProject = project;
                $(".projecticon").attr("src", "/api/iconimage/" + $scope.selectedProject.id);
                $(".projectcover").attr("src", "/api/coverimage/" + $scope.selectedProject.id);
                $(".projectsplash").attr("src", "/api/splashimage/" + $scope.selectedProject.id);
            });
        };

        $scope.saveSelectedProject = function() {
            $scope.selectedProject.$save({ projectId: $scope.selectedProject.id }, function(obj, putResponseHeaders) {
                $http.post("/api/settings/" + $scope.selectedProject.id, $scope.settings)
                    .success(function(data, status, headers, config) {
                        modalWarning("Data Saved", "The changes were saved successfully.");
                    })
                    .error(function(data, status, headers, config) {
                        modalError("Error storing data on server. Please try again. (" + status + ")");
                    });
                if ($scope.selectedProject.id==$scope.project.data.id) {
                    // the current active project is changed, update data
                    $scope.reloadProject($scope.project.data.id);
                    $scope.reloadUser();
                }
            });
        };

        $scope.activateProject = function(projectId) {
            console.log("Switch to project " + projectId);
            $scope.loadProject(projectId);
        };

        $scope.deleteProject = function(projectId) {
            modalYesNo("Delete Project?", "Do you want to delete project '" + projectId + "'? This can not be undone.",
                function(result) {
                    if (result) {
                        Project.delete({projectId: projectId}, function() {
                            $scope.reloadUser(function() {
                                if ($scope.selectedProject && $scope.selectedProject.id==projectId)
                                    $scope.editProject($scope.user.data.projects[0]);
                            });
                            modalWarning("Project Deleted", "The project was deleted successfully.");
                        }, function(err) {
                            modalError("Error storing data on server. Please try again. (" + err.data + ")");
                        });
                    }
            });
        };

        $scope.openIconPreview = function() {
            modalWarning("Generated App Icons",
                    "<table style='width:100%;border-collapse:collapse'>" +
                    "<tr><td style='padding:0.5em'><img src='../images/android.png'></td><td style='padding:0.5em'><img src='/p/" + $scope.selectedProject.id + "/icons/android/res/drawable-xhdpi/icon.png'></td>" +
                    "<tr><td style='padding:0.5em'><img src='../images/ios.png'></td><td style='padding:0.5em'><img src='/p/" + $scope.selectedProject.id + "/icons/ios/Resources/icons/icon@2x.png'></td>" +
                    "<tr><td style='padding:0.5em'><img src='../images/kindle.png'></td><td style='padding:0.5em'><img src='/p/" + $scope.selectedProject.id + "/icons/amazon-fireos/res/drawable-hdpi/icon.png'></td>" +
                    "<tr><td style='padding:0.5em'><img src='../images/epub.png'></td><td style='padding:0.5em'><img src='/p/" + $scope.selectedProject.id + "/icons/android/res/drawable-xhdpi/icon.png'></td>" +
                    "<tr><td style='padding:0.5em'><img src='../images/firefoxos.png'></td><td style='padding:0.5em'><img src='/p/" + $scope.selectedProject.id + "/icons/firefoxos/www/img/icon-128.png'></td>" +
                    "</table>"
            );
        };

    }]);
