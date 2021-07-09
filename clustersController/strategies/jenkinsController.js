class jenkinsController{
    constructor(jenkinsOperationStatus) {
        const jenkinsService = require('../strategies/jenkinsService');
        this.jenkinsServiceInstance = new jenkinsService(jenkinsOperationStatus);
    }

    InitiateClusterOperation(request, response){
        this.jenkinsServiceInstance.executeClusterOperation(request.body,(err, result) => {
            if (err) {
                return response.send(500, {err: err});
            }

            response.send(202, result);
        });
    };

    GetOperationStatus(request, response){
        const blockchainNetwork = request.params.networkId;
        this.jenkinsServiceInstance.getOperationStatus(blockchainNetwork, (err, result) => {
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
    };

    DeleteOperationStatus(request, response){
        const blockchainNetwork = request.params.networkId;
        this.jenkinsServiceInstance.deleteOperationStatus(blockchainNetwork, (err, result) => {
            if (err) {
                console.log(err);
                return response.send(500, {});
            }

            response.send(201, result);
        });
    }

    ExecuteCommandCluster(request, response){
        this.jenkinsServiceInstance.executeCommandCluster(request.body, (err, result) => {
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
}

module.exports = jenkinsController;
