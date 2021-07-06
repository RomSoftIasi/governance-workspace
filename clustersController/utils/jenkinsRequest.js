function getJenkinsHandler(protocol,hostname,port ){
    let handler = {};
    let credentials;
    let formDataHeaders;
    let formDataFilePayload;
    let formDataParametersPayload;

    handler.isFileMultipartFormData = function(content,fieldName, fileName){
      formDataHeaders = "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW";

      const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
      let data = '--'+boundary+ '\r\n';
      data += 'Content-Disposition: form-data;';
      data += ' name=\"'+fieldName+'\";'
      data += ' filename=\"'+fileName+'\"\r\n';
      data += "Content-Type: text/plain\r\n\r\n";

      formDataFilePayload = Buffer.concat([
        Buffer.from(data, "utf8"),
        Buffer.from(content, "utf8"),
        Buffer.from("\r\n--" + boundary + "--", "utf8"),
      ]);
      return handler;
    };

    function setMultipartFormDataHeaders (requestOptions){
      if (typeof(formDataHeaders) !== 'undefined'){
          requestOptions.headers['content-type'] = formDataHeaders;
      }
      return requestOptions;
    }

    handler.setPipelineParametersFormData = function (pipelineParameters) {
        formDataHeaders = "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW";
        const boundary = "------WebKitFormBoundary7MA4YWxkTrZu0gW";
        const contentDisposition = "Content-Disposition: form-data; name=\"";

        let data = boundary;
        Object.keys(pipelineParameters).forEach(key => {
            data += `\r\n${contentDisposition}${key}\"\r\n\r\n${pipelineParameters[key]}\r\n${boundary}`;
        });

        data += "--";
        formDataParametersPayload = Buffer.from(data, "utf8");

        return handler;
    }

    handler.setCredentials = function(jenkinsUser, jenkinsToken){
        credentials ={jenkinsUser, jenkinsToken};
        return handler;
    };

    function setCredentials(requestOptions){
        if (typeof(credentials) !== 'undefined'){
            requestOptions.headers.authorization = `Basic ${Buffer.from(credentials.jenkinsUser+':'+credentials.jenkinsToken).toString('base64')}`;
        }

        return requestOptions;
    }

    function writeBodyOnRequest(req, body) {
        if (typeof formDataFilePayload !== "undefined") {
            req.write(formDataFilePayload);
            return;
        }

        if (typeof formDataParametersPayload !== "undefined") {
            req.write(formDataParametersPayload);
            return;
        }

        req.write(body);
    }

    function makeHttpRequest(method, path,body, options, callback) {
        let httpApi = require(protocol);
        const defaultOptions = {
            hostname,
            port,
            path,
            method,
            headers : {
                'cache-control': 'no-cache'
            }
        };
        if (typeof (options) === 'function')
        {
            callback = options;
            options = defaultOptions;
        }else {
            Object.assign(options, defaultOptions);
        }

        setCredentials(options);
        setMultipartFormDataHeaders(options);
        console.log(options);

        const req = httpApi.request(options, response => {
            // console.log('waiting response',response);
            // console.log('waiting response queue position',response.headers.location);
            // const qposition = response.headers.location;
            if (response.statusCode < 200 || response.statusCode >= 300) {
                return callback({
                    statusCode: response.statusCode,
                    err: new Error("Failed to execute command. StatusCode " + response.statusCode)
                }, null);
            }

            if (options.preventResponseHandling){
                return callback(undefined, response);
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

        //req.write(body);
        writeBodyOnRequest(req,body);
        req.end();
    }
    handler.callAPI = function(apiMethod,apiPath,body, callback){

        const bodyData = JSON.stringify(body);

        try {
            makeHttpRequest( apiMethod, apiPath, bodyData, (err, result) => {
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

    handler.callRawAPI = function(apiMethod,apiPath,body, callback){

        const bodyData = JSON.stringify(body);

        try {
            makeHttpRequest( apiMethod, apiPath, bodyData, {preventResponseHandling: true}, (err, result) => {
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
    return handler;
}

module.exports = {
    getJenkinsHandler
}
