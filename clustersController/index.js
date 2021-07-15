function Deploy(server) {
    console.log("ClustersController called")


    const jenkinsOperationStatus = require('./utils/jenkinsOperationStatus').jenkinsOperationStatus();
    const operationListener = require('./strategies/operationsListeners')(jenkinsOperationStatus);


    const { responseModifierMiddleware, requestBodyJSONMiddleware } = require('./middlewares');

    server.use(`/controlContainer/*`, responseModifierMiddleware);

    server.put(`/controlContainer/command`, requestBodyJSONMiddleware);
    server.put(`/controlContainer/command`, operationListener.ExecuteCommandCluster);

    server.post(`/controlContainer/deploy`, requestBodyJSONMiddleware);
    server.post(`/controlContainer/deploy`, operationListener.InitiateClusterOperation);

    server.get(`/controlContainer/status/:networkId`, requestBodyJSONMiddleware);
    server.get(`/controlContainer/status/:networkId`, operationListener.GetOperationStatus);

    server.delete(`/controlContainer/status/:networkId`, requestBodyJSONMiddleware);
    server.delete(`/controlContainer/status/:networkId`, operationListener.DeleteOperationStatus);


}

module.exports = Deploy;
