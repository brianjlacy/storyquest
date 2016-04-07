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

var path = require("path");
var fs = require("fs");
var fse = require("fs-extra");
var genicon = require("cordova-gen-icon");
var async = require("async");
var propertiesParser = require("properties-parser");
var imageSize = require('image-size');
var spawn = require('child_process').spawn;

var Project = require("../model/project.js");
var User = require("../model/user.js");

var config;

exports.registerServices = function(appConfig, app) {
    config = appConfig;
    app.get("/api/project/:projectId", global.authPublicProject, this.getProject);
    app.put("/api/project", global.authUser, this.createProject);
    app.post("/api/project/:projectId", global.authUser, global.authProject, this.updateProject);
    app.delete("/api/project/:projectId", global.authUser, global.authProject, this.deleteProject);
    app.put("/api/iconimage/:projectId", global.authUser, global.authProject, this.updateIconImage);
    app.get("/api/iconimage/:projectId", global.authUser, global.authProject, this.getIconImage);
    app.put("/api/coverimage/:projectId", global.authUser, global.authProject, this.updateCoverImage);
    app.get("/api/coverimage/:projectId", global.authUser, global.authProject, this.getCoverImage);
    app.put("/api/splashimage/:projectId", global.authUser, global.authProject, this.updateSplashImage);
    app.get("/api/splashimage/:projectId", global.authUser, global.authProject, this.getSplashImage);
    app.put("/api/splashvideo/:projectId", global.authUser, global.authProject, this.updateSplashVideo);
    app.get("/api/splashvideo/:projectId", global.authUser, global.authProject, this.getSplashVideo);
    app.put("/api/menuimage/:projectId", global.authUser, global.authProject, this.updateMenuImage);
    app.get("/api/menuimage/:projectId", global.authUser, global.authProject, this.getMenuImage);
    app.put("/api/menuvideo/:projectId", global.authUser, global.authProject, this.updateMenuVideo);
    app.get("/api/menuvideo/:projectId", global.authUser, global.authProject, this.getMenuVideo);
    app.put("/api/sidebarimage/:projectId", global.authUser, global.authProject, this.updateSidebarImage);
    app.get("/api/sidebarimage/:projectId", global.authUser, global.authProject, this.getSidebarImage);
    app.put("/api/uifont/:projectId", global.authUser, global.authProject, this.updateUIFont);
    app.get("/api/uifont/:projectId", global.authUser, global.authProject, this.getUIFont);
    app.put("/api/helpimage/:projectId", global.authUser, global.authProject, this.updateHelpImage);
    app.get("/api/helpimage/:projectId", global.authUser, global.authProject, this.getHelpImage);
    app.put("/api/creditsimage/:projectId", global.authUser, global.authProject, this.updateCreditsImage);
    app.get("/api/creditsimage/:projectId", global.authUser, global.authProject, this.getCreditsImage);
    app.get("/api/storerating/:projectId", global.authUser, this.storeRating);
    app.post("/api/storecomment/:projectId", this.storeComment);
    app.get("/api/sequence/:projectId", global.authUser, global.authProject, this.getSequence);
    app.post("/api/sequence/:projectId", global.authUser, global.authProject, this.storeSequence);
    app.get("/api/settings/:projectId", global.authUser, global.authProject, this.getSettings);
    app.post("/api/settings/:projectId", global.authUser, global.authProject, this.storeSettings);
    app.post("/api/settings/key/:projectId", global.authUser, global.authProject, this.createAppKey);
    app.put("/api/settings/key", global.authUser, global.authProject, this.updateAppKey);
    app.get("/api/settings/key/:projectId", global.authUser, global.authProject, this.getKey);
};

exports.generateAppIcons = function(destDir, sourceImagePath, done) {
    var generator = new genicon.CordovaGenIcon({ silent: true });
    if (!fs.existsSync(path.join(destDir, "icons")))
        fs.mkdirSync(path.join(destDir, "icons"));
    async.series([
            function(callback) { generator.generateAndroidIcon("", sourceImagePath, path.join(destDir, "icons"), callback); }
        ],
        function(err) {
            if (err)
                done(err);
            else
                done(null);
        });
};

