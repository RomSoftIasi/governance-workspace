. ./jenkins/modules/scripts/.env

echo "Generate deployment files"

sed "s/%gov-metadata-name%/$GOVCONTAINERNAME/g" docker/dev/k8s/templates/gov-deployment.yaml.template \
| sed "s/%gov-app-label%/$GOVAPPNAME/g" \
| sed "s|%POD_DOCKER_REPOSITORY%|$POD_DOCKER_REPOSITORY|g" \
| sed "s/%GOV_DOCKER_IMAGE%/$GOV_DOCKER_IMAGE/g" \
| sed "s/%GOV_DOCKER_IMAGE_VERSION%/$GOV_DOCKER_IMAGE_VERSION/g"  > docker/dev/k8s/gov-deployment.yaml
sed "s/%gov-metadata-name%/$GOVCONTAINERNAME/g" docker/dev/k8s/templates/gov-service.yaml.template | sed "s/%gov-app-label%/$GOVAPPNAME/g" > docker/dev/k8s/gov-service.yaml

echo "Deploy Governance on kubernetes cluster"
kubectl apply -f ./docker/dev/k8s
echo 'Sleeping for about 2m in order to ensure governance is ready'
sleep 2m
kubectl get pods

echo "Clean up deployment files"
rm docker/dev/k8s/gov-deployment.yaml
rm docker/dev/k8s/gov-service.yaml

