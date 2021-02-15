const fs = require('fs');
const path = require('path');

const readClusters = (callback) => {
    fs.readFile(path.resolve(__dirname, '../clusters.json'), (err, data) => {
        if (err) {
            return callback(err);
        }
        const clusterFile = JSON.parse(data)
        const clusters = clusterFile.clusters;
        if (!clusters) {
            return callback(err, []);
        }
        callback(undefined, clusters);
    })
};

module.exports = {
    readClusters: readClusters
}