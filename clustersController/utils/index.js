const getClusterDomainConfig = (domain) => {
    const config = require("../../privatesky/modules/apihub/config");
    return config.getConfig('endpointsConfig', 'clustersController', 'domainStrategies', domain);
};

module.exports = {getClusterDomainConfig: getClusterDomainConfig}
