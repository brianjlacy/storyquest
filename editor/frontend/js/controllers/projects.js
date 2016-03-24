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

editorModule.controller("projectsCoreController", ["$scope", "$http", "Upload", "Project", "UserService", "ProjectService",
    function ($scope, $http, Upload, Project, UserService, ProjectService) {
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

        $scope.uploadIcon = function() {
            if ($scope.iconFile)
                Upload.upload({
                    method: "PUT",
                    url: "/api/iconimage/" + $scope.selectedProject.id,
                    data: {
                        file: $scope.iconFile
                    }
                }).then(function (resp) {
                    $(".projecticon").attr("src", $(".projecticon").attr("src") + "?date=" + new Date().getTime());
                }, function (resp) {
                    modalError("Error uploading file. Please try again.");
                }, function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    Pace.restart();
                });
        };

        $scope.uploadCover = function() {
            if ($scope.coverFile)
                Upload.upload({
                    method: "PUT",
                    url: "/api/coverimage/" + $scope.selectedProject.id,
                    data: {
                        file: $scope.coverFile
                    }
                }).then(function (resp) {
                    $(".projectcover").attr("src", $(".projectcover").attr("src") + "?date=" + new Date().getTime());
                }, function (resp) {
                    modalError("Error uploading file. Please try again.");
                }, function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    Pace.restart();
                });
        };

        $scope.uploadSplashImage = function() {
            if ($scope.splashImageFile)
                Upload.upload({
                    method: "PUT",
                    url: "/api/splashimage/" + $scope.selectedProject.id,
                    data: {
                        file: $scope.splashImageFile
                    }
                }).then(function (resp) {
                    $(".projectsplash").attr("src", $(".projectsplash").attr("src") + "?date=" + new Date().getTime());
                }, function (resp) {
                    modalError("Error uploading file. Please try again.");
                }, function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    Pace.restart();
                });
        };

        $scope.uploadSplashVideo = function() {
            if ($scope.splashVideoFile)
                Upload.upload({
                    method: "PUT",
                    url: "/api/splashvideo/" + $scope.selectedProject.id,
                    data: {
                        file: $scope.splashVideoFile
                    }
                }).then(function (resp) {
                    $scope.updateSplashVideoView();
                }, function (resp) {
                    modalError("Error uploading file. Please try again.");
                }, function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    Pace.restart();
                });
        };

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

        $scope.showKeyPassword = function() {
            $scope.keyPassword = $scope.settings.KEY_PASSWORD;
        };

        $scope.createKey = function() {
            modalYesNo("Are you sure?", "This will delete the prior key for project \"" + $scope.selectedProject.id + "\" and remove your ability to update apps that are created with it. Are your absolutely sure you want this?",
            function(result) {
                if (result) {
                    var modalWaitDialog = modalWait("Creating Key..");
                    $http({method: "POST", url: "/api/settings/key/" + $scope.selectedProject.id}).
                        success(function(settings, status, headers, config) {
                            modalWaitDialog.modal("hide");
                            $scope.editProject($scope.selectedProject.id);
                        }).
                        error(function(data, status, headers, config) {
                            modalWaitDialog.modal("hide");
                            modalError("Error creating key. Please try again.");
                        });
                }
            });
        };

        $scope.uploadKey = function() {
            $("#modalKey").modal();
        };

        $scope.doUploadKey = function() {
            if ($scope.appkey.file && $scope.appkey.password && $scope.appkey.alias)
                Upload.upload({
                    method: "PUT",
                    url: "/api/settings/key",
                    data: {
                        file: $scope.appkey.file,
                        projectId: $scope.selectedProject.id,
                        password: $scope.appkey.password,
                        alias: $scope.appkey.alias
                    }
                }).then(function (resp) {
                    $scope.editProject($scope.selectedProject.id);
                }, function (resp) {
                    modalError("Error uploading key. Please try again.");
                }, function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    Pace.restart();
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
                $scope.keyPassword = undefined;
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

    }]);