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

editorModule.directive("sqdefaulteditor", function() {
    return {
        restrict: "E",
        templateUrl: "views/directives/default.html",
        replace: true,
        scope: true,
        controller: "editorDefaultController"
    };
});

// configure snippets for the editor
ace.define('ace/snippets/markdown', ['require', 'exports', 'module' ], function(require, exports, module) {
    exports.snippetText = "# Markdown\n\
\n\
# Includes octopress (http://octopress.org/) snippets\n\
# IMPORTANT: USE TAB CHARACTER BEFORE RECEIPE - OTHERWISE THE SNIPPET WILL NOT BE REGISTERED\n\
\n\
snippet Node Link\n\
	{link(${1:target node id}, ${2:flag name}, ${3:is visible condition}, ${4:is enabled condition}):${5:link text}}\n\
\n\
snippet Inline Node Link\n\
	{link(${1:target node id}, ${2:flag name}, ${3:is visible condition}, ${4:is enabled condition}):${5:link text}}\n\
\n\
snippet Text Box\n\
	{box(${1:styling class}):${2:box text}}\n\
\n\
snippet Image\n\
	{image(${1:styling class}):${2:image filename}}\n\
\n\
snippet Button\n\
	{button(${1:flag name}, ${2:is visible condition}, ${3:is enabled condition}):${4:button text}}\n\
\n\
snippet Condition\n\
	{when(${1:flag or expression}:${2:text}}\n\
\n\
snippet Dropin\n\
	{dropin(${1:dropin name}:${2:body text}}\n\
\n\
snippet Set Variable\n\
	{set(${1:value}:${2:variable name}}\n\
\n\
snippet Insert Variable\n\
	{${1:variable name}}\n\
\n\
snippet Insert List Value\n\
	{|${1:value 1}|${2:value 2}|}\n\
\n\
";
    exports.scope = "markdown";

});

var editorDefaultModule = angular.module("editorDefaultModule", [ "ngResource", "ui.ace" ]);

