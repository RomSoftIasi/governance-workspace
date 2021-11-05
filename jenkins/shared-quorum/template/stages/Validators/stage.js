const argv = require('minimist')(process.argv.slice(2))
require('./generate-validators').generateValidators(argv.noOfNodes, argv.joinMode);
