/*
After the pipeline is created, add new parameter to the pipeline
name: ethJoinFile
type: Stashed File Parameter
Required plugin : File Parameter
Docs : https://plugins.jenkins.io/file-parameters/#documentation
Github: https://github.com/jenkinsci/file-parameters-plugin

NOTE: because the pipeline scripts are loaded from external location and parameters are post build, it is recommended to define the parameters using the GUI from Jenkins
*/


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

                stage ('read'){
                    //todo
                        unstash 'ethJoinFile'
                        sh 'cat ethJoinFile > ethjoin.json'
                        sh 'ls'
                        sh 'cat ethjoin.json'


                    }

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
                                  sh 'cd ethadapter/EthAdapter && docker build --network host -t $DOCKER_REPO/pharma-ethadapter -f dockerfile-dev .'
                                  sh 'docker push $DOCKER_REPO/pharma-ethadapter'
                            }

                        }
                    }
                }
                }

              }
          }
    }












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



    stage ('read'){

        //sh "echo $base64param"
        unstash 'ethJoinFile'
        sh 'cat ethJoinFile'
        sh 'cat ethJoinFile > ethjoin.json'
        sh 'ls'
        sh 'cat ethjoin.json'


    }




  }
}
}
