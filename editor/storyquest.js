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

var config = require(process.env.CONFIGFILE || "./config.json");
global.Utils = require("./service/utils");

var winston = require("winston");
var expressWinston = require("express-winston");
var express = require("express");
var fs = require("fs");
var http = require("http");
var https = require("https");
var crypt = require("crypto-js");
var path = require("path");
var flash = require("connect-flash");
var passport = require("passport");

// setting up logging
var logPath = path.dirname(config.logfile);
if (!fs.existsSync(logPath)){
    fs.mkdirSync(logPath);
}
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

// setting up database, model
var DatabaseClass = require("./service/database");
global.Database = new DatabaseClass(config).db;
global.User = require("./service/model/user");
global.Project = require("./service/model/project");

// setting up AuthN
var AuthN = require("./service/routes/auth");
var authN = new AuthN(config);

// setting up service
var options = {
    ca: fs.readFileSync(config.sslCaFile || "ca.crt"),
    key: fs.readFileSync(config.sslKeyFile || "ssl.key"),
    cert: fs.readFileSync(config.sslCertFile || "ssl.crt")
};
var app = express();
app.set("port", config.port || 3000);
app.set("views", path.join(__dirname, "service/templates"));
app.set("view engine", "jade");

app.use(express.urlencoded());
app.use(require("connect-multiparty")({ keepExtensions: true, uploadDir: config.tempDir || __dirname }))
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser(config.cookieSecret || "changeme"));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(app.router);
app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.File({ filename: config.exceptionlogfile })
    ]
}));
app.use(express.static(path.join(__dirname, "static")));

// setting up protected static service
var templateStatic = express.static(path.join(__dirname, "template"));
var projectStatic = express.static(config.projectsDir || path.join(__dirname, "projects"));
app.get(/^\/api\/p\/([^\/]+)\/(.+)/, global.authTokenOrUser, global.authProject, function (req, res, next) {
    if (req.params.length>=0 && req.params[0]) {
        var projectName = req.params[0];
        var reqPath = req.params[1];
        var projectPath = path.join(Utils.getProjectDir(projectName), reqPath);
        var templatePath = path.join(__dirname, "template", reqPath);
        if (reqPath=="application.keystore" || reqPath=="storyquest.properties") {
            res.status(404).send("Resource " + reqPath + " not found.");
        } else if (fs.existsSync(projectPath)) {
            req.url = projectName + "/" + reqPath;
            projectStatic(req, res, next);
        } else if (fs.existsSync(templatePath)) {
            req.url = reqPath;
            templateStatic(req, res, next);
        } else {
            res.status(404).send("Resource " + reqPath + " not found.");
        }
    } else {
        logger.info("User " + (req.user?req.user.username:"unknown") + " tried to access non-scope project generic file " + req.params);
        return res.redirect('/login');
    }
});
app.get("/questml.peg", function (req, res, next) {
    var pegFile = "template/resources/questml.peg";
    if (fs.existsSync(pegFile)) {
        res.writeHead(200, { "Content-Type": "application/octet-stream" });
        return res.end(fs.readFileSync(pegFile), "binary");
    } else
        return res.status(404).send();
});
app.get("/api/config/:key", global.authTokenOrUser, function (req, res, next) {
    var value = config[req.param("key")];
    if(value && req.param("key") == "youtubeApiKey"){
        return res.send(value);
    }
    return res.status(404).send();
});
app.get(/^\/api\/beta\/([^\/]+)\/(.+)/, function (req, res, next) {
    if (req.params.length>=0 && req.params[0]) {
        var testKey = req.params[0];
        var reqPath = req.params[1];
        Project.getByTestKey(testKey, function(err, project) {
            if (err || !project) {
                logger.info("Client tried to access using invalid testkey");
                return res.redirect('/login');
            } else {
                var projectId = project.id;
                var projectPath = path.join(Utils.getProjectDir(projectId), reqPath);
                var templatePath = path.join(__dirname, "template", reqPath);
                if (fs.existsSync(projectPath)) {
                    req.url = projectId + "/" + reqPath;
                    projectStatic(req, res, next);
                } else if (fs.existsSync(templatePath)) {
                    req.url = reqPath;
                    templateStatic(req, res, next);
                } else {
                    res.status(404).send("Resource " + reqPath + " not found.");
                }
            }
        });
    } else {
        logger.info("User " + (req.user?req.user.username:"unknown") + " tried to access non-scope project generic file " + req.params);
        return res.redirect('/login.html');
    }
});

// setting up routes
authN.registerServices(app);
require("./service/routes/heartbeat").registerServices(config, app);
require("./service/routes/user").registerServices(config, app);
require("./service/routes/project").registerServices(config, app);
require("./service/routes/betatest").registerServices(config, app);
require("./service/routes/deployment").registerServices(config, app);
require("./service/routes/media").registerServices(config, app);
require("./service/routes/nodes").registerServices(config, app);
require("./service/routes/nodetree").registerServices(config, app);
require("./service/routes/nodetypes").registerServices(config, app);
require("./service/routes/liveupdateserver").registerServices(config, app);

// starting service
httpsServer = https.createServer(options, app);
httpServer = http.createServer(app);

var socketserver = require("./service/routes/liveupdateserver");
var engineIO = require("engine.io");
httpsServer.listen(config.port, function() {
    // starting websockets server
    socketserver.listen(engineIO.attach(httpsServer, {}));
    console.log("StoryQuest Service");
    console.log("Copyright © 2015 Questor GmbH, Germany. Licensed under the MIT License. See LICENSE file for details.");
    console.log("StoryQuest server listening on port " + app.get("port") + " using '" + (config.projectsDir || path.join(__dirname, "projects")) + "' as projects base." );
    console.log("Using https protocol on port " + config.port);
});
httpServer.listen(config.httpPort, function() {
    // starting websockets server
    socketserver.listen(engineIO.attach(httpServer, {}));
    console.log("Using http protocol on port " + config.httpPort);
});

// redirect from http to https
var redirectService = express();
redirectService.get("*", function(req, res){
    res.redirect("https://" + config.serverName + ":" + app.get("port") + "/");
});
redirectService.listen(config.redirectPort || 80, function() {
    console.log("Redirect server listening on port " + config.redirectPort);
});
