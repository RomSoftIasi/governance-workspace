
function updateGenesisFile(){
    const fs = require('fs');
    let genesisFile = fs.readFileSync('./k8s/templates/01-quorum-genesis.yaml.template').toString();
    const admAccData = JSON.parse(fs.readFileSync('./stages/AdmAcc/admAcc.json').toString());

    const updateAcc = () => {
        genesisFile = genesisFile.replace('%AdmAcc', admAccData.account);
        if (genesisFile.indexOf('%AdmAcc') !== -1){
            updateAcc();
        }
    }
    updateAcc();
    fs.writeFileSync('./k8s/01-quorum-genesis.yaml',genesisFile);
    console.log('Genesis file updated.')
}


module.exports = {
    updateGenesisFile
}
