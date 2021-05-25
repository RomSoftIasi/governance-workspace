
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
            sh 'git clone https://github.com/groundnuty/k8s-wait-for.git'
        }

        container('node'){
            stage('Configure blockchain'){
                sh 'cd governance-workspace/jenkins/quorum-fresh-mode && npm install'
                sh 'cd governance-workspace/jenkins/quorum-fresh-mode && node ./stages/AdmAcc/stage.js'
            }
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
                sh 'cd k8s-wait-for && chmod 755 ./wait_for.sh && ./wait_for.sh pod -lname=quorum-node1-deployment -n dev'
                sh 'cd k8s-wait-for && ./wait_for.sh pod -lname=quorum-node2-deployment -n dev'
                sh 'cd k8s-wait-for && ./wait_for.sh pod -lname=quorum-node3-deployment -n dev'
                sh 'cd k8s-wait-for && ./wait_for.sh pod -lname=quorum-node4-deployment -n dev'
                sh 'sleep 30s'
                sh "kubectl get pods -n dev"
            }
        }

        container('node'){
            stage('Create OrgAcc'){
                sh 'cd governance-workspace/jenkins/quorum-fresh-mode && node ./stages/OrgAcc/stage.js'
            }

            stage('Deploy smart contract AnchoringSC'){
                sh 'git clone https://github.com/PharmaLedger-IMI/ethadapter.git'
                sh 'cp ethadapter/SmartContracts/contracts/anchoringSC.sol governance-workspace/jenkins/quorum-fresh-mode/anchoring-sc/anchoringSC.sol'
                sh 'cd governance-workspace/jenkins/quorum-fresh-mode && node ./stages/deployAnchoringSC/stage.js'
            }

        }

        container('kubectl'){
            stage('create EthAdapterConfig kubernetes secrets'){
                sh 'cd governance-workspace/jenkins/quorum-fresh-mode && chmod 755 ./scripts/createEthAdapterConfig.sh && ./scripts/createEthAdapterConfig.sh'
            }
        }

        stage ('Prepare artefacts'){
            archiveArtifacts artifacts: 'governance-workspace/jenkins/quorum-fresh-mode/stages/deployAnchoringSC/anchoringSCInfo.json', fingerprint: true
        }
    }
  }
}
}
