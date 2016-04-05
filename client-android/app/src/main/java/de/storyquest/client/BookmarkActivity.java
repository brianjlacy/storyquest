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

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.text.format.DateFormat;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.widget.LinearLayout;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.sql.Date;

public class BookmarkActivity extends AppCompatActivity implements BookmarkEntry.BookmarkSelectedListener {

    private static final String LOGTAG = PlatformServicesActivity.class.getName();

    public static final String BOOKMARK = "bookmark";

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

        setContentView(R.layout.activity_bookmark);

        // setup theme
        int theme = ((StoryQuestApplication)this.getApplication()).getStoryQuestTheme();
        // TODO: setup theme colors whether THEME_LIGHT or THEME_DARK (default)

        try {
            Drawable background = Drawable.createFromStream(getAssets().open("bookmarks.jpg"), null);
            findViewById(R.id.bookmarkLayout).setBackground(background);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        // parse bookmarks
        String bookmarksJSON = getApplicationContext().getSharedPreferences(ScriptStorage.CONTEXT, Context.MODE_PRIVATE).
                getString(ScriptStorage.KEY_BOOKMARKS, null);
        if (bookmarksJSON!=null && !bookmarksJSON.equals(""))
            try {
                JSONArray jsonarray = new JSONArray(bookmarksJSON);
                for (int i = 0; i < jsonarray.length(); i++) {
                    // read bookmarks, build UI list
                    JSONObject jsonobject = jsonarray.getJSONObject(i);
                    String title = jsonobject.getString("name");
                    Date date = Date.valueOf(jsonobject.getString("date"));
                    String id = jsonobject.getString("id");
                    BookmarkEntry thisEntry = new BookmarkEntry(this);
                    thisEntry.setBookmarkData(id, title, DateFormat.getDateFormat(this).format(date));
                    thisEntry.setOnBookmarkSelectedListener(this);
                    ((LinearLayout)findViewById(R.id.bookmarkList)).addView(thisEntry);
                }
            } catch (JSONException e) {
                throw new RuntimeException(e);
            }

        findViewById(R.id.backtoMainButton).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
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

    @Override
    public void selectBookmark(final String bookmarkId) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle(getResources().getString(R.string.loadBookmarkSecurityTitle));
        builder.setPositiveButton(android.R.string.yes, new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int id) {
                Log.i(LOGTAG, "Displaying Book using bookmark id " + bookmarkId);
                Intent bookIntent = new Intent(BookmarkActivity.this, ContentActivity.class);
                bookIntent.putExtra(ContentActivity.BOOKMARKID, bookmarkId);
                startActivity(bookIntent);
                dialog.dismiss();
            }
        });
        builder.setNegativeButton(android.R.string.cancel, new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int id) {
                dialog.dismiss();
            }
        });
        AlertDialog dialog = builder.create();
        dialog.show();
    }

    @Override
    public void deleteBookmark(final String bookmarkId) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle(getResources().getString(R.string.deleteBookmarkSecurityTitle));
        builder.setPositiveButton(android.R.string.yes, new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int id) {
                JSONArray newBookmarkArray = new JSONArray();
                String bookmarksJSON = getApplicationContext().getSharedPreferences(ScriptStorage.CONTEXT, Context.MODE_PRIVATE).
                        getString(ScriptStorage.KEY_BOOKMARKS, null);
                if (bookmarksJSON!=null && !bookmarksJSON.equals(""))
                    try {
                        JSONArray jsonarray = new JSONArray(bookmarksJSON);
                        for (int i = 0; i < jsonarray.length(); i++) {
                            JSONObject jsonobject = jsonarray.getJSONObject(i);
                            if (!bookmarkId.equals(jsonobject.getString("id")))
                                newBookmarkArray.put(jsonobject);
                        }
                        SharedPreferences.Editor editor = getApplicationContext().getSharedPreferences(ScriptStorage.CONTEXT, Context.MODE_PRIVATE).edit();
                        editor.putString(ScriptStorage.KEY_BOOKMARKS, newBookmarkArray.toString());
                        editor.commit();
                    } catch (JSONException e) {
                        throw new RuntimeException(e);
                    }
                dialog.dismiss();
            }
        });
        builder.setNegativeButton(android.R.string.cancel, new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int id) {
                dialog.dismiss();
            }
        });
        AlertDialog dialog = builder.create();
        dialog.show();
    }
}
