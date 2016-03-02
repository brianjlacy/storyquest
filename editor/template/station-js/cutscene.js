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
var model;

var currentFrame = null;
var currentFrameIdx = 0;

var timeout = null;

$(window).load(function(){
    // load configuration
    currentStationId = params.station || "001";
    loadFile("../stationconfig/" + currentStationId + ".json", function(result) {
        currentStation = JSON.parse(result);
        currentFrame = createFrame(currentStation.frames[0]);
        currentFrame.css("opacity", "1");
        $("#animation").hammer().on("tap", function(event) {
            if (timeout!=null) {
                clearTimeout(timeout);
                timeout = null;
            }
            playButtonSound();
            nextFrame();
        });
        $("#animation").hammer().on("doubletap", function(event) {
            animationFinished();
        });
        $("#skipcont").hammer().on("tap", function(event) {
            animationFinished();
        });

        customizeDevice();

        model = retrieveModel() ;
        console.log (model);
        // finally call onEnter
        onEnter();
    });
});

function customizeDevice() {
    //Adjust font-size and text-shadow for Tablets
    if ((window.screen.height/window.screen.width < 1.5 && window.screen.height/window.screen.width >=1)  ||
        (window.screen.width/window.screen.height < 1.5 && window.screen.width/window.screen.height >=1)  )
    {
        $(".text").css("font-size","2.3em");
        $(".text").css("text-shadow","rgb(0, 0, 0) 2px 2px 2px");
    }
}


function createFrame(configuration, callback) {
    var newFrame = $(document.createElement("div"));
    if (typeof configuration.autoPage!="undefined") {
        $("#tapcont").hide();
        $("#skipcont").show();
        timeout = setTimeout(function() {
            nextFrame();
        }, configuration.autoPage);
    } else {
        $("#skipcont").hide();
        $("#tapcont").show();
    }
    newFrame.addClass("frame");
    newFrame.css("opacity", "0");
    $("#animation").append(newFrame);
    for (var i=0; i<configuration.layers.length; i++) {
        var thisLayer = configuration.layers[i];
        var newLayer = null;
        if (thisLayer.type=="background") {
            newLayer = $(document.createElement("img"));
            newLayer.addClass("background");
            newLayer.addClass(thisLayer.className);
            newLayer.attr("src", "../images/" + getLanguageStringContent(configuration.layers[i].image));
            newLayer.css("opacity", "0");
            newFrame.append(newLayer);
            newLayer.transition({opacity:1}, thisLayer.duration, "ease", callback);
        } else if (thisLayer.type=="image") {
            newLayer = $(document.createElement("img"));
            newLayer.addClass("layer");
            newLayer.addClass(thisLayer.className);
            newLayer.attr("src", "../images/" + getLanguageStringContent(configuration.layers[i].image));
            newLayer.css("left", configuration.layers[i].startPosX);
            newLayer.css("top", configuration.layers[i].startPosY);
            newFrame.append(newLayer);
        } else if (thisLayer.type=="zoomImage") {
            newLayer = $(document.createElement("img"));
            newLayer.addClass("layer");
            newLayer.addClass(thisLayer.className);
            newLayer.attr("src", "../images/" + getLanguageStringContent(configuration.layers[i].image));
            newLayer.css("left", configuration.layers[i].startPosX);
            newLayer.css("top", configuration.layers[i].startPosY);
            var newOuterLayer = $(document.createElement("div"));
            newOuterLayer.addClass("zoomLayer");
            newOuterLayer.append(newLayer);
            newFrame.append(newOuterLayer);
        } else if (thisLayer.type=="text") {
            newLayer = $(document.createElement("p"));
            newLayer.addClass("layer");
            newLayer.addClass(thisLayer.className);
            newLayer.html(getLanguageStringContent(configuration.layers[i].text));
            newLayer.css("left", configuration.layers[i].startPosX);
            newLayer.css("top", configuration.layers[i].startPosY);
            newFrame.append(newLayer);
            customizeDevice();
        }
        if (thisLayer.animations) {
            var anim = {};
            for (var j=0; j<thisLayer.animations.length; j++) {
                var thisAnimation = thisLayer.animations[j];
                if (thisAnimation.type=="moveX")
                    anim.x = thisAnimation.param;
                if (thisAnimation.type=="moveY")
                    anim.y = thisAnimation.param;
                if (thisAnimation.type=="zoom") {
                    anim.x = thisAnimation.paramMoveX;
                    anim.y = thisAnimation.paramMoveY;
                    anim.width = thisAnimation.paramZoom;
                    anim.height = thisAnimation.paramZoom;
                }
                else if (thisAnimation.type=="fadeOut")
                    anim.opacity=0;
                else if (thisAnimation.type=="fadeIn") {
                    newLayer.css("opacity", "0");
                    anim.opacity=1;
                }
            }
            newLayer.transition(anim, thisLayer.duration, thisLayer.easing, callback);
        }
    }
    return newFrame;
}

function nextFrame() {
    if (currentFrameIdx==currentStation.frames.length-1)
        animationFinished();
    else {
        currentFrame.transition({ opacity: "0", delay: 0 }, "1000", "ease", function() { $(this).remove(); });
        currentFrameIdx++;
        currentFrame = createFrame(currentStation.frames[currentFrameIdx]);
        currentFrame.transition({ opacity: "1", delay: 0 }, "1000", "ease");

    }
}

function animationFinished() {
    currentFrame.transition({ opacity: "0", delay: 0 }, "1000", "ease", function() { $(this).remove(); toStation(currentStation.nextStation); });
}
