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

var propertiesAvailableInConfigEditor = [
    "style", "isStartNode", "backgroundImage", "backgroundImage", "paddingTop", "backgroundColor",
    "accentColor", "boxBackgroundColor", "choiceEnabledGradientStartColor", "choiceEnabledGradientEndColor",
    "choiceDisabledGradientStartColor", "choiceDisabledGradientEndColor", "choiceTextColor", "editorColor"
];

var stationconfigSchema = {
    "title": "Chapter Configuration Data",
    "type": "object",
    "options": {
        "disable_properties": true,
        "disable_collapse": true,
        "disable_edit_json": true
    },
    "format": "grid",
    "properties": {
        "style": {
            "type": "string",
            "title": "Display Style",
            "enum": [ "default", "fullwidth" ]
        },
        "isStartNode": {
            "title": "This is the Starting Node",
            "type": "boolean"
        },
        "backgroundImage": {
            "title": "Background Image",
            "type": "string"
        },
        "paddingTop": {
            "title": "Padding of Content from Top",
            "type": "string"
        },
        "backgroundColor": {
            "title": "Background Color",
            "type": "string",
            "format": "color"
        },
        "accentColor": {
            "title": "Accent Color",
            "type": "string",
            "format": "color"
        },
        "boxBackgroundColor": {
            "title": "Box Background Color",
            "type": "string",
            "format": "color"
        },
        "choiceEnabledGradientStartColor": {
            "title": "Gradient Start Color for Enabled Links",
            "type": "string",
            "format": "color"
        },
        "choiceEnabledGradientEndColor": {
            "title": "Gradient End Color for Enabled Links",
            "type": "string",
            "format": "color"
        },
        "choiceDisabledGradientStartColor": {
            "title": "Gradient Start Color for Disabled Links",
            "type": "string",
            "format": "color"
        },
        "choiceDisabledGradientEndColor": {
            "title": "Gradient End Color for Disabled Links",
            "type": "string",
            "format": "color"
        },
        "choiceTextColor": {
            "title": "Text Color for Links",
            "type": "string",
            "format": "color"
        },
        "editorColor": {
            "title": "Color for Editor Display",
            "type": "string",
            "format": "color"
        }
    }
};

