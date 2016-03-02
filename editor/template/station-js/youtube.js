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
        sideloadContent(stationIdx, loadedStation, null);
    });
};

/**
 * Sideloads the given StoryQuest station.
 *
 * @param stationIdx
 * @param config
 * @param configAsset
 */
function sideloadContent(stationIdx, config, configAsset) {
    currentStationId = stationIdx;

    // parsing config
    currentStation = config;
    jQuery("#player").tubeplayer({
        width: "100%", // the width of the player
        height: "100%", // the height of the player
        allowFullScreen: "true", // true by default, allow user to go full screen
        initialVideo: config.youTubeURL.replace("https://www.youtube.com/watch?v=", ""), // the video that is loaded into the player
        preferredQuality: "default",// preferred quality: default, small, medium, large, hd720
        modestbranding: true,
        protocol: "https",
        onPlay: function(id){}, // after the play method is called
        onPause: function(){}, // after the pause method is called
        onStop: function(){}, // after the player is stopped
        onSeek: function(time){}, // after the video has been seeked to a defined point
        onMute: function(){}, // after the player is muted
        onUnMute: function(){}, // after the player is unmuted
        onPlayerEnded: function() { finishVideo(); }
    });


    // finally call onEnter
    onEnter();
};

function finishVideo() {
    if (currentStation.videoActionType=="event" && typeof onVideoAction!="undefined")
        onVideoAction(event);
    else if (currentStation.videoActionType=="web")
        web(currentStation.videoAction);
    else if (currentStation.videoActionType=="link")
        link(currentStation.videoAction);
}

function web(address) {
    alert("TODO: open in browser " + address);
}

function link(nodeId) {
    toStation(nodeId);
}

$(document).ready(autoSwitchContent);