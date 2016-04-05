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
import android.graphics.drawable.Drawable;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.widget.ImageView;
import android.widget.VideoView;

import java.io.IOException;

public class MainMenuActivity extends AppCompatActivity {

    private static final String LOGTAG = PlatformServicesActivity.class.getName();
    private VideoView videoHolder = null;

    public static final int PICK_BOOKMARK = 42;

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

        setContentView(R.layout.activity_mainmenu);

        // setup theme
        int theme = ((StoryQuestApplication)this.getApplication()).getStoryQuestTheme();
        // TODO: setup theme colors whether THEME_LIGHT or THEME_DARK (default)

        videoHolder = (VideoView)findViewById(R.id.menuVideo);
        ImageView imageHolder = (ImageView)findViewById(R.id.menuImage);
        if (isVideoAvailable()) {
            imageHolder.setVisibility(View.GONE);
            if (videoHolder!=null) {
                videoHolder.setOnPreparedListener (new MediaPlayer.OnPreparedListener() {
                    @Override
                    public void onPrepared(MediaPlayer mp) {
                        mp.setLooping(true);
                    }
                });
                videoHolder.setVideoURI(Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.menu));
                videoHolder.requestFocus();
                videoHolder.start();
            }
        }
        else {
            videoHolder.setVisibility(View.GONE);
            try {
                Drawable background = Drawable.createFromStream(getAssets().open("menu.jpg"), null);
                findViewById(R.id.bookmarkLayout).setBackground(background);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }

        findViewById(R.id.buttonNew).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                displayBook(null);
            }
        });

        findViewById(R.id.buttonContinue).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                displayBookmarks();
            }
        });

        findViewById(R.id.buttonHelp).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                displayHelp();
            }
        });

        findViewById(R.id.buttonCredits).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                displayCredits();
            }
        });
    }

    private void displayBook(String bookmarkId) {
        Log.i(LOGTAG, "Displaying Book using bookmark id " + bookmarkId);
        Intent bookIntent = new Intent(this, ContentActivity.class);
        if (bookmarkId!=null)
            bookIntent.putExtra(ContentActivity.BOOKMARKID, bookmarkId);
        startActivity(bookIntent);
    }

    private void displayBookmarks() {
        Log.i(LOGTAG, "Displaying Bookmarks..");
        Intent bookmarkIntent = new Intent(this, BookmarkActivity.class);
        startActivityForResult(bookmarkIntent, PICK_BOOKMARK);
    }

    private void displayCredits() {
        Log.i(LOGTAG, "Displaying Credits..");
        Intent creditsIntent = new Intent(this, GenericActivity.class);
        creditsIntent.putExtra(GenericActivity.TITLE, getResources().getString(R.string.creditsTitle));
        creditsIntent.putExtra(GenericActivity.HTMLPATH,"credits.html");
        creditsIntent.putExtra(GenericActivity.BACKGROUNDIMAGE,"credits.jpg");
        startActivity(creditsIntent);
    }

    private void displayHelp() {
        Log.i(LOGTAG, "Displaying Help..");
        Intent helpIntent = new Intent(this, GenericActivity.class);
        helpIntent.putExtra(GenericActivity.TITLE, getResources().getString(R.string.helpTitle));
        helpIntent.putExtra(GenericActivity.HTMLPATH,"help.html");
        helpIntent.putExtra(GenericActivity.BACKGROUNDIMAGE,"help.jpg");
        startActivity(helpIntent);
    }

    protected boolean isVideoAvailable() {
        int result = getResources().getIdentifier("menu", "raw", getPackageName());
        if (result==0) {
            Log.i(LOGTAG, "Video menu not available, using image menu.");
            return false;
        } else {
            Log.i(LOGTAG, "Video menu available.");
            return true;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        // Check which request we're responding to
        if (requestCode == PICK_BOOKMARK) {
            // Make sure the request was successful
            if (resultCode == RESULT_OK) {
                // The user picked a bookmark
                String bookmarkId = data.getExtras().getString(BookmarkActivity.BOOKMARK);
                displayBook(bookmarkId);
            }
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

