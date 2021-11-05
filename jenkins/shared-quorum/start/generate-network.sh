cd template
node ./stages/AdmAcc/stage.js
node ./stages/Validators/stage.js --noOfNodes=4 --joinMode=0

cp ./k8s/templates/00-00-00-quorum-persistent-volumes.yaml.template ./k8s/00-00-00-quorum-persistent-volumes.yaml
find ./k8s/deployments/ -type f -iname "*.yaml" -print0 | xargs -0 mv -t ../start/k8s/deployments/
find ./k8s/ -type f -iname "*.yaml" -print0 | xargs -0 mv -t ../start/k8s/
mv -f ./stages/Validators/validators.txt ../start/my-validators.txt
mv -f ./stages/Validators/enodes.txt ../start/my-enodes.txt
mv -f ./stages/AdmAcc/admAcc.json ../start/admAcc.json
cp -f ./keystore/UTC*.* ../start
rm -f ./keystore/UTC*.*
