/*
 * Quest
 * Questor Quest Page Setup
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

/*
    This file defined the API used to control the client application from
    the developer tools.
 */

var itemAPI = null;
var playerDataAPI = null;
var sideload = null;

$(function() {

    sideload = function(stationId, config, configAsset) {
        sideloadContent(stationId, config, configAsset)
    }

    itemAPI = {
        items: items,
        ownedItems: model.items(),
        addItemToCharacter: function(itemId) {
            console.log("Adding item " + itemId);
            for (var i=0; i<items.length; i++)
                if (items[i].id===itemId) {
                    console.log("REAL ADD" + JSON.stringify(items[i]));
                    model.items.push(items[i]);
                    console.log(JSON.stringify(model.items()));
                }
        },
        removeItemFromCharacter: function(itemId) {
            console.log("Removing item " + itemId);
            for (var i=0; i<model.items().length; i++)
                if (model.items()[i].id===itemId)
                    model.items.splice(i, 1);
        }
    }

    playerDataAPI = [
        {
            key: "attribute1", displayName: "Attribute 1",
            setter: function(value) {
                console.log("Setting attribute1 to " + value);
                model.attribute1(value);
            },
            getter: function() {
                return model.attribute1();
            }
        },
        {
            key: "attribute2", displayName: "Attribute 2",
            setter: function(value) {
                console.log("Setting attribute2 to " + value);
                model.attribute2(value);
            },
            getter: function() {
                return model.attribute2();
            }
        },
        {
            key: "attribute3", displayName: "Attribute 3",
            setter: function(value) {
                console.log("Setting attribute3 to " + value);
                model.attribute3(value);
            },
            getter: function() {
                return model.attribute3();
            }
        }
    ];
});
