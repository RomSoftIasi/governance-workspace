function makeRequest(protocol, hostname, port, method, path, body, headers, callback) {
    // FOR DEVELOPMENT ONLY
    return callback(undefined, {
        protocol: protocol,
        hostname: hostname,
        port: port,
        method: method,
        path: path,
        body: body,
        headers: headers
    });
    // END DEVELOPMENT ONLY
    const http = require("http");
    const https = require("https");

    if (typeof headers === "function") {
        callback = headers;
        headers = undefined;
    }

    if (typeof body === "function") {
        callback = body;
        headers = undefined;
        body = undefined;
    }
    protocol = require(protocol);
    const options = {
        hostname: hostname,
        port: port,
        path,
        method,
        headers
    };
    const req = protocol.request(options, response => {

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
};

$$.flow.describe('ControlContainer', {
    init: function (domainConfig, clusterNumber, jsonData) {
        this.commandData = {};
        this.commandData.clusterNumber = clusterNumber;
        this.commandData.clusterIdentifier = jsonData.clusterIdentifier;
        this.commandData.configuration = jsonData.configuration;
        this.commandData.mode = jsonData.mode;


        const endpointURL = new URL(domainConfig.option.endpoint);
        this.commandData.apiEndpoint = endpointURL.hostname;
        this.commandData.apiPort = endpointURL.port;
        this.commandData.protocol = endpointURL.protocol.replace(':', "");
    },
    startCluster: function (callback) {
        const body = {
            clusterNumber: this.commandData.clusterNumber,
            clusterIdentifier: this.commandData.clusterIdentifier,
            configuration: this.commandData.configuration,
            mode: this.commandData.mode,
        };
        const bodyData = JSON.stringify(body);
        const apiPath = "/controlContainer/" + this.commandData.clusterNumber + "/start";
        const apiMethod = 'POST';
        const apiHeaders = {
            'Content-Type': 'application/json',
            'Content-Length': bodyData.length
        };
        const apiEndpoint = this.commandData.apiEndpoint;
        const apiPort = this.commandData.apiPort;
        const protocol = this.commandData.protocol;
        try {
            makeRequest(protocol, apiEndpoint, apiPort, apiMethod, apiPath, bodyData, apiHeaders, (err, result) => {
                if (err) {
                    console.log(err);
                    callback(err, null);
                    return;
                }
                callback(null, result);
            })
        } catch (err) {
            callback(err, null);
        }
    },

    commandCluster: function (command, callback) {
        const body = {
            clusterNumber: this.commandData.clusterNumber,
            clusterIdentifier: this.commandData.clusterIdentifier,
            configuration: this.commandData.configuration,
            mode: this.commandData.mode,
        };
        const bodyData = JSON.stringify(body);
        const apiPath = "/controlContainer/" + this.commandData.clusterNumber + "/command/" + command;
        const apiMethod = 'PUT';
        const apiHeaders = {
            'Content-Type': 'application/json',
            'Content-Length': bodyData.length
        };
        const apiEndpoint = this.commandData.apiEndpoint;
        const apiPort = this.commandData.apiPort;
        const protocol = this.commandData.protocol;
        try {
            makeRequest(protocol, apiEndpoint, apiPort, apiMethod, apiPath, bodyData, apiHeaders, (err, result) => {
                if (err) {
                    console.log(err);
                    callback(err, null);
                    return;
                }
                callback(null, result);
            })
        } catch (err) {
            console.log("Deployment smart contract Error: ", err);
            callback(err, null);
        }
    },
});