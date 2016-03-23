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

var StoryQuestEditorApp = angular.module("StoryQuestEditorApp", [
    "ngRoute",
    "ngResource",
    "editorModule",
    "ngDraggable",
    "loginModule",
    "registerModule",
    "lostpasswordModule",
    "confirmModule"
]);

var editorModule = angular.module("editorModule", [
    "ngResource",
    "ui.ace",
    "angularSpectrumColorpicker",
    "ui.sortable",
    "xeditable",
    "ngResource",
    "ngFileUpload",
    "editorDefaultModule",
    "graphicalEditorModule"
]);

StoryQuestEditorApp.config(["$routeProvider",
        function($routeProvider) {
            $routeProvider.
                when("/dashboard", {
                    templateUrl: "views/dashboard.html",
                    controller: "dashboardCoreController"
                }).
                when("/projects", {
                    templateUrl: "views/projects.html",
                    controller: "projectsCoreController"
                }).
                when("/edit", {
                    templateUrl: "views/edit.html",
                    controller: "editCoreController"
                }).
                when("/editGraphical", {
                    templateUrl: "views/editgraph.html",
                    controller: "editGraphicalCoreController"
                }).
                when("/edit/:nodeId", {
                    templateUrl: "views/edit.html",
                    controller: "editCoreController"
                }).
                when("/layout", {
                    templateUrl: "views/layout.html",
                    controller: "layoutCoreController"
                }).
                when("/preview", {
                    templateUrl: "views/preview.html",
                    controller: "previewCoreController"
                }).
                when("/media", {
                    templateUrl: "views/media.html",
                    controller: "mediaCoreController"
                }).
                when("/beta", {
                    templateUrl: "views/beta.html",
                    controller: "betaCoreController"
                }).
                when("/deploy", {
                    templateUrl: "views/deploy.html",
                    controller: "deployCoreController"
                }).
                otherwise({
                    redirectTo: "/dashboard"
                });
        }]
);

StoryQuestEditorApp.factory("Project", ["$resource",
    function($resource){
        return $resource("api/project/:projectId", {}, {
            get: {method:"GET", isArray:false},
            update: {method:"POST"},
            delete: {method:"DELETE"},
            create: {method:"PUT"}
        });
    }]);

StoryQuestEditorApp.factory("User", ["$resource",
    function($resource){
        return $resource("api/user/:username", {}, {
            get: {method:"GET", isArray:false},
            update: {method:"POST"}
        });
    }]);

StoryQuestEditorApp.factory("TypeIcons", [
    function() {
        var self = {
            iconMap: {
                // some default icons for no-editor types
                default: "glyphicon-globe",
                css: "glyphicon-eye-open",
                html: "glyphicon-link",
                javascript: "glyphicon-cog"
            },
            registerType: function(type, icon) {
                self.iconMap[type] = icon;
            },
            getByType: function(type) {
                var icon = null;
                if (type && self.iconMap.hasOwnProperty(type))
                    icon = self.iconMap[type];
                else
                    icon = "glyphicon-question-sign";
                return icon;
            }
        };
        return self;
    }]);

StoryQuestEditorApp.factory("UserService", ["$http", "User",
    function($http, User) {
        var self = {
            data: {},
            load: function(success, fail) {
                if (self.data.username) {
                    console.log("Retrieved user from cache for factory: " + self.data.username);
                    success(self.data);
                } else
                    User.get({}, function(user) {
                        self.data = user;
                        console.log("Retrieved user from server for factory: " + self.data.username);
                        success(self.data);
                    }, function(err) {
                        console.log("Error retrieving user from server: " + err.data);
                        fail(err);
                    });
            },
            reload: function(success, fail) {
                User.get({}, function(user) {
                    self.data = user;
                    console.log("Reloaded user from server for factory: " + self.data.username);
                    if (success)
                        success(self.data);
                }, function(err) {
                    console.log("Error reloading user from server: " + err.data);
                    if (fail)
                        fail(err);
                });
            },
            save: function(success, fail) {
                User.update(self.data, function() {
                    console.log("Saving user to server: " + self.data.username);
                    success();
                }, function(err) {
                    console.log("Error saving user to server: " + err.data);
                    fail(err);
                });
            }
        };
        return self;
    }]);

