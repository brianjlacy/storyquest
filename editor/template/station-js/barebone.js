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

// model
var items = [
    {"id": "i1", "name": {"de": "Item 1"}, "desc": { "de": "Item 1 Description" } },
    {"id": "i2", "name": {"de": "Item 2"}, "desc": { "de": "Item 2 Description" } },
    {"id": "i3", "name": {"de": "Item 3"}, "desc": { "de": "Item 3 Description" } }
];
var model = {
    attribute1: ko.observable(15),
    attribute2: ko.observable(15),
    attribute3: ko.observable(15),
    items: ko.observableArray()
}
model.items().push(items[0]);

/**
 * Switches to the given StoryQuest text station. This loads the corresponding
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

/**
 * Sideloads the given StoryQuest text station.
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
    $("#headertext").html(currentStation.headerText['de']);

    // parsing text asset
    $("#content").html(configAsset);

    // finally call onEnter
    onEnter();
};

$(document).ready(autoSwitchContent);

