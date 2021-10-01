const argv = require('minimist')(process.argv.slice(2))
require('./gennerate-validators').generateValidators(argv.noOfNodes, argv.subdomain);
