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

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var testConfig = require(process.env.TESTCONFIGFILE || "./config.json");

var request = require("superagent");
var expect = require("expect.js");

// starting service
var config = require(process.env.CONFIGFILE || "../../config.json");
var service = require("../../storyquest.js");

describe("Media API", function() {
    var agent = request.agent();
    before(loginUser(agent));
    it("should return media list", function(done){
        agent.get(testConfig.hostURLPrefix + config.port + "/getmedialist").end(function(res) {
            expect(res).to.exist;
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("array");
            expect(res.body).to.have.length(1);
            expect(res.body[0]).to.contain("questorlogo.png");
            done();
        });
    });

    /*
    // Someone has to find out how to do a proper file upload request from superagent.
    // The only difference between working and this request is that superagent uses chunked transfer encoding.
    it("should be able to add an image", function(done){
        var req = agent.post(testConfig.hostURLPrefix + config.port + "/mediaupload");
        req.set("Accept", "application/json, text/javascript");
        //req.part()
        //    .set('Content-Type', 'image/png')
        //    .set('Content-Disposition', 'form-data; name="files[]"; filename="image.png"')
        //    .write('some image data');
        req.attach("files[]", "server/tests/image.png", "image1.png");
        req.end(function(res) {
            expect(res).to.exist;
            expect(res.status).to.equal(200);
            done();
        });
    });
    */

    // FIXME: if the above runs, add a test for DELETE
});

function loginUser(agent) {
    return function(done) {
        agent
            .post(testConfig.hostURLPrefix + config.port + "/login")
            .send({ username: testConfig.validUsername, password: testConfig.validPassword, project: testConfig.validProject })
            .end(onResponse);
        function onResponse(err, res) {
            //res.should.have.status(200);
            return done();
        }
    };
}