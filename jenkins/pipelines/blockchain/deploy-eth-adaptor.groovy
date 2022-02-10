//Jenkins env variable
//$POD_DOCKER_REPOSITORY
//$KUBECTL_JENKINS_AGENT
//$KUBECTL_JENKINS_AGENT_VERSION
//$ETH_ADAPTER_DOCKER_IMAGE
//$ETH_ADAPTER_DOCKER_IMAGE_VERSION



def kubectl_image_source = "$POD_DOCKER_REPOSITORY"+'/'+"$KUBECTL_JENKINS_AGENT"+':'+"$KUBECTL_JENKINS_AGENT_VERSION"

podTemplate(serviceAccount: 'jdefaultmns',namespace: 'jenkins',containers: [
  containerTemplate(name: 'kubectl', image: kubectl_image_source, command: 'cat', ttyEnabled: true)
],
volumes: [
  hostPathVolume(mountPath: '/var/run/docker.sock', hostPath: '/var/run/docker.sock')
]){
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
                    def dockerfile = readFile('ethadapter/EthAdapter/dockerfile-dev')
                    build job: 'build-and-push-docker-image',
                    parameters: [
                            string(name: 'DATA_IMAGE_NAME', value:"$ETH_ADAPTER_DOCKER_IMAGE"),
                            string(name: 'DATA_IMAGE_VERSION', value:"$ETH_ADAPTER_DOCKER_IMAGE_VERSION"),
                            base64File(name: 'dockerfile', base64: Base64.encoder.encodeToString(dockerfile.bytes))
                            ]
                }

                stage ('Prepare environment'){
                    container('node'){
                        sh 'git clone https://github.com/RomSoftIasi/governance-workspace.git'
                        sh 'cp -a ethadapter/EthAdapter/k8s/. governance-workspace/jenkins/quorum-fresh-mode/k8s/ethAdapter/'
                        unstash 'ethJoinFile'
                        sh 'cp ethJoinFile governance-workspace/jenkins/quorum-fresh-mode/k8s/ethAdapter/templates/ethAdapterJoiningJSON.json'
                    }
                }

                stage ('Prepare and deploy EthAdapter'){
                    container('node'){
                        sh 'cd governance-workspace/jenkins/quorum-fresh-mode && npm install'
                        sh 'cd governance-workspace/jenkins/quorum-fresh-mode && node ./stages/deployEthAdapter/stage.js'
                        sh 'cd governance-workspace/jenkins/quorum-fresh-mode/k8s/ethAdapter && sed "s|%POD_DOCKER_REPOSITORY%|$POD_DOCKER_REPOSITORY|g" EthAdapter.yaml | sed "s|%ETH_ADAPTER_DOCKER_IMAGE%|$ETH_ADAPTER_DOCKER_IMAGE|g"  | sed "s|%ETH_ADAPTER_DOCKER_IMAGE_VERSION%|$ETH_ADAPTER_DOCKER_IMAGE_VERSION|g" > tmp && mv tmp EthAdapter.yaml '
                        sh 'cat governance-workspace/jenkins/quorum-fresh-mode/k8s/ethAdapter/EthAdapter.yaml'
                    }
                    container('kubectl'){
                        sh 'cd governance-workspace/jenkins/quorum-fresh-mode && kubectl apply -n default -f ./k8s/ethAdapter && sleep 60'
                    }
                }

                stage ('Check connection status'){
                    container ('node'){
                        sh 'cd governance-workspace/jenkins/quorum-fresh-mode && node ./stages/checkEthAdapter/stage.js'
                    }
                }


              }
          }

}
