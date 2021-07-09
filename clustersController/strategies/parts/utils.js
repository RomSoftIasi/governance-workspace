function utils(){
    this._getJenkinsServer = (jenkinsData) =>{
        const jenkinsUser = jenkinsData.user;
        const jenkinsToken = jenkinsData.token;

        try {
            const endpointURL = new URL(jenkinsData.jenkins);

            const jenkinsHostName = endpointURL.hostname;
            const jenkinsPort = endpointURL.port;
            const jenkinsProtocol = endpointURL.protocol.replace(':', "");

            return {
                jenkinsHostName,
                jenkinsPort,
                jenkinsProtocol,
                jenkinsUser,
                jenkinsToken
            };
        } catch (err) {
            return {
                err: err
            };
        }
    }
}

module.exports = utils;
