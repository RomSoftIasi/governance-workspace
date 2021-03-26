function Deploy(server) {
    console.log("ClustersController called")
    require('./strategies/ControlContainer');

    const ClusterStart = require('./start');
    const ClusterCommand = require('./command');
    const JenkinsPipelinesList = require('./list');
    const ClusterInitiateNetwork = require('./deploy');

    const { responseModifierMiddleware, requestBodyJSONMiddleware } = require('../privatesky/modules/apihub/utils/middlewares');

    server.use(`/controlContainer/*`, responseModifierMiddleware);

    server.put(`/controlContainer/start`, requestBodyJSONMiddleware);
    server.put(`/controlContainer/start`, ClusterStart);

    server.put(`/controlContainer/command`, requestBodyJSONMiddleware);
    server.put(`/controlContainer/command`, ClusterCommand);

    server.post(`/controlContainer/deploy`, requestBodyJSONMiddleware);
    server.post(`/controlContainer/deploy`, ClusterInitiateNetwork);

    server.post(`/controlContainer/listJenkinsPipelines`, requestBodyJSONMiddleware);
    server.post(`/controlContainer/listJenkinsPipelines`, JenkinsPipelinesList);
}

module.exports = Deploy;
