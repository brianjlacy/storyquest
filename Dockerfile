FROM ubuntu:wily
MAINTAINER Michael Kleinhenz <m.kleinhenz@goquestor.com>

#### update/install packages ####
RUN echo 'force-unsafe-io' | tee /etc/dpkg/dpkg.cfg.d/02apt-speedup && \
    echo 'DPkg::Post-Invoke {"/bin/rm -f /var/cache/apt/archives/*.deb || true";};' | tee /etc/apt/apt.conf.d/no-cache && \
    DEBIAN_FRONTEND=noninteractive apt-get update -y && DEBIAN_FRONTEND=noninteractive apt-get dist-upgrade -y && \
    DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends -y \
        software-properties-common curl && \
    DEBIAN_FRONTEND=noninteractive apt-get clean && DEBIAN_FRONTEND=noninteractive rm -rf /var/cache/apt/*

RUN DEBIAN_FRONTEND=noninteractive curl -sL https://deb.nodesource.com/setup_5.x | bash - 
RUN DEBIAN_FRONTEND=noninteractive apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get -y install nodejs

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
ADD package.json /tmp/package.json
RUN rm -rf ~/.npm && npm cache clean && rm -rf /root/.npm
RUN cd /tmp && npm install
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

# install java
RUN \
  apt-get update && \
  apt-get install -y openjdk-7-jdk && \
  rm -rf /var/lib/apt/lists/*
ENV JAVA_HOME /usr/lib/jvm/java-7-openjdk-amd64

# install android sdk to /opt/android
RUN curl -o /tmp/android.tgz http://dl.google.com/android/android-sdk_r24.4.1-linux.tgz
RUN tar xfz android.tgz -C /opt
RUN ( sleep 5 && while [ 1 ]; do sleep 1; echo y; done ) | /tmp/opt/android-sdk-linux/tools/android update sdk -u -t 1,4,27,49,50,52,53

# From here we load our application's code in, therefore the previous docker
# "layer" thats been cached will be used if possible
WORKDIR /opt/app
ADD . /opt/app

EXPOSE 3001
EXPOSE 3000
EXPOSE 8080

CMD ["node", "storyquest.js"]
