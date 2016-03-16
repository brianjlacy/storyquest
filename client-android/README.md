# StoryQuest Android Client

This is the StoryQuest Android client. To build a book, follow these steps.

## Create the Properties
Create a properties file with all needed property values. An example
can be found in storyquest.properties.example.

## Setup Signing Info
Set signing info. For a proper build, you'll also need to set the
production keystore properties in the Shell using additional
environment variables:

   export KEYSTORE=/path/to/keystore
   export STORE_PASSWORD=password
   export KEY_ALIAS=keyalias
   export KEY_PASSWORD=password

##  Build

Build the release using:

   $ ./gradlew -Dorg.gradle.project.StoryQuestSettings=/path/to/the/properties.file assembleRelease

The APK can be found in build/output/apk.

