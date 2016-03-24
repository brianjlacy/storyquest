# Building and Deploying StoryQuest

The following text describes the build and deployment process for
StoryQuest maintainers. This process might not be interesting for
other people.

## Step 1: Local Build 

For the following steps, you will need nave.sh, grunt and bower installed. If you don't use
nave.sh, replace those steps accordingly:

    nave.sh use stable
    npm install bower-cli -g
    npm install grunt

StoryQuest should run with the current node stable release. We recommend strongly to use
nave.sh for development environment setup.

To build the project, change to the source directory and issue the build command:

    grunt build

This builds the static web tree and creates the output dist directory containing
the web frontend and the node service and all dependencies.

## Step 2: Upload Build Artifact to GitHub

Give the `tar.gz` release file in `builds` a new version name and upload it as
a release to GitHub, creating a git tag.

## Step 3: Building and Uploading a Docker Release Build

To build a Docker image and upload it to the Docker registry, first edit
the Dockerfile and set the new version name (that you selected above):

   RUN curl -L -o /tmp/storyquest.tgz <new github release url>

Then build the image locally, tagging it with the version string 
(the same as above):

    docker build -t kleinhenz/storyquest:<new version name> .

Then upload it into the docker registry:

    docker push kleinhenz/storyquest:<new version name>

Note that the Docker build *will not use the local build*, but download 
the release `tar.gz` from GitHub.

## Step 4: Updating the Production Server with Ansible

Update the version string in the playbook:

    - name: start storyquest-docker
      docker: 
        docker_api_version: 1.18
        image: kleinhenz/storyquest:<new version name>

To deploy StoryQuest, issue the following command in the `ansible` directory:

    ansible-playbook storyquest-playbook.yml -i ansible_hosts -s --private-key <PATH_TO>/<YOUR_KEY_>.pem

This will install the system on the given hosts. CAUTION: installing
requires to download several GB ob data from the Docker registry and
takes a while. DO NOT INTERRUPT THE ANSIBLE PROCESS. This might 
cause the Docker daemon on the target machine to go bonkers.

