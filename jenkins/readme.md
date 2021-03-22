# Quick install

Deploy the default namespaces, RBAC's and Jenkins server
```shell
git clone https://github.com/PharmaLedger-IMI/governance-workspace.git
cd jenkins
./scripts/install.sh
```

Continue with Jenkins configuration, plugins, secrets and pipelines.


#Cluster infrastructure

The pipelines and deployments will be made in specific namespaces and require specific RBAC definitions.

test - for testing <br/>
dev - for development <br/>
jenkins - for Jenkins operations <br/>
epi - for ePI workspace <br/>
gov - for Governance <br/>

Each namespace supported by Jenkins pipelines and by Jenkins itself must be created beforehand using kubectl :

```shell
kubectl create namespace jenkins
kubectl create namespace test
kubectl create namespace dev
kubectl create namespace epi
kubectl create namespace gov
```

### RBAC
After namespace's are created, the RBAC's must be defined :
```shell
kubectl apply -f ./rbac
```
#Jenkins deployment

### Create volume 
```shell
kubectl apply -f ./jenkins/jenkins.pv.yaml
```
### Create volume claim
```shell
kubectl apply -f ./jenkins/jenkins.pvc.yaml
```
### Jenkins server deployment
```shell
kubectl apply -f ./jenkins/jenkins.development.yaml
```
### Jenkins service
```shell
kubectl apply -f ./jenkins/jenkins.service.yaml
```
### Jenkins configuration

Connect to Jenkins pod and obtain admin password

```shell
kubectl get pods -n jenkins
kubectl exec <jenkins-pod-name> -n jenkins -it -- sh
cat /$JENKINS_HOME/secrets/initialAdminPassword
```
If the Jenkins server was installed to be accessible only from inside the cluster, port-forward to localhost to configure the Jenkins server

```shell
// port forward to localhost:8090
kubectl port-forward <jenkins-pod-name> -n jenkins 8090:8080
```
Log into Jenkins and install recommended plugins. After installation and creations of the users is complete, install the plugins :

Kubernetes - the plugin integrates Jenkins with Kubernetes
Configure the Kubernetes plugin : Manage Jenkins -> Manage Nodes and Clouds -> Configure Clouds

### Default values for Jenkins Kubernetes plugin to operate in current cluster
```
Kubernetes URL : https://kubernetes.default:443
Kubernetes namespace : jenkins
Jenkins URL : http://jenkins
Jenkins tunnel : jenkins:50000 
```

After configuration, before saving, hit 'Test Connection' button to check the connection to the cluster.

## Jenkins credentials used in pipelines

####Secrets :
```
DOCKER_REGISTRY : https://index.docker.io/v1/
DOCKER_USERNAME : username to log in registry
DOCKER_PASSWORD : password
DOCKER_REPO : repository where to push images
```

###Backup
Jenkins doesn't provide an automated process for the backup operation
Backup the entire $JENKINS_HOME at file system level. Manually clean up the jobs/*/builds.

###TODO
