var passport = require("passport");
var async = require("async");
var AuthNLocalStrategy = require("passport-local").Strategy;

exports = module.exports = Auth;

function Auth(config) {
    logger.info("Setting up AuthN..");

    passport.use(new AuthNLocalStrategy(
        function(username, password, done) {
console.log(username + "/" + password);
            User.getByUsername(username, function(err, user) {
		console.log(user);
                if (err || !user || !user.password || !User.checkPassword(user.password, password) || !user.confirmed) {
                    logger.info("Authentication failed for " + username);
                    console.log(err);
                    return done(null, false);
                } else {
                    logger.info("Authentication successful for " + username);
                    return done(null, user);
                }
            });
        }
    ));
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    // setting up general request authentication
    global.userOwnsProject = function(user, projectId) {
        return !(!user.projects || user.projects.indexOf(projectId) == -1);
    };
    global.userLibraryProject = function(user, projectId) {
        return !(!user.library || user.library.indexOf(projectId) == -1);
    };
    global.authUser = function(req, res, next) {
        if (!req.user)
            return res.json(401, {type: "AUTH_FAILED", "message":"User not authenticated."});
        else
            return next();
    };
    global.authTokenOrUser = function(req, res, next) {
        var authtoken = req.param("authtoken");
        if (authtoken) {
            User.getByAuthtoken(authtoken, function(err, user) {
                if (err || !user) {
                    res.send(403, {type: "AUTH_FAILED", "message":"Authentication failed."});
                    next(err);
                } else {
                    req.logIn(user, function(err) {
                        if (err) {
                            res.send(501, {type: "AUTH_FAILED", "message":"Error logging in."});
                            next(err);
                        } else {
                            return next();
                        }
                    });
                }
            });
        } else if (req.user)
            return next();
        else {
            res.send(403, {type: "AUTH_FAILED", "message":"Authentication failed."});
            next("Authentication failed.");
        }
    };
    global.authProject = function(req, res, next) {
        var projectId = req.param("projectId");
        if (req.params[0])
            projectId = req.params[0];
        if (!req.user || !userOwnsProject(req.user, projectId))
            res.send(403, {type: "PROJECT_NOT_OWNED", "message":"Unauthorized access to non-owned project."});
        else
            return next();
    };
    global.libraryProject = function(req, res, next) {
        var projectId = req.param("projectId");
        if (!req.user || !userLibraryProject(req.user, projectId)) {
            res.send(403, {type: "PROJECT_NOT_IN_LIBRARY", "message":"Unauthorized access to non-library project."});
            next("Authentication failed.");
        } else
            return next();
    };
    global.authPublicProject = function(req, res, next) {
        var projectId = req.param("projectId");
        Project.getByProjectId(projectId, function(err, project) {
            if (err || !project) {
                res.send(403, {type: "AUTH_FAILED", "message":"Authentication failed."});
                next(err);
            } else {
                if (project.status==="published")
                    return next();
                else {
                    if (!req.user)
                        res.send(403, {type: "AUTH_FAILED", "message":"Authentication failed."});
                    else if (!req.user || !userOwnsProject(req.user, projectId))
                        res.send(403, {type: "PROJECT_NOT_OWNED", "message":"Unauthorized access to non-owned project."});
                    else
                        return next();
                }
            }
        })
    };
}

Auth.prototype.registerServices = function(app) {
    app.get("/api/authenticated", this.authenticated);
    app.post("/api/login", this.login);
    app.post("/api/changepassword", global.authUser, this.changePassword)
    app.post("/api/logout", this.logout);
    app.post("/api/register", this.register);
    app.get("/api/confirm", this.confirm);
    app.get("/api/lostpassword", this.sendLostPassword);
    app.get("/api/confirmlostpassword", this.confirmLostPassword);
};

Auth.prototype.authenticated = function(req, res) {
    if (req.user && req.session.project)
        return res.json(200, {type: "SUCCESS", "message":"User authenticated."});
    else
        return res.json(400, {type: "AUTH_FAILED", "message":"User not authenticated."});
};

Auth.prototype.login = function(req, res, next) {
    passport.authenticate("local", function(err, user, info) {
        if (err) {
            return res.json(403, {type: "AUTH_FAILED", "message":"An error occured while retrieving information. Please try again."});
        }
        if (!user) {
            return res.json(401, {type: "AUTH_FAILED", "message":"User not authenticated."});
        }
        // use the provided project id or the first project of the user
        var projectId = null;
        if (user.projects && user.projects.length>0)
            projectId = user.projects[0];
        if (req.param("project"))
            projectId = req.param("project");
        if (projectId!=null && !userOwnsProject(user, projectId)) {
            return res.json(401, {type: "PROJECT_NOT_OWNED", "message":"Project " + projectId + " is not owned by this user."});
        }
        req.logIn(user, function(err) {
            if (err) {
                logger.error(err);
                return res.json(401, {type: "AUTH_FAILED", "message":"An error occured while logging in user."});
            } else {
                return res.json(200, {username:req.user.username});
            }
        });
    })(req, res);
};

