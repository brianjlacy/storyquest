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

var url = require("url");
var User = require("../model/user");

var wssSessions = {};
var config = null;

exports.registerServices = function(appConfig, app) {
    config = appConfig;
};

exports.listen = function(wsEngine) {
    wsEngine.on("connection", function(socket) {
        var params = url.parse(socket.request.url, true);
        var authtoken = params.query.authtoken;
        var projectId = params.query.project;
        var type = params.query.type;
        logger.info("Socket connect message from " + authtoken + "/" + projectId + "/" + type);

        // if session for project is unknown yet, create it
        if (!wssSessions[projectId]) {
            logger.info("Creating new session entry for project " + projectId);
            wssSessions[projectId] = {
                projectId: projectId,
                previewSockets: [],
                editorSockets: []
            };
        } else
            logger.info("Session entry already known for project " + projectId);
        var incomingSession = wssSessions[projectId];

        // add socket to corresponding socket lists
        if (type==="preview" && !isAlreadyConnected(socket, incomingSession.previewSockets)) {
            logger.info("Add preview socket " + socket.id + " to session for project " + projectId);
            incomingSession.previewSockets.push(socket);
        } else if (type==="editor" && !isAlreadyConnected(socket, incomingSession.editorSockets)) {
            logger.info("Add editor socket " + socket.id + " to session for project " + projectId);
            incomingSession.editorSockets.push(socket);
        } else {
            logger.info("Ignoring unknow socket type " + type + " for project " + projectId);
        }

        // connect socket to listener if not already connected
        if (!isAlreadyConnected(socket, incomingSession.previewSockets) && !isAlreadyConnected(socket, incomingSession.editorSockets)) {

            socket.on("message", function(data) {
                var message = JSON.parse(data);
                var session = findSessionBySocket(this);
                var type = findTypeBySocket(this, session);
                logger.info("Received socket message from socket " + this.id +  " from " + type + " for project " + projectId + ": " + data);
                var outgoingSockets = null;
                if (type==="editor") {
                    // message originated from editor, send to previews
                    outgoingSockets = session.previewSockets;
                } else if (type=="preview") {
                    // message originated from preview, send to editors
                    outgoingSockets = session.editorSockets;
                } else
                    logger.info("Ignoring socket message from unknown type " + type);
                if (outgoingSockets)
                    // finally, sending messages out
                    for (var i=0; i<outgoingSockets.length; i++) {
                        logger.info("Sending socket message via " + outgoingSockets[i].id + ": " + JSON.stringify(message));
                        outgoingSockets[i].send(JSON.stringify(message));
                    }
            });

            socket.on("close", function() { removeSocket(this); });
        }
    });
};

exports.send = function(projectId, whereType, data) {
    logger.info("Received send request for project " + projectId + " direction " + whereType);
    var outgoingSession = wssSessions[projectId];
    var socketList = null;
    if (outgoingSession)
        if (whereType==="editor")
            socketList = outgoingSession.editorSockets;
        else if (whereType==="preview")
            socketList = outgoingSession.previewSockets;
        else
            logger.info("Error: unknown session type " + whereType);
    if (socketList)
        for (var i=0; i<socketList.length; i++) {
            logger.info("Sending to sockets for projectId " + projectId + " and direction " + whereType + ": " + JSON.stringify(data));
            socketList[i].send(data);
        }
};

exports.loadNode = function(projectId, node) {
    var proto = {
        type: "load",
        node: node
    };
    exports.send(projectId, "preview", JSON.stringify(proto));
};

exports.updateNode = function(projectId, node) {
    var proto = {
        type: "node",
        node: node
    };
    exports.send(projectId, "preview", JSON.stringify(proto));
};

exports.updateFrame = function(projectId) {
    var proto = {
        type: "frame"
    };
    exports.send(projectId, "preview", JSON.stringify(proto));
};

function removeSocket(socket) {
    for (var k=0; k<wssSessions.length; k++) {
        var session = wssSessions[k];
        if (session.hasOwnProperty("editorSockets"))
            for (var i=0; i<session.editorSockets.length; i++)
                if (session.editorSockets[i].id===socket.id)
                    session.editorSockets.splice(i, 1);
        if (session.hasOwnProperty("previewSockets"))
            for (var j=0; j<session.previewSockets.length; j++)
                if (session.previewSockets[j].id===socket.id)
                    session.previewSockets.splice(j, 1);
    }
}

function isAlreadyConnected(socket, socketArray) {
    if (socketArray && socket)
        for (var i=0; i<socketArray.length; i++)
            if (socketArray.id===socket.id)
                return true;
    return false;
}

function findSessionBySocket(socket) {
    var foundSession = null;
    for (var property in wssSessions) {
        if (wssSessions.hasOwnProperty(property)) {
            var session = wssSessions[property];
            for (var i=0; i<session.editorSockets.length; i++)
                if (session.editorSockets[i].id===socket.id)
                    foundSession = session;
            for (var j=0; j<session.previewSockets.length; j++)
                if (session.previewSockets[j].id===socket.id)
                    foundSession = session;
        }
    }
    return foundSession;
}

function findTypeBySocket(socket, session) {
    if (!session)
        return null;
    for (var i=0; i<session.editorSockets.length; i++)
        if (session.editorSockets[i].id===socket.id)
            return "editor";
    for (var j=0; j<session.previewSockets.length; j++)
        if (session.previewSockets[j].id===socket.id)
            return "preview";
    return null;
}
