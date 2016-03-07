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

/**
 * Switches to the given StoryQuest book station. This loads the corresponding
 * data from the server.
 *
 * @param stationIdx
 */
function switchContent(stationIdx) {
    loadFile("../stationconfig/" + stationIdx + ".json", function(result) {
        var loadedStation = JSON.parse(result);
        $("#content").addClass(loadedStation.style)
            .css("background-color", loadedStation.backgroundColor);
        $("#body").css("background-image", "url(../images/" + loadedStation.backgroundImage + ")")
            .css("padding-top", loadedStation.paddingTop);
        loadFile("../stationconfig/" + loadedStation.text['de'], function(result) {
            sideloadContent(stationIdx, loadedStation, result, function() {
                $("h1").addClass("accentColor").css("color", loadedStation.accentColor);
                $("h3").addClass("accentColor").css("color", loadedStation.accentColor);
                $(".box").css("background-color", loadedStation.boxBackgroundColor);
                $(".choice.enabled").css("background-image", "linear-gradient(to bottom, " + loadedStation.choiceEnabledGradientStartColor + ", " + loadedStation.choiceEnabledGradientEndColor + ")");
                $(".choice.disabled").css("background-image", "linear-gradient(to bottom, " + loadedStation.choiceDisabledGradientStartColor + ", " + loadedStation.choiceDisabledGradientEndColor + ")");
                $(".choice").css("color", loadedStation.choiceTextColor);
            });
        });
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

function parseStoryQuestArticleML(html) {
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
    if (typeof questML[token[0]] != "undefined") {
        var command = token[0];
        token.splice(0,1);
        return questML[command](token);
    }
    else
        return statement;
}

/**
 * Sideloads the given StoryQuest station.
 *
 * @param stationIdx
 * @param config
 * @param configAsset
 */
function sideloadContent(stationIdx, config, configAsset, callback) {
    currentStationId = stationIdx;

    // parsing config
    currentStation = config;
    var contentElem = $("#content");

    // parsing & setting text content
    var tree = markdown.parse(configAsset, "Gruber");

    // convert the tree into html
    var htmlTree = markdown.toHTMLTree(tree);

    // postparsing
    (function find_link_refs(node) {
        if (node[0] === "a") {
            var href = node[1].href;
            var linktext = node[2];
            if (href.lastIndexOf("node:")==0) {
                node[1].href = "#";
                node[1].onclick = "alert('HALLO')";
            }
        } else {
            for (var i=1; i<node.length; i++)
                if (Array.isArray(node[i]))
                    find_link_refs(node[i]);
        }
    })(htmlTree);

    // finalizing rendering
    var html = markdown.renderJsonML(htmlTree);
    html = parseStoryQuestArticleML(html);
    contentElem.html(html);

    // register hooks for enabled choices
    $(".choice.enabled").each(function(idx, elem) {
        $(elem).hammer().on("tap", function(event) {
            playButtonSound();
            toStation($(event.target).attr("data-target"));
        });
    });

    // call callback
    if (callback)
        callback();

    // finally call onEnter
    onEnter();
}

$(document).ready(function() {
    autoSwitchContent();
});