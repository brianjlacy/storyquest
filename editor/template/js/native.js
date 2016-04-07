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

var htmlMusicAudio = null;
var htmlLastMusic = null;
var htmlMusicVolume = 10;
var htmlSFXAudio = {};

var sqStorage = null;
if (typeof nativeStorage != "undefined")
    sqStorage = nativeStorage;
else
    sqStorage = localStorage;

/**
 * All function (or variables) that might be provided by built-in versions in the Questor clients have to be 
 * declared using 'weakDeclare'.
 *
 * Clients make sure that their definitions are done **before** the weak 
 * declarations.
 *
 * Clients do not need a declaration of weakDeclare themselves but they can
 * provide a no-op implementation if they want.
*/
if (!window['weakDeclare']) {
	window['weakDeclare'] = function (name, value) {
		if (!window[name]) {
			window[name] = value;
		}
	}
}

/**
 * Returns true if we're running inside a Questor client context. False otherwise.
 *
 * @returns {boolean}
 */
weakDeclare('questor', function() { return false; });

/**
 * Retrieves an URL, retrieving text content which is asynchronously
 * given to the callback.
 *
 * @param url
 * @param callback
 */
weakDeclare('loadFile', function(url, callback) {
    if (typeof sqSystem != "undefined" && sqSystem.isNativeClient()) {
        // native client
        console.log("Loading file via native API: " + url);
        callback(sqSystem.loadFile(url));
    } else {
        // web client
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange=function() {
            if (xmlhttp.readyState==4 && xmlhttp.status==200) {
                callback(xmlhttp.responseText);
            }
        };
        console.log("Loading file via xmlhttp: " + url);
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }
});

weakDeclare('autoSwitchContent', function() {
    // use the station given by the get parameter "station" or "001" if not given
    var startStation = params.station || "001";

    // loading station data
    switchContent(startStation);
});

weakDeclare('dispatchLocal', function(nextStationConfig) {
    // to be sure, store model here
    storeModel();
    console.log("Next station: " + nextStationConfig.id);
    switchContent(nextStationConfig.id);
});

weakDeclare('toStation', function(stationId, deeplinkId) {
    // we are about to leave the station, call onExit
    onExit();
    if (typeof model!="undefined" && model!=null) {
        model.previousNodeId = currentStation.id;
        model.deepLinkId = deeplinkId;
    }
    loadFile("stationconfig/" + stationId + ".json", function(result) {
        var nextStationConfig = JSON.parse(result);
        dispatchLocal(nextStationConfig);
    });
});

weakDeclare('retrieveModelStr', function() {
    var mdlStr = sqStorage.getItem("sqModel");
    if (mdlStr && mdlStr!="null") {
        return mdlStr;
    } else {
        return null;
    }
});

weakDeclare('storeModelStr', function(modelStr) {
    return sqStorage.setItem("sqModel", modelStr);
});

weakDeclare('initBookmarks', function() {
    var bkmInput = sqStorage.getItem("sqBookmarks") || "[]";
    var strData = JSON.parse(bkmInput);
    if (strData)
        bookmarks = strData;
    return bookmarks;
});

weakDeclare('storeBookmark', function(name) {
    var bookmark = {
        id: uuid(),
        name: name,
        date: new Date(),
        model: model,
        currentStation: currentStationId
    };
    bookmarks.push(bookmark);
    return sqStorage.setItem("sqBookmarks", ko.toJSON(bookmarks));
});

weakDeclare('autoStoreBookmark', function() {
    if (currentStation.type=="create" || currentStation.type=="settings")
        return;
    var bookmark = {
        id: uuid(),
        name: "Autosave",
        date: new Date(),
        model: model,
        currentStation: currentStationId
    };
    console.log("Switching stations, saving autosave bookmark..");
    for (var i=0; i<bookmarks.length; i++)
        if (bookmarks[i].name == title)
            bookmarks.splice(i, 1);
    bookmarks.push(bookmark);
    return sqStorage.setItem("sqBookmarks", ko.toJSON(bookmarks));
});

weakDeclare('loadBookmark', function(id) {
    for (var i=0; i<bookmarks.length; i++)
        if (bookmarks[i].id===id) {
            var modelStr = bookmarks[i].model;
            if (typeof modelStr=='object')
               model = modelStr;
            else 
	       model = JSON.parse(modelStr);
            storeModel();
            toStation(bookmarks[i].currentStation);
        }
});

