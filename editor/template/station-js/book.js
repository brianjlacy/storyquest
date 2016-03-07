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

// text pager
var pager = null;

/**
 * Switches to the given StoryQuest book station. This loads the corresponding
 * data from the server.
 *
 * @param stationIdx
 */
function switchContent(stationIdx) {
    if ($("#debugnodeid").length > 0)
        $("#debugnodeid").html("" + stationIdx);
    loadFile("../stationconfig/" + stationIdx + ".json", function(result) {
        var loadedStation = JSON.parse(result);
        loadFile("../stationconfig/" + loadedStation.text[lang], function(result) {
            sideloadContent(stationIdx, loadedStation, result);
            autoStoreBookmark();
        });
    });
};

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
    $("#so_content").css("color", currentStation.slideoutTextColor);
    $("#slideout").css("background-image", "url(../" + currentStation.slideoutBackgroundImage + ")");

    // parsing text asset
    if (pager) {
        pager.deleteData();
    }
    pager = new Pager(configAsset, contentElem, function() {
        // register hooks for enabled choices
        $(".choice.enabled").each(function(idx, elem) {
            $(elem).hammer().on("tap", function(event) {
                playButtonSound();
                toStation($(event.target).attr("data-target"));
            });
        });
        $(".task.enabled").each(function(idx, elem) {
            $(elem).hammer().on("tap", function(event) {
                playButtonSound();
                toStation($(event.target).attr("data-target"));
            });
        });
        $(".battle.enabled").each(function(idx, elem) {
            $(elem).hammer().on("tap", function(event) {
                playButtonSound();
                toStation($(event.target).attr("data-target"));
            });
        });
    });

    // initial setup of font settings
    pager.setFontFamily(model.fontFamily);
    pager.setFontSize(model.fontSize);

    // initial setup op page curls
    $("#npleft").hide();
    if (pager.hasMorePages())
        $("#npright").show();
    else
        $("#npright").hide();

    if (model.pageblink)
        startPagingBlink();
    else
        stopPagingBlink();

    // finally call onEnter

    changePages();

    onEnter();

    // display counter and effects
    $("#counterLabel").html(localStorage.getItem("counterLabel"));
    $("#counterValue").html(localStorage.getItem("counterValue"));
    var verwundet = localStorage.getItem("verwundet");
    var bewaffnet = localStorage.getItem("bewaffnet");
    var effectStr = "";
    if (typeof bewaffnet!="undefined" && bewaffnet!="" && parseInt(bewaffnet)==1)
        effectStr+=i18n[lang].armedicon ;
    if (typeof verwundet!="undefined" && verwundet!="" && parseInt(verwundet)==1)
        effectStr+=i18n[lang].woundedicon ;
    $("#effects").html(effectStr);

}

function refreshPage() {
    pager.clearPage();
    pager.displayPage(pager.currentPageIdx);
}

function bookNextPage() {
    if (pager.hasMorePages())
        playSFXOnce("sounds/pageturn.mp3")
    pager.nextPage();
    if (pager.getPageIdx()>0)
        $("#npleft").show();
    else
        $("#npleft").hide();
    if (pager.hasMorePages())
        $("#npright").show();
    else
        $("#npright").hide();
    // iOS page size workaround for getting the right page size
    $("#bgimage").css("height", (Math.floor($("#body").height()*0.9)+1) + "px");
}

function bookPrevPage() {
    if (pager.getPageIdx()>0)
        playSFXOnce("sounds/pageturn.mp3")
    pager.previousPage();
    if (pager.getPageIdx()>0)
        $("#npleft").show();
    else
        $("#npleft").hide();
    if (pager.hasMorePages())
        $("#npright").show();
    else
        $("#npright").hide();
    // iOS page size workaround for getting the right page size
    $("#bgimage").css("height", Math.floor($("#body").height()*0.9) + "px");
}
function postBinding () {
    for (var i = 0;i<model.items().length;i++){

        var stockElem = $("tr[data-id='" + model.items()[i].id + "'] .stock");
        if (stockElem.length>0 && model.items()[i].stock>1)
            stockElem.html(" (" + model.items()[i].stock + "x)");
        else
            stockElem.html("");
    }
}

var leftPagerInterval = null;
var rightPagerInterval = null;

function startPagingBlink() {
    leftPagerInterval = setInterval(function() {
        $("#npleft").transition({ opacity: 0, duration: 1500 });
        $("#npleft").transition({ opacity: 100, duration: 1500 });
    }, 3000);

    rightPagerInterval = setInterval(function() {
        $("#npright").transition({ opacity: 0, duration: 1500 });
        $("#npright").transition({ opacity: 100, duration: 1500 });
    }, 3000);
}

function stopPagingBlink() {
    if (leftPagerInterval!=null)
        clearInterval(leftPagerInterval);
    if (rightPagerInterval!=null)
        clearInterval(rightPagerInterval);
}

function changePages(){

    for(var i=0;i<model.readPages[currentStationId];i++){
        setTimeout(function(){ bookNextPage(); }, 300*(i+1));
    }
}

$(document).ready(function() {

    // navigation setup
    $("#pagingelems").hammer().on("swiperight", function(event) {
        bookPrevPage();
    });
    $("#pagingelems").hammer().on("swipeleft", function(event) {
        bookNextPage();
    });
    $("#pageprev").hammer().on("tap", function(event) {
        bookPrevPage();
    });
    $("#pagenext").hammer().on("tap", function(event) {
        bookNextPage();
    });

    autoSwitchContent();

});