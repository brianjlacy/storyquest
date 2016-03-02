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
var path = require("path");
var archiver = require("archiver");
var ncp = require("ncp").ncp;
var async = require("async");
var sys = require("sys");
var exec = require("child_process").exec;
var rimraf = require("rimraf");

var config;

exports.registerServices = function(appConfig, app) {
    config = appConfig;
    app.get("/api/deployment/web/:projectId", authTokenOrUser, authProject, this.deployWeb);
    app.get("/api/deployment/android/:projectId", authTokenOrUser, authProject, this.deployAndroid);
    app.get("/api/download/:projectId", authTokenOrUser, libraryProject, this.deployWeb);
};

exports.deployWeb = function(req, res) {
    var projectId = req.param("projectId");
    var archiveFile = path.join(config.tempDir, projectId + "_" + Utils.uuid() + ".zip")

    var output = fs.createWriteStream(archiveFile);
    var archive = archiver("zip");

    output.on("close", function () {
        res.writeHead(200, { "Content-Type": "application/zip" });
        var zip = fs.readFileSync(archiveFile);
        fs.unlinkSync(archiveFile);
        return res.end(zip, "binary");
    });

    archive.on('error', function(err) {
        return res.json(500, {type:"REQUEST_FAILED", "message":err});
    });

    archive.pipe(output);
    archive.bulk([
        { expand: true, cwd: "template/", src: ["**"], dest: "."}
    ]);
    archive.bulk([
        { expand: true, cwd: Utils.getProjectDir(projectId), src: ["**"], dest: "."}
    ]);
    archive.finalize();
};

exports.deployAndroid = function(req, res) {
    // FIXME: MAKE ABOLUTELY SURE THERE IS NOTHING EVIL IN THE GET PARAMS!!
    var projectId = req.param("projectId");
    var tempDir = path.join(config.tempDir, projectId + "_" + Utils.uuid());
    var archiveFile = path.join(config.tempDir, projectId + "_" + Utils.uuid() + ".apk")
    var signedFile = path.join(config.tempDir, projectId + "_" + Utils.uuid() + "_signed.apk")

    var archive = archiver("zip");
    archive.on('error', function(err) {
        return res.json(500, {type:"REQUEST_FAILED", "message":err});
    });

    var output = fs.createWriteStream(archiveFile);
    output.on("close", function () {
        var jarsigner = "jarsigner -verbose -keystore " +
            config.androidKeystore +
            " -keypass " +
            config.androidKeyStoreKeyPass +
            " -storepass " +
            config.androidKeyStoreStorePass +
            " -signedjar " +
            signedFile +
            " " +
            archiveFile +
            " " +
            config.androidKeyStoreAlias;
        exec(jarsigner, { maxBuffer: 10000*1024}, function(error, stdout, stderr) {
            if (error || stderr)
                return res.json(500, {type:"REQUEST_FAILED", "message":error + stderr});
            else {
                res.setHeader("Content-disposition", "attachment; filename=" + projectId + ".apk");
                res.writeHead(200, { "Content-Type": "application/vnd.android.package-archive" });
                var zip = fs.readFileSync(signedFile);
                fs.unlinkSync(archiveFile);
                fs.unlinkSync(signedFile);
                rimraf(tempDir, function(err) {
                    if (err)
                        return res.json(500, {type:"REQUEST_FAILED", "message":err});
                    else
                        return res.end(zip, "binary");
                });
            }
        });
    });

    // copy path
    fs.mkdirSync(tempDir);
    async.series([
            function(callback){
                ncp("arches/android/", tempDir, function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            },
            function(callback){
                ncp("template/", path.join(tempDir, "assets"), function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            },
            function(callback){
                ncp(Utils.getProjectDir(projectId) + "/", path.join(tempDir, "assets"), function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            }
        ],
        function(err){
            if (err)
                return res.json(500, {type:"REQUEST_FAILED", "message":err});
            else {
                archive.pipe(output);
                archive.bulk([
                    { expand: true, cwd: tempDir, src: ["**"], dest: "."}
                ]);
                archive.finalize();
            }
        });
};