class jenkinsService{
    constructor(jenkinsOperationStatus) {
        this.jenkinsOperationStatus = jenkinsOperationStatus;
        require('./parts/utils').call(this);
        require('./parts/command').call(this);
    }

    // service access points
    executeClusterOperation (jenkinsData, callback) {
        if (jenkinsData.clusterOperation === 'initiateNetworkUsingBlockchain') {
            return this._executeInitiateNetworkUsingBlockchain(jenkinsData, callback);
        }

        if (jenkinsData.clusterOperation === "initiateNetwork") {
            return this._executeInitiateNetwork(jenkinsData, callback);
        }

        if (jenkinsData.clusterOperation === "initiateNetworkWithDefaultConfiguration") {
            return this._executeInitiateNetworkWithDefaultConfiguration(jenkinsData, callback);
        }

        if (jenkinsData.clusterOperation === "uninstallNetworkWithDefaultConfiguration") {
            return this._executeUninstallNetworkWithDefaultConfiguration(jenkinsData, callback);
        }

        if (jenkinsData.clusterOperation === "upgradeNetworkUsingDefaultConfiguration") {
            return this._executeUpgradeNetworkWithDefaultConfiguration(jenkinsData, callback);
        }

        if (jenkinsData.clusterOperation === "retryInitiateNetworkWithDefaultConfiguration") {
            return this._executeRetryInitiateNetworkWithDefaultConfiguration(jenkinsData, callback);
        }

        const err = `Invalid cluster operation requested: ${jenkinsData.clusterOperation}`;
        console.log(err);
        callback({
            errType: "internalError",
            errMessage: err
        });
    }

    getOperationStatus (blockchainNetwork, callback){
        const status = this.jenkinsOperationStatus.getStatus(blockchainNetwork);
        if (status)
        {
            //got status
            return callback(undefined, status);
        }else {
            return callback(undefined, {
                status: 'Pending'
            })
        }
    }

    deleteOperationStatus (blockchainNetwork, callback) {
        const success = this.jenkinsOperationStatus.deleteStatus(blockchainNetwork);
        if (!success) {
            const errMessage = `Cluster status not found: ${blockchainNetwork}`;
            return callback({
                errMessage: errMessage,
                errType: "internalError"
            });
        }

        callback(undefined, {success: success});
    }

    executeCommandCluster (jsonData, callback) {
        console.log("commandCluster", jsonData);
        const command = jsonData.command;

        if (command === "jenkinsLog"){
            return this._downloadPipelineLog(jsonData, callback);
        }

        if (command === "jenkinsArtefact")
        {
            return this._downloadArtefactAsRaw(jsonData, callback);
        }
        const errMessage = `Unknown Command received : ${command}`;
        console.log(errMessage);
        callback(new Error(errMessage));
    }
    // end service access points


