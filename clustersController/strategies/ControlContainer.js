

$$.flow.describe('ControlContainer', {
    init: function (domainConfig) {

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


    executeClusterOperation: function(jenkinsData, callback){
        console.log('executeClusterOperation started for : ',jenkinsData.clusterOperation);
        const pipelines = [];
        if (jenkinsData.clusterOperation === 'initiateNetwork')
        {
            pipelines.push('gov-tests');
            pipelines.push('gov-docker');
        }
        const result = {
            clusterOperation : 'initiateNetwork',
            blockchainNetwork: jenkinsData.name,
            pipelines:[]
        }
        const jenkinsServer = this.__getJenkinsServer(jenkinsData);
        const jenkinsPipelineToken = jenkinsData.pipelineToken;

      let execPipeline = (jenkinsServer,jenkinsPipelineToken, currentPipeline) => require('../utils/jenkinsPipeline').startPipeline(jenkinsServer,jenkinsPipelineToken,currentPipeline, (err, data) => {
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
              return callback(result, undefined);
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
              return callback(undefined, result);
          }
          console.log('Continue with next pipeline. Pipelines remaining : ',pipelines);
          execPipeline(jenkinsServer,jenkinsPipelineToken, pipelines.shift());
      });

        execPipeline(jenkinsServer,jenkinsPipelineToken,pipelines.shift());
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
