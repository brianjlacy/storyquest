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

exports.registerServices = function(config, app) {
    app.get("/api/frame/:projectId/:type", authUser, authProject, this.getFrameAsset);
    app.post("/api/frame/:projectId/:type", authUser, authProject, this.storeFrameAsset);
};

exports.getFrameAsset = function(req, res) {
    var outputDir = Utils.getProjectDir(req.param("projectId"));
    var type = req.param("type");
    var asset = {};
    asset.type = type;
    asset.html = fs.readFileSync(Utils.retrieveProjectFile(outputDir, "station-html/" + req.param("type") + ".html"), "utf8");
    asset.css = fs.readFileSync(Utils.retrieveProjectFile(outputDir, "station-css/" + req.param("type") + ".css"), "utf8");
    asset.js = fs.readFileSync(Utils.retrieveProjectFile(outputDir, "station-js/" + req.param("type") + ".js"), "utf8");
    var globalJSFile = Utils.retrieveProjectFile(outputDir, "js/global.js");
    if (fs.existsSync(globalJSFile))
        asset.globaljs = fs.readFileSync(globalJSFile, "utf8");
    else
        asset.globaljs = "// Add global JavaScript definitions here\n// and include '../js/global.js' in your frame.\n// The global.js is the same for all chapter types!";
    return res.json(200, asset);
};

exports.storeFrameAsset = function(req, res) {
    var outputDir = Utils.getProjectDir(req.param("projectId"));
    try {
        // update preview
        preview.updateFrame(req.param("projectId"));

        // create directories if needed
        if (!fs.existsSync(path.join(outputDir, "station-html")))
            fs.mkdirSync(path.join(outputDir, "station-html"));
        if (!fs.existsSync(path.join(outputDir, "station-css")))
            fs.mkdirSync(path.join(outputDir, "station-css"));
        if (!fs.existsSync(path.join(outputDir, "station-js")))
            fs.mkdirSync(path.join(outputDir, "station-js"));
        if (!fs.existsSync(path.join(outputDir, "js")))
            fs.mkdirSync(path.join(outputDir, "js"));

        // store frame
        fs.writeFileSync(path.join(outputDir, "station-html", req.param("type") + ".html"), req.body.html);
        fs.writeFileSync(path.join(outputDir, "station-css", req.param("type") + ".css"), req.body.css);
        fs.writeFileSync(path.join(outputDir, "station-js", req.param("type") + ".js"), req.body.js);
        fs.writeFileSync(path.join(outputDir, "js/global.js"), req.body.globaljs);
        return res.json(200, {});
    }
    catch(err) {
        return res.json(500, {type:"REQUEST_FAILED", "message":err});
    }
};