StoryQuestEditorApp.factory("ProjectService", ["$http", "Project",
    function($http, Project) {
        var self = {
            data: {},
            load: function(projectId, success, fail) {
                if (self.data.id && self.data.id==projectId) {
                    console.log("Retrieved project from cache for factory: " + self.data.id);
                    success(self.data);
                } else
                    Project.get({projectId: projectId}, function(project) {
                        self.data = project;
                        console.log("Retrieved project from server for factory: " + self.data.id);
                        success(project);
                    }, function(err) {
                        console.log("Error retrieving project from server: " + err.data);
                        fail(err);
                    });
            },
            reload: function(projectId, success, fail) {
                Project.get({projectId: projectId}, function(project) {
                    self.data = project;
                    console.log("Reloaded project from server for factory: " + self.data.id);
                    if (success)
                        success(project);
                }, function(err) {
                    console.log("Error reloading project from server: " + err.data);
                    if (fail)
                        fail(err);
                });
            },
            save: function(success, fail) {
                Project.update({projectId: self.data.id}, self.data, function() {
                    console.log("Saving project to server: " + self.data.id);
                    success();
                }, function(err) {
                    console.log("Error saving project to server: " + err.data);
                    fail(err);
                });
            }
        };
        return self;
    }]);

StoryQuestEditorApp.factory("ConfigService", ["$http",
    function($http) {
        var self = {
            get: function(key, success) {
                $http.get("/api/config/" + key).
                    success(function(data, status, headers, config) {
                        success(data);
                    });
            }
        };
        return self;
    }]);

StoryQuestEditorApp.factory("WebSocketService", ["$http",
    function($http) {
        var self = {
            connect: function(authToken, projectId, onMessageCallback) {
                // FIXME: this may cause problems if the port is not given explicitly, check this when port==80||443
                var wssHost = document.location.hostname;
                var wssProtocol = document.location.protocol.startsWith("https:")?"wss":"ws";
                var wssPort = document.location.port;
                if (wssPort!="")
                    wssPort = ":" + wssPort;
                var url = wssProtocol + "://" + wssHost + wssPort + "/" + "?authtoken=" + authToken + "&project=" + projectId + "&type=editor";
                console.log("Connecting to remote socket: " + url);
                self.socket = new eio.Socket(url);
                self.socket.on("open", function() {
                    console.log("Remote socket connected.");
                    onMessageCallback({ type: "connect" });
                    self.socket.on("message", function(data) {
                        var message = JSON.parse(data);
                        onMessageCallback(message);
                    });
                });
            },
            sendRaw: function(message, callback) {
                if (self.socket)
                    self.socket.send(JSON.stringify(message), callback);
                else
                    console.log("Socket not yet available. Not sending data.");
            },
            setRuntimeData: function(playerData, callback) {
                self.sendRaw({
                    type: "setData",
                    playerData: playerData
                }, callback);
            },
            getRuntimeData: function(callback) {
                self.sendRaw({ type: "getData" }, callback);
            },
            execInPreview: function(command, callback) {
                self.sendRaw({ type: "exec", command: command }, callback);
            },
            loadNodeInPreview: function(node, callback) {
                self.sendRaw({
                    type: "load",
                    node: { id: node.id, type: node.type }
                }, callback);
            }
        };
        return self;
    }]);

StoryQuestEditorApp.factory("NodeConfigurationService", ["$http",
    function($http) {
        var self = {
            filterPropertyKeys: [],
            filterProperties: function(entry, filterPropertyKeys) {
                return $.inArray(entry, filterPropertyKeys) == -1;
            },
            registerFilterPropertyKeys: function(entries) {
               return self.filterPropertyKeys.concat(entries);
            },
            filtercopyNodeConfiguration: function(node, filterPropertyKeys) {
                var nodeCopy = JSON.parse(JSON.stringify(node));
                for (var property in nodeCopy) {
                    if (nodeCopy.hasOwnProperty(property) && !self.filterProperties(property, filterPropertyKeys)) {
                        delete nodeCopy[property];
                    }
                }
                return nodeCopy;
            }

        };
        return self;
    }]);

StoryQuestEditorApp.filter("firstname", function() {
    return function(input) {
        if (input && typeof input == "string")
            return input.split(" ")[0];
        else
            return "";
    };
});

StoryQuestEditorApp.filter("regex", function() {
    return function(input, regex, replace) {
        if (input && typeof input == "string") {
            return input.replace(new RegExp(regex), replace);
        }
        else
        return "";
    };
});
