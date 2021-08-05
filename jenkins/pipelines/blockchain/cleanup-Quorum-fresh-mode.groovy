
def label = "worker-${UUID.randomUUID().toString()}"

podTemplate(label: label, serviceAccount: 'jdefaultmns',namespace: 'jenkins',containers: [
  containerTemplate(name: 'kubectl', image: 'public.ecr.aws/n4q1q0z2/pharmaledger-kubectl-jenkins-agent:1.0', command: 'cat', ttyEnabled: true)
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
