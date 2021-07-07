

$$.flow.describe('ControlContainer', {
    init: function (domainConfig, jenkinsClusterStatus) {
        //console.log('Init flow - ContainerControl for', domainConfig);
        this.jenkinsClusterStatus = jenkinsClusterStatus;
    },

    __getJenkinsServer(jenkinsData) {
        const jenkinsUser = jenkinsData.user;
        const jenkinsToken = jenkinsData.token;

        try {
            const endpointURL = new URL(jenkinsData.jenkins);

            const jenkinsHostName = endpointURL.hostname;
            const jenkinsPort = endpointURL.port;
            const jenkinsProtocol = endpointURL.protocol.replace(':', "");

            return {
                jenkinsHostName,
                jenkinsPort,
                jenkinsProtocol,
                jenkinsUser,
                jenkinsToken
            };
        } catch (err) {
            return {
                err: err
            };
        }
    },

    deleteClusterStatus: function (blockchainNetwork, callback) {
        const success = this.jenkinsClusterStatus.deleteStatus(blockchainNetwork);
        if (!success) {
            const errMessage = `Cluster status not found: ${blockchainNetwork}`;
            return callback({
                errMessage: errMessage,
                errType: "internalError"
            });
        }

        callback(undefined, {success: success});
    },

    getClusterStatus : function(blockchainNetwork, callback){
      const status = this.jenkinsClusterStatus.getStatus(blockchainNetwork);
      if (status)
      {
          //got status
          return callback(undefined, status);
      }else {
          return callback(undefined, {
              status: 'Pending'
          })
      }
    },

    __execPipelineErrorSignal: function (err, result, currentPipeline, blockchainNetwork) {
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
        this.jenkinsClusterStatus.setStatus(blockchainNetwork, result);
    },

    __executePipeline: function (jenkinsServer, currentPipeline, result, callback) {
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
    },

    __executeParametrizedPipeline: function (jenkinsServer, currentPipeline, pipelineParameters, result, callback) {
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
    },

    __executePipelineWithFileParameter: function (jenkinsServer, currentPipeline, blockchainNetwork, result, formDataFile, callback) {
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
    },

    __finishPipelinesExecution: function (result, jenkinsData, blockchainNetwork) {
        result.pipelines = JSON.stringify(result.pipelines);
        result.pipelinesStatus = 'SUCCESS';
        console.log(result);
        console.log('Cluster operation finished : ', jenkinsData.clusterOperation);
        this.jenkinsClusterStatus.setStatus(blockchainNetwork, result);
    },

    executeClusterOperation: function (jenkinsData, callback) {
        if (jenkinsData.clusterOperation === 'initiateNetworkUsingBlockchain') {
            return this.executeInitiateNetworkUsingBlockchain(jenkinsData, callback);
        }

        if (jenkinsData.clusterOperation === "initiateNetwork") {
            return this.executeInitiateNetwork(jenkinsData, callback);
        }

        if (jenkinsData.clusterOperation === "initiateNetworkWithParameters") {
            return this.executeInitiateNetworkWithParameters(jenkinsData, callback);
        }

        if (jenkinsData.clusterOperation === "removeNetworkWithParameters") {
            return this.executeRemoveNetworkWithParameters(jenkinsData, callback);
        }

        const err = `Invalid cluster operation requested: ${jenkinsData.clusterOperation}`;
        console.log(err);
        callback({
            errType: "internalError",
            errMessage: err
        });
    },

    executeRemoveNetworkWithParameters: function (jenkinsData, callback) {
        console.log(jenkinsData);
        const blockchainNetwork = jenkinsData.blockchainNetwork;
        const clusterOperationResult = {
            clusterOperation: 'removeNetworkWithParameters',
            blockchainNetwork: blockchainNetwork,
            pipelines: []
        }

        const jenkinsServer = this.__getJenkinsServer(jenkinsData);
        if (jenkinsServer.err) {
            return callback({
                errType: "internalError",
                errMessage: jenkinsServer.err,
                jenkinsData: jenkinsData
            });
        }

        const pipeline = "clean_usecase_installation";
        const pipelineParameters = jenkinsData.parametrizedPipeline;
        this.__executeParametrizedPipeline(jenkinsServer, pipeline, pipelineParameters, clusterOperationResult, (err, clusterResult, executionResultData) => {
            if (err) {
                return this.__execPipelineErrorSignal(err, clusterResult, pipeline, blockchainNetwork);
            }

            this.__finishPipelinesExecution(clusterResult, jenkinsData, blockchainNetwork);
        });

        console.log('releasing the request');
        callback(undefined, {
            clusterOperation: jenkinsData.clusterOperation,
            status: 'Operation started'
        });
    },

    executeInitiateNetworkWithParameters: function (jenkinsData, callback) {
        console.log(jenkinsData);
        const blockchainNetwork = jenkinsData.blockchainNetwork;
        const clusterOperationResult = {
            clusterOperation: 'initiateNetworkWithParameters',
            blockchainNetwork: blockchainNetwork,
            pipelines: []
        }

        const jenkinsServer = this.__getJenkinsServer(jenkinsData);
        if (jenkinsServer.err) {
            return callback({
                errType: "internalError",
                errMessage: jenkinsServer.err,
                jenkinsData: jenkinsData
            });
        }

        const pipeline = "install_usecase_installation";
        const pipelineParameters = jenkinsData.parametrizedPipeline;
        this.__executeParametrizedPipeline(jenkinsServer, pipeline, pipelineParameters, clusterOperationResult, (err, clusterResult, executionResultData) => {
            if (err) {
                return this.__execPipelineErrorSignal(err, clusterResult, pipeline, blockchainNetwork);
            }

            this.__finishPipelinesExecution(clusterResult, jenkinsData, blockchainNetwork);
        });

        console.log('releasing the request');
        callback(undefined, {
            clusterOperation: jenkinsData.clusterOperation,
            status: 'Operation started'
        });
    },

    executeInitiateNetwork: function (jenkinsData, callback) {
        console.log(jenkinsData);
        const blockchainNetwork = jenkinsData.blockchainNetwork;
        const clusterOperationResult = {
            clusterOperation: 'initiateNetwork',
            blockchainNetwork: blockchainNetwork,
            pipelines: []
        }

        const jenkinsServer = this.__getJenkinsServer(jenkinsData);
        if (jenkinsServer.err) {
            return callback({
                errType: "internalError",
                errMessage: jenkinsServer.err,
                jenkinsData: jenkinsData
            });
        }

        const pipeline = "install_usecase_installation";
        this.__executePipeline(jenkinsServer, pipeline, blockchainNetwork, clusterOperationResult, (err, clusterResult, executionResultData) => {
            if (err) {
                return this.__execPipelineErrorSignal(err, clusterResult, pipeline, blockchainNetwork);
            }

            this.__finishPipelinesExecution(clusterResult, jenkinsData, blockchainNetwork);
        });

        console.log('releasing the request');
        callback(undefined,{
            clusterOperation : jenkinsData.clusterOperation,
            status: 'Operation started'
        });
    },

    executeInitiateNetworkUsingBlockchain: function(jenkinsData, callback){
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
        const jenkinsServer = this.__getJenkinsServer(jenkinsData);
        if (jenkinsServer.err) {
            return callback({
                errType: "internalError",
                errMessage: jenkinsServer.err,
                jenkinsData: jenkinsData
            });
        }

        let currentPipeline = pipelines.shift();
        this.__executePipeline(jenkinsServer, currentPipeline,blockchainNetwork, clusterOperationResult, (err, clusterResult, executionResultData) =>{
            if (err) {
                return this.__execPipelineErrorSignal(err, clusterResult, currentPipeline, blockchainNetwork);
            }

            const downloadJsonData = {
                jenkinsData: jenkinsData,
                artefactName: executionResultData.artifacts[0].relativePath,
                buildNo: executionResultData.buildNo,
                jenkinsPipeline: currentPipeline
            };
            this.__downloadArtefactAsText(downloadJsonData, (err, data) => {
                if (err){
                    return this.__execPipelineErrorSignal(err, clusterResult,currentPipeline,blockchainNetwork);
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

                this.__executePipelineWithFileParameter(jenkinsServer, currentPipeline,blockchainNetwork, clusterResult, formDataFile,(err, clusterResult ) => {
                    if (err) { return;}

                    this.__finishPipelinesExecution(clusterResult, jenkinsData, blockchainNetwork);
                });
            });
        });

        console.log('releasing the request');
        callback(undefined,{
            clusterOperation : jenkinsData.clusterOperation,
            status: 'Operation started'
        });
    },

    listJenkinsPipelines: function (jenkinsData, callback) {
        console.log(jenkinsData);
        const jenkinsUser = jenkinsData.user;
        const jenkinsToken = jenkinsData.token;
        const endpointURL =  new URL(jenkinsData.jenkinsEndPoint);
        const jenkinsHostName = endpointURL.hostname;
        const jenkinsPort = endpointURL.port;
        const jenkinsProtocol = endpointURL.protocol.replace(':',"");
        const apiPath = '/api/json?tree=jobs%5Bname%2Curl%5D';
        const apiMethod = 'POST';


        require('./jenkinsRequest').getJenkinsHandler(jenkinsProtocol,jenkinsHostName,jenkinsPort)
            .setCredentials(jenkinsUser,jenkinsToken)
            .callAPI(apiMethod,apiPath,{}, (err, data) => {
            if (err)
            {
                return callback(err, undefined);
            }
            console.log('data received from jenkins:',data);
            const jsonData = JSON.parse(data);

            const pipelines = jsonData.jobs.map(x => {
                return {
                    'name': x.name
                };
            })
            return callback(undefined, pipelines);
        });

    },

    startCluster: function (jsonData, callback) {
        const body = {
            clusterName: jsonData.clusterName,
            configuration: jsonData.configuration,
            mode: jsonData.mode,
        };
        console.log("startCluster", body);
        return callback(undefined, body);
    },
    __downloadArtefactAsRaw: function(jsonData, callback) {
        const jenkinsData = jsonData.jenkinsData;
        const artefactName = jsonData.artefactName;
        const buildNo = jsonData.buildNo;
        const jenkinsServer = this.__getJenkinsServer(jenkinsData);
        if (jenkinsServer.err) {
            return callback({
                errType: "internalError",
                errMessage: jenkinsServer.err,
                jenkinsData: jenkinsData
            });
        }

        jenkinsServer.jenkinsPipeline = jsonData.jenkinsPipeline;
        console.log(jenkinsServer);
        require('../utils/jenkinsPipeline').getArtefactProducedByJob(jenkinsData, jenkinsServer, artefactName, buildNo, (err, data) => {
            if (err) {
                console.log(err);
                return callback(err, undefined);
            }
            return callback(undefined, data);
        })
    },
    __downloadArtefactAsText: function(jsonData, callback) {
        const jenkinsData = jsonData.jenkinsData;
        const artefactName = jsonData.artefactName;
        const buildNo = jsonData.buildNo;
        const jenkinsServer = this.__getJenkinsServer(jenkinsData);
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
    },
    commandCluster: function (jsonData, callback) {
        console.log("commandCluster", jsonData);
        const command = jsonData.command;

        if (command === "jenkinsLog"){
            const jenkinsData = jsonData.jenkinsData;
            const buildNo = jsonData.buildNo;
            const jenkinsServer = this.__getJenkinsServer(jenkinsData);
            if (jenkinsServer.err) {
                return callback({
                    errType: "internalError",
                    errMessage: jenkinsServer.err,
                    jenkinsData: jenkinsData
                });
            }
            jenkinsServer.jenkinsPipeline = jsonData.jenkinsPipeline;
            console.log(jenkinsServer);
            require('../utils/jenkinsPipeline').getJobConsoleLogAsText(jenkinsData, jenkinsServer, buildNo, (err, data)=>{
                if (err)
                {
                    console.log(err);
                    return callback(err, undefined);
                }
                return callback(undefined, data);
            })
        } else
            if (command === "jenkinsArtefact")
            {
                this.__downloadArtefactAsRaw(jsonData, callback);
            }
    }

});
