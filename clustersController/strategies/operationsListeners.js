function operationListeners(jenkinsOperationStatus){
    const jenkinsController = require('./jenkinsController');
    const instance = new jenkinsController(jenkinsOperationStatus);

    this.InitiateClusterOperation =  (request,response) => {
        instance.InitiateClusterOperation(request, response);
    }

    this.GetOperationStatus = (request,response) => {
        instance.GetOperationStatus(request, response);
    }

    this.DeleteOperationStatus = (request,response) => {
        instance.DeleteOperationStatus(request, response);
    }

    this.ExecuteCommandCluster = (request,response) => {
        instance.ExecuteCommandCluster(request, response);
    }

    return this;
}


module.exports = operationListeners;
