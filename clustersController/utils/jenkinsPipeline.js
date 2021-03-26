function getJobExecutionStatus(jenkinsData, jenkinsQueue, jenkinsServer, callback){
    // check the queue
    //GET : http://127.0.0.1:8090/queue/item/106/api/json
    // get from json body :
    //"executable": {
    //         "_class": "org.jenkinsci.plugins.workflow.job.WorkflowRun",
    //         "number": 11,
    //         "url": "http://localhost:8090/job/initiateNetwork/11/"
    //     }
    // the build number
    // do a loop to try to get the build No. If the build didn't started, the number will not exist
    //check the build status once the build was started and we got a build no
    // GET http://localhost:8090/job/initiateNetwork/11/api/json
    // json body :
    // "artifacts": [],
    //     "building": true,
    // loop until you get :
    //     "artifacts": [],
    //     "building": false,
    //      "result": "SUCCESS",
    // build is now finished and the result of the build is returned


    // loop every 10 sec to see if job is started or still in queue mode
    //apiPath =  http://127.0.0.1:8090/queue/item/80/
    loopUntilBuildStarts(jenkinsData, jenkinsQueue, jenkinsServer, (err, data) => {
        if (err) {return callback(err)}
        //we got build no
        //console.log('build no : ', data);
        const buildNo = data;
        loopUntilBuildFinishes(jenkinsData, jenkinsServer, buildNo, (err, buildResult) => {
            if (err) {return callback(err, undefined)}
            //console.log(buildResult);
            getJobConsoleLogStatus(jenkinsData, jenkinsServer, buildNo, (err, data) => {
                if (err) {return callback(err, undefined)}
                buildResult.log = data;
                return callback(undefined, buildResult);
            })

        })
    })


}

function loopUntilBuildStarts(jenkinsData, jenkinsQueue, jenkinsServer, callback){

    checkIfJobStarted(jenkinsData, jenkinsQueue, jenkinsServer, (err, data) => {
        if (err) {return callback(err,undefined)}
        if (data !== -1)
        {
            console.log('Pipeline is building - '+jenkinsServer.jenkinsPipeline+'. Build number : ', data);
            return callback(undefined, data);
        }
        setTimeout( () =>{
            console.log('Pipeline is in queue. Waiting for build to start : ',jenkinsServer.jenkinsPipeline);
            loopUntilBuildStarts(jenkinsData, jenkinsQueue, jenkinsServer, callback)
        }, 10*1000 );
    })

}

function checkIfJobStarted(jenkinsData, jenkinsQueue, jenkinsServer, callback){
    const queueApiPath = jenkinsQueue.substring(jenkinsQueue.indexOf('/queue'))+'api/json'
    const apiMethod = 'GET';
    require('./jenkinsRequest').invokeJenkinsAPI(jenkinsServer.jenkinsHostName,
        jenkinsServer.jenkinsPort, jenkinsServer.jenkinsProtocol, apiMethod,queueApiPath, {}, jenkinsServer.jenkinsUser, jenkinsServer.jenkinsToken, (err, data) => {
            if (err)
            {
                return callback(err, undefined);
            }
            const body = JSON.parse(data.body);
            if (body.executable && body.executable.number)
            {
                // job is started
                return callback(undefined, body.executable.number);
            }
            else {
                return callback(undefined, -1);

            }
        });
}


function loopUntilBuildFinishes(jenkinsData, jenkinsServer, buildNo, callback){

    checkIfJobFinished(jenkinsData, jenkinsServer, buildNo,(err, data) => {
        if (err) {return callback(err,undefined)}
        if (data)
        {
            console.log('Pipeline execution finished :', data);
            return callback(undefined, data);
        }
        setTimeout( () =>{
            console.log('Checking pipeline execution status : ',jenkinsServer.jenkinsPipeline);
            loopUntilBuildFinishes(jenkinsData, jenkinsServer, buildNo, callback)
        }, 10*1000 );
    })

}


function checkIfJobFinished(jenkinsData, jenkinsServer, buildNo, callback){
    // GET http://localhost:8090/job/initiateNetwork/11/api/json
    // json body :
    // "artifacts": [],
    //     "building": true,
    // loop until you get :
    //     "artifacts": [],
    //     "building": false,
    //      "result": "SUCCESS",
    // build is now finished and the result of the build is returned
    const buildApiPath = '/job/'+jenkinsServer.jenkinsPipeline+'/'+buildNo+'/api/json'
    const apiMethod = 'GET';
    require('./jenkinsRequest').invokeJenkinsAPI(jenkinsServer.jenkinsHostName,
        jenkinsServer.jenkinsPort, jenkinsServer.jenkinsProtocol, apiMethod,buildApiPath, {}, jenkinsServer.jenkinsUser, jenkinsServer.jenkinsToken, (err, data) => {
            if (err)
            {
                return callback(err, undefined);
            }
            const body = JSON.parse(data.body);
            if (body.result === 'SUCCESS' || body.result === 'FAILURE' || body.result === 'ABORTED' || body.result === 'UNSTABLE')
            {
                let artifactFileName = '';
                if (body.artifacts.length > 0){
                    artifactFileName = body.artifacts[0].fileName;
                }
                return callback(undefined, {
                    buildNo,
                    result: body.result,
                    jenkinsPipeline: jenkinsServer.jenkinsPipeline,
                    artifactFileName : artifactFileName
                })
            } else {
                //build is in progress
                callback(undefined)
            }

        });
}


function getJobConsoleLogStatus(jenkinsData, jenkinsServer, buildNo, callback){
    //http://localhost:8090/job/initiateNetwork/14/consoleText
    const buildApiPath = '/job/'+jenkinsServer.jenkinsPipeline+'/'+buildNo+'/consoleText'
    const apiMethod = 'GET';
    require('./jenkinsRequest').invokeJenkinsAPI(jenkinsServer.jenkinsHostName,
        jenkinsServer.jenkinsPort, jenkinsServer.jenkinsProtocol, apiMethod,buildApiPath, {}, jenkinsServer.jenkinsUser, jenkinsServer.jenkinsToken, (err, data) => {
            if (err) {
                return callback(err, undefined);
            }
            return callback(undefined, data.body)
        });
}

module.exports = {
    getJobExecutionStatus : getJobExecutionStatus
}
