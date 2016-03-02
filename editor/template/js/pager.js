/*
 * Pager
 * Questor HTML5 Paging
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

/**
 * The Tokenizer splits an input into chunks and returns an array of the chunks
 * on calling tokenize(). The chunks are defined as full words or HTML fragments.
 * HTML is always treated as one chunk and must be well formed.
 *
 * @param data The text data to be tokenized.
 * @constructor
 */
function Tokenizer(data) {
    this.input = data;
}

Tokenizer.prototype.tokenizerPosition = -1;
Tokenizer.prototype.input = "";

Tokenizer.prototype.nextCharacter = function() {
    if (this.tokenizerPosition+1>this.input.length-1)
        return null;
    else
        return this.input[this.tokenizerPosition+1];
};

Tokenizer.prototype.popCharacter = function() {
    var nextChar = this.nextCharacter();
    this.tokenizerPosition++;
    return nextChar;
};

Tokenizer.prototype.gatherTextToken = function() {
    var token = "";
    var nextChar = this.nextCharacter();
    while (nextChar!=null && nextChar!=" " && nextChar!="[" && nextChar!="{" && nextChar!="\n") {
        token += this.popCharacter();
        nextChar = this.nextCharacter();
    }
    return token;
};

Tokenizer.prototype.gatherHTMLToken = function() {
    var htmlToken = "";
    var nextChar = this.nextCharacter();
    while (nextChar!=null && nextChar!="]") {
        htmlToken+=nextChar;
        this.popCharacter();
        nextChar = this.nextCharacter();
    }
    this.popCharacter();
    return "[" + htmlToken + "]";
};

Tokenizer.prototype.gatherInlineScriptToken = function() {
    var scriptToken = "";
    var nextChar = this.nextCharacter();
    while (nextChar!=null && nextChar!="}") {
        scriptToken+=nextChar;
        this.popCharacter();
        nextChar = this.nextCharacter();
    }
    this.popCharacter();
    return "{" + scriptToken + "}";
};

Tokenizer.prototype.tokenize = function() {
    var tokens = [];
    var nextChar = this.nextCharacter();
    while (nextChar!=null) {
        if (nextChar=="[") {
            this.popCharacter();
            tokens.push(this.gatherHTMLToken());
        } else if (nextChar=="{") {
            this.popCharacter();
            tokens.push(this.gatherInlineScriptToken());
        } else if (nextChar==" ") {
            this.popCharacter();
            var token = this.gatherTextToken();
            tokens.push(" " + token);
        } else if (nextChar=="\n") {
            this.popCharacter();
            tokens.push("\n");
        } else
            tokens.push(this.gatherTextToken());
        nextChar = this.nextCharacter();
    };
    return tokens;
};

Tokenizer.prototype.isTextToken = function(token) {
    if (token!=undefined && (token[0]!="\n" && token[0]!="[" && token[0]!="{"))
        return true;
    else
        return false;
};

Tokenizer.prototype.isParagraphToken = function(token) {
    if (token!=undefined && token=="\n")
        return true;
    return false;
};

Tokenizer.prototype.isHTMLToken = function(token) {
    if (token!=undefined && (token[0]=="<" || token[0]=="["))
        return true;
    else
        return false;
};

Tokenizer.prototype.isScriptToken = function(token) {
    if (token!=undefined && (token[0]=="{"))
        return true;
    else
        return false;
};

/**
 * The pager pages thru a text. It displays tokens from the given input text until the
 * page is full (any more tokens would not be displayed in full). The text may contain
 * simple text and HTML. Simple text will be converted to HTML with a para for each line
 * until a CR. HTML must be enclosed in "*" characters and will be treated as a whole
 * and copied to the resulting page. NOTE: all HTML content has to be explicitly sized
 * on rendering to get a reliable paging. For example, img tags without width and height
 * will break paging because the image size is determined asynchonously by the web widget
 * resulting in undetermined rendering boundaries when just looking at the HTML. Images
 * must always have explicit width and height set.
 *
 * @param text The input text to be displayed.
 * @param targetElem The target JQuery element that receives the rendered text.
 * @param pageCallback Callback gets called when the page rendering is complete.
 * @constructor
 */
function Pager(text, targetElem, pageCallback) {
    this.pageStartTokens = [0];
    this.pageCallback = pageCallback;
    this.targetElem = targetElem;
    this.text = text;
    this.tokenizer = new Tokenizer(this.text);
    this.tokens = this.tokenizer.tokenize();
    this.displayPage(0);
}

Pager.prototype.pageCallback = null;
Pager.prototype.targetElem = null;
Pager.prototype.tokenizer = null;
Pager.prototype.text = "";
Pager.prototype.currentParagraph = null;
Pager.prototype.tokens = [];
Pager.prototype.currentPageIdx = 0;
Pager.prototype.currentNewFirstTokenIdx = 0;
Pager.prototype.pageStartTokens = [0];
Pager.prototype.fontSize = -1;
Pager.prototype.fontFamily = "";
Pager.prototype.pageblink = true;

