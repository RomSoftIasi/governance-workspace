function jenkinsOperationStatus() {
    let handler = {};
    let statusMap = new Map();
    handler.getStatus = function (jenkinsCluster) {
        console.log('get status for : ', jenkinsCluster);
        console.log('Current status map: ', statusMap);
        if (statusMap.has(jenkinsCluster)) {
            const data = statusMap.get(jenkinsCluster);
            console.log('Status found : ', data);
            return data;
        }

        console.log('Status NOT found for : ', jenkinsCluster);
        return undefined;
    }

    handler.setStatus = function (jenkinsCluster, jenkinsClusterOperationResult) {
        if (statusMap.has(jenkinsCluster)) {
            statusMap[jenkinsCluster] = jenkinsClusterOperationResult;
        } else {
            statusMap.set(jenkinsCluster, jenkinsClusterOperationResult)
        }

        console.log('Recorded status. Current global status map : ', statusMap);
    }

    handler.deleteStatus = function (jenkinsCluster) {
        console.log('delete status for: ', jenkinsCluster);
        console.log('Current status map: ', statusMap);
        if (statusMap.has(jenkinsCluster)) {
            statusMap.delete(jenkinsCluster);
            console.log('Status deleted for: ', jenkinsCluster);
            return true;
        }

        console.log('Status NOT found for: ', jenkinsCluster);
        return false;
    }

    console.log('Status initiated :', handler);
    return handler;
}

module.exports = {
    jenkinsOperationStatus: jenkinsOperationStatus
}
