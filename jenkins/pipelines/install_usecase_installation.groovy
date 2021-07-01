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

                stage ('Repository cloning'){
                    container('node'){
                        sh 'git clone $usecaseRepository'
                    }
                }
                stage ('Build and publish docker Image'){
                    container ('docker'){
                        sh 'aws --version'
                        sh 'aws configure set aws_access_key_id "$aws_key_id"'
                        sh 'aws configure set aws_secret_access_key "$aws_access_key"'
                        sh 'aws configure set default.region "$DEFAULT_REGION"'
                        sh 'aws configure set default.output \'NONE\''
                        sh 'aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/n4q1q0z2'
                        sh 'cd epi-workspace/docker && docker build --no-cache --network host -t public.ecr.aws/n4q1q0z2/pharmaledger-epi:1.0 .'
                        sh 'docker push public.ecr.aws/n4q1q0z2/pharmaledger-epi:1.0'
                    }
                }


               }

        }
    }
