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

var fs = require('fs');
var path = require("path");

var Project = require("../model/project");

exports.registerServices = function(config, app) {
    // public routes
    app.get("/api/storefeedback/:testKey", this.storeFeedback);
    app.get("/api/betatest/:testkey", this.betatest);
    // protected routes
    app.get("/api/feedback/:projectId", authUser, authProject, this.getFeedback);
};

exports.betatest = function(req, res) {
    Project.getByTestKey(req.param("testkey"), function(err, project) {
         if (err) {
            return res.json(500, {type:"REQUEST_FAILED", "message":err});
         } else {
            res.json(200, {"betaActive": project && project.betaActive});
         }
    });
}

exports.storeFeedback = function(req, res) {
    var testKey = req.param("testKey");
    Project.getByTestKey(testKey, function(err, project) {
        if (err)
            return res.json(500, {type:"REQUEST_FAILED", "message":"Error retrieving project info."});
        else {
            var iNFeedback = {
                projectId: project.id,
                position: req.param("position"),
                sender: req.param("sender"),
                message: req.param("message"),
                date: new Date()
            };
            var feedbackFile = Utils.getProjectDir(project.id) + "/feedback.js";
            var feedback = [];
            try {
                if (fs.existsSync(feedbackFile))
                    feedback = JSON.parse(fs.readFileSync(feedbackFile, "utf8"));
                feedback.push(iNFeedback);
                fs.writeFileSync(feedbackFile, JSON.stringify(feedback));
            } catch (err) {
                return res.json(500, {type:"REQUEST_FAILED", "message":err});
            }
            return res.json(200, {});
        }
    });
};

exports.getFeedback = function(req, res) {
    var projectId = req.param("projectId");
    var feedbackFile = Utils.getProjectDir(projectId) + "/feedback.js";
    var feedback = [];
    var result = [];
    try {
        if (fs.existsSync(feedbackFile))
            feedback = JSON.parse(fs.readFileSync(feedbackFile, "utf8"));
        var currentDate = 0;
        for (var i=0; i<feedback.length; i++) {
            var thisItem = feedback[i];
            var thisDate = Date.parse(thisItem.date);
            if (thisDate>currentDate && thisDate-currentDate>86400000) {
                var dateTime = new Date(thisDate);
                result.push({ date: dateTime.getDate() + "-" + (dateTime.getMonth()+1) + "-" + dateTime.getFullYear(), type: "date" });
                currentDate = thisDate;
            }
            var dateEntry = new Date(thisDate);
            result.push({ date: dateEntry.getHours() + ":" + dateEntry.getMinutes(), type: "entry", sender: thisItem.sender, message: thisItem.message, position: thisItem.position });
        }
    } catch (err) {
        return res.json(500, {type:"REQUEST_FAILED", "message":err});
    }
    return res.json(result.reverse());
};
