function generateValidator(){

    const eth = require('eth-crypto');
    const identity = eth.createIdentity();
    return {
        nodekey:identity.privateKey,
        nodeAddress : identity.address,
        enode : identity.publicKey
    }
}

function generateValidators(no){
    //here we multiply the deployment files, pv,pvc and produce the final deployment files
    //genesis will be updated with extra data in the final step before deployment
    for (let i = 0; i < no; i++) {
        const validator = generateValidator();
    }
}

module.exports = {
    generateValidators
}
