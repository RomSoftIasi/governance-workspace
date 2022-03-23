FROM debian:latest AS Builder
ARG GHCODE

RUN npm install -g node-gyp

RUN apt-get update && \
	apt-get -y install nodejs && \
	apt-get -y install npm --no-install-recommends

RUN apt-get -y install git

ENV TARGET_FOLDER_NAME="gov-workspace"
RUN git clone https://$GHCODE:x-oauth-basic@github.com/RomSoftIasi/governance-workspace.git $TARGET_FOLDER_NAME

RUN cd $TARGET_FOLDER_NAME && \
    npm install --unsafe-perm

#All of the next lines will be handled from deployment.yaml

#ADD config/env.json /$TARGET_FOLDER_NAME/env.json
#After the custimization of config/server.json file uncomment the next line
#ADD config/server.json /$TARGET_FOLDER_NAME/apihub-root/external-volume/config/server.json
#ADD config/BDNS.hosts /$TARGET_FOLDER_NAME/apihub-root/external-volume/config/BDNS.hosts
#ADD config/ssl_certs /$TARGET_FOLDER_NAME/apihub-root/external-volume/config/ssl/server.crt
#ADD config/ssl_certs /$TARGET_FOLDER_NAME/apihub-root/external-volume/config/ssl/server.key

RUN cd $TARGET_FOLDER_NAME && \
    echo 'npm run server & \n sleep 1m \n npm run build-all \n tail -f /dev/null' >> startup-script.sh
RUN cd $TARGET_FOLDER_NAME && cat startup-script.sh

EXPOSE 8080/tcp

CMD cd $TARGET_FOLDER_NAME && \
    bash startup-script.sh
