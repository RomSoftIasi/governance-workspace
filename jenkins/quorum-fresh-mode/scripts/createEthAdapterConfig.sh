

echo 'Creating kubernetes secrets eth-adapter-config ...'

kubectl create secret generic eth-adapter-config \
    --save-config --dry-run=client \
    --from-file=./stages/OrgAcc/orgAcc.json \
    -o yaml |
  kubectl apply -f -


echo 'Created kubernetes secrets eth-adapter-config.'
