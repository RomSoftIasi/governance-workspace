podTemplate(serviceAccount: 'jdefaultmns',namespace: 'jenkins',containers: [
  containerTemplate(name: 'kubectl', image: 'public.ecr.aws/n4q1q0z2/pharmaledger-kubectl-jenkins-agent:1.0', command: 'cat', ttyEnabled: true)
],
volumes: [
  hostPathVolume(mountPath: '/var/run/docker.sock', hostPath: '/var/run/docker.sock')
]){

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

                stage ('Build'){
                    container('node'){
                        sh 'git clone https://github.com/PharmaLedger-IMI/ethadapter.git'
                        sh 'cd ethadapter && npm install --unsafe-perm'
                    }
                }

                stage ('Build docker image'){
                container('docker'){
                    stage ('Docker Login'){

                        sh 'aws --version'
                        sh 'aws configure set aws_access_key_id "$aws_key_id"'
                        sh 'aws configure set aws_secret_access_key "$aws_access_key"'
                        sh 'aws configure set default.region eu-east-1'
                        sh 'aws configure set default.output \'NONE\''
                        sh 'aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/n4q1q0z2'

                    }


                    stage ('Build and push docker image'){
                        sh 'cd ethadapter/EthAdapter && docker build --no-cache --network host -t public.ecr.aws/n4q1q0z2/pharmaledger-ethadapter:1.0 -f dockerfile-dev .'
                        sh 'docker push public.ecr.aws/n4q1q0z2/pharmaledger-ethadapter:1.0'
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
}
