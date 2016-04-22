#!/usr/bin/env node

/*
 * StoryQuest
 * Copyright (c) 2013 Questor GmbH
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

var config = require(process.env.CONFIGFILE || "./config.json");
var fs = require("fs");
var ncp = require("ncp").ncp;
var program = require("commander");
var winston = require("winston");
global.logger = new (winston.Logger)({
    transports: [
        new winston.transports.Console({ level: "error" }),
        new winston.transports.File({ filename: config.logfile })
    ],
    exceptionHandlers: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: config.exceptionlogfile })
    ]
});

global.Utils = require("./service/utils");
var DatabaseClass = require("./service/database");
global.Database = new DatabaseClass(config).db;
var Project = require("./service/model/project.js");
var User = require("./service/model/user.js");

program
    .version('0.0.1')
    .option("-u, --username <username>", "The new username")
    .option("-p, --password <password>", "The new user\'s password")
    .option("-c, --projectid <projectid>", "The project to clone for the new user")
    .parse(process.argv);

if (program.username && program.password && program.projectid) {
    User.getByUsername(program.username, function(err, user) {
        if (user==null) {
            Project.createInDatabase("Example Project", "Example Description", "", "", program.username, function(dberr, result) {
                if (dberr)
                    console.log("Error storing in database: " + dberr);
                else {
                    var projectId = result.id;
                    var templateProjectDir = Utils.getProjectDir(program.projectid);
                    var projectDir = Utils.getProjectDir(projectId);
                    fs.mkdirSync(projectDir);
                    console.log("Created project dir: " + projectDir);
                    ncp(templateProjectDir + "/", projectDir, function (err) {
                        if (err) {
                            console.log("Error writing to disk: " + err);
                        } else {
                            User.createInDatabase("New User", program.username, program.password, false, function(err, newUser) {
                                User.addProject(program.username, projectId, function (userErr) {
                                    if (userErr)
                                        console.log("Error creating user: " + err);
                                    else
                                        console.log("Created user " + newUser.username + " and project " + projectId);
                                })
                            });
                        }
                    });
                }
            })
        } else
            console.log("user already exists!");
    });
} else
    console.log("username, password and projectid must be given!");

