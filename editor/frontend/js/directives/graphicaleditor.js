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
editorModule.directive("sqgraphicaleditor", function() {
     return {
         restrict: "E",
         template: "<div id='diagram'></div>",
         replace: true,
         scope: {
             configureNode: '&',
             configureScriptOnEnter: '&',
             configureScriptOnExit: '&',
             deleteNode: '&',
             editNode: '&',
             openNode: '&'
         },
         controller: "graphicalEditorController"
     };
 });

var graphicalEditorModule = angular.module("graphicalEditorModule", [ "ngResource", "ui.ace" ]);

graphicalEditorModule.controller("graphicalEditorController", ["$scope", "Node", "ProjectService",
    function ($scope, Node, ProjectService) {

        joint.shapes.storyquest = {};
        joint.shapes.storyquest.nodes = [];

        joint.shapes.storyquest.ModelInOutPorts =
        joint.shapes.basic.Rect.extend(_.extend({}, joint.shapes.basic.PortsModelInterface, {
            markup: '<g class="rotatable"><g class="scalable"><rect class="body"/><rect class="header"/></g><text class="type"/><text class="label"/><text class="id"/><g class="inPorts"/><g class="outPorts"/></g>',
            portMarkup: '<g class="port port<%= id %>"><circle class="port-body"/><text class="port-label" /></g>',

            defaults: joint.util.deepSupplement({
                type: 'storyquest.Model',
                size: { width: 1, height: 1 },
                inPorts: ['in'],
                outPorts: ['out'],
                sqId: '',
                attrs: {
                    '.': {
                        magnet: false
                    },
                    '.body': {
                        width: 150, height: 250,
                        stroke: 'darkgrey',
                        fill: 'lightgrey'
                    },
                    '.port-body': {
                        r: 10,
                        magnet: true,
                        stroke: '#000000'
                    },
                    '.header': {
                        width: 150,
                        height: 50,
                        stroke: 'darkgrey'
                    },
                    text: {
                        'pointer-events': 'none',
                        'font-family': 'sans',
                        'font-size': '0.8em',
                        'y': '0.6em'
                    },
                    '.label': { text: 'Label', 'ref-x': .5, 'ref-y': 0.4, ref: '.body', 'text-anchor': 'middle', fill: '#000000' },
                    '.type': { text: 'Type', 'ref-x': .5, 'ref-y': 5, ref: '.body', 'text-anchor': 'middle', fill: 'white' },
                    '.id': { text: 'Id', 'ref-x': .5, 'ref-y': 0.6, ref: '.body', 'text-anchor': 'middle', fill: '#000000' },
                    '.inPorts circle': { fill: 'grey', magnet: 'passive', stroke: 'white', type: 'input' },
                    '.outPorts circle': { fill: 'grey', type: 'output', stroke: 'white'},
                    '.inPorts .port-label': { x:-15, dy: 4, 'text-anchor': 'end', fill: '#000000', 'fill-opacity': 0 },
                    '.outPorts .port-label':{ x: 15, dy: 4, fill: '#000000', 'fill-opacity': 0 }
                }
            }, joint.shapes.basic.Generic.prototype.defaults),

            getPortAttrs: function(portName, index, total, selector, type) {
                    var attrs = {};
                    var portClass = 'port' + index;
                    var portSelector = selector + '>.' + portClass;
                    var portLabelSelector = portSelector + '>.port-label';
                    var portBodySelector = portSelector + '>.port-body';
                    attrs[portLabelSelector] = { text: portName };
                    attrs[portBodySelector] = { port: { id: portName || _.uniqueId(type) , type: type } };
                    attrs[portSelector] = { ref: '.body', 'ref-y': (index + 0.5) * (1 / total) };
                    if (selector === '.outPorts')
                        attrs[portSelector]['ref-dx'] = 0;
                    return attrs;
                }
        }));
        joint.shapes.storyquest.ModelInPorts =
                joint.shapes.basic.Rect.extend(_.extend({}, joint.shapes.basic.PortsModelInterface, {
                    markup: '<g class="rotatable"><g class="scalable"><rect class="body"/><rect class="header"/></g><text class="type"/><text class="label"/><text class="id"/><g class="inPorts"/></g>',
                    portMarkup: '<g class="port port<%= id %>"><circle class="port-body"/><text class="port-label" /></g>',

                    defaults: joint.util.deepSupplement({
                        type: 'storyquest.Model',
                        size: { width: 1, height: 1 },
                        inPorts: ['in'],
                        sqId: '',
                        attrs: {
                            '.': { magnet: false },
                            '.body': {
                                width: 150, height: 250,
                                rx: 20, ry: 20,
                                stroke: '#000000',
                                fill: '#f4f4f4'
                            },
                            '.port-body': {
                                r: 10,
                                magnet: true,
                                stroke: '#000000'
                            },
                            '.header': {
                                width: 150,
                                height: 50,
                                stroke: '#000000'
                            },
                            text: {
                                'pointer-events': 'none',
                                'font-family': 'sans',
                                'font-size': '0.8em'
                            },
                            '.label': { text: 'Label', 'ref-x': .5, 'ref-y': 0.4, ref: '.body', 'text-anchor': 'middle', fill: '#000000' },
                            '.type': { text: 'Type', 'ref-x': .5, 'ref-y': 5, ref: '.body', 'text-anchor': 'middle', fill: '#000000' },
                            '.id': { text: 'Id', 'ref-x': .5, 'ref-y': 0.6, ref: '.body', 'text-anchor': 'middle', fill: '#000000' },
                            '.inPorts circle': { fill: 'grey', magnet: 'passive', type: 'input' },
                            '.inPorts .port-label': { x:-15, dy: 4, 'text-anchor': 'end', fill: '#000000' }
                        }
                    }, joint.shapes.basic.Generic.prototype.defaults),

                    getPortAttrs: function(portName, index, total, selector, type) {
                            var attrs = {};
                            var portClass = 'port' + index;
                            var portSelector = selector + '>.' + portClass;
                            var portLabelSelector = portSelector + '>.port-label';
                            var portBodySelector = portSelector + '>.port-body';
                            attrs[portLabelSelector] = { text: portName };
                            attrs[portBodySelector] = { port: { id: portName || _.uniqueId(type) , type: type } };
                            attrs[portSelector] = { ref: '.body', 'ref-y': (index + 0.5) * (1 / total) };
                            if (selector === '.outPorts')
                                attrs[portSelector]['ref-dx'] = 0;
                            return attrs;
                        }
                }));

        joint.shapes.storyquest.ModelInOutPortsView = joint.dia.ElementView.extend(joint.shapes.basic.PortsViewInterface);
        joint.shapes.storyquest.ModelInPortsView = joint.dia.ElementView.extend(joint.shapes.basic.PortsViewInterface);

        joint.shapes.storyquest.Link = joint.dia.Link.extend({
            defaults: {
                type: 'storyquest.Link',
                sqSourceId: '',
                sqTargetId: '',
                attrs: {
                    '.connection': {stroke: 'grey'},
                    '.marker-target': {fill: 'grey', stroke: 'grey', d: 'M 10 0 L 0 5 L 10 10 z'},
                    '.marker-vertex': {fill: 'grey', stroke: 'grey', d: 'M 10 0 L 0 5 L 10 10 z'}
                }
            }
        });

        joint.shapes.storyquest.Default =
        joint.shapes.storyquest.ModelInOutPorts.extend({
            defaults: joint.util.deepSupplement({
                size: {
                    width: 200,
                    height: 80
                }
            }, joint.shapes.storyquest.ModelInOutPorts.prototype.defaults)
        });

    joint.shapes.storyquest.DefaultView =
        joint.dia.ElementView.extend(joint.shapes.basic.PortsViewInterface).extend({

            initialize: function() {
                joint.dia.ElementView.prototype.initialize.apply(this, arguments);
                this.$box = $(_.template(this.template)());
                // Prevent paper from handling pointerdown.
                this.$box.find('input,select').on('mousedown click', function(evt) {
                    evt.stopPropagation();
                });
                joint.shapes.storyquest.nodes.push(this);
            },
            render: function() {
                joint.dia.ElementView.prototype.render.apply(this, arguments);
                this.paper.$el.prepend(this.$box);
                return this;
            }
        });


        joint.shapes.storyquest.createNode = function(type, id, label, color, x, y) {
            var element = null;
            switch (type) {
                case "default":
                    element = new joint.shapes.storyquest.Default({
                        type: 'storyquest.Default',
                        attrs: ({
                            ".label": { text: label },
                            '.type': { text: 'CHAPTER' },
                            '.id': { text: "("+id+")" },
                            '.header': { fill: color }
                        })
                    });
                    break;
                default:
                    element = new joint.shapes.storyquest.Default({
                        type: 'storyquest.UNKNOWN',
                        attrs: ({
                           ".label": { text: label },
                           '.type': { text: 'UNKNOWN' },
                           '.id': { text: "("+id+")" },
                           '.header': { fill: color }
                        })
                    });
            }

            if (element) {
                element.set('sqId', id);
                if (x && y) {
                    element.translate(x, y);
                }
            }
            return element;
        };

        joint.shapes.storyquest.createLink = function(id, label, sourceId, targetId) {
            var link = new joint.shapes.storyquest.Link({
                source: {
                    id: sourceId,
                    port: 'out'
                },
                target: {
                    id: targetId,
                    port: 'in'
                }
            });
            link.set('sqSourceId', sourceId);
            link.set('sqTargetId', targetId);
            return link;
        };

    }
]);