//Jenkins env variable
//$POD_DOCKER_REPOSITORY
//$KUBECTL_JENKINS_AGENT
//$KUBECTL_JENKINS_AGENT_VERSION

def label = "worker-${UUID.randomUUID().toString()}"

def kubectl_image_source = "$POD_DOCKER_REPOSITORY"+':'+"$KUBECTL_JENKINS_AGENT"+'_'+"$KUBECTL_JENKINS_AGENT_VERSION"

podTemplate(label: label, serviceAccount: 'jdefaultmns',namespace: 'jenkins',containers: [
  containerTemplate(name: 'kubectl', image: kubectl_image_source, command: 'cat', ttyEnabled: true)
],
volumes: [
  hostPathVolume(mountPath: '/var/run/docker.sock', hostPath: '/var/run/docker.sock')
]){
  node(label) {
    stage('Clean blockchain network') {


        container('kubectl') {
        try{
             stage('Remove pods'){
                 sh 'kubectl delete pod ethadapter -n default'
            }
         } catch (err){
            unstable (message: "${STAGE_NAME} is unstable.")
         }

         try{
             stage('Remove services'){
                 sh 'kubectl delete service ethadapter-service -n default'
            }
         } catch (err){
            unstable (message: "${STAGE_NAME} is unstable.")
         }

         try{
             stage('Remove configmaps'){
                 sh 'kubectl delete configmap ethadapter-configmap -n default'
            }
         } catch (err){
            unstable (message: "${STAGE_NAME} is unstable.")
         }

         stage('Get deployment status'){
             sh "kubectl get pods -n default"
             sh "kubectl get services -n default"
             sh "kubectl get configmap -n default"
         }
        }
    }
  }
}
