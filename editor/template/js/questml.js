/*
 * StoryQuest
 *
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

var questMLParser;
function getQuestMLParser(callback) {
    if (!questMLParser)
        $.get( "resources/questml.peg", function( data ) {
            questMLParser = PEG.buildParser(data);
            questMLParser.parseQuestML = parseQuestML;
            console.log("QuestML parser active");
            if (callback)
                callback(questMLParser);
        });
    else
        callback(questMLParser);
}

var parseQuestML = function(html) {

    console.log("Starting QuestML parsing..");

    function parseStatement(statement) {
        if (typeof statement==="string") {
            return statement;
        }
        else {
            var result;
            switch(statement.type) {
                case "expression":
                    result = parseQuestMLExpression(statement);
                    break;
                case "command":
                    result = parseQuestMLCommand(statement);
                    break;
                case "sequence":
                    result = parseQuestMLSequence(statement);
                    break;
            }
            return result;
        }
    }

    function parseQuestMLExpression(statement) {
        var id = statement.id;
        var body = statement.body; // may be array

        var result = "";
        if (Array.isArray(body))
            for (var i=0; i<body.length; i++)
                result += parseStatement(body[i]);
        else
            return executeStatement(id, body);
    }

    function parseQuestMLCommand(statement) {
        var id = statement.id;
        var commandName = statement.command.name;
        var params = statement.command.params; // optional
        var body = statement.body; // may be array
        var result = "";
        if (Array.isArray(body))
            for (var i=0; i<body.length; i++)
                result += parseStatement(body[i]);
        else
            return executeCommand(id, commandName, params, body);
    }

    function parseQuestMLSequence(statement) {
        var id = statement.id;
        var mode = statement.mode;
        var sequenceParts = statement.content;
        var sequenceModelId = "sequence_" + id;
        var currentSequenceIndex = model.getValue(sequenceModelId);
        switch (mode) {
            case "!":
                if (currentSequenceIndex<=sequenceParts.length-1) {
                    currentSequenceIndex++;
                    model.setValue(sequenceModelId, currentSequenceIndex);
                    return sequenceParts[currentSequenceIndex];
                }
                break;
            case "~":
                var random = random(sequenceParts.length-1);
                return sequenceParts[random];
                break;
            case "&":
                if (currentSequenceIndex>sequenceParts.length-1)
                    currentSequenceIndex = 0;
                else
                    currentSequenceIndex++;
                model.setValue(sequenceModelId, currentSequenceIndex);
                return sequenceParts[currentSequenceIndex];
                break;
            default:
                if (currentSequenceIndex<sequenceParts.length-1) {
                    currentSequenceIndex++;
                    model.setValue(sequenceModelId, currentSequenceIndex);
                }
                return sequenceParts[currentSequenceIndex];
        }
    }

    function executeStatement(id, body) {
        return model.getValue(body);
    }

    function executeCommand(id, name, params, body) {
        switch (name) {
            case "image":
                return "<div class='image " + params[0] + "'><img src='images/" + body + "'></div>";
                break;
            case "box":
                return "<div class='box " + params[0] + "'>" + body + "</div>";
                break;
            case "button":
                if (!params[2]) params[2] = "true";
                if (!params[3]) params[3] = "true";
                if (params[2]=="" || secureEvalBool(params[2])) {
                    var buttonState = "enabled";
                    if (params[3]!="" && !secureEvalBool(params[3]))
                        buttonState = "disabled";
                    if (model.hasFlag(params[1].trim()))
                        buttonState = "disabled";
                    return "<div class='switch " + buttonState + "' data-flag='" + params[1].trim() + "' href='#'>" + body + "</div>";
                } else
                    return "";
                break;
            case "link":
                var linkFlag;
                if (params[1]) linkFlag = params[1].trim();
                if (!params[2]) params[2] = "true";
                if (!params[3]) params[3] = "true";
                if (params[2]=="" || secureEvalBool(params[2])) {
                    var linkState = "enabled";
                    if (params[3]!="" && !secureEvalBool(params[3]))
                        linkState = "disabled";
                    if (linkFlag && model.hasFlag(linkFlag))
                        linkState = "disabled";
                    return "<div class='choice " + linkState + "' data-flag='" + linkFlag + "' data-target='" + params[0] + "' href='#'><i class='fa fa-external-link'></i>&nbsp;&nbsp;" + body + "</div>";
                } else
                    return "";
                break;
            case "ilink":
                var ilinkFlag;
                if (params[1]) ilinkFlag = params[1].trim();
                if (!params[2]) params[2] = "true";
                if (!params[3]) params[3] = "true";
                if (params[2]=="" || secureEvalBool(params[2])) {
                    var ilinkState = "enabled";
                    if (params[3]!="" && !secureEvalBool(params[3]))
                        ilinkState = "disabled";
                    if (ilinkFlag && model.hasFlag(ilinkFlag))
                        ilinkState = "disabled";
                    return "<span class='choice " + ilinkState + "' data-flag='" + ilinkFlag + "' data-target='" + params[0] + "' href='#'>" + body + "</span>";
                } else
                    return "";
                break;
            case "when":
                if (eval(params[0]))
                    return body;
                else
                    return "";
                break;
            case "set":
                if (params)
                    model.setValue(body, params[0]);
                else
                    model.setFlag(body);
                return "";
                break;
            case "script":
                return eval(body);
                break;
            default:
                console.log("Unknown QuestML command " + name);
                return "";
        }
    }

    var parsedArray = this.parse(html);
    var result = "";
    for (var i=0; i<parsedArray.length; i++) {
        result += parseStatement(parsedArray[i]);
    }
    return result;
};
