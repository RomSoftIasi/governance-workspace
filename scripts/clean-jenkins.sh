
echo 'Remove Jenkins Installation'

kubectl delete -f ./jenkins/docker/k8s/jenkins.service.yaml
kubectl delete -f ./jenkins/docker/k8s/ref-jenkins-service.yaml
kubectl delete -f ./jenkins/docker/k8s/jenkins.deployment.yaml
kubectl delete -f ./jenkins/docker/k8s/jenkins.pvc.yaml
kubectl delete -f ./jenkins/docker/k8s/jenkins.pv.yaml

echo 'Remove defined RBAC''s'
kubectl delete -f ./jenkins/rbac

echo 'Remove namespaces'

kubectl delete namespace jenkins

kubectl get pods -n jenkins
