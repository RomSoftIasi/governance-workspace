function Deploy(server) {
    console.log("ClustersController called")
    require('./strategies/ControlContainer');

    const ClusterStart = require('./start');
    const ClusterCommand = require('./command');
    const ClusterList = require('./list');
    const ClusterDeploy = require('./deploy');

    const { responseModifierMiddleware, requestBodyJSONMiddleware } = require('../privatesky/modules/apihub/utils/middlewares');

    server.use(`/controlContainer/*`, responseModifierMiddleware);

    server.put(`/controlContainer/start`, requestBodyJSONMiddleware);
    server.put(`/controlContainer/start`, ClusterStart);

    server.put(`/controlContainer/command`, requestBodyJSONMiddleware);
    server.put(`/controlContainer/command`, ClusterCommand);

    server.post(`/controlContainer/deploy`, requestBodyJSONMiddleware);
    server.post(`/controlContainer/deploy`, ClusterDeploy);

    server.get(`/controlContainer/listClusters`, ClusterList);
}

module.exports = Deploy;