exports.storeRatingInProject = function(project, userId, rating, callback) {
    var ratingEntry = null;
    for (var i=0; i<project.ratings.length; i++)
        if (project.ratings[i].userId===userId)
            ratingEntry = project.ratings[i];
    if (!ratingEntry) {
        ratingEntry = { userId: userId, date: new Date() };
        if (!project.ratings)
            project.ratings = [];
        project.ratings.push(ratingEntry);
    }
    ratingEntry.rating =  rating;
    project.updateData(project, function(err, result) {
        if (err)
            callback(err);
        else
            callback(null);
    });
};

exports.storeCommentInProject = function(project, commentSender, commentMessage, callback) {
    var commentEntry = { sender: commentSender, date: new Date(), message: commentMessage };
    if (!project.comments)
        project.comments = [];
    project.comments.push(commentEntry);
    project.updateData(project, function(err, result) {
        if (err)
            callback(err);
        else
            callback(null);
    });
};

exports.getSequence = function(req, res) {
    if (!req.param("projectId"))
        return res.json(500, {type: "REQUEST_FAILED", "message":"No projectId given."});
    else {
        var sequenceFile = path.join(Utils.getProjectDir(req.param("projectId")), "sequence.json");
        if (!fs.existsSync(sequenceFile))
            return res.json([]);
        else {
            var sequence = JSON.parse(fs.readFileSync(sequenceFile, "utf8"));
            return res.json(sequence);
        }
    }
};

exports.storeSequence = function(req, res) {
    if (!req.param("projectId"))
        return res.json(500, {type: "REQUEST_FAILED", "message":"No projectId given."});
    else {
        var sequenceFile = path.join(Utils.getProjectDir(req.param("projectId")), "sequence.json");
        fs.writeFile(sequenceFile, JSON.stringify(req.body), function(err) {
            if (err)
                return res.json(500, {type:"REQUEST_FAILED", "message":err});
            else
                return res.json(200, {});
        });
    }
};

exports.getSettings = function(req, res) {
    if (!req.param("projectId"))
        return res.json(500, {type: "REQUEST_FAILED", "message":"No projectId given."});
    else {
        var settingsFile = path.join(Utils.getProjectDir(req.param("projectId")), "storyquest.json");
        var propertiesFile = path.join(Utils.getProjectDir(req.param("projectId")), "storyquest.properties");
        var settings = {};
        if (!fs.existsSync(settingsFile))
            settings = Utils.mergeObjects(settings, {
                sequence: "graph"
            });
        else {
            settings = Utils.mergeObjects(settings, JSON.parse(fs.readFileSync(settingsFile, "utf8")));
        }
        if (fs.existsSync(propertiesFile))
            settings = Utils.mergeObjects(settings, propertiesParser.parse(fs.readFileSync(propertiesFile, "utf8")));
        // convert app version code to number
        if (typeof settings.APP_VERSION_CODE === "string")
            settings.APP_VERSION_CODE = parseInt(settings.APP_VERSION_CODE);
        return res.json(settings);
    }
};

exports.storeSettings = function(req, res) {
    if (!req.param("projectId"))
        return res.json(500, {type: "REQUEST_FAILED", "message":"No projectId given."});
    else {
        // write settings file
        var settingsFile = path.join(Utils.getProjectDir(req.param("projectId")), "storyquest.json");
        var settings = {
            id: req.body.id,
            name: req.body.name,
            author: req.body.author,
            publisher: req.body.publisher,
            sequence: req.body.sequence,
            theme: req.body.theme
        };
        fs.writeFile(settingsFile, JSON.stringify(settings), function(err) {
            if (err)
                return res.json(500, {type: "REQUEST_FAILED", "message":err});
            else
                return res.json(200, {});
        });
        // write properties file
        var propertiesFile = path.join(Utils.getProjectDir(req.param("projectId")), "storyquest.properties");
        // for security reasons, only store certain fields, take others (eg paths) from system config
        var properties = {
            STORYQUEST_TEMPLATE_PATH: config.templateDirFromAndroidContext,
            STORYQUEST_PROJECT_PATH: config.projectsDirFromAndroidContext + "/" + req.param("projectId") + "/",
            STORYQUEST_ICON_PATH: config.projectsDirFromAndroidContext + "/" + req.param("projectId") + "/icon.png"
        };
        if (fs.existsSync(propertiesFile))
            properties = Utils.mergeObjects(properties, propertiesParser.parse(fs.readFileSync(propertiesFile, "utf8")));
        properties.APP_LABEL = req.body.APP_LABEL;
        properties.GOOGLE_SERVICES_ID = req.body.GOOGLE_SERVICES_ID;
        properties.APP_ID = req.body.APP_ID;
        properties.APP_VERSION_CODE = "" + req.body.APP_VERSION_CODE;
        properties.APP_VERSION_NAME = req.body.APP_VERSION_NAME;
        var propEditor = propertiesParser.createEditor();
        for (var property in properties) {
            if (properties.hasOwnProperty(property)) {
                propEditor.set(property, properties[property]);
            }
        }
        try {
            propEditor.save(propertiesFile, function() {
                return res.json(200, {});
            })
        } catch (err) {
            return res.json(500, {type: "REQUEST_FAILED", "message":err});
        }
    }
};

