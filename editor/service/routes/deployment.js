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
var epubGenerator = require('epub-generator');
var PEG = require("pegjs");
var markdown = require("markdown").markdown;

var config;
var builds = {};

exports.registerServices = function(appConfig, app) {
    config = appConfig;
    // delete all builds
    if (fs.existsSync(config.artifactsPath))
        rimraf(config.artifactsPath, {}, function() {});
    app.get("/api/deployment/web/:projectId", authTokenOrUser, authProject, this.deployWeb);
    app.get("/api/deployment/android/:projectId", authTokenOrUser, authProject, this.deployAndroid);
    app.get("/api/deployment/epub/:projectId", authTokenOrUser, authProject, this.deployEPub);
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
        }  else if (builds[buildId].type==="epub") {
            if (!fs.existsSync(tempDirOrFile)) {
                // something happend, epub is not available
                builds[buildId].state = "failedNoArtifact";
                builds[buildId].exitcode = -1;
                builds[buildId].error = null;
            } else {
                var artifactName = path.join(config.artifactsPath, buildId + ".epub");
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

var createEPub = function(epubStream, projectId, buildId) {
    var outputDir = path.join(Utils.getProjectDir(projectId), "stationconfig");
    var files = fs.readdirSync(outputDir);
    var grammar = fs.readFileSync(path.join("template", "resources", "questml.peg")).toString();
    var pegjsParser = PEG.buildParser(grammar);
    var imageList = [];

    // FIXME: do not use just the file list here, but the sequence.json sequence!
    if (files) {
        var nodes = [];
        // step 1 - read all node data into array
        for (var i=0; i<files.length; i++)
            if (files[i].indexOf(".json")!=-1 && files[i].indexOf("~")==-1) {
                nodes.push(JSON.parse(fs.readFileSync(outputDir + "/" + files[i], "utf8")));
            }
        // step 2 - search for starting node and reorder array
        builds[buildId].log.push({
            timestamp: new Date().getTime(),
            progress: 5,
            chunk: "Searching for starting chapter..\n"
        });
        for (i=0; i<nodes.length; i++)
            if (nodes[i].isStartNode===true)
                nodes.splice(0, 0, nodes.splice(i, 1)[0]); // js wizard says: this removes the ith element and adds it back to the front
        // step 3 - add to epub
        for (i=0; i<nodes.length; i++) {
            var node = nodes[i];
            var texts = [];
            builds[buildId].log.push({
                timestamp: new Date().getTime(),
                progress: 5,
                chunk: "Creating chapter '" + node.title + "'..\n"
            });
            for (var language in node.text) {
                if (node.text.hasOwnProperty(language)) {
                    var text = fs.readFileSync(path.join(outputDir, node.text[language]), "utf8");
                    texts.push({ lang: language, text: text });
                }
            }
            // TODO: the following code only works for DE texts, make this more flexible with i18n
            var title = "Title not defined";
            if (node.title)
                title = node.title;
            else if (node.headerText)
                title = node.headerText.de;
            // preparse with pegjs
            var parsedText = [];
            for (var j=0; j<texts.length; j++)
                if (texts[j].lang == "de") {
                    // markdown parsing
                    var htmlText = markdown.toHTML(texts[j].text, "Gruber");
                    // pegjs parsing
                    var rawText = htmlText.replace(/&amp;/g, "&");
                    parsedText = pegjsParser.parse(rawText);
                }
            // postparse
            var html = '<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><title>' + title + '</title><link rel="stylesheet" href="epub.css"/></head><body>';
            for (var k=0; k<parsedText.length; k++) {
                html += parseQuestMLStatement(parsedText[k], imageList);
            }
            html+= '</body></html>';
            // prefixing files with 'a' to comply to epub standards (no numbers at start)
            epubStream.add("a" + node.id + '.xhtml', html, {
                title: title,
                toc: true
            });
        }
    }
    // return a list of all used images
    return imageList;
};

var parseQuestMLStatement = function(statement, imageList) {
    if (typeof statement==="string") {
        return statement;
    } else {
        var result;
        switch(statement.type) {
            case "expression":
                if (typeof statement.body == "object" && statement.body.type == "sequence")
                    // for epubs, always return first element in sequence
                    result = statement.body.content[0];
                else
                    result = "<p><b>EXPRESSIONS NOT SUPPORTED BY EPUB EXPORT</b></p>";
                break;
            case "command":
                var commandName = statement.command.name;
                var params = statement.command.params; // optional
                var body = statement.body; // may be array
                switch (commandName) {
                    case "image":
                        result = "<div class='image " + params[0] + "'><img src='" + body + "'/></div>";
                        if (imageList.indexOf(body)==-1)
                            imageList.push(body);
                        break;
                    case "box":
                        result = "<div class='box " + params[0] + "'>";
                        if (typeof body == "string")
                            result += body;
                        else
                            for (var j=0; j<body.length; j++)
                                result += parseQuestMLStatement(body[j]);
                        result += "</div>";
                        break;
                    case "link":
                        // links have an 'a' prefix to comply to epub standard (no numbers at start)
                        var target = params[0];
                        result = "<a class='choice' href='a" + target + ".xhtml'>" + body + "</a>";
                        break;
                    case "ilink":
                        // links have an 'a' prefix to comply to epub standard (no numbers at start)
                        var itarget = params[0];
                        result = "<a class='choice href='a" + itarget + ".xhtml'>" + body + "</a>";
                        break;
                    case "when":
                        if (params[0]==="isEbook")
                            if (typeof body == "string")
                                result = body;
                            else 
                                for (var i=0; i<body.length; i++)
                                    result += parseQuestMLStatement(body[i]);
                        else 
                            result = "";
                        break;
                    default:
                        result = "<!-- omitted not supported command '" + commandName + "' here -->";
                }
                break;
        }
        return result;
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
                var child = spawn("./gradlew", [ "-b", "build.gradle" ], { cwd: tempDir });
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

exports.deployEPub = function(req, res) {
    var projectId = req.param("projectId");
    var buildId = projectId + "_" + Utils.uuid();
    var settings = null;
    var jsonConfig = null;
    var propertiesFile = path.join(Utils.getProjectDir(req.param("projectId")), "storyquest.properties");
    var configFile = path.join(Utils.getProjectDir(req.param("projectId")), "storyquest.json");
    if (fs.existsSync(propertiesFile))
        settings = propertiesParser.parse(fs.readFileSync(propertiesFile, "utf8"));
    else
        return res.json(500, {type:"REQUEST_FAILED", "message":"Fatal error while accessing temp build directory properties."});
    if (fs.existsSync(configFile))
        jsonConfig = JSON.parse(fs.readFileSync(configFile, "utf8"));
    else
        return res.json(500, {type:"REQUEST_FAILED", "message":"Fatal error while accessing temp build directory config."});
    builds[buildId] = {
        buildId: buildId,
        type: "epub",
        state: "building",
        lastStateQuery: 0,
        label: settings.APP_LABEL,
        versionName: settings.APP_VERSION_NAME,
        versionCode: settings.APP_VERSION_CODE,
        appId: settings.APP_ID,
        log: []
    };
    Project.getByProjectId(projectId, function(err, project) {
        if (err) {
            return res.json(500, {type:"REQUEST_FAILED", "message":err});
        } else {
            try {
                // initiate build
                var epubFile = path.join(config.tempDir, buildId + ".epub");
                var epubStream = epubGenerator({
                    title: jsonConfig.name,
                    author: jsonConfig.author,
                    description: project.description,
                    rights: jsonConfig.publisher,
                    cover: "splash.jpg"
                });
                // add epub css
                builds[buildId].log.push({
                    timestamp: new Date().getTime(),
                    progress: 5,
                    chunk: "Adding epub css styles..\n"
                });
                if (fs.existsSync(path.join(Utils.getProjectDir(projectId), "css", "epub.css")))
                    epubStream.add("epub.css", fs.readFileSync(path.join(Utils.getProjectDir(projectId), "css", "epub.css")), {
                        toc: false
                    });
                else
                    epubStream.add("epub.css", fs.readFileSync(path.join("template", "css", "epub.css")), {
                        toc: false
                    });
                // add cover
                if (fs.existsSync(path.join(Utils.getProjectDir(projectId), "splash.jpg")))
                    epubStream.add("splash.jpg", fs.readFileSync(path.join(Utils.getProjectDir(projectId), "splash.jpg")), {
                        toc: false
                    });
                else
                    epubStream.add("splash.jpg", fs.readFileSync(path.join("template", "splash.jpg")), {
                        toc: false
                    });
                /*
                builds[buildId].log.push({
                    timestamp: new Date().getTime(),
                    progress: 5,
                    chunk: "Creating and adding cover page..\n"
                });
                if (fs.existsSync(path.join(Utils.getProjectDir(projectId), "bookcover.html")))
                    epubStream.add("bookcover.html", fs.readFileSync(path.join(Utils.getProjectDir(projectId), "bookcover.html")), {
                        toc: true,
                        title: "Cover"
                    });
                else
                    epubStream.add("bookcover.html", fs.readFileSync(path.join("template", "bookcover.html")), {
                        toc: true,
                        title: "Cover"
                    });
                */
                // add parsed HTML
                builds[buildId].log.push({
                    timestamp: new Date().getTime(),
                    progress: 5,
                    chunk: "Now starting to add content chapters..\n"
                });
                var imageList = createEPub(epubStream, projectId, buildId);
                // add resources, only jpg, png are supported, using the imageList returned above
                var imagesDir = path.join(Utils.getProjectDir(projectId), "images");
                var files = imageList;
                builds[buildId].log.push({
                    timestamp: new Date().getTime(),
                    progress: 5,
                    chunk: "Adding media resources..\n"
                });
                // Warning: no files from template/images are added to avoid unused images in the epub that will lead to KDP rejection!
                if (files)
                    for (var i=0; i<files.length; i++)
                        if (files[i].toLowerCase().endsWith(".jpg") || files[i].toLowerCase().endsWith(".png"))
                            epubStream.add("" + files[i], fs.readFileSync(path.join(imagesDir, files[i])), {
                                toc: false
                            });
                // finish build
                builds[buildId].log.push({
                    timestamp: new Date().getTime(),
                    progress: 5,
                    chunk: "Finishing build..\n"
                });
                epubStream.end(function() {
                    var timestamp = new Date().getTime();
                    builds[buildId].log.push({
                        timestamp: timestamp,
                        progress: 5,
                        chunk: "Archive created.\n"
                    });
                });
                var writeStream = fs.createWriteStream(epubFile);
                writeStream.on('close', function() {
                    finishBuildJob(buildId, projectId, 0, 0, epubFile);
                });
                epubStream.pipe(writeStream);
                epubStream.on('error', function(error) {
                    builds[buildId].state = "failedError";
                    builds[buildId].exitcode = -1;
                    builds[buildId].error = error;
                    builds[buildId].artifactPath = null;
                    cleanupBuildJob(buildId, null, epubFile, res);
                });
            } catch (err) {
                return res.json(500, {type:"REQUEST_FAILED", "message":err});
                builds[buildId].state = "failedException";
                builds[buildId].exitcode = -1;
                builds[buildId].error = err;
                builds[buildId].artifactPath = null;
                cleanupBuildJob(buildId, null, epubFile, res);
            }
            return res.json(200, {
                buildId: buildId
            });
        }
    });
};
