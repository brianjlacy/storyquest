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

var config = require(process.env.CONFIGFILE || "../../config.json");

var fs = require("fs");
var path = require("path");
var ncp = require('ncp').ncp;

var nodetypes = require("../logic/nodetypes.js");

exports = module.exports = Project;

function Project() {
    this.id = "project_" + Utils.uuid();
    this.deleted = false;
    this.nodetypes = [];
    this.testKey = Utils.uuid();
    this.apiKey = Utils.uuid();
    this.created = new Date();
    this.changed = new Date();
    this.status = "new";
    this.coverimage = "";
    this.betaActive = false;
    this.ratings = [];
    this.comments = [];
}

Project.prototype.id = null;
Project.type = "project";
Project.deleted = null;
Project.prototype.name = null;
Project.prototype.nodetypes = null;
Project.prototype.testKey = null;
Project.prototype.apiKey = null;
Project.created = null;
Project.changed = null;
Project.description = null;
Project.author = null;
Project.tags = null;
Project.coverimage = null;
Project.betaActive = true;
Project.status = null;
Project.price = undefined;
Project.currency = "EUR";
Project.ratings = null;
Project.comments = null;

Project.prototype.updateData = function(updatedProject, done) {
    if (updatedProject.name) this.name = updatedProject.name;
    if (updatedProject.nodetypes) this.nodetypes = updatedProject.nodetypes;
    if (updatedProject.testKey) this.testKey = updatedProject.testKey;
    if (updatedProject.apiKey) this.apiKey = updatedProject.apiKey;
    this.changed = new Date();
    if (updatedProject.description) this.description = updatedProject.description;
    if (updatedProject.author) this.author = updatedProject.author;
    if (updatedProject.tags) this.tags = updatedProject.tags;
    if (updatedProject.coverimage) this.coverimage = updatedProject.coverimage;
    if (updatedProject.betaActive) this.betaActive = true; else this.betaActive = false;
    if (updatedProject.status) this.status = updatedProject.status;
    if (updatedProject.price) this.price = updatedProject.price;
    if (updatedProject.currency) this.currency = updatedProject.currency;
    if (updatedProject.ratings) this.ratings = updatedProject.ratings;
    if (updatedProject.comments) this.comments = updatedProject.comments;
    Database.save(this.id, this._rev, this, done);
};

Project.prototype.save = function(done) {
    Database.save(this.id, this._rev, Project.toJSON(this), function (err, res) {
        if (err)
            done(err);
        else
            done(null);
    });
};

// FIXME: this is supposed to create needed database views but get never called
Project.databaseInit = function() {
    Database.save('_design/project', {
        byProjectId: {
            map: function (doc) {
                if (doc._id && doc.deleted==false) emit(doc._id, doc);
            }
        },
        byTestKey: {
            map: function (doc) {
                if (doc.testKey && doc.deleted==false) emit(doc.testKey, doc);
            }
        },
        byApiKey: {
            map: function (doc) {
                if (doc.apiKey && doc.deleted==false) emit(doc.apiKey, doc);
            }
        },
        byStatus: {
            map: function (doc) {
                if (doc.status && doc.deleted==false) emit(doc.status, doc);
            }
        }
    });
};

Project.exists = function(projectId, done) {
    Project.getByProjectId(projectId, function(err, project) {
        if (project!=null)
            done(true);
        else
            done(false);
    })
};

Project.getByProjectId = function(projectId, done) {
    Database.view('project/byProjectId', { key: projectId }, function (err, doc) {
        if (err || !doc || doc.length!=1)
            done(err, null);
        else
            done(err, Project.fromJSON(doc[0].value));
    });
};

Project.getByTestKey = function(testKey, done) {
    Database.view('project/byTestKey', { key: testKey }, function (err, doc) {
        if (err || !doc || doc.length!=1)
            done(err, null);
        else
            done(err, Project.fromJSON(doc[0].value));
    });
};

