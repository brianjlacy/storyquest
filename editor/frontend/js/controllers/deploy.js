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

editorModule.controller("deployCoreController", ["$scope", "ProjectService", "UserService",
    function ($scope, ProjectService, UserService) {
        pageTitle("Build Apps", "Build and export your book for actual devices");
        breadcrumb([{title:"Deploy", url:"/deploy"}, {title:"Build Apps", url:""}]);

        $scope.project = ProjectService;
        $scope.user = UserService;

        $scope.openQRDialog = function(url) {
            var port = (document.location.port=="")?"443":document.location.port;
            var qrUrl = "https://" + document.location.hostname + ":" + port + url + $scope.project.data.id + "?authtoken=" + $scope.user.data.authtoken;
            modalQR(qrUrl, $scope.project.data.id);
        }
}]);
