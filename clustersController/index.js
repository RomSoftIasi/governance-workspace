function Deploy(server) {
    console.log("ClustersController called")
    require('./strategies/ControlContainer');

    const jenkinsClusterStatus = require('./utils/jenkinsClusterStatus').jenkinsClusterStatus();

    const ClusterStart = require('./start');
    const ClusterCommand = require('./command');
    const JenkinsPipelinesList = require('./list');
    const ClusterInitiateNetwork = require('./deploy')(jenkinsClusterStatus);
    const ClusterStatus = require('./status')(jenkinsClusterStatus);
    const ClusterStatusRemove = require('./statusRemove')(jenkinsClusterStatus);

    const { responseModifierMiddleware, requestBodyJSONMiddleware } = require('../privatesky/modules/apihub/utils/middlewares');

    server.use(`/controlContainer/*`, responseModifierMiddleware);

    server.put(`/controlContainer/start`, requestBodyJSONMiddleware);
    server.put(`/controlContainer/start`, ClusterStart);

    server.put(`/controlContainer/command`, requestBodyJSONMiddleware);
    server.put(`/controlContainer/command`, ClusterCommand);

    server.post(`/controlContainer/deploy`, requestBodyJSONMiddleware);
    server.post(`/controlContainer/deploy`, ClusterInitiateNetwork);

    server.get(`/controlContainer/status/:networkId`, requestBodyJSONMiddleware);
    server.get(`/controlContainer/status/:networkId`, ClusterStatus);

    server.delete(`/controlContainer/status/:networkId`, requestBodyJSONMiddleware);
    server.delete(`/controlContainer/status/:networkId`, ClusterStatusRemove);

    server.post(`/controlContainer/listJenkinsPipelines`, requestBodyJSONMiddleware);
    server.post(`/controlContainer/listJenkinsPipelines`, JenkinsPipelinesList);
}

module.exports = Deploy;
