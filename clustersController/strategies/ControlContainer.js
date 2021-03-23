function makeRequest(protocol, hostname, port, method, path, body, headers,authJson, callback) {

    const http = require("http");
    const https = require("https");

    protocol = require(protocol);
    const options = {
        hostname: hostname,
        port: port,

        path,
        method,
        headers
    };
    // auth : authJson,
    //         json: true,
    console.log(options);

    const req = protocol.request(options, response => {
        console.log('waiting response');
        if (response.statusCode < 200 || response.statusCode >= 300) {
            return callback({
                statusCode: response.statusCode,
                err: new Error("Failed to execute command. StatusCode " + response.statusCode)
            }, null);
        }
        let data = [];
        response.on('data', chunk => {
            data.push(chunk);
        });

        response.on('end', () => {
            try {
                const bodyContent = $$.Buffer.concat(data).toString();
                return callback(undefined, bodyContent);
            } catch (error) {
                return callback({
                    statusCode: 500,
                    err: error
                }, null);
            }
        });
    });

    req.on('error', err => {
        console.log(err);
        return callback({
            statusCode: 500,
            err: err
        });
    });

    req.write(body);
    req.end();
}

$$.flow.describe('ControlContainer', {
    init: function (domainConfig) {

    },
    startPipeline: function(jenkinsData, callback){
        console.log('startPipeline : ',jenkinsData);
        const jenkinsUser = jenkinsData.user;
        const jenkinsToken = jenkinsData.token;
        const jenkinsPipelineToken = jenkinsData.pipelineToken;
        const jenkinsPipeline = jenkinsData.pipeline;
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


        this.__InvokeJenkinsAPI(jenkinsHostName,jenkinsPort, jenkinsProtocol, apiMethod,apiPath, {}, jenkinsUser, jenkinsToken, (err, data) => {
            if (err)
            {
                return callback(err, undefined);
            }
            console.log('data received from jenkins:',data);

            return callback(undefined, data);
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


        this.__InvokeJenkinsAPI(jenkinsHostName,jenkinsPort, jenkinsProtocol, apiMethod,apiPath, {}, jenkinsUser, jenkinsToken, (err, data) => {
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
    __InvokeJenkinsAPI : function(jenkinsHostName,jenkinsPort, jenkinsProtocol, apiMethod,apiPath,body,jenkinsUser, jenkinsToken, callback){

        const bodyData = JSON.stringify(body);
        const authBase64 = Buffer.from(jenkinsUser+':'+jenkinsToken).toString('base64');
        const auth = 'Basic '+authBase64;
        const apiHeaders = {
            'authorization': auth,
            'cache-control': 'no-cache'
        };

        try {
            makeRequest(jenkinsProtocol, jenkinsHostName, jenkinsPort, apiMethod, apiPath, bodyData, apiHeaders,auth, (err, result) => {
                if (err) {
                    console.log(err);
                    callback(err, null);
                    return;
                }
                callback (null, result);
            })
        }catch (err) {
            console.log("Jenkins call Error: ",err);
            callback(err, null);
        }
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
