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

var stationconfigSchemaV1 = {
    "book":
        {
            "type":"object",
            "$schema": "http://json-schema.org/draft-03/schema",
            "id": "http://jsonschema.net",
            "required":false,
            "properties":{
                "backgroundColor": {
                    "type":"string",
                    "id": "http://jsonschema.net/backgroundColor",
                    "required":false,
                    "description": "The background color for the page."
                },
                "backgroundImage": {
                    "type":"string",
                    "id": "http://jsonschema.net/backgroundImage",
                    "required":false,
                    "description": "The background wallpaper for the page."
                },
                "headerText": {
                    "type":"object",
                    "id": "http://jsonschema.net/headerText",
                    "description": "The headline text.",
                    "required":false,
                    "properties":{
                        "de": {
                            "type":"string",
                            "id": "http://jsonschema.net/headerText/de",
                            "required":false,
                            "description": "German language headline text."
                        },
                        "en": {
                            "type":"string",
                            "id": "http://jsonschema.net/headerText/de",
                            "required":false,
                            "description": "English language headline text."
                        }
                    }
                },
                "isStartNode": {
                    "type":"boolean",
                    "id": "http://jsonschema.net/isStartNode",
                    "required":true,
                    "description": "Set this to true if this chapter should be the start of your book."
                },
                "textColor": {
                    "type":"string",
                    "id": "http://jsonschema.net/textColor",
                    "required":false,
                    "description": "The text color for the page."
                },
                "title": {
                    "type":"string",
                    "id": "http://jsonschema.net/type",
                    "required":true,
                    "description": "Chapter title, only used in the editor."
                }
            }
        },
    "create":
    {
        "type":"object",
        "$schema": "http://json-schema.org/draft-03/schema",
        "id": "http://jsonschema.net",
        "required":false,
        "properties":{
            "isStartNode": {
                "type":"boolean",
                "id": "http://jsonschema.net/isStartNode",
                "required":true,
                "description": "Set this to true if this chapter should be the start of your book."
            },
            "nextStation": {
                "type":"string",
                "id": "http://jsonschema.net/nextStation",
                "required":true,
                "description": "Id of the chapter to be jumped to after this chapter."
            },
            "title": {
                "type":"string",
                "id": "http://jsonschema.net/title",
                "required":true,
                "description": "Chapter title, only used in the editor."
            }
        }
    },
    "settings":
    {
        "type":"object",
        "$schema": "http://json-schema.org/draft-03/schema",
        "id": "http://jsonschema.net",
        "required":false,
        "properties":{
            "isStartNode": {
                "type":"boolean",
                "id": "http://jsonschema.net/isStartNode",
                "required":true,
                "description": "Set this to true if this chapter should be the start of your book."
            },
            "title": {
                "type":"string",
                "id": "http://jsonschema.net/title",
                "required":true,
                "description": "Chapter title, only used in the editor."
            }
        }
    },
    "web":
    {
        "type":"object",
        "$schema": "http://json-schema.org/draft-03/schema",
        "id": "http://jsonschema.net",
        "required":false,
        "properties":{
            "backgroundColor": {
                "type":"string",
                "id": "http://jsonschema.net/backgroundColor",
                "required":false,
                "description": "The background color for the page."
            },
            "backgroundImage": {
                "type":"string",
                "id": "http://jsonschema.net/backgroundImage",
                "required":false,
                "description": "The background wallpaper for the page."
            },
            "headerText": {
                "type":"object",
                "id": "http://jsonschema.net/headerText",
                "description": "The headline text.",
                "required":false,
                "properties":{
                    "de": {
                        "type":"string",
                        "id": "http://jsonschema.net/headerText/de",
                        "required":false,
                        "description": "German language headline text."
                    },
                    "en": {
                        "type":"string",
                        "id": "http://jsonschema.net/headerText/de",
                        "required":false,
                        "description": "English language headline text."
                    }
                }
            },
            "isStartNode": {
                "type":"boolean",
                "id": "http://jsonschema.net/isStartNode",
                "required":true,
                "description": "Set this to true if this chapter should be the start of your book."
            },
            "textColor": {
                "type":"string",
                "id": "http://jsonschema.net/textColor",
                "required":false,
                "description": "The text color for the page."
            },
            "text": {
                "type":"object",
                "id": "http://jsonschema.net/text",
                "required":false,
                "properties":{
                    "de": {
                        "type":"string",
                        "id": "http://jsonschema.net/text/de",
                        "required":false
                    },
                    "en": {
                        "type":"string",
                        "id": "http://jsonschema.net/text/de",
                        "required":false
                    }
                }
            },
            "title": {
                "type":"string",
                "id": "http://jsonschema.net/type",
                "required":true,
                "description": "Chapter title, only used in the editor."
            }
        }
    },
    "barebone":
    {
        "type":"object",
        "$schema": "http://json-schema.org/draft-03/schema",
        "id": "http://jsonschema.net",
        "required":false,
        "properties":{
            "backgroundColor": {
                "type":"string",
                "id": "http://jsonschema.net/backgroundColor",
                "required":false,
                "description": "The background color for the page."
            },
            "backgroundImage": {
                "type":"string",
                "id": "http://jsonschema.net/backgroundImage",
                "required":false,
                "description": "The background wallpaper for the page."
            },
            "headerText": {
                "type":"object",
                "id": "http://jsonschema.net/headerText",
                "description": "The headline text.",
                "required":false,
                "properties":{
                    "de": {
                        "type":"string",
                        "id": "http://jsonschema.net/headerText/de",
                        "required":false,
                        "description": "German language headline text."
                    },
                    "en": {
                        "type":"string",
                        "id": "http://jsonschema.net/headerText/de",
                        "required":false,
                        "description": "English language headline text."
                    }
                }
            },
            "isStartNode": {
                "type":"boolean",
                "id": "http://jsonschema.net/isStartNode",
                "required":true,
                "description": "Set this to true if this chapter should be the start of your book."
            },
            "textColor": {
                "type":"string",
                "id": "http://jsonschema.net/textColor",
                "required":false,
                "description": "The text color for the page."
            },
            "text": {
                "type":"object",
                "id": "http://jsonschema.net/text",
                "required":false,
                "properties":{
                    "de": {
                        "type":"string",
                        "id": "http://jsonschema.net/text/de",
                        "required":false
                    },
                    "en": {
                        "type":"string",
                        "id": "http://jsonschema.net/text/de",
                        "required":false
                    }
                }
            },
            "title": {
                "type":"string",
                "id": "http://jsonschema.net/type",
                "required":true,
                "description": "Chapter title, only used in the editor."
            }
        }
    },
    "geo":
    {
        "type":"object",
        "$schema": "http://json-schema.org/draft-03/schema",
        "id": "http://jsonschema.net",
        "required":false,
        "properties":{
            "headerText": {
                "type":"object",
                "id": "http://jsonschema.net/headerText",
                "description": "The headline text.",
                "required":false,
                "properties":{
                    "de": {
                        "type":"string",
                        "id": "http://jsonschema.net/headerText/de",
                        "required":false,
                        "description": "German language headline text."
                    },
                    "en": {
                        "type":"string",
                        "id": "http://jsonschema.net/headerText/de",
                        "required":false,
                        "description": "English language headline text."
                    }
                }
            },
            "footerText": {
                "type":"object",
                "id": "http://jsonschema.net/headerText",
                "description": "The headline text.",
                "required":false,
                "properties":{
                    "de": {
                        "type":"string",
                        "id": "http://jsonschema.net/headerText/de",
                        "required":false,
                        "description": "German language headline text."
                    },
                    "en": {
                        "type":"string",
                        "id": "http://jsonschema.net/headerText/de",
                        "required":false,
                        "description": "English language headline text."
                    }
                }
            },
            "isStartNode": {
                "type":"boolean",
                "id": "http://jsonschema.net/isStartNode",
                "required":true,
                "description": "Set this to true if this chapter should be the start of your book."
            },
            "title": {
                "type":"string",
                "id": "http://jsonschema.net/type",
                "required":true,
                "description": "Chapter title, only used in the editor."
            }
        }
    },
    "youtube":
    {
        "type":"object",
        "$schema": "http://json-schema.org/draft-03/schema",
        "id": "http://jsonschema.net",
        "required":false,
        "properties":{
            "isStartNode": {
                "type":"boolean",
                "id": "http://jsonschema.net/isStartNode",
                "required":true,
                "description": "Set this to true if this chapter should be the start of your book."
            },
            "title": {
                "type":"string",
                "id": "http://jsonschema.net/type",
                "required":true,
                "description": "Chapter title, only used in the editor."
            }
        }
    },
    "check":
    {
        "type":"object",
        "$schema": "http://json-schema.org/draft-03/schema",
        "id": "http://jsonschema.net",
        "required":false,
        "properties":{
            "backgroundImage": {
                "type":"string",
                "id": "http://jsonschema.net/backgroundImage",
                "required":false,
                "description": "The background wallpaper for the page."
            },
            "alternateBackgroundImage": {
                "type":"string",
                "id": "http://jsonschema.net/alternateBackgroundImage",
                "required":false,
                "description": "The alternate background wallpaper for the page."
            },
            "isStartNode": {
                "type":"boolean",
                "id": "http://jsonschema.net/isStartNode",
                "required":true,
                "description": "Set this to true if this chapter should be the start of your book."
            },
            "textLost": {
                "type":"string",
                "id": "http://jsonschema.net/textLost",
                "required":true,
                "description": "The text displayed when the check is lost."
            },
            "textWon": {
                "type":"string",
                "id": "http://jsonschema.net/textWon",
                "required":true,
                "description": "The text displayed when the check is won."
            },
            "textRetry": {
                "type":"string",
                "id": "http://jsonschema.net/textRetry",
                "required":false,
                "description": "The text displayed when the check is retried."
            },
            "titleLost": {
                "type":"string",
                "id": "http://jsonschema.net/titleLost",
                "required":true,
                "description": "The title displayed when the check is lost."
            },
            "titleWon": {
                "type":"string",
                "id": "http://jsonschema.net/titleWon",
                "required":true,
                "description": "The title displayed when the check is won."
            },
            "titleRetry": {
                "type":"string",
                "id": "http://jsonschema.net/titleRetry",
                "required":false,
                "description": "The title displayed when the check is retried."
            },
            "wonTarget": {
                "type":"string",
                "id": "http://jsonschema.net/titleWon",
                "required":false,
                "description": "The chapter jumped when won."
            },
            "lostTarget": {
                "type":"string",
                "id": "http://jsonschema.net/lostTarget",
                "required":false,
                "description": "The chapter jumped when lost."
            },
            "title": {
                "type":"string",
                "id": "http://jsonschema.net/type",
                "required":true,
                "description": "Chapter title, only used in the editor."
            },
            "retries": {
                "type": "integer",
                "id": "http://jsonschema.net/retries",
                "required": false,
                "description": "Number of granted retries."
            },
            "onFailTry": {
                "type":"string",
                "id": "http://jsonschema.net/onFailTry",
                "required":true,
                "description": "JavaScript executed when a try failed (only feasible if retries>0)."
            },
            "probes": {
                "type": "array",
                "items": {
                    "type": "object",
                    "$schema": "http://json-schema.org/draft-03/schema",
                    "id": "http://jsonschema.net",
                    "required": true,
                    "properties": {
                        "attribute": {
                            "type": "string",
                            "id": "http://jsonschema.net/attribute",
                            "required": true,
                            "description": "Attribute key for probe."
                        },
                        "value": {
                            "type": "integer",
                            "id": "http://jsonschema.net/value",
                            "required": true,
                            "description": "Attribute value for probe."
                        }
                    }
                },
                "minItems": 1,
                "uniqueItems": false
            }
        }
    },
    "quiz":
    {
        "type":"object",
        "$schema": "http://json-schema.org/draft-03/schema",
        "id": "http://jsonschema.net",
        "required":false,
        "properties":{
            "backgroundImage": {
                "type":"string",
                "id": "http://jsonschema.net/backgroundImage",
                "required":false,
                "description": "The background wallpaper for the page."
            },
            "isStartNode": {
                "type":"boolean",
                "id": "http://jsonschema.net/isStartNode",
                "required":true,
                "description": "Set this to true if this chapter should be the start of your book."
            },
            "textLost": {
                "type":"string",
                "id": "http://jsonschema.net/textLost",
                "required":true,
                "description": "The text displayed when the check is lost."
            },
            "textWon": {
                "type":"string",
                "id": "http://jsonschema.net/textWon",
                "required":true,
                "description": "The text displayed when the check is won."
            },
            "titleLost": {
                "type":"string",
                "id": "http://jsonschema.net/titleLost",
                "required":true,
                "description": "The title displayed when the check is lost."
            },
            "titleWon": {
                "type":"string",
                "id": "http://jsonschema.net/titleWon",
                "required":true,
                "description": "The title displayed when the check is won."
            },
            "wonTarget": {
                "type":"string",
                "id": "http://jsonschema.net/titleWon",
                "required":false,
                "description": "The chapter jumped when won."
            },
            "lostTarget": {
                "type":"string",
                "id": "http://jsonschema.net/lostTarget",
                "required":false,
                "description": "The chapter jumped when lost."
            },
            "title": {
                "type":"string",
                "id": "http://jsonschema.net/type",
                "required":true,
                "description": "Chapter title, only used in the editor."
            },
            "question": {
                "type":"string",
                "id": "http://jsonschema.net/type",
                "required":true,
                "description": "Question text."
            },
            "textAnswer": {
                "type":"string",
                "id": "http://jsonschema.net/type",
                "required":true,
                "description": "Correct answer if this is a text question."
            },
            "questionType": {
                "type":"string",
                "id": "http://jsonschema.net/type",
                "required":true,
                "description": "Type of question, can be any of 'text', 'multiple'."
            },
            "choices": {
                "type": "array",
                "required":false,
                "items": {
                    "type": "object",
                    "$schema": "http://json-schema.org/draft-03/schema",
                    "id": "http://jsonschema.net",
                    "required": true,
                    "properties": {
                        "choiceText": {
                            "type": "string",
                            "id": "http://jsonschema.net/attribute",
                            "required": true,
                            "description": "Text of this choice."
                        },
                        "isCorrect": {
                            "type": "boolean",
                            "id": "http://jsonschema.net/value",
                            "required": true,
                            "description": "True if this choice is the correct choice."
                        }
                    }
                },
                "minItems": 2,
                "uniqueItems": true
            }
        }
    },
    "battle":
    {
        "type":"object",
        "$schema": "http://json-schema.org/draft-03/schema",
        "id": "http://jsonschema.net",
        "required":false,
        "properties":{
            "backgroundImage": {
                "type":"string",
                "id": "http://jsonschema.net/backgroundImage",
                "required":false,
                "description": "The background wallpaper for the page."
            },
            "alternateBackgroundImage": {
                "type":"string",
                "id": "http://jsonschema.net/alternateBackgroundImage",
                "required":false,
                "description": "The alternate background wallpaper for the page."
            },
            "isStartNode": {
                "type":"boolean",
                "id": "http://jsonschema.net/isStartNode",
                "required":true,
                "description": "Set this to true if this chapter should be the start of your book."
            },
            "textLost": {
                "type":"string",
                "id": "http://jsonschema.net/textLost",
                "required":false,
                "description": "The text displayed when the battle is lost."
            },
            "textEscape": {
                "type":"string",
                "id": "http://jsonschema.net/textEscape",
                "required":false,
                "description": "The text displayed when the battle is won."
            },
            "textWon": {
                "type":"string",
                "id": "http://jsonschema.net/textWon",
                "required":false,
                "description": "The text displayed when the battle is won."
            },
            "titleEscape": {
                "type":"string",
                "id": "http://jsonschema.net/titleEscape",
                "required":false,
                "description": "The title displayed when the battle is lost."
            },
            "titleLost": {
                "type":"string",
                "id": "http://jsonschema.net/titleLost",
                "required":false,
                "description": "The title displayed when the battle is lost."
            },
            "titleWon": {
                "type":"string",
                "id": "http://jsonschema.net/titleWon",
                "required":false,
                "description": "The title displayed when the battle is won."
            },
            "escapeTarget": {
                "type":"string",
                "id": "http://jsonschema.net/titleWon",
                "required":false,
                "description": "The chapter jumped when escaped."
            },
            "wonTarget": {
                "type":"string",
                "id": "http://jsonschema.net/titleWon",
                "required":false,
                "description": "The chapter jumped when won."
            },
            "lostTarget": {
                "type":"string",
                "id": "http://jsonschema.net/lostTarget",
                "required":false,
                "description": "The chapter jumped when lost."
            },
            "title": {
                "type":"string",
                "id": "http://jsonschema.net/type",
                "required":true,
                "description": "Chapter title, only used in the editor."
            },
            "monster": {
                "type": "object",
                "$schema": "http://json-schema.org/draft-03/schema",
                "id": "http://jsonschema.net",
                "required":true,
                "properties": {
                    "name": {
                        "type": "string",
                        "id": "http://jsonschema.net/name",
                        "required": true,
                        "description": "Name of the monster."
                    },
                    "power": {
                        "type": "integer",
                        "id": "http://jsonschema.net/power",
                        "required": true,
                        "description": "Power of the monster."
                    },
                    "life": {
                        "type": "integer",
                        "id": "http://jsonschema.net/life",
                        "required": true,
                        "description": "Life of the monster."
                    },
                    "icon": {
                        "type": "string",
                        "id": "http://jsonschema.net/icon",
                        "required": true,
                        "description": "Image URL of the monster."
                    }
                }
            }
        }
    },
    "cutscene":
    {
        "type":"object",
        "$schema": "http://json-schema.org/draft-03/schema",
        "id": "http://jsonschema.net",
        "required":false,
        "properties":{
            "isStartNode": {
                "type":"boolean",
                "id": "http://jsonschema.net/isStartNode",
                "required":true,
                "description": "Set this to true if this chapter should be the start of your book."
            },
            "title": {
                "type":"string",
                "id": "http://jsonschema.net/type",
                "required":true,
                "description": "Chapter title, only used in the editor."
            },
            "nextStation": {
                "type":"string",
                "id": "http://jsonschema.net/type",
                "required":true,
                "description": "Next chapter to jump after the cutscene ended."
            },
            "frames": {
                "type": "array",
                "items": {
                    "type": "object",
                    "$schema": "http://json-schema.org/draft-03/schema",
                    "id": "http://jsonschema.net",
                    "properties": {
                        "layers": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "$schema": "http://json-schema.org/draft-03/schema",
                                "id": "http://jsonschema.net",
                                "properties": {
                                    "type": {
                                        "type": "string",
                                        "id": "http://jsonschema.net/type",
                                        "required": true,
                                        "description": "Type of the frame."
                                    },
                                    "className": {
                                        "type": "string",
                                        "id": "http://jsonschema.net/type",
                                        "required": true,
                                        "description": "CSS class name."
                                    },
                                    "image": {
                                        "type": "string",
                                        "id": "http://jsonschema.net/type",
                                        "required": false,
                                        "description": "Image file name from media ressources."
                                    },
                                    "startPosX": {
                                        "type": "string",
                                        "id": "http://jsonschema.net/type",
                                        "required": true,
                                        "description": "Frame starting position (CSS property format)."
                                    },
                                    "startPosY": {
                                        "type": "string",
                                        "id": "http://jsonschema.net/type",
                                        "required": true,
                                        "description": "Frame starting position (CSS property format)."
                                    },
                                    "duration": {
                                        "type": "string",
                                        "id": "http://jsonschema.net/type",
                                        "required": true,
                                        "description": "Animation duration for this element in milliseconds."
                                    },
                                    "easing": {
                                        "type": "string",
                                        "id": "http://jsonschema.net/type",
                                        "required": true,
                                        "description": "Easing type for animation."
                                    },
                                    "delay": {
                                        "type": "string",
                                        "id": "http://jsonschema.net/type",
                                        "required": true,
                                        "description": "Delay in milliseconds until the animation starts."
                                    },
                                    "text": {
                                        "type": "string",
                                        "id": "http://jsonschema.net/type",
                                        "required": false,
                                        "description": "Text for text type frame."
                                    },
                                    "animations": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "$schema": "http://json-schema.org/draft-03/schema",
                                            "id": "http://jsonschema.net",
                                            "required": false,
                                            "properties": {
                                                "type": {
                                                    "type": "string",
                                                    "id": "http://jsonschema.net/type",
                                                    "required": true,
                                                    "description": "Animation type."
                                                },
                                                "param": {
                                                    "type": "string",
                                                    "id": "http://jsonschema.net/type",
                                                    "required": false,
                                                    "description": "Optional animation parameters."
                                                }
                                            }
                                        },
                                        "minItems": 1,
                                        "uniqueItems": false
                                    }
                                }
                            },
                            "minItems": 1,
                            "uniqueItems": false
                        }
                    }
                },
                "minItems": 1,
                "uniqueItems": true
            }
        }
    }
};