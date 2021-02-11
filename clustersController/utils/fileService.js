const fs = require('fs');
const CLUSTER_FILE_NAME = require('../clusters.json');

const readClusters = (callback) => {
    callback(undefined, CLUSTER_FILE_NAME.clusters);
};

module.exports = {
    readClusters: readClusters
}