
echo 'Remove Jenkins Installation'

kubectl delete -f ./docker/k8s/jenkins.service.yaml
kubectl delete -f ./docker/k8s/jenkins.deployment.yaml
kubectl delete -f ./docker/k8s/jenkins.pvc.yaml
kubectl delete -f ./docker/k8s/jenkins.pv.yaml

echo 'Remove defined RBAC''s'
kubectl delete -f ./rbac

echo 'Remove namespaces'

kubectl delete namespace jenkins
kubectl delete namespace test
kubectl delete namespace dev
kubectl delete namespace epi
kubectl delete namespace gov


kubectl get pods -n jenkins
