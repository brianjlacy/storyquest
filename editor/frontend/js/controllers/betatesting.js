editorModule.controller("betatestingController", ["$scope", "$location", "$http",
    function ($scope, $location, $http) {

    $scope.testKey = $location.search().testKey;
    $http({method: "GET", url: "/api/betatest/" + $scope.testKey}).
        success(function(data, status, headers, config) {
            $scope.betaactive = data.betaActive;
        }).
        error(function(data, status, headers, config) {
            $scope.betaactive = false;
        });

}]);