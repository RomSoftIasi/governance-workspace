//Jenkins env variable
//$POD_DOCKER_REPOSITORY
//$KUBECTL_JENKINS_AGENT
//$KUBECTL_JENKINS_AGENT_VERSION


def kubectl_image_source = "$POD_DOCKER_REPOSITORY"+':'+"$KUBECTL_JENKINS_AGENT"+'_'+"$KUBECTL_JENKINS_AGENT_VERSION"
def label = "worker-${UUID.randomUUID().toString()}"

podTemplate(label: label, serviceAccount: 'jdefaultmns',namespace: 'jenkins',containers: [
  containerTemplate(name: 'kubectl', image: kubectl_image_source, command: 'cat', ttyEnabled: true)
],
volumes: [
  hostPathVolume(mountPath: '/var/run/docker.sock', hostPath: '/var/run/docker.sock')
]){
  node(label) {
    stage('Clean blockchain network') {
        stage('Get quorum deployment'){
            sh 'git clone https://github.com/PharmaLedger-IMI/governance-workspace.git'
        }

        container('kubectl') {
        try {
            stage ('Remove explorer'){
                sh 'cd governance-workspace/jenkins/modules/explorer && kubectl delete -f . -n default'
            }
        } catch (err){
                unstable (message: "${STAGE_NAME} is unstable.")
        }

        try{
             stage('Remove blockchain nodes'){
                 sh 'cd governance-workspace/jenkins/quorum-fresh-mode && kubectl delete -f ./k8s/deployments -n default'
            }
         } catch (err){
            unstable (message: "${STAGE_NAME} is unstable.")
         }
         try{
             stage('Remove blockchain configuration'){
                 sh 'cd governance-workspace/jenkins/quorum-fresh-mode && kubectl delete -f ./k8s -n default'
                 sh 'kubectl delete configmaps genesis-config -n default'
                 sh 'kubectl delete configmaps quorum-node1-account-key-config -n default'
             }
         } catch (err){
            unstable (message: "${STAGE_NAME} is unstable.")
         }
         try{
             stage('Remove blockchain node connection'){
                 sh 'cd governance-workspace/jenkins/quorum-fresh-mode && kubectl delete -f ./jenkins -n jenkins'
             }
         } catch (err){
            unstable (message: "${STAGE_NAME} is unstable.")
         }
         try{
             stage('Remove kubernetes secrets'){
                sh ' kubectl delete secret eth-adapter-config -n default'
             }
         } catch (err){
            unstable (message: "${STAGE_NAME} is unstable.")
         }
         stage('Get deployment status'){
             sh "kubectl get pods -n default"
         }
        }
    }
  }
}
