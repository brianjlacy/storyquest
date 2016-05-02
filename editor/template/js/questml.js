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

/*
    Expression check loop
    If an element has the attributes data-check and data-checkfail, this
    loop checks the result of the expression and adds the class contained in
    data-checkfail if the expression evaluates to false.
 */
setInterval(function() {
    $("[data-check]").each(function(index, element) {
        var expression = $(element).attr("data-check");
        var classIfFailed = $(element).attr("data-checkfail");
        var whenFlag = $(element).attr("data-type");
        if (whenFlag==="when") {
            // when element with deferred execution
            var deferredText = $(element).html().replace("<!--</p>", "").replace("<p>-->", "");
            var evalResult = evalExpression(expression);
            if (evalResult) {
                // parse the deferred text
                var id = "when" + uuid();
                var parsed = parseQuestML(deferredText);
                $(element).replaceWith("<div id='" + id + "' style='display:none'>" + parsed + "</div>");
                $("#" + id).show("drop", {}, 1000);
            }
        } else {
            // any other element
            var evalResult = evalExpression(expression);
            if (!evalResult) {
                if (classIfFailed=="dropshow")
                    $(element).hide("drop", {}, 1000);
                else
                    $(element).addClass(classIfFailed);
            } else {
                if (classIfFailed=="dropshow")
                    $(element).show("drop", {}, 1000);
                else
                    $(element).removeClass(classIfFailed);
            }
        }
        refreshStyles();
    });
}, 1000);

