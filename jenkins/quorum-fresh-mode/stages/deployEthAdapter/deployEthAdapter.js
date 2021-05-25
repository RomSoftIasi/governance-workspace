function updateEthAdapterConfigMap(){
    const fs = require('fs');
    let ethAdapterYaml = fs.readFileSync('./k8s/ethAdapter/templates/ethadapter-configmap.yaml.template').toString();
    const scData = JSON.parse(fs.readFileSync('./k8s/ethAdapter/templates/ethAdapterJoiningJSON.json').toString());
    console.log(ethAdapterYaml);
    ethAdapterYaml = ethAdapterYaml.replace('%SMARTCONTRACTADDRESS%',scData.contractAddress);
    ethAdapterYaml = ethAdapterYaml.replace('%SMARTCONTRACTABI%',JSON.stringify(scData.abi));

    fs.writeFileSync('./k8s/ethAdapter/ethadapter-configmap.yaml',ethAdapterYaml);
    console.log('Eth Adapter config map file is updated.')
}


module.exports = {
    updateEthAdapterConfigMap
}