/**
 * Switches the font between sans-serif and textfont.
 */
Pager.prototype.switchFont = function() {
    if (this.fontFamily=="" || this.fontFamily=="textfont")
        this.setFontFamily("sans-serif");
    else
        this.setFontFamily("textfont");
};

/**
 * Switches the pageblink.
 */
Pager.prototype.switchPageblink = function() {
    if (typeof this.pageblink=="undefined" || this.pageblink==false)
        this.pageblink = true;
    else
        this.pageblink = false;
    console.log("Setting pageblink to " + this.pageblink);
};

/**
 * Sets the font.
 */
Pager.prototype.setFontFamily = function(fontFamily) {
    if (typeof fontFamily!="undefined" && fontFamily!="") {
        console.log("Set font family: " + fontFamily);
        this.fontFamily=fontFamily;
        $("#content").css("font-family", this.fontFamily);
        this.reset();
    }
};

/**
 * Increases the font size. The display will be reset to page 0.
 */
Pager.prototype.fontLarger = function() {
    if (this.fontSize==-1)
        this.fontSize = parseInt(this.targetElem.children("p").css("font-size").split('px')[0]);
    this.setFontSize(++this.fontSize);
};

/**
 * Decreases the font size. The display will be reset to page 0.
 */
Pager.prototype.fontSmaller = function() {
    if (this.fontSize==-1)
        this.fontSize = parseInt(this.targetElem.children("p").css("font-size").split('px')[0]);
    this.setFontSize(--this.fontSize);
};

/**
 * Sets the font size. The display will be reset to page 0.
 */
Pager.prototype.setFontSize = function(fontSize) {
    console.log("Set font size: " + fontSize);
    if (typeof fontSize!="undefined" && fontSize!=-1) {
        this.fontSize = fontSize;
        this.targetElem.children("p").css("font-size", this.fontSize + 'px');
        this.reset();
    }
};

Pager.prototype.appendToElement = function(elem) {
    this.targetElem.append(elem);
};

Pager.prototype.appendToken = function(token) {
    if (this.tokenizer.isTextToken(token)) {
        if (this.currentParagraph!=null) {
            this.currentParagraph.innerHTML+=token;
        } else {
            this.currentParagraph = document.createElement("p");
            if (this.fontSize!=-1)
                $(this.currentParagraph).css("font-size", this.fontSize + 'px');
            this.currentParagraph.innerHTML=token;
            this.appendToElement(this.currentParagraph);
        }
    } else if (this.tokenizer.isHTMLToken(token)) {
        token = this.preparseLogic(token);
        this.appendToElement(token);
    } else if (this.tokenizer.isParagraphToken(token)) {
        if (this.currentParagraph!=null) {
            this.currentParagraph=null;
        }
    } else if (this.tokenizer.isScriptToken(token)) {
        token = this.preparseInlineLogic(token);
        if (this.currentParagraph!=null) {
            this.currentParagraph.innerHTML+=token;
        } else {
            this.currentParagraph = document.createElement("p");
            if (this.fontSize != -1)
                $(this.currentParagraph).css("font-size", this.fontSize + 'px');
            this.currentParagraph.innerHTML = token;
            this.appendToElement(this.currentParagraph);
        }
    }
    if (this.targetElem[0].clientHeight<this.targetElem[0].scrollHeight) {
        if (this.currentParagraph==null) {
            var html = this.targetElem[0].innerHTML;
            var newHtml = html.substr(0, html.length-token.length);
            this.targetElem[0].innerHTML=newHtml;
        } else {
            var html = this.currentParagraph.innerHTML;
            var newHtml = html.substr(0, html.length-token.length);
            this.currentParagraph.innerHTML=newHtml;
        }
        if (this.currentParagraph!=null) {
            this.currentParagraph=null;
        }
        return false;
    } else {
        return true;
    }
};

Pager.prototype.preparseInlineLogic = function(token) {
    var logics = token.match(/{.*}/g);
    if (logics!=null) {
        for (var i=0; i<logics.length; i++) {
            // remove brackets
            var logic = logics[i].substr(1, logics[i].length - 2);
            var logicParts = logic.split("|");
            // we only support scripts in inline at this time
            switch (logicParts[0]) {
                case "s":
                    return " " + questML.s([ logicParts[1] ]) + " ";
                case "k":
                    return " " + questML.k([ logicParts[1], logicParts[2], logicParts[3] ]) + " ";
                case "y":
                    return " " + questML.y([ logicParts[1], logicParts[2] ]) + " ";
                case "z":
                    return " " + questML.z([ logicParts[1], logicParts[2] ]) + " ";
            }
        }
    }
    else
        return token;
};

