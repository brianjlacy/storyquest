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

var currentDocumentId = null;
var lastDocumentId = null;

function switchContent(stationIdx) {
    loadFile("../stationconfig/" + stationIdx + ".json", function(result) {
        var loadedStation = JSON.parse(result);
        loadFile("../stationconfig/" + loadedStation.text[lang], function(result) {
            sideloadContent(stationIdx, loadedStation, result);
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

function showResultList() {
    $("#text").hide();
    clearResultList();
    $("#resultlist").show();
}

function showText() {
    $("#text").show();
    $("#resultlist").hide();
}

function clearResultList() {
    $("#resultlist").empty();
}

function addToResultList(document) {
    $("#resultlist").append("<li><a href='#' class='documententry' id='" + document.id + "'><div><img src='" + document.icon + "'></div><span>" + document.title[lang] + "</span></a></li>");
    $("#"+document.id).hammer().on("tap", function(event) {
        console.log("Selected document from list: " + document.id);
        loadDocument(document.id);
    });
}

function search(input) {
    currentResultList = [];
    showResultList();
    var foundEntries = 0;
    for (var i=0; i<currentStation.index.length; i++) {
        var thisDocument = currentStation.index[i];
        var keys = thisDocument.keys;
        for (var j=0; j<keys.length; j++)
            if (input.toLowerCase().indexOf(keys[j].toLowerCase())!=-1) {
                currentResultList.push(thisDocument);
                addToResultList(thisDocument);
                foundEntries++;
            }
    }
    if (foundEntries==0)
        $("#resultlist").append("<li><span class='nothingfound'>Nothing found..</span></li>");
    else
        $("#textarea").val("");
}

function setTitle(title) {
    $("#titletext").html(title);
}

function parseHTML(input) {
    // parsing & setting text content
    var tree = markdown.parse(input, "Gruber");

    // convert the tree into html
    var htmlTree = markdown.toHTMLTree(tree);

    // postparsing
    (function find_link_refs(node) {
        if (node[0] === "a") {
            var href = node[1].href;
            var linktext = node[2];
            if (href.lastIndexOf("node:")==0) {
                node[1].href = "#";
                node[1].onclick = "alert('CLICK')";
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
    return html;
}

function loadDocument(documentId) {
    if (documentId==null || typeof documentId=="undefined") {
        showText();
        loadFile("../stationconfig/" + currentStation.text[lang], function(result) {
            var html = parseHTML(result);
            $("#text").html(html);
        });
    } else
        for (var i=0; i<currentStation.index.length; i++) {
            var thisDocument = currentStation.index[i];
            if (thisDocument.id==documentId) {
                loadFile("../stationconfig/" + thisDocument.text[lang], function(result) {
                    currentDocumentId = documentId;
                    html = parseHTML(result);
                    showText();
                    $("#text").html(html);
                    setTitle(thisDocument.title[lang]);
                    $(".choice.enabled").each(function(idx, elem) {
                        $(elem).hammer().on("tap", function(event) {
                            playButtonSound();
                            jumpToDocument($(event.target).attr("data-target"));
                        });
                    });
                });
                return;
            }
        }
}

function jumpToDocument(documentId) {
    console.log("Link to document touched: " + documentId);
    lastDocumentId = currentDocumentId;
    loadDocument(documentId);
}

function sideloadContent(stationIdx, config, configAsset) {
    currentStationId = stationIdx;

    // parsing config
    currentStation = config;

    // load initial document, retrieve temporary model here
    var deepLinkId = model.deepLinkId;
    // override by GET param
    if (typeof params.documentId!="undefined")
        deepLinkId = params.documentId;
    if (typeof deepLinkId!="undefined" && deepLinkId!="")
        loadDocument(deepLinkId);
    else
    // load defaultText
        loadDocument();
    // remove deepLinkId to avoid using it over and over again
    model.deepLinkId=undefined;

    // finally call onEnter
    onEnter();
}

$(document).ready(function() {

    $("#searchButton").hammer().on("tap", function(event) {
        playButtonSound();
        var text = $("#textarea").val();
        if (text && text!="") {
            search(text);
        }
    });

    $("#backButton").hammer().on("tap", function(event) {
        playButtonSound();
        if (typeof lastDocumentId!="undefined" && lastDocumentId!=null && lastDocumentId!="") {
            jumpToDocument(lastDocumentId);
        } else if (currentResultList && currentResultList.length>0) {
            showResultList();
            for (var i=0;i<currentResultList.length; i++)
                addToResultList(currentResultList[i]);
        }
    });

    autoSwitchContent();
});