exports.storeRating = function(req, res) {
    var projectId = req.param("projectId");
    var rating = -1;
    try {
        rating = parseInt(req.param("rating"));
    } catch(err) {
        return res.json(500, {type: "REQUEST_FAILED", "message":"Rating must be a number."});
    }
    if (rating!=-1)
        Project.getByProjectId(projectId, function(err, project) {
            if (err) {
                return res.json(500, {type: "REQUEST_FAILED", "message":err});
            } else {
                exports.storeRatingInProject(project, req.user.id, rating, function(err) {
                    if (err)
                        return res.json(500, {type: "REQUEST_FAILED", "message":err});
                    else
                        return res.json(200, {});
                });
            }
        });
    else
        return res.json(500, {type: "REQUEST_FAILED", "message":"No projectId given."});
};

exports.storeComment = function(req, res) {
    var projectId = req.param("projectId");
    var sender = req.param("sender");
    var message = req.param("message");
    if (message.length>2000)
        return res.json(500, {type: "REQUEST_FAILED", "message":"Comment too long."});
    else
        Project.getByProjectId(projectId, function(err, project) {
            if (err) {
                return res.json(500, {type: "REQUEST_FAILED", "message":err});
            } else {
                exports.storeCommentInProject(project, sender, message, function (err) {
                    if (err)
                        return res.json(500, {type: "REQUEST_FAILED", "message":err});
                    else
                        res.json(200, {});
                });
            }
        });
};

exports.updateIconImage = function(req, res){
    var outputDir = Utils.getProjectDir(req.param("projectId"));
    try {
        if (req.files && req.files.file) {
            var dimensions = imageSize(req.files.file.path);
            if (dimensions.width===1024 && dimensions.height===1024) {
                // dont use rename here, because rename breaks when files are on different filesystems
                fse.copySync(req.files.file.path, path.join(outputDir, "icon.png"));
                fse.removeSync(req.files.file.path);
                return res.json(200, {});
            } else
                return res.json(500, {type: "REQUEST_FAILED", "message": "Image does not have the right size."});
        }
        exports.generateAppIcons(outputDir, path.join(outputDir, "icon.png"), function(err) {
            if (err)
                throw err;
            else
                return res.json(200, {});
        });
    } catch(err) {
        return res.json(500, {type: "REQUEST_FAILED", "message": err});
    }
};

exports.getIconImage = function(req, res) {
    var projectId = req.param("projectId");
    var iconFile = path.join(Utils.getProjectDir(projectId), "icon.png");
    if (fs.existsSync(iconFile)) {
        res.writeHead(200, { "Content-Type": "image/png" });
        return res.end(fs.readFileSync(iconFile), "binary");
    } else {
        res.writeHead(200, { "Content-Type": "image/png" });
        return res.end(fs.readFileSync(path.join(Utils.getProjectDir(projectId), "..", "..", "template", "icon.png")), "binary");
    }
};