Project.getByApiKey = function(apiKey, done) {
    Database.view('project/byApiKey', { key: apiKey }, function (err, doc) {
        if (err || !doc || doc.length!=1)
            done(err, null);
        else
            done(err, Project.fromJSON(doc[0].value));
    });
};

Project.getByStatus = function(status, done) {
    Database.view('project/byStatus', { key: status }, function (err, doc) {
        if (err || !doc)
            done(err, null);
        else {
            var result = [];
            for (var i=0; i<doc.length; i++)
                result.push(Project.fromJSON(doc[i].value));
            done(err, result);
        }
    });
};

Project.fromJSON = function(dbDoc) {
    var project = new Project();
    project.id = dbDoc._id;
    project._rev = dbDoc._rev;
    project.name = dbDoc.name;
    project.type = dbDoc.type;
    project.testKey = dbDoc.testKey;
    project.apiKey = dbDoc.apiKey;
    project.nodetypes = dbDoc.nodetypes;
    project.deleted = dbDoc.deleted;
    project.created = dbDoc.created;
    project.changed = dbDoc.changed;
    project.description = dbDoc.description;
    project.author = dbDoc.author;
    project.tags = dbDoc.tags;
    project.coverimage = dbDoc.coverimage;
    project.betaActive = dbDoc.betaActive;
    project.status = dbDoc.status;
    project.price = dbDoc.price;
    project.currency = dbDoc.currency;
    project.ratings = dbDoc.ratings;
    project.comments = dbDoc.comments;
    return project;
};

Project.toJSON = function(project) {
    var dbDoc = {};
    if (project.id)
        dbDoc._id = project.id;
    if (project._rev)
        dbDoc._rev = project._rev;
    dbDoc.name = project.name;
    dbDoc.type = project.type;
    dbDoc.testKey = project.testKey;
    dbDoc.apiKey = project.apiKey;
    dbDoc.nodetypes = project.nodetypes;
    dbDoc.deleted = project.deleted;
    dbDoc.created = project.created;
    dbDoc.changed = project.changed;
    dbDoc.description = project.description;
    dbDoc.author = project.author;
    dbDoc.tags = project.tags;
    dbDoc.coverimage = project.coverimage;
    dbDoc.betaActive = project.betaActive;
    dbDoc.status = project.status;
    dbDoc.price = project.price;
    dbDoc.currency = project.currency;
    dbDoc.ratings = project.ratings;
    dbDoc.comments = project.comments;
    return dbDoc;
};

Project.createInDatabase = function(name, description, tags, context, author, done) {
    var newProject = new Project();
    newProject.name = name;
    newProject.nodetypes = nodetypes.getAvailableNodeTypes(context);
    newProject.description = description;
    newProject.tags = tags;
    newProject.ratings = [];
    newProject.comments = [];
    newProject.status = "new";
    newProject.author = author;
    Database.save(Project.toJSON(newProject), function (err, res) {
        if (err) {
            logger.error("Error storing new project to database: " + JSON.stringify(err) + " " + JSON.stringify(newProject));
            done(err, null);
        } else {
            logger.info("Created project " + newProject.id);
            done(null, res);
        }
    });
};

Project.delete = function(projectId, done) {
    Project.getByProjectId(projectId, function(err, project) {
        if (err)
            done(err);
        else {
            Database.remove(project.id, project._rev, function(err, res) {
                done(err);
            })
        }
    })
};

Project.createProjectDirectory = function(project, context) {
    // FIXME: up the chain, make sure project.id does not contain .,/,\
    var projectDir = Utils.getProjectDir(project.id);
    fs.mkdirSync(projectDir);
    fs.mkdirSync(path.join(projectDir, "stationconfig"));
    fs.mkdirSync(path.join(projectDir, "images"));
    if (context) {
        var contextTemplatePath = path.join(__dirname, "..", "..", "templates-context", context);
        if (fs.existsSync(contextTemplatePath)) {
            ncp(contextTemplatePath, projectDir, function (err) {
                if (err) {
                    logger.error("Error copying context template " + context);
                } else {
                    logger.info("Copied context template " + context + " for project " + project.id);
                }
            });
        }
    }
};
