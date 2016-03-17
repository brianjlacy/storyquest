# StoryQuest Haven

This is the Haven editor for StoryQuest. It is a feature-rich web based development suite for
mobile augmented books. With StoryQuest, you can create e-books that contain audio, images,
illustrations, video, and interactive JavaScript-based content. StoryQuest delivers ready-to-deploy
app archives for various platforms, including iOS, Android, FirefoxOS, Chrome, and can export
builds for e-readers like Kindle or Kobo.

StoryQuest is currently in development and has reached beta stage. Feel free to comment or try.
Caution: documentation is somewhat sparse at the moment, we're woking on this. 

The following text describes the build process for StoryQuest. If you pulled this release either
from the storyquest-builds repository or the Docker registry, you usually does not need
to build the source as you are already using a built version. In this case, skip to the
chapter "Configuration".

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
utility from the Java SDK.

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
        --name storyquest storyquest

Change the paths for logging, projects, and keys/certificates as you need. If you changed
values in the config.json, you'll have to match the values on the command line accordingly.
After starting both images, the following services are available on the host:

    StoryQuest Editor Frontend: https://localhost:3001/ (https)
    StoryQuest Editor Frontend: http://localhost:3000/ (http)
    StoryQuest http Forwarder: http://localhost:8080/
    CouchDB Futon Frontend: http://localhost:1234/_utils/

## Running using Docker and Gig

If you are in a project development or production environment where you don't need
access to the StoryQuest source, you should consider starting StoryQuest along with
the database using Docker and a deployment automation tool like fig or gig.

First, install gig from the following repository:

    https://github.com/smancke/gig

fig also works, with the same configuration yml. Then create a yml configuration as
fig.yml:

    storyquest:
      image: kleinhenz/storyquest
      links:
       - couchdb:couchdb
      ports:
       - "0.0.0.0:3001:3001"
       - "0.0.0.0:8080:8080"
      volumes:
       - ./projects:/opt/app/projects
       - ./storyquest-logs:/opt/app/logs
       - ./config.json:/opt/app/config.json
       - ./ssl.key:/opt/app/ssl.key
       - ./ssl.crt:/opt/app/ssl.crt
       - ./sub.class1.server.ca.pem:/opt/app/sub.class1.server.ca.pem
    couchdb:
      image: klaemo/couchdb
      ports:
       - "1234:5984"
      volumes:
       - ./couchdb-data:/usr/local/var/lib/couchdb
       - ./couchdb-logs:/usr/local/var/log/couchdb

This uses all database storage, logs, configuration, projects and certificate
stuff from the local directory where the gig.yml resides. Add these files
and directories. Configure the ports in the yml as you need them. With the
default, the StoryQuest service will be available as https on port 3001
with a redirector at port 8080. In an production environment you might
want to map those ports to the external network on ports 443 and 80.
Also, the couchdb is available at port 1234 to give access to the futon
admin application.

Next, start the system by issuing:

    gig start

This downloads the needed Docker images and starts the system. To check the status,
issue:

    gig status

To stop the instances and remove their instance images, issue:

    gig rm

Refer to the gig documentation for further commands. Note that all runtime data,
project data and database storage is stored outside of the Docker images. By
issuing the rm command, you don't loose data. All runtime data is stored in
the yml configurated folders.

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

For deploying using git:

    gem install compass
    gem install susy
    npm install
    grunt build
    cd dist
    ssh-keyscan -H -p 22 YOUR_GIT_SERVER >> ~/.ssh/known_hosts
    git init
    git remote add origin "USER@YOUR_GIT_SERVER:REPOSITORY_PATH" || true
    git config --global user.email "YOUR_EMAIL"
    git config --global user.name "YOUR_NAME"
    git add *
    git commit -a -m "Build Commit"
    git push -u origin --all --force

This builds and commits StoryQuest on a git repository. The Dockerfile in
the root of the resulting repository can be used to build automated
Docker images using services like docker.io.

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


