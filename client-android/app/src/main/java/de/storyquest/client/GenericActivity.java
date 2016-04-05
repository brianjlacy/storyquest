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

import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebView;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.io.IOException;

public class GenericActivity extends AppCompatActivity {

    private static final String LOGTAG = PlatformServicesActivity.class.getName();

    public static final String TITLE = "title";
    public static final String HTMLPATH = "htmlpath";
    public static final String BACKGROUNDIMAGE = "backgroundimage";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // enable immersive mode
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN
                | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);

        setContentView(R.layout.activity_generic);

        Intent myIntent = getIntent();
        String title = myIntent.getStringExtra(TITLE);
        String htmlPath= myIntent.getStringExtra(HTMLPATH);
        String backgroundImagePath= myIntent.getStringExtra(BACKGROUNDIMAGE);

        // setup theme
        int theme = ((StoryQuestApplication)this.getApplication()).getStoryQuestTheme();
        // TODO: setup theme colors whether THEME_LIGHT or THEME_DARK (default)

        // setup background
        try {
            Drawable background = Drawable.createFromStream(getAssets().open(backgroundImagePath), null);
            LinearLayout layout = (LinearLayout)findViewById(R.id.genericLayout);
            layout.setBackground(background);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        // setup title
        ((TextView)findViewById(R.id.genericTitle)).setText(title);

        // setup webview
        WebView webView = (WebView)findViewById(R.id.webViewGeneric);
        webView.setBackgroundColor(Color.TRANSPARENT);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setAppCacheEnabled(true);
        webView.loadUrl("file:///android_asset/" + htmlPath);

        findViewById(R.id.backtoMainButton).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Log.i(LOGTAG, "Displaying Main Menu..");
                Intent intent = new Intent(GenericActivity.this, MainMenuActivity.class);
                startActivity(intent);
            }
        });

        findViewById(R.id.backtoMainButton).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Log.i(LOGTAG, "Finishing generic activity..");
                finish();
            }
        });
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN
                    | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
        }
    }
}
