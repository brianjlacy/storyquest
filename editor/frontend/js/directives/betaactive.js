/*
 * StoryQuest 2
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

 editorModule.directive("sqbetaactive", function() {
     return {
         restrict: "E",
         templateUrl: "views/directives/betaactive.html",
         replace: true,
         scope: true,
         controller: "betaactiveController"
     };
 });

var betaModule = angular.module("betaModule", [ "ngResource", "ui.ace" ]);

graphicalEditorModule.controller("betaactiveController", ["$scope", "$location", "$interval",
    function ($scope, $location, $interval) {

     $scope.testKey = $location.search().testKey;
     $scope.previewUrl = "/api/beta/" + $scope.testKey + "/index.html";
     $scope.updateCurrentStation = function() {
         var currentStationId = window.frames[0].currentStationId;
         $("#currentStationId").html(currentStationId);
         $("#position").val(currentStationId);
     };
     $(function() {
         $("#previewframe").load(function() {
            $interval($scope.updateCurrentStation, 1000);
         });
         $("#feedbackButton").click(function() {
             $.ajax({
                 url: "/api/storefeedback/" + $scope.testKey,
                 type: "get",
                 dataType: "json",
                 data: $("#feedbackForm").serialize(),
                 success: function(data, status) {
                     $("#modalLabel").html("Report sent successfully");
                     $("#modalText").html("Your problem report was sent to the development team. Thanks.");
                     $("#problemSent").modal("show");
                 },
                 error: function(data, status, error) {
                     $("#modalLabel").html("Error sending report");
                     $("#modalText").html("There was an error sending your report: \"" + error + "\". Please try again later.");
                     $("#problemSent").modal("show");
                 }
             });
             return false;
         });
         $('#previewframe').attr('src', $scope.previewUrl);
     });

    }
]);