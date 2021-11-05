echo ''
echo 'Blockchain network infrastructure deployment'
echo ''
kubectl apply -f ./join/k8s

sleep 30s
kubectl get svc | awk '/quorum-node-/{print $1 " - " $2 " - " $3 " - " $4 " - " $5}' > ./join/my-node-service.txt
