kubectl apply -f ./jenkins/jenkins.pv.yaml
kubectl apply -f ./jenkins/jenkins.pvc.yaml
kubectl apply -f ./jenkins/jenkins.deployment.yaml
kubectl apply -f ./jenkins/jenkins.service.yaml

kubectl get pods -n jenkins
