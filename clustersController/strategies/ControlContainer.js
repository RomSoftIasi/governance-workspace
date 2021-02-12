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
        this._executeDeployment({
            "clusterName":"pl-cluster1",
            "urlConfigRepo":"https://github.com/PharmaLedger-IMI/opendsu-cluster-template.git"
        }, (err, result) => {
            if (err)
            {
                return callback(err);
            }
            return callback(undefined, result);
        })
        /*return callback(undefined, {
            clusterName: jsonData.clusterName,
            urlConfigRepo: jsonData.urlConfigRepo,
            configMap: jsonData.configMap,
        });
         */
    },
    _executeDeployment : function (jsonData, callback)
    {
        const clusterTemplateRootFolder = require('../clusters.json').clusterTemplate.location;
        const path = require('path');
        const clusterMarker = "-".concat(jsonData.clusterName);
        const repolink = jsonData.urlConfigRepo;
        const parts = repolink.split('/');

        const repoDir = parts[parts.length-1].replace('.git','');
        console.log(repoDir);
        const shellcmd = path.resolve(path.join(process.env.PSK_ROOT_INSTALATION_FOLDER, require('../clusters.json').clusterTemplate.shell));
        //const shellcmd = path.join(path.resolve(),require('../clusters.json').clusterTemplate.shell) ;
        const exec = require('child_process').exec;
        const cmd = shellcmd.concat(" ",clusterMarker," ",jsonData.clusterName," ",clusterTemplateRootFolder," ",repolink," ",repoDir);
        //shellcmd+' -pl-cluster1 pl-cluster1 '+clusterTemplateRootFolder,
        exec(cmd, (err, stdout, stderr) => {
            console.log('shell script finished');
            console.log(stdout);
            if (err)
            {
                console.log('shell execution failed.', err, stderr);
                return callback(err);
            }
            console.log('Cluster deployed')
            return callback(undefined, "Cluster deployed");
        })
    }
});