    _executeInitiateNetworkUsingBlockchain(jenkinsData, callback){
        console.log('executeClusterOperation started for : ',jenkinsData.clusterOperation);
        const pipelines = [];
        const blockchainNetwork = jenkinsData.blockchainNetwork;
        pipelines.push('deploy-Quorum-fresh-mode');
        pipelines.push('deploy-eth-adaptor');

        console.log('Planned pipelines',pipelines);
        const clusterOperationResult = {
            clusterOperation : 'initiateNetwork',
            blockchainNetwork: jenkinsData.blockchainNetwork,
            pipelines:[]
        }
        const jenkinsServer = this._getJenkinsServer(jenkinsData);
        if (jenkinsServer.err) {
            return callback({
                errType: "internalError",
                errMessage: jenkinsServer.err,
                jenkinsData: jenkinsData
            });
        }

        let currentPipeline = pipelines.shift();
        this._executePipeline(jenkinsServer, currentPipeline,blockchainNetwork, clusterOperationResult, (err, clusterResult, executionResultData) =>{
            if (err) {
                return this._execPipelineErrorSignal(err, clusterResult, currentPipeline, blockchainNetwork);
            }

            const downloadJsonData = {
                jenkinsData: jenkinsData,
                artefactName: executionResultData.artifacts[0].relativePath,
                buildNo: executionResultData.buildNo,
                jenkinsPipeline: currentPipeline
            };
            this._downloadArtefactAsText(downloadJsonData, (err, data) => {
                if (err){
                    return this._execPipelineErrorSignal(err, clusterResult,currentPipeline,blockchainNetwork);
                }
                clusterResult.EthAdapterJoiningJSON = data;
                const buffer = new Buffer(data);
                const base64data = buffer.toString('base64');
                //console.log(base64data);
                currentPipeline = pipelines.shift();
                const formDataFile = {
                    content: base64data,
                    fieldName: 'ethJoinFile',
                    fileName: 'ethJoin.json'
                };

                this._executePipelineWithFileParameter(jenkinsServer, currentPipeline,blockchainNetwork, clusterResult, formDataFile,(err, clusterResult ) => {
                    if (err) { return;}

                    this._finishPipelinesExecution(clusterResult, jenkinsData, blockchainNetwork);
                });
            });
        });

        console.log('releasing the request');
        callback(undefined,{
            clusterOperation : jenkinsData.clusterOperation,
            status: 'Operation started'
        });
    }

    _executeInitiateNetwork (jenkinsData, callback) {
        console.log(jenkinsData);
        const blockchainNetwork = jenkinsData.blockchainNetwork;
        const clusterOperationResult = {
            clusterOperation: 'initiateNetwork',
            blockchainNetwork: blockchainNetwork,
            pipelines: []
        }

        const jenkinsServer = this._getJenkinsServer(jenkinsData);
        if (jenkinsServer.err) {
            return callback({
                errType: "internalError",
                errMessage: jenkinsServer.err,
                jenkinsData: jenkinsData
            });
        }

        const pipeline = "install_usecase_installation";
        this._executePipeline(jenkinsServer, pipeline, blockchainNetwork, clusterOperationResult, (err, clusterResult, executionResultData) => {
            if (err) {
                return this._execPipelineErrorSignal(err, clusterResult, pipeline, blockchainNetwork);
            }

            this._finishPipelinesExecution(clusterResult, jenkinsData, blockchainNetwork);
        });

        console.log('releasing the request');
        callback(undefined,{
            clusterOperation : jenkinsData.clusterOperation,
            status: 'Operation started'
        });
    }

    _executeInitiateNetworkWithDefaultConfiguration (jenkinsData, callback) {
        console.log(jenkinsData);
        const blockchainNetwork = jenkinsData.blockchainNetwork;
        const clusterOperationResult = {
            clusterOperation: 'initiateNetworkWithDefaultConfiguration',
            blockchainNetwork: blockchainNetwork,
            pipelines: []
        }

        const jenkinsServer = this._getJenkinsServer(jenkinsData);
        if (jenkinsServer.err) {
            return callback({
                errType: "internalError",
                errMessage: jenkinsServer.err,
                jenkinsData: jenkinsData
            });
        }

        const pipeline = "install_usecase_installation";
        const pipelineParameters = jenkinsData.parametrizedPipeline;
        this._executeParametrizedPipeline(jenkinsServer, pipeline, pipelineParameters, clusterOperationResult, (err, clusterResult, executionResultData) => {
            if (err) {
                return this._execPipelineErrorSignal(err, clusterResult, pipeline, blockchainNetwork);
            }

            this._finishPipelinesExecution(clusterResult, jenkinsData, blockchainNetwork);
        });

        console.log('releasing the request');
        callback(undefined, {
            clusterOperation: jenkinsData.clusterOperation,
            status: 'Operation started'
        });
    }

