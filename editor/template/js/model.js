/*
 * StoryQuest
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

var model = undefined;

var mapping = {
    create: function (options) {
        //customize at the root level, add behaviour
        var innerModel = ko.mapping.fromJS(options.data);

        innerModel.setValue = function(key, value) {
            if (typeof value == "undefined")
                value = true;
            if (!this.flags)
                this.flags = {};
            if (typeof this.flags[key] === "function")
                this.flags[key](value);
            else
                this.flags[key] = ko.observable(value);
            storeModel();
        };

        innerModel.getValue = function(key) {
            if (!this.flags || typeof this.flags[key] == "undefined")
                return false;
            else {
                var intValue = parseInt(this.flags[key]());
                if (isNaN(intValue))
                    return this.flags[key]();
                else
                    return intValue;
            }
        };

        innerModel.setSequence = function(sequenceKey, value, description) {
            if (typeof value == "undefined")
                value = 0;
            if (!this.sequences)
                this.sequences = {};
            this.sequences[sequenceKey] =  { value: value, description: description };
        };

        innerModel.getSequence = function(sequenceKey) {
            if (!this.sequences || typeof this.sequences[sequenceKey] == "undefined")
                return 0;
            else {
                var intValue = parseInt(this.sequences[sequenceKey].value);
                if (isNaN(intValue))
                    return this.sequences[sequenceKey].value;
                else
                    return intValue;
            }
        };

        innerModel.setFlag = function(flagName) {
            this.setValue(flagName, true);
        };

        innerModel.hasFlag = function(flagName) {
            return this.getValue(flagName);
        };

        innerModel.setConfig = function(key, value) {
            this.setValue("_config" + key, value);
        };

        innerModel.getConfig = function(key) {
            return this.getValue("_config" + key);
        };

        return innerModel;
    }
};

function setModelFromJS(jsObject) {
    model = ko.mapping.fromJS(jsObject, mapping);
}

function getModelAsJS() {
    // do not use the mapping plugin serializing here, because it does
    // only serialize properties that it mapped in the first place!
    var modelObj = ko.toJS(model);
    // slight hack, delete the mapping metadata so that it doesn't
    // interfere with de-serializing later.
    delete modelObj.__ko_mapping__;
    return modelObj;
}

function forceRetrieveModel() {
    // retrieve JSON string from system (either native or html5)
    var modelStr = retrieveModelStr();
    // if modelStr is null or "", knockout fails badly
    if (!modelStr || modelStr==null || modelStr=="")
        modelStr = "{}";
    // convert to knockout object, use mapping plugin to get an observable object
    var modelObj = JSON.parse(modelStr);
    setModelFromJS(modelObj);
    return model;
}

function retrieveModel() {
    if (!model) {
        // retrieve JSON string from system (either native or html5)
        var modelStr = retrieveModelStr();
        // if modelStr is null or "", knockout fails badly
        if (!modelStr || modelStr==null || modelStr=="")
            modelStr = "{}";
        // convert to knockout object, use mapping plugin to get an observable object
        var modelObj = JSON.parse(modelStr);
        setModelFromJS(modelObj);
    }
    return model;
}

function storeModel() {
    var modelStr = ko.toJSON(getModelAsJS());
    storeModelStr(modelStr);
}
