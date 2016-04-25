#!/usr/bin/env node

/*
 * StoryQuest
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

var fs = require("fs");
var program = require("commander");

program
    .version('0.0.1')
    .option("-t, --textfile <textfile>", "The textfile for which a json should be generated")
    .parse(process.argv);

if (program.textfile) {

    var outputFile = program.textfile.replace("_de.txt", ".json");
    var jsonObject = {
        "id": program.textfile.replace("_de.txt", ""),
        "type": "default",
        "title": program.textfile.replace("_de.txt", ""),
        "style": "fullwidth",
        "isStartNode": false,
        "backgroundImage": "default.jpg",
        "backgroundColor": "#efefef",
        "paddingTop": "0",
        "accentColor": "#766278",
        "boxBackgroundColor": "#000000",
        "choiceEnabledGradientStartColor": "#6c5839",
        "choiceEnabledGradientEndColor": "#382c12",
        "choiceDisabledGradientStartColor": "#cda86d",
        "choiceDisabledGradientEndColor": "#9a7931",
        "choiceTextColor": "#dedede",
        "text": {"de": program.textfile},
        "editorColor": "#10e65c",
        "onExit": "",
        "onEnter": ""
    };

    fs.writeFile(outputFile, JSON.stringify(jsonObject), "utf8", function (err) {
        if (err)
            console.log(err)
    });
};