    _executeUninstallNetworkWithDefaultConfiguration (jenkinsData, callback) {
        console.log(jenkinsData);
        const blockchainNetwork = jenkinsData.blockchainNetwork;
        const clusterOperationResult = {
            clusterOperation: 'uninstallNetworkWithDefaultConfiguration',
            blockchainNetwork: blockchainNetwork,
            pipelines: []
        }

        const jenkinsServer = this._getJenkinsServer(jenkinsData);
        if (jenkinsServer.err) {
            return callback({
                errType: "internalError",
                errMessage: jenkinsServer.err,
                jenkinsData: jenkinsData
            });
        }

        const pipeline = "clean_usecase_installation";
        const pipelineParameters = jenkinsData.parametrizedPipeline;
        this._executeParametrizedPipeline(jenkinsServer, pipeline, pipelineParameters, clusterOperationResult, (err, clusterResult, executionResultData) => {
            if (err) {
                return this._execPipelineErrorSignal(err, clusterResult, pipeline, blockchainNetwork);
            }

            this._finishPipelinesExecution(clusterResult, jenkinsData, blockchainNetwork);
        });

        console.log('releasing the request');
        callback(undefined, {
            clusterOperation: jenkinsData.clusterOperation,
            status: 'Operation started'
        });
    }

    _executeUpgradeNetworkWithDefaultConfiguration(jenkinsData, callback) {
        console.log(jenkinsData);
        const blockchainNetwork = jenkinsData.blockchainNetwork;
        const pipelines = ["clean_usecase_installation", "install_usecase_installation"];
        const clusterOperationResult = {
            clusterOperation: 'upgradeNetworkUsingDefaultConfiguration',
            blockchainNetwork: blockchainNetwork,
            pipelines: []
        }

        const jenkinsServer = this._getJenkinsServer(jenkinsData);
        if (jenkinsServer.err) {
            return callback({
                errType: "internalError",
                errMessage: jenkinsServer.err,
                jenkinsData: jenkinsData
            });
        }

        const __execPipeline = (pipelinesList, clusterResult) => {
            if (!pipelinesList.length) {
                return this._finishPipelinesExecution(clusterResult, jenkinsData, blockchainNetwork);
            }

            const pipeline = pipelinesList.shift();
            const pipelineParameters = jenkinsData.parametrizedPipeline;
            this._executeParametrizedPipeline(jenkinsServer, pipeline, pipelineParameters, clusterOperationResult, (err, clusterResult, executionResultData) => {
                if (err) {
                    return this._execPipelineErrorSignal(err, clusterResult, pipeline, blockchainNetwork);
                }

                __execPipeline(pipelinesList, clusterResult);
            });
        };

        __execPipeline(pipelines);

        console.log('releasing the request');
        callback(undefined, {
            clusterOperation: jenkinsData.clusterOperation,
            status: 'Operation started'
        });
    }

    _executeRetryInitiateNetworkWithDefaultConfiguration(jenkinsData, callback) {
        console.log(jenkinsData);
        const blockchainNetwork = jenkinsData.blockchainNetwork;
        const pipelines = ["clean_usecase_installation", "install_usecase_installation"];
        const clusterOperationResult = {
            clusterOperation: 'retryInitiateNetworkWithDefaultConfiguration',
            blockchainNetwork: blockchainNetwork,
            pipelines: []
        }

        const jenkinsServer = this._getJenkinsServer(jenkinsData);
        if (jenkinsServer.err) {
            return callback({
                errType: "internalError",
                errMessage: jenkinsServer.err,
                jenkinsData: jenkinsData
            });
        }

        const __execPipeline = (pipelinesList, clusterResult) => {
            if (!pipelinesList.length) {
                return this._finishPipelinesExecution(clusterResult, jenkinsData, blockchainNetwork);
            }

            const pipeline = pipelinesList.shift();
            const pipelineParameters = jenkinsData.parametrizedPipeline;
            this._executeParametrizedPipeline(jenkinsServer, pipeline, pipelineParameters, clusterOperationResult, (err, clusterResult, executionResultData) => {
                if (err) {
                    return this._execPipelineErrorSignal(err, clusterResult, pipeline, blockchainNetwork);
                }

                __execPipeline(pipelinesList, clusterResult);
            });
        };

        __execPipeline(pipelines);

        console.log('releasing the request');
        callback(undefined, {
            clusterOperation: jenkinsData.clusterOperation,
            status: 'Operation started'
        });
    }

