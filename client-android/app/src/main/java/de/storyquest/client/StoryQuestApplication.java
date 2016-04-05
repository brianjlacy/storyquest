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

import android.app.Application;
import android.content.Context;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class StoryQuestApplication extends Application {

    public static final int THEME_LIGHT = 0;
    public static final int THEME_DARK = 1;

    private int theme = THEME_DARK;
    private Map<String, String> configuration = null;

    @Override
    public void onCreate() {
        super.onCreate();
        Map<String, String> configuration = getStoryQuestConfiguration();
        if (configuration.containsKey("theme") && (configuration.get("theme").equals("0") || configuration.get("theme").equals("light")))
            setStoryQuestTheme(THEME_LIGHT);
        else
            setStoryQuestTheme(THEME_DARK);
    }

    public int getStoryQuestTheme() {
        return theme;
    }

    public void setStoryQuestTheme(int theme) {
        this.theme = theme;
    }

    public Map<String, String> getStoryQuestConfiguration() {
        if (configuration==null) {
            try {
                configuration = new HashMap<String, String>();
                JSONObject obj = new JSONObject(loadConfigJSONFromAsset());
                Iterator<String> iter = obj.keys();
                while (iter.hasNext()) {
                    String thisKey = iter.next();
                    configuration.put(thisKey, obj.getString(thisKey));
                }
            } catch (JSONException e) {
                throw new RuntimeException(e);
            }
        }
        return configuration;
    }

    private String loadConfigJSONFromAsset() {
        String json = null;
        try {
            InputStream is = getAssets().open("storyquest.json");
            int size = is.available();
            byte[] buffer = new byte[size];
            is.read(buffer);
            is.close();
            json = new String(buffer, "UTF-8");
        } catch (IOException ex) {
            ex.printStackTrace();
            return null;
        }
        return json;
    }
}
