

$$.flow.describe('ControlContainer', {
    init: function (domainConfig, jenkinsClusterStatus) {
        //console.log('Init flow - ContainerControl for', domainConfig);
        this.jenkinsClusterStatus = jenkinsClusterStatus;
    },
    __getJenkinsServer(jenkinsData){
        const jenkinsUser = jenkinsData.user;
        const jenkinsToken = jenkinsData.token;


        const endpointURL =  new URL(jenkinsData.jenkins);

        const jenkinsHostName = endpointURL.hostname;
        const jenkinsPort = endpointURL.port;
        const jenkinsProtocol = endpointURL.protocol.replace(':',"");

        return {
            jenkinsHostName,
            jenkinsPort,
            jenkinsProtocol,
            jenkinsUser,
            jenkinsToken
        }
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
    __execPipelineErrorSignal: function(result,currentPipeline,blockchainNetwork){
        result.pipelines.push({
            name: currentPipeline,
            result: 'EXCEPTION',
            log: err.toString()
        });
        if (!result.log)
        {
            result.log='';
        }
        result.log = result.log + err + '\n';
        result.pipelines = JSON.stringify(result.pipelines);
        result.pipelinesStatus = 'ERROR';
        this.jenkinsClusterStatus.setStatus(blockchainNetwork,result );
    },
    __executePipeline: function(jenkinsServer,jenkinsPipelineToken, currentPipeline,blockchainNetwork, result, callback){
        require('../utils/jenkinsPipeline')
            .startPipeline(jenkinsServer,jenkinsPipelineToken,currentPipeline, (err, data) => {
                if (err)
                {
                    this.__execPipelineErrorSignal(result,currentPipeline,blockchainNetwork);
                    return callback(err, undefined);
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
    __finishPipelinesExecution: function (result, jenkinsData, blockchainNetwork){
        result.pipelines = JSON.stringify(result.pipelines);
        result.pipelinesStatus = 'SUCCESS';
        console.log(result);
        console.log('Cluster operation finished : ', jenkinsData.clusterOperation);
        this.jenkinsClusterStatus.setStatus(blockchainNetwork,result );
    },
    executeClusterOperation: function(jenkinsData, callback){
        console.log('executeClusterOperation started for : ',jenkinsData.clusterOperation);
        const pipelines = [];
        const blockchainNetwork = jenkinsData.blockchainNetwork;
        if (jenkinsData.clusterOperation === 'initiateNetwork')
        {
            pipelines.push('deploy-Quorum-fresh-mode');
        }
        console.log('Planned pipelines',pipelines);
        const clusterOperationResult = {
            clusterOperation : 'initiateNetwork',
            blockchainNetwork: jenkinsData.blockchainNetwork,
            pipelines:[]
        }
        const jenkinsServer = this.__getJenkinsServer(jenkinsData);
        const jenkinsPipelineToken = jenkinsData.pipelineToken;
        const currentPipeline = pipelines.shift();
        this.__executePipeline(jenkinsServer,jenkinsPipelineToken, currentPipeline,blockchainNetwork, clusterOperationResult, (err, clusterResult, executionResultData) =>{
            if (err) { return;}
            const downloadJsonData = {
                jenkinsData: jenkinsData,
                artefactName: executionResultData.artifacts[0].relativePath,
                buildNo: executionResultData.buildNo,
                jenkinsPipeline: currentPipeline
            };
            this.__downloadArtefactAsText(downloadJsonData, (err, data) => {
                if (err){
                    return this.__execPipelineErrorSignal(clusterResult,currentPipeline,blockchainNetwork);
                }
                clusterResult.EthAdapterJoiningJSON = data;

                this.__finishPipelinesExecution(clusterResult, jenkinsData, blockchainNetwork);
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
