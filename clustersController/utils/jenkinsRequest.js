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

   // console.log(options);

    const req = protocol.request(options, response => {
       // console.log('waiting response',response);
       // console.log('waiting response queue position',response.headers.location);
        //const qposition = response.headers.location;
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
                return callback(undefined, {
                    body: bodyContent,
                    headers: response.headers});
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

 function invokeJenkinsAPI(jenkinsHostName,jenkinsPort, jenkinsProtocol, apiMethod,apiPath,body,jenkinsUser, jenkinsToken, callback){

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
}


module.exports = {
    invokeJenkinsAPI : invokeJenkinsAPI
}
