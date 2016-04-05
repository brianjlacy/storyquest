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
import android.content.res.AssetFileDescriptor;
import android.media.MediaPlayer;
import android.webkit.JavascriptInterface;

import java.util.HashMap;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;

public class ScriptSound {

    private Activity activity = null;

    protected MediaPlayer musicPlayer = null;
    protected Map<String, MediaPlayer> playerMap = null;
    protected String lastMusic = null;
    protected boolean musicEnabled = true;
    protected int musicVolume = 10;

    public ScriptSound(Activity activity) {
        this.activity = activity;
        playerMap = new HashMap<String, MediaPlayer>();
        musicPlayer = new MediaPlayer();
        musicPlayer.setLooping(true);
    }

    public void restart() {
        if (musicEnabled) {
            playMusicLoop(lastMusic);
        }
    }

    /**
     * Plays a sound file once from the assets. The given path must be
     * relative to the assets. Usually this will be something like
     * "images/sound.mp3".
     *
     * @param path Path of sound file relative to assets.
     */
    @JavascriptInterface
    public void playSFXOnce(String path) {
        MediaPlayer player = playerMap.get(path);
        if (player==null) {
            player = new MediaPlayer();
            playerMap.put(path, player);
            try {
                AssetFileDescriptor afd = activity.getAssets().openFd(path);
                player.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
                player.prepare();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        player.start();
    }

    protected void internalPlayMusicLoop(String path) {
        lastMusic = path;
        if (musicEnabled && path!=null && !path.equals(""))
            try {
                AssetFileDescriptor afd = activity.getAssets().openFd(path);
                musicPlayer.reset();
                musicPlayer.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
                musicPlayer.prepare();
                musicPlayer.start();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
    }

    /**
     * Plays a sound file looping from the assets. The given path must be
     * relative to the assets. Usually this will be something like
     * "sounds/sound.mp3". The method returns a handle to the player. If a
     * sound is already playing, the prior sound will be stopped.
     *
     * @param path Path of sound file relative to assets.
     * @return Handle to the player (used to stop the loop later on).
     */
    @JavascriptInterface
    public String playMusicLoop(final String path) {

        if (musicPlayer.isPlaying()) {
            stopMusicLoop();
            final Timer timer = new Timer(true);
            TimerTask timerTask = new TimerTask() {
                @Override
                public void run()
                {
                    internalPlayMusicLoop(path);
                    timer.cancel();
                    timer.purge();
                }
            };
            timer.schedule(timerTask, 1500);
        } else {
            internalPlayMusicLoop(path);
        }
        return path;
    }

    /**
     * Stops a looping sound with the given handle.
     */
    @JavascriptInterface
    public void stopMusicLoop() {
        final Timer timer = new Timer(true);
        TimerTask timerTask = new TimerTask() {
            @Override
            public void run()
            {
                musicVolume--;
                musicPlayer.setVolume(musicVolume*0.1f, musicVolume*0.1f);
                if (musicVolume==0)
                {
                    if (musicPlayer.isPlaying())
                        musicPlayer.pause();
                    musicPlayer.reset();
                    musicPlayer.setVolume(1.0f, 1.0f);
                    musicVolume=10;
                    timer.cancel();
                    timer.purge();
                }
            }
        };
        timer.schedule(timerTask, 100, 100);
    }

    /**
     * Enables or disables music (does not affect sound effects!).
     *
     * @param enabled boolean.
     */
    @JavascriptInterface
    public void setMusicEnabled(boolean enabled) {
        musicEnabled = enabled;
        if (!enabled) {
            stopMusicLoop();
        } else if (lastMusic!=null) {
            playMusicLoop(lastMusic);
        }
    }
}