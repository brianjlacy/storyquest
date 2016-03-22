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

var preview = require("./liveupdateserver");

var editableFiles = [
    {
        id: "contentcss",
        path: "css/content.css",
        title: "Content CSS",
        description: "The text display styling.",
        type: "css"
    },
    {
        id: "globaljs",
        path: "js/global.js",
        title: "Global JS",
        description: "JavaScript that is available in all chapters.",
        type: "javascript"
    }
];

var dropinSkeleton = "<!--\n%NAME:$TITLE$\n%DESCRIPTION:$DESCRIPTION$\n-->\n";

var dropins = {};

exports.registerServices = function(config, app) {
    app.get("/api/frame/:projectId", authUser, authProject, this.getFrameResourceList);
    app.put("/api/frame", authUser, authProject, this.createDropin);
    app.get("/api/frame/:projectId/:id", authUser, authProject, this.getFrameAsset);
    app.post("/api/frame/:projectId/:id", authUser, authProject, this.storeFrameAsset);
};

exports.getResourceEntry = function(id, projectId) {
    for (var i=0; i<editableFiles.length; i++)
        if (editableFiles[i].id===id)
            return editableFiles[i];
    for (var j=0; j<dropins[projectId].length; j++)
        if (dropins[projectId][j].id===id)
            return dropins[projectId][j];
};

exports.getFrameResourceList = function(req, res) {
    var projectId = req.param("projectId");
    if (!dropins)
        dropins = {};
    // refresh dropin list index for this project
    dropins[projectId] = [];
    var outputDir = Utils.getProjectDir(req.param("projectId"));
    var dropinsFileList = Utils.retrieveDropinFiles(outputDir);
    for (var k=0; k<dropinsFileList.length; k++) {
        var dropinText = fs.readFileSync(Utils.retrieveProjectFile(outputDir, dropinsFileList[k]), "utf8");
        var dropinName = dropinText.match(/.*%NAME:(.*)$/gm);
        var dropinDescription = dropinText.match(/.*%DESCRIPTION:(.*)$/gm);
        dropins[projectId].push({
            id: "dropin" + Utils.hashNumber(dropinsFileList[k]),
            path: dropinsFileList[k],
            title: ("Dropin (" + dropinsFileList[k].replace("resources/", "").replace(".dropin", "") + "): " + dropinName).replace("%NAME:", ""),
            description: ("" + dropinDescription).replace("%DESCRIPTION:", ""),
            type: "html"
        });
    }
    var editableFilesWithDropins = [];
    for (var i=0; i<editableFiles.length; i++)
        editableFilesWithDropins.push(editableFiles[i]);
    for (var j=0; j<dropins[projectId].length; j++)
        editableFilesWithDropins.push(dropins[projectId][j]);
    return res.json(200, editableFilesWithDropins);
};

exports.getFrameAsset = function(req, res) {
    var projectId = req.param("projectId");
    var outputDir = Utils.getProjectDir(req.param("projectId"));
    var id = req.param("id");
    var resourceEntry = exports.getResourceEntry(id, projectId);
    if (!resourceEntry)
        return res.json(500, {type:"REQUEST_FAILED", "message":"no such resource id"});
    resourceEntry.data = fs.readFileSync(Utils.retrieveProjectFile(outputDir, resourceEntry.path), "utf8");
    return res.json(200, resourceEntry);
};

exports.createDropin = function(req, res) {
    var projectId = req.param("projectId");
    var outputDir = Utils.getProjectDir(projectId);
    var title = req.param("title");
    var description = req.param("description");

    try {
        var newDropinText = dropinSkeleton.replace("$TITLE$", title).replace("$DESCRIPTION$", description);
        var dropinPath = path.join("resources", title + ".dropin");
        fs.writeFileSync(path.join(outputDir, dropinPath), newDropinText);
        res.json(
            {
                id: "dropin" + Utils.hashNumber(dropinPath),
                path: dropinPath,
                title: title,
                description: description,
                type: "html",
                data: newDropinText
            }
        );
    } catch (err) {
        console.log(err);
        res.status(500);
        res.json(err);
    }
};

exports.storeFrameAsset = function(req, res) {
    var projectId = req.param("projectId");
    var outputDir = Utils.getProjectDir(req.param("projectId"));
    var id = req.param("id");

    var resourceEntry = exports.getResourceEntry(id, projectId);
    if (!resourceEntry)
        return res.json(500, {type:"REQUEST_FAILED", "message":"no such resource id"});

    try {
        // update preview
        preview.updateFrame(req.param("projectId"));

        // create directories if needed
        if (!fs.existsSync(path.join(outputDir, "js")))
            fs.mkdirSync(path.join(outputDir, "js"));
        if (!fs.existsSync(path.join(outputDir, "css")))
            fs.mkdirSync(path.join(outputDir, "css"));
        if (!fs.existsSync(path.join(outputDir, "resources")))
            fs.mkdirSync(path.join(outputDir, "resources"));

        // store frame
        // TODO: only write files if they differ from the default template
        if (Utils.fileContentDifference(outputDir, resourceEntry.path, req.body.data))
            fs.writeFileSync(path.join(outputDir, resourceEntry.path), req.body.data);
        return res.json(200, {});
    }
    catch(err) {
        return res.json(500, {type:"REQUEST_FAILED", "message":err});
    }
};