weakDeclare('listBookmarks', function() {
    return bookmarks;
});

weakDeclare('deleteBookmark', function(id) {
    for (var i=0; i<bookmarks.length; i++)
        if (bookmarks[i].id===id)
            bookmarks.splice(i, 1);
    return sqStorage.setItem("sqBookmarks", ko.toJSON(bookmarks));
});

weakDeclare('initGameCloud', function() {
    if (typeof sqSystem != "undefined")
        sqSystem.initGameCloud();
});

weakDeclare('unlockAchievement', function(achievementId) {
    if (typeof sqSystem != "undefined")
        sqSystem.unlockAchievement(achievementId);
});

weakDeclare('unlockAchievement', function(achievementId) {
    if (typeof sqSystem != "undefined")
        sqSystem.unlockAchievement(achievementId);
});

weakDeclare('displayAchievements', function() {
    if (typeof sqSystem != "undefined")
        sqSystem.displayAchievements();
});

weakDeclare('playSFXOnce', function(soundfile) {
    if (typeof sqSound != "undefined")
        sqSound.playSFXOnce(soundfile);
    else
        playSFXOnceHTML(soundfile);
});

weakDeclare('playMusicLoop', function(soundfile) {
    if (typeof sqSound != "undefined")
        sqSound.playMusicLoop(soundfile);
    else
        playMusicLoopHTML(soundfile);
});

weakDeclare('stopMusicLoop', function() {
    if (typeof sqSound != "undefined")
        sqSound.stopMusicLoop();
    else
        stopMusicLoopHTML();
});

weakDeclare('setMusicEnabled', function(enabled) {
    model.isMusicOn = enabled;
    storeModel();
    if (typeof sqSound != "undefined")
        sqSound.setMusicEnabled(enabled);
    else {
        model.isMusicOn = enabled;
        if (model.isMusicOn && htmlLastMusic)
            playMusicLoopHTML(htmlLastMusic);
        else if (!model.isMusicOn)
            stopMusicLoop()
    }
});

weakDeclare('toggleMusic', function() {
    if (typeof model.isMusicOn=="undefined")
        model.isMusicOn = true;
    model.isMusicOn = !model.isMusicOn;
    setMusicEnabled(model.isMusicOn);
    storeModel();
});

weakDeclare('exitClient', function() {
    //if (typeof sqSystem!="undefined" && sqSystem.isNativeClient()) {
	if (typeof sqSystem != "undefined" && typeof sqSystem.exit != "undefined") {
        // native client
        console.log("Exit called on native client, exiting app.");
        sqSystem.exit();
    } else {
        console.log("Exit client called. HTML5 mode enabled, not exiting.")
    }
});

/*
 * Native HTML5 sound methods
 */

function playMusicLoopHTML(soundfile) {
    htmlLastMusic = soundfile;
    if (!htmlMusicAudio) {
        htmlMusicAudio = new Audio("../" + soundfile);
        $("body").append(htmlMusicAudio);
        $(htmlMusicAudio).on("canplay", function() {
            htmlMusicAudio.play();
            htmlMusicAudio.addEventListener("ended", function() {
                this.currentTime = 0;
                this.play();
            }, false);
        });
    } else {
        htmlMusicAudio.src = "../" + soundfile;
        htmlMusicAudio.play();
    }
}

function stopMusicLoop() {
    if (htmlMusicAudio){
            for (var vol=1; vol<=10; vol++)
                setTimeout(function() {
                htmlMusicVolume--;
                if (htmlMusicVolume==0) {
                    htmlMusicAudio.pause();
                    htmlMusicVolume = 10;
                    htmlMusicAudio.volume = 1;
                }
                else
                    htmlMusicAudio.volume = htmlMusicVolume*0.1;
            }, vol*50);
        }
}

function playSFXOnceHTML(soundfile) {
    var key = soundfile.replace("/", "_").replace(".", "_");
    if (typeof htmlSFXAudio[key] == "undefined") {
        htmlSFXAudio[key] = new Audio(soundfile);
        $("body").append(htmlSFXAudio[key]);
        $(htmlSFXAudio[key]).on("canplay", function() {
            htmlSFXAudio[key].play();
            htmlSFXAudio[key].addEventListener("ended", function() {
                this.pause();
            }, false);
        });
    } else {
        htmlSFXAudio[key].play();
    }
}

