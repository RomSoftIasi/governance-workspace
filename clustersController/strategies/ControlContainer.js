

$$.flow.describe('ControlContainer', {
    init: function (domainConfig) {

    },
    startPipeline: function(jenkinsData,jenkinsPipeline, callback){
        console.log('startPipeline : ',jenkinsData);
        const jenkinsUser = jenkinsData.user;
        const jenkinsToken = jenkinsData.token;
        const jenkinsPipelineToken = jenkinsData.pipelineToken;

        const endpointURL =  new URL(jenkinsData.jenkins);

        const jenkinsHostName = endpointURL.hostname;
        const jenkinsPort = endpointURL.port;
        const jenkinsProtocol = endpointURL.protocol.replace(':',"");
        let apiPath
        if (jenkinsPipelineToken)
        {
            apiPath = '/job/'+jenkinsPipeline+'/buildWithParameters?token='+jenkinsPipelineToken
        } else{
            apiPath = '/job/'+jenkinsPipeline+'/build?delay=0'
        }
        const apiMethod = 'POST';
        const jenkinsServer = {
            jenkinsHostName,
            jenkinsPort,
            jenkinsProtocol,
            jenkinsUser,
            jenkinsToken,
            jenkinsPipeline
        }

        require('../utils/jenkinsRequest').invokeJenkinsAPI(jenkinsHostName,jenkinsPort, jenkinsProtocol, apiMethod,apiPath, {}, jenkinsUser, jenkinsToken, (err, data) => {
            if (err)
            {
                return callback(err, undefined);
            }
            //console.log('data received from jenkins:',data);
            //console.log('jenkins job queue position :',data.headers.location);
            require('../utils/jenkinsPipeline').getJobExecutionStatus(jenkinsData,data.headers.location,jenkinsServer, (err, data)=>{
                if (err)
                {
                    console.log(err);
                    return callback(err, undefined);
                }
                //console.log(data)
                return callback(undefined, data);
            })

        });
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

      let execPipeline = (jenkinsData, currentPipeline) => this.startPipeline(jenkinsData,currentPipeline, (err, data) => {
          if (err)
          {
              result.pipelines.push({
                  name: currentPipeline,
                  result: 'EXCEPTION',
                  log: err
              });
              return callback(result, undefined);
          }
          result.pipelines.push({
              name: currentPipeline,
              result: data.result,
              buildNo: data.buildNo,
              log: data.log,
              artifactFileName: data.artifactFileName
          });
          if (pipelines.length === 0)
          {
              //console.log(result);
              console.log('Cluster operation finished : ', jenkinsData.clusterOperation);
              return callback(undefined, result);
          }
          console.log('Continue with next pipeline. Pipelines remaining : ',pipelines);
          execPipeline(jenkinsData, pipelines.shift());
      });

        execPipeline(jenkinsData,pipelines.shift());
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


        require('../utils/jenkinsRequest').invokeJenkinsAPI(jenkinsHostName,jenkinsPort, jenkinsProtocol, apiMethod,apiPath, {}, jenkinsUser, jenkinsToken, (err, data) => {
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
        const body = {
            clusterName: jsonData.clusterName,
            command: jsonData.command
        };
        console.log("commandCluster", body);
        return callback(undefined, body);
    }

});
