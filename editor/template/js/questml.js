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
        var evalResult = evalExpression(expression);
        if (!evalResult) {
            $(element).addClass(classIfFailed);
        } else {
            $(element).removeClass(classIfFailed);
        }
        refreshStyles();
    });
}, 1000);

// evaluates an expression, replacing all quotes and [] - use only for parameter expressions!
function evalExpression(expression) {
    // eliminate quoting and expression substitution of () with []
    expression = expression.replace(/\[/g, "(").replace(/]/g, ")").replace(/&#39;/g, "\"").replace(/&quot;/g, '"').replace(/&lt;/, "<").replace(/&gt;/, ">");
    var evalResult = false;
    try {
        // check if this is a common js expression
        evalResult = eval(expression)
    } catch(e) {
        // does not seems so, try to interpret as model variable name
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
        var body = statement.body; // may be array
        var result = "";
        if (Array.isArray(body)) {
            for (var i=0; i<body.length; i++)
                result += parseStatement(body[i]);
            return result;
        }
        else if (typeof body === "object")
            return parseStatement(body);
        else
            return executeStatement(body);
    }

    function parseQuestMLCommand(statement) {
        var commandName = statement.command.name;
        var params = statement.command.params; // optional
        var body = statement.body; // may be array
        var result = "";
        if (Array.isArray(body))
            for (var i=0; i<body.length; i++)
                result += parseStatement(body[i]);
        else
            return executeCommand(commandName, params, body);
    }

    function parseQuestMLSequence(statement) {
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
                }
                break;
            case "random":
                var random = random(sequenceParts.length-1);
                return sequenceParts[random];
                break;
            case "cycle":
                if (currentSequenceIndex>sequenceParts.length-1)
                    currentSequenceIndex = 0;
                else
                    currentSequenceIndex++;
                model.setSequence(sequenceModelId, currentSequenceIndex, JSON.stringify(sequenceParts));
                return sequenceParts[currentSequenceIndex];
                break;
            default:
                if (currentSequenceIndex<sequenceParts.length-1) {
                    model.setSequence(sequenceModelId, currentSequenceIndex+1, JSON.stringify(sequenceParts));
                }
                return sequenceParts[currentSequenceIndex];
        }
    }

    function executeStatement(body) {
        return model.getValue(body);
    }

    function executeCommand(name, params, body) {
        switch (name) {
            case "image":
                return "<div class='image " + params[0] + "'><img src='images/" + body + "'></div>";
                break;
            case "box":
                return "<div class='box " + params[0] + "'>" + body + "</div>";
                break;
            case "button":
                var btarget = params[0];
                var blinkFlag;
                if (params[1])
                    blinkFlag = params[1].trim();
                var bisEnabledExpression = params[2] || "true";
                var bisEnabled = evalExpression(bisEnabledExpression);
                return "<div data-checkfail='disabled' data-check='" + bisEnabledExpression + "' class='switch " + (!bisEnabled?"disabled":"") + "' data-flag='" + blinkFlag + "' data-target='" + btarget + "' href='#'><i class='fa fa-external-link'></i>&nbsp;&nbsp;" + body + "</div>";
                break;
            case "link":
                var target = params[0];
                var linkFlag;
                if (params[1])
                    linkFlag = params[1].trim();
                var isEnabledExpression = params[2] || "true";
                var isEnabled = evalExpression(isEnabledExpression);
                return "<div data-checkfail='disabled' data-check='" + isEnabledExpression + "' class='choice " + (!isEnabled?"disabled":"") + "' data-flag='" + linkFlag + "' data-target='" + target + "' href='#'><i class='fa fa-external-link'></i>&nbsp;&nbsp;" + body + "</div>";
                break;
            case "ilink":
                var itarget = params[0];
                var ilinkFlag;
                if (params[1])
                    ilinkFlag = params[1].trim();
                var iisEnabledExpression = params[2] || "true";
                var iisEnabled = evalExpression(iisEnabledExpression);
                return "<span data-checkfail='disabled' data-check='" + iisEnabledExpression + "' class='choice " + (!iisEnabled?"disabled":"") + "' data-flag='" + ilinkFlag + "' data-target='" + itarget + "' href='#'><i class='fa fa-external-link'></i>&nbsp;&nbsp;" + body + "</span>";
                break;
            case "when":
                var hidden = "hidden";
                if (evalExpression(params[0]))
                    hidden = "";
                return "<div class='when " + hidden + "' data-checkfail='hidden' data-check='" + params[0] + "'>" + body + "</div>";
                break;
            case "set":
                if (params)
                    model.setValue(body, params[0]);
                else
                    model.setFlag(body);
                return "";
                break;
            case "increase":
                if (params)
                    model.setValue(body, parseInt(model.getValue(body))+parseInt(params[0]));
                return "";
                break;
            case "decrease":
                if (params)
                    model.setValue(body, parseInt(model.getValue(body))-parseInt(params[0]));
                return "";
                break;
            case "script":
                return eval(body);
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
    }

    var parsedArray = this.parse(html);
    var result = "";
    for (var i=0; i<parsedArray.length; i++) {
        result += parseStatement(parsedArray[i]);
    }
    return result;
};