    // helper functions

    _execPipelineErrorSignal (err, result, currentPipeline, blockchainNetwork) {
        result.pipelines.push({
            name: currentPipeline,
            result: 'EXCEPTION',
            log: JSON.stringify({
                errType: "internalError",
                errMessage: err
            })
        });

        if (!result.log) {
            result.log = '';
        }
        result.log = result.log + JSON.stringify(err) + '\n';
        result.pipelines = JSON.stringify(result.pipelines);
        result.pipelinesStatus = 'ERROR';
        this.jenkinsOperationStatus.setStatus(blockchainNetwork, result);
    }

    _executePipeline (jenkinsServer, currentPipeline, result, callback) {
        require('../utils/jenkinsPipeline').startPipeline(jenkinsServer, currentPipeline, (err, data) => {
            if (err) {
                return callback(err, result);
            }

            result.pipelines.push({
                name: currentPipeline,
                result: data.result,
                buildNo: data.buildNo,
                artifacts: data.artifacts
            });

            return callback(undefined, result, data);

        });
    }

    _executeParametrizedPipeline (jenkinsServer, currentPipeline, pipelineParameters, result, callback) {
        // parametrizedPipeline
        require('../utils/jenkinsPipeline').startParametrizedPipeline(jenkinsServer, currentPipeline, pipelineParameters, (err, data) => {
            if (err) {
                return callback(err, result);
            }

            result.pipelines.push({
                name: currentPipeline,
                result: data.result,
                buildNo: data.buildNo,
                artifacts: data.artifacts
            });

            return callback(undefined, result, data);
        });
    }

    _executePipelineWithFileParameter (jenkinsServer, currentPipeline, blockchainNetwork, result, formDataFile, callback) {
        require('../utils/jenkinsPipeline')
            .startPipelineWithFormDataFile(jenkinsServer, currentPipeline, formDataFile, (err, data) => {
                if (err) {
                    return callback(err, result);
                }

                result.pipelines.push({
                    name: currentPipeline,
                    result: data.result,
                    buildNo: data.buildNo,
                    artifacts: data.artifacts
                });

                return callback(undefined, result, data);
            });
    }

    _finishPipelinesExecution (result, jenkinsData, blockchainNetwork) {
        result.pipelines = JSON.stringify(result.pipelines);
        result.pipelinesStatus = 'SUCCESS';
        console.log(result);
        console.log('Cluster operation finished : ', jenkinsData.clusterOperation);
        this.jenkinsOperationStatus.setStatus(blockchainNetwork, result);
    }

    _downloadArtefactAsText(jsonData, callback) {
        const jenkinsData = jsonData.jenkinsData;
        const artefactName = jsonData.artefactName;
        const buildNo = jsonData.buildNo;
        const jenkinsServer = this._getJenkinsServer(jenkinsData);
        if (jenkinsServer.err) {
            return callback({
                errType: "internalError",
                errMessage: jenkinsServer.err,
                jenkinsData: jenkinsData
            });
        }
        jenkinsServer.jenkinsPipeline = jsonData.jenkinsPipeline;

        require('../utils/jenkinsPipeline').getJobArtefactAsText(jenkinsData, jenkinsServer, artefactName, buildNo, (err, data) => {
            if (err) {
                console.log(err);
                return callback(err, undefined);
            }
            return callback(undefined, data);
        })
    }
}


module.exports = jenkinsService;
