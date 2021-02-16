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