exports.updateCoverImage = function(req, res){
    var outputDir = Utils.getProjectDir(req.param("projectId"));
    try {
        if (req.files && req.files.file) {
            var dimensions = imageSize(req.files.file.path);
            if (dimensions.width===840 && dimensions.height===237) {
                // dont use rename here, because rename breaks when files are on different filesystems
                fse.copySync(req.files.file.path, path.join(outputDir, "cover.png"));
                fse.removeSync(req.files.file.path);
                return res.json(200, {});
            } else
                return res.json(500, {type: "REQUEST_FAILED", "message": "Image does not have the right size."});
        }
    } catch(err) {
        return res.json(500, {type: "REQUEST_FAILED", "message": err});
    }
};

exports.getCoverImage = function(req, res) {
    var projectId = req.param("projectId");
    var coverFile = path.join(Utils.getProjectDir(projectId), "cover.png");
    if (fs.existsSync(coverFile)) {
        res.writeHead(200, { "Content-Type": "image/png" });
        return res.end(fs.readFileSync(coverFile), "binary");
    } else {
        res.writeHead(200, { "Content-Type": "image/png" });
        return res.end(fs.readFileSync(path.join(Utils.getProjectDir(projectId), "..", "..", "template", "cover.png")), "binary");
    }
};

exports.updateSplashImage = function(req, res){
    var outputDir = Utils.getProjectDir(req.param("projectId"));
    try {
        if (req.files && req.files.file) {
            var dimensions = imageSize(req.files.file.path);
            if (dimensions.width===800 && dimensions.height===1280) {
                // dont use rename here, because rename breaks when files are on different filesystems
                fse.copySync(req.files.file.path, path.join(outputDir, "splash.jpg"));
                fse.removeSync(req.files.file.path);
                return res.json(200, {});
            } else
                return res.json(500, {type: "REQUEST_FAILED", "message": "Image does not have the right size."});
        }
    } catch(err) {
        return res.json(500, {type: "REQUEST_FAILED", "message": err});
    }
};

exports.getSplashImage = function(req, res) {
    var projectId = req.param("projectId");
    var splashFile = path.join(Utils.getProjectDir(projectId), "splash.jpg");
    if (fs.existsSync(splashFile)) {
        res.writeHead(200, { "Content-Type": "image/jpeg" });
        return res.end(fs.readFileSync(splashFile), "binary");
    } else {
        res.writeHead(200, { "Content-Type": "image/jpeg" });
        return res.end(fs.readFileSync(path.join(Utils.getProjectDir(projectId), "..", "..", "template", "splash.jpg")), "binary");
    }
};

exports.updateSplashVideo = function(req, res){
    var outputDir = Utils.getProjectDir(req.param("projectId"));
    try {
        if (req.files && req.files.file) {
            // dont use rename here, because rename breaks when files are on different filesystems
            fse.copySync(req.files.file.path, path.join(outputDir, "splash.mp4"));
            fse.removeSync(req.files.file.path);
            return res.json(200, {});
        }
    } catch(err) {
        return res.json(500, {type: "REQUEST_FAILED", "message": err});
    }
};

exports.getSplashVideo = function(req, res) {
    var projectId = req.param("projectId");
    var splashVideoFile = path.join(Utils.getProjectDir(projectId), "splash.mp4");
    if (fs.existsSync(splashVideoFile)) {
        res.writeHead(200, { "Content-Type": "video/mp4" });
        return res.end(fs.readFileSync(splashVideoFile), "binary");
    } else {
        res.writeHead(200, { "Content-Type": "video/mp4" });
        return res.end(fs.readFileSync(path.join(Utils.getProjectDir(projectId), "..", "..", "template", "splash.mp4")), "binary");
    }
};

exports.updateMenuImage = function(req, res){
    var outputDir = Utils.getProjectDir(req.param("projectId"));
    try {
        if (req.files && req.files.file) {
            var dimensions = imageSize(req.files.file.path);
            if (dimensions.width===800 && dimensions.height===1280) {
                // dont use rename here, because rename breaks when files are on different filesystems
                fse.copySync(req.files.file.path, path.join(outputDir, "menu.jpg"));
                fse.removeSync(req.files.file.path);
                return res.json(200, {});
            } else
                return res.json(500, {type: "REQUEST_FAILED", "message": "Image does not have the right size."});
        }
    } catch(err) {
        return res.json(500, {type: "REQUEST_FAILED", "message": err});
    }
};

