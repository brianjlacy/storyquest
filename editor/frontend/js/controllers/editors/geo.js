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

editorModule.directive("sqgeoeditor", function() {
    return {
        restrict: "E",
        templateUrl: "views/directives/geo.html",
        replace: true,
        scope: true,
        controller: "editorGeoController"
    };
});

var editorGeoModule = angular.module("editorGeoModule", [ "ngResource" ]);

editorGeoModule.controller("editorGeoController", ["$scope", "$http", "$timeout", "TypeIcons",
    function ($scope, $http, $timeout, TypeIcons) {

        TypeIcons.registerType("geo", "glyphicon-map-marker");

        $scope.map = null;
        $scope.markers = null;
        $scope.selectCtrl = null;
        $scope.selectedMarker = null;

        $timeout( function() {
            if($scope.map){
                $scope.map.updateSize();
            }
        }, 1000);

        $scope.syncGeoNodeConfig = function () {
            console.log("Syncing geo info...");
            var pois = $scope.markers.features;
            $scope.node.geoPOIs = [];
            for (var i = 0; i < pois.length; i++) {
                var thisPOI = {
                    lat: pois[i].geometry.y,
                    lon: pois[i].geometry.x,
                    poiActionType: pois[i].poiActionType,
                    poiAction: pois[i].poiAction,
                    poiTipTitle: pois[i].poitiptitle,
                    poiTipText: pois[i].poitiptext,
                    poiIcon: pois[i].poiIcon
                };
                $scope.node.geoPOIs.push(thisPOI);
                $scope.nodeChanged($scope.node);
            }
        };

        // watch for nodes loaded
        $scope.$watch("node", function () {
            if ($scope.node && $scope.node.type == "geo") {
                console.log("Loading Geo node data: " + $scope.node.id);
                $scope.setContentEditorEnabled(true);
                $scope.setConfigurationEditorEnabled(true);
                $scope.registerFilterPropertyKeys([
                    "initialZoom",
                    "geoPOIs"
                ]);
                $scope.initGeoEditor();
                var loadedMarkers = [];
                $scope.markers.removeAllFeatures();
                if($scope.node.geoPOIs){
                    for (var i = 0; i < $scope.node.geoPOIs.length; i++) {
                        var thisPOI = $scope.node.geoPOIs[i];
                        var loadedMarker = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(thisPOI.lon, thisPOI.lat));
                        loadedMarker.poiActionType = thisPOI.poiActionType;
                        loadedMarker.poiAction = thisPOI.poiAction;
                        loadedMarker.poitiptitle = thisPOI.poiTipTitle;
                        loadedMarker.poitiptext = thisPOI.poiTipText;
                        loadedMarkers.push(loadedMarker);
                    }
                    $scope.markers.addFeatures(loadedMarker);
                }
                $http.get("/api/media/" + $scope.project.data.id).
                    success(function(data, status, headers, config) {
                        $scope.imageList = data;
                        $("#poiiconlist").imagepicker({
                            changed: function (oldO, newO) {
                                if ($scope.selectedMarker) {
                                    $scope.selectedMarker.poiIcon = newO[0];
                                }
                            }
                        });
                    }).
                    error(function(data, status, headers, config) {
                        modalError("Error retrieving image list", "Error getting images from server.");
                    });
            }
        });

        $scope.initGeoEditor = function() {
            // enable click on map
            OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
                defaultHandlerOptions: {
                    'single': true,
                    'double': false,
                    'pixelTolerance': 10,
                    'stopSingle': false,
                    'stopDouble': false
                },
                initialize: function (options) {
                    this.handlerOptions = OpenLayers.Util.extend(
                        {}, this.defaultHandlerOptions
                    );
                    OpenLayers.Control.prototype.initialize.apply(
                        this, arguments
                    );
                    this.handler = new OpenLayers.Handler.Click(
                        this, {
                            'click': this.trigger
                        }, this.handlerOptions
                    );
                },
                trigger: function (e) {
                    // enable adding markers by clicking on map
                    var lonlat = $scope.map.getLonLatFromPixel(e.xy);
                    var marker = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat));
                    $scope.markers.addFeatures([marker]);
                    $scope.selectMarker(marker);
                    $scope.syncGeoNodeConfig();
                }
            });

            // create map
            $scope.map = new OpenLayers.Map("geomapeditor");
            var osmLayer = new OpenLayers.Layer.OSM("OSM Map", [
                "https://a.tile.openstreetmap.org/${z}/${x}/${y}.png",
                "https://b.tile.openstreetmap.org/${z}/${x}/${y}.png",
                "https://c.tile.openstreetmap.org/${z}/${x}/${y}.png"
            ]);

            // add layer listener to the marker layer
            var layerListeners = {
                featureclick: function (e) {
                    $scope.selectMarker($scope.markers.getFeatureById(e.feature.id));
                    return false;
                }
            };

            // create the marker layer
            $scope.markers = new OpenLayers.Layer.Vector("Markers", { eventListeners: layerListeners });

            // finally add the layers to the map
            $scope.map.addLayers([osmLayer, $scope.markers]);

            // enable dragging markers
            var dragFeature = new OpenLayers.Control.DragFeature($scope.markers, {
                onStart: function (feature, pixel) {
                    $scope.selectMarker(feature);
                },
                onComplete: function (feature, pixel) {
                    $scope.selectMarker(feature);
                }
            });
            $scope.map.addControl(dragFeature);
            dragFeature.activate();

            // enable highlighting and selection of markers
            var highlightCtrl = new OpenLayers.Control.SelectFeature($scope.markers, {
                hover: true,
                highlightOnly: true,
                renderIntent: "temporary"
            });
            $scope.map.addControl(highlightCtrl);
            highlightCtrl.activate();
            $scope.selectCtrl = new OpenLayers.Control.SelectFeature($scope.markers,
                {clickout: true}
            );
            $scope.map.addControl($scope.selectCtrl);
            $scope.selectCtrl.activate();

            // enable clicking on the map
            var click = new OpenLayers.Control.Click();
            $scope.map.addControl(click);
            click.activate();

            // zoom to fit Germany when loading the map view
            $scope.map.setCenter(new OpenLayers.LonLat(1085690.6354158, 6492480.1163108));
            $scope.map.zoomTo(6);

            $scope.geosearch = function () {
                var queryString = $("#geosearch").val();
                if (queryString && queryString != "")
                    OpenLayers.Request.POST({
                        url: "/geosearch",
                        scope: this,
                        failure: function (response) {
                            alert("An error occurred while communicating with the geosearch service. Please try again.");
                            $("#geosearch").removeAttr("disabled");
                        },
                        success: function (response) {
                            var format = new OpenLayers.Format.XLS();
                            var output = format.read(response.responseXML);
                            if (output.responseLists[0]) {
                                var geometry = output.responseLists[0].features[0].geometry;
                                var foundPosition = new OpenLayers.LonLat(geometry.x, geometry.y).transform(
                                    new OpenLayers.Projection("EPSG:4326"),
                                    $scope.map.getProjectionObject()
                                );
                                $scope.map.setCenter(foundPosition, 16);
                                $("#geosearch").removeAttr("disabled");
                            } else {
                                alert("Sorry, no address found");
                            }
                        },
                        headers: {"Content-Type": "application/x-www-form-urlencoded"},
                        data: "query=" + encodeURIComponent(queryString)
                    });
            };

            $("#poideletebutton").click(function () {
                if ($scope.selectedMarker) {
                    $scope.markers.destroyFeatures([$scope.selectedMarker]);
                    $scope.deselectMarker();
                    $scope.syncGeoNodeConfig();
                }
            });
            $("#geosearchbutton").click(function () {
                $scope.geosearch();
            });
            $("#geosearch").on("keypress", function (event) {
                if (event.which == '13') {
                    $(this).attr("disabled", "disabled");
                    $scope.geosearch();
                }
            });
        };

        // service methods
        $scope.selectMarker = function(marker) {
            $scope.selectedMarker = marker;
            $scope.selectCtrl.unselectAll();
            $scope.selectCtrl.select(marker);
            // FIXME: resetting the poiicon selected state does not work
            $("#poiiconlist ul li:selected").each(function(i) {
                $(this).prop('selected', false);
            });
            //$("#poiiconlist").data('picker').sync_picker_with_select();
            $("#poiactionbutton").html("Action&nbsp;&nbsp;<span class='caret'></span>");
            if($scope.selectedMarker.poiActionType)
                $scope.geoaction($scope.selectedMarker.poiActionType);
            // FIXME: select icon in selectedMarker.poiIcon in $("#poiiconlist ul li)
        };

        $scope.deselectMarker = function() {
            $scope.selectedMarker = null;
            $("#poiactionbutton").html("Action&nbsp;&nbsp;<span class='caret'></span>");
        };

        $scope.geoaction = function(type) {
            if ($scope.selectedMarker) {
                $scope.selectedMarker.poiActionType = type;
                if (type=="link") {
                    $("#poiactionbutton").html("Link <span class='caret'></span>");
                } else if (type=="web") {
                    $("#poiactionbutton").html("Web <span class='caret'></span>");
                } else if (type=="event") {
                    $("#poiactionbutton").html("Event <span class='caret'></span>");
                }
                $scope.syncGeoNodeConfig();
            }
        }
    }]
);





