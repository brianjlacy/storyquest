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

/*
 * This code is common to all StoryQuest stations and contains
 * generic utility functions for various things. It also triggers
 * the knockout bindings.
 */

// default i18n
var i18n = { de: { }, en: {} };

// parse get params
var params = retrieveGetParams();

// language - this must be called as an initializer (or at least outside of document.ready()) because
// the result is needed in parts of the code outside of document.ready().
var lang = queryLanguage();

// node result
var nodeResult = null;

// the current station id (used for the external debugging)
var currentStationId = "none";
var currentStation = null;

/**
 * Returns the GET parameters as an object, parameter names as attributes.
 *
 * @returns {Object}
 */
function retrieveGetParams() {
    var prmstr = window.location.search.substr(1);
    var prmarr = prmstr.split ("&");
    var params = new Object();

    for ( var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}

/**
 * Quotes html entities.
 *
 * @param str
 * @returns {string}
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * This function should be executed when the station has completely loaded.
 * All upkeep should be placed here.
 *
 */
function onEnter() {
    if (currentStation.onEnter)
        eval(currentStation.onEnter);
}

/**
 * This function should be executed before the station is left.
 * All upkeep should be placed here.
 *
 */
function onExit() {
    if (currentStation.onExit)
        eval(currentStation.onExit);
}

/**
 * Replaces any occurrence of tokens in a text.
 *
 * @param tokens
 * @param text
 * @returns {*}
 */
function replaceAny(tokens, text) {
    for (var i=0; i<tokens.length; i++)
        text = text.replace(new RegExp("\\$" + i, "g"), tokens[i].replace(/'/g, '"'));

    return text;
}

/**
 * Evaluates a boolean statement.
 *
 * @param jsText
 * @returns {boolean}
 */
function secureEvalBool(jsText) {
    jsText = jsText.replace(/#/g, '|');
    var result = true;
    try {
        result = eval(jsText);
    } catch (e) {
        return true;
    }
    return result;
}

/**
 * Queries the language from the browser settings, returns the iso code.
 */
function queryLanguage() {
    // detecting webkit language
    var wkLang, androidLang;
    // works for earlier version of Android (2.3.x)
    if (navigator && navigator.userAgent && (androidLang = navigator.userAgent.match(/android.*\W(\w\w)-(\w\w)\W/i)))
        wkLang = androidLang[1];
    else
    // works for iOS and Android 4.x
        wkLang = navigator.userLanguage || navigator.language;

    // choosing from available locales, add new locales here
    var lang = "en";
    if (wkLang.indexOf("de") > -1)
        lang = "de";
    if (wkLang.indexOf("pl") > -1)
        lang = "pl";

    // debugging by adding lang parameter
    if (typeof params.lang != "undefined")
        lang = params.lang;

    console.log("Language set to " + lang);
    return lang;
}


/**
 * Detects the user agent language, chooses a language from the available
 * translations and applies it to the DOM.
 */
function applyI18n() {
    // apply i18n strings
    $("span[data-i18n]").each(function() {
        var key = $(this).attr("data-i18n");
        var val = i18n[lang][key];
        if (val)
            $(this).html(val);
        else
            $(this).html(key);
    });
}

/**
 * Returns the base value of a CSS pixel value as an int.
 * Example: "24px" -> 24.
 *
 * @param str
 * @returns {number}
 */
function pixVal(str) {
    var value = 0;
    if (!str)
        return 0;
    if (str.substring(str.length-2)=="px")
        value = parseInt(str.substring(0, str.length-2));
    else
        value = parseInt(str);
    return value;
}

/**
 * Generates an UUID.
 *
 * @returns {*}
 */
function uuid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + s4() + s4();
}

function hashNumber(text) {
    var hash = 0, i = 0, len = text.length;
    while ( i < len ) {
        hash  = ((hash << 5) - hash + text.charCodeAt(i++)) << 0;
    }
    return (hash + 2147483647) + 1;
}

/**
 * Generates a random number between start and the given range.
 *
 * @param range
 * @param start
 * @returns {number}
 */
function random(range, start) {
    if (typeof start != "undefined") 
        return (Math.floor((Math.random() * range)) + start);
    else
        return Math.floor((Math.random() * range + 1));
}

/**
 * Returns the text, regardless if it is a language object text or
 * direct text value.
 *
 * @param input
 * @returns {*}
 */
function getLanguageStringContent(input) {
    if (typeof input == "string")
        return input;
    else if (typeof input == "object")
        return input[lang];
    else
        return null;
}

/**
 * Plays the button click.
 */
function playButtonSound() {
    playSFXOnce("sounds/button.mp3");
}

function getDropin(dropinName, dropInId, dropinParams, body, callback) {
    console.log("Loading dropin type " + dropinName + " (" + dropInId + ")");
    loadFile("resources/" + dropinName + ".dropin", function (result) {
            // setting parameters
            if (!window._dropinParams)
                window._dropinParams = {};
            if (!window._dropinBody)
                window._dropinBody = {};
            window._dropinParams[dropinName] = dropinParams;
            window._dropinBody[dropinName] = body;
            window._dropinParams[dropInId] = dropinParams;
            window._dropinBody[dropInId] = body;
            // extracting script content, wrapping it into inspection code
            var scriptContentRE = result.match("<script[^>]*>([\\s\\S]*?)<\/script>");
            if (scriptContentRE) {
                var scriptContents = scriptContentRE[1];
                var inspectionCode = "<script class='dropinscript'>(function(self){if(self==window){var script=document.querySelector('script.dropinscript');script.className='';Function(script.innerHTML).call(script);}else{var dropinId = $(self.parentNode.parentNode).attr('id');" + scriptContents + "}})(this);</script>";
                result = result.replace(/<script[^>]*>[\s\S]*?<\/script>/, inspectionCode);
            } else {
                console.log("Warning: dropin script code not recognized for dropin " + dropInId);
            }
            // returning result
            callback(result);
    });
}

$(document).ready(function() {
    applyI18n();
    retrieveModel();
    initBookmarks();
    storeModel();
    if (typeof model!="undefined" && model!=null)
        ko.applyBindings(model);
});
