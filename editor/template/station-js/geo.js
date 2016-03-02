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

var markers = null;
var selectCtrl = null;
var selectedMarker = null;
var map = null;

/**
 * Switches to the given StoryQuest book station. This loads the corresponding
 * data from the server.
 *
 * @param stationIdx
 */
function switchContent(stationIdx) {
    loadFile("../stationconfig/" + stationIdx + ".json", function(result) {
        var loadedStation = JSON.parse(result);
        sideloadContent(stationIdx, loadedStation, null);
    });
};

/**
 * Sideloads the given StoryQuest station.
 *
 * @param stationIdx
 * @param config
 * @param configAsset
 */
function sideloadContent(stationIdx, config, configAsset) {
    currentStationId = stationIdx;

    // parsing config
    currentStation = config;
    // init frame
    $("#headercontent").html(currentStation.headerText.de);
    $("#footer").html(currentStation.footerText.de);

    // init pois
    if (currentStation.geoPOIs) {
        var loadedMarkers = [];
        for (var i=0; i<currentStation.geoPOIs.length; i++) {
            var thisPOI = currentStation.geoPOIs[i];
            var point = new OpenLayers.Geometry.Point(thisPOI.lon, thisPOI.lat);
            var loadedMarker = null;
            if (thisPOI.poiIcon)
                loadedMarker = new OpenLayers.Feature.Vector(point, null, {
                    externalGraphic: "../images/" + thisPOI.poiIcon,
                    graphicWidth: 35,
                    graphicHeight: 50,
                    fillOpacity: 1
                });
            else
                loadedMarker = new OpenLayers.Feature.Vector( point );
            loadedMarker.poiActionType = thisPOI.poiActionType;
            loadedMarker.poiAction = thisPOI.poiAction;
            loadedMarker.poitiptitle = thisPOI.poiTipTitle;
            loadedMarker.poitiptext = thisPOI.poiTipText;
            loadedMarkers.push(loadedMarker);
        }
        markers.addFeatures(loadedMarkers);

        // zoom to first point
        map.setCenter(new OpenLayers.LonLat(currentStation.geoPOIs[0].lon, currentStation.geoPOIs[0].lat));
        map.zoomTo(currentStation.initialZoom);
    }

    // finally call onEnter
    onEnter();
};

function selectMarker(marker) {
    selectedMarker = marker;
    selectCtrl.unselectAll();
    selectCtrl.select(marker);
}

function onFeatureSelect(evt) {
    feature = evt.feature;

    var actionHTML = "";
    if (feature.poiActionType=="link")
        actionHTML = "<p><button onclick='visitPOI(\"" + feature.poiAction + "\")'>Visit</button></p>";
    else if (feature.poiActionType=="event")
        actionHTML = "<p><button onclick='actionPOI(\"" + feature.poiAction + "\")'>Visit</button></p>";
    else if (feature.poiActionType=="web")
        actionHTML = "<p><button onclick='webPOI(\"" + feature.poiAction + "\")'>Visit</button></p>";

    popup = new OpenLayers.Popup.FramedCloud(null,
        feature.geometry.getBounds().getCenterLonLat(),
        new OpenLayers.Size(100,100),
            "<h2>"+feature.poitiptitle + "</h2>" + feature.poitiptext + actionHTML,
        null, false, null);
    feature.popup = popup;
    popup.feature = feature;
    map.addPopup(popup, true);
}

function actionPOI(event) {
    if (typeof onPOIAction!="undefined")
        onPOIAction(event);
}

function webPOI(address) {
    alert("TODO: open in browser " + address);
}

function visitPOI(nodeId) {
    toStation(nodeId);
}

function onFeatureUnselect(evt) {
    feature = evt.feature;
    if (feature.popup) {
        popup.feature = null;
        map.removePopup(feature.popup);
        feature.popup.destroy();
        feature.popup = null;
    }
}

$(window).load(function(){

    // create map
    map = new OpenLayers.Map('geomap');
    var osmLayer = new OpenLayers.Layer.OSM( "Simple OSM Map");

    // add layer listener to the feature(marker) layer
    var layerListeners = {
        featureclick: function(e) {
            selectMarker(markers.getFeatureById(e.feature.id));
            return false;
        }
    };

    markers = new OpenLayers.Layer.Vector("Markers",
        {
            eventListeners: layerListeners
        });
    /*
     style: {
     externalGraphic: 'http://www.openlayers.org/dev/img/marker.png',
     graphicWidth: 21,
     graphicHeight: 25,
     graphicYOffset: -24
     }
     */

    markers.events.on({
        'featureselected': onFeatureSelect,
        'featureunselected': onFeatureUnselect
    });

    // add the layers to the map
    map.addLayers([osmLayer, markers]);

    var highlightCtrl = new OpenLayers.Control.SelectFeature(markers, {
        hover: true,
        highlightOnly: true,
        renderIntent: "temporary"
    });
    map.addControl(highlightCtrl);
    highlightCtrl.activate();

    selectCtrl = new OpenLayers.Control.SelectFeature(markers,
        {clickout: true}
    );
    map.addControl(selectCtrl);
    selectCtrl.activate();

    autoSwitchContent();
});

