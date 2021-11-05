echo ''
echo 'Blockchain network deployment'
echo ''
kubectl apply -f ./start/k8s -n "$1"
kubectl apply -f ./start/k8s/deployments -n "$1"

sleep 30s
kubectl get svc -n "$1" | awk '/quorum-node-/{print $1 " - " $2 " - " $3 " - " $4 " - " $5}' > ./start/my-node-service.txt
