
echo 'Create namespaces'

kubectl create namespace jenkins
kubectl create namespace test
kubectl create namespace dev
kubectl create namespace epi
kubectl create namespace gov

echo 'Define RBAC''s'
kubectl apply -f ./rbac

echo 'Deploy Jenkins'
./jenkins/install.sh

