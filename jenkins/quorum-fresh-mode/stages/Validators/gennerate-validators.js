function generateValidator(){
    const crypto = require('crypto');
    const entropy = crypto.randomBytes(128);
    const eth = require('eth-crypto');
    const identity = eth.createIdentity(entropy);
    return {
        nodekey:identity.privateKey.slice(2),
        nodeAddress : identity.address,
        enode : identity.publicKey
    }
}

function generateSharedConfig(validators) {

    const fs =  require('fs');
    let nodeList= "";
    let validatorsAdressList = "";
    //item : "enode://.enode.@quorum-%node_NO%:30303?discport=0"
    for (const validatorKey of validators.keys()) {

        const validator = validators.get(validatorKey);
        const item = "            \"enode://"+validator.enode+"@quorum-"+validator.NodeNo+":30303?discport=0\",";
        nodeList += item +"\n"
        validatorsAdressList += "            \""+validator.nodeAddress+"\",\n";
    }

    nodeList = nodeList.slice(0,nodeList.length-2);
    validatorsAdressList = validatorsAdressList.slice(0,validatorsAdressList.length-1);
    let cfg = fs.readFileSync('./k8s/templates/02-quorum-shared-config.yaml.template').toString('utf8');
    cfg = replaceAll(cfg,"%ENODES_LIST%", nodeList);
    cfg = replaceAll(cfg,"%VALIDATORS_LIST%", validatorsAdressList);

    fs.writeFileSync('./k8s/02-quorum-shared-config.yaml',cfg);
    fs.writeFileSync('./stages/Validators/validators.txt', validatorsAdressList);


}


function  generateServices(validators){
    const fs =  require('fs');
    let cfg = fs.readFileSync('./k8s/templates/-quorum-services.yaml.template').toString('utf8');
    for (const validatorKey of validators.keys()) {

        const validator = validators.get(validatorKey);
        let svc = replaceAll(cfg,"%NODE_NO%", validator.NodeNo);

        fs.writeFileSync('./k8s/03-'+validator.NodeIndex.toString().padStart(2,"0")+'-quorum-services.yaml',svc);
    }
}

function replaceAll(src, str, withStr){
    return src.split(str).join(withStr);
}
function genNode_No(subdomain){
    let sub_domain = subdomain;
    let handler = {};
    handler.getForNo = function (no) {
        const crypto = require('crypto');
        const nodeEntropy = crypto.randomBytes(4).toString('hex');
        return "node-"+sub_domain+"-"+no+"-"+nodeEntropy;
    }
    return handler;
}


function generateKeyConfig(validators) {
    const fs =  require('fs');
    let cfg = fs.readFileSync('./k8s/templates/quorum-keyconfigs.yaml.template').toString('utf8');
    for (const validatorKey of validators.keys()) {

        const validator = validators.get(validatorKey);
        let svc = replaceAll(cfg,"%NODE_NO%", validator.NodeNo);
        svc = svc.replace("%NODE_KEY%", validator.nodekey);
        svc = svc.replace("%NODE_KEY_ADDRESS%", validator.nodeAddress);
        svc = svc.replace("%ENODE%", validator.enode);

        fs.writeFileSync('./k8s/04-'+validator.NodeIndex.toString().padStart(2,"0")+'-quorum-keyconfigs.yaml',svc);
    }
}

function generateDeployments(validators) {
    const fs =  require('fs');
    let cfg = fs.readFileSync('./k8s/templates/quorum-node-quorum-deployment.yaml.template').toString('utf8');
    let headf = fs.readFileSync('./k8s/templates/head-quorum-node-quorum-deployment.yaml.template').toString('utf8');
    for (const validatorKey of validators.keys()) {
        let df = ""
        const validator = validators.get(validatorKey);
        df = validator.isHead ? headf: cfg;

        let svc = replaceAll(df,"%NODE_NO%", validator.NodeNo);
        svc = svc.replace("%THIS_ENODE%", validator.enode);

        fs.writeFileSync('./k8s/deployments/05-'+validator.NodeIndex.toString().padStart(2,"0")+'-quorum-node-deployment.yaml',svc);
    }
}

function generatePvc(validators) {
    const fs =  require('fs');
    let cfg = fs.readFileSync('./k8s/templates/quorum-persistent-volumes.yaml.template').toString('utf8');
    for (const validatorKey of validators.keys()) {

        const validator = validators.get(validatorKey);
        let svc = replaceAll(cfg,"%NODE_NO%", validator.NodeNo);


        fs.writeFileSync('./k8s/00-'+validator.NodeIndex.toString().padStart(2,"0")+'-quorum-persistent-volumes.yaml',svc);
    }
}

function fixHeadNodeAccount(validators) {
    const fs =  require('fs');
    let cfg = fs.readFileSync('./k8s/05-quorum-keyconfig-account.yaml').toString('utf8');
    for (const validatorKey of validators.keys()) {

        const validator = validators.get(validatorKey);
        if (validator.isHead)
        {
            let svc = replaceAll(cfg,"%NODE_NO%", validator.NodeNo);
            fs.writeFileSync('./k8s/05-quorum-keyconfig-account.yaml',svc);
            return;
        }



    }
}

function updateFileWithSubdomain(filename, subdomain){
    const fs =  require('fs');
    let cfg = fs.readFileSync(filename).toString('utf8');
    let svc = replaceAll(cfg,"%SUBDOMAIN%", subdomain);
    fs.writeFileSync(filename,svc);
}
function updateConfigMapsAndDeployments(subdomain) {
    updateFileWithSubdomain('./k8s/01-quorum-genesis.yaml', subdomain);
    updateFileWithSubdomain('./k8s/templates/02-quorum-shared-config.yaml.template', subdomain);
    updateFileWithSubdomain('./k8s/templates/head-quorum-node-quorum-deployment.yaml.template', subdomain);
    updateFileWithSubdomain('./k8s/templates/quorum-node-quorum-deployment.yaml.template', subdomain);
}

function generateValidators(no, subdomain){
    //console.log('go', no, subdomain);
    const validators = new Map();
    const genNodeNo = genNode_No(subdomain);
    //here we multiply the deployment files, pv,pvc and produce the final deployment files
    //genesis will be updated with extra data in the final step before deployment
    for (let i = 0; i < no; i++) {

        const validator = generateValidator();
        validator.NodeNo = genNodeNo.getForNo(i);
        validator.NodeIndex = i;
        validator.isHead = i === 0;

        console.log(validator)
        validators.set(i,validator);
    }

    updateConfigMapsAndDeployments(subdomain);
    generatePvc(validators);
    generateSharedConfig(validators);
    generateServices(validators);
    generateKeyConfig(validators);
    generateDeployments(validators);
    fixHeadNodeAccount(validators);
}



module.exports = {
    generateValidators
}
