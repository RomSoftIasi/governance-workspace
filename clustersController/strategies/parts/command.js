function commands(){
    this._downloadPipelineLog = (jsonData, callback) =>{
        const jenkinsData = jsonData.jenkinsData;
        const buildNo = jsonData.buildNo;
        const jenkinsServer = this._getJenkinsServer(jenkinsData);
        if (jenkinsServer.err) {
            return callback({
                errType: "internalError",
                errMessage: jenkinsServer.err,
                jenkinsData: jenkinsData
            });
        }
        jenkinsServer.jenkinsPipeline = jsonData.jenkinsPipeline;
        console.log(jenkinsServer);
        require('../../utils/jenkinsPipeline').getJobConsoleLogAsText(jenkinsData, jenkinsServer, buildNo, (err, data)=>{
            if (err)
            {
                console.log(err);
                return callback(err, undefined);
            }
            return callback(undefined, data);
        })
    }

    this._downloadArtefactAsRaw = (jsonData, callback) => {
        const jenkinsData = jsonData.jenkinsData;
        const artefactName = jsonData.artefactName;
        const buildNo = jsonData.buildNo;
        const jenkinsServer = this._getJenkinsServer(jenkinsData);
        if (jenkinsServer.err) {
            return callback({
                errType: "internalError",
                errMessage: jenkinsServer.err,
                jenkinsData: jenkinsData
            });
        }

        jenkinsServer.jenkinsPipeline = jsonData.jenkinsPipeline;
        console.log(jenkinsServer);
        require('../../utils/jenkinsPipeline').getArtefactProducedByJob(jenkinsData, jenkinsServer, artefactName, buildNo, (err, data) => {
            if (err) {
                console.log(err);
                return callback(err, undefined);
            }
            return callback(undefined, data);
        })
    }
}


module.exports = commands;
