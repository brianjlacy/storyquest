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
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.ImageView;
import android.widget.VideoView;

public class SplashActivity extends AppCompatActivity {

    private static final String LOGTAG = PlatformServicesActivity.class.getName();
    private VideoView videoHolder = null;

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

        setContentView(R.layout.activity_splash);

        // setup theme
        int theme = ((StoryQuestApplication)this.getApplication()).getStoryQuestTheme();
        // TODO: setup theme colors whether THEME_LIGHT or THEME_DARK (default)

        videoHolder = (VideoView)findViewById(R.id.splashVideo);
        ImageView imageHolder = (ImageView)findViewById(R.id.splashImage);
        if (isVideoAvailable())
            imageHolder.setVisibility(View.GONE);
        else
            videoHolder.setVisibility(View.GONE);

        if (videoHolder!=null) {
            videoHolder.setOnPreparedListener (new MediaPlayer.OnPreparedListener() {
                @Override
                public void onPrepared(MediaPlayer mp) {
                    mp.setLooping(true);
                }
            });
            videoHolder.setVideoURI(Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.splash));
            videoHolder.requestFocus();
            videoHolder.start();
        }

        findViewById(R.id.splashVideo).setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View v, MotionEvent event) {
                displayMainMenu();
                return true;
            }
        });

        findViewById(R.id.splashImage).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                displayMainMenu();
            }
        });

        findViewById(R.id.touchToContinue).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                displayMainMenu();
            }
        });
    }

    private void displayMainMenu() {
        Log.i(LOGTAG, "Displaying Main Menu..");
        Intent intent = new Intent(this, MainMenuActivity.class);
        startActivity(intent);
    }

    protected boolean isVideoAvailable() {
        int result = getResources().getIdentifier("splash", "raw", getPackageName());
        if (result==0) {
            Log.i(LOGTAG, "Video splash not available, using image splash.");
            return false;
        } else {
            Log.i(LOGTAG, "Video splash available.");
            return true;
        }
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

    @Override
    protected void onPause() {
        super.onPause();
        videoHolder.stopPlayback();
    }

    @Override
    protected void onStop() {
        super.onStop();
        videoHolder.stopPlayback();
    }

    @Override
    protected void onResume() {
        super.onResume();
        videoHolder.requestFocus();
        videoHolder.start();
    }

    @Override
    protected void onStart() {
        super.onStart();
        videoHolder.requestFocus();
        videoHolder.start();
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        videoHolder.requestFocus();
        videoHolder.start();
    }
}

