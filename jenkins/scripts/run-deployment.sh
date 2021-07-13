
echo 'Create namespaces'

kubectl create namespace jenkins


echo 'Define RBAC''s'
kubectl apply -f ./rbac

echo 'Deploy Jenkins'

kubectl apply -f ./docker/k8s/jenkins.pv.yaml
kubectl apply -f ./docker/k8s/jenkins.pvc.yaml
kubectl apply -f ./docker/k8s/jenkins.deployment.yaml
kubectl apply -f ./docker/k8s/jenkins.service.yaml
kubectl apply -f ./docker/k8s/ref-jenkins-service.yaml

kubectl get pods -n jenkins


