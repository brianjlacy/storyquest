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
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GooglePlayServicesUtil;
import com.google.android.gms.common.api.GoogleApiClient;

public abstract class PlatformServicesActivity extends AppCompatActivity {

    private static final String LOGTAG = PlatformServicesActivity.class.getName();

    protected static boolean googlePlayServicesAvailable = false;

    protected static GooglePlayGamesServices googlePlayGamesServices = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // configure play service support
        googlePlayServicesAvailable = isGmsEnabled() && GooglePlayServicesUtil.isGooglePlayServicesAvailable(this) == ConnectionResult.SUCCESS;
        if (isGooglePlayServicesAvailable()) {
            // setup subsystems, may be asynchonous!
            getGooglePlayServices().onCreate(savedInstanceState);
        }
    }

    @Override
    protected void onStart() {
        super.onStart();

        // start play services
        if (getGooglePlayServices()!=null)
            getGooglePlayServices().onStart();
    }

    @Override
    protected void onStop() {
        super.onStop();
        if (getGooglePlayServices()!=null) {
            getGooglePlayServices().onStop();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (getGooglePlayServices()!=null)
            getGooglePlayServices().onSaveInstanceState(outState);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent intent) {
        super.onActivityResult(requestCode, resultCode, intent);
        if (getGooglePlayServices()!=null)
            getGooglePlayServices().onActivityResult(requestCode, resultCode, intent);
    }

    public GooglePlayGamesServices getGooglePlayServices() {
        // init, if not already intialized
        if (isGooglePlayServicesAvailable() && googlePlayGamesServices ==null)
            googlePlayGamesServices = new GooglePlayGamesServices(this);
        return googlePlayGamesServices;
    }

    public boolean isGmsEnabled() {
        ApplicationInfo ai = null;
        try {
            ai = getPackageManager().getApplicationInfo(this.getPackageName(), PackageManager.GET_META_DATA);
        } catch (PackageManager.NameNotFoundException e) {
            throw new RuntimeException(e);
        }
        Bundle bundle = ai.metaData;
        String gmsAppId = bundle.getString("com.google.android.gms.games.APP_ID");
        return !(gmsAppId == null || gmsAppId.equals("") || gmsAppId.equals("-1"));
    }

    public GoogleApiClient getApiClient() {
        if (isGooglePlayServicesAvailable())
            return getGooglePlayServices().getApiClient();
        else
            return null;
    }

    public boolean isSignedIn() {
        return isGooglePlayServicesAvailable() && getGooglePlayServices().isSignedIn();
    }

    public void retryConnecting() {
        if (isGooglePlayServicesAvailable())
            getGooglePlayServices().retryConnecting();
    }

    public boolean isGooglePlayServicesAvailable() {
        return googlePlayServicesAvailable;
    }

}
