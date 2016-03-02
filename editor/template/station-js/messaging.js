/*
 * StoryQuest
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

// TODO: link from chat message to document: &documentId=someDocumentId1

var dialogState = [];

function switchContent(stationIdx) {
    loadFile("../stationconfig/" + stationIdx + ".json", function(result) {
        var loadedStation = JSON.parse(result);
        sideloadContent(stationIdx, loadedStation);
    });
}

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function replaceAny(tokens, text) {
    for (var i=0; i<tokens.length; i++)
        text = text.replace(new RegExp("\\$"+i,"g"), tokens[i]);
    return text;
}

function sideloadContent(stationIdx, config) {
    currentStationId = stationIdx;

    // parsing config
    currentStation = config;

    // retrieve current dialog state from persistence
    if (typeof model.dialogStates=="undefined") {
        model.dialogStates = {};
        storeModel();
    }
    if (typeof model.dialogStates[currentStation.id]!="undefined")
        dialogState = model.dialogStates[currentStation.id];
    dialogState.forEach(function(entry) {
        if (entry.senderType=="player")
            displayMessagePlayer(null, entry.senderName, entry.senderAvatar, entry.content.text, entry.content.image, false);
        else
            displayMessageNPC(entry.id, entry.senderName, entry.senderAvatar, entry.content.text, entry.content.image, false);
    });

    // finally call onEnter
    onEnter();
}

function displayScriptMessage(messageId) {
    var message = currentStation.dialog[messageId];
    var senderName = message.senderName;
    var senderAvatarUrl = message.senderAvatar;
    var contentText = message.content.text || null;
    var contentImageUrl = message.content.image || null;
    displayMessageNPC(messageId, senderName, senderAvatarUrl, contentText, contentImageUrl, "script", true);
}

function displayMessagePlayer(id, senderName, senderAvatarUrl, contentText, contentImageUrl, doStore) {
    var chatArea = $("#chatarea");
    var cText = contentText?("<span>" + contentText + "</span>"):"";
    var cImg = contentImageUrl?("<img src='" + contentImageUrl + "'>"):"";
    chatArea.append("<div class='message'>" +
        "<div class='message-frame'>" +
        "<div class='sender'>" +
            senderName +
        "</div>" +
        "<div class='message-content'>" +
        cText +
        cImg +
        "</div>" +
        "</div>" +
        "<div class='avatar'>" +
        "<img src='" + senderAvatarUrl + "'>" +
        "</div>" +
    "</div>");
    setTimeout(function() {
        var height = chatArea[0].scrollHeight;
        chatArea.scrollTop(height);
    }, 100);
    if (doStore)
        appendMessageToModel(id, senderName, senderAvatarUrl, "player", contentText, contentImageUrl, "nonscript");
}

function parseLinks(html) {
    var regex = /\[.+\|[^\]]*\]/g;
    var out = html.match(regex);
    if (typeof out!="undefined" && out!=null)
        for (var i=0; i<out.length; i++) {
            var r = new RegExp(escapeRegExp(out[i]), "g");
            html = html.replace(r, parseStoryQuestStatement(out[i]));
        }
    return html;
}

function parseStoryQuestStatement(statement) {
    var nominalStmt = statement.substring(1, statement.length-1);
    var token = nominalStmt.split("|");
    if (token[0]=="dl") {
        return "<span class='choice enabled' data-station='" + token[1] + "' data-document='" + token[2] + "'>" + token[3] + "</span>"
    }
    else
        return statement;
}

function displayMessageNPC(id, senderName, senderAvatarUrl, contentText, contentImageUrl, messageType, doStore) {
    var chatArea = $("#chatarea");
    var cText = contentText?("<span>" + parseLinks(contentText) + "</span>"):"";
    var cImg = contentImageUrl?("<img src='" + contentImageUrl + "'>"):"";
    chatArea.append("<div class='message'>" +
        "<div class='avatar'>" +
        "<img src='" + senderAvatarUrl + "'>" +
        "</div>" +
        "<div class='message-frame'>" +
        "<div class='sender'>" +
        senderName +
        "</div>" +
        "<div class='message-content'>" +
        cText +
        cImg +
        "</div>" +
        "</div>" +
        "</div>");
    setTimeout(function() {
        var height = chatArea[0].scrollHeight;
        chatArea.scrollTop(height);
    }, 100);
    if (doStore)
        appendMessageToModel(id, senderName, senderAvatarUrl, "npc", contentText, contentImageUrl, messageType);
}

function appendMessageToModel(id, senderName, senderAvatarUrl, senderType, contentText, contentImageUrl, messageType) {
    dialogState.push({
        "id": id,
        "senderName": senderName,
        "senderAvatar": senderAvatarUrl,
        "senderType": senderType,
        "messageType": messageType,
        "content": {
            "text": contentText,
            "image": contentImageUrl
        }
    });
    model.dialogStates[currentStation.id] = dialogState;
    console.log("Appended message to model.");
    storeModel();
}

function getRandomNPCMessage(stationId, callback) {
    loadFile("../stationconfig/" + stationId + ".json", function(result) {
        var loadedConfig = JSON.parse(result);
        var idx = Math.floor(Math.random() * loadedConfig.defaultMessages.length);
        callback(loadedConfig.defaultMessages[idx]);
    });
}

function getScriptMessage(stationId, messageId, callback) {
    loadFile("../stationconfig/" + stationId + ".json", function(result) {
        var loadedConfig = JSON.parse(result);
        callback(loadedConfig.dialog[messageId]);
    });
}

function getContextMessage(stationId, callback) {
    // retrieve last npc message from dialog protocol that has
    // messageType==script. This message is the story context message.
    // Only links on that message are in the current context and will
    // be triggered.
    // have to load the json again, because this can be called from
    // external sources with different loaded station
    loadFile("../stationconfig/" + stationId + ".json", function(result) {
        var loadedConfig = JSON.parse(result);
        var messageList = model.dialogStates[stationId];
        for (var i=messageList.length-1; i>=0; i--) {
            var thisMessage = messageList[i];
            if (thisMessage.messageType=="script") {
                callback(loadedConfig.dialog[thisMessage.id]);
                return;
            }
        }
        callback(null);
    });
}

function getLastPlayerMessage(stationId) {
    var messageList = model.dialogStates[stationId];
    // retrieve last player message from dialog protocol
    for (var i=messageList.length-1; i>=0; i--) {
        var thisMessage = messageList[i];
        if (thisMessage.senderType=="player")
            return thisMessage;
    }
}

var targetActions = {

    // chat target action
    chat: function(target, stationId) {
        var delay = target.delay;
        // FIXME: delay is ignored for now, fix that
        var nextMessageId = target.channelParams.id;
        if (typeof displayScriptMessage!="undefined")
            displayScriptMessage(nextMessageId);
        else
            // call from external, direct display is not available, just store the
            // message in model, next time the messaging station is opened, it is displayed.
            getScriptMessage(stationId, nextMessageId, function(message) {
                appendMessageToModel(nextMessageId, message.senderName, message.senderAvatar, message.senderType, message.content.text, message.content.image, message.messageType);
            })
    }
};

var channelTrigger = {

    // chat trigger check, set message as data in call.
    chat: function(trigger, stationId) {
        var conditionTypes = {
            // FIXME: add emoticons condition here
            keywords: function(conditionParams, message) {
                var keywords = conditionParams.keywords;
                for (var k=0; k<keywords.length; k++) {
                    var entry = keywords[k].toLowerCase();
                    if (typeof message.content.text!="undefined" && (entry=="*" || message.content.text.toLowerCase().indexOf(entry)!=-1))
                        return true;
                }
                return false;
            }
        };
        var lastPlayerMessage = getLastPlayerMessage(stationId);
        if (typeof conditionTypes[trigger.conditionType]=="function")
            return conditionTypes[trigger.conditionType](trigger.conditionParams, lastPlayerMessage);
        else {
            console.log("WARNING: conditionType " + trigger.conditionType + " is unknown, not checked!");
            return false;
        }
    }
};

function updateChatScript(stationId) {
    console.log("Updating chat script..");
    getContextMessage(stationId, function(contextMessage) {
        console.log("Context message retrieved: " + contextMessage);
        var matchFound = false;
        if (contextMessage!=null) {
            var links = contextMessage.links;
            links.forEach(function(thisLink) {
                var thisTrigger = thisLink.trigger;
                var thisTarget = thisLink.target;
                var result = channelTrigger[thisTrigger.channel](thisTrigger, stationId);
                if (result) {
                    console.log("Trigger " + thisTrigger.channel + " matched.");
                    matchFound = true;
                    targetActions[thisTarget.channel](thisTarget, stationId);
                }
                else
                    console.log("No trigger matched.");
            });
        }
        if (!matchFound) {
            console.log("No match found, sending default message.");
            getRandomNPCMessage(stationId, function(message) {
                if (typeof displayMessageNPC!="undefined")
                    displayMessageNPC(null, message.senderName, message.senderAvatar, message.content.text, message.content.image, message.messageType, true);
                else
                    // call from external, direct display is not available, just store the
                    // message in model, next time the messaging station is opened, it is displayed.
                    appendMessageToModel(null, message.senderName, message.senderAvatar, message.senderType, message.content.text, message.content.image, message.messageType);
            });
        }
    });
}

function loadArchiveDocument(stationId, documentId) {
    toStation(stationId, documentId);
}

$(document).ready(function() {

    $("#sendButton").hammer().on("tap", function(event) {
        playButtonSound();
        var text = $("#textarea").val();
        if (text && text!="") {
            // display message in message view
            displayMessagePlayer(null, "Me", "../images/avatar.png", text, null, true);
            $("#textarea").val("");
            updateChatScript(currentStation.id)
        }
    });

    $(".emoticon").hammer().on("tap", function(event) {
        playButtonSound();
        var text = $(this).text();
        // display message in message view
        displayMessagePlayer(null, "Me", "../images/avatar.png", text, null, true);
        $("#textarea").val("");
        updateChatScript(currentStation.id)
    });

    $(document).hammer().on("tap", ".choice.enabled", function(event) {
        playButtonSound();
        loadArchiveDocument($(event.target).attr("data-station"), $(event.target).attr("data-document"));
    });

    var chatArea = $("#chatarea");
    var height = chatArea[0].scrollHeight;
    chatArea.scrollTop(height);

    autoSwitchContent();
});