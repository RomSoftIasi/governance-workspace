
cd template

echo ''
echo 'Generate permission configuration file'
echo ''

node ./stages/permissionConfig/stage.js
cp -f ./k8s/join/quorum-permissioned-config.yaml ../join/k8s/join/quorum-permissioned-config.yaml

kubectl apply -f ../join/k8s/join/quorum-permissioned-config.yaml

echo ''
echo 'Blockchain network node deployment'
echo ''
kubectl apply -f ../join/k8s/deployments

sleep 120s

echo ''
echo 'Execute validation proposals on Blockchain node for other partners'
echo ''

kubectl get pods --no-headers=true | awk '/quorum-node-/{print $1}' > ./stages/GenIBFTPropose/nodes.txt

node ./stages/GenIBFTPropose/stage.js
cp -f ./stages/GenIBFTPropose/execute-join.sh ../join/execute-join.sh



../join/execute-join.sh

echo ''
echo 'Blockchain explorer deployment'
echo ''
kubectl apply -f ../blockchain-explorer

echo ''
echo 'Cleanup temporary files'
echo ''

rm -f ./stages/GenIBFTPropose/execute-join.sh
rm -f ./stages/GenIBFTPropose/nodes.txt
rm -f ./k8s/join/quorum-permissioned-config.yaml
