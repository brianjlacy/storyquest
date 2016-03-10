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

var config = require(process.env.CONFIGFILE || "../config.json");

exports.uuid = function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + s4() + s4();
};

exports.retrieveProjectFile = function(projectPath, reqPath) {
    var projectFile = path.join(projectPath, reqPath);
    var templateFile = path.join(__dirname, ".." , "template", reqPath);
    if (fs.existsSync(projectFile))
        return projectFile;
    else if (fs.existsSync(templateFile))
        return templateFile;
    else
        return undefined;
};

exports.fileContentDifference = function(projectPath, reqPath, data) {
    var dataOnDisk = fs.readFileSync(Utils.retrieveProjectFile(projectPath, reqPath), "utf8");
    return dataOnDisk !== data;
};

exports.getProjectDir = function(projectId) {
    return path.join(config.projectsDir || path.join(__dirname, "projects"), projectId);
};

exports.mergeObjects = function(object1, object2) {
    var obj3 = {};
    for (var attrname in object1) { obj3[attrname] = object1[attrname]; }
    for (var attrname in object2) { obj3[attrname] = object2[attrname]; }
    return obj3;
};