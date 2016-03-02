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

/*var whattodo;

function saveOrNoSave() {
    model.previousNodetype == "create" ? whattodo = "load" : whattodo = "save";
    console.log("i am "+whattodo);
}*/

$(document).ready(function(){

    //saveOrNoSave();
    //if (whattodo == 'load') {
        function updateBookmarksList() {
            var bmks = listBookmarks();
            $("#bookmarks").empty();
            for (var i = 0; i < bmks.length; i++) {
                var bDate = new Date(bmks[i].date);
                var strDate = ""
                    + (bDate.getHours() < 10 ? "0" + bDate.getHours() : bDate.getHours()) + ":"
                    + (bDate.getMinutes() < 10 ? "0" + bDate.getMinutes() : bDate.getMinutes()) + ":"
                    + (bDate.getSeconds() < 10 ? "0" + bDate.getSeconds() : bDate.getSeconds());
                $("#bookmarks").append("<div class='bookmark'><div class='bkmktext' data-bookmark='" + bmks[i].id + "'><span class='bname'>" + bmks[i].name + "</span><br><span class='bdate'>" + bDate.getDate() + "." + (bDate.getMonth() + 1) + "." + bDate.getFullYear() + ", " + strDate + "</span></div><div class='bkmktrash' data-bookmark='" + bmks[i].id + "'><img src='../images/trashicon.png'></div></div>");
            }
            // bookmark delete listener
            $(".bkmktrash").hammer().on("tap", function (event) {
                showTwoButtonBox(i18n[lang]['deletebookmarks'], "images/settings-delete-bookmark.png", i18n[lang]['deletebookmark'], i18n[lang]['yes'], i18n[lang]['no'], function () {
                    console.log("Deleting bookmark " + $(event.currentTarget).attr("data-bookmark"));
                    deleteBookmark($(event.currentTarget).attr("data-bookmark"));
                    updateBookmarksList();
                }, function () {
                });
            });
            // bookmark load listener
            $(".bkmktext").hammer().on("tap", function (event) {
                playButtonSound();
                showTwoButtonBox(i18n[lang]['loadbookmarks'], "images/settings-load-bookmark.png", i18n[lang]['usebookmark'], i18n[lang]['yes'], i18n[lang]['no'], function () {
                    console.log("Loading bookmark " + $(event.currentTarget).attr("data-bookmark"));
                    loadBookmark($(event.currentTarget).attr("data-bookmark"));
                }, function () {
                });
            });
        }

        // load configuration
        currentStationId = params.station || "config";
        loadFile("../stationconfig/" + currentStationId + ".json", function (result) {
            currentStation = JSON.parse(result);
            // finally call onEnter
            onEnter();
        });

        // cancel listener
        $("#cancel").hammer().on("tap", function (event) {
            playButtonSound();
            toStation(model.previousNodeId);
        });

        // load and display bookmarks
        updateBookmarksList();
    /*    }
    if (whattodo == 'save') {
        console.log("it begins mate");

        function updateBookmarksListSave() {
            var bmks = listBookmarks();
            $("#bookmarks").empty();
            for (var i = 0; i < bmks.length; i++) {
                var bDate = new Date(bmks[i].date);
                var strDate = ""
                    + (bDate.getHours() < 10 ? "0" + bDate.getHours() : bDate.getHours()) + ":"
                    + (bDate.getMinutes() < 10 ? "0" + bDate.getMinutes() : bDate.getMinutes()) + ":"
                    + (bDate.getSeconds() < 10 ? "0" + bDate.getSeconds() : bDate.getSeconds());
                $("#bookmarks").append("<div class='bookmark'><div class='bkmktext' data-bookmark='" + bmks[i].id + "'><span class='bname'>" + bmks[i].name + "</span><br><span class='bdate'>" + bDate.getDate() + "." + (bDate.getMonth() + 1) + "." + bDate.getFullYear() + ", " + strDate + "</span></div><div class='bkmktrashsave' data-bookmark='" + bmks[i].id + "'><img src='../images/trashicon.png'></div></div>");
            }
            // bookmark delete listener
            $(".bkmktrashsave").hammer().on("tap", function (event) {
                showTwoButtonBox(i18n[lang]['deletebookmarks'], "images/settings-delete-bookmark.png", i18n[lang]['deletebookmark'], i18n[lang]['yes'], i18n[lang]['no'], function () {
                    console.log("Deleting bookmark " + $(event.currentTarget).attr("data-bookmark"));
                    deleteBookmark($(event.currentTarget).attr("data-bookmark"));
                    updateBookmarksListSave();
                }, function () {
                });
            });
            // overwrite bookmark listener
            $(".bkmktext").hammer().on("tap", function (event) {
                playButtonSound();
                showTwoButtonBox(i18n[lang]['savebookmarks'], "images/settings-load-bookmark.png", i18n[lang]['overwritebookmark'], i18n[lang]['yes'], i18n[lang]['no'], function () {
                    console.log("Loading bookmark " + $(event.currentTarget).attr("data-bookmark"));
                    loadBookmark($(event.currentTarget).attr("data-bookmark"));
                }, function () {
                });
            });

            $("#bookmarks").append("<div class='bookmark'><div class='newbookmark' ><span class='bname'>"+i18n[lang]['newbookmark']+"</span></div></div>");
            // new bookmark listener
            $(".newbookmark").hammer().on("tap", function (event) {
                playButtonSound();
                showTwoButtonBox(i18n[lang]['savebookmarks'], "images/settings-load-bookmark.png",'<input id="bookmarkname" placeholder="'+model.name+new Date()+'"><br />' + i18n[lang]['newbookmark'], i18n[lang]['yes'], i18n[lang]['no'], function () {
                    playButtonSound();
                    var bookmark = {
                        id: uuid(),
                        name: htmlEntities($("#bookmarkname").val()),
                        date: new Date(),
                        model: model,
                        currentStation: model.previousNodeId
                    };
                    bookmarks.push(bookmark);
                    sqStorage.setItem("sqBookmarks", ko.toJSON(bookmarks));
                    toStation(model.previousNodeId);
                }, function () {
                });
            });
        }

        // load configuration
        currentStationId = params.station || "config";
        loadFile("../stationconfig/" + currentStationId + ".json", function (result) {
            currentStation = JSON.parse(result);
            // finally call onEnter
            onEnter();
        });

        // cancel listener
        $("#cancel").hammer().on("tap", function (event) {
            playButtonSound();
            toStation(model.previousNodeId);
        });

        updateBookmarksListSave();
    }*/


});