editorDefaultModule.controller("editorDefaultController", ["$scope", "TypeIcons", "$http",
    function ($scope, TypeIcons, $http) {

        TypeIcons.registerType("default", "glyphicon-globe");

        // initializing ace completer for markdown
        // note: completers are global for all ace instances
        $scope.aceLangTools = ace.require("ace/ext/language_tools");
        $scope.aceLangTools.addCompleter($scope.sqCompleter);
        ace.config.set("basePath", "js/");

        $scope.$watch("node", function() {
            if ($scope.node && $scope.node.type == "default") {
                console.log("Loading default node data: " + $scope.node.id);
                $scope.setContentEditorEnabled(true);
                $scope.setConfigurationEditorEnabled(true);
            }
            // refresh node and image list
            $scope.refreshNodeList();
            $scope.refreshImageList();
        });

        $scope.refreshNodeList = function() {
            if ($scope.project.data && $scope.project.data.id)
                $http({method: "GET", url: "/api/sequence/" + $scope.project.data.id}).
                success(function(sequence, status, headers, config) {
                    $http({method: "GET", url: "/api/nodelist/" + $scope.project.data.id}).
                    success(function(nodes, status, headers, config) {
                        $scope.nodelist = [];
                        if (sequence.length==0)
                            $scope.nodelist=nodes;
                        else
                            for (var i=0; i<sequence.length; i++)
                                for (var j=0; j<nodes.length; j++)
                                    if (nodes[j].id===sequence[i])
                                        $scope.nodelist.push(nodes[j]);
                    }).
                    error(function(data, status, headers, config) {
                        modalError("Error " + status + " when reading data. Please try again.");
                    });
                }).
                error(function(data, status, headers, config) {
                    modalError("Error " + status + " when reading data. Please try again.");
                });
        };

        $scope.refreshImageList = function() {
            if ($scope.project.data && $scope.project.data.id)
                $.ajax({
                    url: "/api/media/" + $scope.project.data.id
                }).done(function (list) {
                    $scope.imagelist = [];
                    for (var i = 0; i < list.length; i++)
                        $scope.imagelist.push({filename: list[i].replace(/.*\//, ""), path: list[i]});
                });
        };

        $scope.aceLoaded = function(editor) {
            if (editor) {
                $scope.webnodeeditor = editor;
                editor.setFontSize(20);
                editor.setShowPrintMargin(false);
                editor.getSession().setMode("ace/mode/markdown");
                editor.getSession().setUseWrapMode(true);
                editor.setOptions({
                    enableBasicAutocompletion: true,
                    enableSnippets: true
                });
                if ($scope.sqAceLoaded)
                    $scope.sqAceLoaded(editor);
                // this seems to be a bug in angular-ace: aceLoaded gets called twice with editor.completers==undefined first
                // strip all completers besides snippets and our own.
                if (editor.completers)
                    editor.completers = [ editor.completers[0], $scope.sqCompleter ];
            }
        };

        $scope.aceChanged = function(e) {
            $scope.nodeChanged($scope.node);
        };

        $scope.insertLink = function(newLinkTarget, newLinkText) {
            if (newLinkTarget && newLinkText)
                $scope.webnodeeditor.insert("{link(" + newLinkTarget + "):" + newLinkText + "}");
            else
                $("#modalLink").modal();
        };

        $scope.insertImage = function(newAlignment, newImage) {
            if (newImage)
                $scope.webnodeeditor.insert("{image(" + newAlignment + "):" + newImage.replace(/.*\//, "") + "}");
            else {
                $scope.newAlignment = "center";
                $("#modalImage").modal();
            }
        };

        $scope.insertBox = function() {
            var text = $scope.webnodeeditor.getSession().doc.getTextRange($scope.webnodeeditor.selection.getRange());
            if (text)
                $scope.webnodeeditor.insert("{box(center):" + text + "}");
            else
                $scope.webnodeeditor.insert("{box(center):}");
        };

        $scope.insertHeadline = function() {
            var text = $scope.webnodeeditor.getSession().doc.getTextRange($scope.webnodeeditor.selection.getRange());
            if (text)
                $scope.webnodeeditor.insert("# " + text);
            else
                $scope.webnodeeditor.insert("# ");
        };

        $scope.insertEmphasis = function() {
            var text = $scope.webnodeeditor.getSession().doc.getTextRange($scope.webnodeeditor.selection.getRange());
            if (text)
                $scope.webnodeeditor.insert("*" + text + "*");
            else
                $scope.webnodeeditor.insert("**");
        };

        $scope.insertStrong = function() {
            var text = $scope.webnodeeditor.getSession().doc.getTextRange($scope.webnodeeditor.selection.getRange());
            if (text)
                $scope.webnodeeditor.insert("**" + text + "**");
            else
                $scope.webnodeeditor.insert("****");
        };

        // setup questML parser
        if (!$scope.questMLParser)
            $.get( "/questml.peg", function( data ) {
                $scope.questMLParser = PEG.buildParser(data);
                console.log("QuestML parser active");
            });

        // autocompleter configuration
        $scope.sqCompleter = {
            getCompletions: function(editor, session, pos, prefix, callback) {

                var row = pos.row;
                var col = pos.column;
                var line = session.getLine(row);

                console.log("Completion requested..");

                // determine command name
                var command = "";
                var commandStartIndex = col;
                var stack = 0;
                var currentRow = row;
                var currentIdx = col;
                var currentLine = "" + line;
                // backtrace
                while (!(currentLine.charAt(currentIdx)=="{" && stack==0) && !(currentRow<=0 && currentIdx<=0)) {
                    var currentChar = currentLine.charAt(currentIdx);
                    if (currentChar=="}" && currentIdx!=col)
                        stack++;
                    else if (currentChar=="{")
                        stack--;
                    command = currentChar + command;
                    commandStartIndex--;
                    if (currentIdx<=0) {
                        currentLine = session.getLine(--currentRow);
                        currentIdx = currentLine.length-1;
                    } else
                        currentIdx--;
                }
                // forward trace
                stack = 0;
                currentRow = row;
                currentIdx = col;
                currentLine = "" + line;
                while (!(currentLine.charAt(currentIdx)=="}" && stack==0) && !(currentRow==session.getLength()-1 && currentIdx>currentLine.length-1)) {
                    currentChar = currentLine.charAt(currentIdx);
                    if (currentChar=="{" && currentIdx!=col)
                        stack++;
                    else if (currentChar=="}")
                        stack--;
                    command = command + currentChar;
                    if (currentIdx>currentLine.length-1) {
                        currentLine = session.getLine(++currentRow);
                        currentIdx = 0;
                    } else
                        currentIdx++;
                }
                // add parentheses if they were cut off
                if (command.charAt(0)!="{")
                    command = "{" + command;
                if (command.charAt(command.length-1)!="}")
                    command = command + "}";
                // parse the command
                var commandObj = $scope.questMLParser.parse(command);
                // if this is a command for which we support completion, continue
                if (typeof commandObj=="object" && commandObj.type=="command") {
                    // find out position inside of command
                    var colInCommand = col - commandStartIndex;
                    var commandPosition = "outside";
                    var paramNumber = 0;
                    var idx = colInCommand;
                    while (idx>0 && commandPosition=="outside") {
                        if (command.charAt(idx)==":")
                            commandPosition = "body";
                        else if (command.charAt(idx)=="(") {
                            commandPosition = "params";
                            // find out which param we're in
                            // trick: we're counting the ',' left of cursor position
                            for (var i=idx; i<colInCommand; i++)
                                if (command.charAt(i)==",")
                                    paramNumber++;
                        }
                        idx--;
                    }
                    console.log("Command: " + commandObj.command.name);
                    console.log("Scope in Command: " + commandPosition);
                    if (commandPosition=="params")
                        console.log("Parameter context index: " + paramNumber);
                    // display matching completion boxes
                    switch (commandObj.command.name) {
                        case "image":
                            if (commandPosition=="body") {
                                $.ajax({
                                    url: "/api/media/" + $scope.project.data.id
                                }).done(function (list) {
                                    var completions = [];
                                    if (list)
                                        for (var i = 0; i < list.length; i++)
                                            completions.push({name: list[i].replace(/.*\//, ""), value: list[i].replace(/.*\//, ""), score: 10000, meta: "Media Asset"});
                                    callback(null, completions);
                                });
                            } else if (commandPosition=="params" && paramNumber==0)
                                callback(null, [{name: "Left", value: "left", score: 90000, meta: "Alignment"},
                                    {name: "Center", value: "center", score: 90000, meta: "Alignment"},
                                    {name: "Right", value: "right", score: 90000, meta: "Alignment"}]);
                            break;
                        case "link":
                        case "ilink":
                            if (commandPosition=="params" && paramNumber==0) {
                                var completions = [];
                                completions.push({name: "NEW", value: "NEW", score: 90000, meta: "Create new chapter"});
                                $.ajax({
                                    url: "/api/nodelist/" + $scope.project.data.id
                                }).done(function(list) {
                                    if (list)
                                        for (var i=0; i<list.length; i++)
                                            completions.push({name: list[i].id, value: list[i].id, score: 10000, meta: list[i].title});
                                    callback(null, completions);
                                });
                            }
                            break;
                    }
                } else {
                    console.log("Completion outside of allowed scope.");
                    callback(null, []);
                }
            }
        };

    }]
);

