
function updateQuorumKeyData(){
    const fs = require('fs');
    let keyConfig = fs.readFileSync('./k8s/templates/05-quorum-keyconfig-account.yaml.template').toString();
    const admAccData = JSON.parse(fs.readFileSync('./stages/AdmAcc/admAcc.json').toString());
    const keyDataContent = fs.readFileSync('./'+admAccData.keystoreFile).toString();
    keyConfig = keyConfig.replace('%Account-Key-Config',keyDataContent);
    fs.writeFileSync('./k8s/05-quorum-keyconfig-account.yaml', keyConfig);

    console.log('Key config account was updated.')
}


module.exports = {
    updateQuorumKeyData
}
