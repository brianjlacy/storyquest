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
                    '.': { magnet: false },
                    '.body': {
                        width: 150, height: 250,
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
                    '.outPorts circle': { fill: 'black', type: 'output' },
                    '.inPorts .port-label': { x:-15, dy: 4, 'text-anchor': 'end', fill: '#000000' },
                    '.outPorts .port-label':{ x: 15, dy: 4, fill: '#000000' }
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
                    '.connection': {stroke: 'black'},
                    '.marker-target': {fill: 'black', d: 'M 10 0 L 0 5 L 10 10 z'}
                }
            }
        });

        joint.shapes.storyquest.Book =
        joint.shapes.storyquest.Web =
        joint.shapes.storyquest.ModelInOutPorts.extend({
            defaults: joint.util.deepSupplement({
                size: {
                    width: 200,
                    height: 80
                }
            }, joint.shapes.storyquest.ModelInOutPorts.prototype.defaults)
        });


        joint.shapes.storyquest.Cutscene =
        joint.shapes.storyquest.Barebone =
        joint.shapes.storyquest.Geo =
        joint.shapes.storyquest.Youtube =
        joint.shapes.storyquest.Settings =
        joint.shapes.storyquest.Quiz =
        joint.shapes.storyquest.ModelInPorts.extend({
            defaults: joint.util.deepSupplement({
                size: {
                    width: 200,
                    height: 80
                }
            }, joint.shapes.storyquest.ModelInPorts.prototype.defaults)
        });

        joint.shapes.storyquest.createNode = function(type, id, label, color, x, y) {
            var element = null;
            switch (type) {
                case "book":
                    element = new joint.shapes.storyquest.Book({
                        type: 'storyquest.Book',
                        attrs: ({
                            ".label": { text: label },
                            '.type': { text: 'BOOK' },
                            '.id': { text: "("+id+")" },
                            '.header': { fill: color }
                        })
                    });
                    break;
                case "barebone":
                    element = new joint.shapes.storyquest.Barebone({
                        type: 'storyquest.Barebone',
                        attrs: ({
                            ".label": { text: label },
                            '.type': { text: 'BAREBONE' },
                            '.id': { text: "("+id+")" },
                            '.header': { fill: color }
                        })
                    });
                    break;
                case "web":
                    element = new joint.shapes.storyquest.Web({
                        type: 'storyquest.Web',
                        attrs: ({
                            ".label": { text: label },
                            '.type': { text: 'WEB' },
                            '.id': { text: "("+id+")" },
                            '.header': { fill: color }
                        })
                    });
                    break;
                case "geo":
                    element = new joint.shapes.storyquest.Geo({
                        type: 'storyquest.Geo',
                        attrs: ({
                            ".label": { text: label },
                            '.type': { text: 'GEO' },
                            '.id': { text: "("+id+")" },
                            '.header': { fill: color }
                        })
                    });
                    break;
                case "youtube":
                    element = new joint.shapes.storyquest.Youtube({
                        type: 'storyquest.Youtube',
                        attrs: ({
                            ".label": { text: label },
                            '.type': { text: 'YOUTUBE' },
                            '.id': { text: "("+id+")" },
                            '.header': { fill: color }
                        })
                    });
                    break;
                case "settings":
                    element = new joint.shapes.storyquest.Settings({
                        type: 'storyquest.Settings',
                        attrs: ({
                            ".label": { text: label },
                            '.type': { text: 'SETTINGS' },
                            '.id': { text: "("+id+")" },
                            '.header': { fill: color }
                        })
                    });
                    break;
                 case "quiz":
                    element = new joint.shapes.storyquest.Quiz({
                        type: 'storyquest.Quiz',
                        attrs: ({
                            ".label": { text: label },
                            '.type': { text: 'QUIZ' },
                            '.id': { text: "("+id+")" },
                            '.header': { fill: color }
                        })
                    });
                    break;
                default:
                    element = new joint.shapes.storyquest.Cutscene({
                        type: 'storyquest.Cutscene',
                        attrs: ({
                           ".label": { text: label },
                           '.type': { text: 'CUTSCENE' },
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

        joint.shapes.storyquest.BookView =
        joint.shapes.storyquest.CutsceneView =
        joint.shapes.storyquest.WebView =
        joint.shapes.storyquest.GeoView =
        joint.shapes.storyquest.YoutubeView =
        joint.shapes.storyquest.SettingsView =
        joint.shapes.storyquest.QuizView =
        joint.shapes.storyquest.BareboneView =
        joint.dia.ElementView.extend(joint.shapes.basic.PortsViewInterface).extend({
            template: [
                '<div class="joint-html-element">',
                '<div class="idholder">',
                '<button class="delete glyphicon glyphicon-trash" data-toggle="tooltip" title="Delete"></button>',
                '<button class="onEnter glyphicon glyphicon-play" data-toggle="tooltip" title="Script on Enter"></button>',
                '<button class="onExit glyphicon glyphicon-share-alt" data-toggle="tooltip" title="Script on Leave"></button>',
                '<button class="config glyphicon glyphicon-cog" data-toggle="tooltip" title="Config"></button>',
                '<button class="edit glyphicon glyphicon-pencil" data-toggle="tooltip" title="Edit"></button>',
                '</div></div>'
            ].join(''),

            initialize: function() {
                _.bindAll(this, 'updateBox');
                joint.dia.ElementView.prototype.initialize.apply(this, arguments);
                this.$box = $(_.template(this.template)());
                // Prevent paper from handling pointerdown.
                this.$box.find('input,select').on('mousedown click', function(evt) {
                    evt.stopPropagation();
                });

                // button event handler
                this.$box.find('.delete').on('click', _.bind(function() {
                var model = this;
                    Node.get({ projectId: ProjectService.data.id, nodeIdOrType: this.get('sqId')}, function(node) {
                                        if(node.isStartNode) {
                                            modalError("You can't delete a start Node.");
                                        } else {
                                            model.remove();
                                        }
                    });
                }, this.model));
                this.$box.find('.onEnter').on('click', _.bind(function() {
                   $scope.configureScriptOnEnter({nodeId: this.get('sqId')});
                }, this.model));
                this.$box.find('.onExit').on('click', _.bind(function() {
                   $scope.configureScriptOnExit({nodeId: this.get('sqId')});
                }, this.model));
                this.$box.find('.config').on('click', _.bind(function() {
                    $scope.configureNode({nodeId: this.get('sqId')});
                }, this.model));
                this.$box.find('.edit').on('click', _.bind(function() {
                    $scope.editNode({nodeId: this.get('sqId')});
                }, this.model));
                this.$box.find('.open').on('click', _.bind(function() {
                    $scope.openNode({nodeId: this.get('sqId')});
                }, this.model));

                joint.shapes.storyquest.nodes.push(this);

                // Update the box position whenever the underlying model changes.
                this.model.on('change', this.updateBox, this);
                // Remove the box when the model gets removed from the graph.
                this.model.on('remove', this.removeBox, this);

                this.updateBox();
            },
            render: function() {
                joint.dia.ElementView.prototype.render.apply(this, arguments);
                this.paper.$el.prepend(this.$box);
                this.updateBox();
                return this;
            },
            updateBox: function() {
                // Set the position and dimension of the box so that it covers the JointJS element.
                var bbox = this.model.getBBox();
                //TODO: fix
                var positionDiagrammBox = $("#diagram").position();
                // Example of updating the HTML with a data stored in the cell model.
                this.$box.find('.idholder').attr("data-id", this.model.id);
                this.$box.find('.open').css({
                    position: 'absolute',
                    top: - bbox.height * scale,
                    right:0
                });

                var type = this.model.get('type');
                if(type == "storyquest.Cutscene" ||
                    type == "storyquest.Settings" ||
                     type == "storyquest.Quiz" ) {
                        this.$box.find('.edit').css({
                            display: 'none'
                        });
                }

                var left = bbox.x * scale + positionDiagrammBox.left;
                var top = (bbox.y + bbox.height) * scale + positionDiagrammBox.top;
                this.$box.css({
                    width: bbox.width * scale,
                    height: bbox.height * scale,
                    left: left,
                    top: top,
                    transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)'
                });
            },
            removeBox: function(evt) {
                this.$box.remove();
                $scope.deleteNode({nodeId: this.model.get('sqId')});
            }
        })
    }
]);