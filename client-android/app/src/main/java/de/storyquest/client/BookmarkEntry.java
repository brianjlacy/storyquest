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

import android.content.Context;
import android.util.AttributeSet;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;

public class BookmarkEntry extends LinearLayout {

    private BookmarkSelectedListener bookmarkSelectedListener = null;
    private String bookmarkId = null;

    public interface BookmarkSelectedListener {
        void selectBookmark(String id);
        void deleteBookmark(String id);
    }


    public BookmarkEntry(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
        initView();
    }

    public BookmarkEntry(Context context, AttributeSet attrs) {
        super(context, attrs);
        initView();
    }

    public BookmarkEntry(Context context) {
        super(context);
        initView();
    }

    public void setBookmarkData(String id, String title, String subtitle) {
        this.bookmarkId = id;
        ((TextView)findViewById(R.id.bookmarkTitle)).setText(title);
        ((TextView)findViewById(R.id.bookmarkSubtitle)).setText(subtitle);
    }

    public void setOnBookmarkSelectedListener(BookmarkSelectedListener listener) {
        this.bookmarkSelectedListener = listener;
    }

    private void initView() {
        View view = inflate(getContext(), R.layout.component_bookmark, null);
        findViewById(R.id.bookmarkDeleteButton).setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                bookmarkSelectedListener.deleteBookmark(bookmarkId);
            }
        });
        this.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                bookmarkSelectedListener.selectBookmark(bookmarkId);
            }
        });

        addView(view);
    }
}
