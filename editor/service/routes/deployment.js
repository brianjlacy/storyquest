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

var fs = require("fs");
var fse = require("fs-extra");
var path = require("path");
var archiver = require("archiver");
var ncp = require("ncp").ncp;
var async = require("async");
var sys = require("sys");
var rimraf = require("rimraf");
var spawn = require('child_process').spawn;
var propertiesParser = require("properties-parser");

var config;
var builds = {};

exports.registerServices = function(appConfig, app) {
    config = appConfig;
    // delete all builds
    if (fs.existsSync(config.artifactsPath))
        rimraf(config.artifactsPath, {}, function() {});
    app.get("/api/deployment/web/:projectId", authTokenOrUser, authProject, this.deployWeb);
    app.get("/api/deployment/android/:projectId", authTokenOrUser, authProject, this.deployAndroid);
    app.get("/api/deployment/state/:projectId/:buildId", authTokenOrUser, authProject, this.deployState);
    app.get("/api/download/:projectId/:buildId", authTokenOrUser, authProject, this.downloadArtifact);
};

var cleanupBuildJob = function(buildId, tempDir, tempFile, res) {
    try {
        if (tempDir)
            rimraf(tempDir, {}, function() {});
        else if (tempFile)
            fs.unlinkSync(tempFile);
    } catch (err) {
        if (res)
            res.json(500, {type:"REQUEST_FAILED", "message":err});
    }
};

var finishBuildJob = function(buildId, projectId, exitCode, signal, tempDirOrFile) {
    if (exitCode) {
        // error occured
        builds[buildId].state = "failedClose";
        builds[buildId].exitcode = exitCode;
        builds[buildId].error = null;
        builds[buildId].artifactPath = null;
    } else {
        // success
        builds[buildId].state = "finished";
        builds[buildId].exitcode = exitCode;
        builds[buildId].error = null;

        // create artifacts directory if necessary
        if (!fs.existsSync(config.artifactsPath))
            fs.mkdirSync(config.artifactsPath);

        // move artifact to artifact path
        if (builds[buildId].type==="android") {
            var apkPath = path.join(tempDirOrFile, buildId, config.androidArtifactPath);
            if (!fs.existsSync(apkPath)) {
                // something happend, apk is not available
                builds[buildId].state = "failedNoArtifact";
                builds[buildId].exitcode = -1;
                builds[buildId].error = null;
            } else {
                var artifactName = path.join(config.artifactsPath, buildId + ".apk");
                // dont use rename here, because rename breaks when files are on different filesystems
                fse.copySync(apkPath, artifactName);
                fse.removeSync(apkPath);
                builds[buildId].artifactPath = artifactName;
                builds[buildId].artifactWebPath = "/api/download/" + projectId + "/" + buildId;
            }
            cleanupBuildJob(buildId, tempDirOrFile);
        } else if (builds[buildId].type==="web") {
            if (!fs.existsSync(tempDirOrFile)) {
                // something happend, zip is not available
                builds[buildId].state = "failedNoArtifact";
                builds[buildId].exitcode = -1;
                builds[buildId].error = null;
            } else {
                var artifactName = path.join(config.artifactsPath, buildId + ".zip");
                // dont use rename here, because rename breaks when files are on different filesystems
                fse.copySync(tempDirOrFile, artifactName);
                fse.removeSync(tempDirOrFile);
                builds[buildId].artifactPath = artifactName;
                builds[buildId].artifactWebPath = "/api/download/" + projectId + "/" + buildId;
            }
            cleanupBuildJob(buildId, null, tempDirOrFile);
        }
    }
};

exports.downloadArtifact = function(req, res) {
    var buildId = req.param("buildId");
    var file = builds[buildId].artifactPath;
    res.download(file);
};

exports.deployState = function(req, res) {
    var projectId = req.param("projectId");
    var buildId = req.param("buildId");
    var currentTimestamp = new Date().getTime();
    if (!builds[buildId])
        return res.json(500, {type:"REQUEST_FAILED", "message":"No such build id."});
    var incrementText = "";
    var percent = 0;
    for (var i=0; i<builds[buildId].log.length; i++) {
        percent += builds[buildId].log[i].progress;
        if (builds[buildId].log[i].timestamp>builds[buildId].lastStateQuery)
            incrementText = incrementText + builds[buildId].log[i].chunk;
    }
    builds[buildId].lastStateQuery = currentTimestamp;
    return res.json(200, {
        buildId: buildId,
        type: builds[buildId].type,
        text: incrementText,
        percent: percent,
        state: builds[buildId].state,
        error: builds[buildId].error,
        artifactPath: builds[buildId].artifactPath,
        artifactWebPath: builds[buildId].artifactWebPath,
        label: builds[buildId].label,
        versionName: builds[buildId].versionName,
        versionCode: builds[buildId].versionCode,
        appId: builds[buildId].appId
    });
};

