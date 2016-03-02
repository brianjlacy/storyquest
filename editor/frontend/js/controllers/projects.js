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

        // initialize icon upload
        $scope.$watch("files", function() {
            if ($scope.files)
                $scope.upload = $upload.upload({
                    method: "PUT",
                    url: "/api/iconimage/" + $scope.selectedProject.id,
                    data: {},
                    file: $scope.files
                }).progress(function(evt) {
                    // TODO: report proper progress with pace: parseInt(100.0 * evt.loaded / evt.total)
                    Pace.restart();
                }).success(function(data, status, headers, config) {
                    //refresh background
                });
        });

        $scope.getIconImageStyle = function() {
            if ($scope.selectedProject)
                return "url(/api/iconimage/" + $scope.selectedProject.id + ")";
        };

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