Auth.prototype.logout = function(req, res) {
    req.logout();
    return res.json(200, {});
};

Auth.prototype.changePassword = function(req, res) {
    var password = req.param("password");
    User.getByUsername(req.user.username, function (err, user) {
        if (user) {
            user.setPassword(password);
            user.save(function (err) {
                if (err)
                    return res.json(500, {type: "STORING_FAILED", "message":"An error occured while storing information. Please try again."});
                else {
                    logger.info("Changed password for user " + req.user.username);
                    req.logout();
                    return res.json(200, {type: "SUCCESS", "message":"The new password was set. Please log in now."});
                }
            });
        } else
            return res.json(500, {type: "AUTH_FAILED", "message":"Username unknown or password change request denied."});
    })
};

Auth.prototype.register = function(req, res) {
    var invitekey = req.param("invitekey");
    var username = req.param("username");
    var password = req.param("password");
    var name = req.param("name");
    async.series([
            function(callback){
                if (!username && password && name)
                    InviteKey.isValidKey(invitekey, function(isValid) {
                        callback(null, isValid);
                    });
                else
                    callback(null, true);
            }
        ],
        function(err, results){
            if (results[0]) {
                if (username && password && name) {
                    User.createInDatabase(name, username, password, null, true, function(err) {
                        if (err)
                            return res.json(400, {type: "USERNAME_TAKEN", "message":"This username is already taken. Please choose another username."});
                        else
                            return res.json(200, {type: "SUCCESS", "message":"You need to confirm your E-Mail address. Please click on the link you received by mail. Thanks."});
                    });
                } else
                    return res.json(400, {type: "INVALID_DATA", "message":"Please provide all needed data"});
            } else
                return res.json(400, {type: "INVALID_DATA", "message":"Invite key invalid or registration closed."});
        });
};

Auth.prototype.confirm = function(req, res) {
    var username = req.param("username");
    var confirmationToken = req.param("token");
    if (username && confirmationToken)
        User.getByUsername(username, function(err, user) {
            if (err || !user)
                return res.json(400, {type: "INVALID_DATA", "message":"Confirmation failed!"});
            else
                user.confirm(confirmationToken, function(err) {
                    if (err)
                        return res.json(400, {type: "INVALID_DATA", "message":"Confirmation failed!"});
                    else {
                        Project.createInDatabase("My first StoryQuest book", "Please change the description", "storyquest book", user.context, user.name, function(dberr, result) {
                            if (dberr)
                                return res.json(400, {type: "STORING_FAILED", "message":"Failed creating project info. Please try again. Thanks."});
                            else {
                                var projectId = result.id;
                                Project.getByProjectId(projectId, function(err, project) {
                                    if (err)
                                        return res.json(400, {type: "INVALID_DATA", "message":"Failed retrieving project info. Please try again. Thanks."});
                                    else {
                                        Project.createProjectDirectory(project, user.context);
                                        // save to database
                                        User.addProject(user.username, project.id, function(userErr) {
                                            if (userErr)
                                                return res.json(400, {type: "STORING_FAILED", "message":"Failed storing project info. Please try again. Thanks."});
                                            else
                                                return res.json(200, {type: "SUCCESS", "message":"Thanks for registering with StoryQuest. Please login now."});
                                        })
                                    }
                                });
                            }
                        })
                    }
                });
        });
    else
        return res.json(400, {type: "INVALID_DATA", "message":"Please provide all needed data."});
};

Auth.prototype.confirmLostPassword = function(req, res) {
    var username = req.param("username");
    var password = req.param("password");
    var token = req.param("token");
    if (username && password && token)
        User.getByUsername(username, function(err, user) {
            if (user && user.passwordResetToken===token) {
                user.passwordResetToken = null;
                user.setPassword(password);
                user.save(function(err) {
                    if (err)
                        return res.json(400, {type: "STORING_FAILED", "message":"An error occured while storing information. Please try again."});
                    else {
                        logger.info("Changed password for user " + username);
                        return res.json(200, {type: "SUCCESS", "message":"The new password was set. Please log in now."});
                    }
                });
            } else
                return res.json(400, {type: "INVALID_DATA", "message":"Username unknown or password reset request denied."});
        });
    else
        return res.json(400, {type: "INVALID_DATA", "message":"Please provide all needed data."});
};

Auth.prototype.sendLostPassword = function(req, res) {
    var username = req.param("username");
    var password = req.param("password");
    if (username) {
        User.getByUsername(username, function(err, user) {
            if (user) {
                user.passwordResetToken = Utils.uuid();
                user.save(function(err) {
                    if (err)
                        return res.json(500, {type: "STORING_FAILED", "message":"An error occured while storing information. Please try again."});
                    else {
                        user.sendPasswordReset(password);
                        return res.json(200, {type: "SUCCESS", "message":"You have received a password reset mail. Please click on the link in this mail."});
                    }
                });
            } else
                return res.json(400, {type: "AUTH_FAILED", "message":"Username unknown or password reset request denied."});
        })
    } else
        return res.json(400, {"message":"Please provide all needed data."});
};






