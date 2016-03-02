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
    loadFile("../stationconfig/" + stationIdx + ".json", function(config) {
        currentStationId = stationIdx;

        // parsing config
        currentStation = JSON.parse(config);

        // basic css
        $("#background").css("background-color", currentStation.backgroundColor);
        if (currentStation.backgroundImage)
            $("#bgimage").attr("src", "../images/" + currentStation.backgroundImage);

        // answer by type
        $("#question").html(currentStation.question);
        if (currentStation.questionType=="text") {
            $("#textinput").css("display", "block");
            $("#textinput").keyup(function (e) {
                if (e.keyCode == 13) {
                    var givenAnswer = $("#answertext").val();
                    if (givenAnswer===currentStation.textAnswer)
                        answerQuestion(true);
                    else
                        answerQuestion(false);
                }
            });
        } else if (currentStation.questionType=="multiple") {
            $("#multipleinput").css("display", "block");
            for (var i=0; i<currentStation.choices.length; i++)
                $("#multipleinput").append("<div class='choice' data-choiceid='" + i + "'>" + currentStation.choices[i].choiceText + "</div>");
            $(".choice").hammer().on("tap", function() {
                $(this).addClass("selected");
                var choiceIdx = parseInt($(this).attr("data-choiceid"));
                var isCorrect = currentStation.choices[choiceIdx].isCorrect;
                answerQuestion(isCorrect);
            });
        } else
            console.log("Unsuported question type: " + currentStation.questionType);

        // finally call onEnter
        onEnter();
    });
};

function answerQuestion(isCorrect) {
    $("#result").css("display", "block");
    $("#answertext").attr("disabled", "disabled");
    $("#multipleinput").addClass("disabled");
    if (isCorrect) {
        $("#resulttext").html(currentStation.textWon);
        $("#resultbutton").click(function(e) {
            toStation(currentStation.wonTarget);
        });
    } else {
        $("#resulttext").html(currentStation.textLost);
        $("#resultbutton").click(function(e) {
            toStation(currentStation.lostTarget);
        });
    }
}

$(document).ready(autoSwitchContent);