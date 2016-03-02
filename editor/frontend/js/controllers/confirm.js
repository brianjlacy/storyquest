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

var confirmModule = angular.module("confirmModule", []);

confirmModule.controller("confirmController", ["$scope", "$http", "$location",
    function ($scope, $http, $location) {

        $scope.username = $location.search().username;
        $scope.token = $location.search().token;
        $scope.password = $location.search().password;

        if ($scope.password)
            $http.get("/api/confirmlostpassword?username=" + $scope.username + "&token=" + $scope.token + "&password=" + $scope.password).
                success(function(settings, status, headers, config) {
                    $scope.title = "Successful";
                    $scope.message = "Confirmation successful. Please proceed to login now."
                }).
                error(function(data, status, headers, config) {
                    $scope.title = "Failed";
                    $scope.message = "Confirmation failed. Please try again."
                });
        else
            $http.get("/api/confirm?username=" + $scope.username + "&token=" + $scope.token).
                success(function(settings, status, headers, config) {
                    $scope.title = "Successful";
                    $scope.message = "Confirmation successful. Please proceed to login now."
                }).
                error(function(data, status, headers, config) {
                    $scope.title = "Failed";
                    $scope.message = "Confirmation failed. Please try again."
                });

    }]);
