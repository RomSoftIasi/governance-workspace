. ./scripts/.env

echo "Configure AWS"

aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID"
aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY"
aws configure set default.region "$DEFAULT_REGION"
aws configure set default.output 'NONE'

echo "Authenticate on AWS repository"
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/n4q1q0z2


echo 'Creating kubernetes secrets aws-config ...'

kubectl create secret generic aws-config \
    --save-config --dry-run=client \
    --from-literal=aws_key_id="$AWS_ACCESS_KEY_ID" \
    --from-literal=aws_access_key="$AWS_SECRET_ACCESS_KEY" \
    -o yaml |
  kubectl apply -n jenkins -f -

#uncomment to see the stored secret
#kubectl get secret -n jenkins aws-config -o go-template='{{range $k,$v := .data}}{{printf "%s: " $k}}{{if not $v}}{{$v}}{{else}}{{$v | base64decode}}{{end}}{{"\n"}}{{end}}'
echo 'Created kubernetes secrets aws-config.'
