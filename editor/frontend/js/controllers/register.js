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

var registerModule = angular.module("registerModule", []);

registerModule.controller("registerController", ["$scope", "$http", "$window",
    function ($scope, $http, $window) {

        $scope.EMAIL_PATTERN= /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;

        $scope.register = function() {
            $http.post("/api/register",
                {username:$scope.username, password:$scope.password, name:$scope.name, invitekey:$scope.invitekey}).
                    success(function(settings, status, headers, config) {
                        modalOk("Success", "Account successfully created. You will receive an email with an activation link. Please click on that link to activate your account.", function () {
                            $window.location.href = "login.html";
                        });
                    }).
                    error(function (data, status, headers, config) {
                        modalError("Error while creating new account. Your username might be taken or the invite key may be invalid or used. Please try again.");
                    });
                }
    }]);
