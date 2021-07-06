
function ClusterInitiateNetwork(jenkinsClusterStatus) {
    return function (request, response, next) {
        console.log('ClusterInitiateNetwork API command received ....')
        const receivedDomain = "default";
        const domainConfig = require("../utils").getClusterDomainConfig(receivedDomain);
        if (!domainConfig) {
            console.log('Deployment Domain not found : ', receivedDomain);
            return response.send(500);
        }

        let flow = $$.flow.start(domainConfig.type);
        flow.init(domainConfig, jenkinsClusterStatus);
        flow.executeClusterOperation(request.body, (err, result) => {
            if (err) {
                return response.send(500, {err: err});
            }

            response.send(202, result);
        });
    }
}
module.exports = ClusterInitiateNetwork;
