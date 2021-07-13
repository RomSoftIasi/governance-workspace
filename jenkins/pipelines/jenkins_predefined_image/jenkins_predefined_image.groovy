podTemplate(
    containers: [
        containerTemplate(name: 'docker', image: 'public.ecr.aws/n4q1q0z2/pharmaledger-docker-aws-jenkins-agent:1.0',alwaysPullImage:true , ttyEnabled: true, command: 'cat')
    ],
    volumes: [hostPathVolume(hostPath: '/var/run/docker.sock', mountPath: '/var/run/docker.sock')],
    envVars: [secretEnvVar(key: 'aws_key_id', secretName: 'aws-config', secretKey: 'aws_key_id'),
              secretEnvVar(key: 'aws_access_key', secretName: 'aws-config', secretKey: 'aws_access_key')
             ]
  ){
            podTemplate(
          containers: [
              containerTemplate(name: 'node', image: 'node:latest', ttyEnabled: true, command: 'cat')
              ]
          ){
              node(POD_LABEL){

                  stage ('Git clone'){
                      sh 'git clone https://github.com/PharmaLedger-IMI/governance-workspace.git'
                      sh 'cd governance-workspace/jenkins/docker/predefined && sed "s,%BACKUP_BRANCH_NAME%,${BRANCH},g" Dockerfile.template | sed "s,%JENKINS_BACKUP_REPOSITORY%,${JENKINS_BACKUP_REPOSITORY},g" > Dockerfile'
                      sh 'cat governance-workspace/jenkins/docker/predefined/Dockerfile'
                  }


                  stage ('Build and publish docker Image'){
                            container ('docker'){
                                sh 'aws --version'
                                sh 'aws configure set aws_access_key_id "$aws_key_id"'
                                sh 'aws configure set aws_secret_access_key "$aws_access_key"'
                                sh 'aws configure set default.region "eu-east-1"'
                                sh 'aws configure set default.output \'NONE\''
                                sh 'aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin $REGISTRY'
                                sh 'cd governance-workspace/jenkins/docker/predefined && docker build --no-cache --network host -t $REGISTRY/$JENKINS_PREDIFINED_DATA_IMAGE_NAME:$JENKINS_PREDEFINED_DATA_IMAGE_VERSION .'
                                sh 'docker push $REGISTRY/$JENKINS_PREDIFINED_DATA_IMAGE_NAME:$JENKINS_PREDEFINED_DATA_IMAGE_VERSION'
                            }
                        }

              }

          }




  }