exports.getMenuImage = function(req, res) {
    var projectId = req.param("projectId");
    var splashFile = path.join(Utils.getProjectDir(projectId), "menu.jpg");
    if (fs.existsSync(splashFile)) {
        res.writeHead(200, { "Content-Type": "image/jpeg" });
        return res.end(fs.readFileSync(splashFile), "binary");
    } else {
        res.writeHead(200, { "Content-Type": "image/jpeg" });
        return res.end(fs.readFileSync(path.join(Utils.getProjectDir(projectId), "..", "..", "template", "menu.jpg")), "binary");
    }
};

exports.updateMenuVideo = function(req, res){
    var outputDir = Utils.getProjectDir(req.param("projectId"));
    try {
        if (req.files && req.files.file) {
            // dont use rename here, because rename breaks when files are on different filesystems
            fse.copySync(req.files.file.path, path.join(outputDir, "menu.mp4"));
            fse.removeSync(req.files.file.path);
            return res.json(200, {});
        }
    } catch(err) {
        return res.json(500, {type: "REQUEST_FAILED", "message": err});
    }
};

exports.getMenuVideo = function(req, res) {
    var projectId = req.param("projectId");
    var splashVideoFile = path.join(Utils.getProjectDir(projectId), "menu.mp4");
    if (fs.existsSync(splashVideoFile)) {
        res.writeHead(200, { "Content-Type": "video/mp4" });
        return res.end(fs.readFileSync(splashVideoFile), "binary");
    } else {
        res.writeHead(200, { "Content-Type": "video/mp4" });
        return res.end(fs.readFileSync(path.join(Utils.getProjectDir(projectId), "..", "..", "template", "menu.mp4")), "binary");
    }
};

exports.updateSidebarImage = function(req, res){
    var outputDir = Utils.getProjectDir(req.param("projectId"));
    try {
        if (req.files && req.files.file) {
            var dimensions = imageSize(req.files.file.path);
            if (dimensions.width===837 && dimensions.height===1920) {
                // dont use rename here, because rename breaks when files are on different filesystems
                fse.copySync(req.files.file.path, path.join(outputDir, "sidebar.jpg"));
                fse.removeSync(req.files.file.path);
                return res.json(200, {});
            } else
                return res.json(500, {type: "REQUEST_FAILED", "message": "Image does not have the right size."});
        }
    } catch(err) {
        return res.json(500, {type: "REQUEST_FAILED", "message": err});
    }
};

exports.getSidebarImage = function(req, res) {
    var projectId = req.param("projectId");
    var sidebarFile = path.join(Utils.getProjectDir(projectId), "sidebar.jpg");
    if (fs.existsSync(sidebarFile)) {
        res.writeHead(200, { "Content-Type": "image/jpeg" });
        return res.end(fs.readFileSync(sidebarFile), "binary");
    } else {
        res.writeHead(200, { "Content-Type": "image/jpeg" });
        return res.end(fs.readFileSync(path.join(Utils.getProjectDir(projectId), "..", "..", "template", "sidebar.jpg")), "binary");
    }
};

exports.updateUIFont = function(req, res){
    var outputDir = Utils.getProjectDir(req.param("projectId"));
    try {
        if (req.files && req.files.file) {
            // dont use rename here, because rename breaks when files are on different filesystems
            fse.copySync(req.files.file.path, path.join(outputDir, "uifont.ttf"));
            fse.removeSync(req.files.file.path);
            return res.json(200, {});
        }
    } catch(err) {
        return res.json(500, {type: "REQUEST_FAILED", "message": err});
    }
};

exports.getUIFont = function(req, res) {
    var projectId = req.param("projectId");
    var uiFontFile = path.join(Utils.getProjectDir(projectId), "uifont.ttf");
    if (fs.existsSync(uiFontFile)) {
        res.writeHead(200, { "Content-Type": "application/octet-stream" });
        return res.end(fs.readFileSync(uiFontFile), "binary");
    } else {
        res.writeHead(200, { "Content-Type": "application/octet-stream" });
        return res.end(fs.readFileSync(path.join(Utils.getProjectDir(projectId), "..", "..", "template", "uifont.ttf")), "binary");
    }
};

