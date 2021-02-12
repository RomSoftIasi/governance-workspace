const fileService = require("../utils/fileService");

$$.flow.describe('ControlContainer', {
    init: function (domainConfig) {
        const endpointURL = new URL(domainConfig.option.endpoint);
        this.commandData = {};
        this.commandData.apiEndpoint = endpointURL.hostname;
        this.commandData.apiPort = endpointURL.port;
        this.commandData.protocol = endpointURL.protocol.replace(':', "");
    },
    listClusters: function (callback) {
        fileService.readClusters(callback);
    },
    startCluster: function (clusterNumber, jsonData, callback) {
        const body = {
            clusterNumber: clusterNumber,
            clusterIdentifier: jsonData.clusterIdentifier,
            configuration: jsonData.configuration,
            mode: jsonData.mode,
        };
        const bodyData = JSON.stringify(body);
        const apiPath = "/controlContainer/" + clusterNumber + "/start";
        const apiMethod = 'POST';
        const apiHeaders = {
            'Content-Type': 'application/json',
            'Content-Length': bodyData.length
        };
        const apiEndpoint = this.commandData.apiEndpoint;
        const apiPort = this.commandData.apiPort;
        const protocol = this.commandData.protocol;

        return callback(undefined, {
            protocol: protocol,
            hostname: apiEndpoint,
            port: apiPort,
            method: apiMethod,
            path: apiPath,
            body: bodyData,
            headers: apiHeaders
        });
    },
    commandCluster: function (clusterNumber, jsonData, command, callback) {
        const body = {
            clusterNumber: clusterNumber,
            clusterIdentifier: jsonData.clusterIdentifier,
            configuration: jsonData.configuration,
            mode: jsonData.mode,
        };
        const bodyData = JSON.stringify(body);
        const apiPath = "/controlContainer/" + clusterNumber + "/command/" + command;
        const apiMethod = 'PUT';
        const apiHeaders = {
            'Content-Type': 'application/json',
            'Content-Length': bodyData.length
        };
        const apiEndpoint = this.commandData.apiEndpoint;
        const apiPort = this.commandData.apiPort;
        const protocol = this.commandData.protocol;
        return callback(undefined, {
            protocol: protocol,
            hostname: apiEndpoint,
            port: apiPort,
            method: apiMethod,
            path: apiPath,
            body: bodyData,
            headers: apiHeaders
        });
    },
    deployCluster: function (jsonData, callback) {
        console.log('deployCluster', jsonData);
        return callback(undefined, {
            clusterName: jsonData.clusterName,
            urlConfigRepo: jsonData.urlConfigRepo,
            configMap: jsonData.configMap,
        });
    },
});