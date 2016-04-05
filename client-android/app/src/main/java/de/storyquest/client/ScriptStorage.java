/*
 * StoryQuest Android Client NG
 * Copyright (c) 2016 Questor GmbH, Berlin
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies
 * or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
package de.storyquest.client;

import android.content.SharedPreferences;
import android.util.Log;
import android.webkit.JavascriptInterface;

public class ScriptStorage {

    public static String LOGTAG = ScriptStorage.class.getName();

    private SharedPreferences store = null;
    private ContentActivity activity = null;

    public static final String CONTEXT = "storyquest";
    public static final String KEY_BOOKMARKS = "sqBookmarks";

    public ScriptStorage(ContentActivity activity, SharedPreferences store) {
        this.activity = activity;
        this.store = store;
    }

    /**
     * Stores a string value in local preferences using a given key.
     *
     * @param key Key of value.
     * @return Value.
     */
    @JavascriptInterface
    public String getItem(String key) {
        return store.getString(key, null);
    }

    /**
     * Retrieves a value from local preferences by given key.
     *
     * @param key Key of value.
     * @param value Value.
     */
    @JavascriptInterface
    public void setItem(String key, String value) {
        // workaround for broken data transfer between js and java.
        if (value!=null && value.equals("null"))
            value = null;
        Log.d(LOGTAG, "Native code: storing value: " + key + " = " + value);
        SharedPreferences.Editor editor = store.edit();
        editor.putString(key, value);
        editor.commit();
    }
}