function ClusterStatusRemove(jenkinsClusterStatus) {
    return function (request, response, next) {
        console.log('ClusterStatus API command received ....')
        const receivedDomain = "default";
        const domainConfig = require("../utils").getClusterDomainConfig(receivedDomain);
        if (!domainConfig) {
            console.log('Deployment Domain not found : ', receivedDomain);
            return response.send(500);
        }

        const blockchainNetwork = request.params.networkId;
        console.log('Delete status for : ', blockchainNetwork);
        let flow = $$.flow.start(domainConfig.type);
        flow.init(domainConfig, jenkinsClusterStatus);
        flow.deleteClusterStatus(blockchainNetwork, (err, result) => {
            if (err) {
                return response.send(500, {
                    errMessage: err,
                    errType: "internalError"
                });
            }

            response.send(201, result);
        });
    }
}

module.exports = ClusterStatusRemove;
