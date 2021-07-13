. ./scripts/.env

echo "Build latest version for governance"
./scripts/build-gov.sh

echo "Generate deployment files"

sed "s/%gov-metadata-name%/$GOVCONTAINERNAME/g" docker/k8s/templates/gov-deployment.yaml.template \
| sed "s/%gov-app-label%/$GOVAPPNAME/g" \
| sed "s/%DOCKERIMAGEVERSION%/$DOCKERIMAGEVERSION/g" > docker/k8s/gov-deployment.yaml
sed "s/%gov-metadata-name%/$GOVCONTAINERNAME/g" docker/k8s/templates/gov-service.yaml.template | sed "s/%gov-app-label%/$GOVAPPNAME/g" > docker/k8s/gov-service.yaml

echo "Deploy Governance on kubernetes cluster"
kubectl apply -f ./docker/k8s
sleep 3m
kubectl get pods

echo "Clean up deployment files"
rm docker/k8s/gov-deployment.yaml
rm docker/k8s/gov-service.yaml

