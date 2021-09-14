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

        if (jenkinsData.clusterOperation === "initiateNetworkWithDefaultConfiguration") {
            return this._executeInitiateNetworkWithDefaultConfiguration(jenkinsData, callback);
        }

        if (jenkinsData.clusterOperation === "uninstallNetworkUsingBlockchain") {
            return this._executeUninstallNetworkUsingBlockchain(jenkinsData, callback);
        }

        if (jenkinsData.clusterOperation === "uninstallNetworkWithDefaultConfiguration") {
            return this._executeUninstallNetworkWithDefaultConfiguration(jenkinsData, callback);
        }

        if (jenkinsData.clusterOperation === "upgradeNetworkUsingDefaultConfiguration") {
            return this._executeUpgradeNetworkWithDefaultConfiguration(jenkinsData, callback);
        }

        if (jenkinsData.clusterOperation === "upgradeNetworkUsingBlockchain") {
            return this._executeUpgradeNetworkWithBlockchain(jenkinsData, callback);
        }

        if (jenkinsData.clusterOperation === "retryInitiateNetworkWithDefaultConfiguration") {
            return this._executeRetryInitiateNetworkWithDefaultConfiguration(jenkinsData, callback);
        }

        if (jenkinsData.clusterOperation === "retryInitiateNetworkWithBlockchain") {
            return this._executeRetryInitiateNetworkWithBlockchain(jenkinsData, callback);
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
        const blockchainNetwork = jenkinsData.blockchainNetwork;


        const clusterOperationResult = {
            clusterOperation : jenkinsData.clusterOperation,
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

        this._executeInitiateNetworkUsingBlockchainInternal(jenkinsServer,blockchainNetwork,clusterOperationResult, jenkinsData);

        console.log('releasing the request');
        callback(undefined,{
            clusterOperation : jenkinsData.clusterOperation,
            status: 'Operation started'
        });
    }

    _executeInitiateNetworkUsingBlockchainInternal(jenkinsServer,blockchainNetwork,clusterOperationResult, jenkinsData, pipelineCallback){
        if (!pipelineCallback){
            pipelineCallback = (err, clusterResult) =>{
                if (err){
                    return;
                }
                this._finishPipelinesExecution(clusterResult, jenkinsData, blockchainNetwork);
            };
        }

        console.log('executeClusterOperation started for : ',jenkinsData.clusterOperation);

        const pipelineParameters = jenkinsData.parametrizedPipeline;
        const pipelines = [];
        pipelines.push('deploy-Quorum-fresh-mode');
        pipelines.push('deploy-eth-adaptor');
        pipelines.push('deploy_usecase_using_blockchain');
        console.log('Planned pipelines',pipelines);

        let currentPipeline = pipelines.shift();
        this._executePipeline(jenkinsServer, currentPipeline, clusterOperationResult, (err, clusterResult, executionResultData) =>{
            if (err) {
                this._execPipelineErrorSignal(err, clusterResult, currentPipeline, blockchainNetwork);
                return pipelineCallback(err);
            }

            const downloadJsonData = {
                jenkinsData: jenkinsData,
                artefactName: executionResultData.artifacts[0].relativePath,
                buildNo: executionResultData.buildNo,
                jenkinsPipeline: currentPipeline
            };
            this._downloadArtefactAsText(downloadJsonData, (err, data) => {
                if (err){
                    this._execPipelineErrorSignal(err, clusterResult,currentPipeline,blockchainNetwork);
                    return pipelineCallback(err);
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
                    if (err) {
                        this._execPipelineErrorSignal(err, clusterResult,currentPipeline,blockchainNetwork);
                        return pipelineCallback(err);
                    }

                    currentPipeline = pipelines.shift();
                    this._executeParametrizedPipeline(jenkinsServer, currentPipeline, pipelineParameters, clusterOperationResult, (err, clusterResult, executionResultData) => {
                        if (err) {
                            this._execPipelineErrorSignal(err, clusterResult, currentPipeline, blockchainNetwork);
                            return pipelineCallback(err);
                        }

                        return pipelineCallback(undefined, clusterResult);
                    });
                });
            });
        });


    }

    _executeUpgradeNetworkWithBlockchain(jenkinsData, callback){
        //currently they are the same. full uninstall and fresh install
        this._executeRetryInitiateNetworkWithBlockchain(jenkinsData, callback);
    }
    _executeRetryInitiateNetworkWithBlockchain(jenkinsData, callback){
        console.log(jenkinsData);
        const blockchainNetwork = jenkinsData.blockchainNetwork;
        const clusterOperationResult = {
            clusterOperation: jenkinsData.clusterOperation,
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

        this._executeUninstallNetworkUsingBlockchainInternal(jenkinsServer,clusterOperationResult,blockchainNetwork, jenkinsData, (err, clusterResult) =>{
            if (err){
                // failed to execute the pipeline and the execution was concluded
                return;
            }

            this._executeInitiateNetworkUsingBlockchainInternal(jenkinsServer,blockchainNetwork,clusterOperationResult, jenkinsData, (err, clusterResult) => {
                if (err){
                    // failed to execute the pipeline and the execution was concluded
                    return;
                }

                this._finishPipelinesExecution(clusterResult, jenkinsData, blockchainNetwork);
            });
        });

        console.log('releasing the request');
        callback(undefined, {
            clusterOperation: jenkinsData.clusterOperation,
            status: 'Operation started'
        });
    }

    _executeUninstallNetworkUsingBlockchain (jenkinsData, callback){
        console.log(jenkinsData);
        const blockchainNetwork = jenkinsData.blockchainNetwork;
        const clusterOperationResult = {
            clusterOperation: jenkinsData.clusterOperation,
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

        this._executeUninstallNetworkUsingBlockchainInternal(jenkinsServer,clusterOperationResult,blockchainNetwork, jenkinsData);

        console.log('releasing the request');
        callback(undefined, {
            clusterOperation: jenkinsData.clusterOperation,
            status: 'Operation started'
        });
    }
    _executeUninstallNetworkUsingBlockchainInternal (jenkinsServer,clusterOperationResult,blockchainNetwork, jenkinsData, pipelineCallback) {
        if (!pipelineCallback){
            pipelineCallback = (err, clusterResult) =>{
                if (err) { return;}
                this._finishPipelinesExecution(clusterResult, jenkinsData, blockchainNetwork);
            };
        }

        const pipelineParameters = jenkinsData.parametrizedPipeline;
        const pipelines = [];

        pipelines.push('clean-eth-adaptor');
        pipelines.push('clean-Quorum-fresh-mode');
        pipelines.push('clean_usecase_using_blockchain');

        let pipeline = pipelines.shift();

        this._executePipeline(jenkinsServer, pipeline, clusterOperationResult, (err, clusterResult, executionResultData) => {
            if (err) {
                this._execPipelineErrorSignal(err, clusterResult, pipeline, blockchainNetwork);
                return pipelineCallback(err);
            }

            pipeline = pipelines.shift();
            this._executePipeline(jenkinsServer, pipeline, clusterOperationResult, (err, clusterResult, executionResultData) => {
                if (err) {
                    this._execPipelineErrorSignal(err, clusterResult, pipeline, blockchainNetwork);
                    return pipelineCallback(err);
                }

                pipeline = pipelines.shift();
                this._executeParametrizedPipeline(jenkinsServer, pipeline, pipelineParameters, clusterOperationResult, (err, clusterResult, executionResultData) => {
                    if (err) {
                        this._execPipelineErrorSignal(err, clusterResult, pipeline, blockchainNetwork);
                        return pipelineCallback(err);
                    }

                    pipelineCallback(undefined, clusterResult);
                });
            });
        });


    }


    _executeInitiateNetworkWithDefaultConfiguration (jenkinsData, callback) {
        console.log(jenkinsData);
        const blockchainNetwork = jenkinsData.blockchainNetwork;
        const clusterOperationResult = {
            clusterOperation: jenkinsData.clusterOperation,
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

        const pipeline = "deploy_usecase_installation";
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
            clusterOperation: jenkinsData.clusterOperation,
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
        const pipelines = [
            "clean_usecase_installation",
            "deploy_usecase_installation"
        ];
        const clusterOperationResult = {
            clusterOperation: jenkinsData.clusterOperation,
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
        const pipelines = ["clean_usecase_installation", "deploy_usecase_installation"];
        const clusterOperationResult = {
            clusterOperation: jenkinsData.clusterOperation,
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
