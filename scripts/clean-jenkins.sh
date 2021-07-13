
echo 'Remove Jenkins Installation'

kubectl delete -f ./jenkins/docker/k8s

echo 'Remove defined RBAC''s'
kubectl delete -f ./jenkins/rbac

echo 'Remove namespaces'

kubectl delete namespace jenkins

kubectl get pods -n jenkins
