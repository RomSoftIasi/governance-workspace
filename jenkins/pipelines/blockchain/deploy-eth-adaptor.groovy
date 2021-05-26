podTemplate(serviceAccount: 'jdevmns',namespace: 'jenkins',containers: [
  containerTemplate(name: 'kubectl', image: 'mabdockerid/pharma-kubectl:latest', command: 'cat', ttyEnabled: true)
],
volumes: [
  hostPathVolume(mountPath: '/var/run/docker.sock', hostPath: '/var/run/docker.sock')
]){

podTemplate(
    containers: [
        containerTemplate(name: 'docker', image: 'docker:latest', ttyEnabled: true, command: 'cat')
    ],
    volumes: [hostPathVolume(hostPath: '/var/run/docker.sock', mountPath: '/var/run/docker.sock')]
  ){


      podTemplate(
          containers: [
              containerTemplate(name: 'node', image: 'node:latest', ttyEnabled: true, command: 'cat')
              ]
          ){

              node(POD_LABEL){

                stage ('Build'){
                    container('node'){
                        sh 'git clone https://github.com/PharmaLedger-IMI/ethadapter.git'
                        sh 'cd ethadapter && npm install --unsafe-perm'
                    }
                }

                stage ('Build docker image'){
                container('docker'){
                    stage ('Docker Login'){
                        withCredentials([string(credentialsId: 'DOCKER_PASSWORD', variable: 'DOCKER_PASSWORD'), string(credentialsId: 'DOCKER_USERNAME', variable: 'DOCKER_USERNAME'), string(credentialsId: 'DOCKER_REGISTRY', variable: 'DOCKER_REGISTRY'), string(credentialsId: 'DOCKER_REPO', variable: 'DOCKER_REPO')]) {
                            sh 'docker login -p $DOCKER_PASSWORD -u $DOCKER_USERNAME $DOCKER_REGISTRY'
                            stage ('Build and push docker image'){
                                  sh 'cd ethadapter/EthAdapter && docker build --no-cache --network host -t $DOCKER_REPO/pharma-ethadapter -f dockerfile-dev .'
                                  sh 'docker push $DOCKER_REPO/pharma-ethadapter'
                            }

                        }
                    }
                }
                }

                stage ('Prepare environment'){
                    container('node'){
                        sh 'git clone https://github.com/PharmaLedger-IMI/governance-workspace.git'
                        sh 'cp -a ethadapter/EthAdapter/k8s/. governance-workspace/jenkins/quorum-fresh-mode/k8s/ethAdapter/'
                        unstash 'ethJoinFile'
                        sh 'cp ethJoinFile governance-workspace/jenkins/quorum-fresh-mode/k8s/ethAdapter/templates/ethAdapterJoiningJSON.json'
                    }
                }

                stage ('Prepare and deploy EthAdapter'){
                    container('node'){
                        sh 'cd governance-workspace/jenkins/quorum-fresh-mode && npm install'
                        sh 'cd governance-workspace/jenkins/quorum-fresh-mode && node ./stages/deployEthAdapter/stage.js'
                    }
                    container('kubectl'){
                        sh 'cd governance-workspace/jenkins/quorum-fresh-mode && kubectl apply -n dev -f ./k8s/ethAdapter'
                    }
                }

                //todo : add ethAdapter check stage

                //end of pipeline
              }
          }
    }
}
