
echo 'Create namespaces'

kubectl create namespace jenkins
kubectl create namespace test
kubectl create namespace dev
kubectl create namespace epi
kubectl create namespace gov

echo 'Define RBAC''s'
kubectl apply -f ./rbac

echo 'Deploy Jenkins'

kubectl apply -f ./jenkins/jenkins.pv.yaml
kubectl apply -f ./jenkins/jenkins.pvc.yaml
kubectl apply -f ./jenkins/jenkins.deployment.yaml
kubectl apply -f ./jenkins/jenkins.service.yaml

kubectl get pods -n jenkins


