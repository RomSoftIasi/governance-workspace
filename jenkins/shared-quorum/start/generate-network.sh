cd template
node ./stages/AdmAcc/stage.js
node ./stages/Validators/stage.js --noOfNodes="$1" --joinMode=0

cp ./k8s/templates/00-00-00-quorum-persistent-volumes.yaml.template ./k8s/00-00-00-quorum-persistent-volumes.yaml
cp -f ./k8s/deployments/*.* ../start/k8s/deployments/
cp -f ./k8s/*.* ../start/k8s/
cp ./stages/Validators/validators.txt ../start/my-validators.txt
cp ./stages/Validators/enodes.txt ../start/my-enodes.txt
cp ./stages/AdmAcc/admAcc.json ../start/admAcc.json
cp -f ./keystore/UTC*.* ../start

