
echo ''
echo 'Update permission configuration file'
echo ''

cd template

kubectl get pods --no-headers=true | awk '/quorum-node-/{print $1}' > ./stages/GenIBFTPropose/nodes.txt

node ./stages/GenIBFTPropose/stage.js
node ./stages/permissionConfig/stage.js

mv -f ./stages/GenIBFTPropose/execute-join.sh ../start/execute-join.sh
mv -f ./k8s/join/quorum-permissioned-config.yaml ../start/k8s/join/quorum-permissioned-config.yaml

kubectl apply -f ../start/k8s/join/quorum-permissioned-config.yaml

echo ''
echo 'Execute validation proposals on Blockchain nodes for other partners'
echo ''
../start/execute-join.sh

echo ''
echo 'Cleanup temporary files'
echo ''
rm -f ./stages/GenIBFTPropose/nodes.txt

