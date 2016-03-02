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
var crypt = require("crypto-js");
var path = require("path");
var mailer = require("campaign")({
    "mandrill": {
        "apiKey": config.smtpPassword,
        "debug": false
    },
    "from": "info@storyquest.de"
});

var Project = require("../model/project.js");

exports = module.exports = User;

function User() {
    this.id = "user_" + Utils.uuid();
    this.credentials = {};
    this.tags = [];
    this.projects = [];
    this.library = [];
    this.transactions = [];
}

User.type = "user";
User.prototype.username = null;
User.prototype.name = null;
User.prototype.password = null;
User.prototype.projects = null;
User.prototype.library = null;
User.prototype.credentials = null;
User.prototype.tags = null;
User.prototype.transactions = null;
User.authtoken = null;
User.passwordResetToken = null;
User.confirmationToken = null;
User.context = null;

User.prototype.updateData = function(updatedUser, done) {
    this.projects = updatedUser.projects;
    this.projects.sort();
    Database.save(this.id, this._rev, this, done);
};

User.prototype.setPassword = function(password) {
    this.password = crypt.SHA256(password).toString();
};

User.prototype.save = function(done) {
    Database.save(this.id, this._rev, this, function (err, res) {
        if (err)
            done(err);
        else
            done(null);
    });
};

User.prototype.sendConfirmation = function() {
    var options = {
        "subject": "StoryQuest E-Mail Confirmation",
        "to": this.username,
        "confirmUrl": "https://" + config.serverName + "/confirm.html#/?username=" + this.username + "&token=" + this.confirmationToken};
    var templateFile = path.join(__dirname, "../", "../", "mailtemplates", "register.html");
    mailer.send(templateFile, options, function() {
        logger.info("Sent confirmation mail for " + this.username + " (" + this.id + ").");
    });
};

User.prototype.sendPasswordReset = function(password) {
    var options = {
        "subject": "StoryQuest Password Reset",
        "to": this.username,
        "resetUrl": "https://" + config.serverName + "/confirm.html#/?username=" + this.username + "&token=" + this.passwordResetToken + "&password=" + password
    };
    var templateFile = path.join(__dirname, "../", "../", "mailtemplates", "passwordreset.html");
    mailer.send(templateFile, options, function() {
        logger.info("Sent password reset mail for " + this.username + " (" + this.id + ").");
    });
};

User.prototype.confirm = function(token, done) {
    if (token===this.confirmationToken) {
        this.confirmed = true;
        logger.info("Confirmed account " + this.username + " (" + this.id + ").");
        this.save(done);
    } else
        done(null);
};

// Class methods follow

// FIXME: this is supposed to create needed database views but get never called
User.databaseInit = function() {
    Database.save('_design/user', {
        byUsername: {
            map: function (doc) {
                if (doc.username) emit(doc.username, doc);
            }
        },
        byAuthtoken: {
            map: function (doc) {
                if (doc.authtoken) emit(doc.authtoken, doc);
            }
        }
    });
};

User.addProject = function(username, projectId, done) {
    User.getByUsername(username, function(err, dbUser) {
        if (err) {
		console.log(err);		
            done(err, null);
}
        else {
            dbUser.projects.push(projectId);
            dbUser.save(function(err) {
                if (err)
                    done(err, null);
                else
                    done(null, dbUser);
            })
        }
    })
};

User.removeProject = function(username, projectId, done) {
    User.getByUsername(username, function(err, dbUser) {
        if (err)
            done(err, null);
        else {
            if (dbUser.projects.indexOf(projectId)>-1)
                dbUser.projects.splice(dbUser.projects.indexOf(projectId), 1);
            dbUser.save(function(err) {
                if (err)
                    done(err);
                else
                    done(null);
            })
        }
    })
};

User.addLibrary = function(username, projectId, done) {
    User.getByUsername(username, function(err, dbUser) {
        if (err)
            done(err, null);
        else {
            dbUser.library.push(projectId);
            dbUser.save(function(err) {
                if (err)
                    done(err);
                else
                    done(null);
            })
        }
    })
};