Pager.prototype.preparseLogic = function(htmlToken) {
    // if this is a real html token, just return it
    if (htmlToken.charAt(0)=="<" || htmlToken.charAt(0)!="[")
        return htmlToken;

    // remove brackets
    var logic = htmlToken.substr(1, htmlToken.length-2);
    var logicParts=logic.split("|");

    // if this is a HTML token, return it
    if (logicParts[0].charAt(0)=="<")
        return logicParts[0];

    switch (logicParts[0]) {
        case "<": return logicParts[1];
        case "i": return questML.i([ logicParts[1] ]);
        case "b": return questML.b([ logicParts[1], logicParts[2] ]);
        case "m": return questML.m([ logicParts[1], logicParts[2] ]);
        case "j": return questML.j([ logicParts[1], logicParts[2], logicParts[3] ]);
        case "d": return questML.d([ logicParts[1], logicParts[2], logicParts[3] ]);
        case "s": return questML.s([ logicParts[1] ]);
        case "k": return questML.k([ logicParts[1], logicParts[2], logicParts[3] ]);
        case "v": return questML.v([ logicParts[1] ]);
        case "q": return questML.q([ logicParts[1], logicParts[2], logicParts[3] ]);
        case "x": return questML.x([ logicParts[1], logicParts[2], logicParts[3], logicParts[4] ]);
        case "c": return questML.c([ logicParts[1], logicParts[2], logicParts[3] ]);
        case "l": return questML.l([ logicParts[1], logicParts[2], logicParts[3], logicParts[4] ]);
        case "f": return questML.f([ logicParts[1], logicParts[2], logicParts[3], logicParts[4], logicParts[5] ]);
        case "t": return questML.t([ logicParts[1], logicParts[2], logicParts[3], logicParts[4], logicParts[5], logicParts[6] ]);
    }
}

Pager.prototype.reset = function() {
    this.currentParagraph = null;
    this.currentPageIdx = 0;
    this.currentNewFirstTokenIdx = 0;
    this.pageStartTokens = [0];
    this.clearPage();
    while (this.currentNewFirstTokenIdx<this.tokens.length && this.appendToken(this.tokens[this.currentNewFirstTokenIdx]))
        this.currentNewFirstTokenIdx++;
    this.pageCallback();
}

/**
 * Clears the page.
 */
Pager.prototype.clearPage = function() {
    if (this.currentParagraph!=null) {
        this.currentParagraph=null;
    }
    this.targetElem.empty();
};

Pager.prototype.deleteData = function() {
    this.clearPage();
    this.currentParagraph = null;
    this.currentPageIdx = 0;
    this.currentNewFirstTokenIdx = 0;
    this.pageStartTokens = [0];
    this.pageCallback = null;
    this.targetElem = null;
    this.tokenizer = null;
    this.text = "";
    this.tokens = [];
}

/**
 * Displays the given page. The page must be already displayed once. E.g. it
 * is not possible to skip to page 10 after rendering only the first page. This
 * is caused by the need to render each page visually into the HTML to find out
 * what fits on the page and what not.
 *
 * @param idx The index of the page to be displayed. Index starts with 0.
 */
Pager.prototype.displayPage = function(idx) {
    this.currentNewFirstTokenIdx=this.pageStartTokens[idx];
    //console.log("DISPLAY PAGE " + idx + " using token start " + this.currentNewFirstTokenIdx + " (" + this.pageStartTokens + ")");
    if (this.pageStartTokens.length>idx+1) {
        // page was already rendered before, use the next token index as end token idx
        // to fix some broken browsers not reporting the right measures on first render
        for (var i=this.currentNewFirstTokenIdx;i<this.pageStartTokens[idx+1];i++) {
            if (!this.appendToken(this.tokens[this.currentNewFirstTokenIdx]))
                console.log("ERROR: token not visible, but should be visible: " + this.tokens[this.currentNewFirstTokenIdx] + " (" + this.currentNewFirstTokenIdx + ")");
            this.currentNewFirstTokenIdx++;
        }
    } else {
        // first render
        while (this.currentNewFirstTokenIdx<this.tokens.length && this.appendToken(this.tokens[this.currentNewFirstTokenIdx]))
            this.currentNewFirstTokenIdx++;
    }

    // finally call pageCallback()
    this.pageCallback();
}

/**
 * Displays the next page.
 */
Pager.prototype.nextPage = function() {
    if (this.currentNewFirstTokenIdx<this.tokens.length) {
        this.clearPage();
        if (this.currentPageIdx==this.pageStartTokens.length-1) {
            this.pageStartTokens.push(this.currentNewFirstTokenIdx);
        };
        this.currentPageIdx++;
        this.displayPage(this.currentPageIdx);
    }
};

Pager.prototype.getPageIdx = function() {
    return this.currentPageIdx;
};

Pager.prototype.hasMorePages = function() {
    if (this.currentNewFirstTokenIdx<this.tokens.length)
        return true;
    else
        return false;
};

/**
 * Displays the previous page.
 */
Pager.prototype.previousPage = function() {
    if (this.currentPageIdx>0) {
        this.clearPage();
        this.currentPageIdx--;
        this.displayPage(this.currentPageIdx);
    }
};