. ./scripts/.env

echo 'Prepare jenkins deployment'
echo ''
JENKINS_PREDEFINED_DATA_IMAGE_LOCATION

sed "s/%JENKINS_PREDEFINED_DATA_IMAGE_LOCATION%/$JENKINS_PREDEFINED_DATA_IMAGE_LOCATION/g" jenkins/docker/k8s/templates/jenkins.deployment.yaml.template  > jenkins/docker/k8s/jenkins.deployment.yaml

echo 'Create namespaces'

kubectl create namespace jenkins


echo 'Define RBAC''s'
kubectl apply -f ./jenkins/rbac

echo 'Deploy Jenkins'

kubectl apply -f ./jenkins/docker/k8s/jenkins.pv.yaml
kubectl apply -f ./jenkins/docker/k8s/jenkins.pvc.yaml
kubectl apply -f ./jenkins/docker/k8s/jenkins.deployment.yaml
kubectl apply -f ./jenkins/docker/k8s/jenkins.service.yaml
kubectl apply -f ./jenkins/docker/k8s/ref-jenkins-service.yaml

kubectl get pods -n jenkins


