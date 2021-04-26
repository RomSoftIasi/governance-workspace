// deploy blockchain2 demo on namespace dev
// create namespace dev
// run jdev-multins.rbac.yaml
// have kubernetes plugin installed and configured
//there is no need to configure pod at jenkins level, as we define our pod template on pipeline level using custom defined serviceAccount


def label = "worker-${UUID.randomUUID().toString()}"

podTemplate(label: label, serviceAccount: 'jdevmns',namespace: 'jenkins',containers: [
  containerTemplate(name: 'kubectl', image: 'mabdockerid/pharma-kubectl:latest', command: 'cat', ttyEnabled: true)
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
         stage('Remove blockchain nodes'){
             sh 'cd governance-workspace/jenkins/quorum-fresh-mode && kubectl delete -f ./k8s/deployments -n dev'
         }
         stage('Remove blockchain configuration'){
             sh 'cd governance-workspace/jenkins/quorum-fresh-mode && kubectl remove -f ./k8s -n dev'
         }
         stage('Remove blockchain node connection'){
             sh 'cd governance-workspace/jenkins/quorum-fresh-mode && kubectl remove -f ./jenkins -n jenkins'
         }
         stage('Get deployment status'){
             sh "kubectl get pods -n dev"
         }
        }
    }
  }
}
