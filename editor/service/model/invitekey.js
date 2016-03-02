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

var config = require(process.env.CONFIGFILE || "../../config.json");

exports = module.exports = InviteKey;

function InviteKey() {
}

InviteKey.getKeyDocument = function(done) {
    db.get("invitekeys", function (err, doc) {
        if (!doc || doc.keys.length==0) {
            InviteKey.generateKeys(function(err, keyDoc) {
                done(err, keyDoc);
            });
        }
        else
            done(null, doc);
    });
};

InviteKey.saveKeyDocument = function(doc, done) {
    db.save(doc._id, doc._rev, doc, function (err, res) {
        if (err)
            done(err);
        else
            done(null);
    });
};

InviteKey.generateKeys = function(done) {
    var keyDocument = { _id: "invitekeys" , keys: [] };
    for (var i=0; i<1000; i++)
        keyDocument.keys.push(Utils.uuid());
    db.save(keyDocument, function (err, res) {
        if (err) {
            logger.error("Error generating keys: " + JSON.stringify(err));
            done(err, null);
        } else {
            logger.info("Created invite keys.");
            done(null, res);
        }
    });
};

InviteKey.isValidKey = function(key, done) {
    if (!key)
        done(false);
    else
        this.getKeyDocument(function(err, keyDoc) {
            if (!err && keyDoc && keyDoc.keys && keyDoc.keys.length>0 && keyDoc.keys.indexOf(key)!=-1) {
                keyDoc.keys.splice(keyDoc.keys.indexOf(key), 1);
                InviteKey.saveKeyDocument(keyDoc, function(err) {
                    if (err)
                        done(false);
                    else
                        done(true);
                })
            } else
                done(false);
        })
};