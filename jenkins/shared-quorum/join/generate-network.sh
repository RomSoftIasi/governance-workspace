
echo ''
echo 'Generating Blockchain deployment files'
echo ''
cd template

node ./stages/Validators/stage.js --noOfNodes=1 --joinMode=1

cp ./k8s/templates/00-00-00-quorum-persistent-volumes.yaml.template ./k8s/00-00-00-quorum-persistent-volumes.yaml
find ./k8s/deployments/ -type f -iname "*.yaml" -print0 | xargs -0 mv -t ../join/k8s/deployments/
find ./k8s/ -type f -iname "*.yaml" -print0 | xargs -0 mv -t ../join/k8s/
mv -f ./stages/Validators/validators.txt ../join/my-validators.txt
mv -f ./stages/Validators/enodes.txt ../join/my-enodes.txt

cp ../joindata/01-quorum-genesis.yaml ../join/k8s/01-quorum-genesis.yaml
