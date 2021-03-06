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
import android.app.ProgressDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.support.design.widget.NavigationView;
import android.support.v4.view.GravityCompat;
import android.support.v4.widget.DrawerLayout;
import android.view.MenuItem;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ImageView;
import android.widget.Toast;

import java.io.InputStream;

public class ContentActivity extends PlatformServicesActivity
        implements NavigationView.OnNavigationItemSelectedListener {

    public static String LOGTAG = ContentActivity.class.getName();

    public static final String BOOKMARKID = "bookmark";

    protected ProgressDialog progressDialog = null;
    protected WebView web = null;
    protected WebView character = null;
    protected String bookmarkId = null;

    protected ScriptSystem scriptSystem = null;
    protected ScriptStorage scriptStorage = null;
    protected ScriptSound scriptSound = null;
    protected ScriptGameServices scriptGameServices = null;

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

        // load initial layout
        setContentView(R.layout.activity_content);
        NavigationView navigationView = (NavigationView)findViewById(R.id.nav_view);
        navigationView.setNavigationItemSelectedListener(this);
        View header = navigationView.getHeaderView(0);

        // apply theme
        try {
            Drawable d = Drawable.createFromStream(getAssets().open("sidebar.jpg"), null);
            navigationView.setBackground(d);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        // wire the drawer open event to the character sheet refresh
        DrawerLayout drawer = (DrawerLayout)findViewById(R.id.drawer_layout);
        if (drawer != null) {
            drawer.addDrawerListener(new DrawerLayout.SimpleDrawerListener() {
                @Override
                public void onDrawerOpened(View drawerView) {
                    super.onDrawerOpened(drawerView);
                    execJavaScriptInCharactersheet("if(typeof refresh!='undefined')refresh()");
                }
            });
        }

        // get extra data with bookmark to load
        Intent intent = getIntent();
        if (intent.hasExtra(BOOKMARKID))
            bookmarkId = intent.getStringExtra(BOOKMARKID);

        // set the cover image from assets
        ImageView coverImage = (ImageView)header.findViewById(R.id.coverImage);
        try {
            InputStream ims = getAssets().open("cover.png");
            Drawable d = Drawable.createFromStream(ims, null);
            coverImage.setImageDrawable(d);
        }
        catch(Exception e) {
            throw new RuntimeException("Error loading cover image. Is 'cover.png' available in assets?", e);
        }

        // make the web content debuggable from external chrome tools
        WebView.setWebContentsDebuggingEnabled(true);

        // enable script interfaces
        scriptSystem = new ScriptSystem(this);
        scriptStorage = new ScriptStorage(this, getApplicationContext().getSharedPreferences(ScriptStorage.CONTEXT, Context.MODE_PRIVATE));
        scriptSound = new ScriptSound(this);
        scriptGameServices = new ScriptGameServices(this);

        // setup character webview
        character = (WebView) header.findViewById(R.id.characterView);
        character.getSettings().setJavaScriptEnabled(true);
        character.getSettings().setDomStorageEnabled(true);
        character.getSettings().setAllowFileAccess(true);
        character.getSettings().setAppCacheEnabled(true);
        character.addJavascriptInterface(scriptSystem, "sqSystem");
        character.addJavascriptInterface(scriptStorage, "nativeStorage");
        character.addJavascriptInterface(scriptSound, "sqSound");
        character.addJavascriptInterface(scriptGameServices, "sqGameServices");
        character.loadUrl("file:///android_asset/character.html");

        // setup web view
        web = (WebView) findViewById(R.id.webView);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(true);
        web.getSettings().setAppCacheEnabled(true);
        web.addJavascriptInterface(scriptSystem, "sqSystem");
        web.addJavascriptInterface(scriptStorage, "nativeStorage");
        web.addJavascriptInterface(scriptSound, "sqSound");
        web.addJavascriptInterface(scriptGameServices, "sqGameServices");

        // adding event overrides for the web view
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            public boolean shouldOverrideUrlLoading(WebView view, String urlText) {
                if (urlText.startsWith("http")) { // Could be cleverer and use a regex
                    Log.d(LOGTAG, "Opening standard web intent window for " + urlText);
                    Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(urlText));
                    startActivity(i);
                    return true;
                } else {
                    Log.d(LOGTAG, "Loading in webview: " + urlText);
                    web.loadUrl(urlText);
                    return true;
                }
            }
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                Log.d(LOGTAG, "Page rendering started: " + url + ".");
                displaySpinner(R.string.loading);
                super.onPageStarted(view, url, favicon);
            }
            @Override
            public void onPageFinished(WebView view, String url) {
                Log.d(LOGTAG, "Page rendering finished: " + url + ".");
                hideSpinner();
                if (bookmarkId!=null && url.startsWith("file:///android_asset/content.html")) {
                    Log.i(LOGTAG, "Loading bookmark " + bookmarkId + ".");
                    execJavaScriptInContent("loadBookmark('" + bookmarkId + "')");
                    bookmarkId = null;
                }
                super.onPageFinished(view, url);
            }
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
                Log.d(LOGTAG, "Intercepted call: " + url + ".");
                return null;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            public boolean onConsoleMessage(ConsoleMessage cm) {
                Log.d(LOGTAG, cm.message() + " - from line "
                        + cm.lineNumber() + " of "
                        + cm.sourceId());
                return true;
            }
        });
        web.getSettings().setRenderPriority(WebSettings.RenderPriority.HIGH);
        web.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        web.requestFocus(View.FOCUS_DOWN);

        // finally loading content bootstrap
        Log.i(LOGTAG, "Loading index.html");
        web.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {
        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
        if (drawer.isDrawerOpen(GravityCompat.START)) {
            drawer.closeDrawer(GravityCompat.START);
        } else {
            super.onBackPressed();
        }
    }

    @SuppressWarnings("StatementWithEmptyBody")
    @Override
    public boolean onNavigationItemSelected(MenuItem item) {
        // Handle navigation view item clicks here.
        int id = item.getItemId();

        if (id == R.id.nav_main) {
            displayMain();
        } else if (id == R.id.nav_achievements) {
            getGooglePlayServices().showAchievementsView();
        } else if (id == R.id.nav_bookmarks) {
            displayBookmarks();
        } else if (id == R.id.nav_help) {
            displayHelp();
        } else if (id == R.id.nav_storebookmark) {
            execJavaScriptInContent("storeBookmark()");
            Toast.makeText(this, getResources().getText(R.string.bookmarkStored), Toast.LENGTH_SHORT).show();
        }
        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
        drawer.closeDrawer(GravityCompat.START);
        return true;
    }

    private void displayMain() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle(getResources().getString(R.string.mainMenuSecurityTitle));
        builder.setPositiveButton(android.R.string.yes, new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int id) {
                Log.i(LOGTAG, "Displaying Main Menu..");
                Intent mainMenuIntent = new Intent(ContentActivity.this, MainMenuActivity.class);
                startActivity(mainMenuIntent);
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

    private void displayBookmarks() {
        Log.i(LOGTAG, "Displaying Bookmarks..");
        Intent bookmarkIntent = new Intent(this, BookmarkActivity.class);
        startActivityForResult(bookmarkIntent, 42);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent intent) {
        super.onActivityResult(requestCode, resultCode, intent);
        if (requestCode==42) {
            Log.i(LOGTAG, "Returning from bookmarks, refreshing bookmark model..");
            execJavaScriptInContent("initBookmarks()");
        }
    }

    private void displayHelp() {
        Log.i(LOGTAG, "Displaying Help..");
        Intent helpIntent = new Intent(this, GenericActivity.class);
        helpIntent.putExtra(GenericActivity.TITLE, getResources().getString(R.string.helpTitle));
        helpIntent.putExtra(GenericActivity.HTMLPATH,"help.html");
        helpIntent.putExtra(GenericActivity.BACKGROUNDIMAGE,"help.jpg");
        startActivity(helpIntent);
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

    public void execJavaScriptInContent(final String javaScript) {
        Log.d(LOGTAG, "Executing JavaScript in existing WebView: " + javaScript);
        this.runOnUiThread(new Runnable() {
            public void run() {
                web.loadUrl("javascript:" + javaScript);
            }
        });
    }

    public void execJavaScriptInCharactersheet(final String javaScript) {
        Log.d(LOGTAG, "Executing JavaScript in existing WebView: " + javaScript);
        this.runOnUiThread(new Runnable() {
            public void run() {
                character.loadUrl("javascript:" + javaScript);
            }
        });
    }

    public final void displaySpinner(int resource) {
        Log.d(LOGTAG, "Showing wait dialog.");
        if (progressDialog!=null) {
            progressDialog = new ProgressDialog(this, R.style.AppDialog);
            progressDialog.setMessage(getString(resource));
            // making immersive mode stay while the dialog is shown
            progressDialog.getWindow().setFlags(
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE);
            progressDialog.show();
            progressDialog.getWindow().getDecorView().setSystemUiVisibility(
                    this.getWindow().getDecorView().getSystemUiVisibility());
        }
    }

    public final void hideSpinner() {
        Log.d(LOGTAG, "Hiding wait dialog.");
        if (progressDialog!=null) {
            progressDialog.dismiss();
            progressDialog = null;
        }
    }
}