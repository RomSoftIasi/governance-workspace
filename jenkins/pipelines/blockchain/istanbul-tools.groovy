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

                    stage ('Repository cloning'){
                        container('node'){
                            sh 'git clone https://github.com/ConsenSys/istanbul-tools.git'

                        }
                        container('go'){
                            sh 'cd istanbul-tools && make istanbul && ./build/bin/istanbul --help'
                                                        sh '''cd istanbul-tools && cat <<EOT >> config.toml
    vanity = "0x00"
    validators = [
                  "0x45F2eeE5C951296d52029a1D5F0d289640a49388",
            "0xF313F735ce4A94707d7D969497529e6B59ea4E3e",
            "0xcffE9dFe7E45C48F224C3f66c3D0c59268F3c828",
            "0x6Df248feaeeA580313685e4EfE80d976eF967e8a",
    ]
EOT'''
                            sh 'cd istanbul-tools && cat config.toml && ./build/bin/istanbul extra encode --config config.toml'
                        }
                    }




                  }

            }
    }