exports.updateHelpImage = function(req, res){
    var outputDir = Utils.getProjectDir(req.param("projectId"));
    try {
        if (req.files && req.files.file) {
            var dimensions = imageSize(req.files.file.path);
            if (dimensions.width===800 && dimensions.height===1280) {
                // dont use rename here, because rename breaks when files are on different filesystems
                fse.copySync(req.files.file.path, path.join(outputDir, "help.jpg"));
                fse.removeSync(req.files.file.path);
                return res.json(200, {});
            } else
                return res.json(500, {type: "REQUEST_FAILED", "message": "Image does not have the right size."});
        }
    } catch(err) {
        return res.json(500, {type: "REQUEST_FAILED", "message": err});
    }
};

exports.getHelpImage = function(req, res) {
    var projectId = req.param("projectId");
    var splashFile = path.join(Utils.getProjectDir(projectId), "help.jpg");
    if (fs.existsSync(splashFile)) {
        res.writeHead(200, { "Content-Type": "image/jpeg" });
        return res.end(fs.readFileSync(splashFile), "binary");
    } else {
        res.writeHead(200, { "Content-Type": "image/jpeg" });
        return res.end(fs.readFileSync(path.join(Utils.getProjectDir(projectId), "..", "..", "template", "help.jpg")), "binary");
    }
};

exports.updateCreditsImage = function(req, res){
    var outputDir = Utils.getProjectDir(req.param("projectId"));
    try {
        if (req.files && req.files.file) {
            var dimensions = imageSize(req.files.file.path);
            if (dimensions.width===800 && dimensions.height===1280) {
                // dont use rename here, because rename breaks when files are on different filesystems
                fse.copySync(req.files.file.path, path.join(outputDir, "credits.jpg"));
                fse.removeSync(req.files.file.path);
                return res.json(200, {});
            } else
                return res.json(500, {type: "REQUEST_FAILED", "message": "Image does not have the right size."});
        }
    } catch(err) {
        return res.json(500, {type: "REQUEST_FAILED", "message": err});
    }
};

exports.getCreditsImage = function(req, res) {
    var projectId = req.param("projectId");
    var splashFile = path.join(Utils.getProjectDir(projectId), "credits.jpg");
    if (fs.existsSync(splashFile)) {
        res.writeHead(200, { "Content-Type": "image/jpeg" });
        return res.end(fs.readFileSync(splashFile), "binary");
    } else {
        res.writeHead(200, { "Content-Type": "image/jpeg" });
        return res.end(fs.readFileSync(path.join(Utils.getProjectDir(projectId), "..", "..", "template", "credits.jpg")), "binary");
    }
};

exports.getProject = function(req, res) {
    Project.getByProjectId(req.param("projectId"), function(err, project) {
        if (err) {
            return res.json(500, {type:"REQUEST_FAILED", "message":err});
        } else {
            project.blogFeed = config.blogFeed;
            return res.json(200, project)
        }
    });
};

exports.createProject = function(req, res) {
    var newProject = req.body;
    if (!newProject)
        return res.json(500, {type:"REQUEST_FAILED", "message":"Empty request body."});
    else {
        Project.createInDatabase(newProject.name, newProject.description, newProject.tags, req.user.context, req.user.name, function(dberr, result) {
            if (dberr)
                return res.json(500, {type:"REQUEST_FAILED", "message":dberr});
            else {
                var projectId = result.id;
                Project.getByProjectId(projectId, function(err, project) {
                    if (err)
                        return res.json(500, {type:"REQUEST_FAILED", "message":err});
                    else {
                        Project.createProjectDirectory(project, req.user.context);
                        // the user in the session is a copy!
                        req.user.projects.push(project.id);
                        // save to database
                        User.addProject(req.user.username, project.id, function(userErr) {
                            if (userErr)
                                return res.json(500, {type:"REQUEST_FAILED", "message":userErr});
                            else
                                return res.json(200, project);
                        })
                    }
                });
            }
        })
    }
};

exports.updateProject = function(req, res) {
    var updatedProject = req.body;
    if (!updatedProject)
        return res.json(500, {type:"REQUEST_FAILED", "message":"Empty request body."});
    Project.getByProjectId(req.param("projectId"), function(err, project) {
        if (err) {
            return res.json(500, {type:"REQUEST_FAILED", "message":err});
        } else {
            project.updateData(updatedProject, function(err, result) {
                if (err)
                    return res.json(500, {type:"REQUEST_FAILED", "message":err});
                else
                    return res.json(200, project);
            });
        }
    });
};