exports.deployWeb = function(req, res) {
    var projectId = req.param("projectId");
    var buildId = projectId + "_" + Utils.uuid();
    var settings = null;
    var propertiesFile = path.join(Utils.getProjectDir(req.param("projectId")), "storyquest.properties");
    if (fs.existsSync(propertiesFile))
        settings = propertiesParser.parse(fs.readFileSync(propertiesFile, "utf8"));
    else
        return res.json(500, {type:"REQUEST_FAILED", "message":"Fatal error while accessing temp build directory."});
    builds[buildId] = {
        buildId: buildId,
        type: "web",
        state: "building",
        lastStateQuery: 0,
        label: settings.APP_LABEL,
        versionName: settings.APP_VERSION_NAME,
        versionCode: settings.APP_VERSION_CODE,
        appId: settings.APP_ID,
        log: []
    };
    try {
        // initiate build
        var archiveFile = path.join(config.tempDir, buildId + ".zip");
        var output = fs.createWriteStream(archiveFile);
        var archive = archiver("zip");
        output.on("close", function () {
            var timestamp = new Date().getTime();
            builds[buildId].log.push({
                timestamp: timestamp,
                progress: 5,
                chunk: "Archive created."
            });
            finishBuildJob(buildId, projectId, 0, 0, archiveFile);
        });
        archive.on('error', function(err) {
            builds[buildId].state = "failedError";
            builds[buildId].exitcode = -1;
            builds[buildId].error = error;
            builds[buildId].artifactPath = null;
            cleanupBuildJob(buildId, null, archiveFile, res);
        });
        archive.pipe(output);
        archive.bulk([
            { expand: true, cwd: "template/", src: ["**"], dest: "."}
        ]);
        archive.bulk([
            { expand: true, cwd: Utils.getProjectDir(projectId), src: ["**"], dest: "."}
        ]);
        archive.finalize();
    } catch (err) {
        builds[buildId].state = "failedException";
        builds[buildId].exitcode = -1;
        builds[buildId].error = err;
        builds[buildId].artifactPath = null;
        cleanupBuildJob(buildId, null, archiveFile, res);
    }
    return res.json(200, {
        buildId: buildId
    });
};

exports.deployAndroid = function(req, res) {
    var projectId = req.param("projectId");
    // copy android source to temp location
    var buildId = projectId + "_" + Utils.uuid();
    var tempDir = path.join(config.tempDir, buildId);

    var settings = null;
    var propertiesFile = path.join(Utils.getProjectDir(req.param("projectId")), "storyquest.properties");
    if (fs.existsSync(propertiesFile))
        settings = propertiesParser.parse(fs.readFileSync(propertiesFile, "utf8"));
    else
        return res.json(500, {type:"REQUEST_FAILED", "message":"Fatal error while accessing temp build directory."});
    builds[buildId] = {
        buildId: buildId,
        type: "android",
        state: "building",
        lastStateQuery: 0,
        label: settings.APP_LABEL,
        versionName: settings.APP_VERSION_NAME,
        versionCode: settings.APP_VERSION_CODE,
        appId: settings.APP_ID,
        log: []
    };
    fs.mkdirSync(tempDir);
    ncp(config.androidBuildDir + "/", tempDir, function (err) {
        if (err) {
            return res.json(500, {type:"REQUEST_FAILED", "message":err});
        } else {
            try {
                // initiate build
                var child = spawn("./gradlew", [ "-b", "build-test.gradle" ], { cwd: tempDir });
                builds[buildId].process = child;
                child.stdout.on("data", function(chunk) {
                    var timestamp = new Date().getTime();
                    builds[buildId].log.push({
                        timestamp: timestamp,
                        progress: 5,
                        chunk: chunk
                    });
                });
                child.stdout.on("exit", function(exitCode, signal) {
                    finishBuildJob(buildId, projectId, exitCode, signal, config.tempDir);
                });
                child.stdout.on("error", function(error) {
                    builds[buildId].state = "failedError";
                    builds[buildId].exitcode = -1;
                    builds[buildId].error = error;
                    builds[buildId].artifactPath = null;
                    cleanupBuildJob(buildId, tempDir, null, res);
                });
                child.stdout.on("close", function(exitCode, signal) {
                    finishBuildJob(buildId, projectId, exitCode, signal, config.tempDir);
                });
            } catch (err) {
                builds[buildId].state = "failedException";
                builds[buildId].exitcode = -1;
                builds[buildId].error = err;
                builds[buildId].artifactPath = null;
                cleanupBuildJob(buildId, tempDir, null, res);
            }
        }
    });
    return res.json(200, {
        buildId: buildId
    });
};