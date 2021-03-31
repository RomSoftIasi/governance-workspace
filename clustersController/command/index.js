function commandCluster(request, response, next) {
    const receivedDomain = "default";
    const domainConfig = require("../utils").getClusterDomainConfig(receivedDomain);
    if (!domainConfig) {
        console.log('Deployment Domain not found : ', receivedDomain);
        return response.send(500);
    }

    let flow = $$.flow.start(domainConfig.type);
    flow.init(domainConfig);
    flow.commandCluster(request.body, (err, result) => {
        if (err) {
            if (err.code === 'EACCES') {
                return response.send(409);
            }
            return response.send(500);
        }
        if ( typeof result.on === 'function')
        {
            console.log('raw handling with headers');

            response.statusCode = result.statusCode;
            response.headers = result.headers;
            response.setHeader('Content-Type','application/raw');
            result.pipe(response);

        }else {
            console.log('json handling')
            response.send(201, result);
        }

    });
}

module.exports = commandCluster;
