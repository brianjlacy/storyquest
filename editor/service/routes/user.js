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

var async = require("async");
var fs = require("fs");
var path = require("path");

var Project = require("../model/project.js");
var User = require("../model/user.js");

exports.registerServices = function(config, app) {
    app.get("/api/user", global.authUser, this.getActiveUser);
    app.get("/api/user/:username", global.authUser, this.getUser);
    app.get("/api/stats/:username/:projectId", global.authUser, global.authProject, this.getStats);
    app.post("/api/user/:username", global.authUser, this.updateUser);
};

exports.retrieveFullUserInfo = function(username, done) {
    User.getByUsername(username, function(err, user) {
        if (err)
            done(err, null);
        else {
            user.projects.sort();
            exports.addProjectInfoToUser(user, function(err, finalUser) {
                if (err)
                    done(err, null);
                else
                    done(null, finalUser);
            })
        }
    });
};

exports.countFiles = function(directory) {
    var files = [];
    files = fs.readdirSync(directory).length;
    for(var i in files) {
        if (!files.hasOwnProperty(i)) continue;
        var name = dir+'/'+files[i];
        if (fs.statSync(name).isDirectory()){
            getFiles(name,files_);
        }else{
            files_.push(name);
        }
    }
    return files_;
};

exports.getStats = function(req, res) {
    var username = req.param("username");
    var projectId = req.param("projectId");
    User.getByUsername(username, function(err, user) {
        if (err)
            return res.json(500, {type: "REQUEST_FAILED", "message":err});
        else {
            Project.getByProjectId(projectId, function(err, project) {
                if (err)
                    return res.json(500, {type: "REQUEST_FAILED", "message":err});
                else {
                    if (user && project) {
                        var feedbackCount = 0;
                        if (fs.existsSync(path.join(Utils.getProjectDir(projectId), "feedback.json")))
                            feedbackCount = JSON.parse(fs.readFileSync(path.join(Utils.getProjectDir(projectId), "feedback.json"), "utf8")).length;
                        var imageCount = 0;
                        if (fs.existsSync(path.join(Utils.getProjectDir(projectId), "images")))
                            imageCount = fs.readdirSync(path.join(Utils.getProjectDir(projectId), "images")).length
                        return res.json(200, {
                            projects: user.projects.length,
                            feedbacks: feedbackCount,
                            mediaobjects: imageCount,
                            nodetypes: project.nodetypes.length
                        })
                    }
                }
            });
        }
    });
};

exports.addProjectInfoToUser = function(user, done) {
    var projectIds = user.projects;
    user.projectInfos = [];
    if (projectIds)
        async.each(projectIds, function(projectId, callback) {
            Project.getByProjectId(projectId, function(err, project) {
                if (err)
                    callback(err);
                else {
                    if (!project) {
                        // project is referenced in the user record, but does not exist in database
                        callback("Project referenced in user record but does not exist: " + projectId);
                    } else {
                        // FIXME: the changed field interferes with the auto update, find out why
                        delete project.changed;
                        user.projectInfos.push(project);
                        callback();
                    }
                }
            });
        }, function(err){
            if (err)
                done("Error retrieving projects info for user:" + err, null);
            else
                done(null, user);
        });
};

exports.getActiveUser = function(req, res) {
    exports.retrieveFullUserInfo(req.user.username, function(err, user) {
        if (err) {
            return res.json(500, {type: "REQUEST_FAILED", "message":err});
        }
        else
            res.json(user);
    });
};

exports.getUser = function(req, res) {
    // TODO: this always retrieves the logged in user and ignores the get param. Fix this for admin operations
    if (req.param("username")===req.user.username) {
        exports.retrieveFullUserInfo(req.user.username, function(err, user) {
            if (err)
                return res.json(500, {type: "REQUEST_FAILED", "message":err});
            else
                res.json(user);
        })
    } else {
        return res.json(400, {type: "AUTH_FAILED", "message":"Unauthorized access to non-owned user."});
    }
};

exports.updateUser = function(req, res) {
    if (req.param("username")===req.user.username) {
        var updatedUser = req.body;
        if (!updatedUser)
            return res.json(500, {type: "REQUEST_FAILED", "message":"Empty request body."});
        else {
            // apply changes to session user! It is a copy!
            req.user.projects = updatedUser.projects;
            req.user.projects.sort();
            // save to database
            User.getByUsername(req.param("username"), function(err, user) {
                if (err) {
                    return res.json(500, {type: "REQUEST_FAILED", "message":err});
                } else {
                    user.updateData(updatedUser, function(err, saveInfo) {
                        if (err)
                            return res.json(500, {type: "REQUEST_FAILED", "message":err});
                        else {
                            exports.addProjectInfoToUser(user, function(err, finalUser) {
                                if (err)
                                    return res.json(500, {type: "REQUEST_FAILED", "message":err});
                                else
                                    return res.json(200, finalUser);
                            })
                        }
                    });
                }
            });
        }
    }
    else {
        return res.json(400, {type: "REQUEST_FAILED", "message":"Unauthorized access to non-owned user."});
    }
};
