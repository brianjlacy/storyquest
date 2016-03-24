# Installing StoryQuest using Ansible

If you are using Docker as a deployment method for StoryQuest, you'll need
at least a CouchDB image and the StoryQuest image running. To make
deployment easier, StoryQuest includes an Ansible playbook to install
StoryQuest/Docker with all needed dependencies on a fresh Ubuntu server.

This works out-of-the-box with a fresh AWS Ubuntu VM.

## Prerequisites

You'll nee Ansible 1.9+ on your local machine.

## Installing StoryQuest

Inspect the `ansible_hosts` file and set your deployment host names.
Then issue the following command on your local machine:

$ ansible-playbook storyquest-playbook.yml -i ansible_hosts -s --private-key <PATH_TO>/<YOUR_KEY_>.pem

This will install the system on the given hosts. CAUTION: installing
requires to download several GB ob data from the Docker registry and
takes a while. DO NOT INTERRUPT THE ANSIBLE PROCESS. This might 
cause the Docker daemon on the target machine to go bonkers.

