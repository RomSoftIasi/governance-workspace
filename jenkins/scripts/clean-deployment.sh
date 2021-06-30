
echo 'Remove Jenkins Installation'

kubectl delete -f ./jenkins/jenkins.service.yaml
kubectl delete -f ./jenkins/jenkins.deployment.yaml
kubectl delete -f ./jenkins/jenkins.pvc.yaml
kubectl delete -f ./jenkins/jenkins.pv.yaml

echo 'Remove defined RBAC''s'
kubectl delete -f ./rbac

echo 'Remove namespaces'

kubectl delete namespace jenkins
kubectl delete namespace test
kubectl delete namespace dev
kubectl delete namespace epi
kubectl delete namespace gov


kubectl get pods -n jenkins
