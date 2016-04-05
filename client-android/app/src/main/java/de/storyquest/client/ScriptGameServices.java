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

import android.util.Log;
import android.webkit.JavascriptInterface;

import com.google.android.gms.games.Games;

public class ScriptGameServices {

    public static String LOGTAG = ScriptGameServices.class.getName();
    private ContentActivity activity = null;

    public ScriptGameServices(ContentActivity activity) {
        this.activity = activity;
    }

    @JavascriptInterface
    public void initGameCloud() {
        activity.retryConnecting();
    }

    @JavascriptInterface
    public void unlockAchievement(String achievementId) {
        if (activity.getApiClient()!=null && activity.getApiClient().isConnected()) {
            Log.d(LOGTAG, "Unlocking achievement: " + achievementId);
            Games.Achievements.unlock(activity.getApiClient(), achievementId);
        } else
            Log.d(LOGTAG, "Not connected: not unlocking achievement: " + achievementId);
    }

    @JavascriptInterface
    public boolean isSignedIn() {
        return activity.isSignedIn();
    }
}
