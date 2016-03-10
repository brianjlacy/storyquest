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

var Project = require("../model/project");
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

exports.registerServices = function(config, app) {
    app.get("/api/frame/:projectId", authUser, authProject, this.getFrameResourceList);
    app.get("/api/frame/:projectId/:id", authUser, authProject, this.getFrameAsset);
    app.post("/api/frame/:projectId/:id", authUser, authProject, this.storeFrameAsset);
};

exports.getResourceEntry = function(id) {
    for (var i=0; i<editableFiles.length; i++)
        if (editableFiles[i].id===id)
            return editableFiles[i];
};

exports.getFrameResourceList = function(req, res) {
    return res.json(200, editableFiles);
};

exports.getFrameAsset = function(req, res) {
    var outputDir = Utils.getProjectDir(req.param("projectId"));
    var id = req.param("id");

    var resourceEntry = exports.getResourceEntry(id);
    if (!resourceEntry)
        return res.json(500, {type:"REQUEST_FAILED", "message":"no such resource id"});

    resourceEntry.data = fs.readFileSync(Utils.retrieveProjectFile(outputDir, resourceEntry.path), "utf8");
    return res.json(200, resourceEntry);
};

exports.storeFrameAsset = function(req, res) {
    var outputDir = Utils.getProjectDir(req.param("projectId"));
    var id = req.param("id");

    var resourceEntry = exports.getResourceEntry(id);
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