exports.deleteProject = function(req, res) {
    Project.delete(req.param("projectId"), function(err) {
        if (err)
            return res.json(500, {type:"REQUEST_FAILED", "message":err});
        else
            if (User.removeProject(req.user.username, req.param("projectId"), function(err) {
                if (err)
                    return res.json(500, {type:"REQUEST_FAILED", "message":err});
                else
                    return res.json(200, {});
            }));
    });
};

exports.getKey = function(req, res) {
    var projectId = req.param("projectId");
    var keyFile = path.join(Utils.getProjectDir(projectId), "application.keystore");
    if (fs.existsSync(keyFile)) {
        res.download(keyFile);
    } else {
        return res.json(404, {});
    }
};

exports.updateAppKey = function(req, res) {
    var projectId = req.param("projectId");
    var outputDir = Utils.getProjectDir(projectId);
    var alias = req.param("alias");
    var password = req.param("password");
    try {
        if (req.files && req.files.file) {
            // dont use rename here, because rename breaks when files are on different filesystems
            fse.copySync(req.files.file.path, path.join(outputDir, "application.keystore"));
            fse.removeSync(req.files.file.path);
        }
        // update properties file
        var propertiesFile = path.join(outputDir, "storyquest.properties");
        var properties = {};
        if (fs.existsSync(propertiesFile))
            properties = propertiesParser.parse(fs.readFileSync(propertiesFile, "utf8"));
        properties.KEYSTORE = config.projectsDirFromAndroidContext + "/" + projectId + "/" + "application.keystore";
        properties.STORE_PASSWORD = password;
        properties.KEY_PASSWORD = password;
        properties.KEY_ALIAS = alias;
        var propEditor = propertiesParser.createEditor();
        for (var property in properties)
            if (Object.hasOwnProperty.call(properties, property))
                propEditor.set(property, properties[property]);
        propEditor.save(propertiesFile, function() {
            return res.json(200, {});
        });
    } catch(err) {
        return res.json(500, {type: "REQUEST_FAILED", "message": err});
    }
};

exports.createAppKey = function(req, res){
    var projectId = req.param("projectId");
    var outputDir = Utils.getProjectDir(projectId);
    var alias = "storyquestkey";
    var password = Utils.uuid();
    try {
        // initiate key generation
        var filePath = path.join(outputDir, "application.keystore");
        if (fs.existsSync(filePath))
            fs.unlinkSync(filePath);
        var child = spawn("keytool", [
            "-genkey", "-v",
            "-keystore", "application.keystore",
            "-alias", alias,
            "-keyalg", "RSA",
            "-keysize", "2048",
            "-validity", "10000",
            "-storepass", password,
            "-keypass", password,
            "-dname", "cn=StoryQuest Developer, ou=None, o=None, c=DE",
        ], { cwd: outputDir });
        child.stdout.on("data", function(chunk) {
            console.log(chunk.toString());
        });
        child.stdout.on("close", function(exitCode, signal) {
            // update properties file
            var propertiesFile = path.join(outputDir, "storyquest.properties");
            var properties = {};
            if (fs.existsSync(propertiesFile))
                properties = propertiesParser.parse(fs.readFileSync(propertiesFile, "utf8"));
            properties.KEYSTORE = config.projectsDirFromAndroidContext + "/" + projectId + "/" + "application.keystore";
            properties.STORE_PASSWORD = password;
            properties.KEY_PASSWORD = password;
            properties.KEY_ALIAS = alias;
            var propEditor = propertiesParser.createEditor();
            for (var property in properties)
                if (Object.hasOwnProperty.call(properties, property))
                    propEditor.set(property, properties[property]);
            propEditor.save(propertiesFile, function() {
                return res.json(200, {});
            });
        });
        child.stdout.on("error", function(error) {
            console.log(error);
            return res.json(500, {type: "REQUEST_FAILED", "message": "key generation failed."});
        });
    } catch (err) {
        console.log(err);
        return res.json(500, {type: "REQUEST_FAILED", "message": "key generation startup failed."});
    }
};
