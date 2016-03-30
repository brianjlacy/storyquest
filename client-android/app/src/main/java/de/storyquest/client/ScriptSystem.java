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

import android.net.Uri;
import android.util.Log;
import android.webkit.JavascriptInterface;

import com.google.android.gms.games.Games;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class ScriptSystem {

    public static String LOGTAG = ScriptSystem.class.getName();
    private MainActivity activity = null;

    public ScriptSystem(MainActivity activity) {
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
    public void displayAchievements() {
        if (activity.getApiClient()!=null && activity.getApiClient().isConnected()) {
            Log.d(LOGTAG, "Displaying achievements.");
            activity.startActivityForResult(Games.Achievements.getAchievementsIntent(activity.getApiClient()), 0);
        } else
            Log.d(LOGTAG, "Not connected: not displaying achievements.");
    }

    @JavascriptInterface
    public boolean isSignedIn() {
        return activity.isSignedIn();
    }

    /**
     * Returns always true. Used to check from the JS if the
     * client is a native client.
     *
     * @return true.
     */
    @JavascriptInterface
    public boolean isNativeClient() {
        return true;
    }

    /**
     * Loads a file from assets, returns the string value of the file.
     *
     * @param urlText Url relative to assets.
     * @return File contents as String.
     */
    @JavascriptInterface
    public String loadFile(String urlText) {
        Log.d(LOGTAG, "Loading URL: " + urlText);
        Uri url = Uri.parse(urlText);
        String filePath = url.getPath().replace("../", "");
        Log.d(LOGTAG, "Reading file: " + filePath);
        String contents = "";
        BufferedReader reader = null;
        try {
            reader = new BufferedReader(new InputStreamReader(activity.getAssets().open(filePath), "UTF-8"));
            String mLine = reader.readLine();
            while (mLine != null) {
                contents = contents + mLine + "\n";
                mLine = reader.readLine();
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            if (reader != null) {
                try {
                    reader.close();
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
        }
        return contents;
    }

    /**
     * Exits the app gracefully.
     */
    @JavascriptInterface
    public void exit() {
        Log.d(LOGTAG, "Exit received, terminating app.");
        activity.finish();
        System.exit(0);
    }
}
