// deploy blockchain2 demo on namespace dev
// create namespace dev
// run jdev-multins.rbac.yaml
// have kubernetes plugin installed and configured
//there is no need to configure pod at jenkins level, as we define our pod template on pipeline level using custom defined serviceAccount


podTemplate(serviceAccount: 'jdevmns',namespace: 'jenkins',containers: [
  containerTemplate(name: 'kubectl', image: 'mabdockerid/pharma-kubectl:latest', command: 'cat', ttyEnabled: true)
],
volumes: [
  hostPathVolume(mountPath: '/var/run/docker.sock', hostPath: '/var/run/docker.sock')
]){

    podTemplate(
          containers: [
              containerTemplate(name: 'node', image: 'node:latest', ttyEnabled: true, command: 'cat')
              ]
          ){

  node(POD_LABEL) {
    stage('Deploy blockchain network') {
        stage('Get governance repo'){
            sh 'git clone https://github.com/PharmaLedger-IMI/governance-workspace.git'
        }

        container('node'){
            sh 'cd governance-workspace/jenkins/quorum-fresh-mode && npm install'
            sh 'cd governance-workspace/jenkins/quorum-fresh-mode && node ./stages/AdmAcc/stage.js'
        }

        container('kubectl') {
            stage('Deploy blockchain configuration'){
                sh 'cd governance-workspace/jenkins/quorum-fresh-mode && kubectl apply -f ./k8s -n dev'
            }
            stage('Deploy blockchain nodes'){
                sh 'cd governance-workspace/jenkins/quorum-fresh-mode && kubectl apply -f ./k8s/deployments -n dev'
            }
            stage('Deploy blockchain node connection'){
                sh 'cd governance-workspace/jenkins/quorum-fresh-mode && kubectl apply -f ./jenkins -n jenkins'
            }
            stage('Get deployment status'){
                sh "sleep 120s && kubectl get pods -n dev"
            }
        }

        container('node'){
            sh 'cd governance-workspace/jenkins/quorum-fresh-mode && node ./stages/OrgAcc/stage.js'
            sh 'cd governance-workspace/jenkins/quorum-fresh-mode && node ./stages/deployAnchoringSC/stage.js'
        }
    }
  }
}
}

