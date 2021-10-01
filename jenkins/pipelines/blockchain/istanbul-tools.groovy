def kubectl_image_source = "$POD_DOCKER_REPOSITORY"+':'+"$KUBECTL_JENKINS_AGENT"+'_'+"$KUBECTL_JENKINS_AGENT_VERSION"

  podTemplate(
      containers: [
          containerTemplate(name: 'node', image: 'node:latest', ttyEnabled: true, command: 'cat')
          ]
      ){

        podTemplate(serviceAccount: 'jdefaultmns',namespace: 'jenkins',containers: [
              containerTemplate(name: 'go', image:'golang:latest', command: 'cat', ttyEnabled: true)
            ]){

                  node(POD_LABEL){
//input config.toml file
//output extradata
                    stage ('Repository cloning'){
                        container('node'){
                            sh 'git clone https://github.com/ConsenSys/istanbul-tools.git'
                        }
                        container('go'){
                            sh 'cd istanbul-tools && make istanbul && ./build/bin/istanbul --help'
                        }
                    }




                  }

            }
    }
