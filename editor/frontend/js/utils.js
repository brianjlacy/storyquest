/*
 * StoryQuest 2
 *
 * Copyright (c) 2015 Questor GmbH
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

function isEmpty(obj) {
    // null and undefined are "empty"
    if (obj == null) return true;
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;
    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
}

function objectsEqual(objA, objB) {
    // copy objects
    var cA = JSON.parse(JSON.stringify(objA));
    var cB = JSON.parse(JSON.stringify(objB));

    // delete revisions
    delete cA._rev;
    delete cB._rev;

    if (cA.username) {
        // user type object
        if (cA.projectInfos)
            delete cA.projectInfos;
        if (cB.projectInfos)
            delete cB.projectInfos;
    } else {
        // project type object
        delete cA.changed;
        delete cB.changed;
    }

    // finally, return equality from underscore
    return _.isEqual(cA, cB);
}

/*
 * Make sure that the content area is streched full height
 * ---------------------------------------------
 * We are gonna assign a min-height value every time the
 * wrapper gets resized and upon page load. We will use
 * Ben Alman's method for detecting the resize event.
 * Taken from adminLTE code.
 **/
function _fixContent() {
    //Get window height and the wrapper height
    var height = $(window).height() - $("body > .header").height();
    $(".wrapper").css("min-height", height + "px");
    var content = $(".wrapper").height();
    var finalHeight = 0;
    //If the wrapper height is greater than the window
    if (content > height) {
        //then set height to the wrapper
        $(".right-side").css("min-height", content + "px");
        $(".right-side").css("height", content + "px");
        finalHeight = content;
    } else {
        //Otherwise, set the to the height of the window
        $(".right-side").css("min-height", height + "px");
        $(".right-side").css("height", height + "px");
        finalHeight = height;
    }
    // get height of the content header
    var headerHeight = $(".content-header").outerHeight();
    $(".content").css("height", (finalHeight-headerHeight) + "px");
}

function pageTitle(pageTitle, pageSubtitle) {
    $("#pagetitle").html(pageTitle);
    $("#pagesubtitle").html(pageSubtitle);
}

function breadcrumb(list) {
    $(".breadcrumblist").empty();
    $(".breadcrumblist").append("<li><a href='#'><i class='fa fa-dashboard'></i><span>Home</span></a></li>");
    for (var i=0; i<list.length-1; i++)
        $(".breadcrumblist").append("<li><a href='" + list[i].url + "'>" + list[i].title + "</a></li>");
    $(".breadcrumblist").append("<li class='active'>" + list[list.length-1].title + "</li>");
}

function online() {
    $("#onlineindicatoricon").css("color", "green");
    $("#onlineindicator").html("Online");
}

function offline() {
    $("#onlineindicatoricon").css("color", "red");
    $("#onlineindicator").html("Offline");
}

function openEveryScreenBox() {
    modalWarning("EveryScreen Technology", "The Questor EveryScreen Technology aims to bring your content to as much people as possible. We strife for making content available to every device with a screen. Based on HTML5 and native components, EveryScreen is built to be portable across many current and future devices. If you publish your content using StoryQuest, you can be sure that you reach a maximum of potential readers or customers.");
}

/*
 * Feed - A client-side library that work like a Feed Reader
 * http://github.com/evandrolg/Feed
 * author: Evandro Leopoldino Goncalves <evandrolgoncalves@gmail.com>
 * http://github.com/evandrolg
 * License: MIT
 */
(function() {

    'use strict';

    var root = this;

    var jsonp = function(context, url, callback) {
        root.Fe = {};

        root.Fe.callback = function(data) {
            callback.call(context, data.responseData);
        };

        var script = document.createElement('script');
        script.src = url;
        document.getElementsByTagName('head')[0].appendChild(script);
    };

    var Feed = function(params) {
        var that = this;

        var cachedVariables = function(params) {
            var hasURL = this.url = params.url;

            if (!hasURL) {
                throw 'You need pass URL like parameter!';
            }

            this.context = params.context || root;
            this.limit = params.limit || 10;
            this.callback = params.callback || function() {};
        }.call(that, params);

        var request = function() {
            var urlGoogle = 'https://ajax.googleapis.com/ajax/services/feed/' +
                'load?v=1.0&num={{ NUM }}&callback=Fe.callback&q={{ URL }}&_=123';

            var url = urlGoogle.replace('{{ URL }}', encodeURIComponent(this.url))
                .replace('{{ NUM }}', this.limit);

            jsonp(this.context, url, this.callback);
        }.call(that);
    };

    root.Feed = function(params) {
        return new Feed(params);
    };

}).call(this);

function ping() {
    $.get("api/heartbeat", function() {
    }).done(function() {
        online();
    }).fail(function() {
        offline();
    });
}
setInterval(ping, 3000);

//Fire upon load
$(document).ready(function() {
    _fixContent();
    //Fire when wrapper is resized
    $(".wrapper").resize(function() {
        _fixContent();
    });
});
