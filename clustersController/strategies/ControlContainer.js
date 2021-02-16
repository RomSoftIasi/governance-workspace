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
        const testjson = {
            "clusterName":"pl-cluster1",
            "urlConfigRepo":"https://github.com/PharmaLedger-IMI/opendsu-cluster-template.git"
        };
        this._executeDeployment(jsonData, (err, result) => {
            if (err)
            {
                return callback(err);
            }
            return callback(undefined, result);
        })

    },
    _executeDeployment : function (jsonData, callback)
    {
        const path = require('path');
        const clusterTemplateRootFolder = path.resolve(require('../clusters.json').clusterTemplate.installLocation);
        const clusterMarker = "-".concat(jsonData.clusterName);
        const repolink = jsonData.urlConfigRepo;
        const parts = repolink.split('/');

        const repoDir = parts[parts.length-1].replace('.git','');
        const shellcmd = path.resolve(path.join(process.env.PSK_ROOT_INSTALATION_FOLDER, require('../clusters.json').clusterTemplate.shell));
        const appRoot = path.resolve(path.join(process.env.PSK_ROOT_INSTALATION_FOLDER,"../"));
        //console.log(appRoot);

        const exec = require('child_process').exec;
        const cmd = shellcmd.concat(" ",clusterMarker," ",jsonData.clusterName," ",clusterTemplateRootFolder," ",repolink," ",repoDir," ",appRoot);


        exec(cmd, (err, stdout, stderr) => {
            //console.log('shell script finished');
            //console.log(stdout);
            if (err)
            {
                //script failing
                console.log('shell execution failed.', err, stderr);
                return callback(err);
            }
            try {
            //check output of the cluster template deployer
            let localclusterlogs = path.join(appRoot,repoDir+clusterMarker,"logs.txt");
            //console.log (localclusterlogs);
            localclusterlogs = path.resolve(localclusterlogs);
            //console.log (localclusterlogs);
            const logcontent = require('fs').readFileSync(localclusterlogs).toString('utf8');
            //console.log(logcontent);
            const indexOfStatus = logcontent.indexOf('200OK');


            if (indexOfStatus > 1)
            {
                console.log('Cluster deployed')
                return callback(undefined, "Cluster deployed");
            }
            console.log('Cluster fail to be deployed.')
            return callback(new Error("Cluster fail to be deployed."));
            }
            catch (e)
            {
                return callback(e);
            }
        })
    }
});
