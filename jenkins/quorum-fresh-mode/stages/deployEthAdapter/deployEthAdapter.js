function updateEthAdapterConfigMap(){
    const fs = require('fs');
    let ethAdapterYaml = fs.readFileSync('./k8s/ethAdapter/templates/ethadapter-configmap.yaml.template').toString();
    const jsonBase64 = fs.readFileSync('./k8s/ethAdapter/templates/ethAdapterJoiningJSON.json',).toString();
    const ethAdapterJson = Buffer.from(jsonBase64,'base64').toString('utf8');
    console.log(ethAdapterJson);
    const scData = JSON.parse(ethAdapterJson);

    ethAdapterYaml = ethAdapterYaml.replace('%SMARTCONTRACTADDRESS%',scData.contractAddress);
    ethAdapterYaml = ethAdapterYaml.replace('%SMARTCONTRACTABI%',JSON.stringify(scData.abi));

    console.log(ethAdapterYaml);
    fs.writeFileSync('./k8s/ethAdapter/ethadapter-configmap.yaml',ethAdapterYaml);
    console.log('Eth Adapter config map file is updated.')
}


module.exports = {
    updateEthAdapterConfigMap
}