User.addTransaction = function(username, transaction, done) {
    User.getByUsername(username, function(err, dbUser) {
        if (err)
            done(err, null);
        else {
            dbUser.transactions.push(transaction);
            dbUser.save(function(err) {
                if (err)
                    done(err);
                else
                    done(null);
            })
        }
    })
};

User.getTransactions = function(username, done) {
    User.getByUsername(username, function(err, dbUser) {
        if (err)
            done(err, null);
        else {
            done(err, dbUser.transactions);
        }
    })
};

User.exists = function(username, done) {
    User.getByUsername(username, function(err, user) {
        if (user!=null)
            done(true);
        else
            done(false);
    })
};

User.getByUsername = function(username, done) {
    Database.view('user/byUsername', { key: username }, function (err, doc) {
        if (err || !doc || doc.length!=1)
            done(err, null);
        else
            done(err, User.fromJSON(doc[0].value));
    });
};

User.getByAuthtoken = function(authtoken, done) {
    Database.view('user/byAuthtoken', { key: authtoken }, function (err, doc) {
        if (err || !doc || doc.length!=1)
            done(err, null);
        else
            done(err, User.fromJSON(doc[0].value));
    });
};

User.checkPassword = function(hash, password) {
    if (!hash || !password || hash!=crypt.SHA256(password).toString())
        return false;
    else
        return true;
};

User.fromJSON = function(dbDoc) {
    var user = new User();
    user.id = dbDoc._id;
    user._rev = dbDoc._rev;
    user.type = dbDoc.type;
    user.username = dbDoc.username;
    user.name = dbDoc.name;
    user.password = dbDoc.password;
    user.projects = dbDoc.projects;
    user.library = dbDoc.library;
    user.tags = dbDoc.tags;
    user.credentials = dbDoc.credentials;
    user.confirmed = dbDoc.confirmed;
    user.confirmationToken = dbDoc.confirmationToken;
    user.authtoken = dbDoc.authtoken;
    user.passwordResetToken = dbDoc.passwordResetToken;
    user.transactions = dbDoc.transactions;
    user.context = dbDoc.context;
    return user;
};

User.toJSON = function(user) {
    var dbDoc = {};
    if (user.id)
        dbDoc._id = user.id;
    if (user._rev)
        dbDoc._rev = user._rev;
    dbDoc.username = user.username;
    dbDoc.name = user.name;
    dbDoc.password = user.password;
    dbDoc.type = user.type;
    dbDoc.projects = user.projects;
    dbDoc.library = user.library;
    dbDoc.tags = user.tags;
    dbDoc.credentials = user.credentials;
    dbDoc.confirmed = user.confirmed;
    dbDoc.authtoken = user.authtoken;
    dbDoc.confirmationToken = user.confirmationToken;
    dbDoc.passwordResetToken = user.passwordResetToken;
    dbDoc.transactions = user.transactions;
    dbDoc.context = user.context;
    return dbDoc;
};

User.createInDatabase = function(name, username, password, context, confirmNeeded, done) {
    if (username && password && name) {
        User.exists(username, function(userExists) {
            if (userExists)
                done({message: "User already exists."});
            else {
                var newUser = new User();
                newUser.name = name;
                if (config.allowedNewUserContexts.indexOf(context)!=-1) {
                    newUser.tags.push(context);
                    newUser.context = context;
                }
                newUser.username = username;
                newUser.password = crypt.SHA256(password).toString();
                newUser.confirmationToken = Utils.uuid();
                newUser.authtoken = Utils.uuid();
                if (confirmNeeded)
                    newUser.confirmed = false;
                else
                    newUser.confirmed = true;
                Database.save(User.toJSON(newUser), function (err, res) {
                    if (err) {
                        logger.error("Error storing new user to database: " + JSON.stringify(err) + " " + JSON.stringify(newUser));
                        done(err);
                    } else {
                        logger.info("Created account " + newUser.username);
                        if (confirmNeeded)
                            newUser.sendConfirmation();
                        done(null, newUser);
                    }
                });
            }
        });
    } else
        done(err);
};
