/*
 * StoryQuest
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

var questML = {

    // Images classes: left, center, right
    "i": function(tokens) {
        return replaceAny(tokens, "<div class='image $0'><img src='images/$1'></div>")
    },

    // Content Boxes classes: left, full, right
    "b": function(tokens) {
        // TODO: this is a hack
        tokens[1] = tokens[1].replace("</p>", "");
        var result = replaceAny(tokens, "<div class='box $0'>$1</div>")
        return result.replace("<p></p>", "");
    },

    // Script Boxes classes: left, full, right
    "m": function(tokens) {
        // TODO: this is a hack
        tokens[1] = tokens[1].replace("</p>", "");
        var scriptResult = eval(tokens[1]);
        var result = replaceAny(tokens, "<div class='$0'>" + scriptResult + "</div>")
        return result.replace("<p></p>", "");
    },

    // Video classes: left, full, right
    "v": function(tokens) {
        return replaceAny(tokens, "<div class='$1'><a href='$2'><div class='videoicon'></div><div class='videotext'><b>Video</b><br> $3</div></a></div>")
    },

    // link boxes
    "l": function(tokens) {
        if (!tokens[2]) tokens[2] = "true";
        if (!tokens[3]) tokens[3] = "true";
        if (tokens[2]=="" || secureEvalBool(tokens[2]))
            if (tokens[3]=="" || secureEvalBool(tokens[3]))
                return replaceAny(tokens, "<div class='choice enabled' data-target='$0' href='#'><i class='fa fa-external-link'></i>&nbsp;&nbsp;$1</div>");
            else
                return replaceAny(tokens, "<div class='choice disabled' data-target='$0' href='#'><i class='fa fa-external-link'></i>&nbsp;&nbsp;$1</div>");
        else
            return "";
    },

    // inline links
    "il": function(tokens) {
        if (!tokens[2]) tokens[2] = "true";
        if (!tokens[3]) tokens[3] = "true";
        if (tokens[2]=="" || secureEvalBool(tokens[2]))
            if (tokens[3]=="" || secureEvalBool(tokens[3]))
                return replaceAny(tokens, "<span class='choice enabled' data-target='$0'>$1</span>");
            else
                return replaceAny(tokens, "<span class='choice disabled' data-target='$0'>$1</span>");
        else
            return "";
    },

    // task boxes
    "t": function(tokens) {
        if (tokens[5]=="" || secureEvalBool(tokens[5]))
            return replaceAny(tokens, "<div class='task enabled' data-target='$0'>$4</div>");
        else
            return replaceAny(tokens, "<div class='task disabled' data-target='$0'>$4</div>");
    },

    // condition
    "c": function(tokens) {
        if (tokens[0]=="" || secureEvalBool(tokens[0]))
            return tokens[1];
        else
            return tokens[2];
    },

    // script
    "s": function(tokens) {
        return eval(tokens[0]);
    },

    // decision
    "k": function(tokens) {
        if (tokens[0]=="" || secureEvalBool(tokens[0]))
            return tokens[1];
        else
            return tokens[2];
    },

    // execute
    "x": function(tokens) {
        if (!tokens[2]) tokens[2] = "true";
        if (!tokens[3]) tokens[3] = "true";
        if (tokens[2]=="" || secureEvalBool(tokens[2]))
            if (tokens[3]=="" || secureEvalBool(tokens[3]))
                return replaceAny(tokens, "<div class=\x27exec enabled\x27 onclick=\x27$0;$(this).addClass(\x22disabled\x22);refreshPage()\x27>$1</div>");
            else
                return replaceAny(tokens, "<div class=\x27exec disabled\x27>$1</div>");
        else
            return "";
    },

    // script
    "p": function(tokens) {
        eval(tokens[0]);
        return "";
    }
};

