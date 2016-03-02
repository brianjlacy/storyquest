== Update Storyquest == 
Für ein Update von dem Storyquest Docker Containern sowie dem Couchdb Docker Container muss
Ansibe (http://www.ansible.com/home) mit der Version 1.9 oder höher ausgecket werden.
Nun muss nur noch folgender Befehl ausgeführt werden:

$ ansible-playbook storyquest-playbook.yml -i ansible_hosts -s --private-key <PATH_TO>/QuestorDevEU.pem

Anschließend verbindet sich ansible mit den Servern die in ansible_hosts definiert sind
und führt das update aus.
ACHTUNG: Wenn neue Docker images heruntergeladen werden müssen kann dies etwas dauern. 
Unterbrechen sie den Prozess in dieser Zeit nicht, sonst wartet Docker das das image fertig heruntergeladen
worden ist bis es ein neues Docker image herunterlädt was aber nicht passieren kann da der Prozess schon gekillt ist.

=== Ansible Tasks ===
Folgende tasks führt ansible aus wenn sie noch nicht erledigt sind.

* apt install apt-transport-https
* Docker repository key hinzufügen
* Add Docker repository and update apt cache
* apt update
* apt upgrade
* Install the dependencies lxc-docker, python-dev and python-pip
* Update pip
* pip install Docker-py
* Start docker
* Run the latest docker image couchdb-docker
* Run the latest docker image storyquest-docker
