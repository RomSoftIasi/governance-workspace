
echo 'Remove Jenkins Installation'

kubectl delete -f ./jenkins/jenkins.service.yaml
kubectl delete -f ./jenkins/jenkins.deployment.yaml
kubectl delete -f ./jenkins/jenkins.pvc.yaml
kubectl delete -f ./jenkins/jenkins.pv.yaml

echo 'Remove defined RBAC''s'
kubectl delete -f ./rbac

echo 'Remove namespaces'

kubectl create namespace jenkins
kubectl create namespace test
kubectl create namespace dev
kubectl create namespace epi
kubectl create namespace gov


kubectl get pods -n jenkins
