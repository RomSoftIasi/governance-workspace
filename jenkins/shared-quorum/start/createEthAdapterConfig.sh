echo 'Creating kubernetes secrets eth-adapter-config ...'

kubectl create secret generic eth-adapter-config \
    --save-config --dry-run=client \
    --from-file=./orgAcc.json \
    -o yaml |
  kubectl apply -n "$1" -f -


echo 'Created kubernetes secrets eth-adapter-config.'
