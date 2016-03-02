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

function modalYesNo(label, text, done) {
    $("#modalYesNoDoYes, #modalYesNoDoNo").click(function(event) {
        $("#modalYesNoDoYes").unbind("click");
        $("#modalYesNoDoNo").unbind("click");
        done($(event.target).is($("#modalYesNoDoYes"))?true:false);
    });
    $("#modalYesNoLabel").html(label);
    $("#modalYesNoText").html(text);
    $("#modalYesNo").modal();
}

function modalOk(label, text, done) {
    $("#modalOkDoOk").click(function(event) {
        $("#modalOkDoOk").unbind("click");
        done();
    });
    $("#modalOkLabel").html(label);
    $("#modalOkText").html(text);
    $("#modalOk").modal();
}

function modalOkCancel(label, text, done) {
    $("#modalOkCancelDoOk").click(function(event) {
        $("#modalOkCancelDoOk").unbind("click");
        $("#modalOkCancelDoCancel").unbind("click");
        done($(event.target).is($("#modalOkCancelDoOk"))?true:false);
    });
    $("#modalOkCancelLabel").html(label);
    $("#modalOkCancelText").html(text);
    $("#modalOkCancel").modal();
}

function modalWarning(label, text) {
    $("#modalWarningLabel").html(label);
    $("#modalWarningText").html(text);
    $("#modalWarning").modal();
}

function modalQR(link, projectId) {
    $("#previewqr").empty();
    $("#previewqr").qrcode({width: 200, height: 200, text: link});
    $("#devmodeurl").attr("href", "/api/p/" + projectId + "/index.html");
    $("#modalQR").modal();
}

function modalError(text) {
    $("#modalWarningLabel").html("Error");
    $("#modalWarningText").html(text);
    $("#modalWarning").modal();
}
