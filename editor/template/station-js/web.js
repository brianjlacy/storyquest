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
        loadFile("../stationconfig/" + loadedStation.text['de'], function(result) {
            sideloadContent(stationIdx, loadedStation, result);
        });
    });
};

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
 * Sideloads the given StoryQuest book station.
 *
 * @param stationIdx
 * @param config
 * @param configAsset
 */
function sideloadContent(stationIdx, config, configAsset) {
    currentStationId = stationIdx;

    // parsing config
    currentStation = config;
    var contentElem = $("#content");
    contentElem.css("color", currentStation.textColor);
    $("#background").css("background-color", currentStation.backgroundColor);
    if (currentStation.backgroundImage)
        $("#bgimage").attr("src", "../images/" + currentStation.backgroundImage);
    $("#header").css("color", currentStation.headerColor);
    $("#headertext").html(currentStation.headerText[lang]);

    // enable buttons based on configuration
    if (typeof currentStation.nextStation!="undefined" && currentStation.nextStation!="")
        $("#continue").show();
    else
        $("#cancel").show();

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
    $("#content").html(html);

    // setting up scroll indicator
    var contentScroller = $("#content");
    if( contentScroller.prop("offsetHeight") < contentScroller.prop("scrollHeight")) {
        $("#indicator").show();
    }
    contentScroller.scroll(function() {
        buffer = 40; // # of pixels from bottom of scroll to fire your function. Can be 0.
        if (contentScroller.prop('scrollHeight') - contentScroller.scrollTop() <= contentScroller.height() + buffer )   {
            $("#indicator").hide();
        } else {
            $("#indicator").show();
        }
    });

    // register hooks for enabled choices
    $(".choice.enabled").each(function(idx, elem) {
        $(elem).hammer().on("tap", function(event) {
            playButtonSound();
            toStation($(event.target).attr("data-target"));
        });
    });

    // finally call onEnter
    onEnter();
};



$(document).ready(function() {
    
    // cancel listener
    $("#cancel").hammer().on("tap", function(event) {
        playButtonSound();
        toStation(model.previousNodeId);
    });

    // continue listener
    $("#continue").hammer().on("tap", function(event) {
        playButtonSound();
        toStation(currentStation.nextStation);
    });

    setInterval(function() {
        $("#indicator").transition({ opacity: 0, duration: 1500 });
        $("#indicator").transition({ opacity: 0.5, duration: 1500 });
    }, 3000);

    autoSwitchContent();
});