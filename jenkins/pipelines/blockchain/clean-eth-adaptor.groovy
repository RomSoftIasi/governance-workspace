
def label = "worker-${UUID.randomUUID().toString()}"

podTemplate(label: label, serviceAccount: 'jdefaultmns',namespace: 'jenkins',containers: [
  containerTemplate(name: 'kubectl', image: 'public.ecr.aws/n4q1q0z2/pharmaledger-kubectl-jenkins-agent:1.0', command: 'cat', ttyEnabled: true)
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
