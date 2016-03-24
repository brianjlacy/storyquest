# StoryQuest

[![Build Status](https://travis-ci.org/michaelkleinhenz/storyquest.svg)](https://travis-ci.org/michaelkleinhenz/storyquest)

This is StoryQuest, A game book development platform complete with a web 
based editor and a mobile client.

It is a feature-rich web based development suite and mobile client for
mobile augmented books. With StoryQuest, you can create adventure e-books and interactive 
fiction that contain branching storylines, audio, images, illustrations, video, and 
interactive JavaScript-based content. StoryQuest delivers ready-to-deploy app archives 
for various platforms, including iOS, Android, FirefoxOS, Chrome, and can export
builds for e-readers like Kindle or Kobo.

StoryQuest is currently in development and has reached beta stage. Feel free to comment or try.
Caution: documentation is somewhat sparse at the moment, we're woking on this. 

## Build Preconditions

For the following steps, you will need nave.sh, grunt and bower installed. If you don't use
nave.sh, replace those steps accordingly:

    nave.sh use stable
    npm install bower-cli -g
    npm install grunt

StoryQuest should run with the current node stable release. We recommend strongly to use
nave.sh for development environment setup.

## Building

You first need to download the dependencies for the main project and the template project:

    npm install
    bower install
    cd template && bower install && cd ..

To build the project and the Docker container, change to the source directory and issue the
build command:

    grunt build && docker build -t storyquest dist/

This builds the static web tree and creates the output dist directory containing
the web frontend and the node service and all dependencies.

## Configuration

The configuration of the StoryQuest service can be found in the following file:

    config.json

You can use the supplied example-config.json as a template.

## Database Setup

StoryQuest uses CouchDB as database backend. See below how to start a docker CouchDB
image if you are using Docker. If you are starting from scratch, you will need an
initial database and a scheme to be uploaded to the database.

First create an empty database "storyquest" in your couchdb:

    curl -X PUT http://127.0.0.1:5984/storyquest

The needed database scheme methods are created automatically on first launch by
the StoryQuest service.

To create a first user, issue the following command:

    curl -H 'Content-Type: application/json' \
            -X POST http://127.0.0.1:5984/storyquest \
            -d '{"_id":"user_001","id":"user_001","credentials":{},"tags":[], \
                "projects":["project_001"],"library":[],"transactions": [],"username": \
                "your@email.address","name":"User Name","password":"PASSWORD_HASH", \
                "confirmed":true,"confirmationToken":"123","authtoken":"123", \
                "passwordResetToken":"123"}'

Replace the given values with your first user's data. Use a SHA256 hash for the
PASSWORD_HASH value:

    echo -n "your password" | sha256sum

You can later log in using the supplied username and password. You usually also
need to create a first project. In the above user record, a project with id
"project_001" is already attached to the new user. You now need to create that
project in the database:

    curl -H 'Content-Type: application/json' \
            -X POST http://127.0.0.1:5984/storyquest \
            -d '{"_id":"project_001","id": "project_001", \
                "deleted": false,"nodetypes": ["barebone", \
                "book","geo","web","youtube","cutscene","create", \
                "settings"],"testKey":"123","apiKey":"123","created": \
                "2014-06-24T14:32:33.199Z","changed":"2015-01-19T11:30:59.424Z", \
                "status":"new","coverimage":"","betaActive":true,"ratings":[], \
                "comments":[],"name":"Book Title","description":"Book Description", \
                "author":"User Name","tags":"tag1 tag2"}

Once you have the initial setup running, you can create new projects from the
web application. New users can use a self-registration system to create accounts.

## SSL Setup

StoryQuest runs on HTTPS by default. You will need a proper certificate and key
for running the service. You may also be needing a proper CA certificate. Add
the location of the SSL setup files to the config.json as usual.

## Running Preconditions

The Android SDK must be available on the path of the user running the server as well as the "keytool"
utility from the Java SDK. As it is required for building the Android client inside of
StoryQuest, a Java SDK must also be available.

In general, if you want to run StoryQuest you should consider using the Docker release builds and
run it using Ansible (see below).

## Running using Docker

If you are in an production environment, you should use Docker to start the StoryQuest service.
To do this, two Docker images must be started: the couchdb image for the database service and
the actual StoryQuest image. First, run the couchdb image:

    docker run -d -p 1234:5984 \
        --restart=always \
        -v /tmp/couchdb-data:/usr/local/var/lib/couchdb \
        -v /tmp/couchdb-logs:/usr/local/var/log/couchdb \
        --name couchdb klaemo/couchdb

Change the paths for the data and logs for the database as you need them. Next start the actual
StoryQuest image:

    docker run -it --rm \
        --restart=always \
        -p 0.0.0.0:3001:3001 \
        -p 0.0.0.0:8080:8080 \
        -v /tmp/projects:/opt/app/projects \
        -v /tmp/storyquest-logs:/opt/app/logs \
        -v $(pwd)/config.json:/opt/app/config.json \
        -v $(pwd)/ssl.key:/opt/app/ssl.key \
        -v $(pwd)/ssl.crt:/opt/app/ssl.crt \
        -v $(pwd)/sub.class1.server.ca.pem:/opt/app/sub.class1.server.ca.pem \
        --link couchdb:couchdb \
        --name storyquest kleinhenz/storyquest

Change the paths for logging, projects, and keys/certificates as you need. If you changed
values in the config.json, you'll have to match the values on the command line accordingly.
After starting both images, the following services are available on the host:

    StoryQuest Editor Frontend: https://localhost:3001/ (https)
    StoryQuest Editor Frontend: http://localhost:3000/ (http)
    StoryQuest http Forwarder: http://localhost:8080/
    CouchDB Futon Frontend: http://localhost:1234/_utils/

## Running using Docker and Ansible

If you are using Docker as a deployment method for StoryQuest, you'll need
at least a CouchDB image and the StoryQuest image running. To make
deployment easier, StoryQuest includes an Ansible playbook to install
StoryQuest/Docker with all needed dependencies on a fresh Ubuntu server.

This works out-of-the-box with a fresh AWS Ubuntu VM. You'll need Ansible 1.9+ 
on your local machine.

You'll find the needed files in the `ansible` directory of the StoryQuest source:

Inspect the `ansible_hosts` file and set your deployment host names.
To deploy StoryQuest, issue the following command on your local machine:

    ansible-playbook storyquest-playbook.yml -i ansible_hosts -s --private-key <PATH_TO>/<YOUR_KEY_>.pem

This will install the system on the given hosts. CAUTION: installing
requires to download several GB ob data from the Docker registry and
takes a while. DO NOT INTERRUPT THE ANSIBLE PROCESS. This might 
cause the Docker daemon on the target machine to go bonkers.

## Running in Development Mode

Using grunt, you can run the system in development mode locally to be able to do develoment
on the running system. In this setup, grunt acts as the server for the static web frontend
while a "headless" StoryQuest node service runs in the background. Grunt proxies requests
from the frontend to the REST service to the node port. First start the service instance:

    node storyquest.js

Then, start the static file hosting using grunt. If you changed the ports in storyquest.config,
you'll need to change the proxy target port in the Gruntfile.js as well. To start the grunt
hosting, issue:

    grunt serve

After starting both services, you'll have the following services on your host:

    StoryQuest Editor Frontend: http://localhost:9100/
    StoryQuest Backend Services: http://localhost:3000/ (http)
    StoryQuest Backend Services: http://localhost:3001/ (https)
    StoryQuest http Forwarder: http://localhost:8080/

This setup needs a running couchdb on the host "couchdb" on port 5984. For ususal
setups, just start a local couchdb and add the hostname to /etc/hosts.

The grunt service on port 9100 supports auto-reloading on change. Changes to the
static tree (SCSS, LESS and others) cause an automatic rebuild of the CSS and
JS resources and a reload of connected browsers.

## Building using Build Management Tools

If you want to build and deploy StoryQuest using build integration tools like
Semaphore, use the following command sequences:

For building:

    gem install compass
    gem install susy
    npm install
    grunt build

This builds StoryQuest. The resulting build is located in the `dist` directory
and a release archive is available in the `builds` directory. The Dockerfile in
the root of the build can be used to build the Docker image (see below).

## Building and Uploading a Docker Release Build

To build a Docker image and upload it to the Docker registry, issue the 
following commands in a *build dist* (usually the `dist` directory). 
First build the image locally, tagging it with a version string:

    docker build -t kleinhenz/storyquest:v3.0.0-alpha .

Then upload it into the docker registry:

    docker push kleinhenz/storyquest:v3.0.0-alpha

If you are using a different registry, change the url and tags according to your
registry's settings.

## Some Hints if anything goes wrong

### Dependencies not working

Some dependencies may not obey the rules for bower integration, so may not
integrate into the build process automatically. For example, the Sigma
component sometimes causes trouble. In this case, follow the instructions
in the following file:

    static/bower_components/sigma/README.md

Also, some components create conflicts with the requirejs library, causing
errors in the browser console. In this case, changing the order of the
javascript dependency includes in the footer.ejs may solve the problems.