// evaluates an expression, replacing all quotes and [] - use only for parameter expressions!
function evalExpression(expression) {
    // check special conditions for platform
    if (expression=="isEbook")
        return false;
    else if (expression=="isApp")
        return true;
    // eliminate quoting and expression substitution of () with [], % to ,
    expression = expression
        .replace("<em>", "_")
        .replace("</em>", "_")
        .replace(/\[/g, "(")
        .replace(/]/g, ")")
        .replace(/&#39;/g, "\"")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/, "<")
        .replace(/&gt;/, ">")
        .replace(/%/, ",");
    var evalResult = false;
    try {
        // check if this is a common js expression
        evalResult = eval(expression);
    } catch(e) {
        // does not seems so, try to interpret as model variable name
        // special case - inverse value: if the variable name starts with "!", return negated result
        evalResult = false;
        if (expression.startsWith("!"))
            evalResult = !model.getValue(expression.substring(1, expression.length));
        else
            evalResult = model.getValue(expression);
    }
    return evalResult;
}

function getQuestMLParser(callback) {
    if (!questMLParser)
        loadFile("resources/questml.peg", function( data ) {
            questMLParser = PEG.buildParser(data);
            questMLParser.parseQuestML = parseQuestML;
            console.log("QuestML parser active");
            if (callback)
                callback(questMLParser);
        });
    else
        callback(questMLParser);
}

// service method that returns true when a dropin dice roller has been rolled
function localDiceRolled() {
    return $(".diceroller-rolled").length >= 1;
}

// service method that returns true when a dropin battle has been successful
function battleWon() {
    return $(".battle-won").length >= 1;
}

// service method that returns true when a dropin battle has been failed
function battleLost() {
    return $(".battle-lost").length >= 1;
}

var parseQuestML = function(html) {

    console.log("Starting QuestML parsing..");

    var self = this;

    self.parseStatement = function(statement) {
        var result;
        if (typeof statement==="string") {
            result = statement;
        }
        else {
            switch(statement.type) {
                case "expression":
                    result = self.parseQuestMLExpression(statement);
                    break;
                case "command":
                    result = self.parseQuestMLCommand(statement);
                    break;
                case "sequence":
                    result = self.parseQuestMLSequence(statement);
                    break;
            }
        }
        return result;
    };

    self.parseQuestMLExpression = function(statement) {
        var body = statement.body; // may be array
        var result = "";
        if (Array.isArray(body)) {
            for (var i=0; i<body.length; i++)
                result += self.parseStatement(body[i]);
            return result;
        }
        else if (typeof body === "object")
            return self.parseStatement(body);
        else
            return self.executeStatement(body);
    };

    // serializes the parser output model back to QuestML.
    self.serialize = function(commandArray) {
        var result = "";
        for (var x=0; x<commandArray.length; x++) {
            if (typeof commandArray[x] == "string") {
                result += commandArray[x];
            } else if (typeof commandArray[x] == "object") {
                switch (commandArray[x].type) {
                    case "expression":
                        result += "{";
                        if (Array.isArray(commandArray[x].body))
                            result += self.serialize(commandArray[x].body);
                        else if (typeof commandArray[x].body == "object" && commandArray[x].body.type === "sequence") {
                            switch (commandArray[x].body.mode) {
                                case "once": result+="!"; break;
                                case "cycle": result+="&"; break;
                                case "random": result+="~"; break;
                            }
                            result += "|";
                            result += commandArray[x].body.content.join("|");
                            result += "|"
                        } else
                            result += commandArray[x].body;
                        result += "}";
                        break;
                    case "command":
                        result += "{";
                        result += commandArray[x].command.name;
                        result += "(" + commandArray[x].command.params.join(",") + "):";
                        if (Array.isArray(commandArray[x].body))
                            result += self.serialize(commandArray[x].body);
                        else
                            result += commandArray[x].body;
                        result += "}";
                        break;
                }
            }
        }
        return result;
    };

    self.parseQuestMLCommand = function(statement) {
        var commandName = statement.command.name;
        var params = statement.command.params; // optional
        var body = statement.body; // may be array
        var result = "";

        if (commandName=="when" && Array.isArray(body)) {
            // when and a statement body:
            // hold the execution of the body until the when expression is true
            console.log("Encountered a \"when\" command with an expression body. Holding execution until preconditions are true..");
            result += "<div class='when' data-check='" + params[0] + "' data-type='when'>";
            result += "<!--";
            // serialize the body back to QuestML
            result += self.serialize(body);
            result += "-->";
            result += "</div>";
            return result;
        } else if (Array.isArray(body)) {
            for (var i=0; i<body.length; i++)
                result += self.parseStatement(body[i]);
            return self.executeCommand(commandName, params, result);
        } else
            return self.executeCommand(commandName, params, body);
    };

    self.parseQuestMLSequence = function(statement) {
        var mode = statement.mode;
        var sequenceParts = statement.content;
        // note: this results in equal value lists being tracked as same list
        var sequenceId = hashNumber(sequenceParts.join(""));
        var sequenceModelId = "_sequence" + sequenceId;
        var currentSequenceIndex = model.getSequence(sequenceModelId);
        if (!currentSequenceIndex)
            currentSequenceIndex = 0;
        switch (mode) {
            case "once":
                if (currentSequenceIndex<=sequenceParts.length-1) {
                    model.setSequence(sequenceModelId, currentSequenceIndex+1, JSON.stringify(sequenceParts));
                    return sequenceParts[currentSequenceIndex];
                } else
                    return "";
                break;
            case "random":
                var random = Math.floor((Math.random() * (sequenceParts.length)));
                return sequenceParts[random];
                break;
            case "cycle":
                var result = sequenceParts[currentSequenceIndex];
                if (currentSequenceIndex>=sequenceParts.length-1)
                    currentSequenceIndex = 0;
                else
                    currentSequenceIndex++;
                model.setSequence(sequenceModelId, currentSequenceIndex, JSON.stringify(sequenceParts));
                return result;
                break;
            default:
                if (currentSequenceIndex<sequenceParts.length-1) {
                    model.setSequence(sequenceModelId, ++currentSequenceIndex, JSON.stringify(sequenceParts));
                } else if (currentSequenceIndex>sequenceParts.length-1) {
                    currentSequenceIndex = sequenceParts.length-1;
                    model.setSequence(sequenceModelId, currentSequenceIndex, JSON.stringify(sequenceParts));
                }
                return sequenceParts[currentSequenceIndex];
        }
    };

    self.executeStatement = function(body) {
        return model.getValue(body);
    };

    self.executeCommand = function(name, params, body) {
        switch (name) {
            case "image":
                return "<div class='image " + params[0] + "'><img src='images/" + body + "'></div>";
                break;
            case "box":
                return "<div class='box " + params[0] + "'>" + body + "</div>";
                break;
            case "button":
                var action = params[0];
                var buttonEnabledExpression = params[1] || "true";
                var buttonEnabled = evalExpression(buttonEnabledExpression);
                console.log(buttonEnabledExpression + " -> " + buttonEnabled);
                var callbackName = "callback" + uuid();
                window[callbackName] = function() {
                    playButtonSound();
                    console.log("Button callback " + callbackName + " called, evaluating action '" + action + "'.");
                    $("#" + callbackName).attr("data-check", "false").addClass("disabled");
                    self.evalExpression(action);
                };
                return "<div id='" + callbackName + "' onclick='" + callbackName + "()' data-checkfail='disabled' data-check='" + buttonEnabledExpression + "' class='switch " + (!buttonEnabled?"disabled":"") + "'><i class='fa fa-external-gears'></i>&nbsp;&nbsp;" + body + "</div>";
                break;
            case "link":
                var target = params[0];
                var linkFlag;
                if (params[1])
                    linkFlag = params[1].trim();
                var isEnabledExpression = params[2] || "true";
                var isEnabled = self.evalExpression(isEnabledExpression);
                return "<div data-checkfail='disabled' data-check='" + isEnabledExpression + "' class='choice " + (!isEnabled?"disabled":"") + "' data-flag='" + linkFlag + "' data-target='" + target + "' href='#'><i class='fa fa-external-link'></i>&nbsp;&nbsp;" + body + "</div>";
                break;
            case "ilink":
                var itarget = params[0];
                var ilinkFlag;
                if (params[1])
                    ilinkFlag = params[1].trim();
                var iisEnabledExpression = params[2] || "true";
                var iisEnabled = self.evalExpression(iisEnabledExpression);
                return "<span data-checkfail='disabled' data-check='" + iisEnabledExpression + "' class='choice " + (!iisEnabled?"disabled":"") + "' data-flag='" + ilinkFlag + "' data-target='" + itarget + "' href='#'><i class='fa fa-external-link'></i>&nbsp;&nbsp;" + body + "</span>";
                break;
            case "when":
                var hidden = "hidden";
                if (self.evalExpression(params[0]))
                    hidden = "";
                // "dropshow" is a special keyword that animates the show/hide
                return "<div class='when " + hidden + "' data-checkfail='dropshow' data-check='" + params[0] + "'>" + body + "</div>";
                break;
            case "set":
                if (params)
                    model.setValue(body, params[0]);
                else
                    model.setFlag(body);
                return "";
                break;
            case "increase":
                if (params) {
                    var currentValue = model.getValue(body);
                    if (!currentValue)
                        currentValue = 0;
                    else
                        currentValue = parseInt(currentValue);
                    model.setValue(body, currentValue+parseInt(params[0]));
                }
                return "";
                break;
            case "decrease":
                if (params) {
                    currentValue = model.getValue(body);
                    if (!currentValue)
                        currentValue = 0;
                    else
                        currentValue = parseInt(currentValue);
                    model.setValue(body, currentValue-parseInt(params[0]));
                }
                return "";
                break;
            case "script":
                var result = eval(body.replace(/&#39;/g, "\"").replace(/&quot;/g, '"').replace(/&lt;/, "<").replace(/&gt;/, ">"));
                if (result)
                    return result;
                else
                    return "";
                break;
            case "dropin":
                var dropinName = params[0];
                var dropinParams = params.slice(1, params.length);
                var dropinId = hashNumber(uuid());
                var dropinElementId = "dropin" + dropinId;
                getDropin(dropinName, dropinElementId, dropinParams, body, function(content) {
		        // some browsers are too fast, the element is not added when the
                // dropin content is loaded.
		        setTimeout(function() {
  	                  $("#dropin" + dropinId).html(content);                    
                    }, 250);
                });
                return "<div class='dropin' id=" + dropinElementId + "></div>";
                break;
            default:
                console.log("Unknown QuestML command " + name);
                return "";
        }
    };

    // remove possibly problematic quotes prior to parsing
    html = html.replace(/&amp;/g, "&");
    var parsedArray = questMLParser.parse(html);
    var result = "";
    for (var i=0; i<parsedArray.length; i++) {
        result += self.parseStatement(parsedArray[i]);
    }
    return result;
};
