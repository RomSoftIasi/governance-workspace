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
    stage('Deploy blockchain network') {
        stage('Get deployment'){
        git url: 'https://github.com/PharmaLedger-IMI/blockchain2-demo.git'
        }

        container('kubectl') {
            stage('Deploy blockchain configuration'){
                sh 'kubectl delete -f quorum_network/k8s -n dev'
            }
            stage('Deploy blockchain nodes'){
                sh 'kubectl delete -f quorum_network/k8s/deployments -n dev'
            }
            stage('Get deployment status'){
                sh "kubectl get pods -n dev"
            }
        }
    }
  }
}
