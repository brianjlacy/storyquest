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

exports.registerServices = function(config, app) {
    app.get("/api/media/:projectId", authUser, authProject, this.getMediaList);
    app.delete("/api/media/:projectId/:mediaId", authUser, authProject, this.deleteMedia);
    app.put("/api/media/:projectId", authUser, authProject, this.putMedia);
};

exports.getMediaList = function(req, res) {
    var outputDir = path.join(Utils.getProjectDir(req.param("projectId")), "images");
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    var files = fs.readdirSync(outputDir);
    var imageList = [];
    for (var i=0; i<files.length; i++) {
        var filenameEncoded =  encodeURI(files[i]);
        filenameEncoded = filenameEncoded.replace('(','%28').replace(')','%29');
        imageList.push(path.join("api/p", req.param("projectId"), "images", filenameEncoded));
    }
    return res.json(200, imageList);
};

exports.deleteMedia = function(req, res) {
    var outputDir = path.join(Utils.getProjectDir(req.param("projectId")), "images");
    try {
        fs.unlinkSync(path.join(outputDir, req.param("mediaId")));
        return res.json(200, {});
    } catch(err) {
        return res.json(500, {type:"REQUEST_FAILED", "message":err});
    }
};

exports.putMedia = function(req, res){
    var outputDir = path.join(Utils.getProjectDir(req.param("projectId")), "images");
    logger.info("put media: outputDir " + outputDir);
    try {
        logger.info("req.files.file.length " + JSON.stringify(req.files));
        if(req.files.file.length) {
           for (var i=0; i<req.files.file.length; i++)
                fs.renameSync(req.files.file[i].path, path.join(outputDir, req.files.file[i].originalFilename));
            res.json(200, {});
        } else {
            // we need to copy and unlink when moving files across different partitions
            // see: http://stackoverflow.com/questions/4568689/how-do-i-move-file-a-to-a-different-partition-or-device-in-node-js
            var is = fs.createReadStream(req.files.file.path);
            var os = fs.createWriteStream(path.join(outputDir, req.files.file.originalFilename));
            is.pipe(os);
            is.on('end',function() {
                fs.unlinkSync(req.files.file.path);
            });
            res.json(200, {});
        }
    } catch(err) {
        return res.json(500, {type:"REQUEST_FAILED", "message":err});
    }
};
