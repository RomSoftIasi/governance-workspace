//Jenkins env variable
//$POD_DOCKER_REPOSITORY
//$KUBECTL_JENKINS_AGENT_DOCKER_IMAGE_NAME
//$KUBECTL_JENKINS_AGENT_DOCKER_IMAGE_VERSION


//Pipeline parameters coded at Jenkins pipeline level
// dockerfile - base64 small file
// DATA_IMAGE_NAME - string
// DATA_IMAGE_VERSION - string

def docker_image_source = "$POD_DOCKER_REPOSITORY"+':'+"$KUBECTL_JENKINS_AGENT_DOCKER_IMAGE_NAME"+'_'+"$KUBECTL_JENKINS_AGENT_DOCKER_IMAGE_VERSION"

podTemplate(
    containers: [
        containerTemplate(name: 'docker', image: docker_image_source, alwaysPullImage:true , ttyEnabled: true, command: 'cat')
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

                  stage ('Build and publish docker Image'){
                            container ('docker'){
                                sh 'aws --version'
                                sh 'aws configure set aws_access_key_id "$aws_key_id"'
                                sh 'aws configure set aws_secret_access_key "$aws_access_key"'
                                sh 'aws configure set default.region "eu-east-1"'
                                sh 'aws configure set default.output \'NONE\''
                                sh 'aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin $POD_DOCKER_REPOSITORY'
                                    withFileParameter('dockerfile'){
                                        sh 'cat $dockerfile > Dockerfile'
                                        sh 'docker build --no-cache --network host -t $POD_DOCKER_REPOSITORY/$DATA_IMAGE_NAME:$DATA_IMAGE_VERSION .'
                                        sh 'docker push $POD_DOCKER_REPOSITORY/$DATA_IMAGE_NAME:$DATA_IMAGE_VERSION'

                                    }



                            }
                        }

              }

          }




  }
