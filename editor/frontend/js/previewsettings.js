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

var demo = $("<div/>").css({
    position: "fixed",
    top: "150px",
    right: "0",
    background: "rgba(0, 0, 0, 0.7)",
    "border-radius": "5px 0px 0px 5px",
    padding: "10px 15px",
    "font-size": "16px",
    "z-index": "999999",
    cursor: "pointer",
    color: "#ddd",
    "font-family": "sans"
}).html("<i class='fa fa-gear'></i>").addClass("no-print");

var demo_settings = $("<div/>").css({
    "padding": "10px",
    position: "fixed",
    top: "130px",
    right: "-225px",
    background: "#fff",
    border: "3px solid rgba(0, 0, 0, 0.7)",
    "width": "200px",
    "z-index": "999999",
    "font-family": "sans",
    "font-size": "14px"
}).addClass("no-print");

demo_settings.append(
    "<h4 style='margin: 0 0 5px 0; border-bottom: 1px dashed #ddd; padding-bottom: 3px;'>Screen Size</h4>"
        + "<div class='form-group no-margin'>"
        + "<select name='aspect' size='1' onchange='setSize(this.selectedIndex)'>"
        + "<option>WXGA (800x1280)</option>"
        + "<option>WVGA (480x800)</option>"
        + "</select>"
        + "<select name='orientation' size='1' onchange='setOrientation(this.selectedIndex)'>"
        + "<option>Portrait</option>"
        + "<option>Landscape</option>"
        + "</select>"
        + "</div>"
);
demo_settings.append(
    "<h4 style='margin: 1em 0 5px 0; border-bottom: 1px dashed #ddd; padding-bottom: 3px;'>Controls</h4>"
        + "<div class='form-group no-margin'>"
        + "<input type='button' value='Refresh' onclick='reloadPreview()'>"
        + "</div>"
);

demo.click(function() {
    if (!$(this).hasClass("open")) {
        $(this).css("right", "225px");
        demo_settings.css("right", "0");
        $(this).addClass("open");
    } else {
        $(this).css("right", "0");
        demo_settings.css("right", "-225px");
        $(this).removeClass("open")
    }
});
