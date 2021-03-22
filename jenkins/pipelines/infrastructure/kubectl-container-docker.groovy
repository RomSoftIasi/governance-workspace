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
                        sh 'git clone http://github.com/PharmaLedger-IMI/governance-workspace.git'
                    }
                }

                stage ('Build docker image'){
                container('docker'){
                    stage ('Docker Login'){
                        withCredentials([string(credentialsId: 'DOCKER_PASSWORD', variable: 'DOCKER_PASSWORD'), string(credentialsId: 'DOCKER_USERNAME', variable: 'DOCKER_USERNAME'), string(credentialsId: 'DOCKER_REGISTRY', variable: 'DOCKER_REGISTRY'), string(credentialsId: 'DOCKER_REPO', variable: 'DOCKER_REPO')]) {
                            sh 'docker login -p $DOCKER_PASSWORD -u $DOCKER_USERNAME $DOCKER_REGISTRY'
                            stage ('Build and push docker image'){
                                  sh 'cd governance-workspace/jenkins/docker/kubectl && docker build --network host -t $DOCKER_REPO/pharma-kubectl .'
                                  sh 'docker push $DOCKER_REPO/pharma-kubectl'
                            }

                        }
                    }
                }
                }

              }
          }
    }
