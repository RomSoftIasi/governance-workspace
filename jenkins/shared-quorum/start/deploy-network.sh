echo ''
echo 'Blockchain network deployment'
echo ''
kubectl apply -f ./start/k8s
kubectl apply -f ./start/k8s/deployments

echo ''
echo 'Blockchain explorer deployment'
echo ''
kubectl apply -f ./blockchain-explorer

sleep 30s
kubectl get svc | awk '/quorum-node-/{print $1 " - " $2 " - " $3 " - " $4 " - " $5}' > ./start/my-node-service.txt
