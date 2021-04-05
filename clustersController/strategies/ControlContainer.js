

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

    executeClusterOperation: function(jenkinsData, callback){
        console.log('executeClusterOperation started for : ',jenkinsData.clusterOperation);
        const pipelines = [];
        const blockchainNetwork = jenkinsData.blockchainNetwork;
        if (jenkinsData.clusterOperation === 'initiateNetwork')
        {
            //pipelines.push('gov-3min');
            //pipelines.push('gov-3min');
            //pipelines.push('gov-3min');
            //pipelines.push('gov-docker');
            pipelines.push('gov-tests');
        }
        console.log('Planned pipelines',pipelines);
        const result = {
            clusterOperation : 'initiateNetwork',
            blockchainNetwork: jenkinsData.blockchainNetwork,
            pipelines:[]
        }
        const jenkinsServer = this.__getJenkinsServer(jenkinsData);
        const jenkinsPipelineToken = jenkinsData.pipelineToken;

      let execPipeline = (jenkinsServer,jenkinsPipelineToken, currentPipeline) => require('../utils/jenkinsPipeline')
          .startPipeline(jenkinsServer,jenkinsPipelineToken,currentPipeline, (err, data) => {
          if (err)
          {
              result.pipelines.push({
                  name: currentPipeline,
                  result: 'EXCEPTION',
                  log: err
              });
              if (!result.log)
              {
                  result.log='';
              }
              result.log = result.log + err + '\n';
              result.pipelines = JSON.stringify(result.pipelines);
              return this.jenkinsClusterStatus.setStatus(blockchainNetwork,result );
          }
          result.pipelines.push({
              name: currentPipeline,
              result: data.result,
              buildNo: data.buildNo,
              artifacts: data.artifacts
          });
          if (pipelines.length === 0)
          {
              result.pipelines = JSON.stringify(result.pipelines);
              console.log(result);
              console.log('Cluster operation finished : ', jenkinsData.clusterOperation);
              return this.jenkinsClusterStatus.setStatus(blockchainNetwork,result );
          }
          console.log('Continue with next pipeline. Pipelines remaining : ',pipelines);
          execPipeline(jenkinsServer,jenkinsPipelineToken, pipelines.shift());
      });

        execPipeline(jenkinsServer,jenkinsPipelineToken,pipelines.shift());
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
                const jenkinsData = jsonData.jenkinsData;
                const artefactName = jsonData.artefactName;
                const buildNo = jsonData.buildNo;
                const jenkinsServer = this.__getJenkinsServer(jenkinsData);
                jenkinsServer.jenkinsPipeline = jsonData.jenkinsPipeline;
                console.log(jenkinsServer);
                require('../utils/jenkinsPipeline').getArtefactProducedByJob(jenkinsData, jenkinsServer, artefactName,buildNo, (err, data)=>{
                    if (err)
                    {
                        console.log(err);
                        return callback(err, undefined);
                    }
                    return callback(undefined, data);
                })
            }
    }

});
