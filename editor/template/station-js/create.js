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

var currentPage = "basic";
var swiper = null;


$(document).ready(function(){

    //check if ios device and disable achievement/login button
    if (typeof sqSystem!="undefined" && sqSystem.isNativeClient()==false) {
        $('#loginbutton').hide();
        $('#achievementbutton').hide();
    }

    // load configuration
    currentStationId = params.station || "chargen";
    loadFile("../stationconfig/" + currentStationId + ".json", function(result) {
        currentStation = JSON.parse(result);
        // finally call onEnter
        onEnter();
    });

    // swiper controls
    $(".arrow-left").hammer().on("tap", function(e){
        e.preventDefault();
        playButtonSound();
        swiper.swipePrev();
    });
    $(".arrow-right").hammer().on("tap", function(e){
        e.preventDefault();
        playButtonSound();
        swiper.swipeNext();
    });

    // continue button (bookmarks)
    $("#mm_continue").hammer().on("tap", function(event) {
        playButtonSound();
        toStation(NODEID_BOOKMARKS);
    });

    // i18n logo
    $(".headerlogo").attr("src", "../images/logo_" + lang + ".png");

    // new button
    $("#mm_new").hammer().on("tap", function(event) {
        playButtonSound();
        showTwoButtonBox(i18n[lang]['newgame'], "images/axe-alpha-nq8.png", i18n[lang]['startnewgame'], i18n[lang]['yes'], i18n[lang]['no'], function() {
            playButtonSound();
            console.log("Starting new game.");
            $("#exitbutton").hide();
            // create new game
            model.reset();
            $("body").css("background", "url('../images/menubg.jpg') no-repeat").css("background-size", "100% 100%");
            $("#footer").css("display", "block");
            $("#header").css("display", "block");
            $("#menu").css("display", "none");
            $("#basic").css("display", "block");
            $("#values").css("display", "none");
            currentPage = "basic";
            // setup slider
            swiper = new Swiper('.swiper-container',{
                mode:'horizontal',
                loop: true,
                grabCursor: true,
                onSlideChangeStart: function(swiper){
                    $("#characterflavour").html(characters[swiper.activeLoopIndex].desc[lang]);
                    document.getElementById("characterflavour").scrollTop = 0;
                }
            });
        }, function() {
            // return to menu
            playButtonSound();
        });
    });

    // help button
    $("#mm_help").hammer().on("tap", function(event) {
        playButtonSound();
        toStation(NODEID_HELP);
    });

    // tutorial button
    $("#mm_tutorial").hammer().on("tap", function(event) {
        playButtonSound();
        toStation(NODEID_TUTORIAL);
    });

    // about button
    $("#mm_about").hammer().on("tap", function(event) {
        playButtonSound();
        toStation(NODEID_ABOUT);
    });

    // continue button listener
    $("#continue").hammer().on("tap", function(event) {
        playButtonSound();
        if (currentPage=="basic" && $("#name").val() && $("#name").val()!="") {
            model.name = htmlEntities($("#name").val());
            var chosenIndex = swiper.activeIndex-1;
            if (chosenIndex>characters.length-1)
                chosenIndex = 0;
            else if (chosenIndex<0)
                chosenIndex = characters.length-1;
            if (chosenIndex==1)
                model.gender = GENDER_FEMALE;
            else
                model.gender = GENDER_MALE;
            model.image = characters[chosenIndex].image;
            model.smallimage = characters[chosenIndex].smallimage;
            $("body").css("background", "url('../images/menubg.jpg') no-repeat").css("background-size", "100% 100%");
            $("#footer").css("display", "block");
            $("#header").css("display", "block");
            $("#menu").css("display", "none");
            $("#basic").css("display", "none");
            $("#values").css("display", "block");
            currentPage = "values";
        } else if (currentPage=="basic") {
            showBox(i18n[lang]["invalidNameTitle"], "images/orc-alpha-nq8.png", i18n[lang]["invalidNameText"], i18n[lang]["back"], function() {
            });
        } else if (currentPage=="values" && parseInt($("#pleftval").text())==0) {
            model.le(model.le()*2);
            model.startKO = model.ko();
            model.startGE = model.ge();
            model.startLE = model.le();
            model.startKA = model.ka();
            model.items([]);
            toStation(currentStation.nextStation);
        } else if (currentPage=="values") {
            showBox(i18n[lang]["pointsLeftTitle"], "images/orc-alpha-nq8.png", i18n[lang]["pointsLeftText"], i18n[lang]["back"], function() {
            });
        }
    });

    // value settings listener
    $("#pleftval").html("5");
    $(".attributebutton").hammer().on("tap", function(event) {
        playButtonSound();
        var attribute = $(this).attr("data-attribute");
        var value = parseInt($(this).attr("data-value"));
        var pointsleft = parseInt($("#pleftval").text());
        if (model[attribute]()+value>=15 && model[attribute]()+value<=17 && pointsleft-value>=0 && pointsleft-value<=5 ) {
            model[attribute](model[attribute]()+value);
            $("#pleftval").text(pointsleft-value);
        }
    });

    // initial setup with template 0
    $("#characterflavour").html(characters[0].desc[lang]);

    // music switch
    $("#musicswitch").hammer().on("tap", function(event) {
        playButtonSound();
        toggleMusic();
        if (model.isMusicOn)
            $("#musicswitch").attr("src", "../images/music_on.png");
        else
            $("#musicswitch").attr("src", "../images/music_off.png");
    });

    // login button
    $("#loginbutton").hammer().on("tap", function(event) {
        playButtonSound();
        initGameCloud();
    });

    // achievements button
    $("#achievementbutton").hammer().on("tap", function(event) {
        playButtonSound();
        displayAchievements();
    });

    // disable continue button if there are no bookmarks
    if (listBookmarks().length==0)
        $("#mm_continue").addClass("disabled");
});
