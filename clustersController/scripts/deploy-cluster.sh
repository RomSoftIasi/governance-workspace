#!/bin/bash

#variables
REPO_DIR="containername${1}"
CLUSTER_NAME="${2}"
ROOT_PATH="${3}"
COLLECTION_TEMPLATE_FOLDER="cluster-template-collection"
REPO_LINK="${4}"
REPO_NAME="${5}"

cd ${ROOT_PATH}

if [ ! -d "${COLLECTION_TEMPLATE_FOLDER}" ]; then mkdir ${COLLECTION_TEMPLATE_FOLDER}; fi
cd ${COLLECTION_TEMPLATE_FOLDER}

if [ ! -d "${REPO_DIR}" ]; then mkdir ${REPO_DIR}; fi

cd ${REPO_DIR}

if [ ! -d "${REPO_NAME}" ]; then git clone ${REPO_LINK}; fi

cd ${REPO_NAME}
npm install
npm run deploy-cluster -- ${CLUSTER_NAME}
