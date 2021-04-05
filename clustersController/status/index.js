
function ClusterStatus(jenkinsClusterStatus) {
    return function (request, response, next) {
        console.log('ClusterStatus API command received ....')
        const receivedDomain = "default";
        const domainConfig = require("../utils").getClusterDomainConfig(receivedDomain);
        if (!domainConfig) {
            console.log('Deployment Domain not found : ', receivedDomain);
            return response.send(500);
        }
        const blockchainNetwork = request.params.networkId;
        console.log('Get status for : ', blockchainNetwork);
        let flow = $$.flow.start(domainConfig.type);
        flow.init(domainConfig, jenkinsClusterStatus);
        flow.getClusterStatus(blockchainNetwork, (err, result) => {
            if (err) {
                return response.send(500, {});
            }
            if (result.status && result.status === 'Pending')
            {
                response.send(202, result);
            }else{
                response.send(201, result);
            }
        });
    }
}
module.exports = ClusterStatus;
