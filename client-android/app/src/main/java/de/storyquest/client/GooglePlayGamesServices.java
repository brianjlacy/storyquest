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

import android.app.Activity;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentSender;
import android.graphics.Bitmap;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GooglePlayServicesUtil;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.PendingResult;
import com.google.android.gms.games.Games;
import com.google.android.gms.games.snapshot.Snapshot;
import com.google.android.gms.games.snapshot.SnapshotMetadata;
import com.google.android.gms.games.snapshot.SnapshotMetadataChange;
import com.google.android.gms.games.snapshot.Snapshots;

import java.io.IOException;
import java.math.BigInteger;
import java.util.Random;

public class GooglePlayGamesServices implements
        GoogleApiClient.ConnectionCallbacks,
        GoogleApiClient.OnConnectionFailedListener {

    private static final String LOGTAG = GooglePlayGamesServices.class.getName();
    private static final String KEY_IN_RESOLUTION = "is_in_resolution";

    private boolean isSignedIn = false;

    /**
     * Request code for Google Play Services
     */
    protected static final int REQUEST_CODE_RESOLUTION = 1;
    private static final int REQUEST_CODE_SAVED_GAMES = 9009;

    Activity parentActvity = null;

    /**
     * Google API client.
     */
    private GoogleApiClient mGoogleApiClient;

    /**
     * Determines if the client is in a resolution state, and
     * waiting for resolution intent to return.
     */
    private boolean mIsInResolution;

    public GooglePlayGamesServices(Activity parentActvity) {
        this.parentActvity = parentActvity;
    }

    /**
     * Called when the activity is starting. Restores the activity state.
     */
    public void onCreate(Bundle savedInstanceState) {
        if (savedInstanceState != null) {
            mIsInResolution = savedInstanceState.getBoolean(KEY_IN_RESOLUTION, false);
        }
    }

    /**
     * Called when the Activity is made visible.
     * A connection to Play Services need to be initiated as
     * soon as the activity is visible. Registers {@code ConnectionCallbacks}
     * and {@code OnConnectionFailedListener} on the
     * activities itself.
     */
    public void onStart() {
        if (mGoogleApiClient == null) {
            mGoogleApiClient = new GoogleApiClient.Builder(parentActvity)
                    //.addApi(Drive.API)
                    .addApi(Games.API)
                    //.addApi(Plus.API)
                    //.addScope(Drive.SCOPE_FILE)
                    .addScope(Games.SCOPE_GAMES)
                    //.addScope(Plus.SCOPE_PLUS_LOGIN)
                    //.addScope(Drive.SCOPE_APPFOLDER)
                    // Optionally, add additional APIs and scopes if required.
                    .addConnectionCallbacks(this)
                    .addOnConnectionFailedListener(this)
                    .build();
        }
        mGoogleApiClient.connect();
    }

    /**
     * Called when activity gets invisible. Connection to Play Services needs to
     * be disconnected as soon as an activity is invisible.
     */
    public void onStop() {
        if (mGoogleApiClient != null) {
            mGoogleApiClient.disconnect();
        }
    }

    /**
     * Saves the resolution state.
     */
    public void onSaveInstanceState(Bundle outState) {
        outState.putBoolean(KEY_IN_RESOLUTION, mIsInResolution);
    }

    /**
     * Handles Google Play Services resolution callbacks.
     */
    public void onActivityResult(int requestCode, int resultCode, Intent intent) {
        switch (requestCode) {
            case REQUEST_CODE_RESOLUTION:
                // this is called when the user taps on "cancel" and don't want to log into google
                //retryConnecting();
                break;
            case REQUEST_CODE_SAVED_GAMES:
                if (intent.hasExtra(Snapshots.EXTRA_SNAPSHOT_METADATA)) {
                    // Load a snapshot.
                    SnapshotMetadata snapshotMetadata = (SnapshotMetadata)
                            intent.getParcelableExtra(Snapshots.EXTRA_SNAPSHOT_METADATA);
                    String mCurrentSaveName = snapshotMetadata.getUniqueName();

                    // Load the game data from the Snapshot
                    // ...
                } else if (intent.hasExtra(Snapshots.EXTRA_SNAPSHOT_NEW)) {
                    // Create a new snapshot named with a unique string
                    String unique = new BigInteger(281, new Random()).toString(13);
                    String mCurrentSaveName = "snapshotTemp-" + unique;

                    // Create the new snapshot
                    // ...
                }
                break;
        }
    }

    public GoogleApiClient getApiClient() {
        return mGoogleApiClient;
    }

    public boolean isSignedIn() {
        return isSignedIn;
    }

    public void retryConnecting() {
        mIsInResolution = false;
        if (!mGoogleApiClient.isConnecting()) {
            mGoogleApiClient.connect();
        }
    }

    /**
     * Called when {@code mGoogleApiClient} is connected.
     */
    @Override
    public void onConnected(Bundle connectionHint) {
        Log.i(LOGTAG, "GoogleApiClient connected");
        // Start making API requests.
    }

    /**
     * Called when {@code mGoogleApiClient} connection is suspended.
     */
    @Override
    public void onConnectionSuspended(int cause) {
        Log.i(LOGTAG, "GoogleApiClient connection suspended");
        retryConnecting();
    }

    /**
     * Called when {@code mGoogleApiClient} is trying to connect but failed.
     * Handle {@code result.getResolution()} if there is a resolution
     * available.
     */
    @Override
    public void onConnectionFailed(ConnectionResult result) {
        Log.i(LOGTAG, "GoogleApiClient connection failed: " + result.toString());
        isSignedIn = false;
        if (!result.hasResolution()) {
            // Show a localized error dialog.
            GooglePlayServicesUtil.getErrorDialog(
                    result.getErrorCode(), parentActvity, 0, new DialogInterface.OnCancelListener() {
                        @Override
                        public void onCancel(DialogInterface dialog) {
                            //retryConnecting();
                        }
                    }).show();
            return;
        }
        // If there is an existing resolution error being displayed or a resolution
        // activity has started before, do nothing and wait for resolution
        // progress to be completed.
        if (mIsInResolution) {
            return;
        }
        mIsInResolution = true;
        try {
            result.startResolutionForResult(parentActvity, REQUEST_CODE_RESOLUTION);
        } catch (IntentSender.SendIntentException e) {
            Log.e(LOGTAG, "Exception while starting resolution activity", e);
            //retryConnecting();
        }
    }

    public void showSavedGamesUI() {
        int maxNumberOfSavedGamesToShow = 5;
        Intent savedGamesIntent = Games.Snapshots.getSelectSnapshotIntent(mGoogleApiClient,
                "Meine Lesezeichen", false, true, maxNumberOfSavedGamesToShow);
        parentActvity.startActivityForResult(savedGamesIntent, REQUEST_CODE_SAVED_GAMES);
    }

    public PendingResult<Snapshots.CommitSnapshotResult> writeSnapshot(Snapshot snapshot,
                                                                       byte[] data, Bitmap coverImage, String desc) {

        // Set the data payload for the snapshot
        snapshot.getSnapshotContents().writeBytes(data);

        // Create the change operation
        SnapshotMetadataChange metadataChange = new SnapshotMetadataChange.Builder()
                .setCoverImage(coverImage)
                .setDescription(desc)
                .build();

        // Commit the operation
        return Games.Snapshots.commitAndClose(mGoogleApiClient, snapshot, metadataChange);
    }

    public void loadFromSnapshot(final String snapshotName) {
        ((MainActivity)parentActvity).displaySpinner(R.string.loading);
        AsyncTask<Void, Void, Integer> task = new AsyncTask<Void, Void, Integer>() {

            private byte[] saveGameData = null;

            @Override
            protected Integer doInBackground(Void... params) {
                // Open the saved game using its name.
                Snapshots.OpenSnapshotResult result = Games.Snapshots.open(mGoogleApiClient,
                        snapshotName, true).await();

                // Check the result of the open operation
                if (result.getStatus().isSuccess()) {
                    Snapshot snapshot = result.getSnapshot();
                    // Read the byte content of the saved game.
                    try {
                        saveGameData = snapshot.getSnapshotContents().readFully();
                    } catch (IOException e) {
                        Log.e(LOGTAG, "Error while reading Snapshot.", e);
                    }
                } else{
                    Log.e(LOGTAG, "Error while loading: " + result.getStatus().getStatusCode());
                }

                return result.getStatus().getStatusCode();
            }

            @Override
            protected void onPostExecute(Integer status) {
                ((MainActivity)parentActvity).hideSpinner();
                // TODO: call some callback with saveGameData.
            }
        };

        task.execute();
    }

    // FIXME: handle save game conflicts, see https://developers.google.com/games/services/android/savedgames#handling_saved_game_conflicts
}
