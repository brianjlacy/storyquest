#!/bin/sh

#
# This is a helper script that can be used to commit the projects directory
# to a git repository using cron.
#

cd /data/storyquest/storyquest-projects/
git add *
git diff --quiet --exit-code --cached || git commit -m "Build Commit"
git push -u origin --all --force
