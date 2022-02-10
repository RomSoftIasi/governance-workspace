
            podTemplate(
          containers: [
              containerTemplate(name: 'node', image: 'node:latest', ttyEnabled: true, command: 'cat')
              ]
          ){
              node(POD_LABEL){

                  stage ('Git clone'){
                      sh 'git clone https://github.com/RomSoftIasi/governance-workspace.git'
                      sh 'cd governance-workspace/jenkins/docker/predefined && sed "s,%BACKUP_BRANCH_NAME%,${BRANCH},g" Dockerfile.template | sed "s,%JENKINS_BACKUP_REPOSITORY%,${JENKINS_BACKUP_REPOSITORY},g" > Dockerfile'
                      sh 'cat governance-workspace/jenkins/docker/predefined/Dockerfile'
                  }


                  stage ('Build and publish docker Image'){

                        def dockerfile = readFile('governance-workspace/jenkins/docker/predefined/Dockerfile')
                        build job: 'build-and-push-docker-image',
                        parameters: [
                                string(name: 'DATA_IMAGE_NAME', value:"$JENKINS_PREDEFINED_DATA_IMAGE_NAME"),
                                string(name: 'DATA_IMAGE_VERSION', value:"$JENKINS_PREDEFINED_DATA_IMAGE_VERSION"),
                                base64File(name: 'dockerfile', base64: Base64.encoder.encodeToString(dockerfile.bytes))
                                ]

                        }

              }

          }





