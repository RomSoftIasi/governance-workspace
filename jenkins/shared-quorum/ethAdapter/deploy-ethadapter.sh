cd template

echo 'Creating Organisation account'

node ./stages/OrgAcc/stage.js

mv ./stages/OrgAcc/orgAcc.json ../ethAdapter/orgAcc.json
echo 'Creating kubernetes secrets eth-adapter-config ...'

kubectl create secret generic eth-adapter-config \
    --save-config --dry-run=client \
    --from-file=../ethAdapter/orgAcc.json \
    -o yaml |
  kubectl apply -n default -f -


echo 'Created kubernetes secrets eth-adapter-config.'

node ./stages/deployEthAdapter/stage.js

echo 'Deploy EthAdapter'
kubectl apply -f ../ethAdapter/k8s

echo 'Wait around 2 minutes to let the load balancer be operational ...'
sleep 120s
echo 'Check ethAdapter <-> Blockchain node connectivity'
kubectl get svc | awk '/ethadapter-service/{print "http://"$4":3000/check" }' | xargs curl -I GET 2>/dev/null | head -n 1
