function deployCluster(request, response, next) {
    const receivedDomain = "default";
    const domainConfig = require("../utils").getClusterDomainConfig(receivedDomain);
    if (!domainConfig) {
        console.log('Deployment Domain not found : ', receivedDomain);
        return response.send(500);
    }

    let flow = $$.flow.start(domainConfig.type);
    flow.init(domainConfig);
    flow.startPipeline(request.body, (err, result) => {
        if (err) {
            return response.send(500,{});
        }
        response.send(201, result);
    });
}
module.exports = deployCluster;
