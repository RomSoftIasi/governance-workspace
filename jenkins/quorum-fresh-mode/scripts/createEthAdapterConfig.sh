

echo 'Creating kubernetes secrets EthAdapterConfig ...'

kubectl create secret generic EthAdapterConfig \
    --save-config --dry-run=client \
    --from-file=./stages/OrgAcc/orgAcc.json \
    -o yaml |
  kubectl apply -f -


echo 'Created kubernetes secrets EthAdapterConfig.'
