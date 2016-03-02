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

var lostpasswordModule = angular.module("lostpasswordModule", []);

lostpasswordModule.controller("lostpasswordController", ["$scope", "$http", "$window",
    function ($scope, $http, $window) {
        $scope.lostPassword = function() {
            $http.get("/api/lostpassword?username=" + $scope.username + "&password=" + $scope.password).
                success(function(settings, status, headers, config) {
                    modalOk("Success", "Requested password reset. You will receive an email with a reset link. Please click on that link to set a new password.", function() {
                        $window.location.href = "login.html";
                    });
                }).
                error(function(data, status, headers, config) {
                    modalError("Error requesting password information. Your username may be unknown. Please try again.");
                });
        };
    }]);
