echo ''
echo 'Blockchain network deployment'
echo ''
kubectl apply -f ./start/k8s -n "${0}"
kubectl apply -f ./start/k8s/deployments -n "${0}"

echo ''
echo 'Blockchain explorer deployment'
echo ''
kubectl apply -f ./blockchain-explorer -n "${0}"

sleep 30s
kubectl get svc -n "${0}" | awk '/quorum-node-/{print $1 " - " $2 " - " $3 " - " $4 " - " $5}' > ./start/my-node-service.txt
