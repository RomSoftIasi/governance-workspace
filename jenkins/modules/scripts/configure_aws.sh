. ./jenkins/modules/scripts/.env




function configure_aws(){
echo "Configure AWS"

aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID"
aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY"
aws configure set default.region "$DEFAULT_REGION"
aws configure set default.output 'text'

echo "Authenticate on AWS repository"
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin "$POD_DOCKER_REPOSITORY"
}

function create_jenkins_secret(){
echo 'Creating kubernetes secrets aws-config ...'

kubectl create namespace jenkins

kubectl create secret generic aws-config \
    --save-config --dry-run=client \
    --from-literal=aws_key_id="$AWS_ACCESS_KEY_ID" \
    --from-literal=aws_access_key="$AWS_SECRET_ACCESS_KEY" \
    -o yaml |
  kubectl apply -n jenkins -f -

#uncomment to see the stored secret
#kubectl get secret -n jenkins aws-config -o go-template='{{range $k,$v := .data}}{{printf "%s: " $k}}{{if not $v}}{{$v}}{{else}}{{$v | base64decode}}{{end}}{{"\n"}}{{end}}'
echo 'Created kubernetes secrets aws-config.'
}



for i in "$@"
do
  case $i in
    --docker)
      configure_aws
      ;;
    --jenkins-secret)
      create_jenkins_secret
      ;;
  esac
done

exit 0
